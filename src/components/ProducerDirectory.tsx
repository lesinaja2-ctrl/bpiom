import React, { useState } from 'react';
import {
  Building2,
  Search,
  CheckCircle,
  AlertCircle,
  Phone,
  Mail,
  MapPin,
  Award,
  Calendar,
  Filter,
  Plus,
  Trash2,
  Edit,
  Database,
  ExternalLink,
  Copy,
  Check,
  AlertTriangle,
  RefreshCw,
} from 'lucide-react';
import { Producer, User } from '../types';
import { SupabaseService } from '../services/supabaseService';
import { SUPABASE_SQL_SCHEMA } from '../services/supabaseSchema';

interface ProducerDirectoryProps {
  producers: Producer[];
  currentUser: User | null;
  onAddProducer: (newProd: Producer) => void;
  onUpdateProducer?: (updated: Producer) => void;
  onDeleteProducer?: (id: string) => void;
  onNavigateToAdmin?: () => void;
}

export const ProducerDirectory: React.FC<ProducerDirectoryProps> = ({
  producers,
  currentUser,
  onAddProducer,
  onUpdateProducer,
  onDeleteProducer,
  onNavigateToAdmin,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAudit, setSelectedAudit] = useState<string>('Semua');
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingProducerId, setEditingProducerId] = useState<string | null>(null);

  const [syncNotice, setSyncNotice] = useState<{
    type: 'success' | 'warning' | 'error' | 'syncing';
    message: string;
    missingTable?: boolean;
  } | null>(null);
  const [copiedSchema, setCopiedSchema] = useState(false);

  const supabaseConfig = SupabaseService.getConfigInfo();

  const [formData, setFormData] = useState({
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
    tahun_berdiri: 2000,
  });

  const filteredProducers = producers.filter((p) => {
    const matchSearch =
      p.nama_pt.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.nomor_izin_industri.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.kota.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.kategori_industri.toLowerCase().includes(searchTerm.toLowerCase());

    const matchAudit = selectedAudit === 'Semua' || p.status_audit === selectedAudit;
    return matchSearch && matchAudit;
  });

  const handleOpenAdd = () => {
    setEditingProducerId(null);
    setFormData({
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
      tahun_berdiri: new Date().getFullYear() - 10,
    });
    setIsAddOpen(true);
  };

  const handleOpenEdit = (prod: Producer) => {
    setEditingProducerId(prod.id);
    setFormData({
      nama_pt: prod.nama_pt,
      nomor_izin_industri: prod.nomor_izin_industri,
      kategori_industri: prod.kategori_industri,
      sertifikasi: prod.sertifikasi?.join(', ') || '',
      alamat: prod.alamat,
      kota: prod.kota,
      provinsi: prod.provinsi,
      kontak_telepon: prod.kontak_telepon,
      email: prod.email,
      status_audit: prod.status_audit,
      tahun_berdiri: prod.tahun_berdiri || 2000,
    });
    setIsAddOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const prodPayload: Producer = {
      id: editingProducerId || 'prod-' + Date.now(),
      nama_pt: formData.nama_pt,
      nomor_izin_industri: formData.nomor_izin_industri,
      kategori_industri: formData.kategori_industri,
      sertifikasi: formData.sertifikasi
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean),
      alamat: formData.alamat,
      kota: formData.kota,
      provinsi: formData.provinsi,
      kontak_telepon: formData.kontak_telepon,
      email: formData.email,
      status_audit: formData.status_audit,
      tahun_berdiri: Number(formData.tahun_berdiri) || 2000,
    };

    if (editingProducerId) {
      if (onUpdateProducer) {
        onUpdateProducer(prodPayload);
      }
    } else {
      onAddProducer(prodPayload);
    }
    setIsAddOpen(false);

    // Supabase Live Synchronization Feedback
    if (supabaseConfig.isConfigured) {
      setSyncNotice({
        type: 'syncing',
        message: `Menyimpan & menyinkronkan data PT ${prodPayload.nama_pt} ke Supabase...`,
      });

      try {
        const syncResult = await SupabaseService.syncProducer(prodPayload);
        if (syncResult.success) {
          setSyncNotice({
            type: 'success',
            message: `✓ Data PT ${prodPayload.nama_pt} berhasil disimpan ke database Supabase Cloud!`,
          });
          setTimeout(() => setSyncNotice(null), 4000);
        } else if (syncResult.tableMissing) {
          setSyncNotice({
            type: 'warning',
            message: `Tabel 'produsen' belum dibuat di database Supabase. Data Anda tetap tersimpan aman di aplikasi lokal. Silakan jalankan skrip SQL skema untuk mengaktifkan tabel.`,
            missingTable: true,
          });
        } else {
          setSyncNotice({
            type: 'error',
            message: `Data tersimpan secara lokal, namun gagal sinkron ke Supabase: ${syncResult.error?.message || 'Koneksi terputus'}`,
          });
        }
      } catch (err: any) {
        setSyncNotice({
          type: 'error',
          message: `Gagal sinkron ke Supabase: ${err?.message || err}`,
        });
      }
    } else {
      setSyncNotice({
        type: 'success',
        message: `✓ Data PT ${prodPayload.nama_pt} berhasil disimpan secara lokal! Konfigurasikan Supabase di Panel Admin untuk sinkronisasi cloud.`,
      });
      setTimeout(() => setSyncNotice(null), 4000);
    }
  };

  const handleDelete = async (prod: Producer) => {
    if (window.confirm(`Hapus data produsen "${prod.nama_pt}"?`)) {
      if (onDeleteProducer) {
        onDeleteProducer(prod.id);
      }
      if (supabaseConfig.isConfigured) {
        await SupabaseService.deleteProducer(prod.id);
      }
    }
  };

  const isAdmin = currentUser && currentUser.role === 'Admin';

  return (
    <div className="space-y-6">
      {/* Hero */}
      <div className="bg-gradient-to-r from-slate-900 via-sky-950 to-indigo-950 text-white p-6 sm:p-8 rounded-2xl shadow-xl border border-slate-800">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <div className="inline-flex items-center gap-2 bg-sky-500/20 border border-sky-400/30 rounded-full px-3 py-1 text-xs font-semibold text-sky-200 mb-2">
              <Building2 className="w-3.5 h-3.5 text-sky-400" />
              Direktori Industri Terakreditasi BPOM RI
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Direktori Produsen & Pabrik Berizin
            </h1>
            <p className="text-slate-300 text-xs sm:text-sm mt-1 max-w-2xl">
              Verifikasi legalitas industri farmasi, kosmetika golongan A/B, industri pangan olahan, dan industri obat tradisional yang telah memenuhi Cara Pembuatan yang Baik (CPOB/CPKB/CPPOB/CPOTB).
            </p>
          </div>

          {isAdmin && (
            <button
              onClick={handleOpenAdd}
              className="bg-sky-700 hover:bg-sky-600 text-white text-xs font-bold px-4 py-2.5 rounded-xl flex items-center gap-2 transition-colors shadow-md active:scale-95 shrink-0"
            >
              <Plus className="w-4 h-4" /> Tambah Data Produsen
            </button>
          )}
        </div>

        {/* Supabase Cloud Connection Status Indicator */}
        <div className="mt-4 pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-300">
          <div className="flex items-center gap-2">
            <span
              className={`w-2 h-2 rounded-full ${
                supabaseConfig.isConfigured ? 'bg-emerald-400 animate-pulse' : 'bg-slate-400'
              }`}
            />
            <span className="font-medium text-[11px]">
              {supabaseConfig.isConfigured ? (
                <>
                  Penyimpanan Cloud:{' '}
                  <strong className="text-emerald-300 font-mono">
                    Supabase PostgreSQL ({supabaseConfig.projectRef || 'Terhubung'})
                  </strong>
                </>
              ) : (
                <>Penyimpanan Cloud: <span className="text-slate-400">Offline / Browser LocalStorage</span></>
              )}
            </span>
          </div>

          {onNavigateToAdmin && (
            <button
              onClick={onNavigateToAdmin}
              className="text-[11px] text-sky-300 hover:text-sky-200 hover:underline flex items-center gap-1 font-medium"
            >
              <Database className="w-3.5 h-3.5" /> Pengaturan Supabase & SQL Schema →
            </button>
          )}
        </div>
      </div>

      {/* Sync Status Banner */}
      {syncNotice && (
        <div
          className={`p-4 rounded-xl border text-xs flex items-start justify-between gap-3 ${
            syncNotice.type === 'syncing'
              ? 'bg-sky-50 border-sky-200 text-sky-900'
              : syncNotice.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-950'
              : syncNotice.type === 'warning'
              ? 'bg-amber-50 border-amber-300 text-amber-950'
              : 'bg-red-50 border-red-200 text-red-950'
          }`}
        >
          <div className="flex items-start gap-2.5">
            {syncNotice.type === 'syncing' && (
              <RefreshCw className="w-4 h-4 text-sky-600 animate-spin mt-0.5 shrink-0" />
            )}
            {syncNotice.type === 'success' && (
              <CheckCircle className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
            )}
            {syncNotice.type === 'warning' && (
              <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
            )}
            {syncNotice.type === 'error' && (
              <AlertCircle className="w-4 h-4 text-red-600 mt-0.5 shrink-0" />
            )}
            <div className="space-y-1">
              <div className="font-semibold leading-relaxed">{syncNotice.message}</div>
              {syncNotice.missingTable && (
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <a
                    href={SupabaseService.getDashboardSqlUrl()}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded-md shadow-2xs"
                  >
                    <ExternalLink className="w-3 h-3" /> Buka SQL Editor di Dashboard Supabase
                  </a>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(SUPABASE_SQL_SCHEMA);
                      setCopiedSchema(true);
                      setTimeout(() => setCopiedSchema(false), 2000);
                    }}
                    className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-md"
                  >
                    {copiedSchema ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedSchema ? 'Tersalin!' : 'Salin SQL Schema'}</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          <button
            onClick={() => setSyncNotice(null)}
            className="text-slate-400 hover:text-slate-600 text-xs px-1"
          >
            ✕
          </button>
        </div>
      )}

      {/* Filter and Search */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Cari nama PT, kota, nomor izin industri..."
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium focus:ring-2 focus:ring-sky-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-500">Status Audit:</span>
          {['Semua', 'Terverifikasi', 'Dalam Pembinaan', 'Dibekukan'].map((s) => (
            <button
              key={s}
              onClick={() => setSelectedAudit(s)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
                selectedAudit === s
                  ? s === 'Terverifikasi'
                    ? 'bg-emerald-700 text-white'
                    : s === 'Dibekukan'
                    ? 'bg-red-700 text-white'
                    : 'bg-slate-800 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Producers */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filteredProducers.map(prod => (
          <div
            key={prod.id}
            className={`bg-white rounded-xl border p-5 shadow-xs space-y-4 transition-all hover:shadow-md ${
              prod.status_audit === 'Dibekukan'
                ? 'border-red-300 bg-red-50/10'
                : 'border-slate-200'
            }`}
          >
            <div className="flex justify-between items-start gap-2 border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-bold text-sky-800 uppercase tracking-wider">
                  {prod.kategori_industri}
                </span>
                <h3 className="font-bold text-slate-900 text-base mt-0.5">{prod.nama_pt}</h3>
                <div className="text-xs text-slate-500 font-mono mt-0.5">
                  No. Izin Industri: {prod.nomor_izin_industri}
                </div>
              </div>

              <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold shrink-0 ${
                prod.status_audit === 'Terverifikasi'
                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                  : prod.status_audit === 'Dibekukan'
                  ? 'bg-red-100 text-red-800 border border-red-300'
                  : 'bg-amber-100 text-amber-800 border border-amber-300'
              }`}>
                {prod.status_audit}
              </span>
            </div>

            {/* Certifications badges */}
            <div>
              <div className="text-[11px] font-semibold text-slate-500 mb-1 flex items-center gap-1">
                <Award className="w-3.5 h-3.5 text-amber-500" /> Sertifikasi Standar Fasilitas:
              </div>
              <div className="flex flex-wrap gap-1.5">
                {prod.sertifikasi.map((s, idx) => (
                  <span
                    key={idx}
                    className="bg-indigo-50 text-indigo-700 border border-indigo-200 px-2 py-0.5 rounded text-xs font-semibold"
                  >
                    {s}
                  </span>
                ))}
              </div>
            </div>

            {/* Contact and address */}
            <div className="space-y-1.5 text-xs text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-200">
              <div className="flex items-start gap-2">
                <MapPin className="w-3.5 h-3.5 text-slate-400 mt-0.5 shrink-0" />
                <span>{prod.alamat}, {prod.kota}, {prod.provinsi}</span>
              </div>
              <div className="flex items-center gap-4 pt-1 text-[11px] text-slate-500">
                <span className="flex items-center gap-1">
                  <Phone className="w-3 h-3 text-slate-400" /> {prod.kontak_telepon}
                </span>
                <span className="flex items-center gap-1">
                  <Mail className="w-3 h-3 text-slate-400" /> {prod.email}
                </span>
              </div>
            </div>

            {/* Admin Actions */}
            {isAdmin && (
              <div className="pt-2 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => handleOpenEdit(prod)}
                  className="px-2.5 py-1 text-[11px] font-semibold text-slate-700 hover:text-sky-700 hover:bg-slate-100 rounded-md flex items-center gap-1 transition-colors"
                >
                  <Edit className="w-3.5 h-3.5" /> Edit
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(prod)}
                  className="px-2.5 py-1 text-[11px] font-semibold text-red-600 hover:bg-red-50 rounded-md flex items-center gap-1 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Hapus
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Add / Edit Producer Modal */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-base">
                {editingProducerId ? 'Edit Data Produsen Industri' : 'Tambah Produsen Industri Baru'}
              </h3>
              <button onClick={() => setIsAddOpen(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Nama Perusahaan / PT</label>
                <input
                  type="text"
                  value={formData.nama_pt}
                  onChange={(e) => setFormData({ ...formData, nama_pt: e.target.value })}
                  placeholder="PT Bio Kimia Sejahtera"
                  className="w-full p-2 border border-slate-300 rounded-lg"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Nomor Izin Industri</label>
                  <input
                    type="text"
                    value={formData.nomor_izin_industri}
                    onChange={(e) => setFormData({ ...formData, nomor_izin_industri: e.target.value })}
                    placeholder="IK-FARMA-2026-..."
                    className="w-full p-2 border border-slate-300 rounded-lg font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Kategori Industri</label>
                  <select
                    value={formData.kategori_industri}
                    onChange={(e) => setFormData({ ...formData, kategori_industri: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded-lg"
                  >
                    <option value="Industri Farmasi">Industri Farmasi</option>
                    <option value="Industri Kosmetika Golongan A">Industri Kosmetika Golongan A</option>
                    <option value="Industri Makanan & Minuman">Industri Makanan & Minuman</option>
                    <option value="Industri Obat Tradisional (IOT)">Industri Obat Tradisional (IOT)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Sertifikasi Fasilitas (Pisahkan koma)</label>
                <input
                  type="text"
                  value={formData.sertifikasi}
                  onChange={(e) => setFormData({ ...formData, sertifikasi: e.target.value })}
                  placeholder="CPOB, Halal BPJPH, ISO 9001"
                  className="w-full p-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Kota Pabrik</label>
                  <input
                    type="text"
                    value={formData.kota}
                    onChange={(e) => setFormData({ ...formData, kota: e.target.value })}
                    placeholder="Bekasi"
                    className="w-full p-2 border border-slate-300 rounded-lg"
                    required
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Status Audit</label>
                  <select
                    value={formData.status_audit}
                    onChange={(e) => setFormData({ ...formData, status_audit: e.target.value as any })}
                    className="w-full p-2 border border-slate-300 rounded-lg font-semibold"
                  >
                    <option value="Terverifikasi">Terverifikasi</option>
                    <option value="Dalam Pembinaan">Dalam Pembinaan</option>
                    <option value="Dibekukan">Dibekukan</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Alamat Lengkap</label>
                <textarea
                  value={formData.alamat}
                  onChange={(e) => setFormData({ ...formData, alamat: e.target.value })}
                  placeholder="Jl. Raya Kawasan Industri..."
                  className="w-full p-2 border border-slate-300 rounded-lg"
                  rows={2}
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddOpen(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg font-medium"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-sky-800 hover:bg-sky-900 text-white rounded-lg font-bold"
                >
                  {editingProducerId ? 'Perbarui Produsen' : 'Simpan Produsen'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
