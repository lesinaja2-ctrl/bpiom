import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  Lock,
  Camera,
  ShieldCheck,
  AlertTriangle,
  FileCheck,
  ChevronRight,
  ExternalLink,
  Layers,
  Sparkles,
  QrCode,
} from 'lucide-react';
import { Product, ProductCategory, RegistrationStatus, User } from '../types';

interface ProductDirectoryProps {
  products: Product[];
  currentUser: User | null;
  onSelectProduct: (product: Product) => void;
  onOpenAddModal?: () => void;
  onOpenScanner: () => void;
  onOpenStandalonePage?: (product: Product) => void;
}

export const ProductDirectory: React.FC<ProductDirectoryProps> = ({
  products,
  currentUser,
  onSelectProduct,
  onOpenAddModal,
  onOpenScanner,
  onOpenStandalonePage,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Semua');
  const [selectedStatus, setSelectedStatus] = useState<string>('Semua');

  const categories = ['Semua', 'Obat', 'Kosmetik', 'Makanan & Minuman', 'Obat Tradisional', 'Suplemen Kesehatan'];
  const statuses = ['Semua', 'Aktif', 'Ditarik', 'Kedaluwarsa'];

  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchSearch =
        p.nama_produk.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.nomor_izin.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.nama_produsen.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.merk.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.barcode.toLowerCase().includes(searchTerm.toLowerCase());

      const matchCat = selectedCategory === 'Semua' || p.kategori === selectedCategory;
      const matchStatus = selectedStatus === 'Semua' || p.status_registrasi === selectedStatus;

      return matchSearch && matchCat && matchStatus;
    });
  }, [products, searchTerm, selectedCategory, selectedStatus]);

  const isAdminOrStaff = currentUser && ['Admin', 'Petugas Lab', 'Pengawas'].includes(currentUser.role);

  return (
    <div className="space-y-6">
      {/* Top Banner / Search bar section */}
      <div className="bg-gradient-to-r from-sky-900 via-sky-800 to-indigo-950 text-white rounded-2xl p-6 sm:p-8 shadow-xl border border-sky-800 relative overflow-hidden">
        {/* Background watermark badge */}
        <div className="absolute right-[-20px] bottom-[-40px] opacity-10 pointer-events-none">
          <ShieldCheck className="w-80 h-80 text-white" />
        </div>

        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 bg-sky-500/20 border border-sky-400/30 rounded-full px-3 py-1 text-xs font-semibold text-sky-200 mb-3">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            Sistem Informasi Cek Izin Edar & Mutu Terpadu
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Pencarian Produk Resmi Obat & Makanan
          </h1>
          <p className="text-sky-100/90 text-sm mt-1.5 leading-relaxed">
            Verifikasi Nomor Izin Edar (NIE), status kelulusan uji laboratorium, profil produsen berizin, dan transparansi komposisi bahan secara real-time.
          </p>

          {/* Search Input Bar */}
          <div className="mt-5 flex flex-col sm:flex-row gap-2.5">
            <div className="relative flex-1">
              <Search className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Ketik Nomor Izin (e.g. NA18210100123 / DKL / MD), Nama Produk, atau Merk..."
                className="w-full pl-10 pr-4 py-3 bg-white text-slate-900 rounded-xl text-sm font-medium focus:outline-hidden focus:ring-3 focus:ring-sky-400 shadow-md placeholder:text-slate-400"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs bg-slate-200 hover:bg-slate-300 text-slate-700 px-2 py-0.5 rounded"
                >
                  Reset
                </button>
              )}
            </div>

            <button
              onClick={onOpenScanner}
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold px-4 py-3 rounded-xl text-sm flex items-center justify-center gap-2 transition-all shadow-md active:scale-95 shrink-0"
            >
              <Camera className="w-4 h-4" /> Scan Barcode
            </button>
          </div>
        </div>
      </div>

      {/* Filter & Action Toolbar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-4">
        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          <span className="text-xs font-bold text-slate-400 uppercase mr-1 flex items-center gap-1 shrink-0">
            <Filter className="w-3.5 h-3.5" /> Kategori:
          </span>
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? 'bg-sky-800 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Status Filter & Export/Add buttons */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-500">Status Izin:</span>
            <div className="flex gap-1.5">
              {statuses.map(s => (
                <button
                  key={s}
                  onClick={() => setSelectedStatus(s)}
                  className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                    selectedStatus === s
                      ? s === 'Ditarik'
                        ? 'bg-red-600 text-white'
                        : s === 'Aktif'
                        ? 'bg-emerald-700 text-white'
                        : 'bg-slate-800 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 text-xs text-slate-500 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">
              <Lock className="w-3.5 h-3.5 text-sky-700 shrink-0" />
              <span>Katalog Publik Terverifikasi Digital</span>
            </div>
          </div>
        </div>
      </div>

      {/* Results Count & Product Grid */}
      <div>
        <div className="flex justify-between items-center mb-3 text-xs text-slate-500">
          <span>
            Menampilkan <strong className="text-slate-800">{filteredProducts.length}</strong> produk terdaftar
          </span>
          {searchTerm && (
            <span>
              Kata kunci: "<strong className="text-sky-800">{searchTerm}</strong>"
            </span>
          )}
        </div>

        {filteredProducts.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
            <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-800">Tidak ada produk yang cocok</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
              Periksa kembali ejaan Nomor Izin Edar (NIE) atau nama produk yang Anda cari. Anda juga dapat menggunakan tombol Scan Barcode.
            </p>
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedCategory('Semua');
                setSelectedStatus('Semua');
              }}
              className="mt-4 px-4 py-2 bg-sky-800 text-white text-xs font-semibold rounded-lg hover:bg-sky-900"
            >
              Reset Filter Pencarian
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredProducts.map(product => {
              const isDitarik = product.status_registrasi === 'Ditarik';
              const isTMS = product.status_uji_lab === 'Tidak Memenuhi Syarat';

              return (
                <div
                  key={product.id}
                  onClick={() => onSelectProduct(product)}
                  className={`bg-white rounded-xl border transition-all hover:shadow-md cursor-pointer flex flex-col overflow-hidden group ${
                    isDitarik || isTMS
                      ? 'border-red-300 hover:border-red-500 bg-red-50/20'
                      : 'border-slate-200 hover:border-sky-400'
                  }`}
                >
                  {/* Card Header & Thumbnail */}
                  <div className="relative h-44 bg-slate-100 overflow-hidden flex items-center justify-center">
                    {product.foto_url ? (
                      <img
                        src={product.foto_url}
                        alt={product.nama_produk}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <Layers className="w-10 h-10 text-slate-300" />
                    )}

                    {/* Category badge */}
                    <div className="absolute top-2.5 left-2.5">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-900/80 backdrop-blur-xs text-white">
                        {product.kategori}
                      </span>
                    </div>

                    {/* Status badge */}
                    <div className="absolute top-2.5 right-2.5">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold shadow-xs ${
                        product.status_registrasi === 'Aktif'
                          ? 'bg-emerald-600 text-white'
                          : product.status_registrasi === 'Ditarik'
                          ? 'bg-red-600 text-white'
                          : 'bg-amber-600 text-white'
                      }`}>
                        {product.status_registrasi}
                      </span>
                    </div>

                    {/* Barcode strip */}
                    <div className="absolute bottom-2 left-2 bg-white/90 backdrop-blur-xs px-2 py-0.5 rounded text-[10px] font-mono text-slate-700 shadow-xs">
                      {product.barcode}
                    </div>
                  </div>

                  {/* Card Content */}
                  <div className="p-4 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="text-[11px] font-mono font-bold text-sky-800 tracking-wide mb-1">
                        NIE: {product.nomor_izin}
                      </div>
                      <h3 className="font-bold text-slate-900 text-sm leading-snug line-clamp-2 group-hover:text-sky-800 transition-colors">
                        {product.nama_produk}
                      </h3>
                      <p className="text-xs text-slate-500 mt-1 truncate">
                        Oleh: <span className="font-medium text-slate-700">{product.nama_produsen}</span>
                      </p>

                      <div className="mt-3 flex items-center gap-2 text-xs">
                        <span className="text-slate-400">Sediaan:</span>
                        <span className="font-medium text-slate-700 bg-slate-100 px-2 py-0.5 rounded text-[11px]">
                          {product.bentuk_sediaan}
                        </span>
                      </div>
                    </div>

                    {/* Card Footer */}
                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1.5">
                        <FileCheck className={`w-3.5 h-3.5 ${
                          product.status_uji_lab === 'Lulus' ? 'text-emerald-600' : 'text-red-500'
                        }`} />
                        <span className={`font-semibold ${
                          product.status_uji_lab === 'Lulus' ? 'text-emerald-700' : 'text-red-600'
                        }`}>
                          Lab: {product.status_uji_lab}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        {onOpenStandalonePage && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onOpenStandalonePage(product);
                            }}
                            className="p-1 text-slate-500 hover:text-sky-800 hover:bg-sky-50 rounded transition-colors"
                            title="Buka Halaman Produk & Barcode Resmi"
                          >
                            <QrCode className="w-3.5 h-3.5" />
                          </button>
                        )}
                        <span className="text-sky-800 font-semibold flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform">
                          Detail <ChevronRight className="w-3.5 h-3.5" />
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
