import React, { useState } from 'react';
import {
  Users,
  UserPlus,
  Shield,
  Trash2,
  CheckCircle2,
  XCircle,
  Download,
  Search,
  Key,
  Mail,
  UserCheck,
  X,
} from 'lucide-react';
import { User, UserRole } from '../types';
import { exportToExcel } from '../utils/exportUtils';

interface UserManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  users: User[];
  currentUser: User | null;
  onAddUser: (user: User) => void;
  onUpdateUser: (user: User) => void;
  onDeleteUser: (userId: string) => void;
}

export const UserManagerModal: React.FC<UserManagerModalProps> = ({
  isOpen,
  onClose,
  users,
  currentUser,
  onAddUser,
  onUpdateUser,
  onDeleteUser,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddFormOpen, setIsAddFormOpen] = useState(false);

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    role: 'Pengawas' as UserRole,
    nama_lengkap: '',
    nip_instansi: '',
    status_aktif: true,
  });

  if (!isOpen) return null;

  const filteredUsers = users.filter(
    u =>
      u.nama_lengkap.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleExport = () => {
    const data = filteredUsers.map((u, idx) => ({
      No: idx + 1,
      'ID Pengguna': u.id,
      Username: u.username,
      Email: u.email,
      'Nama Lengkap': u.nama_lengkap,
      Peran: u.role,
      'NIP / No Pegawai': u.nip_instansi || '-',
      'Status Aktif': u.status_aktif ? 'Aktif' : 'Nonaktif',
      'Tanggal Dibuat': u.dibuat_pada,
      'Terakhir Login': u.terakhir_login || '-',
    }));
    exportToExcel(data, 'Sheet_Data_User_BPOM', 'DataUser');
  };

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    const newUser: User = {
      id: 'usr-' + Date.now(),
      username: formData.username.toLowerCase().trim(),
      email: formData.email.trim(),
      password: formData.password || 'bpom2026',
      role: formData.role,
      nama_lengkap: formData.nama_lengkap,
      nip_instansi: formData.nip_instansi || undefined,
      status_aktif: formData.status_aktif,
      dibuat_pada: new Date().toISOString().split('T')[0],
      terakhir_login: 'Belum pernah',
    };

    onAddUser(newUser);
    setIsAddFormOpen(false);
    setFormData({
      username: '',
      email: '',
      password: '',
      role: 'Pengawas',
      nama_lengkap: '',
      nip_instansi: '',
      status_aktif: true,
    });
  };

  const toggleUserStatus = (user: User) => {
    if (user.id === currentUser?.id) {
      alert('Anda tidak dapat menonaktifkan akun yang sedang aktif digunakan.');
      return;
    }
    onUpdateUser({
      ...user,
      status_aktif: !user.status_aktif,
    });
  };

  const changeUserRole = (user: User, newRole: UserRole) => {
    if (user.id === currentUser?.id) {
      alert('Anda tidak dapat mengubah level peran akun Anda sendiri.');
      return;
    }
    onUpdateUser({
      ...user,
      role: newRole,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[92vh] overflow-hidden flex flex-col shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-950 via-slate-900 to-indigo-950 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center text-white border border-white/20">
              <Shield className="w-5 h-5 text-purple-300" />
            </div>
            <div>
              <h3 className="font-bold text-lg leading-tight">Manajemen Akses & Sheet Data User</h3>
              <p className="text-xs text-purple-200">
                Kelola hak akses pengguna sistem (Admin, Petugas Lab, Pengawas, Publik)
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

        {/* Action toolbar */}
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Cari user, email, nama..."
              className="w-full pl-9 pr-3 py-2 bg-white border border-slate-300 rounded-lg text-xs"
            />
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExport}
              className="bg-white hover:bg-slate-100 text-slate-700 font-semibold px-3 py-2 rounded-lg border border-slate-300 flex items-center gap-1.5 transition-colors shadow-2xs"
            >
              <Download className="w-3.5 h-3.5" /> Ekspor Sheet User (Excel)
            </button>
            <button
              onClick={() => setIsAddFormOpen(!isAddFormOpen)}
              className="bg-purple-700 hover:bg-purple-800 text-white font-bold px-3.5 py-2 rounded-lg flex items-center gap-1.5 shadow-xs transition-colors"
            >
              <UserPlus className="w-3.5 h-3.5" /> Tambah User Baru
            </button>
          </div>
        </div>

        {/* Add User Form Drawer */}
        {isAddFormOpen && (
          <div className="p-5 bg-purple-50/50 border-b border-purple-100 animate-in fade-in duration-150 text-xs">
            <h4 className="font-bold text-slate-900 mb-3 flex items-center gap-1 text-purple-900">
              <UserPlus className="w-4 h-4" /> Formulir Registrasi Akun Pengguna Baru
            </h4>
            <form onSubmit={handleCreateUser} className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Username</label>
                  <input
                    type="text"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    placeholder="nama_user"
                    className="w-full p-2 border border-slate-300 rounded-lg bg-white"
                    required
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Email Resmi</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="user@bpom.go.id"
                    className="w-full p-2 border border-slate-300 rounded-lg bg-white"
                    required
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Kata Sandi Default</label>
                  <input
                    type="text"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="bpom2026"
                    className="w-full p-2 border border-slate-300 rounded-lg bg-white"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Nama Lengkap & Gelar</label>
                  <input
                    type="text"
                    value={formData.nama_lengkap}
                    onChange={(e) => setFormData({ ...formData, nama_lengkap: e.target.value })}
                    placeholder="Dra. Siti Aminah, Apt."
                    className="w-full p-2 border border-slate-300 rounded-lg bg-white"
                    required
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Level Akses / Role</label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value as UserRole })}
                    className="w-full p-2 border border-slate-300 rounded-lg bg-white font-bold"
                  >
                    <option value="Admin">Admin (Akses Penuh)</option>
                    <option value="Petugas Lab">Petugas Lab (Pengujian PPPOMN)</option>
                    <option value="Pengawas">Pengawas (Investigasi & Recall)</option>
                    <option value="Masyarakat">Masyarakat (Publik Terverifikasi)</option>
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">NIP Pegawai (Opsional)</label>
                  <input
                    type="text"
                    value={formData.nip_instansi}
                    onChange={(e) => setFormData({ ...formData, nip_instansi: e.target.value })}
                    placeholder="19800101 200501 1 001"
                    className="w-full p-2 border border-slate-300 rounded-lg bg-white"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddFormOpen(false)}
                  className="px-3 py-1.5 bg-slate-200 text-slate-700 rounded-lg font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-purple-700 hover:bg-purple-800 text-white rounded-lg font-bold"
                >
                  Simpan Akun ke Sheet
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Users Table */}
        <div className="p-4 overflow-y-auto flex-1">
          <table className="w-full text-left text-xs border border-slate-200 rounded-xl overflow-hidden">
            <thead className="bg-slate-100 text-slate-700 font-bold uppercase text-[11px]">
              <tr>
                <th className="p-3">User & Identitas</th>
                <th className="p-3">Kontak Email</th>
                <th className="p-3">Peran / Role</th>
                <th className="p-3">Status</th>
                <th className="p-3 text-right">Aksi Kelola</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredUsers.map((u) => {
                const isSelf = u.id === currentUser?.id;
                return (
                  <tr key={u.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-3">
                      <div className="font-bold text-slate-900 flex items-center gap-1.5">
                        {u.nama_lengkap}
                        {isSelf && (
                          <span className="bg-sky-100 text-sky-800 text-[9px] px-1.5 py-0.2 rounded font-bold">
                            Anda
                          </span>
                        )}
                      </div>
                      <div className="text-slate-400 font-mono text-[11px]">
                        @{u.username} {u.nip_instansi ? `• NIP: ${u.nip_instansi}` : ''}
                      </div>
                    </td>

                    <td className="p-3 text-slate-600 font-mono">
                      {u.email}
                    </td>

                    <td className="p-3">
                      <select
                        disabled={isSelf}
                        value={u.role}
                        onChange={(e) => changeUserRole(u, e.target.value as UserRole)}
                        className={`p-1 rounded font-bold text-xs border ${
                          u.role === 'Admin'
                            ? 'bg-purple-50 text-purple-800 border-purple-200'
                            : u.role === 'Petugas Lab'
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                            : u.role === 'Pengawas'
                            ? 'bg-amber-50 text-amber-800 border-amber-200'
                            : 'bg-slate-100 text-slate-700 border-slate-200'
                        }`}
                      >
                        <option value="Admin">Admin</option>
                        <option value="Petugas Lab">Petugas Lab</option>
                        <option value="Pengawas">Pengawas</option>
                        <option value="Masyarakat">Masyarakat</option>
                      </select>
                    </td>

                    <td className="p-3">
                      <button
                        disabled={isSelf}
                        onClick={() => toggleUserStatus(u)}
                        className={`px-2 py-0.5 rounded-full font-bold text-[10px] flex items-center gap-1 ${
                          u.status_aktif
                            ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                            : 'bg-red-100 text-red-800 hover:bg-red-200'
                        }`}
                      >
                        {u.status_aktif ? (
                          <>
                            <CheckCircle2 className="w-3 h-3" /> Aktif
                          </>
                        ) : (
                          <>
                            <XCircle className="w-3 h-3" /> Nonaktif
                          </>
                        )}
                      </button>
                    </td>

                    <td className="p-3 text-right">
                      {!isSelf && (
                        <button
                          onClick={() => {
                            if (confirm(`Hapus pengguna ${u.nama_lengkap} (@${u.username}) dari sheet database?`)) {
                              onDeleteUser(u.id);
                            }
                          }}
                          className="p-1 text-slate-400 hover:text-red-600 rounded transition-colors"
                          title="Hapus Pengguna"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-between items-center text-xs text-slate-500">
          <span>Terhubung dengan Sheet `Users`</span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg font-bold"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
