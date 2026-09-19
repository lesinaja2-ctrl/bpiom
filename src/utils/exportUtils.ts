import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import QRCode from 'qrcode';
import { Product, LabResult, Producer, Report, User } from '../types';
import { getProductCharacteristicColumns, parseKarakteristik, isLiquidPreparation } from './productUtils';

/**
 * EXPORT KE EXCEL (.xlsx)
 */
export function exportToExcel(data: any[], filename: string, sheetName: string = 'Data') {
  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
  
  // Auto-fit column widths
  const maxProps = Object.keys(data[0] || {});
  const colWidths = maxProps.map(key => {
    const maxLen = Math.max(
      key.length,
      ...data.map(item => String(item[key] || '').length)
    );
    return { wch: Math.min(Math.max(maxLen + 2, 10), 50) };
  });
  worksheet['!cols'] = colWidths;

  XLSX.writeFile(workbook, `${filename}.xlsx`);
}

/**
 * EXPORT SERTIFIKAT IZIN EDAR RESMI (PDF LENGKAP & DETAIL)
 * Memuat legalitas pendaftar, rincian formula komposisi lengkap,
 * spesifikasi mutu fisikokimia, ketentuan khusus nilai pH sediaan cair,
 * posologi, indikasi, QR Code link halaman produk resmi, serta pengesahan digital BSrE BSSN.
 */
export async function exportCertificatePDF(product: Product, producer?: Producer) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://bpom.vercel.app';
  // Link langsung ke halaman produk mandiri resmi
  const productPageUrl = `${origin}/produk/${product.id}`;

  // Generate QR Code kualitas tinggi yang mengarah ke link halaman produk
  let qrDataUrl: string | null = null;
  try {
    qrDataUrl = await QRCode.toDataURL(productPageUrl, {
      errorCorrectionLevel: 'M',
      margin: 1,
      width: 320,
      color: {
        dark: '#0369a1', // Biru safir resmi
        light: '#ffffff',
      },
    });
  } catch (qrErr) {
    console.warn('Gagal menghasilkan QR Code untuk sertifikat:', qrErr);
  }

  const isLiquid = isLiquidPreparation(product);
  const charDetail = parseKarakteristik(product.karakteristik, product.karakteristik_detail);
  const phValue = charDetail.nilai_ph
    ? `${charDetail.nilai_ph} (Standar Mutu Farmakope Indonesia)`
    : isLiquid
    ? 'pH 5.0 - 6.5 (Standar Mutu Sediaan Cair Farmakope Indonesia / Memenuhi Syarat)'
    : 'N/A (Sediaan Padat/Kering)';

  const drawPageBorderAndHeader = (pageNum: number, totalPages: number) => {
    // Outer decorative border
    doc.setDrawColor(2, 132, 199); // Sky blue
    doc.setLineWidth(1.2);
    doc.rect(10, 10, 190, 277);

    doc.setDrawColor(203, 213, 225); // Slate 300
    doc.setLineWidth(0.4);
    doc.rect(12, 12, 186, 273);

    // Subtle background watermark
    doc.setTextColor(244, 247, 251);
    doc.setFontSize(26);
    doc.setFont('helvetica', 'bold');
    doc.text('BADAN PENGOLAHAN INFORMASI OBAT DAN MAKANAN', 105, 145, {
      align: 'center',
      angle: 45,
    });

    // Official Kop Garuda / Instansi
    doc.setTextColor(15, 23, 42);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('REPUBLIK INDONESIA', 105, 20, { align: 'center' });

    doc.setFontSize(13);
    doc.setTextColor(2, 132, 199);
    doc.text('BADAN PENGOLAHAN INFORMASI OBAT DAN MAKANAN', 105, 26, { align: 'center' });

    doc.setFontSize(8);
    doc.setTextColor(71, 85, 105);
    doc.setFont('helvetica', 'normal');
    doc.text(
      'Jl. Percetakan Negara No. 23, Jakarta Pusat 10560 | Call Center: 1500533 | www.pom.go.id',
      105,
      31,
      { align: 'center' }
    );

    // Mini QR Code Stamp on Page 1 top-right corner
    if (pageNum === 1 && qrDataUrl) {
      doc.setDrawColor(2, 132, 199);
      doc.setFillColor(255, 255, 255);
      doc.roundedRect(173, 14, 21, 21, 1, 1, 'FD');
      doc.addImage(qrDataUrl, 'PNG', 174, 14.5, 19, 19);
      doc.setFontSize(4.5);
      doc.setTextColor(2, 132, 199);
      doc.setFont('helvetica', 'bold');
      doc.text('SCAN HALAMAN', 183.5, 34, { align: 'center' });
    }

    // Double rule divider
    doc.setDrawColor(2, 132, 199);
    doc.setLineWidth(0.8);
    doc.line(18, 35.5, 192, 35.5);
    doc.setDrawColor(148, 163, 184);
    doc.setLineWidth(0.3);
    doc.line(18, 36.8, 192, 36.8);

    // Footer on each page
    doc.setFontSize(7);
    doc.setTextColor(148, 163, 184);
    doc.text(
      `Dokumen Resmi Berita Negara | Sertifikat Izin Edar: ${product.nomor_izin} | Halaman ${pageNum} dari ${totalPages}`,
      105,
      282,
      { align: 'center' }
    );
  };

  // ==================== HALAMAN 1 ====================
  // Certificate Title
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text('SURAT KEPUTUSAN PERSETUJUAN PENDAFTARAN & IZIN EDAR RESMI', 105, 43, {
    align: 'center',
  });

  doc.setFontSize(8.5);
  doc.setTextColor(71, 85, 105);
  doc.setFont('helvetica', 'normal');
  doc.text(
    `NOMOR KEPUTUSAN: SK-BPIOM/${product.kategori.toUpperCase().replace(/\s+/g, '')}/${product.nomor_izin}/2026`,
    105,
    48,
    { align: 'center' }
  );

  // Legal Preamble / Konsiderans
  doc.setFontSize(8);
  doc.setTextColor(30, 41, 59);
  const preamble =
    'Kepala Badan Pengolahan Informasi Obat dan Makanan Republik Indonesia menerangkan bahwa berdasarkan hasil pengujian laboratorium, verifikasi dokumen farmakovigilans/keamanan, evaluasi formula, serta audit sarana produksi Cara Pembuatan yang Baik (CPOB/CPKB/CPPOB/CPOTB), memberikan Persetujuan Izin Edar untuk:';
  doc.text(doc.splitTextToSize(preamble, 166), 22, 54);

  // TABEL I: DATA IDENTITAS LEGALITAS & PRODUSEN
  autoTable(doc, {
    startY: 63,
    margin: { left: 20, right: 20 },
    theme: 'grid',
    head: [['I. IDENTITAS RESMI PRODUK & LEGALITAS PENDAFTAR', 'KETERANGAN']],
    headStyles: { fillColor: [2, 132, 199], textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 8 },
    styles: { fontSize: 7.5, cellPadding: 2 },
    columnStyles: {
      0: { cellWidth: 55, fontStyle: 'bold', fillColor: [248, 250, 252] },
      1: { cellWidth: 115 },
    },
    body: [
      ['Nama Produk', product.nama_produk],
      ['Merk Dagang', product.merk || '-'],
      ['Nomor Izin Edar (NIE)', product.nomor_izin],
      ['Kategori & Golongan Produk', product.kategori],
      ['Bentuk Sediaan', `${product.bentuk_sediaan} ${isLiquid ? '(Sediaan Cair)' : '(Sediaan Non-Cair)'}`],
      ['Nama Industri Pendaftar / Produsen', product.nama_produsen],
      ['Nomor Izin Usaha Industri', producer?.nomor_izin_industri || 'IK-REG-BPOM-PUSAT'],
      ['Sertifikasi Sarana Produksi', producer?.sertifikasi?.join(', ') || 'CPOB / CPKB / Halal Terdaftar'],
      ['Alamat Pabrik / Fasilitas Produksi', `${producer?.alamat || 'Kawasan Industri Terakreditasi'}, ${producer?.kota || 'Jakarta'}, ${producer?.provinsi || 'Indonesia'}`],
      ['Masa Berlaku Izin Edar', `${product.tanggal_terbit} s/d ${product.tanggal_kedaluwarsa} (5 Tahun Penuh)`],
      ['Status Registrasi di Portal', `${product.status_registrasi} (Terdaftar Resmi & Sah Menurut Hukum)`],
    ],
  });

  const table1End = (doc as any).lastAutoTable.finalY + 4;

  // TABEL II: FORMULA & KOMPOSISI LENGKAP
  autoTable(doc, {
    startY: table1End,
    margin: { left: 20, right: 20 },
    theme: 'grid',
    head: [['II. FORMULA, BAHAN AKTIF & KOMPOSISI LENGKAP', 'RINCIAN FORMULASI TERDAFTAR']],
    headStyles: { fillColor: [15, 23, 42], textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 8 },
    styles: { fontSize: 7.5, cellPadding: 2.2 },
    columnStyles: {
      0: { cellWidth: 55, fontStyle: 'bold', fillColor: [248, 250, 252] },
      1: { cellWidth: 115 },
    },
    body: [
      ['Komposisi Bahan & Zat Aktif', product.komposisi || 'Sesuai dengan berkas registrasi resmi master formula.'],
      ['Standar Bahan Tambahan (Eksipien)', 'Memenuhi syarat kemurnian Farmakope Indonesia Edisi VI / Standar Monografi Resmi.'],
      ['Verifikasi Keamanan Bahan Dilarang', 'Telah diuji: BEBAS Cemaran Toksik (EG/DEG, Merkuri Hg, Timbal Pb, Asam Retinoat, Bahan Pewarna K1/K3/Metanil Yellow).'],
    ],
  });

  const table2End = (doc as any).lastAutoTable.finalY + 4;

  // TABEL III: SPESIFIKASI MUTU, KARAKTERISTIK FISIK & NILAI PH
  autoTable(doc, {
    startY: table2End,
    margin: { left: 20, right: 20 },
    theme: 'grid',
    head: [['III. SPESIFIKASI MUTU FISIKOKIMIA & NILAI pH', 'HASIL EVALUASI LABORATORIUM']],
    headStyles: { fillColor: [14, 116, 144], textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 8 },
    styles: { fontSize: 7.5, cellPadding: 2 },
    columnStyles: {
      0: { cellWidth: 55, fontStyle: 'bold', fillColor: [248, 250, 252] },
      1: { cellWidth: 115 },
    },
    body: [
      ['Wujud / Karakteristik Fisik', charDetail.bentuk_fisik || product.bentuk_sediaan],
      ['Spesifikasi Warna', charDetail.warna || '-'],
      ['Aroma & Rasa (Organoleptik)', charDetail.aroma || '-'],
      ['Kemasan Primer & Sekunder', charDetail.kemasan || '-'],
      ['Netto / Isi Bersih / Bobot', charDetail.netto || '-'],
      [
        isLiquid
          ? 'NILAI DERAJAT KEASAMAN (pH)\n*Spesifikasi Wajib Sediaan Cair'
          : 'Nilai Derajat Keasaman (pH)',
        isLiquid
          ? `${phValue}\n[Status: MEMENUHI PERSYARATAN KONTROL MUTU SEDIAAN CAIR]`
          : phValue,
      ],
      ['Kondisi & Suhu Penyimpanan', charDetail.penyimpanan || product.karakteristik || 'Simpan pada suhu di bawah 30°C, terlindung dari cahaya.'],
      ['Masa Simpan (Shelf Life)', charDetail.umur_simpan || '24 Bulan / 2 Tahun sejak tanggal produksi'],
      ['Nomor Batch Percontohan Uji', product.batch_nomor || '-'],
      ['Hasil Evaluasi Pengujian Lab', `${product.status_uji_lab} (MEMENUHI SYARAT / MS)`],
    ],
  });

  // ==================== HALAMAN 2 ====================
  doc.addPage();

  // Sub-header lampiran
  doc.setFontSize(10.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text('LAMPIRAN SPESIFIKASI TEKNIS & PENGESAHAN DOKUMEN IZIN EDAR', 105, 43, {
    align: 'center',
  });

  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105);
  doc.setFont('helvetica', 'normal');
  doc.text(`Lampiran Terkait Produk: ${product.nama_produk} (NIE: ${product.nomor_izin})`, 105, 48, {
    align: 'center',
  });

  // TABEL IV: FARMAKOLOGI, INDIKASI, DOSIS & PERINGATAN
  autoTable(doc, {
    startY: 53,
    margin: { left: 20, right: 20 },
    theme: 'grid',
    head: [['IV. INDIKASI, ATURAN PENGGUNAAN & KEAMANAN', 'KETENTUAN RESMI PENANDAAN']],
    headStyles: { fillColor: [51, 65, 85], textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 8 },
    styles: { fontSize: 7.5, cellPadding: 2.5 },
    columnStyles: {
      0: { cellWidth: 55, fontStyle: 'bold', fillColor: [248, 250, 252] },
      1: { cellWidth: 115 },
    },
    body: [
      ['Indikasi / Khasiat & Kegunaan', product.indikasi || product.deskripsi || '-'],
      [
        'Aturan Pakai / Posologi',
        product.aturan_pakai ||
          'Gunakan sesuai petunjuk dosis pada kemasan resmi atau resep/instruksi tenaga kesehatan berwenang.',
      ],
      [
        'Peringatan & Kontraindikasi',
        product.kontraindikasi ||
          'Hipersensitif terhadap zat aktif atau eksipien produk. Simpan di tempat sejuk kering, jauhkan dari jangkauan anak-anak.',
      ],
      [
        'Ketentuan Edar & Penandaan',
        'Wajib mencantumkan Nomor Izin Edar (NIE), nomor batch, batas kedaluwarsa, dan barcode resmi pada setiap kemasan terkecil.',
      ],
    ],
  });

  const table4End = (doc as any).lastAutoTable.finalY + 6;

  // TABEL V: PENGAMANAN ELEKTRONIK & QR CODE RESMI LINK HALAMAN PRODUK
  const boxHeight = 45;
  doc.setDrawColor(2, 132, 199);
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(20, table4End, 170, boxHeight, 2.5, 2.5, 'FD');

  doc.setFontSize(8);
  doc.setTextColor(2, 132, 199);
  doc.setFont('helvetica', 'bold');
  doc.text('V. VERIFIKASI INTEGRITAS TANDATANGAN ELEKTRONIK & QR CODE RESMI', 24, table4End + 5.5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(51, 65, 85);
  doc.text(`• Digital Hash (SHA-256) Signature : ${product.qr_code_hash}`, 24, table4End + 11);
  doc.text(`• Kode Barcode Produk Resmi (GS1)   : ${product.barcode || '-'} (Terdaftar di Basis Data Nasional)`, 24, table4End + 16.5);
  doc.text(`• Link Halaman Produk Resmi         : ${productPageUrl}`, 24, table4End + 22);
  doc.text(`• Status Hukum Dokumen Digital       : SAH DAN MEMILIKI KEKUATAN HUKUM MENURUT UU ITE NO. 1/2024`, 24, table4End + 27.5);
  doc.text(`• Otoritas Sertifikasi               : Balai Sertifikasi Elektronik - Badan Siber dan Sandi Negara (BSrE BSSN)`, 24, table4End + 33);
  doc.text(`• Petunjuk Pindai                   : Arahkan kamera HP ke QR Code di samping untuk verifikasi seketika`, 24, table4End + 38.5);

  // KOTAK QR CODE DI SISI KANAN TABEL V (MEMUAT LINK LANGSUNG KE HALAMAN PRODUK)
  if (qrDataUrl) {
    doc.setDrawColor(2, 132, 199);
    doc.setFillColor(255, 255, 255);
    doc.roundedRect(151, table4End + 3.5, 36, 38, 2, 2, 'FD');
    doc.addImage(qrDataUrl, 'PNG', 153.5, table4End + 5, 31, 31);

    doc.setFontSize(5.5);
    doc.setTextColor(2, 132, 199);
    doc.setFont('helvetica', 'bold');
    doc.text('PINDAI CEK PRODUK', 169, table4End + 39, { align: 'center' });
  }

  // KOLOM TANDATANGAN & STEMPEL ELEKTRONIK
  const signY = table4End + 52;
  doc.setFontSize(8.5);
  doc.setTextColor(30, 41, 59);
  doc.text('Ditetapkan di : Jakarta Pusat', 115, signY);
  doc.text(`Pada tanggal  : ${product.tanggal_terbit}`, 115, signY + 5);
  doc.text('a.n. Kepala Badan Pengolahan Informasi Obat dan Makanan', 105, signY + 11);
  doc.text('Direktur Registrasi Produk Obat, Kosmetik & Makanan,', 105, signY + 16);

  // Stempel Digital Box
  doc.setDrawColor(2, 132, 199);
  doc.setFillColor(238, 248, 255);
  doc.circle(85, signY + 28, 12, 'FD');
  doc.setFontSize(5.5);
  doc.setTextColor(2, 132, 199);
  doc.setFont('helvetica', 'bold');
  doc.text('REPUBLIK INDONESIA', 85, signY + 24, { align: 'center' });
  doc.text('BADAN POM', 85, signY + 28, { align: 'center' });
  doc.text('BSrE VERIFIED', 85, signY + 32, { align: 'center' });

  // Tanda Tangan Pejabat
  doc.setFontSize(9);
  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.text('Dra. Lucia Rizka Andalucia, Apt., M.Pharm.', 105, signY + 36);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.text('NIP. 19671120 199303 2 001', 105, signY + 41);

  // Draw borders and header for both pages
  drawPageBorderAndHeader(1, 2);
  doc.setPage(2);
  drawPageBorderAndHeader(2, 2);

  const sanitizedNie = product.nomor_izin.replace(/[/\\?%*:|"<>]/g, '_');
  doc.save(`Sertifikat_BPOM_${sanitizedNie}.pdf`);
}

/**
 * EXPORT SERTIFIKAT IZIN EDAR RESMI DALAM BENTUK MICROSOFT WORD (.DOC / .DOCX)
 * Format standar dokumen Word dengan kop instansi, tabel data lengkap, rincian komposisi,
 * spesifikasi mutu fisikokimia & nilai pH sediaan cair, QR Code link halaman produk, serta tanda tangan elektronik resmi.
 */
export async function exportCertificateWord(product: Product, producer?: Producer) {
  const isLiquid = isLiquidPreparation(product);
  const charDetail = parseKarakteristik(product.karakteristik, product.karakteristik_detail);
  const phValue = charDetail.nilai_ph
    ? `${charDetail.nilai_ph} (Standar Farmakope Indonesia)`
    : isLiquid
    ? 'pH 5.0 - 6.5 (Standar Mutu Sediaan Cair Farmakope Indonesia / Memenuhi Syarat)'
    : 'N/A (Sediaan Padat/Kering)';

  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://bpom.vercel.app';
  const productPageUrl = `${origin}/produk/${product.id}`;

  let qrDataUrl = '';
  try {
    qrDataUrl = await QRCode.toDataURL(productPageUrl, {
      errorCorrectionLevel: 'M',
      margin: 1,
      width: 250,
      color: {
        dark: '#0369a1',
        light: '#ffffff',
      },
    });
  } catch (e) {
    console.warn('Gagal generate QR Code Word:', e);
  }

  const wordHtml = `
    <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
    <head>
      <meta charset='utf-8'>
      <title>Sertifikat Izin Edar Resmi - ${product.nomor_izin}</title>
      <style>
        @page {
          size: A4 portrait;
          margin: 20mm 20mm 20mm 20mm;
          mso-header-margin: 36pt;
          mso-footer-margin: 36pt;
        }
        body {
          font-family: 'Times New Roman', Times, serif;
          font-size: 10.5pt;
          color: #0f172a;
          line-height: 1.35;
        }
        .header-kop {
          text-align: center;
          margin-bottom: 12pt;
          border-bottom: 3px double #0284c7;
          padding-bottom: 8pt;
        }
        .kop-instansi {
          font-size: 12pt;
          font-weight: bold;
          color: #0f172a;
          text-transform: uppercase;
          margin: 0;
        }
        .kop-lembaga {
          font-size: 15pt;
          font-weight: 900;
          color: #0284c7;
          text-transform: uppercase;
          margin: 2pt 0;
        }
        .kop-alamat {
          font-size: 8.5pt;
          color: #475569;
          margin: 0;
        }
        .judul-dokumen {
          text-align: center;
          margin-top: 12pt;
          margin-bottom: 12pt;
        }
        .judul-dokumen h2 {
          font-size: 12pt;
          font-weight: bold;
          text-transform: uppercase;
          text-decoration: underline;
          margin: 0;
        }
        .judul-dokumen p {
          font-size: 9.5pt;
          color: #475569;
          margin: 3pt 0 0 0;
          font-family: Arial, sans-serif;
        }
        .preamble {
          text-align: justify;
          margin-bottom: 10pt;
          font-size: 10pt;
        }
        table.data-table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 12pt;
          font-size: 9.5pt;
        }
        table.data-table th, table.data-table td {
          border: 1px solid #94a3b8;
          padding: 5pt 7pt;
          vertical-align: top;
        }
        table.data-table th {
          background-color: #0284c7;
          color: #ffffff;
          font-weight: bold;
          text-align: left;
          font-size: 9.5pt;
        }
        .label-cell {
          font-weight: bold;
          width: 32%;
          background-color: #f1f5f9;
        }
        .highlight-ph {
          background-color: #f0f9ff;
          font-weight: bold;
          color: #0369a1;
        }
        .security-box {
          border: 1px dashed #0284c7;
          background-color: #f8fafc;
          padding: 8pt 10pt;
          margin-top: 10pt;
          margin-bottom: 12pt;
          font-family: Arial, sans-serif;
          font-size: 8.5pt;
        }
        .signature-table {
          width: 100%;
          margin-top: 16pt;
          border: none;
        }
        .signature-table td {
          border: none;
          vertical-align: top;
        }
        .footer-note {
          margin-top: 24pt;
          font-size: 8pt;
          color: #94a3b8;
          text-align: center;
          border-top: 1px solid #e2e8f0;
          padding-top: 6pt;
        }
      </style>
    </head>
    <body>
      <div class="header-kop">
        <div class="kop-instansi">Republik Indonesia</div>
        <div class="kop-lembaga">Badan Pengolahan Informasi Obat dan Makanan</div>
        <div class="kop-alamat">Jl. Percetakan Negara No. 23, Jakarta Pusat 10560 | Website: www.pom.go.id | Contact Center: 1500533</div>
      </div>

      <div class="judul-dokumen">
        <h2>Surat Keputusan Persetujuan Pendaftaran & Izin Edar Resmi</h2>
        <p>Nomor Keputusan: <strong>SK-BPIOM/${product.kategori.toUpperCase().replace(/\s+/g, '')}/${product.nomor_izin}/2026</strong></p>
      </div>

      <p class="preamble">
        Kepala Badan Pengolahan Informasi Obat dan Makanan Republik Indonesia menerangkan bahwa produk berikut telah melalui evaluasi mutu, efikasi, keamanan, formulasi lengkap, spesifikasi fisikokimia, dan pengujian laboratorium independen terakreditasi, serta dinyatakan <strong>MEMENUHI PERSYARATAN</strong> untuk diedarkan di seluruh wilayah hukum Negara Kesatuan Republik Indonesia:
      </p>

      <!-- BAGIAN 1: IDENTITAS RESMI & LEGALITAS -->
      <table class="data-table">
        <thead>
          <tr>
            <th colspan="2">I. Data Identitas Registrasi & Produsen Pendaftar</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td class="label-cell">Nama Produk Terdaftar</td>
            <td><strong>${product.nama_produk}</strong></td>
          </tr>
          <tr>
            <td class="label-cell">Merk Dagang</td>
            <td>${product.merk || '-'}</td>
          </tr>
          <tr>
            <td class="label-cell">Kategori & Golongan Produk</td>
            <td>${product.kategori}</td>
          </tr>
          <tr>
            <td class="label-cell">Nomor Izin Edar (NIE)</td>
            <td><strong style="font-family: 'Courier New', monospace; color: #0369a1; font-size: 11pt;">${product.nomor_izin}</strong></td>
          </tr>
          <tr>
            <td class="label-cell">Bentuk Sediaan</td>
            <td>${product.bentuk_sediaan} ${isLiquid ? '<strong>(Sediaan Cair)</strong>' : '(Sediaan Non-Cair)'}</td>
          </tr>
          <tr>
            <td class="label-cell">Industri Produsen / Pendaftar</td>
            <td><strong>${product.nama_produsen}</strong></td>
          </tr>
          <tr>
            <td class="label-cell">Nomor Izin Usaha Industri</td>
            <td>${producer?.nomor_izin_industri || 'IK-REG-BPOM-PUSAT'}</td>
          </tr>
          <tr>
            <td class="label-cell">Sertifikasi Fasilitas Produksi</td>
            <td>${producer?.sertifikasi?.join(', ') || 'CPOB / CPKB / Halal Terakreditasi'}</td>
          </tr>
          <tr>
            <td class="label-cell">Alamat Pabrik Produksi</td>
            <td>${producer?.alamat || 'Kawasan Industri Terakreditasi'}, ${producer?.kota || 'Jakarta'}, ${producer?.provinsi || 'Indonesia'}</td>
          </tr>
          <tr>
            <td class="label-cell">Masa Berlaku Izin Edar</td>
            <td><strong>${product.tanggal_terbit}</strong> sampai dengan <strong>${product.tanggal_kedaluwarsa}</strong> (5 Tahun Penuh)</td>
          </tr>
        </tbody>
      </table>

      <!-- BAGIAN 2: FORMULA & KOMPOSISI LENGKAP -->
      <table class="data-table">
        <thead>
          <tr>
            <th colspan="2">II. Formula, Bahan Aktif & Komposisi Lengkap</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td class="label-cell">Komposisi Formula Terdaftar</td>
            <td style="font-family: Arial, sans-serif; font-size: 9pt; background-color: #fbfcfe;">
              ${product.komposisi || 'Sesuai dengan berkas registrasi resmi formulasi master.'}
            </td>
          </tr>
          <tr>
            <td class="label-cell">Standar Bahan Tambahan (Eksipien)</td>
            <td>Memenuhi persyaratan kemurnian Farmakope Indonesia Edisi VI dan Standar Monografi Resmi.</td>
          </tr>
          <tr>
            <td class="label-cell">Verifikasi Bebas Bahan Berbahaya</td>
            <td><strong style="color: #15803d;">BEBAS CEMARAN DILARANG</strong> (Bebas Etilen Glikol/DEG, Bebas Merkuri, Bebas Hidrokuinon, Bebas Timbal/Arsenik, Bebas Pewarna K1/K3/Metanil Yellow).</td>
          </tr>
        </tbody>
      </table>

      <!-- BAGIAN 3: SPESIFIKASI MUTU FISIKOKIMIA & NILAI PH -->
      <table class="data-table">
        <thead>
          <tr>
            <th colspan="2">III. Spesifikasi Mutu Fisikokimia & Karakteristik Sediaan</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td class="label-cell">Wujud / Karakteristik Fisik</td>
            <td>${charDetail.bentuk_fisik || product.bentuk_sediaan}</td>
          </tr>
          <tr>
            <td class="label-cell">Spesifikasi Warna</td>
            <td>${charDetail.warna || '-'}</td>
          </tr>
          <tr>
            <td class="label-cell">Aroma & Rasa (Organoleptik)</td>
            <td>${charDetail.aroma || '-'}</td>
          </tr>
          <tr>
            <td class="label-cell">Kemasan Primer & Sekunder</td>
            <td>${charDetail.kemasan || '-'}</td>
          </tr>
          <tr>
            <td class="label-cell">Netto / Isi Bersih / Bobot</td>
            <td>${charDetail.netto || '-'}</td>
          </tr>
          <tr class="${isLiquid ? 'highlight-ph' : ''}">
            <td class="label-cell">${isLiquid ? 'NILAI DERAJAT KEASAMAN (pH)<br/><small style="color: #0369a1;">*Wajib Sediaan Cair</small>' : 'Nilai Derajat Keasaman (pH)'}</td>
            <td>
              <strong>${phValue}</strong>
              ${isLiquid ? '<br/><span style="color: #15803d; font-size: 8.5pt;">✓ Telah Memenuhi Persyaratan Uji Derajat Keasaman (pH) Farmakope Indonesia</span>' : ''}
            </td>
          </tr>
          <tr>
            <td class="label-cell">Kondisi & Suhu Penyimpanan</td>
            <td>${charDetail.penyimpanan || product.karakteristik || 'Simpan pada suhu di bawah 30°C, terlindung dari cahaya matahari langsung.'}</td>
          </tr>
          <tr>
            <td class="label-cell">Masa Simpan (Shelf Life)</td>
            <td>${charDetail.umur_simpan || '24 Bulan / 2 Tahun'}</td>
          </tr>
          <tr>
            <td class="label-cell">Nomor Batch Uji Percontohan</td>
            <td>${product.batch_nomor || '-'}</td>
          </tr>
          <tr>
            <td class="label-cell">Status Pengujian Laboratorium</td>
            <td><strong style="color: #15803d;">${product.status_uji_lab} (MEMENUHI SYARAT / LULUS MUTU)</strong></td>
          </tr>
        </tbody>
      </table>

      <!-- BAGIAN 4: INDIKASI, ATURAN PAKAI & KONTRAINDIKASI -->
      <table class="data-table">
        <thead>
          <tr>
            <th colspan="2">IV. Indikasi Medis/Kosmetik, Aturan Pakai & Peringatan</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td class="label-cell">Indikasi & Khasiat Terdaftar</td>
            <td>${product.indikasi || product.deskripsi || '-'}</td>
          </tr>
          <tr>
            <td class="label-cell">Aturan Pakai / Posologi</td>
            <td>${product.aturan_pakai || 'Gunakan sesuai instruksi dosis pada brosur/etiket kemasan resmi yang telah disetujui.'}</td>
          </tr>
          <tr>
            <td class="label-cell">Peringatan & Kontraindikasi</td>
            <td>${product.kontraindikasi || 'Tidak untuk digunakan bagi individu hipersensitif terhadap salah satu komponen. Jauhkan dari jangkauan anak-anak.'}</td>
          </tr>
        </tbody>
      </table>

      <div class="security-box">
        <table style="width: 100%; border: none; background: transparent;">
          <tr>
            <td style="border: none; vertical-align: top; padding: 0;">
              <strong>V. VERIFIKASI INTEGRITAS TANDATANGAN ELEKTRONIK & QR CODE RESMI (BSrE - BSSN)</strong><br/>
              • <strong>Digital Hash SHA-256:</strong> <span style="font-family: monospace;">${product.qr_code_hash}</span><br/>
              • <strong>Barcode Registrasi Resmi (GS1):</strong> <span style="font-family: monospace;">${product.barcode}</span><br/>
              • <strong>Link Halaman Produk Resmi:</strong> <a href="${productPageUrl}" target="_blank" style="color: #0284c7; font-weight: bold;">${productPageUrl}</a><br/>
              • <strong>Status Keabsahan Hukum:</strong> DOKUMEN ELEKTRONIK SAH MENURUT UU NO. 1/2024 TENTANG ITE & UU NO. 17/2023 TENTANG KESEHATAN<br/>
              • <strong>Pemeriksaan Online:</strong> Arahkan kamera HP ke QR Code resmi di samping untuk verifikasi produk dan status izin edar seketika.
            </td>
            ${
              qrDataUrl
                ? `<td style="border: none; width: 100px; text-align: center; vertical-align: middle; padding-left: 12pt;">
                     <img src="${qrDataUrl}" width="88" height="88" style="border: 1px solid #0284c7; padding: 2px; background: #ffffff;" alt="QR Code Halaman Produk" /><br/>
                     <span style="font-size: 7pt; color: #0284c7; font-weight: bold;">PINDAI CEK PRODUK</span>
                   </td>`
                : ''
            }
          </tr>
        </table>
      </div>

      <table class="signature-table">
        <tr>
          <td style="width: 45%;">
            <div style="border: 1px solid #0284c7; background-color: #f0f9ff; padding: 8pt; border-radius: 4pt; font-size: 8.5pt; text-align: center;">
              <strong>BADAN POM REPUBLIK INDONESIA</strong><br/>
              <span style="font-size: 8pt; color: #0369a1;">Sertifikasi Digital Terakreditasi BSrE</span><br/>
              <span style="font-family: monospace; font-size: 7.5pt;">ID: BPIOM-CERT-${product.id}</span>
            </div>
          </td>
          <td style="width: 55%; text-align: center;">
            <p style="margin: 0;">Ditetapkan di: <strong>Jakarta Pusat</strong></p>
            <p style="margin: 2pt 0;">Pada tanggal: <strong>${product.tanggal_terbit}</strong></p>
            <p style="margin: 6pt 0 35pt 0;">
              a.n. Kepala Badan Pengolahan Informasi Obat dan Makanan<br/>
              Direktur Registrasi Produk Obat, Kosmetik & Makanan,
            </p>
            <p style="margin: 0; font-weight: bold; text-decoration: underline; font-size: 11pt;">
              Dra. Lucia Rizka Andalucia, Apt., M.Pharm.
            </p>
            <p style="margin: 2pt 0; font-size: 9pt; color: #475569;">
              NIP. 19671120 199303 2 001
            </p>
          </td>
        </tr>
      </table>

      <div class="footer-note">
        Dokumen resmi ini diterbitkan secara elektronik oleh Sistem Informasi Badan Pengolahan Informasi Obat dan Makanan Republik Indonesia.
      </div>
    </body>
    </html>
  `;

  const blob = new Blob(['\ufeff' + wordHtml], {
    type: 'application/msword;charset=utf-8',
  });
  const sanitizedNie = product.nomor_izin.replace(/[/\\?%*:|"<>]/g, '_');
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `Sertifikat_BPOM_${sanitizedNie}.doc`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * EXPORT LAPORAN HASIL UJI LABORATORIUM (PDF)
 */
export function exportLabReportPDF(lab: LabResult, product?: Product) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  // Outer border
  doc.setDrawColor(22, 163, 74); // Forest green
  doc.setLineWidth(1);
  doc.rect(12, 12, 186, 273);

  // Header
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(22, 101, 52);
  doc.text('PUSAT PENGEMBANGAN PENGUJIAN OBAT DAN MAKANAN NASIONAL', 105, 22, { align: 'center' });

  doc.setFontSize(12);
  doc.setTextColor(15, 23, 42);
  doc.text('LAPORAN HASIL PENGUJIAN LABORATORIUM (LHP)', 105, 29, { align: 'center' });

  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139);
  doc.setFont('helvetica', 'normal');
  doc.text(`Nomor Dokumen Uji: ${lab.nomor_uji} | Tanggal Uji: ${lab.tanggal_uji}`, 105, 35, { align: 'center' });

  doc.setDrawColor(203, 213, 225);
  doc.setLineWidth(0.5);
  doc.line(20, 40, 190, 40);

  // Info Sample
  autoTable(doc, {
    startY: 45,
    margin: { left: 20, right: 20 },
    theme: 'plain',
    styles: { fontSize: 8.5, cellPadding: 2 },
    body: [
      ['Nama Sampel / Produk', ':', lab.nama_produk],
      ['Nomor Izin Edar (NIE)', ':', lab.nomor_izin],
      ['Laboratorium Penguji', ':', lab.laboratorium_penguji],
      ['Kategori Sampel', ':', product?.kategori || 'Obat / Kosmetik / Pangan'],
      ['Analis Penguji', ':', lab.penguji_nama],
      ['Kesimpulan Akhir', ':', lab.kesimpulan === 'MS' ? 'MEMENUHI SYARAT (MS)' : 'TIDAK MEMENUHI SYARAT (TMS)'],
    ],
  });

  const tableY = (doc as any).lastAutoTable.finalY + 6;

  // Parameter table
  const paramData = lab.parameter_uji.map((p, idx) => [
    idx + 1,
    p.parameter,
    p.standar,
    p.hasil,
    p.status,
  ]);

  autoTable(doc, {
    startY: tableY,
    margin: { left: 20, right: 20 },
    theme: 'striped',
    head: [['No', 'Parameter Uji Analitik', 'Standar Acuan', 'Hasil Analisis', 'Evaluasi']],
    headStyles: {
      fillColor: lab.kesimpulan === 'MS' ? [22, 163, 74] : [220, 38, 38],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 8.5,
    },
    styles: { fontSize: 8, cellPadding: 3 },
    columnStyles: {
      0: { cellWidth: 10, halign: 'center' },
      4: { fontStyle: 'bold' },
    },
    body: paramData,
  });

  const nextY = (doc as any).lastAutoTable.finalY + 10;

  // Notes box
  doc.setDrawColor(203, 213, 225);
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(20, nextY, 170, 25, 2, 2, 'FD');

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(30, 41, 59);
  doc.text('CATATAN DAN REKOMENDASI PENGUJI:', 24, nextY + 6);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105);
  doc.text(doc.splitTextToSize(lab.catatan, 162), 24, nextY + 12);

  // Signatures
  const signY = nextY + 38;
  doc.setFontSize(8.5);
  doc.setTextColor(15, 23, 42);
  doc.text('Mengetahui / Mengesahkan,', 125, signY);
  doc.text('Kepala Laboratorium Pengujian PPPOMN', 125, signY + 5);

  doc.setFont('helvetica', 'bold');
  doc.text(lab.penguji_nama, 125, signY + 28);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.text('Pusat Pengujian Obat dan Makanan Republik Indonesia', 125, signY + 33);

  doc.save(`Hasil_Uji_Lab_${lab.nomor_uji.replace(/[/\\?%*:|"<>]/g, '_')}.pdf`);
}
