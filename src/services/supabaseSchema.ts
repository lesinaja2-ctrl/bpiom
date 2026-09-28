/**
 * SKRIP SQL DATABASE SUPABASE (POSTGRESQL)
 * Badan Pengolahan Informasi Obat dan Makanan (BPIOM)
 * 
 * Panduan Penggunaan:
 * 1. Buka dashboard https://supabase.com dan buka Project Anda.
 * 2. Buka menu 'SQL Editor' -> klik 'New query'.
 * 3. Tempelkan seluruh kode SQL ini lalu klik 'Run' (Ctrl+Enter).
 * 4. Buka menu 'Project Settings' -> 'API' untuk mendapatkan:
 *    - Project URL
 *    - Anon Public API Key
 * 5. Masukkan ke panel Integrasi Supabase di /administrasi atau set env:
 *    VITE_SUPABASE_URL="https://xxx.supabase.co"
 *    VITE_SUPABASE_ANON_KEY="ey..."
 */

export const SUPABASE_SQL_SCHEMA = `-- 1. AKTIFKAN EXTENSION UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. TABEL KATEGORI
CREATE TABLE IF NOT EXISTS kategori (
  id TEXT PRIMARY KEY,
  kode VARCHAR(50) NOT NULL UNIQUE,
  nama VARCHAR(100) NOT NULL,
  deskripsi TEXT,
  awalan_izin TEXT[] DEFAULT '{}',
  total_produk INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. TABEL PRODUSEN
CREATE TABLE IF NOT EXISTS produsen (
  id TEXT PRIMARY KEY,
  nama_pt VARCHAR(255) NOT NULL,
  nomor_izin_industri VARCHAR(100) NOT NULL,
  kategori_industri VARCHAR(150),
  sertifikasi TEXT[] DEFAULT '{}',
  alamat TEXT,
  kota VARCHAR(100),
  provinsi VARCHAR(100),
  kontak_telepon VARCHAR(50),
  email VARCHAR(150),
  status_audit VARCHAR(50) DEFAULT 'Terverifikasi',
  tahun_berdiri INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. TABEL PRODUK
CREATE TABLE IF NOT EXISTS produk (
  id TEXT PRIMARY KEY,
  nama_produk VARCHAR(255) NOT NULL,
  nomor_izin VARCHAR(100) NOT NULL UNIQUE,
  kategori VARCHAR(100) NOT NULL,
  produsen_id TEXT REFERENCES produsen(id) ON DELETE SET NULL,
  nama_produsen VARCHAR(255),
  bentuk_sediaan VARCHAR(100),
  merk VARCHAR(150),
  deskripsi TEXT,
  karakteristik TEXT,
  karakteristik_detail JSONB DEFAULT '{}'::jsonb,
  komposisi TEXT,
  indikasi TEXT,
  aturan_pakai TEXT,
  kontraindikasi TEXT,
  penanggung_jawab TEXT,
  status_registrasi VARCHAR(50) DEFAULT 'Aktif',
  tanggal_terbit DATE,
  tanggal_kedaluwarsa DATE,
  qr_code_hash TEXT,
  foto_url TEXT,
  status_uji_lab VARCHAR(50) DEFAULT 'Lulus',
  batch_nomor VARCHAR(100),
  barcode VARCHAR(100),
  drive_file_url TEXT,
  drive_file_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Pastikan kolom baru tersedia bila tabel sudah dibuat sebelumnya
ALTER TABLE IF EXISTS produk ADD COLUMN IF NOT EXISTS indikasi TEXT;
ALTER TABLE IF EXISTS produk ADD COLUMN IF NOT EXISTS aturan_pakai TEXT;
ALTER TABLE IF EXISTS produk ADD COLUMN IF NOT EXISTS kontraindikasi TEXT;
ALTER TABLE IF EXISTS produk ADD COLUMN IF NOT EXISTS penanggung_jawab TEXT;
ALTER TABLE IF EXISTS produk ADD COLUMN IF NOT EXISTS drive_file_id TEXT;
ALTER TABLE IF EXISTS produk ADD COLUMN IF NOT EXISTS karakteristik_detail JSONB DEFAULT '{}'::jsonb;

-- 5. TABEL UJI LABORATORIUM
CREATE TABLE IF NOT EXISTS uji_laborat (
  id TEXT PRIMARY KEY,
  product_id TEXT REFERENCES produk(id) ON DELETE CASCADE,
  nomor_uji VARCHAR(100) NOT NULL UNIQUE,
  nama_produk VARCHAR(255) NOT NULL,
  nomor_izin VARCHAR(100),
  tanggal_uji DATE NOT NULL,
  laboratorium_penguji VARCHAR(255) NOT NULL,
  parameter_uji JSONB DEFAULT '[]'::jsonb,
  kesimpulan VARCHAR(10) DEFAULT 'MS',
  penguji_nama VARCHAR(150),
  catatan TEXT,
  sertifikat_drive_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. TABEL PENARIKAN PRODUK (RECALL ALERT)
CREATE TABLE IF NOT EXISTS penarikan_produk (
  id TEXT PRIMARY KEY,
  product_id TEXT,
  nama_produk VARCHAR(255) NOT NULL,
  nomor_izin VARCHAR(100),
  nomor_batch VARCHAR(100),
  tanggal_penarikan DATE NOT NULL,
  bahaya_kesehatan TEXT NOT NULL,
  tingkat_bahaya VARCHAR(50) DEFAULT 'Tingkat I (Kritis)',
  tindakan_rekomendasi TEXT,
  status VARCHAR(20) DEFAULT 'Aktif',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. TABEL PENGADUAN MASYARAKAT
CREATE TABLE IF NOT EXISTS pengaduan_masyarakat (
  id TEXT PRIMARY KEY,
  ticket_number VARCHAR(50) NOT NULL UNIQUE,
  nama_pelapor VARCHAR(150) NOT NULL,
  kontak_pelapor VARCHAR(100) NOT NULL,
  nama_produk VARCHAR(255) NOT NULL,
  nomor_izin_tertera VARCHAR(100),
  nomor_batch VARCHAR(100),
  lokasi_pembelian TEXT,
  tanggal_kejadian DATE,
  indikasi_bahaya TEXT NOT NULL,
  efek_samping TEXT,
  foto_bukti_url TEXT,
  drive_file_id TEXT,
  tanggal_lapor DATE DEFAULT CURRENT_DATE,
  status VARCHAR(50) DEFAULT 'Menunggu Verifikasi',
  tanggapan_petugas TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. TABEL USERS & OTENTIKASI
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  username VARCHAR(100) NOT NULL UNIQUE,
  email VARCHAR(150) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL DEFAULT 'Masyarakat',
  nama_lengkap VARCHAR(200) NOT NULL,
  nip_instansi VARCHAR(100),
  status_aktif BOOLEAN DEFAULT true,
  dibuat_pada TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  terakhir_login TIMESTAMP WITH TIME ZONE
);

-- 9. TABEL HALAMAN KUSTOM (CMS)
CREATE TABLE IF NOT EXISTS halaman_kustom (
  id TEXT PRIMARY KEY,
  judul VARCHAR(255) NOT NULL,
  slug VARCHAR(150) NOT NULL UNIQUE,
  ringkasan TEXT,
  kategori VARCHAR(100) DEFAULT 'Informasi Publik',
  konten TEXT NOT NULL,
  status VARCHAR(50) DEFAULT 'Publikasi',
  urutan INTEGER DEFAULT 1,
  tampilkan_di_navigasi BOOLEAN DEFAULT true,
  tampilkan_di_footer BOOLEAN DEFAULT true,
  terakhir_diperbarui DATE DEFAULT CURRENT_DATE,
  penulis VARCHAR(150),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 10. TABEL PENGATURAN WEBSITE & BRANDING
CREATE TABLE IF NOT EXISTS pengaturan_website (
  id VARCHAR(50) PRIMARY KEY DEFAULT 'default_settings',
  nama_website VARCHAR(255) NOT NULL,
  singkatan_portal VARCHAR(50) NOT NULL,
  tagline TEXT,
  deskripsi TEXT,
  deskripsi_singkat TEXT,
  logo_url TEXT,
  logo_tipe VARCHAR(50) DEFAULT 'default_bpom',
  tema_warna VARCHAR(50) DEFAULT 'sky',
  running_text TEXT,
  tampilkan_running_text BOOLEAN DEFAULT true,
  telepon_layanan VARCHAR(50),
  whatsapp_layanan VARCHAR(50),
  email_resmi VARCHAR(150),
  alamat_kantor TEXT,
  jam_operasional TEXT,
  teks_footer TEXT,
  status_portal VARCHAR(50) DEFAULT 'aktif',
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- AKTIFKAN RLS (ROW LEVEL SECURITY)
ALTER TABLE produk ENABLE ROW LEVEL SECURITY;
ALTER TABLE kategori ENABLE ROW LEVEL SECURITY;
ALTER TABLE produsen ENABLE ROW LEVEL SECURITY;
ALTER TABLE uji_laborat ENABLE ROW LEVEL SECURITY;
ALTER TABLE penarikan_produk ENABLE ROW LEVEL SECURITY;
ALTER TABLE pengaduan_masyarakat ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE halaman_kustom ENABLE ROW LEVEL SECURITY;
ALTER TABLE pengaturan_website ENABLE ROW LEVEL SECURITY;

-- POLICIES UNTUK AKSES PUBLIK & OPERASIONAL APLIKASI
DROP POLICY IF EXISTS "Publik Baca Produk" ON produk;
CREATE POLICY "Publik Baca Produk" ON produk FOR SELECT USING (true);
DROP POLICY IF EXISTS "Publik Tulis Produk" ON produk;
CREATE POLICY "Publik Tulis Produk" ON produk FOR ALL USING (true);

DROP POLICY IF EXISTS "Publik Baca Kategori" ON kategori;
CREATE POLICY "Publik Baca Kategori" ON kategori FOR SELECT USING (true);
DROP POLICY IF EXISTS "Publik Tulis Kategori" ON kategori;
CREATE POLICY "Publik Tulis Kategori" ON kategori FOR ALL USING (true);

DROP POLICY IF EXISTS "Publik Baca Produsen" ON produsen;
CREATE POLICY "Publik Baca Produsen" ON produsen FOR SELECT USING (true);
DROP POLICY IF EXISTS "Publik Tulis Produsen" ON produsen;
CREATE POLICY "Publik Tulis Produsen" ON produsen FOR ALL USING (true);

DROP POLICY IF EXISTS "Publik Baca Uji Lab" ON uji_laborat;
CREATE POLICY "Publik Baca Uji Lab" ON uji_laborat FOR SELECT USING (true);
DROP POLICY IF EXISTS "Publik Tulis Uji Lab" ON uji_laborat;
CREATE POLICY "Publik Tulis Uji Lab" ON uji_laborat FOR ALL USING (true);

DROP POLICY IF EXISTS "Publik Baca Penarikan" ON penarikan_produk;
CREATE POLICY "Publik Baca Penarikan" ON penarikan_produk FOR SELECT USING (true);
DROP POLICY IF EXISTS "Publik Tulis Penarikan" ON penarikan_produk;
CREATE POLICY "Publik Tulis Penarikan" ON penarikan_produk FOR ALL USING (true);

DROP POLICY IF EXISTS "Publik Baca Pengaduan" ON pengaduan_masyarakat;
CREATE POLICY "Publik Baca Pengaduan" ON pengaduan_masyarakat FOR SELECT USING (true);
DROP POLICY IF EXISTS "Publik Kirim Pengaduan" ON pengaduan_masyarakat;
CREATE POLICY "Publik Kirim Pengaduan" ON pengaduan_masyarakat FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Petugas Update Pengaduan" ON pengaduan_masyarakat;
CREATE POLICY "Petugas Update Pengaduan" ON pengaduan_masyarakat FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Publik Baca Halaman" ON halaman_kustom;
CREATE POLICY "Publik Baca Halaman" ON halaman_kustom FOR SELECT USING (true);
DROP POLICY IF EXISTS "Admin Tulis Halaman" ON halaman_kustom;
CREATE POLICY "Admin Tulis Halaman" ON halaman_kustom FOR ALL USING (true);

DROP POLICY IF EXISTS "Publik Baca Pengaturan" ON pengaturan_website;
CREATE POLICY "Publik Baca Pengaturan" ON pengaturan_website FOR SELECT USING (true);
DROP POLICY IF EXISTS "Admin Tulis Pengaturan" ON pengaturan_website;
CREATE POLICY "Admin Tulis Pengaturan" ON pengaturan_website FOR ALL USING (true);

DROP POLICY IF EXISTS "Admin Akses Users" ON users;
CREATE POLICY "Admin Akses Users" ON users FOR ALL USING (true);
`;
