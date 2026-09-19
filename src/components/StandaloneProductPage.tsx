import React, { useState } from 'react';
import {
  Product,
  Producer,
  LabResult,
  RecallAlert,
} from '../types';
import { ProductBarcodeVisual } from './ProductBarcodeVisual';
import { exportCertificatePDF, exportCertificateWord } from '../utils/exportUtils';
import { getProductCharacteristicColumns } from '../utils/productUtils';
import { StorageService } from '../services/storageService';
import {
  ShieldCheck,
  AlertTriangle,
  Clock,
  Calendar,
  Building2,
  Package,
  Layers,
  FileCheck2,
  Lock,
  ArrowLeft,
  Share2,
  Check,
  AlertOctagon,
  Sparkles,
  Info,
  QrCode,
  Barcode as BarcodeIcon,
  FileDown,
  FileText,
} from 'lucide-react';

interface StandaloneProductPageProps {
  product: Product;
  producer?: Producer;
  labResult?: LabResult;
  recall?: RecallAlert;
  onBack: () => void;
  onOpenReport: (product: Product) => void;
  onNavigateToProducer?: (producerId: string) => void;
}

export const StandaloneProductPage: React.FC<StandaloneProductPageProps> = ({
  product,
  producer,
  labResult,
  recall,
  onBack,
  onOpenReport,
  onNavigateToProducer,
}) => {
  const [copiedLink, setCopiedLink] = useState(false);

  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://bpom.vercel.app';
  const pageUrl = `${origin}/produk/${product.id}`;

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `Verifikasi BPOM: ${product.nama_produk}`,
        text: `Cek data registrasi resmi BPOM untuk ${product.nama_produk} (NIE: ${product.nomor_izin})`,
        url: pageUrl,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(pageUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  const isRecalled = product.status_registrasi === 'Ditarik' || !!recall;
  const isExpired = product.status_registrasi === 'Kedaluwarsa';
  const isActive = product.status_registrasi === 'Aktif';
  const isAdmin = StorageService.getCurrentUser()?.role === 'Admin';
  const charColumns = getProductCharacteristicColumns(product);

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-in fade-in duration-200 py-2">
      {/* Top Breadcrumb & Navigation */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-700 hover:text-sky-800 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke Katalog Utama</span>
        </button>

        <div className="flex items-center gap-2">
          <span className="text-[11px] text-slate-500 hidden sm:inline">Halaman Produk Resmi BPOM:</span>
          <code className="text-[11px] font-mono bg-slate-100 text-slate-700 px-2 py-1 rounded border border-slate-200 select-all">
            /produk/{product.id}
          </code>
          <button
            onClick={handleShare}
            className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
            title="Bagikan Tautan Halaman Produk"
          >
            {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Share2 className="w-3.5 h-3.5 text-slate-600" />}
            <span>{copiedLink ? 'Tersalin' : 'Bagikan'}</span>
          </button>
        </div>
      </div>

      {/* Admin Action Bar: Download Certificates */}
      {isAdmin && (
        <div className="bg-gradient-to-r from-sky-950 to-slate-900 text-white p-4 rounded-2xl border border-sky-800 flex flex-wrap items-center justify-between gap-3 shadow-sm">
          <div className="flex items-center gap-2">
            <span className="bg-sky-500 text-sky-950 text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full">
              Khusus Administrator
            </span>
            <span className="text-xs font-bold text-sky-100">
              Dokumen Sertifikat Izin Edar Resmi Produk ({product.nomor_izin}):
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => exportCertificatePDF(product, producer)}
              className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors shadow-2xs"
              title="Unduh Dokumen Sertifikat Resmi (PDF)"
            >
              <FileDown className="w-4 h-4" />
              <span>Unduh Sertifikat PDF</span>
            </button>
            <button
              onClick={() => exportCertificateWord(product, producer)}
              className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors shadow-2xs"
              title="Unduh Dokumen Sertifikat Resmi (Word .doc)"
            >
              <FileText className="w-4 h-4" />
              <span>Unduh Sertifikat Word</span>
            </button>
          </div>
        </div>
      )}

      {/* Official Status Banner */}
      {isRecalled ? (
        <div className="bg-red-600 text-white rounded-2xl p-5 shadow-sm border border-red-700 space-y-2">
          <div className="flex items-center gap-2 text-red-100 font-bold text-xs uppercase tracking-wider">
            <AlertOctagon className="w-4 h-4 text-white animate-pulse" />
            <span>Public Warning BPOM RI — Status Produk Ditarik Dari Peredaran</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black">
            PERINGATAN: PRODUK TELAH DITARIK DARI PEREDARAN
          </h2>
          <p className="text-xs sm:text-sm text-red-100 leading-relaxed max-w-3xl">
            Berdasarkan hasil uji laboratorium dan pengawasan keamanan, produk ini terbukti mengandung zat terlarang atau tidak memenuhi standar baku mutu. Masyarakat diimbau untuk <strong>TIDAK MENGONSUMSI/MENGGUNAKAN</strong> produk ini!
          </p>
          {recall && (
            <div className="bg-red-800/80 p-3 rounded-xl text-xs space-y-1 mt-2 border border-red-500/50">
              <div className="font-bold">Nomor Batch Ditarik: {recall.nomor_batch}</div>
              <div>Bahaya Kesehatan: {recall.bahaya_kesehatan}</div>
              <div>Instruksi Penarikan: {recall.tindakan_rekomendasi}</div>
            </div>
          )}
        </div>
      ) : isExpired ? (
        <div className="bg-amber-500 text-slate-950 rounded-2xl p-4 shadow-sm border border-amber-600 flex items-center gap-3">
          <Clock className="w-6 h-6 shrink-0 text-slate-900" />
          <div>
            <h3 className="font-black text-sm sm:text-base">Masa Berlaku Izin Edar Telah Kedaluwarsa</h3>
            <p className="text-xs font-medium text-slate-900/90">
              Izin edar produk ini berakhir pada tanggal {product.tanggal_kedaluwarsa}. Produk tidak boleh diedarkan sebelum izin perpanjangan terbit.
            </p>
          </div>
        </div>
      ) : (
        <div className="bg-gradient-to-r from-emerald-700 to-teal-800 text-white rounded-2xl p-4 sm:p-5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-white/10 backdrop-blur-xs flex items-center justify-center shrink-0 border border-white/20">
              <ShieldCheck className="w-7 h-7 text-emerald-200" />
            </div>
            <div>
              <div className="text-[11px] font-bold text-emerald-200 uppercase tracking-wider flex items-center gap-1.5">
                <span>Verifikasi Resmi Terbit BPOM</span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                <span>Basis Data Terpadu</span>
              </div>
              <h2 className="text-lg sm:text-xl font-black text-white">
                PRODUK TERDAFTAR & MEMILIKI IZIN EDAR AKTIF
              </h2>
              <p className="text-xs text-emerald-100 mt-0.5">
                Nomor Izin Edar: <strong className="text-white font-mono">{product.nomor_izin}</strong> berlaku s/d {product.tanggal_kedaluwarsa}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
            <span className="bg-white/20 text-white border border-white/30 text-xs font-bold px-3 py-1.5 rounded-xl backdrop-blur-xs">
              Status: {product.status_registrasi}
            </span>
          </div>
        </div>
      )}

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Product Photo & Visual Barcode/QR */}
        <div className="space-y-6">
          {/* Product Media Card */}
          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs space-y-4">
            <div className="relative aspect-square rounded-xl bg-slate-100 overflow-hidden border border-slate-200/80 group">
              <img
                src={product.foto_url}
                alt={product.nama_produk}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                referrerPolicy="no-referrer"
              />
              <div className="absolute top-2.5 left-2.5 bg-slate-900/80 backdrop-blur-xs text-white text-[10px] font-black uppercase px-2 py-0.5 rounded-md">
                {product.kategori}
              </div>
              <div className="absolute bottom-2.5 right-2.5 bg-sky-900/90 backdrop-blur-xs text-sky-200 text-[10px] font-mono px-2 py-0.5 rounded-md border border-sky-400/30">
                Batch: {product.batch_nomor}
              </div>
            </div>

            <div className="text-center space-y-1 border-b border-slate-100 pb-3">
              <h3 className="font-black text-slate-900 text-base leading-tight">
                {product.nama_produk}
              </h3>
              <div className="text-xs text-slate-500 font-semibold">
                Merk: <span className="text-slate-800">{product.merk}</span>
              </div>
            </div>

            {/* Quick badges */}
            <div className="grid grid-cols-2 gap-2 text-center text-xs">
              <div className="p-2 rounded-lg bg-slate-50 border border-slate-200">
                <div className="text-[10px] text-slate-400 font-bold uppercase">Sediaan</div>
                <div className="font-bold text-slate-800 truncate">{product.bentuk_sediaan}</div>
              </div>
              <div className="p-2 rounded-lg bg-slate-50 border border-slate-200">
                <div className="text-[10px] text-slate-400 font-bold uppercase">Uji Lab</div>
                <div className={`font-bold truncate ${
                  product.status_uji_lab === 'Lulus' ? 'text-emerald-700' : 'text-red-600'
                }`}>
                  {product.status_uji_lab}
                </div>
              </div>
            </div>
          </div>

          {/* Barcode & QR Code Section (Requirement 2) */}
          <ProductBarcodeVisual
            product={product}
            size="md"
            showUrlActions={true}
          />

          {/* Report Button */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-center space-y-2">
            <div className="text-xs font-bold text-slate-800">Menemukan Masalah / Efek Samping?</div>
            <p className="text-[11px] text-slate-500 leading-tight">
              Laporkan jika menemukan produk palsu, efek samping berbahaya, atau tidak sesuai kemasan resmi.
            </p>
            <button
              onClick={() => onOpenReport(product)}
              className="w-full py-2 px-3 bg-red-700 hover:bg-red-800 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shadow-2xs"
            >
              <AlertTriangle className="w-3.5 h-3.5 text-amber-300" />
              <span>Laporkan Produk Ini ke BPOM</span>
            </button>
          </div>
        </div>

        {/* Right Column: Detailed Product Specs & Compliance */}
        <div className="lg:col-span-2 space-y-6">
          {/* Identity & Legal Information */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-black text-slate-900 text-sm uppercase tracking-wider flex items-center gap-2">
                <FileCheck2 className="w-4 h-4 text-sky-700" /> Informasi Legalitas & Registrasi
              </h3>
              <span className="text-[11px] font-mono text-slate-400">ID: {product.id}</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="space-y-1 p-3 rounded-xl bg-slate-50 border border-slate-200/70">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Nomor Izin Edar (NIE)
                </span>
                <div className="text-sm font-black font-mono text-sky-900 flex items-center gap-2">
                  <span>{product.nomor_izin}</span>
                </div>
                <div className="text-[10px] text-slate-500">Tercatat di sistem registrasi nasional BPOM</div>
              </div>

              <div className="space-y-1 p-3 rounded-xl bg-slate-50 border border-slate-200/70">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Masa Berlaku Izin
                </span>
                <div className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-slate-500" />
                  <span>{product.tanggal_terbit} s/d {product.tanggal_kedaluwarsa}</span>
                </div>
                <div className="text-[10px] text-slate-500">Masa aktif standar 5 tahun</div>
              </div>

              <div className="space-y-1 p-3 rounded-xl bg-slate-50 border border-slate-200/70 md:col-span-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                  <Building2 className="w-3.5 h-3.5 text-slate-500" /> Produsen / Industri Farmasi & Kosmetika
                </span>
                <div className="text-xs font-black text-slate-900">
                  {product.nama_produsen}
                </div>
                {producer && (
                  <div className="text-[11px] text-slate-600 pt-1 space-y-0.5">
                    <div>No. Izin Industri: <span className="font-mono">{producer.nomor_izin_industri}</span></div>
                    <div>Lokasi: {producer.alamat}, {producer.kota}, {producer.provinsi}</div>
                    <div className="flex flex-wrap gap-1 pt-1">
                      {producer.sertifikasi.map((s, i) => (
                        <span key={i} className="text-[9px] bg-slate-200/80 font-bold px-1.5 py-0.5 rounded text-slate-700">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Composition & Formulations */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
            <h3 className="font-black text-slate-900 text-sm uppercase tracking-wider flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-sky-700" /> Komposisi & Karakteristik Produk
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <div className="font-bold text-slate-700 mb-1">Deskripsi Produk:</div>
                <p className="text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-200/80">
                  {product.deskripsi}
                </p>
              </div>

              <div>
                <div className="font-bold text-slate-700 mb-1">Formula & Komposisi Bahan:</div>
                <div className="p-3 bg-sky-50/50 rounded-xl border border-sky-100 text-slate-800 font-mono text-[11px] leading-relaxed">
                  {product.komposisi}
                </div>
              </div>

              <div>
                <div className="font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-sky-700" />
                  <span>Karakteristik Fisik & Ketentuan Penyimpanan:</span>
                </div>
                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/80 space-y-2">
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                    {charColumns.map((col, idx) => (
                      <div
                        key={idx}
                        className={`bg-white p-2.5 rounded-lg border border-slate-200/70 ${
                          col.label.includes('Penyimpanan') ? 'col-span-2 sm:col-span-3' : ''
                        }`}
                      >
                        <span className="text-[10px] text-slate-400 font-bold block">{col.label}:</span>
                        <span className="font-semibold text-slate-800">{col.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Rincian Klinis Tambahan */}
              {(product.indikasi || product.aturan_pakai || product.kontraindikasi || product.penanggung_jawab) && (
                <div className="pt-2 border-t border-slate-100 space-y-3">
                  <div className="font-bold text-slate-700 flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-sky-700" />
                    <span>Petunjuk Penggunaan & Informasi Farmakologi Terdaftar:</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {product.indikasi && (
                      <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/70">
                        <span className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Indikasi & Khasiat:</span>
                        <p className="text-slate-700 leading-relaxed whitespace-pre-line">{product.indikasi}</p>
                      </div>
                    )}
                    {product.aturan_pakai && (
                      <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/70">
                        <span className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Dosis & Aturan Pakai:</span>
                        <p className="text-slate-700 leading-relaxed whitespace-pre-line">{product.aturan_pakai}</p>
                      </div>
                    )}
                    {product.kontraindikasi && (
                      <div className="bg-amber-50/70 p-3 rounded-xl border border-amber-200">
                        <span className="text-[10px] font-bold text-amber-900 uppercase block mb-1">Peringatan & Kontraindikasi:</span>
                        <p className="text-amber-900 leading-relaxed whitespace-pre-line">{product.kontraindikasi}</p>
                      </div>
                    )}
                    {product.penanggung_jawab && (
                      <div className="bg-sky-50/70 p-3 rounded-xl border border-sky-200">
                        <span className="text-[10px] font-bold text-sky-950 uppercase block mb-1">Apoteker Penanggung Jawab (PJT):</span>
                        <p className="text-sky-900 font-bold">{product.penanggung_jawab}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Laboratory Testing Results (PPPOMN) */}
          {labResult && (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <h3 className="font-black text-slate-900 text-sm uppercase tracking-wider flex items-center gap-2">
                    <FileCheck2 className="w-4 h-4 text-emerald-700" /> Riwayat Uji Laboratorium PPPOMN
                  </h3>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    Nomor Uji: <span className="font-mono font-bold text-slate-700">{labResult.nomor_uji}</span> • Tanggal: {labResult.tanggal_uji}
                  </div>
                </div>
                <span className={`px-2.5 py-1 rounded-full text-xs font-black ${
                  labResult.kesimpulan === 'MS'
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                    : 'bg-red-100 text-red-800 border border-red-300'
                }`}>
                  {labResult.kesimpulan === 'MS' ? 'MEMENUHI SYARAT (MS)' : 'TIDAK MEMENUHI SYARAT (TMS)'}
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] font-bold border-b border-slate-200">
                    <tr>
                      <th className="py-2 px-3">Parameter Uji</th>
                      <th className="py-2 px-3">Standar Acuan</th>
                      <th className="py-2 px-3">Hasil Analisis</th>
                      <th className="py-2 px-3 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {labResult.parameter_uji.map((p, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/60">
                        <td className="py-2 px-3 font-semibold text-slate-800">{p.parameter}</td>
                        <td className="py-2 px-3 text-slate-500">{p.standar}</td>
                        <td className="py-2 px-3 font-mono text-slate-700">{p.hasil}</td>
                        <td className="py-2 px-3 text-right">
                          <span className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-bold ${
                            p.status === 'Memenuhi Syarat'
                              ? 'bg-emerald-50 text-emerald-700'
                              : 'bg-red-50 text-red-700'
                          }`}>
                            {p.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs text-slate-600 space-y-1">
                <div className="font-bold text-slate-700">Catatan Analis Laboratorium:</div>
                <p>{labResult.catatan}</p>
                <div className="text-[10px] text-slate-400 pt-1">
                  Penguji: {labResult.penguji_nama} • {labResult.laboratorium_penguji}
                </div>
              </div>
            </div>
          )}

          {/* CRITICAL NOTICE (Requirement 3: User cannot download certificates/documents) */}
          <div className="bg-gradient-to-br from-slate-900 to-sky-950 text-white rounded-2xl p-5 border border-sky-800/40 shadow-sm space-y-3">
            <div className="flex items-center gap-2 text-sky-300 font-bold text-xs uppercase tracking-wider">
              <Lock className="w-4 h-4 text-emerald-400" />
              <span>Integritas Dokumen Digital & Perlindungan Sertifikat Negara</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Sesuai dengan regulasi keamanan dokumen digital dan surat edaran Badan Pengawasan Obat dan Makanan RI, <strong>pengunduhan berkas fisik sertifikat dan dokumen resmi dinonaktifkan untuk publik</strong> guna mencegah pemalsuan dokumen izin edar fisik dan rekayasa berkas.
            </p>
            <div className="bg-slate-800/80 p-3 rounded-xl text-xs space-y-1 text-slate-300 border border-slate-700">
              <div className="font-bold text-emerald-300 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5" /> Keabsahan Terverifikasi Digital Real-time
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Seluruh kepatuhan dan keabsahan produk ini telah terjamin dan tervalidasi secara resmi melalui barcode, QR code, dan basis data terintegrasi BPOM RI yang dapat dicek kapan pun melalui halaman ini.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
