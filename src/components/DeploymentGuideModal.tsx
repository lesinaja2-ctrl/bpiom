import React, { useState } from 'react';
import {
  ExternalLink,
  Terminal,
  Check,
  Copy,
  Layers,
  Globe,
  Rocket,
  ShieldCheck,
  X,
} from 'lucide-react';

interface DeploymentGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DeploymentGuideModal: React.FC<DeploymentGuideModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [copiedCmd, setCopiedCmd] = useState<string | null>(null);

  if (!isOpen) return null;

  const copyText = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCmd(id);
    setTimeout(() => setCopiedCmd(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[92vh] overflow-hidden flex flex-col shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 via-sky-950 to-indigo-950 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center border border-white/20">
              <Rocket className="w-5 h-5 text-sky-400" />
            </div>
            <div>
              <h3 className="font-bold text-lg leading-tight">Panduan Deploy ke Vercel (bpom.vercel.app) & Supabase</h3>
              <p className="text-xs text-slate-300">Siap deploy 100% dengan konfigurasi berkas vercel.json & integrasi Supabase Cloud</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/25 flex items-center justify-center text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-5 text-xs">
          {/* Method 1: Vercel One-Click / GitHub */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <Globe className="w-4 h-4 text-sky-600" /> Metode 1: Deploy ke Vercel via GitHub (Rekomendasi)
              </span>
              <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded">
                Gratis & Otomatis CI/CD
              </span>
            </div>

            <ol className="list-decimal pl-5 space-y-2 text-slate-600">
              <li>
                Push repositori aplikasi ini ke akun <strong>GitHub / GitLab</strong> Anda.
              </li>
              <li>
                Buka dashboard <a href="https://vercel.com" target="_blank" rel="noreferrer" className="text-sky-700 font-bold underline inline-flex items-center gap-0.5">Vercel.com <ExternalLink className="w-3 h-3" /></a> dan klik <strong>Add New... &rarr; Project</strong>.
              </li>
              <li>
                Pilih repositori Anda. Vercel akan otomatis mendeteksi konfigurasi:
                <div className="bg-white p-2.5 rounded-lg border border-slate-200 my-1 font-mono text-[11px] text-slate-700 space-y-1">
                  <div>• Framework Preset: <strong>Vite</strong></div>
                  <div>• Root Directory: <strong>./</strong></div>
                  <div>• Build Command: <strong>npm run build</strong></div>
                  <div>• Output Directory: <strong>dist</strong></div>
                </div>
              </li>
              <li>
                <strong>Konfigurasi Environment Variables di Vercel:</strong>
                <p className="pt-1 text-slate-600">
                  Buka bagian <em>Environment Variables</em> di Vercel dan tambahkan kredensial Supabase Anda:
                </p>
                <div className="bg-slate-900 text-emerald-300 p-2.5 rounded-lg font-mono text-[11px] space-y-1 my-1">
                  <div>VITE_SUPABASE_URL=https://your-project.supabase.co</div>
                  <div>VITE_SUPABASE_ANON_KEY=your-supabase-anon-key</div>
                </div>
              </li>
              <li>
                Klik <strong>Deploy</strong>. Berkas <code className="bg-slate-200 px-1 py-0.5 rounded font-mono">vercel.json</code> yang sudah kami sertakan di root proyek akan menangani SPA rewrites ke <code className="bg-slate-200 px-1 py-0.5 rounded font-mono">/index.html</code> secara otomatis sehingga rute manual <code className="bg-slate-200 px-1 py-0.5 rounded font-mono">/administrasi</code> dan halaman produk berjalan sempurna!
              </li>
            </ol>
          </div>

          {/* Method 2: Vercel CLI */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
            <div className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <Terminal className="w-4 h-4 text-purple-600" /> Metode 2: Deploy Cepat via Terminal (Vercel CLI)
            </div>

            <div className="space-y-2">
              <p className="text-slate-600">
                Jalankan perintah ini pada folder lokal proyek Anda untuk live dalam 30 detik:
              </p>

              <div className="bg-slate-900 text-slate-100 rounded-xl p-3 font-mono text-[11px] flex items-center justify-between">
                <span>npm install -g vercel && vercel --prod</span>
                <button
                  onClick={() => copyText('npm install -g vercel && vercel --prod', 'v-cli')}
                  className="bg-white/10 hover:bg-white/20 text-white px-2.5 py-1 rounded text-xs flex items-center gap-1"
                >
                  {copiedCmd === 'v-cli' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  {copiedCmd === 'v-cli' ? 'Tersalin' : 'Salin'}
                </button>
              </div>
            </div>
          </div>

          {/* Method 3: Netlify Drag and Drop or CLI */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
            <div className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <Layers className="w-4 h-4 text-teal-600" /> Metode 3: Deploy ke Netlify
            </div>

            <ol className="list-decimal pl-5 space-y-1.5 text-slate-600">
              <li>
                Jalankan perintah build lokal:
                <div className="bg-slate-900 text-slate-100 rounded-lg p-2 font-mono text-[11px] my-1 flex justify-between items-center">
                  <span>npm run build</span>
                  <button
                    onClick={() => copyText('npm run build', 'b-cli')}
                    className="text-white/70 hover:text-white"
                  >
                    {copiedCmd === 'b-cli' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  </button>
                </div>
              </li>
              <li>
                Buka <a href="https://app.netlify.com/drop" target="_blank" rel="noreferrer" className="text-teal-700 font-bold underline inline-flex items-center gap-0.5">Netlify Drop <ExternalLink className="w-3 h-3" /></a>, lalu seret (drag & drop) folder <code className="bg-slate-200 px-1 py-0.5 rounded font-mono">dist</code> ke area peramban.
              </li>
              <li>
                Aplikasi Anda langsung aktif seketika dengan domain gratis SSL HTTPS!
              </li>
            </ol>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-sky-800 hover:bg-sky-900 text-white font-bold rounded-lg"
          >
            Mengerti & Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
