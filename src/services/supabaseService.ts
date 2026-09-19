import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { StorageService } from './storageService';
import { SUPABASE_SQL_SCHEMA, PRODUCT_TABLE_SQL } from './supabaseSchema';
import {
  Product,
  Category,
  Producer,
  LabResult,
  RecallAlert,
  Report,
  User,
  WebsiteSettings,
  CustomPage,
} from '../types';

let cachedClient: SupabaseClient | null = null;
let lastUsedUrl: string = '';
let lastUsedKey: string = '';

type TableMissingListener = (info: { table: string; message: string; timestamp: number }) => void;
const tableMissingListeners: Set<TableMissingListener> = new Set();

export interface SupabaseConfigInfo {
  url: string;
  anonKey: string;
  source: 'env' | 'storage' | 'not_configured';
  isConfigured: boolean;
  projectRef?: string;
}

export class SupabaseService {
  /**
   * Retrieve the active Supabase credentials from Environment (Vite/Vercel) or Local Storage
   */
  static getConfigInfo(): SupabaseConfigInfo {
    const envUrl = (
      (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SUPABASE_URL) || ''
    ).trim();
    const envKey = (
      (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SUPABASE_ANON_KEY) || ''
    ).trim();

    if (envUrl && envKey) {
      return {
        url: envUrl,
        anonKey: envKey,
        source: 'env',
        isConfigured: true,
        projectRef: this.extractProjectRef(envUrl),
      };
    }

    try {
      const appConfig = StorageService.getConfig();
      const storageUrl = (appConfig.supabase_url || '').trim();
      const storageKey = (appConfig.supabase_anon_key || '').trim();

      if (storageUrl && storageKey) {
        return {
          url: storageUrl,
          anonKey: storageKey,
          source: 'storage',
          isConfigured: true,
          projectRef: this.extractProjectRef(storageUrl),
        };
      }
    } catch (e) {
      // ignore
    }

    return {
      url: '',
      anonKey: '',
      source: 'not_configured',
      isConfigured: false,
      projectRef: '',
    };
  }

  /**
   * Get or initialize Supabase Client
   */
  static getClient(overrideUrl?: string, overrideKey?: string): SupabaseClient | null {
    const info = this.getConfigInfo();
    const targetUrl = overrideUrl || info.url;
    const targetKey = overrideKey || info.anonKey;

    if (!targetUrl || !targetKey) {
      return null;
    }

    if (cachedClient && lastUsedUrl === targetUrl && lastUsedKey === targetKey) {
      return cachedClient;
    }

    try {
      cachedClient = createClient(targetUrl, targetKey, {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
        },
      });
      lastUsedUrl = targetUrl;
      lastUsedKey = targetKey;
      return cachedClient;
    } catch (e) {
      console.error('Failed to initialize Supabase client:', e);
      return null;
    }
  }

  /**
   * Test Connection with Supabase
   */
  static async testConnection(
    overrideUrl?: string,
    overrideKey?: string
  ): Promise<{ success: boolean; message: string; details?: any }> {
    const client = this.getClient(overrideUrl, overrideKey);
    if (!client) {
      return {
        success: false,
        message: 'Project URL atau Anon Public Key Supabase belum diisi.',
      };
    }

    try {
      // Test querying the 'produk' table
      const { data, error, count } = await client
        .from('produk')
        .select('id', { count: 'exact', head: true });

      if (error) {
        // Table might not exist yet
        if (error.code === '42P01' || error.message.toLowerCase().includes('relation') || error.message.toLowerCase().includes('does not exist')) {
          return {
            success: false,
            message: `Tersambung ke Supabase, namun tabel 'produk' belum dibuat. Silakan salin & jalankan skrip SQL di menu SQL Editor Supabase. (Detail: ${error.message})`,
          };
        }
        return {
          success: false,
          message: `Gagal mengakses tabel Supabase: ${error.message}`,
        };
      }

      return {
        success: true,
        message: `Koneksi Supabase Berhasil Aktif! Database merespon dengan normal.`,
        details: { count },
      };
    } catch (err: any) {
      return {
        success: false,
        message: `Koneksi gagal terhubung ke Supabase. Periksa Project URL dan koneksi internet Anda: ${err?.message || err}`,
      };
    }
  }

  /**
   * Sync all local data into Supabase (Push all 7+ entities)
   */
  static async syncAllToSupabase(
    onProgress?: (step: string) => void
  ): Promise<{ success: boolean; message: string; stats?: Record<string, number> }> {
    const client = this.getClient();
    if (!client) {
      return {
        success: false,
        message: 'Supabase belum dikonfigurasi. Masukkan Project URL dan Anon Key terlebih dahulu.',
      };
    }

    const stats: Record<string, number> = {};

    try {
      // 1. Kategori
      onProgress?.('Mengunggah data Kategori ke Supabase...');
      const categories = StorageService.getCategories();
      if (categories.length > 0) {
        const payload = categories.map((c) => ({
          id: c.id,
          kode: c.kode,
          nama: c.nama,
          deskripsi: c.deskripsi,
          awalan_izin: c.awalan_izin,
          total_produk: c.total_produk,
        }));
        const { error } = await client.from('kategori').upsert(payload, { onConflict: 'id' });
        if (error) throw new Error(`Kategori: ${error.message}`);
        stats['kategori'] = categories.length;
      }

      // 2. Produsen
      onProgress?.('Mengunggah data Produsen ke Supabase...');
      const producers = StorageService.getProducers();
      if (producers.length > 0) {
        const payload = producers.map((p) => ({
          id: p.id,
          nama_pt: p.nama_pt,
          nomor_izin_industri: p.nomor_izin_industri,
          kategori_industri: p.kategori_industri,
          sertifikasi: p.sertifikasi,
          alamat: p.alamat,
          kota: p.kota,
          provinsi: p.provinsi,
          kontak_telepon: p.kontak_telepon,
          email: p.email,
          status_audit: p.status_audit,
          tahun_berdiri: p.tahun_berdiri,
        }));
        const { error } = await client.from('produsen').upsert(payload, { onConflict: 'id' });
        if (error) throw new Error(`Produsen: ${error.message}`);
        stats['produsen'] = producers.length;
      }

      // 3. Produk
      onProgress?.('Mengunggah data Produk & NIE ke Supabase...');
      const products = StorageService.getProducts();
      if (products.length > 0) {
        const payload = products.map((p) => ({
          id: p.id,
          nama_produk: p.nama_produk,
          nomor_izin: p.nomor_izin,
          kategori: p.kategori,
          produsen_id: p.produsen_id || null,
          nama_produsen: p.nama_produsen,
          bentuk_sediaan: p.bentuk_sediaan,
          merk: p.merk,
          deskripsi: p.deskripsi,
          karakteristik: p.karakteristik,
          karakteristik_detail: p.karakteristik_detail || {},
          komposisi: p.komposisi,
          indikasi: p.indikasi || null,
          aturan_pakai: p.aturan_pakai || null,
          kontraindikasi: p.kontraindikasi || null,
          penanggung_jawab: p.penanggung_jawab || null,
          status_registrasi: p.status_registrasi,
          tanggal_terbit: p.tanggal_terbit || null,
          tanggal_kedaluwarsa: p.tanggal_kedaluwarsa || null,
          qr_code_hash: p.qr_code_hash,
          foto_url: p.foto_url,
          status_uji_lab: p.status_uji_lab,
          batch_nomor: p.batch_nomor,
          barcode: p.barcode,
          drive_file_id: p.drive_file_id || null,
          drive_file_url: p.drive_file_url || null,
        }));
        const { error } = await client.from('produk').upsert(payload, { onConflict: 'id' });
        if (error) throw new Error(`Produk: ${error.message}`);
        stats['produk'] = products.length;
      }

      // 4. Uji Laboratorium
      onProgress?.('Mengunggah Hasil Uji Laboratorium ke Supabase...');
      const labResults = StorageService.getLabResults();
      if (labResults.length > 0) {
        const payload = labResults.map((l) => ({
          id: l.id,
          product_id: l.product_id || null,
          nomor_uji: l.nomor_uji,
          nama_produk: l.nama_produk,
          nomor_izin: l.nomor_izin,
          tanggal_uji: l.tanggal_uji,
          laboratorium_penguji: l.laboratorium_penguji,
          parameter_uji: l.parameter_uji,
          kesimpulan: l.kesimpulan,
          penguji_nama: l.penguji_nama,
          catatan: l.catatan,
          sertifikat_drive_url: l.sertifikat_drive_url || null,
        }));
        const { error } = await client.from('uji_laborat').upsert(payload, { onConflict: 'id' });
        if (error) throw new Error(`Uji Lab: ${error.message}`);
        stats['uji_laborat'] = labResults.length;
      }

      // 5. Penarikan Produk
      onProgress?.('Mengunggah Peringatan Penarikan Produk ke Supabase...');
      const recalls = StorageService.getRecalls();
      if (recalls.length > 0) {
        const payload = recalls.map((r) => ({
          id: r.id,
          product_id: r.product_id || null,
          nama_produk: r.nama_produk,
          nomor_izin: r.nomor_izin,
          nomor_batch: r.nomor_batch,
          tanggal_penarikan: r.tanggal_penarikan,
          bahaya_kesehatan: r.bahaya_kesehatan,
          tingkat_bahaya: r.tingkat_bahaya,
          tindakan_rekomendasi: r.tindakan_rekomendasi,
          status: r.status,
        }));
        const { error } = await client.from('penarikan_produk').upsert(payload, { onConflict: 'id' });
        if (error) throw new Error(`Penarikan: ${error.message}`);
        stats['penarikan_produk'] = recalls.length;
      }

      // 6. Pengaduan Masyarakat
      onProgress?.('Mengunggah Pengaduan Masyarakat ke Supabase...');
      const reports = StorageService.getReports();
      if (reports.length > 0) {
        const payload = reports.map((rep) => ({
          id: rep.id,
          ticket_number: rep.ticket_number,
          nama_pelapor: rep.nama_pelapor,
          kontak_pelapor: rep.kontak_pelapor,
          nama_produk: rep.nama_produk,
          nomor_izin_tertera: rep.nomor_izin_tertera,
          nomor_batch: rep.nomor_batch,
          lokasi_pembelian: rep.lokasi_pembelian,
          tanggal_kejadian: rep.tanggal_kejadian || null,
          indikasi_bahaya: rep.indikasi_bahaya,
          efek_samping: rep.efek_samping,
          foto_bukti_url: rep.foto_bukti_url || null,
          drive_file_id: rep.drive_file_id || null,
          tanggal_lapor: rep.tanggal_lapor,
          status: rep.status,
          tanggapan_petugas: rep.tanggapan_petugas || null,
        }));
        const { error } = await client.from('pengaduan_masyarakat').upsert(payload, { onConflict: 'id' });
        if (error) throw new Error(`Pengaduan: ${error.message}`);
        stats['pengaduan'] = reports.length;
      }

      // 7. Users
      onProgress?.('Mengunggah Akun Pengguna ke Supabase...');
      const users = StorageService.getUsers();
      if (users.length > 0) {
        const payload = users.map((u) => ({
          id: u.id,
          username: u.username,
          email: u.email,
          password: u.password || 'password123',
          role: u.role,
          nama_lengkap: u.nama_lengkap,
          nip_instansi: u.nip_instansi || null,
          status_aktif: u.status_aktif,
          dibuat_pada: u.dibuat_pada,
        }));
        const { error } = await client.from('users').upsert(payload, { onConflict: 'id' });
        if (error) throw new Error(`Users: ${error.message}`);
        stats['users'] = users.length;
      }

      // 8. Halaman Kustom (CMS)
      onProgress?.('Mengunggah Halaman CMS ke Supabase...');
      const pages = StorageService.getCustomPages();
      if (pages.length > 0) {
        const payload = pages.map((p) => ({
          id: p.id,
          judul: p.judul,
          slug: p.slug,
          ringkasan: p.ringkasan,
          kategori: p.kategori,
          konten: p.konten,
          status: p.status,
          urutan: p.urutan,
          tampilkan_di_navigasi: p.tampilkan_di_navigasi,
          tampilkan_di_footer: p.tampilkan_di_footer,
          terakhir_diperbarui: p.terakhir_diperbarui,
          penulis: p.penulis,
        }));
        const { error } = await client.from('halaman_kustom').upsert(payload, { onConflict: 'id' });
        if (error) throw new Error(`Halaman: ${error.message}`);
        stats['halaman_kustom'] = pages.length;
      }

      // 9. Pengaturan Website
      onProgress?.('Mengunggah Pengaturan Website ke Supabase...');
      const settings = StorageService.getSettings();
      const settingsPayload = {
        id: 'default_settings',
        nama_website: settings.nama_website,
        singkatan_portal: settings.singkatan_portal,
        tagline: settings.tagline,
        deskripsi: settings.deskripsi,
        deskripsi_singkat: settings.deskripsi_singkat,
        logo_url: settings.logo_url || null,
        logo_tipe: settings.logo_tipe,
        tema_warna: settings.tema_warna,
        running_text: settings.running_text,
        tampilkan_running_text: settings.tampilkan_running_text,
        telepon_layanan: settings.telepon_layanan,
        whatsapp_layanan: settings.whatsapp_layanan,
        email_resmi: settings.email_resmi,
        alamat_kantor: settings.alamat_kantor,
        jam_operasional: settings.jam_operasional,
        teks_footer: settings.teks_footer,
        status_portal: settings.status_portal,
      };
      await client.from('pengaturan_website').upsert(settingsPayload, { onConflict: 'id' });
      stats['pengaturan_website'] = 1;

      // Update last sync time
      const currConfig = StorageService.getConfig();
      StorageService.saveConfig({
        ...currConfig,
        is_connected: true,
        last_sync: new Date().toLocaleString('id-ID'),
      });

      return {
        success: true,
        message: 'Sinkronisasi Lengkap Berhasil! Seluruh data lokal telah tersimpan rapi di Supabase Cloud.',
        stats,
      };
    } catch (err: any) {
      console.error('Supabase sync error:', err);
      return {
        success: false,
        message: `Gagal melakukan sinkronisasi ke Supabase: ${err?.message || err}`,
      };
    }
  }

  /**
   * Pull all data from Supabase and synchronize locally
   */
  static async pullFromSupabase(): Promise<{
    success: boolean;
    message: string;
    counts?: Record<string, number>;
  }> {
    const client = this.getClient();
    if (!client) {
      return {
        success: false,
        message: 'Supabase belum dikonfigurasi.',
      };
    }

    try {
      const counts: Record<string, number> = {};

      // Products
      const { data: prods, error: pErr } = await client.from('produk').select('*');
      if (!pErr && prods && prods.length > 0) {
        StorageService.saveProductsLocally(prods as Product[]);
        counts['produk'] = prods.length;
      }

      // Categories
      const { data: cats, error: cErr } = await client.from('kategori').select('*');
      if (!cErr && cats && cats.length > 0) {
        StorageService.saveCategoriesLocally(cats as Category[]);
        counts['kategori'] = cats.length;
      }

      // Producers
      const { data: prodsList, error: prErr } = await client.from('produsen').select('*');
      if (!prErr && prodsList && prodsList.length > 0) {
        StorageService.saveProducersLocally(prodsList as Producer[]);
        counts['produsen'] = prodsList.length;
      }

      // Lab Results
      const { data: labs, error: lErr } = await client.from('uji_laborat').select('*');
      if (!lErr && labs && labs.length > 0) {
        StorageService.saveLabResultsLocally(labs as LabResult[]);
        counts['uji_laborat'] = labs.length;
      }

      // Recalls
      const { data: recs, error: rErr } = await client.from('penarikan_produk').select('*');
      if (!rErr && recs && recs.length > 0) {
        StorageService.saveRecallsLocally(recs as RecallAlert[]);
        counts['penarikan'] = recs.length;
      }

      // Custom Pages
      const { data: pages, error: pgErr } = await client.from('halaman_kustom').select('*');
      if (!pgErr && pages && pages.length > 0) {
        StorageService.saveCustomPagesLocally(pages as CustomPage[]);
        counts['halaman'] = pages.length;
      }

      // Settings
      const { data: setts, error: sErr } = await client
        .from('pengaturan_website')
        .select('*')
        .eq('id', 'default_settings')
        .maybeSingle();

      if (!sErr && setts) {
        StorageService.saveWebsiteSettingsLocally(setts as WebsiteSettings);
        counts['pengaturan'] = 1;
      }

      const currConfig = StorageService.getConfig();
      StorageService.saveConfig({
        ...currConfig,
        is_connected: true,
        last_sync: new Date().toLocaleString('id-ID'),
      });

      return {
        success: true,
        message: 'Data berhasil ditarik dari database Supabase Cloud ke aplikasi!',
        counts,
      };
    } catch (err: any) {
      return {
        success: false,
        message: `Gagal menarik data dari Supabase: ${err?.message || err}`,
      };
    }
  }

  /**
   * Fetch all products directly from Supabase (used on initial boot or across different browsers)
   */
  static async fetchProductsDirectly(): Promise<Product[] | null> {
    const client = this.getClient();
    if (!client) return null;
    try {
      const { data, error } = await client
        .from('produk')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) {
        console.warn('fetchProductsDirectly error:', error);
        return null;
      }
      return (data as Product[]) || [];
    } catch (e) {
      console.warn('fetchProductsDirectly exception:', e);
      return null;
    }
  }

  /**
   * Fetch a single product by ID or Nomor Izin from Supabase directly
   */
  static async fetchProductById(idOrNie: string): Promise<Product | null> {
    const client = this.getClient();
    if (!client) return null;
    try {
      const { data, error } = await client
        .from('produk')
        .select('*')
        .or(`id.eq.${idOrNie},nomor_izin.eq.${idOrNie}`)
        .maybeSingle();
      if (error || !data) return null;
      return data as Product;
    } catch (e) {
      return null;
    }
  }

  /**
   * Helper to detect if an error is due to a missing table
   */
  static isTableMissing(err: any): boolean {
    if (!err) return false;
    const msg = (err.message || err.details || err.hint || '').toLowerCase();
    const code = (err.code || '').toString();
    return (
      code === '42P01' || // PostgreSQL undefined_table
      code === 'PGRST204' ||
      code === 'PGRST205' ||
      (msg.includes('relation') && msg.includes('does not exist')) ||
      msg.includes('could not find the table') ||
      msg.includes('schema cache')
    );
  }

  /**
   * Trigger table missing notification to all active subscribers
   */
  static triggerTableMissing(table: string, message: string = '') {
    const info = {
      table,
      message: message || `Tabel '${table}' belum dibuat di Supabase.`,
      timestamp: Date.now(),
    };
    tableMissingListeners.forEach((cb) => {
      try {
        cb(info);
      } catch (e) {
        console.error('Error in tableMissingListener:', e);
      }
    });
  }

  /**
   * Subscribe to missing table notifications
   */
  static onTableMissing(cb: TableMissingListener): () => void {
    tableMissingListeners.add(cb);
    return () => {
      tableMissingListeners.delete(cb);
    };
  }

  /**
   * Extract project ref from URL (e.g. https://abcxyz.supabase.co -> abcxyz)
   */
  static extractProjectRef(overrideUrl?: string): string {
    let targetUrl = (overrideUrl || '').trim();
    if (!targetUrl) {
      const envUrl = ((typeof import.meta !== 'undefined' && import.meta.env?.VITE_SUPABASE_URL) || '').trim();
      if (envUrl) {
        targetUrl = envUrl;
      } else {
        try {
          const appConfig = StorageService.getConfig();
          targetUrl = (appConfig.supabase_url || '').trim();
        } catch (e) {
          // ignore
        }
      }
    }
    if (!targetUrl) return '';
    try {
      const parsed = new URL(targetUrl);
      const host = parsed.hostname;
      const parts = host.split('.');
      if (parts.length >= 3 && parts[parts.length - 2] === 'supabase' && parts[parts.length - 1] === 'co') {
        return parts[0];
      }
    } catch (e) {
      // ignore
    }
    return '';
  }

  /**
   * Get direct URL to Supabase SQL editor for this project
   */
  static getDashboardSqlUrl(overrideUrl?: string): string {
    const ref = this.extractProjectRef(overrideUrl);
    if (ref) {
      return `https://supabase.com/dashboard/project/${ref}/sql/new`;
    }
    return 'https://supabase.com/dashboard';
  }

  /**
   * Check status of all 9 tables in Supabase
   */
  static async checkAllTables(): Promise<{
    table: string;
    label: string;
    exists: boolean;
    count: number;
    error?: string;
  }[]> {
    const client = this.getClient();
    const tables = [
      { table: 'produsen', label: 'Produsen & Industri Terakreditasi' },
      { table: 'produk', label: 'Produk & Nomor Izin Edar (NIE)' },
      { table: 'kategori', label: 'Kategori Komoditas' },
      { table: 'uji_laborat', label: 'Hasil Pengujian Laboratorium' },
      { table: 'penarikan_produk', label: 'Peringatan Penarikan Produk (Recall)' },
      { table: 'pengaduan_masyarakat', label: 'Pengaduan & Pelaporan Publik' },
      { table: 'users', label: 'Akun Pengguna & Petugas' },
      { table: 'halaman_kustom', label: 'Halaman CMS Konten Publik' },
      { table: 'pengaturan_website', label: 'Pengaturan & Profil Portal' },
    ];

    if (!client) {
      return tables.map((t) => ({ ...t, exists: false, count: 0, error: 'Supabase belum terhubung' }));
    }

    const results: {
      table: string;
      label: string;
      exists: boolean;
      count: number;
      error?: string;
    }[] = [];

    for (const t of tables) {
      try {
        const { count, error } = await client
          .from(t.table)
          .select('*', { count: 'exact', head: true });

        if (error) {
          const isMissing = this.isTableMissing(error);
          results.push({
            table: t.table,
            label: t.label,
            exists: !isMissing,
            count: 0,
            error: error.message,
          });
        } else {
          results.push({
            table: t.table,
            label: t.label,
            exists: true,
            count: count ?? 0,
          });
        }
      } catch (e: any) {
        results.push({
          table: t.table,
          label: t.label,
          exists: false,
          count: 0,
          error: e?.message || 'Error koneksi tabel',
        });
      }
    }

    return results;
  }

  /**
   * Attempt automatic table creation via Supabase RPC if functions are available
   */
  static async attemptAutoCreateTables(): Promise<{ success: boolean; message: string }> {
    const client = this.getClient();
    if (!client) {
      return { success: false, message: 'Supabase belum dikonfigurasi.' };
    }

    // Try exec_sql RPC
    try {
      const { error } = await client.rpc('exec_sql', { sql: SUPABASE_SQL_SCHEMA });
      if (!error) {
        return {
          success: true,
          message: 'Tabel-tabel database BPOM berhasil dibuat secara otomatis via RPC Supabase!',
        };
      }
    } catch (e) {
      // ignore
    }

    // Try execute_sql RPC
    try {
      const { error } = await client.rpc('execute_sql', { query: SUPABASE_SQL_SCHEMA });
      if (!error) {
        return {
          success: true,
          message: 'Tabel-tabel database BPOM berhasil dibuat secara otomatis!',
        };
      }
    } catch (e) {
      // ignore
    }

    return {
      success: false,
      message:
        'Supabase memerlukan eksekusi DDL melalui SQL Editor pada saat pembuatan tabel pertama kali. Klik tombol "Buka SQL Editor" di bawah ini untuk menjalankan skrip yang telah disiapkan otomatis.',
    };
  }

  /**
   * Get raw SQL script for creating product table and related entities
   */
  static getProductTableSql(): string {
    return PRODUCT_TABLE_SQL;
  }

  /**
   * Ensure produk and produsen tables exist in Supabase.
   * If not present, automatically attempts creation via Supabase RPC or checks status.
   */
  static async ensureProductTableExists(): Promise<{ success: boolean; message: string }> {
    const client = this.getClient();
    if (!client) {
      return { success: false, message: 'Supabase belum dikonfigurasi.' };
    }

    // 1. Fast check if produk table and deskripsi column already exist and are queryable
    try {
      const { error } = await client.from('produk').select('id, deskripsi', { head: true, count: 'exact' });
      if (!error) {
        return { success: true, message: 'Tabel produk dan kolom deskripsi sudah tersedia dan aktif di Supabase.' };
      }
    } catch (e) {
      // ignore and try creating
    }

    // Check if table exists but column deskripsi is missing
    let isTablePresent = false;
    try {
      const { error: idError } = await client.from('produk').select('id', { head: true, count: 'exact' });
      if (!idError) {
        isTablePresent = true;
      }
    } catch (e) {
      // ignore
    }

    const ALTER_DESKRIPSI_SQL = `ALTER TABLE produk ADD COLUMN IF NOT EXISTS deskripsi TEXT;`;

    // 2. Try creating via RPC with targeted SQL or full schema
    const attempts = isTablePresent
      ? [
          () => client.rpc('exec_sql', { sql: ALTER_DESKRIPSI_SQL }),
          () => client.rpc('execute_sql', { query: ALTER_DESKRIPSI_SQL }),
          () => client.rpc('run_sql', { sql: ALTER_DESKRIPSI_SQL }),
          () => client.rpc('exec_sql', { sql: PRODUCT_TABLE_SQL }),
          () => client.rpc('execute_sql', { query: PRODUCT_TABLE_SQL }),
        ]
      : [
          () => client.rpc('exec_sql', { sql: PRODUCT_TABLE_SQL }),
          () => client.rpc('execute_sql', { query: PRODUCT_TABLE_SQL }),
          () => client.rpc('run_sql', { sql: PRODUCT_TABLE_SQL }),
          () => client.rpc('exec_sql', { sql: SUPABASE_SQL_SCHEMA }),
          () => client.rpc('execute_sql', { query: SUPABASE_SQL_SCHEMA }),
        ];

    for (const attempt of attempts) {
      try {
        const { error } = await attempt();
        if (!error) {
          return {
            success: true,
            message: isTablePresent
              ? 'Kolom deskripsi berhasil ditambahkan ke tabel produk di Supabase!'
              : 'Tabel produk dan dependensinya berhasil dibuat otomatis di Supabase!',
          };
        }
      } catch (e) {
        // continue to next RPC attempt
      }
    }

    // Final verification after attempts
    try {
      const { error } = await client.from('produk').select('id, deskripsi', { head: true, count: 'exact' });
      if (!error) {
        return {
          success: true,
          message: 'Tabel produk dan kolom deskripsi telah aktif dan tersinkronisasi di Supabase.',
        };
      }
    } catch (e) {
      // ignore
    }

    return {
      success: false,
      message: isTablePresent
        ? 'Kolom deskripsi belum ada di tabel produk Supabase. Silakan jalankan perintah ALTER TABLE di SQL Editor Supabase.'
        : 'Tabel produk belum ada di Supabase. Silakan jalankan skrip SQL di SQL Editor Supabase agar sinkronisasi data dapat berjalan.',
    };
  }

  /**
   * Upload product packaging photo to Supabase Storage bucket ('produk-foto').
   * If bucket doesn't exist, attempts to create it automatically with public access.
   * Supports File, Blob, and base64 Data URLs.
   * Returns public URL if successful, or null if storage is not accessible.
   */
  static async uploadProductPhoto(fileOrBase64: File | Blob | string, rawName: string): Promise<string | null> {
    const client = this.getClient();
    if (!client) return null;

    try {
      const bucketName = 'produk-foto';
      let uploadPayload: Blob | File;
      let contentType = 'image/jpeg';
      let extension = 'jpg';

      if (typeof fileOrBase64 === 'string') {
        if (fileOrBase64.startsWith('data:')) {
          const match = fileOrBase64.match(/^data:(image\/[a-zA-Z0-9.+_-]+);base64,/);
          if (match) {
            contentType = match[1];
            if (contentType.includes('png')) extension = 'png';
            else if (contentType.includes('webp')) extension = 'webp';
            else if (contentType.includes('svg')) extension = 'svg';
          }
          const res = await fetch(fileOrBase64);
          uploadPayload = await res.blob();
        } else if (fileOrBase64.startsWith('http://') || fileOrBase64.startsWith('https://')) {
          return fileOrBase64;
        } else {
          return null;
        }
      } else {
        uploadPayload = fileOrBase64;
        contentType = fileOrBase64.type || 'image/jpeg';
      }

      const safeName = rawName ? rawName.replace(/[^a-zA-Z0-9.-]/g, '_') : `foto_${Date.now()}.${extension}`;
      const cleanFileName = `produk_${Date.now()}_${safeName}`;

      // 1. Try uploading to existing bucket
      const { data, error } = await client.storage.from(bucketName).upload(cleanFileName, uploadPayload, {
        cacheControl: '3600',
        upsert: true,
        contentType,
      });

      if (error) {
        // 2. If bucket does not exist, try creating the bucket with public access
        try {
          await client.storage.createBucket(bucketName, { public: true });
          const retry = await client.storage.from(bucketName).upload(cleanFileName, uploadPayload, {
            cacheControl: '3600',
            upsert: true,
            contentType,
          });
          if (retry.data) {
            const { data: publicData } = client.storage.from(bucketName).getPublicUrl(cleanFileName);
            return publicData?.publicUrl || null;
          }
        } catch (bucketErr) {
          console.warn('Gagal membuat bucket Supabase Storage:', bucketErr);
        }
        return null;
      }

      if (data) {
        const { data: publicData } = client.storage.from(bucketName).getPublicUrl(cleanFileName);
        return publicData?.publicUrl || null;
      }
    } catch (err) {
      console.warn('Supabase storage upload error:', err);
    }
    return null;
  }

  // =========================================================================
  // INDIVIDUAL ENTITY SYNC & DELETE METHODS (Real-time auto-persistence)
  // =========================================================================

  /**
   * Save a single producer (Produsen) to Supabase
   */
  static async syncProducer(
    producer: Producer
  ): Promise<{ success: boolean; error?: any; tableMissing?: boolean }> {
    const client = this.getClient();
    if (!client) return { success: false, error: new Error('Supabase belum terkonfigurasi') };

    const payload = {
      id: producer.id,
      nama_pt: producer.nama_pt,
      nomor_izin_industri: producer.nomor_izin_industri,
      kategori_industri: producer.kategori_industri,
      sertifikasi: producer.sertifikasi || [],
      alamat: producer.alamat,
      kota: producer.kota,
      provinsi: producer.provinsi,
      kontak_telepon: producer.kontak_telepon,
      email: producer.email,
      status_audit: producer.status_audit,
      tahun_berdiri: producer.tahun_berdiri,
    };

    try {
      const { error } = await client.from('produsen').upsert(payload, { onConflict: 'id' });
      if (error) {
        const missing = this.isTableMissing(error);
        if (missing) {
          this.triggerTableMissing('produsen', error.message);
        }
        return { success: false, error, tableMissing: missing };
      }
      return { success: true };
    } catch (err: any) {
      const missing = this.isTableMissing(err);
      if (missing) {
        this.triggerTableMissing('produsen', err?.message);
      }
      return { success: false, error: err, tableMissing: missing };
    }
  }

  /**
   * Delete a producer from Supabase
   */
  static async deleteProducer(id: string): Promise<boolean> {
    const client = this.getClient();
    if (!client) return false;
    try {
      await client.from('produsen').delete().eq('id', id);
      return true;
    } catch (e) {
      console.warn('Supabase producer delete failed:', e);
      return false;
    }
  }

  /**
   * Save a single product to Supabase asynchronously with storage upload and foreign key safety
   */
  static async syncProduct(
    product: Product
  ): Promise<{ success: boolean; error?: any; tableMissing?: boolean; publicFotoUrl?: string }> {
    const client = this.getClient();
    if (!client) return { success: false, error: new Error('Supabase belum terkonfigurasi') };

    let effectiveFotoUrl = product.foto_url;

    // JIKA FOTO_URL BERUPA DATA URL BASE64 (Dari upload gambar perangkat), UNGGAH KE SUPABASE STORAGE
    // SEHINGGA URL BISA DIAKSES PERMANEN OLEH BROWSER / PERANGKAT LAIN
    if (effectiveFotoUrl && effectiveFotoUrl.startsWith('data:image/')) {
      try {
        const cloudUrl = await this.uploadProductPhoto(effectiveFotoUrl, `${product.nama_produk || 'produk'}.jpg`);
        if (cloudUrl) {
          effectiveFotoUrl = cloudUrl;
          product.foto_url = cloudUrl;
          try {
            const allProds = StorageService.getProducts();
            const target = allProds.find((p) => p.id === product.id);
            if (target) {
              target.foto_url = cloudUrl;
              StorageService.saveProductsLocally(allProds);
            }
          } catch (e) {
            // ignore
          }
        }
      } catch (uploadErr) {
        console.warn('Gagal auto-upload foto ke Supabase Storage:', uploadErr);
      }
    }

    // Pastikan produsen_id aman
    let safeProdusenId: string | null = product.produsen_id || null;
    if (safeProdusenId === 'produsen-default') {
      safeProdusenId = null;
    }

    const payload: Record<string, any> = {
      id: product.id,
      nama_produk: product.nama_produk,
      nomor_izin: product.nomor_izin,
      kategori: product.kategori,
      produsen_id: safeProdusenId,
      nama_produsen: product.nama_produsen,
      bentuk_sediaan: product.bentuk_sediaan,
      merk: product.merk,
      deskripsi: product.deskripsi,
      karakteristik: product.karakteristik,
      karakteristik_detail: product.karakteristik_detail || {},
      komposisi: product.komposisi,
      indikasi: product.indikasi || null,
      aturan_pakai: product.aturan_pakai || null,
      kontraindikasi: product.kontraindikasi || null,
      penanggung_jawab: product.penanggung_jawab || null,
      status_registrasi: product.status_registrasi,
      tanggal_terbit: product.tanggal_terbit || null,
      tanggal_kedaluwarsa: product.tanggal_kedaluwarsa || null,
      qr_code_hash: product.qr_code_hash,
      foto_url: effectiveFotoUrl,
      status_uji_lab: product.status_uji_lab,
      batch_nomor: product.batch_nomor,
      barcode: product.barcode,
      drive_file_id: product.drive_file_id || null,
      drive_file_url: product.drive_file_url || null,
    };

    try {
      const { error } = await client.from('produk').upsert(payload, { onConflict: 'id' });
      if (error) {
        // Jika gagal karena foreign key produsen_id belum ada di tabel produsen, coba lagi dengan null
        if (
          error.code === '23503' ||
          String(error.message || '').toLowerCase().includes('produsen_id') ||
          String(error.message || '').toLowerCase().includes('foreign key')
        ) {
          payload.produsen_id = null;
          const retryFk = await client.from('produk').upsert(payload, { onConflict: 'id' });
          if (!retryFk.error) {
            return { success: true, publicFotoUrl: effectiveFotoUrl };
          }
        }

        const missing = this.isTableMissing(error);
        const isColMissing =
          error.code === '42703' ||
          String(error.message || '').toLowerCase().includes('deskripsi') ||
          (String(error.message || '').toLowerCase().includes('column') &&
            String(error.message || '').toLowerCase().includes('does not exist'));

        if (missing || isColMissing) {
          // Otomatis buat tabel produk atau migrasi kolom deskripsi di Supabase jika belum ada
          const autoCreate = await this.ensureProductTableExists();
          if (autoCreate.success) {
            const retry = await client.from('produk').upsert(payload, { onConflict: 'id' });
            if (!retry.error) {
              return { success: true, publicFotoUrl: effectiveFotoUrl };
            }
          }
          // Jika kolom deskripsi belum ada pada tabel lama di remote dan RPC exec_sql tidak aktif,
          // simpan payload tanpa kolom deskripsi agar data produk esensial tetap berhasil masuk ke cloud
          if (isColMissing && !missing) {
            const { deskripsi: _, ...fallbackPayload } = payload;
            const retryNoDesc = await client.from('produk').upsert(fallbackPayload, { onConflict: 'id' });
            if (!retryNoDesc.error) {
              console.warn(
                'Produk berhasil disimpan ke Supabase tanpa kolom deskripsi. Tambahkan kolom dengan perintah: ALTER TABLE produk ADD COLUMN IF NOT EXISTS deskripsi TEXT;'
              );
              return { success: true, publicFotoUrl: effectiveFotoUrl };
            }
          }
          if (missing) {
            this.triggerTableMissing('produk', error.message);
          }
        }
        return { success: false, error, tableMissing: missing };
      }
      return { success: true, publicFotoUrl: effectiveFotoUrl };
    } catch (e: any) {
      const missing = this.isTableMissing(e);
      const isColMissing =
        e?.code === '42703' ||
        String(e?.message || '').toLowerCase().includes('deskripsi') ||
        (String(e?.message || '').toLowerCase().includes('column') &&
          String(e?.message || '').toLowerCase().includes('does not exist'));

      if (missing || isColMissing) {
        const autoCreate = await this.ensureProductTableExists();
        if (autoCreate.success) {
          try {
            const retry = await client.from('produk').upsert(payload, { onConflict: 'id' });
            if (!retry.error) {
              return { success: true, publicFotoUrl: effectiveFotoUrl };
            }
          } catch (retryErr) {
            // ignore
          }
        }
        if (missing) {
          this.triggerTableMissing('produk', e?.message);
        }
      }
      return { success: false, error: e, tableMissing: missing };
    }
  }

  /**
   * Delete a single product from Supabase
   */
  static async deleteProduct(id: string): Promise<boolean> {
    const client = this.getClient();
    if (!client) return false;
    try {
      await client.from('produk').delete().eq('id', id);
      return true;
    } catch (e) {
      console.warn('Supabase product delete failed:', e);
      return false;
    }
  }

  /**
   * Save a single category to Supabase
   */
  static async syncCategory(
    category: Category
  ): Promise<{ success: boolean; error?: any; tableMissing?: boolean }> {
    const client = this.getClient();
    if (!client) return { success: false, error: new Error('Supabase belum terkonfigurasi') };

    try {
      const payload = {
        id: category.id,
        kode: category.kode,
        nama: category.nama,
        deskripsi: category.deskripsi,
        awalan_izin: category.awalan_izin || [],
        total_produk: category.total_produk || 0,
      };
      const { error } = await client.from('kategori').upsert(payload, { onConflict: 'id' });
      if (error) {
        const missing = this.isTableMissing(error);
        if (missing) this.triggerTableMissing('kategori', error.message);
        return { success: false, error, tableMissing: missing };
      }
      return { success: true };
    } catch (err: any) {
      const missing = this.isTableMissing(err);
      if (missing) this.triggerTableMissing('kategori', err?.message);
      return { success: false, error: err, tableMissing: missing };
    }
  }

  /**
   * Delete a category from Supabase
   */
  static async deleteCategory(id: string): Promise<boolean> {
    const client = this.getClient();
    if (!client) return false;
    try {
      await client.from('kategori').delete().eq('id', id);
      return true;
    } catch (e) {
      return false;
    }
  }

  /**
   * Save a single lab result to Supabase
   */
  static async syncLabResult(
    lab: LabResult
  ): Promise<{ success: boolean; error?: any; tableMissing?: boolean }> {
    const client = this.getClient();
    if (!client) return { success: false, error: new Error('Supabase belum terkonfigurasi') };

    try {
      const payload = {
        id: lab.id,
        product_id: lab.product_id || null,
        nomor_uji: lab.nomor_uji,
        nama_produk: lab.nama_produk,
        nomor_izin: lab.nomor_izin,
        tanggal_uji: lab.tanggal_uji,
        laboratorium_penguji: lab.laboratorium_penguji,
        parameter_uji: lab.parameter_uji || [],
        kesimpulan: lab.kesimpulan,
        penguji_nama: lab.penguji_nama,
        catatan: lab.catatan,
        sertifikat_drive_url: lab.sertifikat_drive_url || null,
      };
      const { error } = await client.from('uji_laborat').upsert(payload, { onConflict: 'id' });
      if (error) {
        const missing = this.isTableMissing(error);
        if (missing) this.triggerTableMissing('uji_laborat', error.message);
        return { success: false, error, tableMissing: missing };
      }
      return { success: true };
    } catch (err: any) {
      const missing = this.isTableMissing(err);
      if (missing) this.triggerTableMissing('uji_laborat', err?.message);
      return { success: false, error: err, tableMissing: missing };
    }
  }

  /**
   * Delete a lab result from Supabase
   */
  static async deleteLabResult(id: string): Promise<boolean> {
    const client = this.getClient();
    if (!client) return false;
    try {
      await client.from('uji_laborat').delete().eq('id', id);
      return true;
    } catch (e) {
      return false;
    }
  }

  /**
   * Save a single recall alert to Supabase
   */
  static async syncRecall(
    recall: RecallAlert
  ): Promise<{ success: boolean; error?: any; tableMissing?: boolean }> {
    const client = this.getClient();
    if (!client) return { success: false, error: new Error('Supabase belum terkonfigurasi') };

    try {
      const payload = {
        id: recall.id,
        product_id: recall.product_id || null,
        nama_produk: recall.nama_produk,
        nomor_izin: recall.nomor_izin,
        nomor_batch: recall.nomor_batch,
        tanggal_penarikan: recall.tanggal_penarikan,
        bahaya_kesehatan: recall.bahaya_kesehatan,
        tingkat_bahaya: recall.tingkat_bahaya,
        tindakan_rekomendasi: recall.tindakan_rekomendasi,
        status: recall.status,
      };
      const { error } = await client.from('penarikan_produk').upsert(payload, { onConflict: 'id' });
      if (error) {
        const missing = this.isTableMissing(error);
        if (missing) this.triggerTableMissing('penarikan_produk', error.message);
        return { success: false, error, tableMissing: missing };
      }
      return { success: true };
    } catch (err: any) {
      const missing = this.isTableMissing(err);
      if (missing) this.triggerTableMissing('penarikan_produk', err?.message);
      return { success: false, error: err, tableMissing: missing };
    }
  }

  /**
   * Delete a recall alert from Supabase
   */
  static async deleteRecall(id: string): Promise<boolean> {
    const client = this.getClient();
    if (!client) return false;
    try {
      await client.from('penarikan_produk').delete().eq('id', id);
      return true;
    } catch (e) {
      return false;
    }
  }

  /**
   * Save a single public report to Supabase
   */
  static async syncReport(
    report: Report
  ): Promise<{ success: boolean; error?: any; tableMissing?: boolean }> {
    const client = this.getClient();
    if (!client) return { success: false, error: new Error('Supabase belum terkonfigurasi') };

    try {
      const payload = {
        id: report.id,
        ticket_number: report.ticket_number,
        nama_pelapor: report.nama_pelapor,
        kontak_pelapor: report.kontak_pelapor,
        nama_produk: report.nama_produk,
        nomor_izin_tertera: report.nomor_izin_tertera,
        nomor_batch: report.nomor_batch,
        lokasi_pembelian: report.lokasi_pembelian,
        tanggal_kejadian: report.tanggal_kejadian || null,
        indikasi_bahaya: report.indikasi_bahaya,
        efek_samping: report.efek_samping,
        foto_bukti_url: report.foto_bukti_url || null,
        drive_file_id: report.drive_file_id || null,
        tanggal_lapor: report.tanggal_lapor,
        status: report.status,
        tanggapan_petugas: report.tanggapan_petugas || null,
      };
      const { error } = await client.from('pengaduan_masyarakat').upsert(payload, { onConflict: 'id' });
      if (error) {
        const missing = this.isTableMissing(error);
        if (missing) this.triggerTableMissing('pengaduan_masyarakat', error.message);
        return { success: false, error, tableMissing: missing };
      }
      return { success: true };
    } catch (err: any) {
      const missing = this.isTableMissing(err);
      if (missing) this.triggerTableMissing('pengaduan_masyarakat', err?.message);
      return { success: false, error: err, tableMissing: missing };
    }
  }

  /**
   * Save a user account to Supabase
   */
  static async syncUser(
    user: User
  ): Promise<{ success: boolean; error?: any; tableMissing?: boolean }> {
    const client = this.getClient();
    if (!client) return { success: false, error: new Error('Supabase belum terkonfigurasi') };

    try {
      const payload = {
        id: user.id,
        username: user.username,
        email: user.email,
        password: user.password || 'password123',
        role: user.role,
        nama_lengkap: user.nama_lengkap,
        nip_instansi: user.nip_instansi || null,
        status_aktif: user.status_aktif,
        dibuat_pada: user.dibuat_pada,
        terakhir_login: user.terakhir_login || null,
      };
      const { error } = await client.from('users').upsert(payload, { onConflict: 'id' });
      if (error) {
        const missing = this.isTableMissing(error);
        if (missing) this.triggerTableMissing('users', error.message);
        return { success: false, error, tableMissing: missing };
      }
      return { success: true };
    } catch (err: any) {
      const missing = this.isTableMissing(err);
      if (missing) this.triggerTableMissing('users', err?.message);
      return { success: false, error: err, tableMissing: missing };
    }
  }

  /**
   * Delete a user from Supabase
   */
  static async deleteUser(id: string): Promise<boolean> {
    const client = this.getClient();
    if (!client) return false;
    try {
      await client.from('users').delete().eq('id', id);
      return true;
    } catch (e) {
      return false;
    }
  }

  /**
   * Save a single custom CMS page to Supabase
   */
  static async syncCustomPage(
    page: CustomPage
  ): Promise<{ success: boolean; error?: any; tableMissing?: boolean }> {
    const client = this.getClient();
    if (!client) return { success: false, error: new Error('Supabase belum terkonfigurasi') };

    try {
      const payload = {
        id: page.id,
        judul: page.judul,
        slug: page.slug,
        ringkasan: page.ringkasan,
        kategori: page.kategori,
        konten: page.konten,
        status: page.status,
        urutan: page.urutan,
        tampilkan_di_navigasi: page.tampilkan_di_navigasi,
        tampilkan_di_footer: page.tampilkan_di_footer,
        terakhir_diperbarui: page.terakhir_diperbarui,
        penulis: page.penulis,
      };
      const { error } = await client.from('halaman_kustom').upsert(payload, { onConflict: 'id' });
      if (error) {
        const missing = this.isTableMissing(error);
        if (missing) this.triggerTableMissing('halaman_kustom', error.message);
        return { success: false, error, tableMissing: missing };
      }
      return { success: true };
    } catch (err: any) {
      const missing = this.isTableMissing(err);
      if (missing) this.triggerTableMissing('halaman_kustom', err?.message);
      return { success: false, error: err, tableMissing: missing };
    }
  }

  /**
   * Delete a custom CMS page from Supabase
   */
  static async deleteCustomPage(id: string): Promise<boolean> {
    const client = this.getClient();
    if (!client) return false;
    try {
      await client.from('halaman_kustom').delete().eq('id', id);
      return true;
    } catch (e) {
      return false;
    }
  }

  /**
   * Save website settings to Supabase
   */
  static async syncWebsiteSettings(
    settings: WebsiteSettings
  ): Promise<{ success: boolean; error?: any; tableMissing?: boolean }> {
    const client = this.getClient();
    if (!client) return { success: false, error: new Error('Supabase belum terkonfigurasi') };

    try {
      const payload = {
        id: 'default_settings',
        nama_website: settings.nama_website,
        singkatan_portal: settings.singkatan_portal,
        tagline: settings.tagline,
        deskripsi: settings.deskripsi,
        deskripsi_singkat: settings.deskripsi_singkat,
        logo_url: settings.logo_url || null,
        logo_tipe: settings.logo_tipe,
        tema_warna: settings.tema_warna,
        running_text: settings.running_text,
        tampilkan_running_text: settings.tampilkan_running_text,
        telepon_layanan: settings.telepon_layanan,
        whatsapp_layanan: settings.whatsapp_layanan,
        email_resmi: settings.email_resmi,
        alamat_kantor: settings.alamat_kantor,
        jam_operasional: settings.jam_operasional,
        teks_footer: settings.teks_footer,
        status_portal: settings.status_portal,
      };
      const { error } = await client.from('pengaturan_website').upsert(payload, { onConflict: 'id' });
      if (error) {
        const missing = this.isTableMissing(error);
        if (missing) this.triggerTableMissing('pengaturan_website', error.message);
        return { success: false, error, tableMissing: missing };
      }
      return { success: true };
    } catch (err: any) {
      const missing = this.isTableMissing(err);
      if (missing) this.triggerTableMissing('pengaturan_website', err?.message);
      return { success: false, error: err, tableMissing: missing };
    }
  }
}
