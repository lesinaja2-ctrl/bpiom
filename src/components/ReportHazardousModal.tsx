import React, { useState, useRef } from 'react';
import {
  AlertTriangle,
  Upload,
  CheckCircle2,
  Search,
  FileText,
  Clock,
  ExternalLink,
  ShieldAlert,
  X,
  Camera,
} from 'lucide-react';
import { Report, Product, User } from '../types';
import { StorageService } from '../services/storageService';

interface ReportHazardousModalProps {
  isOpen: boolean;
  onClose: () => void;
  reports: Report[];
  currentUser: User | null;
  initialProduct?: Product | null;
  onAddReport: (report: Report) => void;
  onUpdateReportStatus?: (id: string, status: Report['status'], note?: string) => void;
}

export const ReportHazardousModal: React.FC<ReportHazardousModalProps> = ({
  isOpen,
  onClose,
  reports,
  currentUser,
  initialProduct,
  onAddReport,
  onUpdateReportStatus,
}) => {
  const [activeTab, setActiveTab] = useState<'form' | 'track' | 'admin-list'>('form');
  const [searchTicket, setSearchTicket] = useState('');
  const [searchedReport, setSearchedReport] = useState<Report | null>(null);
  const [createdTicket, setCreatedTicket] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  // Form
  const [formData, setFormData] = useState({
    nama_pelapor: currentUser?.nama_lengkap || '',
    kontak_pelapor: '',
    nama_produk: initialProduct?.nama_produk || '',
    nomor_izin_tertera: initialProduct?.nomor_izin || '',
    nomor_batch: initialProduct?.batch_nomor || '',
    lokasi_pembelian: '',
    indikasi_bahaya: '',
    efek_samping: '',
    foto_bukti_url: '',
    drive_file_id: '',
  });

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  if (!isOpen) return null;

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const result = await StorageService.uploadFileToDrive(file);
      setFormData(prev => ({
        ...prev,
        foto_bukti_url: result.fileUrl,
        drive_file_id: result.fileId,
      }));
    } catch (err) {
      console.error(err);
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const ticket = `RPT-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const newReport: Report = {
      id: 'rep-' + Date.now(),
      ticket_number: ticket,
      nama_pelapor: formData.nama_pelapor,
      kontak_pelapor: formData.kontak_pelapor,
      nama_produk: formData.nama_produk,
      nomor_izin_tertera: formData.nomor_izin_tertera || 'Tidak Ada / Fiktif',
      nomor_batch: formData.nomor_batch || '-',
      lokasi_pembelian: formData.lokasi_pembelian,
      tanggal_kejadian: new Date().toISOString().split('T')[0],
      indikasi_bahaya: formData.indikasi_bahaya,
      efek_samping: formData.efek_samping,
      foto_bukti_url: formData.foto_bukti_url || undefined,
      drive_file_id: formData.drive_file_id || undefined,
      tanggal_lapor: new Date().toISOString().split('T')[0],
      status: 'Menunggu Verifikasi',
      tanggapan_petugas: 'Laporan Anda telah diterima oleh Tim Pengaduan Konsumen BPOM dan sedang diverifikasi kelengkapannya.',
    };

    onAddReport(newReport);
    setCreatedTicket(ticket);
    setFormData({
      nama_pelapor: currentUser?.nama_lengkap || '',
      kontak_pelapor: '',
      nama_produk: '',
      nomor_izin_tertera: '',
      nomor_batch: '',
      lokasi_pembelian: '',
      indikasi_bahaya: '',
      efek_samping: '',
      foto_bukti_url: '',
      drive_file_id: '',
    });
  };

  const handleTrack = () => {
    if (!searchTicket.trim()) return;
    const found = reports.find(
      r => r.ticket_number.toLowerCase() === searchTicket.trim().toLowerCase()
    );
    setSearchedReport(found || null);
  };

  const isStaff = currentUser && ['Admin', 'Pengawas'].includes(currentUser.role);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[92vh] overflow-hidden flex flex-col shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-red-900 via-rose-900 to-amber-950 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center text-white border border-white/20 shrink-0">
              <ShieldAlert className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <h3 className="font-bold text-lg leading-tight">Layanan Pengaduan Produk Berbahaya</h3>
              <p className="text-xs text-rose-100">
                Kanal resmi pelaporan masyarakat untuk obat, kosmetik, dan makanan ilegal atau berbahaya
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/25 flex items-center justify-center text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-6 pt-3 text-xs font-bold">
          <button
            onClick={() => setActiveTab('form')}
            className={`pb-2.5 px-3 border-b-2 transition-colors ${
              activeTab === 'form'
                ? 'border-red-600 text-red-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Formulir Pengaduan
          </button>
          <button
            onClick={() => setActiveTab('track')}
            className={`pb-2.5 px-3 border-b-2 transition-colors ${
              activeTab === 'track'
                ? 'border-red-600 text-red-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Lacak Status Tiket Aduan
          </button>
          {isStaff && (
            <button
              onClick={() => setActiveTab('admin-list')}
              className={`pb-2.5 px-3 border-b-2 transition-colors ${
                activeTab === 'admin-list'
                  ? 'border-red-600 text-red-700'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              Kelola Pengaduan Masuk ({reports.length})
            </button>
          )}
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-4 text-xs">
          {/* TAB 1: FORM PENGADUAN */}
          {activeTab === 'form' && (
            <>
              {createdTicket ? (
                <div className="bg-emerald-50 border-2 border-emerald-300 rounded-xl p-6 text-center space-y-3">
                  <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-7 h-7" />
                  </div>
                  <h4 className="text-base font-bold text-emerald-900">
                    Laporan Anda Berhasil Diterima Sistem!
                  </h4>
                  <p className="text-xs text-emerald-700 max-w-md mx-auto">
                    Terima kasih telah berpartisipasi menjaga keamanan masyarakat. Simpan nomor tiket di bawah ini untuk memantau proses verifikasi dan uji sampel laboratorium.
                  </p>
                  <div className="bg-white p-3 rounded-lg border border-emerald-200 inline-block font-mono font-bold text-base text-slate-800 tracking-wider shadow-xs">
                    {createdTicket}
                  </div>
                  <div className="pt-2">
                    <button
                      onClick={() => setCreatedTicket(null)}
                      className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-lg"
                    >
                      Buat Laporan Baru
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-amber-900 flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <p>
                      Identitas Anda dijamin kerahasiaannya sesuai UU Perlindungan Saksi dan Korban serta regulasi pengawasan BPOM.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="font-semibold text-slate-700 block mb-1">Nama Pelapor / Inisial</label>
                      <input
                        type="text"
                        value={formData.nama_pelapor}
                        onChange={(e) => setFormData({ ...formData, nama_pelapor: e.target.value })}
                        placeholder="Budi Santoso / Inisial"
                        className="w-full p-2.5 border border-slate-300 rounded-lg"
                        required
                      />
                    </div>
                    <div>
                      <label className="font-semibold text-slate-700 block mb-1">No. WhatsApp / Email Aktif</label>
                      <input
                        type="text"
                        value={formData.kontak_pelapor}
                        onChange={(e) => setFormData({ ...formData, kontak_pelapor: e.target.value })}
                        placeholder="0812-xxxx-xxxx"
                        className="w-full p-2.5 border border-slate-300 rounded-lg"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="font-semibold text-slate-700 block mb-1">Nama Produk yang Dilaporkan</label>
                      <input
                        type="text"
                        value={formData.nama_produk}
                        onChange={(e) => setFormData({ ...formData, nama_produk: e.target.value })}
                        placeholder="Contoh: Cream Pemutih Super Instan"
                        className="w-full p-2.5 border border-slate-300 rounded-lg"
                        required
                      />
                    </div>
                    <div>
                      <label className="font-semibold text-slate-700 block mb-1">Nomor Izin Tertera (Jika Ada)</label>
                      <input
                        type="text"
                        value={formData.nomor_izin_tertera}
                        onChange={(e) => setFormData({ ...formData, nomor_izin_tertera: e.target.value })}
                        placeholder="NA182... / Tidak tercantum / Palsu"
                        className="w-full p-2.5 border border-slate-300 rounded-lg"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="font-semibold text-slate-700 block mb-1">Lokasi Pembelian / Sumber Perolehan</label>
                      <input
                        type="text"
                        value={formData.lokasi_pembelian}
                        onChange={(e) => setFormData({ ...formData, lokasi_pembelian: e.target.value })}
                        placeholder="Nama Toko, Pasar, Akun TikTok/Shopee..."
                        className="w-full p-2.5 border border-slate-300 rounded-lg"
                        required
                      />
                    </div>
                    <div>
                      <label className="font-semibold text-slate-700 block mb-1">Nomor Batch / Kode Produksi</label>
                      <input
                        type="text"
                        value={formData.nomor_batch}
                        onChange={(e) => setFormData({ ...formData, nomor_batch: e.target.value })}
                        placeholder="Contoh: BATCH-0912"
                        className="w-full p-2.5 border border-slate-300 rounded-lg"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">
                      Indikasi Bahaya / Alasan Pelaporan
                    </label>
                    <textarea
                      value={formData.indikasi_bahaya}
                      onChange={(e) => setFormData({ ...formData, indikasi_bahaya: e.target.value })}
                      placeholder="Jelaskan temuan fisik: bau menyengat, warna mengkilap, nomor registrasi tidak terdaftar, atau tanpa label bahasa Indonesia..."
                      className="w-full p-2.5 border border-slate-300 rounded-lg"
                      rows={2}
                      required
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">
                      Efek Samping / Reaksi Tubuh yang Dialami (Jika Ada)
                    </label>
                    <textarea
                      value={formData.efek_samping}
                      onChange={(e) => setFormData({ ...formData, efek_samping: e.target.value })}
                      placeholder="Contoh: Kulit memerah panas, bengkak, jantung berdebar keras, mual muntah..."
                      className="w-full p-2.5 border border-slate-300 rounded-lg"
                      rows={2}
                    />
                  </div>

                  {/* File Upload ke Drive */}
                  <div className="border border-dashed border-slate-300 rounded-xl p-4 bg-slate-50 text-center">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*,.pdf"
                      onChange={handleFileUpload}
                      className="hidden"
                    />

                    {formData.foto_bukti_url ? (
                      <div className="flex items-center justify-between bg-white p-3 rounded-lg border border-emerald-200">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                          <div className="text-left">
                            <span className="font-bold text-slate-800 block">Berkas Bukti Terunggah</span>
                            <span className="text-[10px] text-slate-400 font-mono">
                              ID Drive: {formData.drive_file_id}
                            </span>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => setFormData(prev => ({ ...prev, foto_bukti_url: '', drive_file_id: '' }))}
                          className="text-red-500 hover:text-red-700 font-semibold"
                        >
                          Hapus
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-1">
                        <Upload className="w-6 h-6 text-slate-400 mx-auto mb-1" />
                        <div className="font-bold text-slate-700">Unggah Foto Kemasan / Bukti Fisik</div>
                        <p className="text-[11px] text-slate-500">
                          Format JPG/PNG/PDF. File otomatis disinkronkan ke folder Google Drive resmi.
                        </p>
                        <button
                          type="button"
                          disabled={uploading}
                          onClick={() => fileInputRef.current?.click()}
                          className="mt-2 px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold rounded-lg text-xs"
                        >
                          {uploading ? 'Mengunggah ke Drive...' : 'Pilih File / Foto'}
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={onClose}
                      className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg"
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 bg-red-700 hover:bg-red-800 text-white font-bold rounded-lg shadow-md"
                    >
                      Kirim Laporan Pengaduan
                    </button>
                  </div>
                </form>
              )}
            </>
          )}

          {/* TAB 2: LACAK STATUS TIKET */}
          {activeTab === 'track' && (
            <div className="space-y-4">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={searchTicket}
                    onChange={(e) => setSearchTicket(e.target.value)}
                    placeholder="Masukkan nomor tiket pengaduan (e.g. RPT-2026-0811)..."
                    className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg font-mono uppercase"
                  />
                </div>
                <button
                  onClick={handleTrack}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-lg"
                >
                  Lacak
                </button>
              </div>

              {searchedReport ? (
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="font-mono font-bold text-sky-800 text-sm">
                        {searchedReport.ticket_number}
                      </span>
                      <h4 className="font-bold text-slate-900 text-base">{searchedReport.nama_produk}</h4>
                      <p className="text-slate-500">Dilaporkan pada: {searchedReport.tanggal_lapor}</p>
                    </div>

                    <span className={`px-3 py-1 rounded-full font-bold text-xs ${
                      searchedReport.status === 'Tindak Lanjut / Selesai'
                        ? 'bg-emerald-100 text-emerald-800'
                        : searchedReport.status === 'Uji Sampel Lab'
                        ? 'bg-indigo-100 text-indigo-800'
                        : searchedReport.status === 'Investigasi Lapangan'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-slate-200 text-slate-800'
                    }`}>
                      {searchedReport.status}
                    </span>
                  </div>

                  <div className="bg-white p-3 rounded-lg border border-slate-200 space-y-1.5">
                    <div className="font-bold text-slate-700">Tanggapan Resmi Petugas BPOM:</div>
                    <p className="text-slate-600 leading-relaxed">
                      {searchedReport.tanggapan_petugas || 'Laporan sedang dalam antrean penanganan petugas.'}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-600">
                    <div>
                      <strong>Lokasi Pembelian:</strong> {searchedReport.lokasi_pembelian}
                    </div>
                    <div>
                      <strong>Nomor Izin Tertera:</strong> {searchedReport.nomor_izin_tertera}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-slate-400">
                  <FileText className="w-10 h-10 mx-auto mb-2 text-slate-300" />
                  <p>Masukkan nomor tiket Anda pada kolom di atas untuk melihat status tindak lanjut.</p>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: ADMIN KELOLA PENGADUAN */}
          {activeTab === 'admin-list' && isStaff && (
            <div className="space-y-3">
              {reports.map((r) => (
                <div key={r.id} className="border border-slate-200 rounded-xl p-4 bg-white space-y-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="font-mono font-bold text-sky-800">{r.ticket_number}</span>
                      <h4 className="font-bold text-slate-900 text-sm">{r.nama_produk}</h4>
                      <p className="text-slate-500">
                        Pelapor: {r.nama_pelapor} ({r.kontak_pelapor}) • {r.tanggal_lapor}
                      </p>
                    </div>

                    <select
                      value={r.status}
                      onChange={(e) => onUpdateReportStatus && onUpdateReportStatus(r.id, e.target.value as any)}
                      className="p-1.5 border border-slate-300 rounded font-bold bg-slate-50"
                    >
                      <option value="Menunggu Verifikasi">Menunggu Verifikasi</option>
                      <option value="Investigasi Lapangan">Investigasi Lapangan</option>
                      <option value="Uji Sampel Lab">Uji Sampel Lab</option>
                      <option value="Tindak Lanjut / Selesai">Tindak Lanjut / Selesai</option>
                      <option value="Ditolak">Ditolak</option>
                    </select>
                  </div>

                  <p className="text-slate-700 bg-slate-50 p-2 rounded">{r.indikasi_bahaya}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
