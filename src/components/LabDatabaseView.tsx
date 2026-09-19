import React, { useState } from 'react';
import {
  FlaskConical,
  Search,
  Lock,
  Filter,
  CheckCircle2,
  XCircle,
  FileText,
  Calendar,
  Building,
  UserCheck,
  Plus,
  ExternalLink,
} from 'lucide-react';
import { LabResult, Product, User } from '../types';

interface LabDatabaseViewProps {
  labResults: LabResult[];
  products: Product[];
  currentUser: User | null;
  onSelectProductById: (productId: string) => void;
  onAddLabResult: (newResult: LabResult) => void;
}

export const LabDatabaseView: React.FC<LabDatabaseViewProps> = ({
  labResults,
  products,
  currentUser,
  onSelectProductById,
  onAddLabResult,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterKesimpulan, setFilterKesimpulan] = useState<'Semua' | 'MS' | 'TMS'>('Semua');
  const [selectedLabDetail, setSelectedLabDetail] = useState<LabResult | null>(null);

  // Form state for adding new lab result
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newLabData, setNewLabData] = useState({
    product_id: products[0]?.id || '',
    nomor_uji: `LAB-BPOM/RI/${new Date().getFullYear()}/${Math.floor(1000 + Math.random() * 9000)}`,
    laboratorium_penguji: 'Pusat Pengembangan Pengujian Obat dan Makanan Nasional (PPPOMN)',
    kesimpulan: 'MS' as 'MS' | 'TMS',
    penguji_nama: currentUser?.nama_lengkap || 'Dra. Wahyuni, Apt., M.Si.',
    catatan: 'Sampel memenuhi seluruh baku spesifikasi Farmakope Indonesia.',
    parameter1_name: 'Cemaran Logam Berat Merkuri (Hg)',
    parameter1_standar: '<= 1.0 ppm',
    parameter1_hasil: '< 0.01 ppm',
    parameter1_status: 'Memenuhi Syarat' as const,
    parameter2_name: 'Identifikasi Bahan Kimia Obat (BKO)',
    parameter2_standar: 'Negatif / Tidak Terdeteksi',
    parameter2_hasil: 'Negatif',
    parameter2_status: 'Memenuhi Syarat' as const,
  });

  const filteredResults = labResults.filter(r => {
    const matchSearch =
      r.nama_produk.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.nomor_uji.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.nomor_izin.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.laboratorium_penguji.toLowerCase().includes(searchTerm.toLowerCase());

    const matchKesimpulan = filterKesimpulan === 'Semua' || r.kesimpulan === filterKesimpulan;
    return matchSearch && matchKesimpulan;
  });

  const handleSaveLab = (e: React.FormEvent) => {
    e.preventDefault();
    const prod = products.find(p => p.id === newLabData.product_id);
    const newResult: LabResult = {
      id: 'lab-' + Date.now(),
      product_id: newLabData.product_id,
      nomor_uji: newLabData.nomor_uji,
      nama_produk: prod ? prod.nama_produk : 'Produk Uji',
      nomor_izin: prod ? prod.nomor_izin : 'NA-REG-DEFAULT',
      tanggal_uji: new Date().toISOString().split('T')[0],
      laboratorium_penguji: newLabData.laboratorium_penguji,
      kesimpulan: newLabData.kesimpulan,
      penguji_nama: newLabData.penguji_nama,
      catatan: newLabData.catatan,
      parameter_uji: [
        {
          parameter: newLabData.parameter1_name,
          standar: newLabData.parameter1_standar,
          hasil: newLabData.parameter1_hasil,
          status: newLabData.parameter1_status,
        },
        {
          parameter: newLabData.parameter2_name,
          standar: newLabData.parameter2_standar,
          hasil: newLabData.parameter2_hasil,
          status: newLabData.parameter2_status,
        },
      ],
    };

    onAddLabResult(newResult);
    setIsAddModalOpen(false);
  };

  const isLabStaff = currentUser && ['Admin', 'Petugas Lab'].includes(currentUser.role);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-emerald-950 via-teal-900 to-slate-900 text-white p-6 sm:p-8 rounded-2xl shadow-xl border border-teal-800">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <div className="inline-flex items-center gap-2 bg-emerald-500/20 border border-emerald-400/30 rounded-full px-3 py-1 text-xs font-semibold text-emerald-200 mb-2">
              <FlaskConical className="w-3.5 h-3.5 text-emerald-400" />
              Pusat Pengembangan Pengujian Obat & Makanan Nasional (PPPOMN)
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Database Hasil Uji Laboratorium
            </h1>
            <p className="text-teal-100/80 text-xs sm:text-sm mt-1 max-w-2xl">
              Akses publik dan transparansi hasil pengujian mikrobiologi, residu logam berat, cemaran toksikologi, dan identifikasi Bahan Kimia Obat (BKO).
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 text-xs text-teal-100 bg-white/10 px-3 py-2 rounded-xl border border-white/20">
              <Lock className="w-3.5 h-3.5 text-teal-300 shrink-0" />
              <span className="text-[11px] font-medium">Basis Data Resmi PPPOMN</span>
            </div>

            {isLabStaff && (
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold px-3.5 py-2.5 rounded-xl flex items-center gap-2 transition-all shadow-md active:scale-95"
              >
                <Plus className="w-4 h-4" /> Entri Hasil Uji Baru
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Cari nama produk, nomor uji lab..."
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium focus:outline-hidden focus:ring-2 focus:ring-teal-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs font-semibold text-slate-500 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" /> Kesimpulan Uji:
          </span>
          {(['Semua', 'MS', 'TMS'] as const).map(k => (
            <button
              key={k}
              onClick={() => setFilterKesimpulan(k)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                filterKesimpulan === k
                  ? k === 'MS'
                    ? 'bg-emerald-600 text-white'
                    : k === 'TMS'
                    ? 'bg-red-600 text-white'
                    : 'bg-slate-800 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {k === 'MS' ? 'Memenuhi Syarat (MS)' : k === 'TMS' ? 'Tidak Memenuhi (TMS)' : 'Semua'}
            </button>
          ))}
        </div>
      </div>

      {/* Results Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200 uppercase tracking-wider text-[11px]">
              <tr>
                <th className="p-3.5">Nomor Uji & Tanggal</th>
                <th className="p-3.5">Sampel Produk & NIE</th>
                <th className="p-3.5">Laboratorium Penguji</th>
                <th className="p-3.5">Parameter Diuji</th>
                <th className="p-3.5 text-center">Kesimpulan</th>
                <th className="p-3.5 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredResults.map(res => {
                const prod = products.find(p => p.id === res.product_id);
                return (
                  <tr key={res.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-3.5">
                      <div className="font-mono font-bold text-slate-900">{res.nomor_uji}</div>
                      <div className="text-slate-400 flex items-center gap-1 mt-0.5 text-[11px]">
                        <Calendar className="w-3 h-3" /> {res.tanggal_uji}
                      </div>
                    </td>

                    <td className="p-3.5">
                      <button
                        onClick={() => onSelectProductById(res.product_id)}
                        className="font-bold text-sky-800 hover:underline text-left block"
                      >
                        {res.nama_produk}
                      </button>
                      <div className="text-slate-500 font-mono text-[11px] mt-0.5">
                        NIE: {res.nomor_izin}
                      </div>
                    </td>

                    <td className="p-3.5">
                      <div className="text-slate-800 font-medium">{res.laboratorium_penguji}</div>
                      <div className="text-slate-400 text-[11px] mt-0.5 flex items-center gap-1">
                        <UserCheck className="w-3 h-3" /> {res.penguji_nama}
                      </div>
                    </td>

                    <td className="p-3.5">
                      <div className="flex flex-wrap gap-1 max-w-xs">
                        {res.parameter_uji.slice(0, 2).map((p, idx) => (
                          <span key={idx} className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-[10px]">
                            {p.parameter.split(' ')[0]} ({p.hasil})
                          </span>
                        ))}
                        {res.parameter_uji.length > 2 && (
                          <span className="text-[10px] text-slate-400">
                            +{res.parameter_uji.length - 2} parameter
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="p-3.5 text-center">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full font-bold text-[11px] ${
                        res.kesimpulan === 'MS'
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                          : 'bg-red-100 text-red-800 border border-red-300'
                      }`}>
                        {res.kesimpulan === 'MS' ? (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            LULUS (MS)
                          </>
                        ) : (
                          <>
                            <XCircle className="w-3.5 h-3.5 text-red-600" />
                            TIDAK LULUS (TMS)
                          </>
                        )}
                      </span>
                    </td>

                    <td className="p-3.5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setSelectedLabDetail(res)}
                          className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded font-semibold text-xs transition-colors"
                        >
                          Detail
                        </button>
                        {prod && (
                          <button
                            onClick={() => onSelectProductById(prod.id)}
                            className="px-2.5 py-1 bg-teal-50 hover:bg-teal-100 text-teal-800 rounded font-semibold text-xs flex items-center gap-1 transition-colors border border-teal-200"
                            title="Buka Halaman Produk Resmi"
                          >
                            <ExternalLink className="w-3 h-3" /> Produk
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Lab Result Detail Modal */}
      {selectedLabDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex justify-between items-start border-b border-slate-100 pb-3">
              <div>
                <span className="text-[11px] font-mono text-teal-700 font-bold">
                  {selectedLabDetail.nomor_uji}
                </span>
                <h3 className="text-lg font-bold text-slate-900">{selectedLabDetail.nama_produk}</h3>
                <p className="text-xs text-slate-500">
                  NIE: {selectedLabDetail.nomor_izin} • Tanggal Uji: {selectedLabDetail.tanggal_uji}
                </p>
              </div>
              <button
                onClick={() => setSelectedLabDetail(null)}
                className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600"
              >
                ✕
              </button>
            </div>

            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs">
              <div className="font-semibold text-slate-700">Laboratorium Penguji:</div>
              <div className="text-slate-900 font-bold">{selectedLabDetail.laboratorium_penguji}</div>
              <div className="text-slate-500 mt-1">Analis: {selectedLabDetail.penguji_nama}</div>
            </div>

            <div>
              <h4 className="text-xs font-bold text-slate-700 mb-2">Daftar Parameter Uji:</h4>
              <div className="border border-slate-200 rounded-lg overflow-hidden">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-100 font-semibold text-slate-700">
                    <tr>
                      <th className="p-2">Parameter</th>
                      <th className="p-2">Standar Rujukan</th>
                      <th className="p-2">Hasil Analisis</th>
                      <th className="p-2">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {selectedLabDetail.parameter_uji.map((p, idx) => (
                      <tr key={idx} className="hover:bg-slate-50">
                        <td className="p-2 font-medium text-slate-900">{p.parameter}</td>
                        <td className="p-2 text-slate-600">{p.standar}</td>
                        <td className="p-2 font-mono text-slate-800">{p.hasil}</td>
                        <td className="p-2">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            p.status === 'Memenuhi Syarat' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {p.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-amber-900">
              <span className="font-bold block mb-0.5">Catatan Resmi Analis:</span>
              <p>{selectedLabDetail.catatan}</p>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-100">
              <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                <Lock className="w-3 h-3 text-slate-400" />
                <span>Dokumen Digital Terproteksi (Unduh Fisik Dinonaktifkan)</span>
              </div>
              <button
                onClick={() => setSelectedLabDetail(null)}
                className="bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-semibold px-4 py-2 rounded-lg"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add New Lab Result Modal for Staff */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-base">Entri Laporan Hasil Uji Lab Baru</h3>
              <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            <form onSubmit={handleSaveLab} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Pilih Produk Sampel</label>
                <select
                  value={newLabData.product_id}
                  onChange={(e) => setNewLabData({ ...newLabData, product_id: e.target.value })}
                  className="w-full p-2 border border-slate-300 rounded-lg bg-white"
                >
                  {products.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.nama_produk} ({p.nomor_izin})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Nomor Uji Lab</label>
                  <input
                    type="text"
                    value={newLabData.nomor_uji}
                    onChange={(e) => setNewLabData({ ...newLabData, nomor_uji: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded-lg font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Kesimpulan Akhir</label>
                  <select
                    value={newLabData.kesimpulan}
                    onChange={(e) => setNewLabData({ ...newLabData, kesimpulan: e.target.value as any })}
                    className="w-full p-2 border border-slate-300 rounded-lg font-bold"
                  >
                    <option value="MS">Memenuhi Syarat (MS)</option>
                    <option value="TMS">Tidak Memenuhi Syarat (TMS)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Laboratorium Penguji</label>
                <input
                  type="text"
                  value={newLabData.laboratorium_penguji}
                  onChange={(e) => setNewLabData({ ...newLabData, laboratorium_penguji: e.target.value })}
                  className="w-full p-2 border border-slate-300 rounded-lg"
                  required
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Nama Analis / Penguji</label>
                <input
                  type="text"
                  value={newLabData.penguji_nama}
                  onChange={(e) => setNewLabData({ ...newLabData, penguji_nama: e.target.value })}
                  className="w-full p-2 border border-slate-300 rounded-lg"
                  required
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Catatan & Rekomendasi</label>
                <textarea
                  value={newLabData.catatan}
                  onChange={(e) => setNewLabData({ ...newLabData, catatan: e.target.value })}
                  className="w-full p-2 border border-slate-300 rounded-lg"
                  rows={2}
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg font-medium"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-teal-800 hover:bg-teal-900 text-white rounded-lg font-bold"
                >
                  Simpan Hasil Uji
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
