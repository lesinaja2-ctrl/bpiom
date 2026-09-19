/**
 * SCRIPT OTOMATISASI GOOGLE APPS SCRIPT (GAS)
 * Badan Pengawasan Obat Makanan - Database Sheets & Drive Integration
 * 
 * Cara Menggunakan:
 * 1. Buka https://sheets.new (buat Spreadsheet baru).
 * 2. Klik menu 'Ekstensi' (Extensions) -> 'Apps Script'.
 * 3. Hapus semua kode default, lalu Paste seluruh kode di bawah ini.
 * 4. Klik menu 'Run' -> pilih fungsi 'setupDatabaseSheets' satu kali untuk membuat seluruh sheet & data otomatis!
 * 5. Klik 'Terapkan' (Deploy) -> 'Penerapan Baru' (New Deployment).
 * 6. Pilih Jenis: 'Aplikasi Web' (Web App).
 *    - Jalankan sebagai: 'Saya' (Me).
 *    - Siapa yang memiliki akses: 'Siapa saja' (Anyone).
 * 7. Salin Web App URL dan tempel ke menu 'Pengaturan Database' di aplikasi.
 */

export const GOOGLE_APPS_SCRIPT_CODE = `/**
 * @OnlyCurrentDoc
 */

// 1. FUNGSI INISIALISASI OTOMATIS: MEMBUAT SHEET & HEADER TANPA PERLU MANUAL
function setupDatabaseSheets() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  
  const sheetsDef = [
    {
      name: "Produk",
      headers: [
        "id", "nama_produk", "nomor_izin", "kategori", "produsen_id", "nama_produsen",
        "bentuk_sediaan", "merk", "deskripsi", "karakteristik", "komposisi",
        "status_registrasi", "tanggal_terbit", "tanggal_kedaluwarsa", "qr_code_hash",
        "foto_url", "status_uji_lab", "batch_nomor", "barcode", "drive_file_url"
      ],
      color: "#0284c7"
    },
    {
      name: "Kategori",
      headers: ["id", "kode", "nama", "deskripsi", "awalan_izin", "total_produk"],
      color: "#0d9488"
    },
    {
      name: "Produsen",
      headers: [
        "id", "nama_pt", "nomor_izin_industri", "kategori_industri", "sertifikasi",
        "alamat", "kota", "provinsi", "kontak_telepon", "email", "status_audit", "tahun_berdiri"
      ],
      color: "#4f46e5"
    },
    {
      name: "UjiLaborat",
      headers: [
        "id", "product_id", "nomor_uji", "nama_produk", "nomor_izin", "tanggal_uji",
        "laboratorium_penguji", "parameter_uji_json", "kesimpulan", "penguji_nama", "catatan", "sertifikat_drive_url"
      ],
      color: "#16a34a"
    },
    {
      name: "PenarikanProduk",
      headers: [
        "id", "product_id", "nama_produk", "nomor_izin", "nomor_batch",
        "tanggal_penarikan", "bahaya_kesehatan", "tingkat_bahaya", "tindakan_rekomendasi", "status"
      ],
      color: "#dc2626"
    },
    {
      name: "PengaduanMasyarakat",
      headers: [
        "id", "ticket_number", "nama_pelapor", "kontak_pelapor", "nama_produk",
        "nomor_izin_tertera", "nomor_batch", "lokasi_pembelian", "tanggal_kejadian",
        "indikasi_bahaya", "efek_samping", "foto_bukti_url", "drive_file_id", "tanggal_lapor", "status", "tanggapan_petugas"
      ],
      color: "#ea580c"
    },
    {
      name: "Users",
      headers: [
        "id", "username", "email", "password", "role", "nama_lengkap",
        "nip_instansi", "status_aktif", "dibuat_pada", "terakhir_login"
      ],
      color: "#9333ea"
    }
  ];

  sheetsDef.forEach(def => {
    let sheet = ss.getSheetByName(def.name);
    if (!sheet) {
      sheet = ss.insertSheet(def.name);
    }
    
    // Clear and set headers
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(def.headers);
      const headerRange = sheet.getRange(1, 1, 1, def.headers.length);
      headerRange.setBackground(def.color);
      headerRange.setFontColor("#FFFFFF");
      headerRange.setFontWeight("bold");
      sheet.setFrozenRows(1);
    }
  });

  // Hapus sheet default "Sheet1" jika ada
  const defaultSheet = ss.getSheetByName("Sheet1") || ss.getSheetByName("Sheet 1");
  if (defaultSheet && ss.getSheets().length > 1) {
    try {
      ss.deleteSheet(defaultSheet);
    } catch (e) {}
  }

  Logger.log("Database BPOM Berhasil Diinisialisasi Otomatis!");
  return "Database Berhasil Dibuat!";
}

// 2. ENDPOINT API GET (READ DATA)
function doGet(e) {
  try {
    const action = e.parameter.action || "ping";
    const ss = SpreadsheetApp.getActiveSpreadsheet();

    if (action === "ping") {
      return jsonResponse({ success: true, message: "Server Google Apps Script BPOM Online!" });
    }

    if (action === "setup") {
      setupDatabaseSheets();
      return jsonResponse({ success: true, message: "Database dan seluruh tabel berhasil dibuat otomatis." });
    }

    const table = e.parameter.table;
    if (!table) {
      return jsonResponse({ error: "Parameter 'table' diperlukan" }, 400);
    }

    const sheet = ss.getSheetByName(table);
    if (!sheet) {
      return jsonResponse({ error: "Tabel tidak ditemukan: " + table }, 404);
    }

    const data = getSheetDataAsJson(sheet);
    return jsonResponse({ success: true, table: table, data: data });
  } catch (err) {
    return jsonResponse({ error: err.toString() }, 500);
  }
}

// 3. ENDPOINT API POST (CREATE, UPDATE, DELETE, DRIVE UPLOAD)
function doPost(e) {
  try {
    const contents = JSON.parse(e.postData.contents);
    const action = contents.action;
    const ss = SpreadsheetApp.getActiveSpreadsheet();

    // A. UPLOAD FILE KE GOOGLE DRIVE
    if (action === "upload_drive") {
      const folderName = "BPOM_Berkas_Upload";
      let folder;
      const folders = DriveApp.getFoldersByName(folderName);
      if (folders.hasNext()) {
        folder = folders.next();
      } else {
        folder = DriveApp.createFolder(folderName);
      }

      const decoded = Utilities.base64Decode(contents.base64Data.split(",")[1]);
      const blob = Utilities.newBlob(decoded, contents.mimeType || "application/octet-stream", contents.fileName || "dokumen_bpom.bin");
      const file = folder.createFile(blob);
      file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);

      return jsonResponse({
        success: true,
        fileId: file.getId(),
        fileUrl: file.getUrl(),
        downloadUrl: file.getDownloadUrl(),
        fileName: file.getName()
      });
    }

    // B. CRUD TABEL SPREADSHEET
    const table = contents.table;
    const sheet = ss.getSheetByName(table);
    if (!sheet) {
      return jsonResponse({ error: "Sheet " + table + " tidak ditemukan" }, 404);
    }

    const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];

    // B1. INSERT DATA BARU
    if (action === "insert") {
      const rowData = headers.map(h => {
        let val = contents.data[h];
        if (typeof val === "object") return JSON.stringify(val);
        return val !== undefined ? val : "";
      });
      sheet.appendRow(rowData);
      return jsonResponse({ success: true, message: "Data berhasil ditambahkan ke " + table });
    }

    // B2. UPDATE DATA BY ID
    if (action === "update") {
      const id = contents.id;
      const dataRows = sheet.getDataRange().getValues();
      const idColIdx = headers.indexOf("id");
      if (idColIdx === -1) return jsonResponse({ error: "Kolom ID tidak ada" }, 400);

      let foundRow = -1;
      for (let i = 1; i < dataRows.length; i++) {
        if (dataRows[i][idColIdx] == id) {
          foundRow = i + 1;
          break;
        }
      }

      if (foundRow === -1) return jsonResponse({ error: "Data ID tidak ditemukan" }, 404);

      headers.forEach((h, cIdx) => {
        if (contents.data[h] !== undefined) {
          let val = contents.data[h];
          if (typeof val === "object") val = JSON.stringify(val);
          sheet.getRange(foundRow, cIdx + 1).setValue(val);
        }
      });
      return jsonResponse({ success: true, message: "Data berhasil diperbarui di " + table });
    }

    // B3. DELETE DATA BY ID
    if (action === "delete") {
      const id = contents.id;
      const dataRows = sheet.getDataRange().getValues();
      const idColIdx = headers.indexOf("id");

      let foundRow = -1;
      for (let i = 1; i < dataRows.length; i++) {
        if (dataRows[i][idColIdx] == id) {
          foundRow = i + 1;
          break;
        }
      }

      if (foundRow === -1) return jsonResponse({ error: "Data ID tidak ditemukan" }, 404);
      sheet.deleteRow(foundRow);
      return jsonResponse({ success: true, message: "Data berhasil dihapus dari " + table });
    }

    return jsonResponse({ error: "Aksi tidak dikenal: " + action }, 400);
  } catch (err) {
    return jsonResponse({ error: err.toString() }, 500);
  }
}

// HELPER: Format Data Sheet ke JSON
function getSheetDataAsJson(sheet) {
  const lastRow = sheet.getLastRow();
  const lastCol = sheet.getLastColumn();
  if (lastRow <= 1) return [];

  const headers = sheet.getRange(1, 1, 1, lastCol).getValues()[0];
  const rows = sheet.getRange(2, 1, lastRow - 1, lastCol).getValues();

  return rows.map(row => {
    let obj = {};
    headers.forEach((header, index) => {
      let val = row[index];
      // Auto parse JSON jika string berawalan [ atau {
      if (typeof val === "string" && (val.startsWith("[") || val.startsWith("{"))) {
        try { val = JSON.parse(val); } catch (e) {}
      }
      obj[header] = val;
    });
    return obj;
  });
}

// HELPER: Response Format JSON
function jsonResponse(data, code) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
`;
