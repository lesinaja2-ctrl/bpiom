import React, { useState } from 'react';
import {
  LogIn,
  UserCheck,
  Shield,
  Key,
  X,
  Lock,
  User as UserIcon,
  Sparkles,
  AlertCircle,
} from 'lucide-react';
import { User, UserRole } from '../types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  users: User[];
  currentUser: User | null;
  onLogin: (user: User) => void;
  onLogout: () => void;
  onRegister: (newUser: User) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  users,
  currentUser,
  onLogin,
  onLogout,
  onRegister,
}) => {
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Register state
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regUsername, setRegUsername] = useState('');
  const [regPassword, setRegPassword] = useState('');

  if (!isOpen) return null;

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    const found = users.find(
      u =>
        (u.username.toLowerCase() === username.trim().toLowerCase() ||
          u.email.toLowerCase() === username.trim().toLowerCase()) &&
        u.password === password
    );

    if (found) {
      if (!found.status_aktif) {
        setErrorMsg('Akun Anda telah dinonaktifkan oleh Administrator.');
        return;
      }
      onLogin(found);
      onClose();
    } else {
      setErrorMsg('Username/Email atau kata sandi tidak cocok. Silakan coba lagi.');
    }
  };

  const handleQuickLogin = (role: UserRole) => {
    const matched = users.find(u => u.role === role && u.status_aktif);
    if (matched) {
      onLogin(matched);
      onClose();
    }
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (users.some(u => u.username.toLowerCase() === regUsername.trim().toLowerCase())) {
      setErrorMsg('Username sudah digunakan. Pilih username lain.');
      return;
    }

    const newUser: User = {
      id: 'usr-' + Date.now(),
      username: regUsername.trim().toLowerCase(),
      email: regEmail.trim(),
      password: regPassword,
      role: 'Masyarakat',
      nama_lengkap: regName.trim(),
      status_aktif: true,
      dibuat_pada: new Date().toISOString().split('T')[0],
      terakhir_login: new Date().toISOString().split('T')[0],
    };

    onRegister(newUser);
    onLogin(newUser);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-md w-full overflow-hidden shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-sky-950 to-slate-900 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center border border-white/20">
              <Lock className="w-4 h-4 text-sky-300" />
            </div>
            <div>
              <h3 className="font-bold text-base">
                {currentUser ? 'Profil Pengguna Masuk' : isRegisterMode ? 'Daftar Akun Baru' : 'Login Sistem BPOM'}
              </h3>
              <p className="text-[11px] text-sky-200">Sistem Informasi Pengawasan Obat & Makanan</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4 text-xs">
          {currentUser ? (
            <div className="space-y-4 text-center">
              <div className="w-16 h-16 rounded-full bg-sky-100 text-sky-800 flex items-center justify-center mx-auto text-xl font-black">
                {currentUser.nama_lengkap.charAt(0)}
              </div>
              <div>
                <h4 className="font-bold text-slate-900 text-base">{currentUser.nama_lengkap}</h4>
                <p className="text-slate-500 font-mono">@{currentUser.username} • {currentUser.email}</p>
                <div className="mt-2">
                  <span className="bg-sky-800 text-white font-bold px-3 py-1 rounded-full text-xs">
                    {currentUser.role}
                  </span>
                </div>
              </div>

              {currentUser.nip_instansi && (
                <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 text-slate-600 font-mono text-[11px]">
                  NIP Pegawai: {currentUser.nip_instansi}
                </div>
              )}

              <div className="pt-3 border-t border-slate-100 flex gap-2">
                <button
                  onClick={onClose}
                  className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg"
                >
                  Tutup
                </button>
                <button
                  onClick={() => {
                    onLogout();
                    onClose();
                  }}
                  className="flex-1 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg"
                >
                  Keluar (Logout)
                </button>
              </div>
            </div>
          ) : isRegisterMode ? (
            <form onSubmit={handleRegisterSubmit} className="space-y-3">
              {errorMsg && (
                <div className="p-2.5 bg-red-50 text-red-700 rounded-lg flex items-center gap-2 text-xs">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <div>
                <label className="font-bold text-slate-700 block mb-1">Nama Lengkap</label>
                <input
                  type="text"
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  placeholder="Nama Lengkap Sesuai KTP"
                  className="w-full p-2.5 border border-slate-300 rounded-lg"
                  required
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Email Aktif</label>
                <input
                  type="email"
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  placeholder="email@domain.com"
                  className="w-full p-2.5 border border-slate-300 rounded-lg"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Username</label>
                  <input
                    type="text"
                    value={regUsername}
                    onChange={(e) => setRegUsername(e.target.value)}
                    placeholder="username"
                    className="w-full p-2.5 border border-slate-300 rounded-lg"
                    required
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Password</label>
                  <input
                    type="password"
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full p-2.5 border border-slate-300 rounded-lg"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-sky-800 hover:bg-sky-900 text-white font-bold rounded-lg shadow-md transition-colors"
              >
                Daftar Akun Sekarang
              </button>

              <div className="text-center pt-2 text-slate-500 text-xs">
                Sudah punya akun?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setIsRegisterMode(false);
                    setErrorMsg('');
                  }}
                  className="text-sky-800 font-bold hover:underline"
                >
                  Login di sini
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-4">
              {/* Quick Login Presets for easy review */}
              <div className="bg-sky-50 border border-sky-100 rounded-xl p-3 text-xs space-y-2">
                <div className="font-bold text-sky-900 flex items-center gap-1.5 text-[11px] uppercase tracking-wider">
                  <Sparkles className="w-3.5 h-3.5 text-sky-600" /> Masuk Cepat Akses Demo Peran:
                </div>
                <div className="grid grid-cols-2 gap-1.5">
                  <button
                    onClick={() => handleQuickLogin('Admin')}
                    className="p-1.5 bg-white hover:bg-sky-100 border border-sky-200 rounded-md font-bold text-sky-900 text-left transition-colors flex items-center justify-between"
                  >
                    <span>🛡️ Admin Sistem</span>
                  </button>
                  <button
                    onClick={() => handleQuickLogin('Petugas Lab')}
                    className="p-1.5 bg-white hover:bg-emerald-100 border border-emerald-200 rounded-md font-bold text-emerald-900 text-left transition-colors flex items-center justify-between"
                  >
                    <span>🔬 Petugas Lab</span>
                  </button>
                  <button
                    onClick={() => handleQuickLogin('Pengawas')}
                    className="p-1.5 bg-white hover:bg-amber-100 border border-amber-200 rounded-md font-bold text-amber-900 text-left transition-colors flex items-center justify-between"
                  >
                    <span>🔍 Pengawas BPOM</span>
                  </button>
                  <button
                    onClick={() => handleQuickLogin('Masyarakat')}
                    className="p-1.5 bg-white hover:bg-slate-100 border border-slate-200 rounded-md font-bold text-slate-800 text-left transition-colors flex items-center justify-between"
                  >
                    <span>👤 Masyarakat</span>
                  </button>
                </div>
              </div>

              {errorMsg && (
                <div className="p-2.5 bg-red-50 text-red-700 rounded-lg flex items-center gap-2 text-xs">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <form onSubmit={handleLoginSubmit} className="space-y-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Username / Email</label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="admin / lab_officer / budi"
                    className="w-full p-2.5 border border-slate-300 rounded-lg"
                    required
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Kata Sandi</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full p-2.5 border border-slate-300 rounded-lg"
                    required
                  />
                  <div className="text-[10px] text-slate-400 mt-1">Default password akun demo: bpom2026</div>
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-sky-800 hover:bg-sky-900 text-white font-bold rounded-lg shadow-md transition-colors flex items-center justify-center gap-2"
                >
                  <LogIn className="w-4 h-4" /> Masuk ke Akun
                </button>

                <div className="text-center pt-2 text-slate-500 text-xs">
                  Belum memiliki akun?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setIsRegisterMode(true);
                      setErrorMsg('');
                    }}
                    className="text-sky-800 font-bold hover:underline"
                  >
                    Daftar sebagai Warga
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
