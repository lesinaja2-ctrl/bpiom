export type ProductCategory = 
  | 'Obat' 
  | 'Kosmetik' 
  | 'Makanan & Minuman' 
  | 'Obat Tradisional' 
  | 'Suplemen Kesehatan';

export type RegistrationStatus = 
  | 'Aktif' 
  | 'Ditarik' 
  | 'Kedaluwarsa' 
  | 'Proses Perpanjangan';

export type LabTestStatus = 
  | 'Lulus' 
  | 'Peringatan' 
  | 'Dalam Pengujian' 
  | 'Tidak Memenuhi Syarat';

export type UserRole = 'Admin' | 'Petugas Lab' | 'Pengawas' | 'Masyarakat';

export interface ProductCharacteristicsDetail {
  bentuk_fisik?: string; // Karakteristik fisik/sediaan (contoh: Kaplet salut selaput, Cairan kental, Krim)
  warna?: string;        // Warna (contoh: Putih keabuan, Bening, Merah muda)
  kemasan?: string;      // Kemasan (contoh: Dus, 10 strip @ 10 kaplet, Botol 60 ml)
  netto?: string;        // Netto / Bobot / Isi Bersih (contoh: 500 mg, 60 ml, 30 kapsul)
  aroma?: string;        // Aroma / Rasa (contoh: Tanpa bau, Khas rempah, Rasa stroberi)
  penyimpanan?: string;  // Suhu & Kondisi Penyimpanan (contoh: Suhu di bawah 30°C, terlindung dari cahaya)
  umur_simpan?: string;  // Umur Simpan (contoh: 24 Bulan / 2 Tahun)
  nilai_ph?: string;     // Nilai / Rentang Derajat Keasaman (pH) - Wajib untuk Sediaan Cair
}

export interface Product {
  id: string;
  nama_produk: string;
  nomor_izin: string; // e.g. NA18210100123, MD224510001002, DKL1234567890A1, TR193325121, SD123456789
  kategori: ProductCategory;
  produsen_id: string;
  nama_produsen: string;
  bentuk_sediaan: string; // e.g. Krim, Tablet, Sirup, Serbuk, Kapsul, Cairan Oral
  merk: string;
  deskripsi: string;
  karakteristik: string; // aroma, warna, kemasan, kondisi penyimpanan
  karakteristik_detail?: ProductCharacteristicsDetail;
  komposisi: string;
  indikasi?: string;
  aturan_pakai?: string;
  kontraindikasi?: string;
  penanggung_jawab?: string;
  status_registrasi: RegistrationStatus;
  tanggal_terbit: string;
  tanggal_kedaluwarsa: string;
  qr_code_hash: string;
  foto_url: string;
  status_uji_lab: LabTestStatus;
  batch_nomor: string;
  drive_file_id?: string;
  drive_file_url?: string;
  barcode: string;
}

export interface Category {
  id: string;
  kode: string;
  nama: ProductCategory;
  deskripsi: string;
  awalan_izin: string[]; // e.g. ["NA", "NC", "ND"] for cosmetics, ["MD", "ML"] for food
  total_produk: number;
}

export interface Producer {
  id: string;
  nama_pt: string;
  nomor_izin_industri: string;
  kategori_industri: string;
  sertifikasi: string[]; // CPOB, CPKB, CPPOB, Halal, ISO 22000
  alamat: string;
  kota: string;
  provinsi: string;
  kontak_telepon: string;
  email: string;
  status_audit: 'Terverifikasi' | 'Dalam Pembinaan' | 'Dibekukan';
  tahun_berdiri: number;
}

export interface LabParameter {
  parameter: string;
  standar: string;
  hasil: string;
  status: 'Memenuhi Syarat' | 'Tidak Memenuhi Syarat';
}

export interface LabResult {
  id: string;
  product_id: string;
  nomor_uji: string; // e.g. LAB-BPOM/2026/0892
  nama_produk: string;
  nomor_izin: string;
  tanggal_uji: string;
  laboratorium_penguji: string;
  parameter_uji: LabParameter[];
  kesimpulan: 'MS' | 'TMS'; // Memenuhi Syarat / Tidak Memenuhi Syarat
  penguji_nama: string;
  catatan: string;
  sertifikat_drive_url?: string;
}

export interface RecallAlert {
  id: string;
  product_id: string;
  nama_produk: string;
  nomor_izin: string;
  nomor_batch: string;
  tanggal_penarikan: string;
  bahaya_kesehatan: string;
  tingkat_bahaya: 'Tingkat I (Kritis)' | 'Tingkat II (Sedang)' | 'Tingkat III (Ringan)';
  tindakan_rekomendasi: string;
  status: 'Aktif' | 'Selesai';
}

export interface HazardousSubstance {
  nama: string;
  alias: string[];
  kategori_bahaya: 'Dilarang Keras' | 'Batasan Ketat' | 'Alergen Berisiko' | 'Karsinogenik';
  dampak_kesehatan: string;
  aturan_regulasi: string;
}

export interface Report {
  id: string;
  ticket_number: string; // e.g. RPT-2026-9182
  nama_pelapor: string;
  kontak_pelapor: string;
  nama_produk: string;
  nomor_izin_tertera: string;
  nomor_batch: string;
  lokasi_pembelian: string;
  tanggal_kejadian: string;
  indikasi_bahaya: string;
  efek_samping: string;
  foto_bukti_url?: string;
  drive_file_id?: string;
  tanggal_lapor: string;
  status: 'Menunggu Verifikasi' | 'Investigasi Lapangan' | 'Uji Sampel Lab' | 'Tindak Lanjut / Selesai' | 'Ditolak';
  tanggapan_petugas?: string;
}

export interface User {
  id: string;
  username: string;
  email: string;
  password?: string;
  role: UserRole;
  nama_lengkap: string;
  nip_instansi?: string;
  status_aktif: boolean;
  dibuat_pada: string;
  terakhir_login?: string;
}

export interface AppConfig {
  backend_mode: 'local' | 'googlesheets' | 'supabase';
  google_sheets_id: string;
  google_script_url: string;
  google_drive_folder_id: string;
  supabase_url: string;
  supabase_anon_key: string;
  is_connected: boolean;
  last_sync?: string;
}

export type ThemeColor = 'sky' | 'emerald' | 'navy' | 'slate' | 'indigo' | 'amber';

export interface WebsiteSettings {
  nama_website: string;
  singkatan_portal: string;
  tagline: string;
  deskripsi: string;
  deskripsi_singkat?: string;
  logo_url?: string;
  logo_tipe: 'default_bpom' | 'custom_url';
  tema_warna: ThemeColor;
  running_text: string;
  tampilkan_running_text: boolean;
  telepon_layanan: string;
  whatsapp_layanan: string;
  email_resmi: string;
  alamat_kantor: string;
  jam_operasional: string;
  teks_footer: string;
  status_portal: 'aktif' | 'pemeliharaan' | 'pengumuman_khusus';
}

export interface CustomPage {
  id: string;
  judul: string;
  slug: string; // e.g. "profil", "regulasi", "faq"
  ringkasan: string;
  kategori: 'Informasi Publik' | 'Regulasi' | 'Panduan' | 'Layanan';
  konten: string; // HTML or structured content
  status: 'Publikasi' | 'Draft';
  urutan: number;
  tampilkan_di_navigasi: boolean;
  tampilkan_di_footer: boolean;
  terakhir_diperbarui: string;
  penulis: string;
}
