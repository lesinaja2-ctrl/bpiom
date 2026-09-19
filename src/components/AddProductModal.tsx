import React, { useState, useRef } from 'react';
import {
  X,
  Plus,
  Upload,
  Layers,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Building,
  FileText,
  Database,
  Cloud,
} from 'lucide-react';
import { Product, ProductCategory, Producer, Category, ProductCharacteristicsDetail } from '../types';
import { StorageService } from '../services/storageService';
import { SupabaseService } from '../services/supabaseService';
import { ProductPhotoUpload } from './ProductPhotoUpload';
import { formatKarakteristik } from '../utils/productUtils';

interface AddProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: Category[];
  producers: Producer[];
  onAddProduct: (product: Product) => void;
  onAddCategory: (category: Category) => void;
  onAddProducer?: (producer: Producer) => void;
  onOpenCreatedProductPage?: (product: Product) => void;
}

export const AddProductModal: React.FC<AddProductModalProps> = ({
  isOpen,
  onClose,
  categories,
  producers,
  onAddProduct,
  onAddCategory,
  onAddProducer,
  onOpenCreatedProductPage,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'product' | 'category' | 'producer'>('product');
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Form Product
  const [formData, setFormData] = useState({
    nama_produk: '',
    nomor_izin: '',
    kategori: 'Obat' as ProductCategory,
    produsen_id: producers[0]?.id || '',
    bentuk_sediaan: 'Kaplet / Tablet',
    merk: '',
    deskripsi: '',
    karakteristik: '',
    komposisi: '',
    indikasi: '',
    aturan_pakai: '',
    kontraindikasi: '',
    penanggung_jawab: '',
    status_registrasi: 'Aktif' as Product['status_registrasi'],
    tanggal_terbit: new Date().toISOString().split('T')[0],
    tanggal_kedaluwarsa: new Date(Date.now() + 5 * 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    foto_url: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=600&auto=format&fit=crop&q=80',
    status_uji_lab: 'Lulus' as Product['status_uji_lab'],
    batch_nomor: `BN-BPOM-${Math.floor(1000 + Math.random() * 9000)}`,
    barcode: `899${Math.floor(1000000000 + Math.random() * 9000000000)}`,
    drive_file_url: '',
    drive_file_id: '',
  });

  // Karakteristik Fisik & Penyimpanan per-kolom (dengan Nilai pH untuk sediaan cair)
  const [charColumns, setCharColumns] = useState<ProductCharacteristicsDetail>({
    bentuk_fisik: '',
    warna: '',
    kemasan: '',
    netto: '',
    aroma: '',
    nilai_ph: '',
    penyimpanan: 'Suhu di bawah 30°C terlindung dari cahaya',
    umur_simpan: '24 Bulan',
  });

  // Form Category
  const [newCatName, setNewCatName] = useState('');
  const [newCatCode, setNewCatCode] = useState('');
  const [newCatDesc, setNewCatDesc] = useState('');

  // Form Producer Baru
  const [newProducerForm, setNewProducerForm] = useState({
    nama_pt: '',
    nomor_izin_industri: '',
    kategori_industri: 'Industri Farmasi',
    sertifikasi: 'CPOB, Halal BPJPH',
    alamat: '',
    kota: '',
    provinsi: 'DKI Jakarta',
    kontak_telepon: '',
    email: '',
    status_audit: 'Terverifikasi' as Producer['status_audit'],
    tahun_berdiri: 2010,
  });

  if (!isOpen) return null;

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const result = await StorageService.uploadFileToDrive(file);
      setFormData(prev => ({
        ...prev,
        foto_url: result.fileUrl,
        drive_file_url: result.fileUrl,
        drive_file_id: result.fileId,
      }));
    } catch (err) {
      console.error(err);
    } finally {
      setUploading(false);
    }
  };

  const handleSubmitProduct = (e: React.FormEvent) => {
    e.preventDefault();
    const selectedProd = producers.find(p => p.id === formData.produsen_id);
    const compiledKarakteristik = formatKarakteristik(charColumns) || formData.karakteristik || 'Sesuai spesifikasi resmi.';

    const newProd: Product = {
      id: 'prod-p-' + Date.now(),
      nama_produk: formData.nama_produk,
      nomor_izin: formData.nomor_izin,
      kategori: formData.kategori,
      produsen_id: formData.produsen_id,
      nama_produsen: selectedProd ? selectedProd.nama_pt : 'Industri Farmasi / Kosmetik Terdaftar',
      bentuk_sediaan: formData.bentuk_sediaan,
      merk: formData.merk,
      deskripsi: formData.deskripsi,
      karakteristik: compiledKarakteristik,
      karakteristik_detail: charColumns,
      komposisi: formData.komposisi,
      indikasi: formData.indikasi.trim() || undefined,
      aturan_pakai: formData.aturan_pakai.trim() || undefined,
      kontraindikasi: formData.kontraindikasi.trim() || undefined,
      penanggung_jawab: formData.penanggung_jawab.trim() || undefined,
      status_registrasi: formData.status_registrasi,
      tanggal_terbit: formData.tanggal_terbit,
      tanggal_kedaluwarsa: formData.tanggal_kedaluwarsa,
      qr_code_hash: `BPOM-SIG-${formData.nomor_izin}-${formData.tanggal_kedaluwarsa}-VERIFIED`,
      foto_url: formData.foto_url,
      status_uji_lab: formData.status_uji_lab,
      batch_nomor: formData.batch_nomor,
      barcode: formData.barcode,
      drive_file_url: formData.drive_file_url || undefined,
      drive_file_id: formData.drive_file_id || undefined,
    };

    // Pastikan tabel Supabase ada agar produk tersimpan di cloud jika Supabase aktif
    const supabaseConfig = SupabaseService.getConfigInfo();
    if (supabaseConfig.isConfigured) {
      SupabaseService.ensureProductTableExists()
        .then(() => SupabaseService.syncProduct(newProd))
        .catch((err) => {
          console.warn('Auto ensure table produk:', err);
        });
    }

    onAddProduct(newProd);
    onClose();
    if (onOpenCreatedProductPage) {
      onOpenCreatedProductPage(newProd);
    }
  };

  const handleSubmitProducer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProducerForm.nama_pt.trim()) return;

    const newProd: Producer = {
      id: 'prod-' + Date.now(),
      nama_pt: newProducerForm.nama_pt,
      nomor_izin_industri: newProducerForm.nomor_izin_industri || `I-FARM-${Date.now().toString().slice(-6)}`,
      kategori_industri: newProducerForm.kategori_industri,
      sertifikasi: newProducerForm.sertifikasi.split(',').map(s => s.trim()).filter(Boolean),
      alamat: newProducerForm.alamat || 'Alamat Pabrik Terdaftar',
      kota: newProducerForm.kota || 'Jakarta',
      provinsi: newProducerForm.provinsi || 'DKI Jakarta',
      kontak_telepon: newProducerForm.kontak_telepon || '021-5000100',
      email: newProducerForm.email || 'info@industrifarmasi.co.id',
      status_audit: newProducerForm.status_audit,
      tahun_berdiri: Number(newProducerForm.tahun_berdiri) || 2015,
    };

    if (onAddProducer) {
      onAddProducer(newProd);
    }
    setFormData(prev => ({ ...prev, produsen_id: newProd.id }));
    setNewProducerForm({
      nama_pt: '',
      nomor_izin_industri: '',
      kategori_industri: 'Industri Farmasi',
      sertifikasi: 'CPOB, Halal BPJPH',
      alamat: '',
      kota: '',
      provinsi: 'DKI Jakarta',
      kontak_telepon: '',
      email: '',
      status_audit: 'Terverifikasi',
      tahun_berdiri: 2010,
    });
    setActiveSubTab('product');
  };

  const handleSubmitCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;

    const newCategory: Category = {
      id: 'cat-' + Date.now(),
      kode: newCatCode.toUpperCase() || 'NEW-CAT',
      nama: newCatName as any,
      deskripsi: newCatDesc || 'Kategori produk terdaftar',
      awalan_izin: ['REG'],
      total_produk: 0,
    };

    onAddCategory(newCategory);
    setNewCatName('');
    setNewCatCode('');
    setNewCatDesc('');
    setActiveSubTab('product');
  };

  const isLiquid = /cair|sirup|syrup|suspensi|emulsi|larutan|drops|tetes|serum|uht|minuman|liquid/i.test(
    `${formData.bentuk_sediaan} ${formData.nama_produk} ${formData.kategori}`
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[92vh] overflow-hidden flex flex-col shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-sky-900 to-indigo-950 text-white p-5 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-lg leading-tight">
              {activeSubTab === 'product'
                ? 'Tambah Produk Baru ke Database'
                : activeSubTab === 'producer'
                ? 'Pendaftaran Produsen & Industri Berizin'
                : 'Tambah Kategori Produk'}
            </h3>
            <p className="text-xs text-sky-100">
              Registrasi nomor izin edar resmi, spesifikasi mutu teknis, pH sediaan cair, dan berkas sertifikasi
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/25 flex items-center justify-center text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switch */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-6 pt-3 text-xs font-bold gap-2">
          <button
            type="button"
            onClick={() => setActiveSubTab('product')}
            className={`pb-2.5 px-3 border-b-2 transition-colors ${
              activeSubTab === 'product'
                ? 'border-sky-700 text-sky-800'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Formulir Produk
          </button>
          <button
            type="button"
            onClick={() => setActiveSubTab('producer')}
            className={`pb-2.5 px-3 border-b-2 transition-colors flex items-center gap-1.5 ${
              activeSubTab === 'producer'
                ? 'border-sky-700 text-sky-800'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Tambah Produsen Terdaftar</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveSubTab('category')}
            className={`pb-2.5 px-3 border-b-2 transition-colors ${
              activeSubTab === 'category'
                ? 'border-sky-700 text-sky-800'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Tambah Kategori Produk
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6 overflow-y-auto space-y-4 text-xs">
          {activeSubTab === 'product' ? (
            <form onSubmit={handleSubmitProduct} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Nama Lengkap Produk *</label>
                  <input
                    type="text"
                    value={formData.nama_produk}
                    onChange={(e) => setFormData({ ...formData, nama_produk: e.target.value })}
                    placeholder="Contoh: Amoxicillin 500mg Kapsul"
                    className="w-full p-2.5 border border-slate-300 rounded-lg font-medium focus:ring-2 focus:ring-sky-500"
                    required
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Nomor Izin Edar (NIE BPOM) *</label>
                  <input
                    type="text"
                    value={formData.nomor_izin}
                    onChange={(e) => setFormData({ ...formData, nomor_izin: e.target.value.toUpperCase() })}
                    placeholder="Contoh: DKL2304599901A1 / NA182..."
                    className="w-full p-2.5 border border-slate-300 rounded-lg font-mono font-bold focus:ring-2 focus:ring-sky-500"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Kategori Produk</label>
                  <select
                    value={formData.kategori}
                    onChange={(e) => setFormData({ ...formData, kategori: e.target.value as any })}
                    className="w-full p-2.5 border border-slate-300 rounded-lg bg-white font-medium focus:ring-2 focus:ring-sky-500"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.nama}>
                        {c.nama}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Merk Dagang</label>
                  <input
                    type="text"
                    value={formData.merk}
                    onChange={(e) => setFormData({ ...formData, merk: e.target.value })}
                    placeholder="Contoh: BioFarma Med"
                    className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Bentuk Sediaan *</label>
                  <input
                    type="text"
                    value={formData.bentuk_sediaan}
                    onChange={(e) => setFormData({ ...formData, bentuk_sediaan: e.target.value })}
                    placeholder="Kaplet / Sirup / Suspensi / Serum / Larutan"
                    className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="font-bold text-slate-700 block">Produsen Terdaftar</label>
                    <button
                      type="button"
                      onClick={() => setActiveSubTab('producer')}
                      className="text-[11px] text-sky-700 hover:text-sky-900 font-bold flex items-center gap-1"
                    >
                      <Plus className="w-3 h-3" /> Tambah Produsen Baru
                    </button>
                  </div>
                  <select
                    value={formData.produsen_id}
                    onChange={(e) => setFormData({ ...formData, produsen_id: e.target.value })}
                    className="w-full p-2.5 border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-sky-500"
                  >
                    {producers.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.nama_pt} ({p.kota})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Status Registrasi</label>
                  <select
                    value={formData.status_registrasi}
                    onChange={(e) => setFormData({ ...formData, status_registrasi: e.target.value as any })}
                    className="w-full p-2.5 border border-slate-300 rounded-lg bg-white font-bold focus:ring-2 focus:ring-sky-500"
                  >
                    <option value="Aktif">Aktif (Berlaku)</option>
                    <option value="Proses Perpanjangan">Proses Perpanjangan</option>
                    <option value="Kedaluwarsa">Kedaluwarsa</option>
                    <option value="Ditarik">Ditarik Dari Peredaran</option>
                  </select>
                </div>
              </div>

              {/* Deskripsi Lengkap Produk */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-slate-700 flex items-center gap-1.5 text-xs">
                    <FileText className="w-3.5 h-3.5 text-sky-700" />
                    <span>Deskripsi Produk *</span>
                  </label>
                  <span className="text-[10.5px] text-slate-400 font-normal">
                    Kegunaan klinis/umum, khasiat utama, dan legalitas edar resmi
                  </span>
                </div>
                <textarea
                  value={formData.deskripsi}
                  onChange={(e) => setFormData({ ...formData, deskripsi: e.target.value })}
                  placeholder="Tuliskan deskripsi lengkap mengenai kegunaan produk, fungsi utama perizinan, dan ringkasan resmi..."
                  className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 text-xs leading-relaxed"
                  rows={3}
                  required
                />
              </div>

              {/* Karakteristik Fisik & Penyimpanan dibuat per kolom terpisah */}
              <div className="bg-slate-50/90 p-4 rounded-xl border border-slate-200 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <label className="font-bold text-slate-800 text-xs flex items-center gap-1.5 uppercase tracking-wide">
                    <Layers className="w-4 h-4 text-sky-700" />
                    Karakteristik Fisik & Penyimpanan (Per Kolom)
                  </label>
                  {isLiquid ? (
                    <span className="text-[10px] bg-sky-700 text-white font-bold px-2 py-0.5 rounded-full flex items-center gap-1 animate-pulse">
                      💧 Sediaan Cair: Nilai pH Wajib Diisi
                    </span>
                  ) : (
                    <span className="text-[10px] bg-sky-100 text-sky-800 font-semibold px-2 py-0.5 rounded-full">
                      Standar Pengujian Mutu Farmakope
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                  {/* Kolom 1: Karakteristik Fisik */}
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-700 block">
                      Bentuk Fisik:
                    </label>
                    <input
                      type="text"
                      value={charColumns.bentuk_fisik || ''}
                      onChange={(e) => setCharColumns({ ...charColumns, bentuk_fisik: e.target.value })}
                      placeholder="Contoh: Kaplet / Sirup"
                      className="w-full p-2 bg-white border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-sky-500"
                    />
                  </div>

                  {/* Kolom 2: Warna */}
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-700 block">
                      Warna:
                    </label>
                    <input
                      type="text"
                      value={charColumns.warna || ''}
                      onChange={(e) => setCharColumns({ ...charColumns, warna: e.target.value })}
                      placeholder="Contoh: Putih keabuan / Kuning jernih"
                      className="w-full p-2 bg-white border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-sky-500"
                    />
                  </div>

                  {/* Kolom 3: Kemasan */}
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-700 block">
                      Kemasan:
                    </label>
                    <input
                      type="text"
                      value={charColumns.kemasan || ''}
                      onChange={(e) => setCharColumns({ ...charColumns, kemasan: e.target.value })}
                      placeholder="Contoh: Dus, Botol kaca 60 ml"
                      className="w-full p-2 bg-white border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-sky-500"
                    />
                  </div>

                  {/* Kolom 4: Netto */}
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-700 block">
                      Netto / Bobot:
                    </label>
                    <input
                      type="text"
                      value={charColumns.netto || ''}
                      onChange={(e) => setCharColumns({ ...charColumns, netto: e.target.value })}
                      placeholder="Contoh: 60 ml / 500 mg"
                      className="w-full p-2 bg-white border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-sky-500"
                    />
                  </div>

                  {/* Kolom 5: Nilai pH (Spesial untuk Sediaan Cair) */}
                  <div className={`space-y-1 p-2 rounded-lg transition-all ${
                    isLiquid
                      ? 'bg-sky-50 border-2 border-sky-400 ring-1 ring-sky-300'
                      : 'bg-white border border-slate-200'
                  }`}>
                    <div className="flex items-center justify-between">
                      <label className="text-[11px] font-bold text-slate-800 block">
                        Nilai pH:
                      </label>
                      {isLiquid && (
                        <span className="text-[9px] bg-sky-700 text-white font-black px-1.5 py-0.2 rounded">
                          WAJIB CAIR
                        </span>
                      )}
                    </div>
                    <input
                      type="text"
                      value={charColumns.nilai_ph || ''}
                      onChange={(e) => setCharColumns({ ...charColumns, nilai_ph: e.target.value })}
                      placeholder={isLiquid ? 'Contoh: pH 5.0 - 6.5' : 'Contoh: pH 5.5'}
                      className={`w-full p-1.5 bg-white border rounded-lg text-xs font-mono font-bold focus:ring-2 focus:ring-sky-500 ${
                        isLiquid && !charColumns.nilai_ph ? 'border-amber-400 bg-amber-50/50' : 'border-slate-300'
                      }`}
                    />
                  </div>

                  {/* Kolom 6: Aroma & Rasa */}
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-700 block">
                      Aroma & Rasa:
                    </label>
                    <input
                      type="text"
                      value={charColumns.aroma || ''}
                      onChange={(e) => setCharColumns({ ...charColumns, aroma: e.target.value })}
                      placeholder="Contoh: Khas farmasi / Jeruk"
                      className="w-full p-2 bg-white border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-sky-500"
                    />
                  </div>

                  {/* Kolom 7: Masa Simpan */}
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-700 block">
                      Masa Simpan:
                    </label>
                    <input
                      type="text"
                      value={charColumns.umur_simpan || ''}
                      onChange={(e) => setCharColumns({ ...charColumns, umur_simpan: e.target.value })}
                      placeholder="Contoh: 24 Bulan / 2 Tahun"
                      className="w-full p-2 bg-white border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-sky-500"
                    />
                  </div>

                  {/* Kolom 8: Suhu & Kondisi Penyimpanan */}
                  <div className="space-y-1 sm:col-span-2 md:col-span-1">
                    <label className="text-[11px] font-bold text-slate-700 block">
                      Penyimpanan:
                    </label>
                    <input
                      type="text"
                      value={charColumns.penyimpanan || ''}
                      onChange={(e) => setCharColumns({ ...charColumns, penyimpanan: e.target.value })}
                      placeholder="Suhu di bawah 30°C terlindung dari cahaya"
                      className="w-full p-2 bg-white border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-sky-500"
                    />
                  </div>
                </div>

                {/* Pratinjau susunan teks karakteristik */}
                <div className="bg-white p-2.5 rounded-lg border border-slate-200 text-[11px] text-slate-600 flex items-start gap-2">
                  <span className="font-bold text-slate-800 shrink-0">Format Ringkasan Dokumen:</span>
                  <span className="italic font-mono text-[10.5px] text-sky-950 break-all">
                    {formatKarakteristik(charColumns) || '(Kolom belum diisi)'}
                  </span>
                </div>
              </div>

              {/* Komposisi Formula Bahan & Zat Aktif */}
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Komposisi Formula Bahan (Zat Aktif & Eksipien) *
                </label>
                <textarea
                  value={formData.komposisi}
                  onChange={(e) => setFormData({ ...formData, komposisi: e.target.value })}
                  placeholder="Daftar formula lengkap (misal: Tiap sendok takar (5 ml) mengandung: Paracetamol 250 mg, Gliserol, Sorbitol, Perisa Stroberi...)"
                  className="w-full p-2.5 border border-slate-300 rounded-lg font-mono text-xs focus:ring-2 focus:ring-sky-500"
                  rows={2}
                  required
                />
              </div>

              {/* Rincian Tambahan Sertifikat Izin Edar: Indikasi, Aturan Pakai, Kontraindikasi, Penanggung Jawab */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-50/70 p-3.5 rounded-xl border border-slate-200">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Indikasi & Khasiat Terdaftar</label>
                  <textarea
                    value={formData.indikasi}
                    onChange={(e) => setFormData({ ...formData, indikasi: e.target.value })}
                    placeholder="Meringankan rasa sakit, menurunkan demam..."
                    className="w-full p-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-sky-500"
                    rows={2}
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Aturan Pakai & Dosis (Posologi)</label>
                  <textarea
                    value={formData.aturan_pakai}
                    onChange={(e) => setFormData({ ...formData, aturan_pakai: e.target.value })}
                    placeholder="Dewasa: 1-2 kaplet 3-4 kali sehari sesudah makan..."
                    className="w-full p-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-sky-500"
                    rows={2}
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Kontraindikasi & Peringatan Khusus</label>
                  <textarea
                    value={formData.kontraindikasi}
                    onChange={(e) => setFormData({ ...formData, kontraindikasi: e.target.value })}
                    placeholder="Penderita gangguan fungsi hati berat, hipersensitif..."
                    className="w-full p-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-sky-500"
                    rows={2}
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Apoteker / Penanggung Jawab Teknis (PJT)</label>
                  <input
                    type="text"
                    value={formData.penanggung_jawab}
                    onChange={(e) => setFormData({ ...formData, penanggung_jawab: e.target.value })}
                    placeholder="apt. Budi Santoso, S.Farm (STRA: 198501...)"
                    className="w-full p-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-sky-500"
                  />
                  <span className="text-[10px] text-slate-500 mt-1 block">
                    Dicantumkan dalam dokumen resmi sertifikat izin edar BPOM RI.
                  </span>
                </div>
              </div>

              {/* Upload Foto Produk Lokal / URL Kemasan */}
              <div className="pt-1">
                <ProductPhotoUpload
                  value={formData.foto_url}
                  onChange={(url) => setFormData((prev) => ({ ...prev, foto_url: url }))}
                  label="Foto Kemasan Produk"
                  productName={formData.nama_produk || 'Produk Baru'}
                />
              </div>

              {/* Upload Foto / Dokumen ke Drive */}
              <div className="border border-dashed border-slate-300 rounded-xl p-4 bg-slate-50 text-center">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*,.pdf"
                  onChange={handleFileUpload}
                  className="hidden"
                />

                {formData.drive_file_id ? (
                  <div className="flex items-center justify-between bg-white p-3 rounded-lg border border-emerald-200">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                      <div className="text-left">
                        <span className="font-bold text-slate-800 block">Berkas Produk Tersimpan di Drive</span>
                        <span className="text-[10px] text-slate-400 font-mono">ID: {formData.drive_file_id}</span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setFormData(p => ({ ...p, drive_file_id: '', drive_file_url: '' }))}
                      className="text-red-500 font-semibold"
                    >
                      Ganti
                    </button>
                  </div>
                ) : (
                  <div>
                    <Upload className="w-6 h-6 text-slate-400 mx-auto mb-1" />
                    <div className="font-bold text-slate-700">Unggah Foto Produk / Berkas ke Google Drive</div>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Dapat berupa kemasan produk atau salinan sertifikat izin edar.
                    </p>
                    <button
                      type="button"
                      disabled={uploading}
                      onClick={() => fileInputRef.current?.click()}
                      className="mt-2 px-3 py-1.5 bg-sky-800 hover:bg-sky-900 text-white font-bold rounded-lg text-xs"
                    >
                      {uploading ? 'Mengunggah...' : 'Pilih Berkas'}
                    </button>
                  </div>
                )}
              </div>

              {/* Status Sinkronisasi Supabase Cloud */}
              <div className="p-3 bg-sky-50/70 border border-sky-200 rounded-xl flex items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-2.5">
                  <Database className="w-4 h-4 text-sky-700 shrink-0" />
                  <div>
                    <span className="font-bold text-sky-950 block">Sinkronisasi Database Cloud (Supabase)</span>
                    <p className="text-[11px] text-slate-500">
                      Kolom deskripsi dan rincian produk otomatis disimpan ke tabel 'produk' di database cloud.
                    </p>
                  </div>
                </div>
                <span className="px-2 py-0.5 bg-sky-100 text-sky-800 text-[10.5px] font-semibold rounded-full shrink-0">
                  Otomatis
                </span>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 bg-slate-100 text-slate-700 font-bold rounded-lg"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-sky-800 hover:bg-sky-900 text-white font-bold rounded-lg shadow-md"
                >
                  Simpan Produk
                </button>
              </div>
            </form>
          ) : activeSubTab === 'producer' ? (
            <form onSubmit={handleSubmitProducer} className="space-y-4">
              <div className="p-3 bg-sky-50 border border-sky-200 rounded-xl text-sky-900 text-[11px]">
                <strong>Pendaftaran Produsen / Industri Farmasi:</strong> Menambahkan produsen terdaftar ke dalam direktori industri terakreditasi CPOB/CPKB/CPPOB BPOM RI.
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Nama Perusahaan / Industri (PT/CV) *</label>
                  <input
                    type="text"
                    value={newProducerForm.nama_pt}
                    onChange={(e) => setNewProducerForm({ ...newProducerForm, nama_pt: e.target.value })}
                    placeholder="Contoh: PT Kimia Farma Tbk"
                    className="w-full p-2.5 border border-slate-300 rounded-lg font-medium"
                    required
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Nomor Izin Industri Farmasi / Usaha *</label>
                  <input
                    type="text"
                    value={newProducerForm.nomor_izin_industri}
                    onChange={(e) => setNewProducerForm({ ...newProducerForm, nomor_izin_industri: e.target.value.toUpperCase() })}
                    placeholder="Contoh: HK.02.02/IV/123/2022"
                    className="w-full p-2.5 border border-slate-300 rounded-lg font-mono"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Kategori Industri</label>
                  <select
                    value={newProducerForm.kategori_industri}
                    onChange={(e) => setNewProducerForm({ ...newProducerForm, kategori_industri: e.target.value })}
                    className="w-full p-2.5 border border-slate-300 rounded-lg bg-white font-medium"
                  >
                    <option value="Industri Farmasi">Industri Farmasi</option>
                    <option value="Industri Kosmetika Gol. A">Industri Kosmetika Gol. A</option>
                    <option value="Industri Kosmetika Gol. B">Industri Kosmetika Gol. B</option>
                    <option value="Industri Pangan Olahan">Industri Pangan Olahan</option>
                    <option value="Industri Obat Tradisional (IOT)">Industri Obat Tradisional (IOT)</option>
                    <option value="Usaha Kecil Obat Tradisional (UKOT)">Usaha Kecil Obat Tradisional (UKOT)</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Sertifikasi Mutu</label>
                  <input
                    type="text"
                    value={newProducerForm.sertifikasi}
                    onChange={(e) => setNewProducerForm({ ...newProducerForm, sertifikasi: e.target.value })}
                    placeholder="CPOB, CPKB, Halal BPJPH, ISO 9001"
                    className="w-full p-2.5 border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Status Audit</label>
                  <select
                    value={newProducerForm.status_audit}
                    onChange={(e) => setNewProducerForm({ ...newProducerForm, status_audit: e.target.value as any })}
                    className="w-full p-2.5 border border-slate-300 rounded-lg bg-white font-bold"
                  >
                    <option value="Terverifikasi">Terverifikasi (Patuh)</option>
                    <option value="Dalam Pembinaan">Dalam Pembinaan</option>
                    <option value="Dibekukan">Dibekukan</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Kota Pabrik</label>
                  <input
                    type="text"
                    value={newProducerForm.kota}
                    onChange={(e) => setNewProducerForm({ ...newProducerForm, kota: e.target.value })}
                    placeholder="Contoh: Bandung"
                    className="w-full p-2.5 border border-slate-300 rounded-lg"
                    required
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Provinsi</label>
                  <input
                    type="text"
                    value={newProducerForm.provinsi}
                    onChange={(e) => setNewProducerForm({ ...newProducerForm, provinsi: e.target.value })}
                    placeholder="Contoh: Jawa Barat"
                    className="w-full p-2.5 border border-slate-300 rounded-lg"
                    required
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Tahun Berdiri</label>
                  <input
                    type="number"
                    value={newProducerForm.tahun_berdiri}
                    onChange={(e) => setNewProducerForm({ ...newProducerForm, tahun_berdiri: Number(e.target.value) })}
                    className="w-full p-2.5 border border-slate-300 rounded-lg font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Alamat Lengkap Pabrik / Fasilitas Produksi</label>
                <textarea
                  value={newProducerForm.alamat}
                  onChange={(e) => setNewProducerForm({ ...newProducerForm, alamat: e.target.value })}
                  placeholder="Kawasan Industri, Jl. Pajajaran No. 123..."
                  className="w-full p-2.5 border border-slate-300 rounded-lg"
                  rows={2}
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Kontak Telepon</label>
                  <input
                    type="text"
                    value={newProducerForm.kontak_telepon}
                    onChange={(e) => setNewProducerForm({ ...newProducerForm, kontak_telepon: e.target.value })}
                    placeholder="Contoh: 022-1234567"
                    className="w-full p-2.5 border border-slate-300 rounded-lg font-mono"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Email Resmi</label>
                  <input
                    type="email"
                    value={newProducerForm.email}
                    onChange={(e) => setNewProducerForm({ ...newProducerForm, email: e.target.value })}
                    placeholder="Contoh: regulatory@perusahaan.co.id"
                    className="w-full p-2.5 border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setActiveSubTab('product')}
                  className="px-4 py-2 bg-slate-100 text-slate-700 font-bold rounded-lg"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-sky-900 hover:bg-sky-950 text-white font-bold rounded-lg shadow-md"
                >
                  Simpan & Pilih Produsen Ini
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleSubmitCategory} className="space-y-4">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Nama Kategori Baru</label>
                <input
                  type="text"
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  placeholder="Contoh: Alat Kesehatan & PKRT"
                  className="w-full p-2.5 border border-slate-300 rounded-lg"
                  required
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Kode Singkat Kategori</label>
                <input
                  type="text"
                  value={newCatCode}
                  onChange={(e) => setNewCatCode(e.target.value)}
                  placeholder="Contoh: ALKES"
                  className="w-full p-2.5 border border-slate-300 rounded-lg font-mono uppercase"
                  required
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Deskripsi Ruang Lingkup</label>
                <textarea
                  value={newCatDesc}
                  onChange={(e) => setNewCatDesc(e.target.value)}
                  placeholder="Deskripsi perizinan dan standar pengawasan..."
                  className="w-full p-2.5 border border-slate-300 rounded-lg"
                  rows={3}
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setActiveSubTab('product')}
                  className="px-4 py-2 bg-slate-100 text-slate-700 font-bold rounded-lg"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-700 hover:bg-indigo-800 text-white font-bold rounded-lg shadow-md"
                >
                  Tambahkan Kategori
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
