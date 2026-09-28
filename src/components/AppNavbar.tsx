import React, { useState } from 'react';
import {
  ShieldCheck,
  QrCode,
  AlertTriangle,
  FlaskConical,
  Building2,
  Lock,
  Plus,
  Users,
  Database,
  Rocket,
  UserCheck,
  LogIn,
  Menu,
  X,
  Sparkles,
  AlertOctagon,
  Sliders,
  FileText,
  Megaphone,
  RefreshCw,
} from 'lucide-react';
import { User, WebsiteSettings, CustomPage } from '../types';

interface AppNavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  currentUser: User | null;
  recallsCount: number;
  settings: WebsiteSettings;
  customPages: CustomPage[];
  supabaseSyncStatus?: 'connected' | 'syncing' | 'error' | 'idle';
  lastSyncedTime?: string;
  onTriggerSync?: () => void;
  onOpenScanner: () => void;
  onOpenReport: () => void;
  onOpenAddProduct: () => void;
  onOpenUserManager: () => void;
  onOpenDatabaseSync: () => void;
  onOpenDeploymentGuide: () => void;
  onOpenAuth: () => void;
  onOpenAdmin: () => void;
  onSelectCustomPage: (page: CustomPage) => void;
}

export const AppNavbar: React.FC<AppNavbarProps> = ({
  activeTab,
  setActiveTab,
  currentUser,
  recallsCount,
  settings,
  customPages,
  supabaseSyncStatus = 'connected',
  lastSyncedTime = '',
  onTriggerSync,
  onOpenScanner,
  onOpenReport,
  onOpenAddProduct,
  onOpenUserManager,
  onOpenDatabaseSync,
  onOpenDeploymentGuide,
  onOpenAuth,
  onOpenAdmin,
  onSelectCustomPage,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { id: 'directory', label: 'Katalog Produk & Izin', icon: ShieldCheck },
    { id: 'lab', label: 'Hasil Laboratorium', icon: FlaskConical },
    {
      id: 'recalls',
      label: 'Penarikan Produk',
      icon: AlertOctagon,
      badge: recallsCount > 0 ? recallsCount : undefined,
      badgeColor: 'bg-red-500',
    },
    { id: 'composition', label: 'Cek Komposisi', icon: Sparkles },
    { id: 'producers', label: 'Direktori Produsen', icon: Building2 },
    { id: 'certificate', label: 'Verifikasi Sertifikat', icon: Lock },
  ];

  const publishedNavPages = customPages.filter(
    (p) => p.status === 'Publikasi' && p.tampilkan_di_navigasi
  );

  const isAdmin = currentUser && currentUser.role === 'Admin';
  const isStaff = currentUser && ['Admin', 'Petugas Lab', 'Pengawas'].includes(currentUser.role);

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-xs">
      {/* Running Text Announcement Banner if active */}
      {settings.tampilkan_running_text && settings.running_text && (
        <div className="bg-amber-500 text-slate-950 font-bold text-xs px-4 py-1 flex items-center overflow-hidden border-b border-amber-600">
          <div className="flex items-center gap-1.5 shrink-0 pr-3 font-black uppercase text-[10px] tracking-wider border-r border-slate-950/20 mr-2">
            <Megaphone className="w-3.5 h-3.5" />
            <span>Pengumuman</span>
          </div>
          <div className="truncate text-[11px] select-none font-medium">
            {settings.running_text}
          </div>
        </div>
      )}

      {/* Top official announcement / utility bar */}
      <div className="bg-gradient-to-r from-sky-950 via-slate-900 to-sky-950 text-white text-[11px] px-4 py-1.5 flex items-center justify-between">
        <div className="flex items-center gap-2 font-medium truncate">
          <span className="bg-sky-500 text-[9px] font-black uppercase px-1.5 py-0.2 rounded">
            PORTAL RESMI
          </span>
          <span className="hidden sm:inline">
            {settings.singkatan_portal} • Layanan Kontak Halo BPOM: {settings.telepon_layanan} • Email: {settings.email_resmi}
          </span>
          <span className="sm:hidden">
            {settings.singkatan_portal} • Halo BPOM {settings.telepon_layanan}
          </span>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          {/* Live Supabase Server Status Badge */}
          {supabaseSyncStatus === 'syncing' ? (
            <div className="flex items-center gap-1 bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 px-2 py-0.5 rounded-full text-[10px] font-semibold animate-pulse">
              <RefreshCw className="w-3 h-3 animate-spin text-emerald-400" />
              <span>Sinkronisasi Supabase...</span>
            </div>
          ) : supabaseSyncStatus === 'error' ? (
            <button
              onClick={onOpenDatabaseSync}
              className="flex items-center gap-1 bg-red-950/80 border border-red-500/50 text-red-300 hover:text-white px-2 py-0.5 rounded-full text-[10px] font-semibold transition-colors"
              title="Koneksi Supabase bermasalah. Klik untuk periksa."
            >
              <span className="w-2 h-2 rounded-full bg-red-500 animate-ping inline-block" />
              <span>Supabase Belum Terhubung</span>
            </button>
          ) : (
            <div className="flex items-center gap-1.5">
              <span className="hidden md:inline-flex items-center gap-1.5 bg-emerald-950/60 border border-emerald-500/30 text-emerald-300 px-2.5 py-0.5 rounded-full text-[10px] font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_#34d399]" />
                <span>Server Supabase Aktif</span>
                {lastSyncedTime && <span className="text-emerald-400/70">({lastSyncedTime})</span>}
              </span>
              {onTriggerSync && (
                <button
                  onClick={onTriggerSync}
                  title="Sinkronkan data dengan database Supabase Cloud sekarang"
                  className="text-emerald-400 hover:text-white p-0.5 rounded transition-colors"
                >
                  <RefreshCw className="w-3 h-3" />
                </button>
              )}
            </div>
          )}

          <span className="text-slate-600 hidden sm:inline">|</span>
          <button
            onClick={onOpenDeploymentGuide}
            className="text-sky-200 hover:text-white flex items-center gap-1 font-semibold transition-colors hidden sm:flex"
          >
            <Rocket className="w-3 h-3 text-sky-400" /> Deploy Vercel
          </button>
          <span className="text-slate-600 hidden sm:inline">|</span>
          <button
            onClick={onOpenDatabaseSync}
            className="text-emerald-300 hover:text-emerald-100 flex items-center gap-1 font-semibold transition-colors"
          >
            <Database className="w-3 h-3 text-emerald-400" /> Cloud & Database
          </button>
        </div>
      </div>

      {/* Main Branding Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-3">
        {/* Brand */}
        <div
          onClick={() => setActiveTab('directory')}
          className="flex items-center gap-3 cursor-pointer group select-none"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-800 to-indigo-900 text-white flex items-center justify-center shadow-md group-hover:scale-105 transition-transform shrink-0 overflow-hidden border border-slate-200">
            {settings.logo_url ? (
              <img
                src={settings.logo_url}
                alt="Logo BPOM"
                className="w-full h-full object-contain p-1"
                referrerPolicy="no-referrer"
              />
            ) : (
              <ShieldCheck className="w-6 h-6 text-sky-200" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-1.5 flex-wrap">
              <h1 className="text-base sm:text-lg font-black tracking-tight text-slate-900 leading-tight">
                {settings.nama_website}
              </h1>
              <span className="text-[10px] bg-sky-100 text-sky-800 px-1.5 py-0.5 rounded font-black">
                {settings.singkatan_portal}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 font-medium line-clamp-1">
              {settings.tagline}
            </p>
          </div>
        </div>

        {/* Action controls */}
        <div className="hidden lg:flex items-center gap-2">
          <button
            onClick={onOpenScanner}
            className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs active:scale-95"
          >
            <QrCode className="w-3.5 h-3.5 text-sky-400" />
            <span>Scan Barcode</span>
          </button>

          <button
            onClick={onOpenReport}
            className="px-3.5 py-2 bg-red-700 hover:bg-red-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs active:scale-95"
          >
            <AlertTriangle className="w-3.5 h-3.5 text-amber-300" />
            <span>Lapor Produk Berbahaya</span>
          </button>

          {isStaff && (
            <button
              onClick={onOpenAddProduct}
              className="px-3.5 py-2 bg-sky-800 hover:bg-sky-900 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs active:scale-95"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Tambah Produk</span>
            </button>
          )}

          {isAdmin && (
            <button
              onClick={onOpenUserManager}
              className="p-2 text-slate-600 hover:text-purple-700 hover:bg-purple-50 rounded-xl transition-colors"
              title="Akses Level Admin: Kelola Sheet User"
            >
              <Users className="w-5 h-5" />
            </button>
          )}

          <div className="h-6 w-px bg-slate-200 mx-1" />

          {/* User Button */}
          <button
            onClick={onOpenAuth}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-bold transition-all text-slate-700"
          >
            {currentUser ? (
              <>
                <div className="w-6 h-6 rounded-full bg-sky-700 text-white text-[11px] flex items-center justify-center font-bold">
                  {currentUser.nama_lengkap.charAt(0)}
                </div>
                <div className="text-left leading-tight hidden xl:block">
                  <div className="text-slate-900 font-bold max-w-[100px] truncate">
                    {currentUser.nama_lengkap.split(' ')[0]}
                  </div>
                  <div className="text-[10px] text-sky-700 font-semibold">{currentUser.role}</div>
                </div>
              </>
            ) : (
              <>
                <LogIn className="w-4 h-4 text-sky-700" />
                <span>Masuk</span>
              </>
            )}
          </button>
        </div>

        {/* Mobile menu toggle */}
        <div className="flex items-center gap-1.5 lg:hidden">
          <button
            onClick={onOpenScanner}
            className="p-2 bg-slate-900 text-white rounded-lg"
            title="Scan Barcode"
          >
            <QrCode className="w-4 h-4" />
          </button>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-slate-700 hover:bg-slate-100 rounded-lg"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Desktop Tabs & Dynamic CMS Navigation Pages */}
      <div className="hidden lg:block border-t border-slate-100 bg-slate-50/70">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between gap-1 overflow-x-auto text-xs font-semibold py-1.5">
          <div className="flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all shrink-0 ${
                    isActive
                      ? 'bg-sky-800 text-white shadow-xs font-bold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                  {item.badge && (
                    <span
                      className={`${item.badgeColor || 'bg-red-500'} text-white text-[10px] font-black px-1.5 py-0.2 rounded-full`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Dynamic CMS Pages (e.g. Profil, Panduan Cek KLIK, Regulasi, FAQ) */}
          {publishedNavPages.length > 0 && (
            <div className="flex items-center gap-1 border-l border-slate-200 pl-2">
              {publishedNavPages.map((page) => (
                <button
                  key={page.id}
                  onClick={() => onSelectCustomPage(page)}
                  className={`px-2.5 py-1.5 rounded-lg text-xs transition-colors shrink-0 flex items-center gap-1 ${
                    activeTab === `custom-page-${page.id}`
                      ? 'bg-sky-100 text-sky-900 font-bold border border-sky-300'
                      : 'text-slate-600 hover:text-sky-800 hover:bg-slate-200/60'
                  }`}
                  title={page.ringkasan}
                >
                  <FileText className="w-3 h-3 text-slate-400" />
                  <span>{page.judul}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-200 bg-white p-4 space-y-3 animate-in fade-in duration-150">
          <div className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full px-3 py-2 rounded-lg flex items-center justify-between text-xs font-semibold ${
                    isActive ? 'bg-sky-800 text-white font-bold' : 'text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}

            {/* Custom pages in mobile */}
            {publishedNavPages.length > 0 && (
              <div className="pt-2 border-t border-slate-100 space-y-1">
                <div className="text-[10px] font-bold uppercase text-slate-400 px-3">
                  Informasi & Halaman Publik
                </div>
                {publishedNavPages.map((page) => (
                  <button
                    key={page.id}
                    onClick={() => {
                      onSelectCustomPage(page);
                      setMobileMenuOpen(false);
                    }}
                    className="w-full px-3 py-1.5 rounded-lg flex items-center gap-2 text-xs font-medium text-slate-600 hover:bg-slate-100 text-left"
                  >
                    <FileText className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{page.judul}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="pt-3 border-t border-slate-100 space-y-2">
            <button
              onClick={() => {
                onOpenReport();
                setMobileMenuOpen(false);
              }}
              className="w-full py-2 px-3 bg-red-700 text-white rounded-lg font-bold text-xs flex items-center justify-center gap-2"
            >
              <AlertTriangle className="w-4 h-4" /> Lapor Produk Berbahaya
            </button>

            {isStaff && (
              <button
                onClick={() => {
                  onOpenAddProduct();
                  setMobileMenuOpen(false);
                }}
                className="w-full py-2 px-3 bg-sky-800 text-white rounded-lg font-bold text-xs flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" /> Tambah Produk
              </button>
            )}

            {isAdmin && (
              <button
                onClick={() => {
                  onOpenUserManager();
                  setMobileMenuOpen(false);
                }}
                className="w-full py-2 px-3 bg-purple-700 text-white rounded-lg font-bold text-xs flex items-center justify-center gap-2"
              >
                <Users className="w-4 h-4" /> Akses Admin: Kelola Sheet User
              </button>
            )}

            <button
              onClick={() => {
                onOpenAuth();
                setMobileMenuOpen(false);
              }}
              className="w-full py-2 px-3 border border-slate-300 text-slate-800 rounded-lg font-bold text-xs flex items-center justify-center gap-2"
            >
              <UserCheck className="w-4 h-4" /> {currentUser ? `Akun: ${currentUser.nama_lengkap}` : 'Login Sistem'}
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
