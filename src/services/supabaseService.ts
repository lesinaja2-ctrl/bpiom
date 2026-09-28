import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { StorageService } from './storageService';
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
import {
  INITIAL_CATEGORIES,
  INITIAL_PRODUCTS,
  INITIAL_PRODUCERS,
  INITIAL_LAB_RESULTS,
  INITIAL_RECALLS,
  INITIAL_REPORTS,
  INITIAL_USERS,
  DEFAULT_WEBSITE_SETTINGS,
  INITIAL_CUSTOM_PAGES,
} from '../data/initialData';

let cachedClient: SupabaseClient | null = null;
let lastUsedUrl: string = '';
let lastUsedKey: string = '';

export interface SupabaseConfigInfo {
  url: string;
  anonKey: string;
  source: 'env' | 'storage' | 'not_configured';
  isConfigured: boolean;
}

export class SupabaseService {
  /**
   * Retrieve active Supabase credentials from Environment or Local Storage
   */
  static getConfigInfo(): SupabaseConfigInfo {
    const envUrl = (import.meta.env.VITE_SUPABASE_URL || '').trim();
    const envKey = (import.meta.env.VITE_SUPABASE_ANON_KEY || '').trim();

    if (envUrl && envKey) {
      return {
        url: envUrl,
        anonKey: envKey,
        source: 'env',
        isConfigured: true,
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
    };
  }

  /**
   * Get or initialize Supabase Client singleton
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
        if (
          error.code === '42P01' ||
          error.message.toLowerCase().includes('relation') ||
          error.message.toLowerCase().includes('does not exist')
        ) {
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
        message: `Koneksi Supabase Berhasil Aktif! Database terhubung dan tabel siap digunakan.`,
        details: { count },
      };
    } catch (err: any) {
      return {
        success: false,
        message: `Koneksi gagal terhubung ke Supabase: ${err?.message || err}`,
      };
    }
  }

  /**
   * Realtime Listener: Subscribes to database changes so all browsers reflect updates immediately
   */
  static subscribeToChanges(onEvent: (table: string, payload: any) => void): () => void {
    const client = this.getClient();
    if (!client) return () => {};

    try {
      const channel = client
        .channel('bpiom-realtime-sync')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public' },
          (payload) => {
            if (payload && payload.table) {
              onEvent(payload.table, payload);
            }
          }
        )
        .subscribe((status) => {
          if (status === 'SUBSCRIBED') {
            console.log('[Supabase Realtime] Terhubung ke saluran sinkronisasi publik.');
          }
        });

      return () => {
        try {
          client.removeChannel(channel);
        } catch (e) {
          // ignore
        }
      };
    } catch (err) {
      console.warn('Realtime subscription error:', err);
      return () => {};
    }
  }

  // ==========================================
  // FETCH METHODS (READ FROM SUPABASE SERVER)
  // ==========================================

  static async fetchProducts(): Promise<Product[] | null> {
    const client = this.getClient();
    if (!client) return null;
    try {
      const { data, error } = await client
        .from('produk')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.warn('Supabase fetchProducts error:', error.message);
        return null;
      }
      return (data || []) as Product[];
    } catch (e) {
      console.warn('Supabase fetchProducts exception:', e);
      return null;
    }
  }

  static async fetchCategories(): Promise<Category[] | null> {
    const client = this.getClient();
    if (!client) return null;
    try {
      const { data, error } = await client.from('kategori').select('*').order('nama');
      if (error) {
        console.warn('Supabase fetchCategories error:', error.message);
        return null;
      }
      return (data || []) as Category[];
    } catch (e) {
      return null;
    }
  }

  static async fetchProducers(): Promise<Producer[] | null> {
    const client = this.getClient();
    if (!client) return null;
    try {
      const { data, error } = await client.from('produsen').select('*').order('nama_pt');
      if (error) return null;
      return (data || []) as Producer[];
    } catch (e) {
      return null;
    }
  }

  static async fetchLabResults(): Promise<LabResult[] | null> {
    const client = this.getClient();
    if (!client) return null;
    try {
      const { data, error } = await client
        .from('uji_laborat')
        .select('*')
        .order('tanggal_uji', { ascending: false });
      if (error) return null;
      return (data || []) as LabResult[];
    } catch (e) {
      return null;
    }
  }

  static async fetchRecalls(): Promise<RecallAlert[] | null> {
    const client = this.getClient();
    if (!client) return null;
    try {
      const { data, error } = await client
        .from('penarikan_produk')
        .select('*')
        .order('tanggal_penarikan', { ascending: false });
      if (error) return null;
      return (data || []) as RecallAlert[];
    } catch (e) {
      return null;
    }
  }

  static async fetchReports(): Promise<Report[] | null> {
    const client = this.getClient();
    if (!client) return null;
    try {
      const { data, error } = await client
        .from('pengaduan_masyarakat')
        .select('*')
        .order('tanggal_lapor', { ascending: false });
      if (error) return null;
      return (data || []) as Report[];
    } catch (e) {
      return null;
    }
  }

  static async fetchUsers(): Promise<User[] | null> {
    const client = this.getClient();
    if (!client) return null;
    try {
      const { data, error } = await client.from('users').select('*').order('nama_lengkap');
      if (error) return null;
      return (data || []) as User[];
    } catch (e) {
      return null;
    }
  }

  static async fetchCustomPages(): Promise<CustomPage[] | null> {
    const client = this.getClient();
    if (!client) return null;
    try {
      const { data, error } = await client.from('halaman_kustom').select('*').order('urutan');
      if (error) return null;
      return (data || []) as CustomPage[];
    } catch (e) {
      return null;
    }
  }

  static async fetchSettings(): Promise<WebsiteSettings | null> {
    const client = this.getClient();
    if (!client) return null;
    try {
      const { data, error } = await client
        .from('pengaturan_website')
        .select('*')
        .eq('id', 'default_settings')
        .maybeSingle();

      if (error || !data) return null;
      return data as WebsiteSettings;
    } catch (e) {
      return null;
    }
  }

  /**
   * Fetch all records across all tables from Supabase in parallel
   */
  static async fetchAllFromSupabase(): Promise<{
    isAvailable: boolean;
    products?: Product[];
    categories?: Category[];
    producers?: Producer[];
    labResults?: LabResult[];
    recalls?: RecallAlert[];
    reports?: Report[];
    users?: User[];
    customPages?: CustomPage[];
    settings?: WebsiteSettings;
  }> {
    const client = this.getClient();
    if (!client) {
      return { isAvailable: false };
    }

    try {
      const [
        prods,
        cats,
        prodsList,
        labs,
        recs,
        reps,
        usrs,
        pgs,
        setts,
      ] = await Promise.all([
        this.fetchProducts(),
        this.fetchCategories(),
        this.fetchProducers(),
        this.fetchLabResults(),
        this.fetchRecalls(),
        this.fetchReports(),
        this.fetchUsers(),
        this.fetchCustomPages(),
        this.fetchSettings(),
      ]);

      // If at least products or categories could be reached, Supabase is active
      const isAvailable = prods !== null || cats !== null;

      return {
        isAvailable,
        products: prods || undefined,
        categories: cats || undefined,
        producers: prodsList || undefined,
        labResults: labs || undefined,
        recalls: recs || undefined,
        reports: reps || undefined,
        users: usrs || undefined,
        customPages: pgs || undefined,
        settings: setts || undefined,
      };
    } catch (e) {
      console.warn('fetchAllFromSupabase exception:', e);
      return { isAvailable: false };
    }
  }

  // ==========================================
  // WRITE / UPSERT / DELETE METHODS (PERSIST)
  // ==========================================

  /**
   * Upsert Product to Supabase
   */
  static async upsertProduct(product: Product): Promise<{ success: boolean; error?: string }> {
    const client = this.getClient();
    if (!client) return { success: false, error: 'Supabase client not initialized' };

    const fullPayload: any = {
      id: product.id,
      nama_produk: product.nama_produk,
      nomor_izin: product.nomor_izin,
      kategori: product.kategori,
      produsen_id: product.produsen_id || null,
      nama_produsen: product.nama_produsen,
      bentuk_sediaan: product.bentuk_sediaan,
      merk: product.merk,
      deskripsi: product.deskripsi,
      karakteristik: product.karakteristik,
      karakteristik_detail: product.karakteristik_detail || null,
      komposisi: product.komposisi,
      indikasi: product.indikasi || null,
      aturan_pakai: product.aturan_pakai || null,
      kontraindikasi: product.kontraindikasi || null,
      penanggung_jawab: product.penanggung_jawab || null,
      status_registrasi: product.status_registrasi,
      tanggal_terbit: product.tanggal_terbit || null,
      tanggal_kedaluwarsa: product.tanggal_kedaluwarsa || null,
      qr_code_hash: product.qr_code_hash,
      foto_url: product.foto_url,
      status_uji_lab: product.status_uji_lab,
      batch_nomor: product.batch_nomor,
      barcode: product.barcode,
      drive_file_url: product.drive_file_url || null,
      drive_file_id: product.drive_file_id || null,
    };

    try {
      const { error } = await client.from('produk').upsert(fullPayload, { onConflict: 'id' });
      if (!error) return { success: true };

      // If schema has older columns, retry with base columns
      if (error.message.includes('column') || error.code === '42703') {
        const basePayload: any = {
          id: product.id,
          nama_produk: product.nama_produk,
          nomor_izin: product.nomor_izin,
          kategori: product.kategori,
          produsen_id: product.produsen_id || null,
          nama_produsen: product.nama_produsen,
          bentuk_sediaan: product.bentuk_sediaan,
          merk: product.merk,
          deskripsi: product.deskripsi,
          karakteristik: product.karakteristik,
          komposisi: product.komposisi,
          status_registrasi: product.status_registrasi,
          tanggal_terbit: product.tanggal_terbit || null,
          tanggal_kedaluwarsa: product.tanggal_kedaluwarsa || null,
          qr_code_hash: product.qr_code_hash,
          foto_url: product.foto_url,
          status_uji_lab: product.status_uji_lab,
          batch_nomor: product.batch_nomor,
          barcode: product.barcode,
          drive_file_url: product.drive_file_url || null,
        };
        const { error: retryErr } = await client.from('produk').upsert(basePayload, { onConflict: 'id' });
        if (!retryErr) return { success: true };
        return { success: false, error: retryErr.message };
      }

      return { success: false, error: error.message };
    } catch (e: any) {
      return { success: false, error: e?.message || String(e) };
    }
  }

  /**
   * Delete Product from Supabase
   */
  static async deleteProduct(id: string): Promise<{ success: boolean; error?: string }> {
    const client = this.getClient();
    if (!client) return { success: false, error: 'Supabase client not initialized' };
    try {
      const { error } = await client.from('produk').delete().eq('id', id);
      if (error) return { success: false, error: error.message };
      return { success: true };
    } catch (e: any) {
      return { success: false, error: e?.message || String(e) };
    }
  }

  /**
   * Upsert Category to Supabase
   */
  static async upsertCategory(cat: Category): Promise<{ success: boolean; error?: string }> {
    const client = this.getClient();
    if (!client) return { success: false, error: 'Supabase client not initialized' };
    try {
      const { error } = await client.from('kategori').upsert(
        {
          id: cat.id,
          kode: cat.kode,
          nama: cat.nama,
          deskripsi: cat.deskripsi,
          awalan_izin: cat.awalan_izin,
          total_produk: cat.total_produk,
        },
        { onConflict: 'id' }
      );
      if (error) return { success: false, error: error.message };
      return { success: true };
    } catch (e: any) {
      return { success: false, error: e?.message || String(e) };
    }
  }

  /**
   * Delete Category from Supabase
   */
  static async deleteCategory(id: string): Promise<{ success: boolean; error?: string }> {
    const client = this.getClient();
    if (!client) return { success: false, error: 'Supabase client not initialized' };
    try {
      const { error } = await client.from('kategori').delete().eq('id', id);
      if (error) return { success: false, error: error.message };
      return { success: true };
    } catch (e: any) {
      return { success: false, error: e?.message || String(e) };
    }
  }

  /**
   * Upsert Producer to Supabase
   */
  static async upsertProducer(prod: Producer): Promise<{ success: boolean; error?: string }> {
    const client = this.getClient();
    if (!client) return { success: false, error: 'Supabase client not initialized' };
    try {
      const { error } = await client.from('produsen').upsert(
        {
          id: prod.id,
          nama_pt: prod.nama_pt,
          nomor_izin_industri: prod.nomor_izin_industri,
          kategori_industri: prod.kategori_industri,
          sertifikasi: prod.sertifikasi,
          alamat: prod.alamat,
          kota: prod.kota,
          provinsi: prod.provinsi,
          kontak_telepon: prod.kontak_telepon,
          email: prod.email,
          status_audit: prod.status_audit,
          tahun_berdiri: prod.tahun_berdiri,
        },
        { onConflict: 'id' }
      );
      if (error) return { success: false, error: error.message };
      return { success: true };
    } catch (e: any) {
      return { success: false, error: e?.message || String(e) };
    }
  }

  /**
   * Delete Producer from Supabase
   */
  static async deleteProducer(id: string): Promise<{ success: boolean; error?: string }> {
    const client = this.getClient();
    if (!client) return { success: false, error: 'Supabase client not initialized' };
    try {
      const { error } = await client.from('produsen').delete().eq('id', id);
      if (error) return { success: false, error: error.message };
      return { success: true };
    } catch (e: any) {
      return { success: false, error: e?.message || String(e) };
    }
  }

  /**
   * Upsert Lab Result to Supabase
   */
  static async upsertLabResult(lab: LabResult): Promise<{ success: boolean; error?: string }> {
    const client = this.getClient();
    if (!client) return { success: false, error: 'Supabase client not initialized' };
    try {
      const { error } = await client.from('uji_laborat').upsert(
        {
          id: lab.id,
          product_id: lab.product_id || null,
          nomor_uji: lab.nomor_uji,
          nama_produk: lab.nama_produk,
          nomor_izin: lab.nomor_izin,
          tanggal_uji: lab.tanggal_uji,
          laboratorium_penguji: lab.laboratorium_penguji,
          parameter_uji: lab.parameter_uji,
          kesimpulan: lab.kesimpulan,
          penguji_nama: lab.penguji_nama,
          catatan: lab.catatan,
          sertifikat_drive_url: lab.sertifikat_drive_url || null,
        },
        { onConflict: 'id' }
      );
      if (error) return { success: false, error: error.message };
      return { success: true };
    } catch (e: any) {
      return { success: false, error: e?.message || String(e) };
    }
  }

  /**
   * Delete Lab Result from Supabase
   */
  static async deleteLabResult(id: string): Promise<{ success: boolean; error?: string }> {
    const client = this.getClient();
    if (!client) return { success: false, error: 'Supabase client not initialized' };
    try {
      const { error } = await client.from('uji_laborat').delete().eq('id', id);
      if (error) return { success: false, error: error.message };
      return { success: true };
    } catch (e: any) {
      return { success: false, error: e?.message || String(e) };
    }
  }

  /**
   * Upsert Recall to Supabase
   */
  static async upsertRecall(recall: RecallAlert): Promise<{ success: boolean; error?: string }> {
    const client = this.getClient();
    if (!client) return { success: false, error: 'Supabase client not initialized' };
    try {
      const { error } = await client.from('penarikan_produk').upsert(
        {
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
        },
        { onConflict: 'id' }
      );
      if (error) return { success: false, error: error.message };
      return { success: true };
    } catch (e: any) {
      return { success: false, error: e?.message || String(e) };
    }
  }

  /**
   * Delete Recall from Supabase
   */
  static async deleteRecall(id: string): Promise<{ success: boolean; error?: string }> {
    const client = this.getClient();
    if (!client) return { success: false, error: 'Supabase client not initialized' };
    try {
      const { error } = await client.from('penarikan_produk').delete().eq('id', id);
      if (error) return { success: false, error: error.message };
      return { success: true };
    } catch (e: any) {
      return { success: false, error: e?.message || String(e) };
    }
  }

  /**
   * Upsert Report (Pengaduan) to Supabase
   */
  static async upsertReport(rep: Report): Promise<{ success: boolean; error?: string }> {
    const client = this.getClient();
    if (!client) return { success: false, error: 'Supabase client not initialized' };
    try {
      const { error } = await client.from('pengaduan_masyarakat').upsert(
        {
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
        },
        { onConflict: 'id' }
      );
      if (error) return { success: false, error: error.message };
      return { success: true };
    } catch (e: any) {
      return { success: false, error: e?.message || String(e) };
    }
  }

  /**
   * Delete Report from Supabase
   */
  static async deleteReport(id: string): Promise<{ success: boolean; error?: string }> {
    const client = this.getClient();
    if (!client) return { success: false, error: 'Supabase client not initialized' };
    try {
      const { error } = await client.from('pengaduan_masyarakat').delete().eq('id', id);
      if (error) return { success: false, error: error.message };
      return { success: true };
    } catch (e: any) {
      return { success: false, error: e?.message || String(e) };
    }
  }

  /**
   * Upsert User to Supabase
   */
  static async upsertUser(usr: User): Promise<{ success: boolean; error?: string }> {
    const client = this.getClient();
    if (!client) return { success: false, error: 'Supabase client not initialized' };
    try {
      const { error } = await client.from('users').upsert(
        {
          id: usr.id,
          username: usr.username,
          email: usr.email,
          password: usr.password || 'password123',
          role: usr.role,
          nama_lengkap: usr.nama_lengkap,
          nip_instansi: usr.nip_instansi || null,
          status_aktif: usr.status_aktif,
          dibuat_pada: usr.dibuat_pada,
        },
        { onConflict: 'id' }
      );
      if (error) return { success: false, error: error.message };
      return { success: true };
    } catch (e: any) {
      return { success: false, error: e?.message || String(e) };
    }
  }

  /**
   * Delete User from Supabase
   */
  static async deleteUser(id: string): Promise<{ success: boolean; error?: string }> {
    const client = this.getClient();
    if (!client) return { success: false, error: 'Supabase client not initialized' };
    try {
      const { error } = await client.from('users').delete().eq('id', id);
      if (error) return { success: false, error: error.message };
      return { success: true };
    } catch (e: any) {
      return { success: false, error: e?.message || String(e) };
    }
  }

  /**
   * Upsert Custom Page (CMS) to Supabase
   */
  static async upsertCustomPage(page: CustomPage): Promise<{ success: boolean; error?: string }> {
    const client = this.getClient();
    if (!client) return { success: false, error: 'Supabase client not initialized' };
    try {
      const { error } = await client.from('halaman_kustom').upsert(
        {
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
        },
        { onConflict: 'id' }
      );
      if (error) return { success: false, error: error.message };
      return { success: true };
    } catch (e: any) {
      return { success: false, error: e?.message || String(e) };
    }
  }

  /**
   * Delete Custom Page from Supabase
   */
  static async deleteCustomPage(id: string): Promise<{ success: boolean; error?: string }> {
    const client = this.getClient();
    if (!client) return { success: false, error: 'Supabase client not initialized' };
    try {
      const { error } = await client.from('halaman_kustom').delete().eq('id', id);
      if (error) return { success: false, error: error.message };
      return { success: true };
    } catch (e: any) {
      return { success: false, error: e?.message || String(e) };
    }
  }

  /**
   * Save Website Settings to Supabase
   */
  static async saveWebsiteSettings(settings: WebsiteSettings): Promise<{ success: boolean; error?: string }> {
    const client = this.getClient();
    if (!client) return { success: false, error: 'Supabase client not initialized' };
    try {
      const payload = {
        id: 'default_settings',
        nama_website: settings.nama_website,
        singkatan_portal: settings.singkatan_portal,
        tagline: settings.tagline,
        deskripsi: settings.deskripsi,
        deskripsi_singkat: settings.deskripsi_singkat || null,
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
      if (error) return { success: false, error: error.message };
      return { success: true };
    } catch (e: any) {
      return { success: false, error: e?.message || String(e) };
    }
  }

  /**
   * Sync all local data into Supabase (Push all 9 entities)
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
        for (const c of categories) {
          await this.upsertCategory(c);
        }
        stats['kategori'] = categories.length;
      }

      // 2. Produsen
      onProgress?.('Mengunggah data Produsen ke Supabase...');
      const producers = StorageService.getProducers();
      if (producers.length > 0) {
        for (const p of producers) {
          await this.upsertProducer(p);
        }
        stats['produsen'] = producers.length;
      }

      // 3. Produk
      onProgress?.('Mengunggah data Produk & NIE ke Supabase...');
      const products = StorageService.getProducts();
      if (products.length > 0) {
        for (const p of products) {
          await this.upsertProduct(p);
        }
        stats['produk'] = products.length;
      }

      // 4. Uji Laboratorium
      onProgress?.('Mengunggah Hasil Uji Laboratorium ke Supabase...');
      const labResults = StorageService.getLabResults();
      if (labResults.length > 0) {
        for (const l of labResults) {
          await this.upsertLabResult(l);
        }
        stats['uji_laborat'] = labResults.length;
      }

      // 5. Penarikan Produk
      onProgress?.('Mengunggah Peringatan Penarikan Produk ke Supabase...');
      const recalls = StorageService.getRecalls();
      if (recalls.length > 0) {
        for (const r of recalls) {
          await this.upsertRecall(r);
        }
        stats['penarikan_produk'] = recalls.length;
      }

      // 6. Pengaduan Masyarakat
      onProgress?.('Mengunggah Pengaduan Masyarakat ke Supabase...');
      const reports = StorageService.getReports();
      if (reports.length > 0) {
        for (const rep of reports) {
          await this.upsertReport(rep);
        }
        stats['pengaduan'] = reports.length;
      }

      // 7. Users
      onProgress?.('Mengunggah Akun Pengguna ke Supabase...');
      const users = StorageService.getUsers();
      if (users.length > 0) {
        for (const u of users) {
          await this.upsertUser(u);
        }
        stats['users'] = users.length;
      }

      // 8. Halaman Kustom (CMS)
      onProgress?.('Mengunggah Halaman CMS ke Supabase...');
      const pages = StorageService.getCustomPages();
      if (pages.length > 0) {
        for (const pg of pages) {
          await this.upsertCustomPage(pg);
        }
        stats['halaman_kustom'] = pages.length;
      }

      // 9. Pengaturan Website
      onProgress?.('Mengunggah Pengaturan Website ke Supabase...');
      const settings = StorageService.getSettings();
      await this.saveWebsiteSettings(settings);
      stats['pengaturan_website'] = 1;

      // Update last sync time
      const currConfig = StorageService.getConfig();
      StorageService.saveConfig({
        ...currConfig,
        backend_mode: 'supabase',
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
    const result = await this.fetchAllFromSupabase();
    if (!result.isAvailable) {
      return {
        success: false,
        message: 'Gagal terhubung ke database Supabase Cloud.',
      };
    }

    const counts: Record<string, number> = {};

    if (result.products && result.products.length > 0) {
      StorageService.saveProductsLocalOnly(result.products);
      counts['produk'] = result.products.length;
    }
    if (result.categories && result.categories.length > 0) {
      StorageService.saveCategoriesLocalOnly(result.categories);
      counts['kategori'] = result.categories.length;
    }
    if (result.producers && result.producers.length > 0) {
      StorageService.saveProducersLocalOnly(result.producers);
      counts['produsen'] = result.producers.length;
    }
    if (result.labResults && result.labResults.length > 0) {
      StorageService.saveLabResultsLocalOnly(result.labResults);
      counts['uji_laborat'] = result.labResults.length;
    }
    if (result.recalls && result.recalls.length > 0) {
      StorageService.saveRecallsLocalOnly(result.recalls);
      counts['penarikan'] = result.recalls.length;
    }
    if (result.reports && result.reports.length > 0) {
      StorageService.saveReportsLocalOnly(result.reports);
      counts['pengaduan'] = result.reports.length;
    }
    if (result.users && result.users.length > 0) {
      StorageService.saveUsersLocalOnly(result.users);
      counts['users'] = result.users.length;
    }
    if (result.customPages && result.customPages.length > 0) {
      StorageService.saveCustomPagesLocalOnly(result.customPages);
      counts['halaman'] = result.customPages.length;
    }
    if (result.settings) {
      StorageService.saveWebsiteSettingsLocalOnly(result.settings);
      counts['pengaturan'] = 1;
    }

    const currConfig = StorageService.getConfig();
    StorageService.saveConfig({
      ...currConfig,
      backend_mode: 'supabase',
      is_connected: true,
      last_sync: new Date().toLocaleString('id-ID'),
    });

    return {
      success: true,
      message: 'Data berhasil ditarik dari database Supabase Cloud ke aplikasi!',
      counts,
    };
  }

  /**
   * Auto seed initial data to Supabase if database is empty on first setup
   */
  static async autoSeedIfEmpty(): Promise<boolean> {
    const client = this.getClient();
    if (!client) return false;

    try {
      const { count, error } = await client
        .from('produk')
        .select('id', { count: 'exact', head: true });

      if (error) {
        // Table does not exist or error
        return false;
      }

      if (count === 0) {
        console.log('[Supabase AutoSeed] Tabel produk kosong di Supabase. Memulai seed data awal...');
        await this.syncAllToSupabase();
        return true;
      }
      return false;
    } catch (e) {
      return false;
    }
  }

  // Compatibility helpers
  static async syncProduct(product: Product): Promise<boolean> {
    const res = await this.upsertProduct(product);
    return res.success;
  }
}
