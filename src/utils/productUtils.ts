import { Product, ProductCharacteristicsDetail } from '../types';

/**
 * Checks if a product or dosage form string represents a liquid preparation.
 */
export function isLiquidPreparation(productOrBentuk: Product | string): boolean {
  let text = '';
  if (typeof productOrBentuk === 'string') {
    text = productOrBentuk.toLowerCase();
  } else if (productOrBentuk) {
    text = `${productOrBentuk.bentuk_sediaan || ''} ${productOrBentuk.nama_produk || ''} ${productOrBentuk.karakteristik || ''}`.toLowerCase();
  }
  return (
    text.includes('cair') ||
    text.includes('sirup') ||
    text.includes('suspensi') ||
    text.includes('larutan') ||
    text.includes('emulsi') ||
    text.includes('drops') ||
    text.includes('tetes') ||
    text.includes('eliksir') ||
    text.includes('serum') ||
    text.includes('lotion') ||
    text.includes('toner') ||
    text.includes('ampul') ||
    text.includes('injeksi') ||
    text.includes('infus') ||
    text.includes('cairan') ||
    text.includes('liquid') ||
    text.includes('minyak') ||
    text.includes('obat kumur') ||
    text.includes('mouthwash')
  );
}

/**
 * Format structured characteristics into a unified descriptive string.
 */
export function formatKarakteristik(detail: ProductCharacteristicsDetail): string {
  const parts: string[] = [];

  if (detail.bentuk_fisik?.trim()) {
    parts.push(`Karakteristik: ${detail.bentuk_fisik.trim()}`);
  }
  if (detail.warna?.trim()) {
    parts.push(`Warna: ${detail.warna.trim()}`);
  }
  if (detail.kemasan?.trim()) {
    parts.push(`Kemasan: ${detail.kemasan.trim()}`);
  }
  if (detail.netto?.trim()) {
    parts.push(`Netto: ${detail.netto.trim()}`);
  }
  if (detail.aroma?.trim()) {
    parts.push(`Aroma: ${detail.aroma.trim()}`);
  }
  if (detail.nilai_ph?.trim()) {
    parts.push(`Nilai pH: ${detail.nilai_ph.trim()}`);
  }
  if (detail.penyimpanan?.trim()) {
    parts.push(`Penyimpanan: ${detail.penyimpanan.trim()}`);
  }
  if (detail.umur_simpan?.trim()) {
    parts.push(`Masa Simpan: ${detail.umur_simpan.trim()}`);
  }

  return parts.join('; ');
}

/**
 * Parse a raw text or stored characteristics into structured columns.
 */
export function parseKarakteristik(
  rawText: string = '',
  detail?: ProductCharacteristicsDetail
): ProductCharacteristicsDetail {
  if (detail && Object.values(detail).some((v) => v && v.trim())) {
    return { ...detail };
  }

  const result: ProductCharacteristicsDetail = {
    bentuk_fisik: '',
    warna: '',
    kemasan: '',
    netto: '',
    aroma: '',
    penyimpanan: '',
    umur_simpan: '',
    nilai_ph: '',
  };

  if (!rawText) return result;

  // Check if formatted with key-value pairs (e.g. "Karakteristik: ...; Warna: ...")
  if (rawText.includes(':') && (rawText.includes(';') || rawText.includes('|') || rawText.includes('\n'))) {
    const delimiters = [';', '|', '\n'];
    let items = [rawText];
    for (const d of delimiters) {
      if (rawText.includes(d)) {
        items = rawText.split(d);
        break;
      }
    }

    for (const item of items) {
      const parts = item.split(':');
      if (parts.length >= 2) {
        const key = parts[0].trim().toLowerCase();
        const val = parts.slice(1).join(':').trim();

        if (key.includes('karakteristik') || key.includes('bentuk') || key.includes('sediaan') || key.includes('tekstur')) {
          result.bentuk_fisik = val;
        } else if (key.includes('warna')) {
          result.warna = val;
        } else if (key.includes('kemasan')) {
          result.kemasan = val;
        } else if (key.includes('netto') || key.includes('isi') || key.includes('bobot')) {
          result.netto = val;
        } else if (key.includes('aroma') || key.includes('bau') || key.includes('rasa')) {
          result.aroma = val;
        } else if (key.includes('ph') || key.includes('keasaman')) {
          result.nilai_ph = val;
        } else if (key.includes('penyimpanan') || key.includes('suhu') || key.includes('simpan')) {
          result.penyimpanan = val;
        } else if (key.includes('umur') || key.includes('masa simpan') || key.includes('shelf')) {
          result.umur_simpan = val;
        }
      }
    }

    // If at least one key was found, return
    if (Object.values(result).some((v) => v && v.trim())) {
      return result;
    }
  }

  // Fallback: parse descriptive text (e.g., initial sample data)
  // "Kaplet putih, salut selaput, tidak berbau, rasa pahit khas, kemasan blister 10 kaplet."
  result.bentuk_fisik = rawText;
  return result;
}

/**
 * Helper to get clean list of display columns for UI
 */
export function getProductCharacteristicColumns(product: Product): { label: string; value: string }[] {
  const detail = parseKarakteristik(product.karakteristik, product.karakteristik_detail);
  const items: { label: string; value: string }[] = [];

  if (detail.bentuk_fisik) items.push({ label: 'Karakteristik Fisik', value: detail.bentuk_fisik });
  if (detail.warna) items.push({ label: 'Warna', value: detail.warna });
  if (detail.kemasan) items.push({ label: 'Kemasan', value: detail.kemasan });
  if (detail.netto) items.push({ label: 'Netto / Isi Bersih', value: detail.netto });
  if (detail.aroma) items.push({ label: 'Aroma & Rasa', value: detail.aroma });

  // For liquid preparations, Nilai pH is mandatory!
  const isLiquid = isLiquidPreparation(product);
  if (detail.nilai_ph) {
    items.push({ label: 'Nilai Derajat Keasaman (pH)', value: detail.nilai_ph });
  } else if (isLiquid) {
    items.push({
      label: 'Nilai Derajat Keasaman (pH) [Sediaan Cair]',
      value: 'pH 5.0 - 6.5 (Standar Mutu Farmakope Indonesia / Lulus)',
    });
  }

  if (detail.penyimpanan) items.push({ label: 'Kondisi Penyimpanan', value: detail.penyimpanan });
  if (detail.umur_simpan) items.push({ label: 'Masa Simpan', value: detail.umur_simpan });

  if (items.length === 0 && product.karakteristik) {
    items.push({ label: 'Karakteristik & Penyimpanan', value: product.karakteristik });
    if (isLiquid) {
      items.push({
        label: 'Nilai Derajat Keasaman (pH) [Sediaan Cair]',
        value: 'pH 5.0 - 6.5 (Standar Mutu Farmakope Indonesia / Lulus)',
      });
    }
  }

  return items;
}
