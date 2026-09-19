import React, { useEffect, useRef, useState } from 'react';
import JsBarcode from 'jsbarcode';
import QRCode from 'qrcode';
import { Product } from '../types';
import { QrCode, Barcode, Copy, Check, ExternalLink, ShieldCheck } from 'lucide-react';

interface ProductBarcodeVisualProps {
  product: Product;
  size?: 'sm' | 'md' | 'lg';
  showUrlActions?: boolean;
  onNavigateToProduct?: (p: Product) => void;
}

export const ProductBarcodeVisual: React.FC<ProductBarcodeVisualProps> = ({
  product,
  size = 'md',
  showUrlActions = true,
  onNavigateToProduct,
}) => {
  const barcodeRef = useRef<SVGSVGElement | null>(null);
  const qrCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const [copied, setCopied] = useState(false);

  // Generate public page URL
  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://bpom.vercel.app';
  const productUrl = `${origin}/produk/${product.id}`;

  useEffect(() => {
    // Generate Barcode SVG
    if (barcodeRef.current) {
      try {
        const barcodeValue = product.barcode || product.nomor_izin.replace(/[^A-Za-z0-9]/g, '');
        JsBarcode(barcodeRef.current, barcodeValue, {
          format: 'CODE128',
          width: size === 'sm' ? 1.2 : size === 'lg' ? 2.0 : 1.6,
          height: size === 'sm' ? 32 : size === 'lg' ? 60 : 44,
          displayValue: true,
          font: 'monospace',
          fontSize: size === 'sm' ? 9 : 11,
          textMargin: 2,
          margin: 0,
          background: 'transparent',
          lineColor: '#0f172a',
        });
      } catch (err) {
        console.warn('Gagal render JsBarcode:', err);
      }
    }

    // Generate QR Code targeting the public Product Page
    if (qrCanvasRef.current) {
      const qrSize = size === 'sm' ? 84 : size === 'lg' ? 140 : 110;
      QRCode.toCanvas(
        qrCanvasRef.current,
        productUrl,
        {
          width: qrSize,
          margin: 1,
          color: {
            dark: '#0f172a',
            light: '#ffffff',
          },
        },
        (err) => {
          if (err) console.warn('Gagal generate QR Code:', err);
        }
      );
    }
  }, [product, size, productUrl]);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(productUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs space-y-3">
      <div className="flex items-center justify-between border-b border-slate-100 pb-2">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-sky-100 text-sky-800 flex items-center justify-center">
            <Barcode className="w-3.5 h-3.5" />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-800">Barcode & QR Code Halaman Produk</div>
            <div className="text-[10px] text-slate-500">Otomatis terhubung ke tautan verifikasi resmi</div>
          </div>
        </div>
        <span className="text-[10px] font-mono bg-slate-100 text-slate-700 px-2 py-0.5 rounded border border-slate-200">
          NIE: {product.nomor_izin}
        </span>
      </div>

      {/* Visual Codes Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center bg-slate-50 p-3 rounded-lg border border-slate-200/80">
        {/* Barcode side */}
        <div className="flex flex-col items-center justify-center p-2 bg-white rounded border border-slate-200 min-h-[90px]">
          <span className="text-[9px] uppercase font-bold tracking-wider text-slate-400 mb-1 flex items-center gap-1">
            <Barcode className="w-3 h-3 text-slate-500" /> Barcode Fisik Kemasan
          </span>
          <svg ref={barcodeRef} className="max-w-full overflow-visible" />
        </div>

        {/* QR Code side */}
        <div className="flex items-center gap-3 p-2 bg-white rounded border border-slate-200">
          <div className="bg-white p-1 rounded border border-slate-200 shadow-2xs shrink-0">
            <canvas ref={qrCanvasRef} className="rounded" />
          </div>
          <div className="text-left space-y-1">
            <span className="text-[9px] uppercase font-bold tracking-wider text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded flex items-center gap-1 w-fit">
              <QrCode className="w-2.5 h-2.5" /> Scan QR Verifikasi
            </span>
            <div className="text-[11px] font-bold text-slate-800 line-clamp-1">
              {product.nama_produk}
            </div>
            <p className="text-[10px] text-slate-500 leading-tight">
              Arahkan kamera HP ke QR Code ini untuk membuka halaman produk BPOM secara langsung.
            </p>
          </div>
        </div>
      </div>

      {/* Actions & Public URL */}
      {showUrlActions && (
        <div className="space-y-2 pt-1">
          <div className="flex items-center gap-2 bg-slate-100/80 px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider shrink-0">URL:</span>
            <code className="text-[11px] font-mono text-sky-800 truncate flex-1 select-all">
              {productUrl}
            </code>
            <button
              onClick={handleCopyLink}
              className="p-1 text-slate-600 hover:text-sky-700 hover:bg-white rounded transition-colors shrink-0 flex items-center gap-1 text-[11px] font-semibold"
              title="Salin Link Halaman Produk"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-700 text-[10px]">Tersalin</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span className="text-[10px]">Salin</span>
                </>
              )}
            </button>
          </div>

          {onNavigateToProduct && (
            <button
              onClick={() => onNavigateToProduct(product)}
              className="w-full py-1.5 px-3 bg-sky-50 hover:bg-sky-100 text-sky-800 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-colors border border-sky-200"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Buka Halaman Produk Publik Ini</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
};
