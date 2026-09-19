import React, { useState, useEffect, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { Camera, X, AlertCircle, Sparkles, Image as ImageIcon, CheckCircle2 } from 'lucide-react';
import { Product } from '../types';

interface BarcodeScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onScanResult: (code: string) => void;
  products: Product[];
}

export const BarcodeScannerModal: React.FC<BarcodeScannerModalProps> = ({
  isOpen,
  onClose,
  onScanResult,
  products,
}) => {
  const [scannerActive, setScannerActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [detectedProduct, setDetectedProduct] = useState<Product | null>(null);
  const html5QrCodeRef = useRef<Html5Qrcode | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      startCamera();
    } else {
      stopCamera();
      setDetectedProduct(null);
      setCameraError(null);
    }
    return () => {
      stopCamera();
    };
  }, [isOpen]);

  const startCamera = async () => {
    setCameraError(null);
    try {
      // give DOM a moment to render reader element
      setTimeout(async () => {
        try {
          const html5QrCode = new Html5Qrcode('qr-camera-stream');
          html5QrCodeRef.current = html5QrCode;

          const config = { fps: 10, qrbox: { width: 250, height: 250 } };
          await html5QrCode.start(
            { facingMode: 'environment' },
            config,
            (decodedText) => {
              handleCodeFound(decodedText);
            },
            () => {
              // ignore frame scan misses
            }
          );
          setScannerActive(true);
        } catch (err: any) {
          console.warn('Camera error:', err);
          setCameraError(
            'Kamera tidak dapat diakses atau izin ditolak. Anda dapat menggunakan tombol Contoh Barcode atau Unggah Foto Barcode di bawah ini.'
          );
          setScannerActive(false);
        }
      }, 300);
    } catch (e: any) {
      setCameraError('Gagal mengaktifkan kamera.');
    }
  };

  const stopCamera = async () => {
    if (html5QrCodeRef.current) {
      try {
        if (html5QrCodeRef.current.isScanning) {
          await html5QrCodeRef.current.stop();
        }
        html5QrCodeRef.current.clear();
      } catch (e) {
        console.warn(e);
      }
      html5QrCodeRef.current = null;
    }
    setScannerActive(false);
  };

  const handleCodeFound = (code: string) => {
    // Check if code matches barcode or registration number of known products
    const cleanCode = code.trim();
    const match = products.find(
      p => p.barcode === cleanCode || 
           p.nomor_izin.toLowerCase() === cleanCode.toLowerCase() ||
           cleanCode.includes(p.nomor_izin) ||
           p.qr_code_hash.toLowerCase() === cleanCode.toLowerCase()
    );

    if (match) {
      setDetectedProduct(match);
      stopCamera();
    } else {
      onScanResult(cleanCode);
      onClose();
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const html5QrCode = new Html5Qrcode('qr-camera-stream-dummy');
      const result = await html5QrCode.scanFile(file, true);
      handleCodeFound(result);
    } catch (err) {
      // If image reading fails, try barcode fallback test
      setCameraError('Tidak dapat mendeteksi barcode dari gambar yang diunggah. Pastikan barcode terlihat jelas dan tidak buram.');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-sky-800 to-sky-700 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center text-white border border-white/20">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-lg leading-tight">Scan Barcode / QR Izin BPOM</h3>
              <p className="text-xs text-sky-100">Pindai kode batang izin edar pada kemasan produk</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/25 flex items-center justify-center text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scanner Container */}
        <div className="p-6">
          {detectedProduct ? (
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-5 text-center">
              <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-3">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <h4 className="font-bold text-emerald-900 text-base mb-1">Produk Terverifikasi BPOM!</h4>
              <p className="text-xs text-emerald-700 mb-4">Barcode cocok dengan data registrasi resmi</p>

              <div className="bg-white rounded-lg p-3 border border-emerald-100 text-left mb-4 shadow-2xs">
                <div className="text-xs text-slate-500 font-medium">Nama Produk:</div>
                <div className="font-bold text-slate-800 text-sm">{detectedProduct.nama_produk}</div>
                <div className="grid grid-cols-2 gap-2 mt-2 pt-2 border-t border-slate-100 text-xs">
                  <div>
                    <span className="text-slate-400">Nomor NIE:</span>
                    <div className="font-semibold text-sky-800">{detectedProduct.nomor_izin}</div>
                  </div>
                  <div>
                    <span className="text-slate-400">Status:</span>
                    <div className="font-semibold text-emerald-600">{detectedProduct.status_registrasi}</div>
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => {
                    onScanResult(detectedProduct.nomor_izin);
                    onClose();
                  }}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-2 px-4 rounded-lg text-sm transition-colors"
                >
                  Buka Detail Lengkap
                </button>
                <button
                  onClick={() => {
                    setDetectedProduct(null);
                    startCamera();
                  }}
                  className="bg-slate-200 hover:bg-slate-300 text-slate-700 font-medium py-2 px-3 rounded-lg text-sm transition-colors"
                >
                  Scan Ulang
                </button>
              </div>
            </div>
          ) : (
            <div>
              {/* Camera viewfinder */}
              <div className="relative rounded-xl overflow-hidden bg-slate-900 aspect-square max-w-[340px] mx-auto border-2 border-slate-300 flex items-center justify-center shadow-inner">
                <div id="qr-camera-stream" className="w-full h-full" />
                <div id="qr-camera-stream-dummy" className="hidden" />

                {/* Laser scan animation overlay */}
                {scannerActive && (
                  <div className="absolute inset-x-8 top-1/2 h-0.5 bg-red-500 shadow-[0_0_8px_#ef4444] animate-pulse pointer-events-none" />
                )}

                {!scannerActive && !cameraError && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400 p-4 text-center">
                    <Camera className="w-10 h-10 mb-2 animate-bounce text-sky-400" />
                    <p className="text-xs">Mengaktifkan kamera pemindai...</p>
                  </div>
                )}

                {cameraError && (
                  <div className="absolute inset-0 bg-slate-900/90 flex flex-col items-center justify-center text-slate-300 p-6 text-center">
                    <AlertCircle className="w-10 h-10 text-amber-400 mb-2" />
                    <p className="text-xs leading-relaxed mb-3">{cameraError}</p>
                    <button
                      onClick={startCamera}
                      className="px-3 py-1.5 bg-sky-600 hover:bg-sky-500 text-white rounded-md text-xs font-semibold"
                    >
                      Coba Lagi
                    </button>
                  </div>
                )}
              </div>

              {/* Alternative scan options */}
              <div className="mt-5 space-y-3">
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span className="font-semibold">Atau gunakan opsi berikut:</span>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center gap-1.5 text-sky-700 hover:text-sky-800 font-semibold cursor-pointer"
                  >
                    <ImageIcon className="w-4 h-4" /> Unggah Foto Barcode
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </div>

                {/* Quick test barcodes from sample products */}
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <div className="text-[11px] font-bold text-slate-600 mb-2 flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    Klik Contoh Barcode Produk Resmi untuk Uji Coba:
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {products.slice(0, 4).map((p) => (
                      <button
                        key={p.id}
                        onClick={() => handleCodeFound(p.barcode)}
                        className="text-left p-2 rounded-lg bg-white hover:bg-sky-50 border border-slate-200 hover:border-sky-300 transition-all text-xs"
                      >
                        <div className="font-bold text-slate-800 truncate">{p.nama_produk}</div>
                        <div className="text-[10px] text-sky-600 font-mono">{p.barcode}</div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-slate-50 px-6 py-3 border-t border-slate-200 flex justify-between items-center text-xs text-slate-500">
          <span>Standar EAN-13 & QR Code BPOM RI</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg font-medium transition-colors"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
