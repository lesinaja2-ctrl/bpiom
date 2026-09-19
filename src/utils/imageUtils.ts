/**
 * Image Processing & Optimization Utility
 * Badan Pengolahan Informasi Obat dan Makanan (BPIOM)
 * 
 * Provides client-side resizing, compression, Base64 encoding,
 * and Supabase Storage integration for local product photo uploads.
 */

export interface OptimizedImageResult {
  dataUrl: string;
  originalSize: number;
  optimizedSize: number;
  fileName: string;
  fileType: string;
  width: number;
  height: number;
}

/**
 * Format bytes into human-readable string (KB, MB)
 */
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

/**
 * Compress and optimize an image file client-side using HTML5 Canvas.
 * Keeps packaging details, text, and barcodes crystal clear while
 * keeping file size small (typically 80-250 KB) to fit within browser storage
 * and sync smoothly to databases.
 */
export async function optimizeProductImage(
  file: File,
  maxWidth: number = 1200,
  maxHeight: number = 1200,
  quality: number = 0.85
): Promise<OptimizedImageResult> {
  return new Promise((resolve, reject) => {
    // Basic format validation
    if (!file.type.startsWith('image/')) {
      reject(new Error('Berkas harus berupa gambar (JPG, PNG, WEBP, atau GIF)'));
      return;
    }

    const reader = new FileReader();
    reader.readAsDataURL(file);

    reader.onload = (event) => {
      const rawDataUrl = event.target?.result as string;

      // For SVGs or tiny files (< 60 KB), no compression needed
      if (file.type === 'image/svg+xml' || file.size < 60 * 1024) {
        resolve({
          dataUrl: rawDataUrl,
          originalSize: file.size,
          optimizedSize: file.size,
          fileName: file.name,
          fileType: file.type,
          width: 0,
          height: 0,
        });
        return;
      }

      const img = new Image();
      img.src = rawDataUrl;

      img.onload = () => {
        let width = img.naturalWidth || img.width;
        let height = img.naturalHeight || img.height;

        // Calculate aspect-ratio preserving dimensions
        if (width > maxWidth || height > maxHeight) {
          if (width > height) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          } else {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');

        if (!ctx) {
          resolve({
            dataUrl: rawDataUrl,
            originalSize: file.size,
            optimizedSize: file.size,
            fileName: file.name,
            fileType: file.type,
            width,
            height,
          });
          return;
        }

        // High quality bicubic-like interpolation
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';

        // White background for transparent PNGs to prevent black background when saving as JPEG
        if (file.type !== 'image/png') {
          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(0, 0, width, height);
        }

        ctx.drawImage(img, 0, 0, width, height);

        // Export as JPEG (for optimal compression) or PNG (if original was PNG)
        const targetFormat = file.type === 'image/png' ? 'image/png' : 'image/jpeg';
        const compressedDataUrl = canvas.toDataURL(targetFormat, quality);
        const approxSize = Math.round((compressedDataUrl.length * 3) / 4);

        resolve({
          dataUrl: compressedDataUrl,
          originalSize: file.size,
          optimizedSize: approxSize,
          fileName: file.name,
          fileType: targetFormat,
          width,
          height,
        });
      };

      img.onerror = () => {
        // If image loading fails, return raw data
        resolve({
          dataUrl: rawDataUrl,
          originalSize: file.size,
          optimizedSize: file.size,
          fileName: file.name,
          fileType: file.type,
          width: 0,
          height: 0,
        });
      };
    };

    reader.onerror = (err) => reject(err);
  });
}
