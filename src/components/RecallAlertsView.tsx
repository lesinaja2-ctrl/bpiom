import React, { useState } from 'react';
import {
  AlertOctagon,
  AlertTriangle,
  Search,
  ShieldAlert,
  Calendar,
  Layers,
  CheckCircle2,
  Plus,
} from 'lucide-react';
import { RecallAlert, User } from '../types';

interface RecallAlertsViewProps {
  recalls: RecallAlert[];
  currentUser: User | null;
  onAddRecall: (newRecall: RecallAlert) => void;
  onSelectProductByNie?: (nie: string) => void;
}

export const RecallAlertsView: React.FC<RecallAlertsViewProps> = ({
  recalls,
  currentUser,
  onAddRecall,
  onSelectProductByNie,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTingkat, setSelectedTingkat] = useState<string>('Semua');
  const [isAddOpen, setIsAddOpen] = useState(false);

  const [formData, setFormData] = useState({
    nama_produk: '',
    nomor_izin: '',
    nomor_batch: '',
    bahaya_kesehatan: '',
    tingkat_bahaya: 'Tingkat I (Kritis)' as RecallAlert['tingkat_bahaya'],
    tindakan_rekomendasi: 'Hentikan pemakaian segera. Laporkan ke BPOM dan serahkan ke apotek setempat.',
  });

  const filteredRecalls = recalls.filter(r => {
    const matchSearch =
      r.nama_produk.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.nomor_izin.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.nomor_batch.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.bahaya_kesehatan.toLowerCase().includes(searchTerm.toLowerCase());

    const matchTingkat = selectedTingkat === 'Semua' || r.tingkat_bahaya.includes(selectedTingkat);
    return matchSearch && matchTingkat;
  });

  const handleCreateRecall = (e: React.FormEvent) => {
    e.preventDefault();
    const newRecall: RecallAlert = {
      id: 'rec-' + Date.now(),
      product_id: 'prod-rec-' + Date.now(),
      nama_produk: formData.nama_produk,
      nomor_izin: formData.nomor_izin,
      nomor_batch: formData.nomor_batch,
      tanggal_penarikan: new Date().toISOString().split('T')[0],
      bahaya_kesehatan: formData.bahaya_kesehatan,
      tingkat_bahaya: formData.tingkat_bahaya,
      tindakan_rekomendasi: formData.tindakan_rekomendasi,
      status: 'Aktif',
    };
    onAddRecall(newRecall);
    setIsAddOpen(false);
    setFormData({
      nama_produk: '',
      nomor_izin: '',
      nomor_batch: '',
      bahaya_kesehatan: '',
      tingkat_bahaya: 'Tingkat I (Kritis)',
      tindakan_rekomendasi: 'Hentikan pemakaian segera. Laporkan ke BPOM dan serahkan ke apotek setempat.',
    });
  };

  const isOfficer = currentUser && ['Admin', 'Pengawas'].includes(currentUser.role);

  return (
    <div className="space-y-6">
      {/* Alert Hero Banner */}
      <div className="bg-gradient-to-r from-red-950 via-rose-900 to-amber-950 text-white p-6 sm:p-8 rounded-2xl shadow-xl border border-red-800 relative overflow-hidden">
        <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none">
          <ShieldAlert className="w-80 h-80 text-white" />
        </div>

        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 bg-red-500/25 border border-red-400/40 rounded-full px-3 py-1 text-xs font-bold text-red-200 mb-3 tracking-wide">
            <AlertOctagon className="w-4 h-4 text-red-400" />
            PUBLIC WARNING & RECALL NOTICE RESMI
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            Notifikasi Penarikan Produk Berbahaya
          </h1>
          <p className="text-red-100/90 text-xs sm:text-sm mt-1.5 leading-relaxed">
            Daftar produk obat, kosmetik, pangan, dan suplemen yang izin edarnya dibatalkan atau ditarik dari seluruh peredaran karena mengandung bahan berbahaya, cemaran toksik, atau pemalsuan izin edar.
          </p>

          <div className="mt-5 flex flex-wrap gap-2 items-center">
            <div className="bg-white/10 text-white text-xs font-semibold px-3.5 py-2 rounded-lg border border-white/20 flex items-center gap-1.5 backdrop-blur-xs">
              <ShieldAlert className="w-3.5 h-3.5 text-amber-300" />
              <span>Peringatan Publik Terproteksi Integritas Digital</span>
            </div>
            {isOfficer && (
              <button
                onClick={() => setIsAddOpen(true)}
                className="bg-red-600 hover:bg-red-500 text-white text-xs font-bold px-3.5 py-2 rounded-lg flex items-center gap-1.5 transition-colors shadow-md"
              >
                <Plus className="w-3.5 h-3.5" /> Terbitkan Public Warning Baru
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Cari produk ditarik, nomor batch, bahan..."
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium focus:ring-2 focus:ring-red-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-500">Tingkat Risiko:</span>
          {['Semua', 'Tingkat I', 'Tingkat II', 'Tingkat III'].map((t) => (
            <button
              key={t}
              onClick={() => setSelectedTingkat(t)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
                selectedTingkat === t
                  ? 'bg-red-700 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Recalls Grid */}
      <div className="space-y-4">
        {filteredRecalls.map((r) => (
          <div
            key={r.id}
            className="bg-white border-2 border-red-200 hover:border-red-400 rounded-xl p-5 shadow-xs transition-all space-y-3"
          >
            <div className="flex flex-col sm:flex-row justify-between sm:items-start gap-2 border-b border-slate-100 pb-3">
              <div>
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <span className="bg-red-600 text-white text-[10px] font-black uppercase px-2 py-0.5 rounded tracking-wide">
                    {r.tingkat_bahaya}
                  </span>
                  <span className="bg-slate-900 text-white font-mono text-[10px] px-2 py-0.5 rounded">
                    Batch: {r.nomor_batch}
                  </span>
                  <span className="text-slate-400 text-xs flex items-center gap-1">
                    <Calendar className="w-3 h-3" /> Tanggal Edaran: {r.tanggal_penarikan}
                  </span>
                </div>
                <h3 className="text-base font-bold text-slate-900">{r.nama_produk}</h3>
                <div className="text-xs text-red-700 font-mono mt-0.5 font-semibold">
                  Nomor Izin / Status: {r.nomor_izin} (Izin Ditarik / Batal)
                </div>
              </div>

              {onSelectProductByNie && (
                <button
                  onClick={() => onSelectProductByNie(r.nomor_izin)}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-red-50 text-red-700 font-bold rounded-lg text-xs transition-colors self-start border border-slate-200"
                >
                  Cek di Database
                </button>
              )}
            </div>

            {/* Danger description */}
            <div className="bg-red-50/70 border border-red-100 rounded-lg p-3 text-xs text-red-900 space-y-1">
              <div className="font-bold flex items-center gap-1.5 text-red-800">
                <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
                Bahaya Kesehatan & Temuan Lapangan:
              </div>
              <p className="leading-relaxed pl-5">{r.bahaya_kesehatan}</p>
            </div>

            {/* Recommendation */}
            <div className="bg-amber-50/70 border border-amber-100 rounded-lg p-3 text-xs text-amber-900 space-y-1">
              <div className="font-bold flex items-center gap-1.5 text-amber-800">
                <CheckCircle2 className="w-4 h-4 text-amber-600 shrink-0" />
                Instruksi & Tindakan Rekomendasi BPOM:
              </div>
              <p className="leading-relaxed pl-5">{r.tindakan_rekomendasi}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Add Recall Modal */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-base">Terbitkan Public Warning / Penarikan Produk</h3>
              <button onClick={() => setIsAddOpen(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            <form onSubmit={handleCreateRecall} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Nama Produk yang Ditarik</label>
                <input
                  type="text"
                  value={formData.nama_produk}
                  onChange={(e) => setFormData({ ...formData, nama_produk: e.target.value })}
                  placeholder="Misal: Cream Pemutih Malam X"
                  className="w-full p-2 border border-slate-300 rounded-lg"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Nomor Izin (NIE) / Status</label>
                  <input
                    type="text"
                    value={formData.nomor_izin}
                    onChange={(e) => setFormData({ ...formData, nomor_izin: e.target.value })}
                    placeholder="NA1819... / Fiktif"
                    className="w-full p-2 border border-slate-300 rounded-lg"
                    required
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Nomor Batch Terdampak</label>
                  <input
                    type="text"
                    value={formData.nomor_batch}
                    onChange={(e) => setFormData({ ...formData, nomor_batch: e.target.value })}
                    placeholder="Semua Batch / Batch 01"
                    className="w-full p-2 border border-slate-300 rounded-lg"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Tingkat Bahaya Penarikan</label>
                <select
                  value={formData.tingkat_bahaya}
                  onChange={(e) => setFormData({ ...formData, tingkat_bahaya: e.target.value as any })}
                  className="w-full p-2 border border-slate-300 rounded-lg font-bold"
                >
                  <option value="Tingkat I (Kritis)">Tingkat I (Kritis - Risiko Kematian / Cacat Permanen)</option>
                  <option value="Tingkat II (Sedang)">Tingkat II (Sedang - Efek Temporer / Masalah Kualitas)</option>
                  <option value="Tingkat III (Ringan)">Tingkat III (Ringan - Kesalahan Label / Kemasan)</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Uraian Bahaya Kesehatan</label>
                <textarea
                  value={formData.bahaya_kesehatan}
                  onChange={(e) => setFormData({ ...formData, bahaya_kesehatan: e.target.value })}
                  placeholder="Temuan merkuri kadar tinggi, BKO sildenafil, atau cemaran mikroba..."
                  className="w-full p-2 border border-slate-300 rounded-lg"
                  rows={2}
                  required
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Instruksi Rekomendasi bagi Konsumen</label>
                <textarea
                  value={formData.tindakan_rekomendasi}
                  onChange={(e) => setFormData({ ...formData, tindakan_rekomendasi: e.target.value })}
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
                  className="px-4 py-2 bg-red-700 hover:bg-red-800 text-white rounded-lg font-bold"
                >
                  Publikasikan Peringatan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
