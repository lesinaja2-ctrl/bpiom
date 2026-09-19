import React, { useState } from 'react';
import {
  Database,
  Cloud,
  Sheet,
  Copy,
  Check,
  ExternalLink,
  Play,
  RotateCcw,
  Sparkles,
  AlertCircle,
  X,
  ShieldCheck,
} from 'lucide-react';
import { AppConfig } from '../types';
import { GOOGLE_APPS_SCRIPT_CODE } from '../services/googleAppsScriptTemplate';
import { SUPABASE_SQL_SCHEMA } from '../services/supabaseSchema';
import { SupabaseService } from '../services/supabaseService';

interface DatabaseSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: AppConfig;
  onSaveConfig: (newConfig: AppConfig) => void;
  onResetData: () => void;
}

export const DatabaseSyncModal: React.FC<DatabaseSyncModalProps> = ({
  isOpen,
  onClose,
  config,
  onSaveConfig,
  onResetData,
}) => {
  const [activeTab, setActiveTab] = useState<'sheets' | 'supabase' | 'mode'>('sheets');
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedSql, setCopiedSql] = useState(false);
  const [testingConnection, setTestingConnection] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; msg: string } | null>(null);

  const [formConfig, setFormConfig] = useState<AppConfig>({ ...config });

  if (!isOpen) return null;

  const handleCopyGAS = () => {
    navigator.clipboard.writeText(GOOGLE_APPS_SCRIPT_CODE);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2500);
  };

  const handleCopySql = () => {
    navigator.clipboard.writeText(SUPABASE_SQL_SCHEMA);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2500);
  };

  const handleTestGAS = async () => {
    if (!formConfig.google_script_url) {
      setTestResult({ success: false, msg: 'Masukkan URL Google Apps Script terlebih dahulu.' });
      return;
    }

    setTestingConnection(true);
    setTestResult(null);
    try {
      const pingUrl = `${formConfig.google_script_url}${formConfig.google_script_url.includes('?') ? '&' : '?'}action=ping`;
      const res = await fetch(pingUrl);
      const json = await res.json();
      if (json.success) {
        setTestResult({ success: true, msg: 'Koneksi Berhasil! Google Apps Script & Spreadsheet aktif.' });
        setFormConfig(p => ({ ...p, is_connected: true }));
      } else {
        setTestResult({ success: false, msg: 'Menerima respon, namun status belum siap: ' + JSON.stringify(json) });
      }
    } catch (e: any) {
      setTestResult({
        success: false,
        msg: 'Gagal terhubung. Pastikan Web App di-deploy dengan akses "Anyone" (Siapa saja).',
      });
    } finally {
      setTestingConnection(false);
    }
  };

  const handleTriggerAutoSetup = async () => {
    if (!formConfig.google_script_url) {
      setTestResult({ success: false, msg: 'Masukkan URL Google Apps Script terlebih dahulu.' });
      return;
    }

    setTestingConnection(true);
    setTestResult(null);
    try {
      const setupUrl = `${formConfig.google_script_url}${formConfig.google_script_url.includes('?') ? '&' : '?'}action=setup`;
      const res = await fetch(setupUrl);
      const json = await res.json();
      if (json.success) {
        setTestResult({
          success: true,
          msg: 'Luar biasa! Seluruh 7 Sheet (Produk, Kategori, Produsen, UjiLaborat, PenarikanProduk, PengaduanMasyarakat, Users) telah dibuat otomatis di Spreadsheet Anda!',
        });
      }
    } catch (e) {
      setTestResult({
        success: false,
        msg: 'Inisialisasi otomatis gagal dihubungi. Jalankan manual fungsi `setupDatabaseSheets` langsung di editor Apps Script.',
      });
    } finally {
      setTestingConnection(false);
    }
  };

  const handleSave = () => {
    onSaveConfig(formConfig);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[92vh] overflow-hidden flex flex-col shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-sky-950 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center border border-white/20">
              <Database className="w-5 h-5 text-emerald-300" />
            </div>
            <div>
              <h3 className="font-bold text-lg leading-tight">Pengaturan Database & Integrasi Cloud</h3>
              <p className="text-xs text-teal-100">
                Hubungkan ke Google Sheets (CRUD otomatis), Google Drive, dan Database Supabase
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
            onClick={() => setActiveTab('sheets')}
            className={`pb-2.5 px-3 border-b-2 flex items-center gap-1.5 transition-colors ${
              activeTab === 'sheets'
                ? 'border-emerald-600 text-emerald-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Sheet className="w-4 h-4 text-emerald-600" /> Google Sheets & Drive Otomatis
          </button>
          <button
            onClick={() => setActiveTab('supabase')}
            className={`pb-2.5 px-3 border-b-2 flex items-center gap-1.5 transition-colors ${
              activeTab === 'supabase'
                ? 'border-emerald-600 text-emerald-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Database className="w-4 h-4 text-indigo-600" /> Database Supabase
          </button>
          <button
            onClick={() => setActiveTab('mode')}
            className={`pb-2.5 px-3 border-b-2 flex items-center gap-1.5 transition-colors ${
              activeTab === 'mode'
                ? 'border-emerald-600 text-emerald-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Cloud className="w-4 h-4 text-sky-600" /> Mode Backend & Reset Data
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-4 text-xs">
          {/* TAB 1: GOOGLE SHEETS & DRIVE */}
          {activeTab === 'sheets' && (
            <div className="space-y-4">
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-emerald-950 space-y-2">
                <div className="font-bold flex items-center gap-2 text-sm text-emerald-800">
                  <Sparkles className="w-4 h-4 text-emerald-600" />
                  Inisialisasi Otomatis: Tanpa Perlu Buat Sheet Manual!
                </div>
                <p className="leading-relaxed">
                  Skrip berikut memiliki fungsi <code className="bg-white px-1.5 py-0.5 rounded border border-emerald-300 font-bold">setupDatabaseSheets()</code> yang secara otomatis membuat 7 sheet terpisah (<strong>Produk</strong>, <strong>Kategori</strong>, <strong>Produsen</strong>, <strong>UjiLaborat</strong>, <strong>PenarikanProduk</strong>, <strong>PengaduanMasyarakat</strong>, <strong>Users</strong>), mewarnai header, membekukan baris atas, dan menyiapkan upload file langsung ke Google Drive.
                </p>
              </div>

              {/* Steps */}
              <div className="space-y-2">
                <div className="font-bold text-slate-800 text-xs">Langkah Mudah Pemasangan (2 Menit):</div>
                <ol className="list-decimal pl-5 space-y-1.5 text-slate-600">
                  <li>
                    Buka <a href="https://sheets.new" target="_blank" rel="noreferrer" className="text-sky-700 font-bold underline inline-flex items-center gap-0.5">sheets.new <ExternalLink className="w-3 h-3" /></a> untuk membuat Google Spreadsheet baru.
                  </li>
                  <li>
                    Di menu atas Spreadsheet, klik <strong>Ekstensi (Extensions)</strong> &rarr; <strong>Apps Script</strong>.
                  </li>
                  <li>
                    Klik tombol <strong>"Salin Skrip Google Apps Script"</strong> di bawah, hapus semua kode bawaan di editor, lalu tempelkan.
                  </li>
                  <li>
                    Pilih fungsi <strong>setupDatabaseSheets</strong> di dropdown atas lalu klik <strong>Run</strong> (atau panggil lewat tombol di bawah).
                  </li>
                  <li>
                    Klik tombol biru <strong>Terapkan (Deploy)</strong> &rarr; <strong>Penerapan Baru (New Deployment)</strong> &rarr; Pilih jenis <strong>Aplikasi Web (Web App)</strong>.
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      • Jalankan sebagai: <strong>Saya (Me)</strong><br />
                      • Siapa yang memiliki akses: <strong>Siapa saja (Anyone)</strong>
                    </div>
                  </li>
                  <li>Tempelkan Web App URL yang Anda peroleh ke kolom di bawah ini.</li>
                </ol>
              </div>

              {/* Copy Script Button */}
              <div className="flex items-center gap-3 bg-slate-900 text-white p-3 rounded-xl justify-between">
                <div>
                  <span className="font-bold block text-slate-200">GoogleAppsScript_Code.gs</span>
                  <span className="text-[11px] text-slate-400">Termasuk CRUD Sheets & File Upload ke Drive</span>
                </div>
                <button
                  onClick={handleCopyGAS}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-3.5 py-1.5 rounded-lg flex items-center gap-1.5 text-xs transition-colors shadow-xs"
                >
                  {copiedCode ? <Check className="w-4 h-4 text-white" /> : <Copy className="w-4 h-4" />}
                  {copiedCode ? 'Tersalin!' : 'Salin Skrip Lengkap'}
                </button>
              </div>

              {/* Input URL */}
              <div className="space-y-2">
                <label className="font-bold text-slate-800 block">
                  Google Apps Script Web App URL:
                </label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={formConfig.google_script_url}
                    onChange={(e) => setFormConfig({ ...formConfig, google_script_url: e.target.value })}
                    placeholder="https://script.google.com/macros/s/.../exec"
                    className="flex-1 p-2.5 border border-slate-300 rounded-lg font-mono text-xs"
                  />
                  <button
                    onClick={handleTestGAS}
                    disabled={testingConnection}
                    className="px-3 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-lg font-bold flex items-center gap-1 shrink-0"
                  >
                    <Play className="w-3.5 h-3.5" /> Uji Koneksi
                  </button>
                  <button
                    onClick={handleTriggerAutoSetup}
                    disabled={testingConnection}
                    className="px-3 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg font-bold flex items-center gap-1 shrink-0"
                    title="Jalankan skrip pembentukan sheet otomatis"
                  >
                    <Sparkles className="w-3.5 h-3.5" /> Inisialisasi Sheet Otomatis
                  </button>
                </div>
              </div>

              {testResult && (
                <div className={`p-3 rounded-lg border text-xs flex items-center gap-2 ${
                  testResult.success
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                    : 'bg-red-50 border-red-200 text-red-800'
                }`}>
                  {testResult.success ? <Check className="w-4 h-4 text-emerald-600" /> : <AlertCircle className="w-4 h-4 text-red-600" />}
                  <span>{testResult.msg}</span>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: SUPABASE */}
          {activeTab === 'supabase' && (
            <div className="space-y-4">
              <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4 text-indigo-950 space-y-2">
                <div className="font-bold flex items-center gap-2 text-sm text-indigo-800">
                  <Database className="w-4 h-4 text-indigo-600" />
                  Konfigurasi Database Relasional PostgreSQL di Supabase
                </div>
                <p className="leading-relaxed">
                  Aplikasi ini dirancang mendukung Supabase Database dengan skema tabel produk, kategori, produsen, uji lab, dan otentikasi user lengkap.
                </p>
              </div>

              {/* Copy SQL Schema */}
              <div className="flex items-center gap-3 bg-slate-900 text-white p-3 rounded-xl justify-between">
                <div>
                  <span className="font-bold block text-slate-200">supabase_schema.sql</span>
                  <span className="text-[11px] text-slate-400">DDL Tables, UUID, RLS Policies & Relations</span>
                </div>
                <button
                  onClick={handleCopySql}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-3.5 py-1.5 rounded-lg flex items-center gap-1.5 text-xs transition-colors shadow-xs"
                >
                  {copiedSql ? <Check className="w-4 h-4 text-white" /> : <Copy className="w-4 h-4" />}
                  {copiedSql ? 'Tersalin!' : 'Salin SQL Schema'}
                </button>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="font-bold text-slate-800 block mb-1">Supabase Project URL:</label>
                  <input
                    type="url"
                    value={formConfig.supabase_url}
                    onChange={(e) => setFormConfig({ ...formConfig, supabase_url: e.target.value })}
                    placeholder="https://xyzcompany.supabase.co"
                    className="w-full p-2.5 border border-slate-300 rounded-lg font-mono"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-800 block mb-1">Supabase Anon Public API Key:</label>
                  <input
                    type="text"
                    value={formConfig.supabase_anon_key}
                    onChange={(e) => setFormConfig({ ...formConfig, supabase_anon_key: e.target.value })}
                    placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6..."
                    className="w-full p-2.5 border border-slate-300 rounded-lg font-mono"
                  />
                </div>

                <div className="flex flex-wrap items-center gap-2 pt-2">
                  <button
                    type="button"
                    onClick={async () => {
                      if (!formConfig.supabase_url || !formConfig.supabase_anon_key) {
                        setTestResult({ success: false, msg: 'Masukkan Supabase URL dan Anon Key terlebih dahulu.' });
                        return;
                      }
                      setTestingConnection(true);
                      setTestResult(null);
                      try {
                        const res = await SupabaseService.testConnection(formConfig.supabase_url, formConfig.supabase_anon_key);
                        setTestResult({ success: res.success, msg: res.message });
                        if (res.success) {
                          setFormConfig(p => ({ ...p, is_connected: true }));
                        }
                      } catch (e: any) {
                        setTestResult({ success: false, msg: e?.message || 'Gagal tersambung' });
                      } finally {
                        setTestingConnection(false);
                      }
                    }}
                    disabled={testingConnection}
                    className="px-3.5 py-2 bg-indigo-700 hover:bg-indigo-800 text-white rounded-lg font-bold text-xs flex items-center gap-1.5 transition-colors"
                  >
                    <Play className="w-3.5 h-3.5" /> Uji Koneksi Supabase
                  </button>

                  <button
                    type="button"
                    onClick={async () => {
                      if (!formConfig.supabase_url || !formConfig.supabase_anon_key) {
                        setTestResult({ success: false, msg: 'Simpan URL dan Key terlebih dahulu.' });
                        return;
                      }
                      setTestingConnection(true);
                      setTestResult(null);
                      try {
                        const res = await SupabaseService.syncAllToSupabase();
                        setTestResult({ success: res.success, msg: res.message });
                      } catch (e: any) {
                        setTestResult({ success: false, msg: e?.message || 'Gagal sinkronisasi' });
                      } finally {
                        setTestingConnection(false);
                      }
                    }}
                    disabled={testingConnection}
                    className="px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg font-bold text-xs flex items-center gap-1.5 transition-colors"
                  >
                    <Cloud className="w-3.5 h-3.5" /> Sinkronkan Data ke Supabase
                  </button>
                </div>

                {testResult && (
                  <div className={`p-3 rounded-lg border text-xs flex items-center gap-2 ${
                    testResult.success
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                      : 'bg-red-50 border-red-200 text-red-800'
                  }`}>
                    {testResult.success ? <Check className="w-4 h-4 text-emerald-600" /> : <AlertCircle className="w-4 h-4 text-red-600" />}
                    <span>{testResult.msg}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: MODE PENYIMPANAN */}
          {activeTab === 'mode' && (
            <div className="space-y-4">
              <div>
                <label className="font-bold text-slate-800 block mb-2">Pilih Backend Aktif:</label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div
                    onClick={() => setFormConfig({ ...formConfig, backend_mode: 'local' })}
                    className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                      formConfig.backend_mode === 'local'
                        ? 'border-emerald-600 bg-emerald-50/50'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="font-bold text-slate-900 mb-1">Penyimpanan Cepat (Local/Browser)</div>
                    <p className="text-[11px] text-slate-500">
                      Berjalan offline/instan tanpa konfigurasi token. Cocok untuk demo & pengujian preview.
                    </p>
                  </div>

                  <div
                    onClick={() => setFormConfig({ ...formConfig, backend_mode: 'googlesheets' })}
                    className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                      formConfig.backend_mode === 'googlesheets'
                        ? 'border-emerald-600 bg-emerald-50/50'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="font-bold text-slate-900 mb-1">Google Sheets & Drive</div>
                    <p className="text-[11px] text-slate-500">
                      Menyinkronkan data langsung ke baris spreadsheet dan file bukti ke Google Drive.
                    </p>
                  </div>

                  <div
                    onClick={() => setFormConfig({ ...formConfig, backend_mode: 'supabase' })}
                    className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                      formConfig.backend_mode === 'supabase'
                        ? 'border-emerald-600 bg-emerald-50/50'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="font-bold text-slate-900 mb-1">Database Supabase</div>
                    <p className="text-[11px] text-slate-500">
                      Penyimpanan database PostgreSQL berbasis cloud berkecepatan tinggi.
                    </p>
                  </div>
                </div>
              </div>

              {/* Reset Data */}
              <div className="p-4 bg-red-50 border border-red-200 rounded-xl space-y-2">
                <div className="font-bold text-red-900 flex items-center gap-1.5">
                  <RotateCcw className="w-4 h-4 text-red-600" /> Kembalikan Data Awal BPOM (Reset Data)
                </div>
                <p className="text-slate-600">
                  Jika Anda ingin menghapus modifikasi lokal dan mengembalikan data sampel otentik BPOM (Parasetamol, Serum Cica, Kopi Jantan, Cream Malam Berbahaya, dll):
                </p>
                <button
                  onClick={() => {
                    if (confirm('Kembalikan semua data ke setelan bawaan resmi BPOM?')) {
                      onResetData();
                      alert('Data berhasil di-reset ke versi awal!');
                      onClose();
                    }
                  }}
                  className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg text-xs"
                >
                  Reset ke Data Awal
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-100 text-slate-700 font-bold rounded-lg text-xs"
          >
            Tutup
          </button>
          <button
            onClick={handleSave}
            className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-lg text-xs shadow-md"
          >
            Simpan Konfigurasi
          </button>
        </div>
      </div>
    </div>
  );
};
