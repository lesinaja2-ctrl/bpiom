import React from 'react';
import { CustomPage } from '../types';
import {
  FileText,
  Calendar,
  User,
  ArrowLeft,
  Share2,
  Check,
  Tag,
  ShieldCheck,
} from 'lucide-react';

interface CustomPageViewProps {
  page: CustomPage;
  allPages: CustomPage[];
  onBack: () => void;
  onSelectPage: (page: CustomPage) => void;
}

export const CustomPageView: React.FC<CustomPageViewProps> = ({
  page,
  allPages,
  onBack,
  onSelectPage,
}) => {
  const [copied, setCopied] = React.useState(false);

  const handleShare = () => {
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://bpom.vercel.app';
    const url = `${origin}/halaman/${page.slug}`;
    if (navigator.share) {
      navigator.share({
        title: page.judul,
        text: page.ringkasan,
        url: url,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const otherPages = allPages.filter((p) => p.id !== page.id && p.status === 'Publikasi');

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-200 py-2">
      {/* Top Breadcrumbs */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-700 hover:text-sky-800 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke Beranda</span>
        </button>

        <div className="flex items-center gap-2">
          <code className="text-[11px] font-mono bg-slate-100 text-slate-700 px-2 py-1 rounded border border-slate-200">
            /halaman/{page.slug}
          </code>
          <button
            onClick={handleShare}
            className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Share2 className="w-3.5 h-3.5 text-slate-600" />}
            <span>{copied ? 'Tersalin' : 'Bagikan'}</span>
          </button>
        </div>
      </div>

      {/* Main Article Container */}
      <article className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
        {/* Header */}
        <div className="border-b border-slate-200 pb-5 space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wider bg-sky-100 text-sky-800 px-2.5 py-0.5 rounded-full flex items-center gap-1">
              <Tag className="w-2.5 h-2.5" /> {page.kategori}
            </span>
            <span className="text-slate-300">•</span>
            <span className="text-xs text-slate-500 flex items-center gap-1">
              <Calendar className="w-3 h-3 text-slate-400" /> Diperbarui: {page.terakhir_diperbarui}
            </span>
            <span className="text-slate-300">•</span>
            <span className="text-xs text-slate-500 flex items-center gap-1">
              <User className="w-3 h-3 text-slate-400" /> {page.penulis}
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-snug">
            {page.judul}
          </h1>

          <p className="text-sm text-slate-600 font-medium leading-relaxed bg-slate-50 p-3.5 rounded-xl border border-slate-200/80">
            {page.ringkasan}
          </p>
        </div>

        {/* Content Body */}
        <div
          className="prose prose-slate max-w-none text-xs sm:text-sm text-slate-700 leading-relaxed space-y-4"
          dangerouslySetInnerHTML={{ __html: page.konten }}
        />

        {/* Footer Seal */}
        <div className="mt-8 pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 bg-slate-50/70 p-4 rounded-xl border">
          <div className="flex items-center gap-2 font-medium">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Dokumen Informasi Resmi Badan Pengawasan Obat dan Makanan RI</span>
          </div>
          <div className="text-[11px] text-slate-400">
            Terbitan Terdaftar di Portal BPOM
          </div>
        </div>
      </article>

      {/* Other Pages list */}
      {otherPages.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3">
          <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5 text-sky-700" /> Halaman & Informasi Lainnya
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {otherPages.map((p) => (
              <button
                key={p.id}
                onClick={() => onSelectPage(p)}
                className="text-left p-3 rounded-xl border border-slate-200 hover:border-sky-300 hover:bg-sky-50/40 transition-all space-y-1 group"
              >
                <div className="text-xs font-bold text-slate-800 group-hover:text-sky-800 line-clamp-1">
                  {p.judul}
                </div>
                <p className="text-[11px] text-slate-500 line-clamp-2 leading-tight">
                  {p.ringkasan}
                </p>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
