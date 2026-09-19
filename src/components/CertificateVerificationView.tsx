import React, { useState } from 'react';
import {
  QrCode,
  ShieldCheck,
  Search,
  CheckCircle2,
  AlertCircle,
  Calendar,
  Building,
  ExternalLink,
  Award,
  Lock,
  FileDown,
  FileText,
} from 'lucide-react';
import { Product, Producer } from '../types';
import { exportCertificatePDF, exportCertificateWord } from '../utils/exportUtils';
import { StorageService } from '../services/storageService';

interface CertificateVerificationViewProps {
  products: Product[];
  producers: Producer[];
  onOpenProductDetail: (product: Product) => void;
}

export const CertificateVerificationView: React.FC<CertificateVerificationViewProps> = ({
  products,
  producers,
  onOpenProductDetail,
}) => {
  const [verifyQuery, setVerifyQuery] = useState('');
  const [verifiedProduct, setVerifiedProduct] = useState<Product | null>(products[0] || null);
  const [notFound, setNotFound] = useState(false);

  const handleVerify = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!verifyQuery.trim()) return;

    const clean = verifyQuery.trim().toLowerCase();
    const match = products.find(
      p =>
        p.nomor_izin.toLowerCase() === clean ||
        p.qr_code_hash.toLowerCase() === clean ||
        p.barcode.toLowerCase() === clean ||
        p.nama_produk.toLowerCase().includes(clean)
    );

    if (match) {
      setVerifiedProduct(match);
      setNotFound(false);
    } else {
      setVerifiedProduct(null);
      setNotFound(true);
    }
  };

  const associatedProducer = verifiedProduct
    ? producers.find(pr => pr.id === verifiedProduct.produsen_id)
    : undefined;

  return (
    <div className="space-y-6">
      {/* Hero */}
      <div className="bg-gradient-to-r from-sky-950 via-slate-900 to-indigo-950 text-white p-6 sm:p-8 rounded-2xl shadow-xl border border-sky-800">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 bg-sky-500/20 border border-sky-400/30 rounded-full px-3 py-1 text-xs font-semibold text-sky-200 mb-2">
            <Lock className="w-3.5 h-3.5 text-sky-400" />
            Layanan Otentikasi Sertifikat Elektronik Balai Sertifikasi Elektronik (BSrE)
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Verifikasi Keaslian Sertifikat Digital BPOM
          </h1>
          <p className="text-sky-100/80 text-xs sm:text-sm mt-1 leading-relaxed">
            Periksa validitas tanda tangan digital, hash kriptografi integritas dokumen, dan sertifikat izin edar resmi yang diterbitkan oleh Badan Pengawasan Obat dan Makanan Republik Indonesia.
          </p>

          <form onSubmit={handleVerify} className="mt-5 flex gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={verifyQuery}
                onChange={(e) => {
                  setVerifyQuery(e.target.value);
                  setNotFound(false);
                }}
                placeholder="Masukkan Nomor Izin Edar (e.g. NA18230104921) atau Hash Dokumen..."
                className="w-full pl-10 pr-4 py-3 bg-white text-slate-900 rounded-xl text-xs font-medium focus:ring-2 focus:ring-sky-400 shadow-sm"
              />
            </div>
            <button
              type="submit"
              className="px-5 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-md transition-all active:scale-95 shrink-0"
            >
              Verifikasi Sekarang
            </button>
          </form>
        </div>
      </div>

      {/* Verification Result */}
      {notFound && (
        <div className="bg-red-50 border-2 border-red-300 rounded-xl p-6 text-center shadow-xs">
          <AlertCircle className="w-10 h-10 text-red-600 mx-auto mb-2" />
          <h3 className="font-bold text-red-900 text-base">Sertifikat Tidak Ditemukan dalam Basis Data</h3>
          <p className="text-xs text-red-700 max-w-md mx-auto mt-1">
            Nomor registrasi atau tanda tangan digital yang Anda masukkan tidak terdaftar di sistem BPOM. Waspadai produk ilegal atau pemalsuan nomor izin edar!
          </p>
        </div>
      )}

      {verifiedProduct && (
        <div className="bg-white rounded-2xl border-2 border-sky-300 shadow-xl overflow-hidden animate-in fade-in duration-200">
          {/* Status Bar */}
          <div className="bg-gradient-to-r from-emerald-800 to-teal-800 text-white px-6 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold">
              <CheckCircle2 className="w-5 h-5 text-emerald-300" />
              <span>DOKUMEN RESMI TERVERIFIKASI & MEMILIKI KEKUATAN HUKUM</span>
            </div>
            <span className="text-[11px] bg-white/20 px-2.5 py-0.5 rounded-full font-mono">
              BSrE Certified
            </span>
          </div>

          {/* Certificate View Canvas */}
          <div className="p-6 sm:p-10 relative bg-linear-to-b from-amber-50/30 to-white">
            {/* Watermark Logo */}
            <div className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none select-none">
              <ShieldCheck className="w-96 h-96 text-slate-900" />
            </div>

            {/* Inner Certificate Border */}
            <div className="border-4 border-double border-sky-900/40 p-6 sm:p-8 rounded-xl relative z-10 bg-white/80 backdrop-blur-xs space-y-6">
              {/* Header */}
              <div className="text-center space-y-1">
                <div className="text-xs font-bold text-slate-800 tracking-widest uppercase">
                  Republik Indonesia
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-sky-950 uppercase tracking-tight">
                  Badan Pengawas Obat dan Makanan
                </h2>
                <p className="text-[11px] text-slate-500">
                  Jl. Percetakan Negara No. 23, Jakarta 10560 | www.pom.go.id
                </p>
                <div className="w-32 h-0.5 bg-sky-900 mx-auto mt-2" />
              </div>

              {/* Title */}
              <div className="text-center space-y-1">
                <h3 className="text-base font-black text-slate-900 uppercase underline tracking-wider">
                  Sertifikat Persetujuan Pendaftaran Izin Edar
                </h3>
                <div className="font-mono text-xs font-bold text-sky-800">
                  Nomor Pendaftaran: {verifiedProduct.nomor_izin}
                </div>
              </div>

              {/* Details table */}
              <div className="space-y-2 text-xs max-w-xl mx-auto divide-y divide-slate-200">
                <div className="flex justify-between py-1.5">
                  <span className="text-slate-500 font-semibold">Nama Produk:</span>
                  <span className="font-bold text-slate-900 text-right">{verifiedProduct.nama_produk}</span>
                </div>
                <div className="flex justify-between py-1.5">
                  <span className="text-slate-500 font-semibold">Merk Dagang:</span>
                  <span className="font-bold text-slate-900 text-right">{verifiedProduct.merk || '-'}</span>
                </div>
                <div className="flex justify-between py-1.5">
                  <span className="text-slate-500 font-semibold">Kategori Produk:</span>
                  <span className="font-bold text-sky-900 text-right">{verifiedProduct.kategori}</span>
                </div>
                <div className="flex justify-between py-1.5">
                  <span className="text-slate-500 font-semibold">Bentuk Sediaan:</span>
                  <span className="font-medium text-slate-800 text-right">{verifiedProduct.bentuk_sediaan}</span>
                </div>
                <div className="flex justify-between py-1.5">
                  <span className="text-slate-500 font-semibold">Produsen / Pendaftar:</span>
                  <span className="font-bold text-slate-900 text-right">{verifiedProduct.nama_produsen}</span>
                </div>
                <div className="flex justify-between py-1.5">
                  <span className="text-slate-500 font-semibold">Status Pengujian Lab:</span>
                  <span className="font-bold text-emerald-700 text-right">
                    {verifiedProduct.status_uji_lab} (Memenuhi Persyaratan Mutu)
                  </span>
                </div>
                <div className="flex justify-between py-1.5">
                  <span className="text-slate-500 font-semibold">Masa Berlaku:</span>
                  <span className="font-bold text-slate-800 text-right">
                    {verifiedProduct.tanggal_terbit} s/d {verifiedProduct.tanggal_kedaluwarsa}
                  </span>
                </div>
              </div>

              {/* Cryptographic Hash Security Box */}
              <div className="bg-slate-900 text-white rounded-lg p-3.5 text-xs flex items-center justify-between gap-4">
                <div>
                  <span className="text-[10px] text-sky-400 font-bold block uppercase tracking-wider">
                    Digital Signature SHA-256 Hash Integrity:
                  </span>
                  <span className="font-mono text-[11px] text-slate-300 break-all">
                    {verifiedProduct.qr_code_hash}
                  </span>
                </div>
                <div className="w-10 h-10 rounded bg-white p-1 shrink-0">
                  <QrCode className="w-full h-full text-slate-900" />
                </div>
              </div>

              {/* Footer Actions inside certificate */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-200">
                <button
                  onClick={() => onOpenProductDetail(verifiedProduct)}
                  className="text-sky-800 hover:text-sky-950 font-bold text-xs flex items-center gap-1"
                >
                  <ExternalLink className="w-4 h-4" /> Buka Halaman Lengkap Produk
                </button>

                {StorageService.getCurrentUser()?.role === 'Admin' ? (
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black uppercase bg-sky-100 text-sky-900 px-2 py-0.5 rounded">
                      Admin
                    </span>
                    <button
                      onClick={() => exportCertificatePDF(verifiedProduct, associatedProducer)}
                      className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold flex items-center gap-1 transition-colors shadow-2xs"
                      title="Unduh Sertifikat PDF"
                    >
                      <FileDown className="w-3.5 h-3.5" />
                      <span>PDF</span>
                    </button>
                    <button
                      onClick={() => exportCertificateWord(verifiedProduct, associatedProducer)}
                      className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold flex items-center gap-1 transition-colors shadow-2xs"
                      title="Unduh Sertifikat Word (.doc)"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>Word</span>
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-xs text-slate-600 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200">
                    <Lock className="w-3.5 h-3.5 text-sky-800 shrink-0" />
                    <span className="text-[11px] font-medium">
                      Integritas Digital: Pengunduhan fisik berkas dinonaktifkan demi mencegah rekayasa dokumen
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
