import React, { useState, useRef } from 'react';
import {
  UploadCloud,
  Image as ImageIcon,
  Trash2,
  Camera,
  CheckCircle2,
  ExternalLink,
  RefreshCw,
  Sparkles,
  Link as LinkIcon,
  X,
} from 'lucide-react';
import { optimizeProductImage, formatFileSize } from '../utils/imageUtils';
import { SupabaseService } from '../services/supabaseService';

interface ProductPhotoUploadProps {
  value: string;
  onChange: (url: string) => void;
  label?: string;
  productName?: string;
}

export const ProductPhotoUpload: React.FC<ProductPhotoUploadProps> = ({
  value,
  onChange,
  label = 'Foto Kemasan Produk',
  productName = 'Produk',
}) => {
  const [activeMode, setActiveMode] = useState<'upload' | 'url'>('upload');
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processStatus, setProcessStatus] = useState<string>('');
  const [fileMeta, setFileMeta] = useState<{
    name: string;
    originalSize?: number;
    optimizedSize?: number;
    dimensions?: string;
  } | null>(null);
  const [previewZoom, setPreviewZoom] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Handle local file processing (drag-and-drop or manual click)
  const processFile = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Format berkas tidak didukung. Harap pilih gambar JPG, PNG, WEBP, atau GIF.');
      return;
    }

    setIsProcessing(true);
    setProcessStatus('Mengoptimalkan resolusi foto kemasan...');

    try {
      // 1. Client-side image optimization (sharp text on packaging, compressed size)
      const optimized = await optimizeProductImage(file, 1200, 1200, 0.85);

      setFileMeta({
        name: file.name,
        originalSize: optimized.originalSize,
        optimizedSize: optimized.optimizedSize,
        dimensions: optimized.width > 0 ? `${optimized.width} × ${optimized.height} px` : undefined,
      });

      // 2. Try Supabase Storage upload if Supabase is connected
      const config = SupabaseService.getConfigInfo();
      if (config.isConfigured) {
        setProcessStatus('Menyimpan ke Supabase Storage...');
        try {
          const remoteUrl = await SupabaseService.uploadProductPhoto(file, file.name);
          if (remoteUrl) {
            onChange(remoteUrl);
            setProcessStatus('Foto tersimpan di Supabase Storage & lokal');
            setTimeout(() => {
              setIsProcessing(false);
              setProcessStatus('');
            }, 600);
            return;
          }
        } catch (storageErr) {
          console.warn('Fallback ke penyimpanan data URL:', storageErr);
        }
      }

      // 3. Fallback to high-performance optimized Base64 data URL
      // (Guaranteed to work locally, offline, and saves in Supabase foto_url column)
      onChange(optimized.dataUrl);
      setProcessStatus('Foto lokal berhasil dioptimalkan!');
      setTimeout(() => {
        setIsProcessing(false);
        setProcessStatus('');
      }, 500);
    } catch (err: any) {
      console.error('Gagal memproses gambar:', err);
      alert('Gagal memproses foto: ' + (err?.message || 'Terjadi kesalahan'));
      setIsProcessing(false);
      setProcessStatus('');
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
    // Reset input so same file can be re-selected if desired
    if (e.target) e.target.value = '';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleClearPhoto = () => {
    onChange('');
    setFileMeta(null);
  };

  const isLocalData = value?.startsWith('data:image');
  const isSupabaseStorage = value?.includes('supabase.co/storage');
  const hasPhoto = Boolean(value && value.trim().length > 0);

  return (
    <div className="space-y-2.5">
      {/* Header & Mode Switcher */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <label className="font-bold text-slate-700 flex items-center gap-1.5 text-xs">
          <Camera className="w-3.5 h-3.5 text-sky-700" />
          <span>{label}</span>
          <span className="text-slate-400 font-normal text-[11px]">(Lokal / Tautan URL)</span>
        </label>

        {/* Mode Toggle Buttons */}
        <div className="inline-flex p-0.5 bg-slate-100 rounded-lg border border-slate-200 text-[11px]">
          <button
            type="button"
            onClick={() => setActiveMode('upload')}
            className={`px-2.5 py-1 rounded-md font-bold transition-all flex items-center gap-1 ${
              activeMode === 'upload'
                ? 'bg-white text-sky-900 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <UploadCloud className="w-3 h-3" />
            <span>Upload Berkas Lokal</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveMode('url')}
            className={`px-2.5 py-1 rounded-md font-bold transition-all flex items-center gap-1 ${
              activeMode === 'url'
                ? 'bg-white text-sky-900 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <LinkIcon className="w-3 h-3" />
            <span>Tautan URL Web</span>
          </button>
        </div>
      </div>

      {/* Hidden native file input for manual select */}
      <input
        type="file"
        ref={fileInputRef}
        accept="image/png,image/jpeg,image/jpg,image/webp,image/gif"
        onChange={handleFileChange}
        className="hidden"
      />

      {/* Upload or URL Container */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-start">
        {/* Left Column: Upload / URL Input Area */}
        <div className={hasPhoto ? 'md:col-span-8 space-y-2' : 'md:col-span-12 space-y-2'}>
          {activeMode === 'upload' ? (
            /* Drag & Drop Area */
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => !isProcessing && fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-all relative overflow-hidden ${
                isDragging
                  ? 'border-sky-500 bg-sky-50/80 scale-[1.01]'
                  : 'border-slate-300 hover:border-sky-400 bg-slate-50/60 hover:bg-sky-50/30'
              } ${isProcessing ? 'pointer-events-none opacity-80' : ''}`}
            >
              {isProcessing ? (
                <div className="py-4 space-y-2">
                  <RefreshCw className="w-6 h-6 text-sky-600 animate-spin mx-auto" />
                  <p className="text-xs font-bold text-sky-900">{processStatus || 'Memproses foto...'}</p>
                  <p className="text-[11px] text-slate-500">Menyesuaikan rasio gambar dan detail kemasan</p>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="w-10 h-10 mx-auto rounded-xl bg-sky-100 text-sky-800 flex items-center justify-center shadow-2xs">
                    <UploadCloud className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-800">
                      Klik untuk pilih foto produk dari perangkat, atau seret & lepas file ke sini
                    </p>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Mendukung format PNG, JPG, JPEG, WEBP (Maksimal 10 MB per foto)
                    </p>
                  </div>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white border border-slate-200 text-slate-700 rounded-lg text-[11px] font-bold shadow-2xs">
                    <Camera className="w-3 h-3 text-sky-600" />
                    <span>Pilih Berkas Foto Lokal</span>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* URL Input Area */
            <div className="space-y-1.5 bg-slate-50/80 p-3 rounded-xl border border-slate-200">
              <label className="text-[11px] font-bold text-slate-600 block">
                Masukkan URL Langsung Foto Kemasan Produk:
              </label>
              <div className="flex gap-2">
                <input
                  type="url"
                  value={value || ''}
                  onChange={(e) => onChange(e.target.value)}
                  placeholder="https://images.unsplash.com/... atau tautan CDN gambar produk"
                  className="flex-1 px-3 py-2 border border-slate-300 rounded-xl font-mono text-[11px] bg-white focus:ring-2 focus:ring-sky-500"
                />
                {value && (
                  <button
                    type="button"
                    onClick={handleClearPhoto}
                    className="px-2.5 py-1 text-red-600 hover:bg-red-50 rounded-lg border border-red-200 text-xs font-bold"
                    title="Kosongkan tautan URL"
                  >
                    Reset
                  </button>
                )}
              </div>
              <p className="text-[10.5px] text-slate-500">
                Gunakan URL langsung berformat HTTPS yang dapat diakses publik tanpa login.
              </p>
            </div>
          )}

          {/* Quick Info & Tips */}
          <div className="flex items-center justify-between text-[10.5px] text-slate-500 px-1">
            <span className="flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-500 shrink-0" />
              <span>Otomatis dikompres & dioptimalkan untuk penyimpanan database Supabase.</span>
            </span>
            {hasPhoto && (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="text-sky-700 hover:text-sky-900 font-bold underline"
              >
                Ganti Berkas
              </button>
            )}
          </div>
        </div>

        {/* Right Column: Live Thumbnail & Information Card */}
        {hasPhoto && (
          <div className="md:col-span-4 bg-white border border-slate-200 rounded-xl p-2.5 shadow-2xs space-y-2">
            <div className="flex items-center justify-between border-b border-slate-100 pb-1.5">
              <span className="text-[11px] font-bold text-slate-700 flex items-center gap-1">
                <ImageIcon className="w-3.5 h-3.5 text-sky-700" />
                <span>Pratinjau Foto</span>
              </span>
              <button
                type="button"
                onClick={handleClearPhoto}
                className="text-red-500 hover:text-red-700 p-1 hover:bg-red-50 rounded-md transition-colors"
                title="Hapus foto produk ini"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Thumbnail Image */}
            <div
              onClick={() => setPreviewZoom(true)}
              className="relative aspect-video sm:aspect-square w-full rounded-lg overflow-hidden border border-slate-200 bg-slate-100 group cursor-pointer"
              title="Klik untuk perbesar pratinjau foto"
            >
              <img
                src={value}
                alt={productName || 'Kemasan Produk'}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                onError={(e) => {
                  (e.target as HTMLImageElement).src =
                    'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=600&auto=format&fit=crop&q=80';
                }}
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold gap-1">
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Perbesar</span>
              </div>
            </div>

            {/* Badge & Source Details */}
            <div className="space-y-1">
              <div className="flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span className="text-[10px] font-bold text-emerald-800">
                  {isSupabaseStorage
                    ? 'Tersimpan di Supabase Storage'
                    : isLocalData
                    ? 'Foto Lokal Terkompresi'
                    : 'Tautan URL Aktif'}
                </span>
              </div>

              {fileMeta && (
                <div className="text-[10px] text-slate-500 font-mono bg-slate-50 p-1.5 rounded border border-slate-100 space-y-0.5 leading-tight">
                  <div className="truncate font-semibold text-slate-700">{fileMeta.name}</div>
                  {fileMeta.optimizedSize && (
                    <div className="text-emerald-700 font-bold">
                      Ukuran: {formatFileSize(fileMeta.optimizedSize)}
                      {fileMeta.originalSize && fileMeta.originalSize > fileMeta.optimizedSize && (
                        <span className="text-slate-400 font-normal line-through ml-1">
                          {formatFileSize(fileMeta.originalSize)}
                        </span>
                      )}
                    </div>
                  )}
                  {fileMeta.dimensions && <div>Dimensi: {fileMeta.dimensions}</div>}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Modal Zoom Preview */}
      {previewZoom && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in"
          onClick={() => setPreviewZoom(false)}
        >
          <div
            className="bg-white rounded-2xl p-3 max-w-lg w-full shadow-2xl space-y-3 relative animate-in zoom-in-95"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h4 className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
                <ImageIcon className="w-4 h-4 text-sky-700" />
                <span>Pratinjau Foto Kemasan: {productName}</span>
              </h4>
              <button
                type="button"
                onClick={() => setPreviewZoom(false)}
                className="p-1 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="max-h-[70vh] overflow-hidden rounded-xl bg-slate-50 flex items-center justify-center">
              <img
                src={value}
                alt={productName}
                className="max-h-[65vh] w-auto object-contain rounded-lg"
              />
            </div>
            <div className="flex justify-end pt-1">
              <button
                type="button"
                onClick={() => setPreviewZoom(false)}
                className="px-4 py-1.5 bg-slate-800 text-white rounded-xl text-xs font-bold"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
