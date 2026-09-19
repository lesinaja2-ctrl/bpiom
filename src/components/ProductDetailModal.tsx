import React from 'react';
import {
  X,
  FileCheck2,
  Building2,
  FlaskConical,
  AlertTriangle,
  Lock,
  ExternalLink,
  ShieldCheck,
  QrCode,
  Calendar,
  Layers,
  Sparkles,
  FileDown,
  FileText,
} from 'lucide-react';
import { Product, Producer, LabResult } from '../types';
import { exportCertificatePDF, exportCertificateWord } from '../utils/exportUtils';
import { getProductCharacteristicColumns } from '../utils/productUtils';
import { StorageService } from '../services/storageService';

interface ProductDetailModalProps {
  product: Product | null;
  producer?: Producer;
  labResult?: LabResult;
  isAdmin?: boolean;
  onClose: () => void;
  onReportProduct?: (product: Product) => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  producer,
  labResult,
  isAdmin,
  onClose,
  onReportProduct,
}) => {
  if (!product) return null;

  const effectiveIsAdmin = isAdmin !== undefined 
    ? isAdmin 
    : StorageService.getCurrentUser()?.role === 'Admin';

  const isDitarik = product.status_registrasi === 'Ditarik';
  const isLabTMS = product.status_uji_lab === 'Tidak Memenuhi Syarat';
  const charColumns = getProductCharacteristicColumns(product);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-200 my-auto">
        {/* Header */}
        <div className={`p-5 flex items-start justify-between text-white ${
          isDitarik || isLabTMS
            ? 'bg-gradient-to-r from-red-800 to-rose-700'
            : 'bg-gradient-to-r from-sky-900 via-sky-800 to-indigo-900'
        }`}>
          <div className="flex gap-3 items-center">
            <div className="w-12 h-12 rounded-xl bg-white/15 flex items-center justify-center border border-white/20 shrink-0">
              {isDitarik || isLabTMS ? (
                <AlertTriangle className="w-6 h-6 text-amber-300" />
              ) : (
                <ShieldCheck className="w-6 h-6 text-emerald-300" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-white/20 backdrop-blur-xs tracking-wide">
                  {product.kategori}
                </span>
                <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                  product.status_registrasi === 'Aktif'
                    ? 'bg-emerald-500/90 text-white'
                    : product.status_registrasi === 'Ditarik'
                    ? 'bg-red-500 text-white'
                    : 'bg-amber-500 text-white'
                }`}>
                  Status: {product.status_registrasi}
                </span>
              </div>
              <h2 className="text-xl font-bold mt-1 text-white leading-tight">
                {product.nama_produk}
              </h2>
              <p className="text-xs text-sky-100 font-mono mt-0.5">
                NIE BPOM: <span className="font-bold underline tracking-wider">{product.nomor_izin}</span>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/25 flex items-center justify-center text-white transition-colors ml-4 shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Warning Banner if Product is Withdrawn */}
        {(isDitarik || isLabTMS) && (
          <div className="bg-red-50 border-b border-red-200 p-4 text-red-800 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
            <div className="text-xs">
              <p className="font-bold">PERINGATAN RESMI BADAN PENGAWAS OBAT DAN MAKANAN</p>
              <p className="mt-0.5 text-red-700">
                Produk ini tidak memenuhi standar keamanan atau telah ditarik dari peredaran. Masyarakat diimbau tidak mengonsumsi/menggunakan produk ini dan segera melaporkan jika menemukan penjualan di pasaran.
              </p>
            </div>
          </div>
        )}

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-sm">
          {/* Top Grid: Photo, Basic Info, QR */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Image */}
            <div className="relative rounded-xl overflow-hidden bg-slate-100 border border-slate-200 aspect-square flex items-center justify-center">
              {product.foto_url ? (
                <img
                  src={product.foto_url}
                  alt={product.nama_produk}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="text-slate-400 text-center p-4">
                  <Layers className="w-8 h-8 mx-auto mb-1" />
                  <span className="text-xs">Tidak ada foto</span>
                </div>
              )}
              <div className="absolute bottom-2 left-2 bg-slate-900/80 backdrop-blur-xs text-white text-[10px] px-2 py-0.5 rounded font-mono">
                {product.barcode}
              </div>
            </div>

            {/* Core Info */}
            <div className="md:col-span-2 space-y-3">
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                  <span className="text-slate-400 block font-medium">Merk Dagang:</span>
                  <span className="font-bold text-slate-800 text-sm">{product.merk || '-'}</span>
                </div>
                <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                  <span className="text-slate-400 block font-medium">Bentuk Sediaan:</span>
                  <span className="font-bold text-slate-800 text-sm">{product.bentuk_sediaan}</span>
                </div>
                <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                  <span className="text-slate-400 block font-medium">Nomor Batch:</span>
                  <span className="font-mono font-bold text-slate-800">{product.batch_nomor}</span>
                </div>
                <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                  <span className="text-slate-400 block font-medium">Hasil Uji Laboratorium:</span>
                  <span className={`font-bold inline-flex items-center gap-1 ${
                    product.status_uji_lab === 'Lulus' ? 'text-emerald-700' : 'text-red-600'
                  }`}>
                    <FlaskConical className="w-3.5 h-3.5" />
                    {product.status_uji_lab}
                  </span>
                </div>
              </div>

              {/* Dates */}
              <div className="flex items-center gap-3 bg-sky-50 text-sky-950 p-3 rounded-lg border border-sky-100 text-xs">
                <Calendar className="w-4 h-4 text-sky-600 shrink-0" />
                <div className="grid grid-cols-2 gap-4 w-full">
                  <div>
                    <span className="text-sky-600/80 block">Tanggal Izin Terbit:</span>
                    <span className="font-semibold">{product.tanggal_terbit}</span>
                  </div>
                  <div>
                    <span className="text-sky-600/80 block">Berlaku Sampai Dengan:</span>
                    <span className="font-semibold">{product.tanggal_kedaluwarsa}</span>
                  </div>
                </div>
              </div>

              {/* Digital Certificate Hash Verification */}
              <div className="p-3 rounded-lg bg-slate-900 text-white flex items-center justify-between text-xs">
                <div className="space-y-0.5 truncate mr-2">
                  <div className="text-[10px] text-slate-400 uppercase font-bold flex items-center gap-1">
                    <QrCode className="w-3 h-3 text-sky-400" /> Signature Hash Digital
                  </div>
                  <div className="font-mono text-[11px] text-sky-300 truncate">
                    {product.qr_code_hash}
                  </div>
                </div>
                <span className="bg-emerald-500/20 text-emerald-400 text-[10px] px-2 py-0.5 rounded border border-emerald-500/30 font-semibold shrink-0">
                  Terotentikasi
                </span>
              </div>
            </div>
          </div>

          {/* Section: Deskripsi & Karakteristik */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="border border-slate-200 rounded-xl p-4 bg-white">
              <h4 className="font-bold text-slate-800 text-xs mb-1 flex items-center gap-1.5 text-sky-800">
                <Sparkles className="w-3.5 h-3.5 text-sky-600" /> Deskripsi Produk
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed">{product.deskripsi}</p>
            </div>
            <div className="border border-slate-200 rounded-xl p-4 bg-white space-y-2">
              <h4 className="font-bold text-slate-800 text-xs mb-1 flex items-center gap-1.5 text-sky-800">
                <Layers className="w-3.5 h-3.5 text-sky-600" /> Karakteristik Fisik & Penyimpanan (Spesifikasi Mutu)
              </h4>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {charColumns.map((col, idx) => (
                  <div
                    key={idx}
                    className={`bg-slate-50 p-2 rounded-lg border border-slate-100 ${
                      col.label.includes('Penyimpanan') ? 'col-span-2' : ''
                    }`}
                  >
                    <span className="text-[10px] text-slate-500 font-bold block">{col.label}:</span>
                    <span className="font-semibold text-slate-800">{col.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Section: Komposisi Bahan */}
          <div className="border border-slate-200 rounded-xl p-4 bg-white">
            <h4 className="font-bold text-slate-800 text-xs mb-2 flex items-center gap-1.5 text-sky-800">
              <FlaskConical className="w-3.5 h-3.5 text-sky-600" /> Komposisi / Formula Terdaftar
            </h4>
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 font-mono text-xs text-slate-700 leading-relaxed whitespace-pre-line">
              {product.komposisi}
            </div>
          </div>

          {/* Section: Informasi Klinis & Farmakologis (Indikasi, Aturan Pakai, Kontraindikasi, Penanggung Jawab) */}
          {(product.indikasi || product.aturan_pakai || product.kontraindikasi || product.penanggung_jawab) && (
            <div className="border border-slate-200 rounded-xl p-4 bg-white space-y-3">
              <h4 className="font-bold text-slate-800 text-xs flex items-center gap-1.5 text-sky-800">
                <FileText className="w-3.5 h-3.5 text-sky-600" /> Keterangan Khasiat & Petunjuk Penggunaan
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                {product.indikasi && (
                  <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                    <span className="font-bold text-slate-700 block mb-1">Indikasi & Khasiat:</span>
                    <p className="text-slate-600 leading-relaxed whitespace-pre-line">{product.indikasi}</p>
                  </div>
                )}
                {product.aturan_pakai && (
                  <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                    <span className="font-bold text-slate-700 block mb-1">Aturan Pakai & Dosis:</span>
                    <p className="text-slate-600 leading-relaxed whitespace-pre-line">{product.aturan_pakai}</p>
                  </div>
                )}
                {product.kontraindikasi && (
                  <div className="bg-amber-50/60 p-3 rounded-lg border border-amber-200">
                    <span className="font-bold text-amber-900 block mb-1">Kontraindikasi & Peringatan:</span>
                    <p className="text-amber-800 leading-relaxed whitespace-pre-line">{product.kontraindikasi}</p>
                  </div>
                )}
                {product.penanggung_jawab && (
                  <div className="bg-sky-50/60 p-3 rounded-lg border border-sky-200">
                    <span className="font-bold text-sky-950 block mb-1">Penanggung Jawab Teknis (PJT):</span>
                    <p className="text-sky-900 font-semibold">{product.penanggung_jawab}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Section: Produsen */}
          <div className="border border-slate-200 rounded-xl p-4 bg-white">
            <h4 className="font-bold text-slate-800 text-xs mb-2 flex items-center gap-1.5 text-sky-800">
              <Building2 className="w-3.5 h-3.5 text-sky-600" /> Produsen / Industri Pendaftar
            </h4>
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 text-xs">
              <div>
                <div className="font-bold text-slate-800 text-sm">{product.nama_produsen}</div>
                <div className="text-slate-500 mt-0.5">
                  {producer?.alamat || 'Kawasan Industri Terdaftar'} • {producer?.kota || 'Indonesia'}
                </div>
              </div>
              {producer?.sertifikasi && (
                <div className="flex flex-wrap gap-1">
                  {producer.sertifikasi.map((s, idx) => (
                    <span key={idx} className="bg-indigo-50 text-indigo-700 border border-indigo-200 px-2 py-0.5 rounded text-[10px] font-semibold">
                      {s}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Section: Laboratorium Hasil Uji */}
          {labResult && (
            <div className="border border-slate-200 rounded-xl p-4 bg-white">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-bold text-slate-800 text-xs flex items-center gap-1.5 text-emerald-800">
                  <FileCheck2 className="w-3.5 h-3.5 text-emerald-600" /> Hasil Pengujian Laboratorium Resmi (PPPOMN)
                </h4>
                <span className="text-[11px] text-emerald-700 font-semibold flex items-center gap-1 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  <ShieldCheck className="w-3.5 h-3.5" /> LHP Terverifikasi Digital
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border border-slate-200 rounded-lg overflow-hidden">
                  <thead className="bg-slate-100 text-slate-700 font-semibold">
                    <tr>
                      <th className="p-2">Parameter Uji</th>
                      <th className="p-2">Standar Baku</th>
                      <th className="p-2">Hasil Analisis</th>
                      <th className="p-2">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {labResult.parameter_uji.map((p, idx) => (
                      <tr key={idx} className="hover:bg-slate-50">
                        <td className="p-2 font-medium text-slate-800">{p.parameter}</td>
                        <td className="p-2 text-slate-600">{p.standar}</td>
                        <td className="p-2 font-mono text-slate-700">{p.hasil}</td>
                        <td className="p-2">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            p.status === 'Memenuhi Syarat'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {p.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="text-[11px] text-slate-500 mt-2 italic">
                * Diuji oleh {labResult.laboratorium_penguji} ({labResult.tanggal_uji})
              </p>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            {effectiveIsAdmin ? (
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-bold text-sky-950 flex items-center gap-1">
                  <span className="px-2 py-0.5 rounded bg-sky-100 text-sky-900 text-[10px] font-black uppercase">
                    Admin
                  </span>
                  Unduh Sertifikat Resmi:
                </span>
                <button
                  type="button"
                  onClick={() => exportCertificatePDF(product, producer)}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors"
                  title="Unduh Sertifikat Izin Edar resmi format PDF"
                >
                  <FileDown className="w-3.5 h-3.5" />
                  <span>Unduh PDF</span>
                </button>
                <button
                  type="button"
                  onClick={() => exportCertificateWord(product, producer)}
                  className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors"
                  title="Unduh Sertifikat Izin Edar resmi format Microsoft Word (.doc)"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Unduh Word (.doc)</span>
                </button>
              </div>
            ) : (
              /* Digital Protection Notice (No document download for regular public users) */
              <div className="flex items-center gap-2 text-xs text-slate-600 bg-white px-3 py-1.5 rounded-lg border border-slate-200">
                <Lock className="w-3.5 h-3.5 text-sky-700 shrink-0" />
                <span className="text-[11px] font-medium">
                  Verifikasi Sertifikat Digital Sah (Unduh Dokumen Dikhususkan untuk Administrator)
                </span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            {onReportProduct && (
              <button
                onClick={() => {
                  onClose();
                  onReportProduct(product);
                }}
                className="text-red-700 hover:text-red-800 hover:bg-red-50 text-xs font-semibold py-2 px-3 rounded-lg border border-red-200 flex items-center gap-1.5 transition-colors"
              >
                <AlertTriangle className="w-3.5 h-3.5" /> Laporkan Produk Ini
              </button>
            )}

            <button
              onClick={onClose}
              className="bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-semibold py-2 px-4 rounded-lg transition-colors"
            >
              Tutup
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
