import React, { useState } from 'react';
import {
  FlaskRound,
  Search,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  ShieldCheck,
  Sparkles,
  BookOpen,
  Info,
} from 'lucide-react';
import { HAZARDOUS_SUBSTANCES_DB } from '../data/initialData';
import { HazardousSubstance } from '../types';

export const IngredientChecker: React.FC = () => {
  const [inputText, setInputText] = useState('');
  const [analyzed, setAnalyzed] = useState(false);
  const [detectedSubstances, setDetectedSubstances] = useState<
    { item: HazardousSubstance; matchedWord: string }[]
  >([]);

  const handleAnalyze = () => {
    if (!inputText.trim()) return;

    const lower = inputText.toLowerCase();
    const matches: { item: HazardousSubstance; matchedWord: string }[] = [];

    HAZARDOUS_SUBSTANCES_DB.forEach(sub => {
      // Check main name
      const allAliases = [sub.nama.toLowerCase(), ...sub.alias.map(a => a.toLowerCase())];
      for (const word of allAliases) {
        if (lower.includes(word)) {
          matches.push({ item: sub, matchedWord: word });
          break;
        }
      }
    });

    setDetectedSubstances(matches);
    setAnalyzed(true);
  };

  const setSample = (type: 'danger-cosmetic' | 'safe-skincare' | 'danger-food') => {
    if (type === 'danger-cosmetic') {
      setInputText(
        'Water, Mineral Oil, Stearic Acid, Mercury (Air Raksa 480ppm), Hydroquinone 5%, Cetyl Alcohol, Fragrance, Parabens'
      );
    } else if (type === 'safe-skincare') {
      setInputText(
        'Aqua, Centella Asiatica Extract, Niacinamide 4%, Sodium Hyaluronate, Panthenol, Ceramide NP, Glycerin, Allantoin'
      );
    } else {
      setInputText(
        'Tepung Tapioka, Daging Sapi Pilihan, Garam, MSG, Pengawet Boraks (Asam Borat), Pewarna Tekstil Rhodamin B (CI 45170)'
      );
    }
    setAnalyzed(false);
  };

  return (
    <div className="space-y-6">
      {/* Hero */}
      <div className="bg-gradient-to-r from-indigo-950 via-slate-900 to-sky-950 text-white p-6 sm:p-8 rounded-2xl shadow-xl border border-indigo-800">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 bg-indigo-500/20 border border-indigo-400/30 rounded-full px-3 py-1 text-xs font-semibold text-indigo-200 mb-2">
            <FlaskRound className="w-3.5 h-3.5 text-indigo-400" />
            Pemeriksa Keamanan Komposisi & Bahan Baku
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Cek Komposisi & Deteksi Bahan Berbahaya
          </h1>
          <p className="text-indigo-100/80 text-xs sm:text-sm mt-1 leading-relaxed">
            Tempelkan daftar komposisi (Ingredients) dari label kemasan kosmetik, makanan, atau obat untuk memeriksa ada tidaknya kandungan zat terlarang seperti Merkuri, Hidrokuinon, Rhodamin B, Steroid, atau Formalin.
          </p>
        </div>
      </div>

      {/* Input Section */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
            Daftar Komposisi / Ingredients:
          </label>
          <textarea
            value={inputText}
            onChange={(e) => {
              setInputText(e.target.value);
              setAnalyzed(false);
            }}
            placeholder="Contoh: Aqua, Glycerin, Niacinamide, Stearic Acid, ..."
            className="w-full h-32 p-3.5 border border-slate-300 rounded-xl text-xs font-mono focus:ring-2 focus:ring-sky-500 focus:outline-hidden"
          />
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 flex-wrap text-xs">
            <span className="text-slate-400 font-semibold flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" /> Uji Sampel:
            </span>
            <button
              onClick={() => setSample('danger-cosmetic')}
              className="px-2.5 py-1 bg-red-50 hover:bg-red-100 text-red-700 rounded-md border border-red-200 font-medium"
            >
              Krim Bermerkuri & Hidrokuinon
            </button>
            <button
              onClick={() => setSample('danger-food')}
              className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-800 rounded-md border border-amber-200 font-medium"
            >
              Makanan Boraks & Rhodamin
            </button>
            <button
              onClick={() => setSample('safe-skincare')}
              className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-md border border-emerald-200 font-medium"
            >
              Skincare Alami Aman
            </button>
          </div>

          <button
            onClick={handleAnalyze}
            disabled={!inputText.trim()}
            className="bg-sky-800 hover:bg-sky-900 disabled:opacity-50 text-white font-bold px-5 py-2.5 rounded-xl text-xs flex items-center gap-2 transition-all shadow-md active:scale-95"
          >
            <Search className="w-4 h-4" /> Analisis Komposisi Sekarang
          </button>
        </div>
      </div>

      {/* Analysis Results */}
      {analyzed && (
        <div className="space-y-4 animate-in fade-in duration-200">
          {detectedSubstances.length > 0 ? (
            <div className="bg-red-50 border-2 border-red-300 rounded-xl p-5 shadow-xs">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-red-100 text-red-600 flex items-center justify-center shrink-0">
                  <XCircle className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-red-900">
                    PERINGATAN: Terdeteksi {detectedSubstances.length} Kandungan Zat Berbahaya!
                  </h3>
                  <p className="text-xs text-red-700 mt-0.5">
                    Produk dengan komposisi ini melanggar peraturan perundang-undangan dan berisiko tinggi merusak kesehatan tubuh.
                  </p>
                </div>
              </div>

              <div className="mt-4 space-y-3">
                {detectedSubstances.map(({ item, matchedWord }, idx) => (
                  <div
                    key={idx}
                    className="bg-white rounded-lg p-4 border border-red-200 text-xs shadow-2xs space-y-2"
                  >
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <span className="font-bold text-red-700 text-sm">{item.nama}</span>
                      <span className="bg-red-600 text-white text-[10px] font-bold px-2 py-0.5 rounded uppercase">
                        {item.kategori_bahaya}
                      </span>
                    </div>

                    <div className="text-slate-600">
                      Kata kunci terdeteksi dalam teks: <strong className="text-red-600 font-mono">"{matchedWord}"</strong>
                    </div>

                    <div className="bg-slate-50 p-2.5 rounded border border-slate-200">
                      <span className="font-semibold text-slate-700 block">Dampak Kesehatan:</span>
                      <p className="text-slate-600 mt-0.5">{item.dampak_kesehatan}</p>
                    </div>

                    <div className="text-[11px] text-slate-500 italic">
                      Regulasi: {item.aturan_regulasi}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="bg-emerald-50 border-2 border-emerald-300 rounded-xl p-6 text-center shadow-xs">
              <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-2">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <h3 className="text-base font-bold text-emerald-900">
                Tidak Ditemukan Zat Terlarang yang Masuk Daftar Bahaya Utama
              </h3>
              <p className="text-xs text-emerald-700 max-w-md mx-auto mt-1">
                Bahan yang Anda masukkan tidak mengandung senyawa berbahaya (Merkuri, Hidrokuinon, Steroid, Boraks, Rhodamin B, dll). Pastikan produk tetap memiliki Nomor Izin Edar resmi BPOM sebelum digunakan.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Encyclopedia of Regulated Substances */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
        <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-sky-700" />
          Kamus Bahan Berbahaya & Terlarang (Daftar Pengawasan BPOM)
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {HAZARDOUS_SUBSTANCES_DB.map((sub, idx) => (
            <div key={idx} className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs space-y-1">
              <div className="flex justify-between items-start">
                <span className="font-bold text-slate-800">{sub.nama}</span>
                <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                  sub.kategori_bahaya === 'Dilarang Keras' ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-800'
                }`}>
                  {sub.kategori_bahaya}
                </span>
              </div>
              <p className="text-slate-600 text-[11px] leading-relaxed">{sub.dampak_kesehatan}</p>
              <div className="text-[10px] text-sky-800 font-medium pt-1">
                Alias: {sub.alias.slice(0, 3).join(', ')}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
