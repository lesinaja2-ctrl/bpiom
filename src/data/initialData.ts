import { Product, Category, Producer, LabResult, RecallAlert, HazardousSubstance, Report, User, WebsiteSettings, CustomPage } from '../types';

export const INITIAL_CATEGORIES: Category[] = [
  {
    id: 'cat-1',
    kode: 'OBAT',
    nama: 'Obat',
    deskripsi: 'Obat Keras (DKL), Obat Bebas Terbatas (DTL), dan Obat Bebas (DBL) berizin edar resmi.',
    awalan_izin: ['DKL', 'DTL', 'DBL', 'GKL', 'GTL'],
    total_produk: 24,
  },
  {
    id: 'cat-2',
    kode: 'KOSMETIK',
    nama: 'Kosmetik',
    deskripsi: 'Produk perawatan kulit, tubuh, rambut, riasan wajah yang telah ternotifikasi BPOM.',
    awalan_izin: ['NA', 'NB', 'NC', 'ND', 'NE'],
    total_produk: 38,
  },
  {
    id: 'cat-3',
    kode: 'PANGAN',
    nama: 'Makanan & Minuman',
    deskripsi: 'Produk pangan olahan industri skala menengah ke atas (MD) dan pangan impor (ML).',
    awalan_izin: ['MD', 'ML', 'P-IRT'],
    total_produk: 52,
  },
  {
    id: 'cat-4',
    kode: 'JAMU',
    nama: 'Obat Tradisional',
    deskripsi: 'Jamu, Obat Herbal Terstandar (OHT), dan Fitofarmaka berbahan alami terverifikasi.',
    awalan_izin: ['TR', 'TI', 'TL', 'FF'],
    total_produk: 19,
  },
  {
    id: 'cat-5',
    kode: 'SUPLEMEN',
    nama: 'Suplemen Kesehatan',
    deskripsi: 'Produk suplemen vitamin, mineral, asam amino, dan nutrisi pelengkap harian.',
    awalan_izin: ['SD', 'SI', 'SL'],
    total_produk: 15,
  },
];

export const INITIAL_PRODUCERS: Producer[] = [
  {
    id: 'prod-1',
    nama_pt: 'PT Kimia Nusantara Farma Tbk',
    nomor_izin_industri: 'IK-FARMA-2018-0912',
    kategori_industri: 'Industri Farmasi',
    sertifikasi: ['CPOB', 'Halal BPJPH', 'ISO 9001:2015', 'ISO 14001'],
    alamat: 'Jl. Veteran Industri No. 45, Kawasan Industri Pulogadung',
    kota: 'Jakarta Timur',
    provinsi: 'DKI Jakarta',
    kontak_telepon: '(021) 460-2211',
    email: 'regulatory@kimianusa.co.id',
    status_audit: 'Terverifikasi',
    tahun_berdiri: 1971,
  },
  {
    id: 'prod-2',
    nama_pt: 'PT Paragon Botanika Kosmetika',
    nomor_izin_industri: 'IK-KOSM-2020-0441',
    kategori_industri: 'Industri Kosmetika Golongan A',
    sertifikasi: ['CPKB', 'Halal BPJPH', 'GMP ASEAN', 'ISO 22716'],
    alamat: 'Jl. Industri Manis Raya III No. 8',
    kota: 'Tangerang',
    provinsi: 'Banten',
    kontak_telepon: '(021) 591-8833',
    email: 'compliance@paragonbotanika.com',
    status_audit: 'Terverifikasi',
    tahun_berdiri: 1985,
  },
  {
    id: 'prod-3',
    nama_pt: 'PT Indofood Segar Perkasa Makmur',
    nomor_izin_industri: 'IK-PANGAN-2019-1029',
    kategori_industri: 'Industri Makanan & Minuman',
    sertifikasi: ['CPPOB', 'HACCP', 'FSSC 22000', 'Halal BPJPH'],
    alamat: 'Jl. Raya Cikarang-Cibarusah Km 42',
    kota: 'Bekasi',
    provinsi: 'Jawa Barat',
    kontak_telepon: '(021) 897-4001',
    email: 'qa@indofoodsegar.co.id',
    status_audit: 'Terverifikasi',
    tahun_berdiri: 1990,
  },
  {
    id: 'prod-4',
    nama_pt: 'PT Sido Alami Herbalindo',
    nomor_izin_industri: 'IK-IOT-2021-0177',
    kategori_industri: 'Industri Obat Tradisional (IOT)',
    sertifikasi: ['CPOTB', 'Halal BPJPH', 'ISO 22000'],
    alamat: 'Jl. Soekarno Hatta Km 28, Bergas',
    kota: 'Semarang',
    provinsi: 'Jawa Tengah',
    kontak_telepon: '(024) 658-0022',
    email: 'regulasi@sidoalami.co.id',
    status_audit: 'Terverifikasi',
    tahun_berdiri: 1951,
  },
  {
    id: 'prod-5',
    nama_pt: 'PT Mahkota Cantik Jelita (Ilegal/Cabut Izin)',
    nomor_izin_industri: 'IK-KOSM-2019-BEKU',
    kategori_industri: 'Industri Kosmetika',
    sertifikasi: ['Dalam Evaluasi Pelanggaran'],
    alamat: 'Komplek Ruko Pergudangan Kapuk Kamal No. 12',
    kota: 'Jakarta Utara',
    provinsi: 'DKI Jakarta',
    kontak_telepon: '(021) 555-9011',
    email: 'info@mahkotacantik.fake',
    status_audit: 'Dibekukan',
    tahun_berdiri: 2019,
  },
];

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'prod-p-1',
    nama_produk: 'Parasetamol 500mg Kaplet',
    nomor_izin: 'DKL1904523104A1',
    kategori: 'Obat',
    produsen_id: 'prod-1',
    nama_produsen: 'PT Kimia Nusantara Farma Tbk',
    bentuk_sediaan: 'Kaplet',
    merk: 'Kimiapar',
    deskripsi: 'Obat penurun demam dan pereda nyeri ringan hingga sedang seperti sakit kepala dan sakit gigi.',
    karakteristik: 'Karakteristik: Kaplet salut selaput; Warna: Putih bersih; Kemasan: Dus, 10 strip @ 10 kaplet; Netto: 500 mg per kaplet; Aroma: Tidak berbau; Penyimpanan: Simpan pada suhu di bawah 30°C terlindung dari cahaya; Masa Simpan: 36 Bulan',
    karakteristik_detail: {
      bentuk_fisik: 'Kaplet salut selaput seragam',
      warna: 'Putih bersih tidak berbercak',
      kemasan: 'Dus karton, 10 strip blister @ 10 kaplet',
      netto: '500 mg per kaplet (Bobot rata-rata 650 mg)',
      aroma: 'Khas farmasi, tidak berbau tajam',
      penyimpanan: 'Simpan pada suhu di bawah 30°C di tempat kering terlindung dari cahaya',
      umur_simpan: '36 Bulan (3 Tahun)',
      nilai_ph: 'Tidak dipersyaratkan (Sediaan Padat)',
    },
    komposisi: 'Tiap kaplet mengandung:\n- Paracetamol mikronis 500 mg\n- Microcrystalline Cellulose (Avicel PH 102) 80 mg\n- Povidone K30 (Pengikat) 25 mg\n- Magnesium Stearate (Lubrikan) 5 mg\n- Opadry White Film Coating 12 mg',
    indikasi: 'Meringankan rasa sakit pada keadaan sakit kepala, sakit gigi, dan menurunkan demam.',
    aturan_pakai: 'Dewasa: 1-2 kaplet, 3-4 kali sehari (maksimal 8 kaplet dalam 24 jam).\nAnak 6-12 tahun: 1/2-1 kaplet, 3-4 kali sehari atau sesuai petunjuk dokter.',
    kontraindikasi: 'Penderita dengan gangguan fungsi hati berat, hipersensitif terhadap parasetamol.',
    penanggung_jawab: 'apt. Hendra Setiawan, S.Farm (STRA: 19820514/STRA-KNF/2012)',
    status_registrasi: 'Aktif',
    tanggal_terbit: '2023-01-15',
    tanggal_kedaluwarsa: '2028-01-15',
    qr_code_hash: 'BPOM-SIG-DKL1904523104A1-2028-VERIFIED',
    foto_url: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=600&auto=format&fit=crop&q=80',
    status_uji_lab: 'Lulus',
    batch_nomor: 'BN-KNF-2026-04A',
    barcode: '8991234567011',
    drive_file_url: 'https://drive.google.com/file/d/10A1ParacetamolCertificate/view',
  },
  {
    id: 'prod-p-2',
    nama_produk: 'Cica Barrier Calming Facial Serum 30ml',
    nomor_izin: 'NA18230104921',
    kategori: 'Kosmetik',
    produsen_id: 'prod-2',
    nama_produsen: 'PT Paragon Botanika Kosmetika',
    bentuk_sediaan: 'Serum Cair',
    merk: 'Botanika Pure',
    deskripsi: 'Serum perawatan wajah yang menenangkan kulit kemerahan, merawat barrier kulit, dan melembapkan secara intensif.',
    karakteristik: 'Karakteristik: Cairan serum kental transparan; Warna: Hijau pupus jernih transparan; Kemasan: Botol kaca amber pipet 30 ml; Netto: 30 ml / 1.01 fl oz; Nilai pH: pH 5.50 (Rentang 5.2 - 5.8); Aroma: Herbal Centella alami segar lembut; Penyimpanan: Simpan di tempat sejuk dan kering (15-25°C) terhindar dari panas; Masa Simpan: 24 Bulan',
    karakteristik_detail: {
      bentuk_fisik: 'Cairan serum kental homogen transparan',
      warna: 'Hijau pupus bening transparan',
      kemasan: 'Botol kaca amber dengan pipet aplikator higienis 30 ml',
      netto: '30 ml / 1.01 fl oz',
      aroma: 'Herbal Centella segar tanpa aroma parfum sintetis menyengat',
      penyimpanan: 'Suhu sejuk 15-25°C, terhindar dari paparan sinar matahari langsung',
      umur_simpan: '24 Bulan (PAO 6 Bulan setelah dibuka)',
      nilai_ph: 'pH 5.50 (Rentang aman kulit 5.2 - 5.8)',
    },
    komposisi: 'Aqua, Centella Asiatica Leaf Extract 10%, Niacinamide 4%, Sodium Hyaluronate (Multi-molecular), Panthenol (Pro-Vitamin B5) 2%, Ceramide NP 0.5%, Glycerin, Allantoin, Phenoxyethanol, Ethylhexylglycerin.',
    indikasi: 'Menenangkan kulit sensitif teriritasi ringan, merawat dan memperkuat lapisan sawar kelembapan kulit (skin barrier), serta menghidrasi kulit.',
    aturan_pakai: 'Teteskan 2-3 tetes pada wajah yang telah dibersihkan. Ratakan secara lembut dengan ujung jari hingga meresap sempurna. Gunakan pagi dan malam hari.',
    kontraindikasi: 'Hipersensitivitas terhadap salah satu komponen formula. Hentikan pemakaian jika terjadi reaksi alergi kemerahan atau gatal berlebih.',
    penanggung_jawab: 'apt. Rina Marlina, S.Farm (STRA: 19890422/STRA-PBK/2016)',
    status_registrasi: 'Aktif',
    tanggal_terbit: '2023-08-10',
    tanggal_kedaluwarsa: '2026-08-10',
    qr_code_hash: 'BPOM-SIG-NA18230104921-2026-VERIFIED',
    foto_url: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=600&auto=format&fit=crop&q=80',
    status_uji_lab: 'Lulus',
    batch_nomor: 'BN-PBK-8819A',
    barcode: '8992345678022',
    drive_file_url: 'https://drive.google.com/file/d/10B2SerumCicaNotif/view',
  },
  {
    id: 'prod-p-3',
    nama_produk: 'Susu UHT Full Cream Rasa Cokelat 250ml',
    nomor_izin: 'MD200910001045',
    kategori: 'Makanan & Minuman',
    produsen_id: 'prod-3',
    nama_produsen: 'PT Indofood Segar Perkasa Makmur',
    bentuk_sediaan: 'Cairan Steril UHT',
    merk: 'SegarFresh',
    deskripsi: 'Minuman susu cair segar proses UHT dengan padatan kakao asli, sumber kalsium, fosfor, dan vitamin D.',
    karakteristik: 'Karakteristik: Cairan emulsi steril cokelat homogen; Warna: Cokelat tua kakao khas; Kemasan: Kotak aseptik Tetra Pak 250 ml; Netto: 250 ml; Nilai pH: pH 6.65 (Rentang 6.5 - 6.8); Aroma: Manis cokelat khas susu segar; Penyimpanan: Simpan pada suhu ruang, setelah dibuka simpan di lemari pendingin (4°C); Masa Simpan: 10 Bulan',
    karakteristik_detail: {
      bentuk_fisik: 'Cairan emulsi homogen steril UHT',
      warna: 'Cokelat tua khas kakao alami',
      kemasan: 'Kotak karton aseptik multi-layer Tetra Pak 250 ml',
      netto: '250 ml',
      aroma: 'Khas susu sapi segar berpadu cokelat manis',
      penyimpanan: 'Suhu ruang bersih & kering. Setelah dibuka simpan di chiller (4°C) dan habiskan dalam 3 hari',
      umur_simpan: '10 Bulan',
      nilai_ph: 'pH 6.65 (Rentang stabil 6.50 - 6.80)',
    },
    komposisi: 'Susu Sapi Segar (85%), Sukrosa (6.5%), Kakao Bubuk Murni (3.5%), Penstabil Nabati (Karagenan), Perisa Sintetik Cokelat, Premiks Vitamin A, D3, B1, B2, B6, B12, Kalsium Karbonat.',
    indikasi: 'Sebagai minuman nutrisi pelengkap asupan kalsium, fosfor, dan vitamin harian keluarga.',
    aturan_pakai: 'Kocok dahulu sebelum diminum. Siap disajikan langsung atau dingin lebih nikmat.',
    kontraindikasi: 'Tidak cocok untuk penderita alergi protein susu sapi atau intoleransi laktosa berat.',
    penanggung_jawab: 'Ir. Dwi Cahyono, M.Sc (PJT Pangan Olahan Terdaftar)',
    status_registrasi: 'Aktif',
    tanggal_terbit: '2022-04-12',
    tanggal_kedaluwarsa: '2027-04-12',
    qr_code_hash: 'BPOM-SIG-MD200910001045-2027-VERIFIED',
    foto_url: 'https://images.unsplash.com/photo-1563636619-e9143da7973b?w=600&auto=format&fit=crop&q=80',
    status_uji_lab: 'Lulus',
    batch_nomor: 'BN-ISPM-402C',
    barcode: '8993456789033',
    drive_file_url: 'https://drive.google.com/file/d/10C3UhtSusuCert/view',
  },
  {
    id: 'prod-p-4',
    nama_produk: 'Madu Herbal Curcuma Pegagan 200ml',
    nomor_izin: 'TR203649181',
    kategori: 'Obat Tradisional',
    produsen_id: 'prod-4',
    nama_produsen: 'PT Sido Alami Herbalindo',
    bentuk_sediaan: 'Cairan Obat Dalam',
    merk: 'SidoFit Herbal',
    deskripsi: 'Ramuan tradisional ekstrak rimpang temulawak, madu murni, dan daun pegagan untuk membantu memelihara daya tahan tubuh.',
    karakteristik: 'Karakteristik: Cairan sirup kental homogen; Warna: Cokelat keemasan transparan; Kemasan: Botol kaca amber 200 ml dengan segel; Netto: 200 ml; Nilai pH: pH 4.20 (Rentang madu alami 3.8 - 4.5); Aroma: Manis madu berpadu hangat temulawak; Penyimpanan: Simpan di tempat kering pada suhu kamar (<30°C) terhindar dari sinar matahari; Masa Simpan: 24 Bulan',
    karakteristik_detail: {
      bentuk_fisik: 'Cairan kental sirup obat dalam homogen',
      warna: 'Cokelat keemasan jernih',
      kemasan: 'Botol kaca gelap / amber 200 ml dengan tutup ulir bersegel induksi',
      netto: '200 ml',
      aroma: 'Manis madu alami berpadu aroma hangat rimpang temulawak',
      penyimpanan: 'Suhu di bawah 30°C di tempat sejuk dan kering',
      umur_simpan: '24 Bulan',
      nilai_ph: 'pH 4.20 (Standar keasaman madu obat herbal 3.8 - 4.5)',
    },
    komposisi: 'Tiap sendok makan (15 ml) mengandung:\n- Mel Depuratum (Madu Hutan Murni) 10.0 g\n- Curcuma xanthorrhiza Rhizoma Extract (Temulawak) 350 mg\n- Centella Asiatica Herba Extract (Pegagan) 180 mg\n- Zingiber officinale Rhizoma Extract (Jahe Merah) 120 mg\n- Sodium Benzoate (Pengawet standar) 0.1%',
    indikasi: 'Membantu memelihara daya tahan tubuh, memperbaiki nafsu makan, dan membantu menjaga kebugaran stamina.',
    aturan_pakai: 'Dewasa: 3 kali sehari 1 sendok makan (15 ml).\nAnak usia di atas 2 tahun: 2 kali sehari 1 sendok teh (5 ml) setelah makan.',
    kontraindikasi: 'Tidak dianjurkan untuk anak di bawah usia 1 tahun, wanita hamil dengan kontraindikasi herbal tertentu.',
    penanggung_jawab: 'apt. Dewi Puspitasari, S.Farm (STRA: 19871109/STRA-SAH/2014)',
    status_registrasi: 'Aktif',
    tanggal_terbit: '2024-02-01',
    tanggal_kedaluwarsa: '2029-02-01',
    qr_code_hash: 'BPOM-SIG-TR203649181-2029-VERIFIED',
    foto_url: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=600&auto=format&fit=crop&q=80',
    status_uji_lab: 'Lulus',
    batch_nomor: 'BN-SAH-9182',
    barcode: '8994567890044',
    drive_file_url: 'https://drive.google.com/file/d/10D4MaduHerbalLab/view',
  },
  {
    id: 'prod-p-5',
    nama_produk: 'Glow Whitening Night Cream (DITARIK - Public Warning)',
    nomor_izin: 'NA18190100777', // Dicabut
    kategori: 'Kosmetik',
    produsen_id: 'prod-5',
    nama_produsen: 'PT Mahkota Cantik Jelita (Ilegal/Cabut Izin)',
    bentuk_sediaan: 'Krim Wajah',
    merk: 'InstaGlow Princess',
    deskripsi: 'PERINGATAN RESMI: Produk ini telah dibatalkan izin edarnya karena hasil laboratorium membuktikan kandungan Merkuri (Hg) dan Hidrokuinon berbahaya.',
    karakteristik: 'Krim lengket warna kuning keabu-abuan mengkilap, berbau wangi parfum menyengat menyamarkan bau logam.',
    komposisi: 'Mercury (Merkuri) terdeteksi 480 ppm, Hydroquinone 6.2%, Stearic Acid, Cetyl Alcohol, Triethanolamine, Fragrance, Parabens.',
    status_registrasi: 'Ditarik',
    tanggal_terbit: '2019-03-01',
    tanggal_kedaluwarsa: '2024-03-01',
    qr_code_hash: 'BPOM-REVOKED-NA18190100777-HAZARDOUS',
    foto_url: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=600&auto=format&fit=crop&q=80',
    status_uji_lab: 'Tidak Memenuhi Syarat',
    batch_nomor: 'BN-MCJ-BATCH-BAHAYA',
    barcode: '8999999000123',
    drive_file_url: 'https://drive.google.com/file/d/10E5RecallWarningNotice/view',
  },
  {
    id: 'prod-p-6',
    nama_produk: 'Vitamin C 1000mg + Zinc Effervescent 10 Tablet',
    nomor_izin: 'SD211518291',
    kategori: 'Suplemen Kesehatan',
    produsen_id: 'prod-1',
    nama_produsen: 'PT Kimia Nusantara Farma Tbk',
    bentuk_sediaan: 'Tablet Effervescent',
    merk: 'VitaliC Max',
    deskripsi: 'Suplemen tablet larut air rasa jeruk segar untuk membantu memelihara daya tahan tubuh dan mempercepat pemulihan.',
    karakteristik: 'Tablet bulat diameter 25mm, warna jingga berbintik putih, larut dalam air dengan buih karbonasi cepat.',
    komposisi: 'Ascorbic Acid (Vitamin C) 1000 mg, Zinc Picolinate 10 mg, Vitamin D3 400 IU, Asam Sitrat, Natrium Bikarbonat, Sukralosa, Perisa Alami Jeruk.',
    status_registrasi: 'Aktif',
    tanggal_terbit: '2023-11-19',
    tanggal_kedaluwarsa: '2028-11-19',
    qr_code_hash: 'BPOM-SIG-SD211518291-2028-VERIFIED',
    foto_url: 'https://images.unsplash.com/photo-1550572017-edd951aa8f72?w=600&auto=format&fit=crop&q=80',
    status_uji_lab: 'Lulus',
    batch_nomor: 'BN-KNF-VTC-2026',
    barcode: '8995678901055',
    drive_file_url: 'https://drive.google.com/file/d/10F6VitCSuplemen/view',
  },
];

export const INITIAL_LAB_RESULTS: LabResult[] = [
  {
    id: 'lab-1',
    product_id: 'prod-p-1',
    nomor_uji: 'LAB-BPOM/JAK/2026/0142',
    nama_produk: 'Parasetamol 500mg Kaplet',
    nomor_izin: 'DKL1904523104A1',
    tanggal_uji: '2026-03-02',
    laboratorium_penguji: 'Pusat Pengembangan Pengujian Obat dan Makanan Nasional (PPPOMN)',
    parameter_uji: [
      { parameter: 'Identifikasi Spektrofotometri IR', standar: 'Sesuai Baku Pembanding Parasetamol BPFI', hasil: 'Identik / Positif', status: 'Memenuhi Syarat' },
      { parameter: 'Kadar Parasetamol (KCKT)', standar: '95.0% - 105.0%', hasil: '100.4%', status: 'Memenuhi Syarat' },
      { parameter: 'Uji Disolusi (Tahap S1)', standar: 'Q >= 80% dalam 30 menit', hasil: 'Q = 94.2%', status: 'Memenuhi Syarat' },
      { parameter: 'Cemaran Dietilen Glikol (DEG) & Etilen Glikol (EG)', standar: 'Tidak Terdeteksi (< 0.1 mg/g)', hasil: 'Negatif / Tidak Terdeteksi', status: 'Memenuhi Syarat' },
      { parameter: 'Cemaran Timbal (Pb)', standar: '<= 0.5 ppm', hasil: '< 0.02 ppm', status: 'Memenuhi Syarat' },
    ],
    kesimpulan: 'MS',
    penguji_nama: 'Dra. Sri Wahyuni, Apt., M.Si.',
    catatan: 'Sampel memenuhi seluruh baku persyaratan Farmakope Indonesia Edisi VI.',
    sertifikat_drive_url: 'https://drive.google.com/file/d/1LabParacetamolCert/view',
  },
  {
    id: 'lab-2',
    product_id: 'prod-p-2',
    nomor_uji: 'LAB-BPOM/KOSM/2026/0398',
    nama_produk: 'Cica Barrier Calming Facial Serum 30ml',
    nomor_izin: 'NA18230104921',
    tanggal_uji: '2026-02-14',
    laboratorium_penguji: 'Balai Besar Pengawas Obat dan Makanan (BBPOM) Serang',
    parameter_uji: [
      { parameter: 'Uji Logam Berat Merkuri (Hg)', standar: '<= 1 mg/kg (ppm)', hasil: '< 0.005 ppm', status: 'Memenuhi Syarat' },
      { parameter: 'Uji Logam Berat Timbal (Pb)', standar: '<= 20 mg/kg (ppm)', hasil: '0.12 ppm', status: 'Memenuhi Syarat' },
      { parameter: 'Uji Logam Berat Arsen (As)', standar: '<= 5 mg/kg (ppm)', hasil: '< 0.01 ppm', status: 'Memenuhi Syarat' },
      { parameter: 'Bahan Berbahaya Hidrokuinon (TLC-Densitometri)', standar: 'Negatif (0%)', hasil: 'Negatif', status: 'Memenuhi Syarat' },
      { parameter: 'Cemaran Mikroba (Angka Lempeng Total)', standar: '<= 1 x 10^3 koloni/g', hasil: '< 10 koloni/g', status: 'Memenuhi Syarat' },
      { parameter: 'Pseudomonas aeruginosa & Staphylococcus aureus', standar: 'Negatif / 0.1 g', hasil: 'Negatif', status: 'Memenuhi Syarat' },
    ],
    kesimpulan: 'MS',
    penguji_nama: 'Bambang Sudiro, S.Si., Apt.',
    catatan: 'Sesuai dengan Peraturan BPOM No. 12 Tahun 2020 tentang Cemaran dalam Kosmetika.',
    sertifikat_drive_url: 'https://drive.google.com/file/d/2LabSerumCicaCert/view',
  },
  {
    id: 'lab-3',
    product_id: 'prod-p-5',
    nomor_uji: 'LAB-BPOM/INVEST/2026/0019',
    nama_produk: 'Glow Whitening Night Cream (DITARIK - Public Warning)',
    nomor_izin: 'NA18190100777',
    tanggal_uji: '2026-01-20',
    laboratorium_penguji: 'Pusat Uji Investigasi Kriminal Khusus PPPOMN',
    parameter_uji: [
      { parameter: 'Cemaran Merkuri (Hg) Spektrometri Serapan Atom', standar: '<= 1 ppm', hasil: '480.5 ppm (EKSTREM BERBAHAYA)', status: 'Tidak Memenuhi Syarat' },
      { parameter: 'Identifikasi Hidrokuinon KCKT', standar: 'Negatif (0%)', hasil: 'Positif (6.2%)', status: 'Tidak Memenuhi Syarat' },
      { parameter: 'Identifikasi Asam Retinoat (Tretinoin)', standar: 'Negatif (0%)', hasil: 'Positif (0.05%)', status: 'Tidak Memenuhi Syarat' },
      { parameter: 'Cemaran Timbal (Pb)', standar: '<= 20 ppm', hasil: '35.4 ppm', status: 'Tidak Memenuhi Syarat' },
    ],
    kesimpulan: 'TMS',
    penguji_nama: 'Dr. Hendra Gunawan, M.Farm., Apt.',
    catatan: 'DITEMUKAN BAHAN DILARANG BERBAHAYA MERKURI & HIDROKUINON. Rekomendasi: Penarikan segera dari seluruh peredaran nasional dan proses pidana perlindungan konsumen.',
    sertifikat_drive_url: 'https://drive.google.com/file/d/3LabWarningRecallCert/view',
  },
];

export const INITIAL_RECALLS: RecallAlert[] = [
  {
    id: 'rec-1',
    product_id: 'prod-p-5',
    nama_produk: 'InstaGlow Princess Night Cream',
    nomor_izin: 'NA18190100777',
    nomor_batch: 'BN-MCJ-BATCH-BAHAYA',
    tanggal_penarikan: '2026-01-22',
    bahaya_kesehatan: 'Ditemukan Merkuri (480 ppm) dan Hidrokuinon (6.2%) yang dapat menyebabkan kerusakan ginjal permanen, okronosis kehitaman kulit, dan bersifat karsinogenik.',
    tingkat_bahaya: 'Tingkat I (Kritis)',
    tindakan_rekomendasi: 'Hentikan pemakaian segera! Laporkan apotek/toko kosmetik yang masih menjual ke BPOM terdekat. Produk wajib dimusnahkan di hadapan petugas.',
    status: 'Aktif',
  },
  {
    id: 'rec-2',
    product_id: 'prod-dummy-recall-2',
    nama_produk: 'Kopi Jantan Perkasa Herbal Sachet',
    nomor_izin: 'TR173200199 (Palsu/Fiktif)',
    nomor_batch: 'B-0988/KOPI/2025',
    tanggal_penarikan: '2026-02-18',
    bahaya_kesehatan: 'Tercemar Bahan Kimia Obat (BKO) Sildenafil Sitrat tanpa dosis terukur, memicu serangan jantung mendadak, hipotensi drastis, hingga kematian.',
    tingkat_bahaya: 'Tingkat I (Kritis)',
    tindakan_rekomendasi: 'Warga dilarang mengonsumsi. Distributor wajib menarik seluruh inventori di warung/marketplace dalam waktu 1x24 jam.',
    status: 'Aktif',
  },
];

export const HAZARDOUS_SUBSTANCES_DB: HazardousSubstance[] = [
  {
    nama: 'Merkuri (Mercury / Hg / Calomel)',
    alias: ['mercury', 'air raksa', 'calomel', 'mercurous chloride', 'hydrargyrum'],
    kategori_bahaya: 'Dilarang Keras',
    dampak_kesehatan: 'Mengakibatkan kerusakan sistem saraf, gangguan fungsi ginjal parah, iritasi kornea, dan kerusakan janin pada wanita hamil.',
    aturan_regulasi: 'Dilarang total dalam kosmetika sesuai Peraturan BPOM No. 17 Tahun 2022.',
  },
  {
    nama: 'Hidrokuinon (Hydroquinone)',
    alias: ['hydroquinone', '1,4-benzenediol', 'quinol', 'benzene-1,4-diol'],
    kategori_bahaya: 'Dilarang Keras',
    dampak_kesehatan: 'Menyebabkan okronosis (kulit menghitam permanen tak dapat disembuhkan), iritasi terbakar, dan risiko kanker kulit.',
    aturan_regulasi: 'Hanya boleh dengan resep dokter pada obat keras, dilarang mutlak dalam kosmetik bebas.',
  },
  {
    nama: 'Asam Retinoat / Tretinoin',
    alias: ['retinoic acid', 'tretinoin', 'all-trans-retinoic acid', 'vitamin a acid'],
    kategori_bahaya: 'Batasan Ketat',
    dampak_kesehatan: 'Dapat menimbulkan cacat janin (teratogenik), kulit terkelupas parah, photosensitivity tinggi, dan iritasi akut.',
    aturan_regulasi: 'Kategori Obat Keras, tidak diizinkan dalam kosmetika OTC bebas.',
  },
  {
    nama: 'Kortikosteroid (Dexamethasone / Hydrocortisone)',
    alias: ['dexamethasone', 'betamethasone', 'triamcinolone', 'hydrocortisone', 'clobetasol'],
    kategori_bahaya: 'Dilarang Keras',
    dampak_kesehatan: 'Menyebabkan atrofi kulit (penipisan), munculnya stretch marks permanen, moon face, dan supresi kelenjar adrenal.',
    aturan_regulasi: 'Dilarang dicampurkan ke dalam kosmetika krim malam maupun jamu pegal linu.',
  },
  {
    nama: 'Rhodamin B (Pewarna Merah K10)',
    alias: ['rhodamine b', 'basic violet 10', 'ci 45170', 'pewarna tekstil merah'],
    kategori_bahaya: 'Karsinogenik',
    dampak_kesehatan: 'Pewarna sintetis untuk tekstil/kertas. Jika tertelan atau kontak jangka panjang memicu kanker hati dan kandung kemih.',
    aturan_regulasi: 'Dilarang keras pada pangan, lipstik, dan kosmetika (Permenkes 239/1985).',
  },
  {
    nama: 'Metanil Yellow (Kuning Metanil)',
    alias: ['metanil yellow', 'acid yellow 36', 'ci 13065'],
    kategori_bahaya: 'Karsinogenik',
    dampak_kesehatan: 'Pewarna industri kain/cat. Menyebabkan mual muntah akut, kerusakan hati, dan kanker usus jika dikonsumsi.',
    aturan_regulasi: 'Dilarang untuk produk pangan olahan dan permen.',
  },
  {
    nama: 'Formalin (Formaldehida)',
    alias: ['formalin', 'formaldehyde', 'formic aldehyde', 'methanal', 'methylene oxide'],
    kategori_bahaya: 'Dilarang Keras',
    dampak_kesehatan: 'Iritasi saluran pernapasan parah, sensasi terbakar pada lambung, dan karsinogen kelompok 1 bagi manusia.',
    aturan_regulasi: 'Dilarang digunakan sebagai pengawet tahu, mie basah, ikan, atau makanan apapun.',
  },
  {
    nama: 'Boraks (Asam Borat / Bleng Ilegal)',
    alias: ['borax', 'sodium borate', 'boric acid', 'sodium tetraborate', 'asam borat'],
    kategori_bahaya: 'Dilarang Keras',
    dampak_kesehatan: 'Menumpuk di otak, ginjal, dan hati. Menyebabkan demam, kejang lambung, koma, hingga kematian.',
    aturan_regulasi: 'Dilarang keras sebagai pengenyal bakso, kerupuk, atau makanan olahan.',
  },
  {
    nama: 'Sildenafil & Tadalafil (BKO Stamina Pria)',
    alias: ['sildenafil', 'sildenafil citrate', 'tadalafil', 'vardenafil'],
    kategori_bahaya: 'Dilarang Keras',
    dampak_kesehatan: 'Memicu stroke, serangan jantung akut, hipotensi fatal terutama pada pasien penderita kardiovaskular.',
    aturan_regulasi: 'Obat Keras dengan resep. Dilarang keras dicampur ke kopi, jamu kuat, atau madu stamina.',
  },
  {
    nama: 'Sibutramin Hidroklorida',
    alias: ['sibutramine', 'sibutramine hydrochloride', 'meridia'],
    kategori_bahaya: 'Dilarang Keras',
    dampak_kesehatan: 'Meningkatkan risiko stroke dan serangan jantung koroner secara dramatis.',
    aturan_regulasi: 'Izin edar telah ditarik secara global sejak 2010. Dilarang dalam produk pelangsing/diet.',
  },
];

export const INITIAL_REPORTS: Report[] = [
  {
    id: 'rep-1',
    ticket_number: 'RPT-2026-0811',
    nama_pelapor: 'Siti Rahmawati',
    kontak_pelapor: '0812-9988-7712',
    nama_produk: 'Cream Glowing Kilat 7 Hari',
    nomor_izin_tertera: 'NA99887766554 (Diduga Palsu)',
    nomor_batch: 'BATCH-GLW-01',
    lokasi_pembelian: 'Toko Kosmetik Pasar Pagi & Akun TikTok Shop @beautyshopxx',
    tanggal_kejadian: '2026-02-10',
    indikasi_bahaya: 'Kulit wajah terbakar, memerah parah, dan muncul bintik hitam okronosis setelah 2 minggu pemakaian.',
    efek_samping: 'Rasa terbakar panas, pembengkakan kelopak mata, gatal ekstrem.',
    foto_bukti_url: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=500&auto=format&fit=crop&q=80',
    drive_file_id: 'DRV-BUKTI-0811-JPG',
    tanggal_lapor: '2026-02-12',
    status: 'Uji Sampel Lab',
    tanggapan_petugas: 'Sampel produk telah diamankan petugas BBPOM setempat untuk pengujian laboratorium kandungan merkuri.',
  },
  {
    id: 'rep-2',
    ticket_number: 'RPT-2026-0834',
    nama_pelapor: 'Agus Setiawan',
    kontak_pelapor: '0857-1122-3344',
    nama_produk: 'Kopi Herbal Stamina Super',
    nomor_izin_tertera: 'MD 1234567890 (Tidak Terdaftar)',
    nomor_batch: 'BATCH-KP-99',
    lokasi_pembelian: 'Warung Kopi Rest Area KM 42 Tol Cikampek',
    tanggal_kejadian: '2026-03-01',
    indikasi_bahaya: 'Jantung berdebar sangat kencang, pusing kepala berputar, mata merah berkunang-kunang.',
    efek_samping: 'Takikardia 135 bpm, dilarikan ke IGD rumah sakit terdekat.',
    foto_bukti_url: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=500&auto=format&fit=crop&q=80',
    drive_file_id: 'DRV-BUKTI-0834-PDF',
    tanggal_lapor: '2026-03-03',
    status: 'Investigasi Lapangan',
    tanggapan_petugas: 'Tim patroli siber dan pengawasan distribusi sedang menelusuri pemasok dan lokasi gudang produksi.',
  },
];

export const INITIAL_USERS: User[] = [
  {
    id: 'usr-admin',
    username: 'admin_bpom',
    email: 'admin@bpom.go.id',
    password: 'adminbpom2026',
    role: 'Admin',
    nama_lengkap: 'Drs. Supriyanto, M.Si., Apt.',
    nip_instansi: '19750812 200003 1 002',
    status_aktif: true,
    dibuat_pada: '2025-01-01',
    terakhir_login: '2026-09-18 10:24',
  },
  {
    id: 'usr-lab',
    username: 'petugas_lab',
    email: 'lab@bpom.go.id',
    password: 'petugaslab2026',
    role: 'Petugas Lab',
    nama_lengkap: 'Nurul Hidayati, S.Si., Apt.',
    nip_instansi: '19880315 201212 2 001',
    status_aktif: true,
    dibuat_pada: '2025-02-10',
    terakhir_login: '2026-09-17 14:10',
  },
  {
    id: 'usr-pengawas',
    username: 'pengawas_lapangan',
    email: 'pengawas@bpom.go.id',
    password: 'pengawasbpom2026',
    role: 'Pengawas',
    nama_lengkap: 'Rizki Kurniawan, S.Farm.',
    nip_instansi: '19920721 201801 1 004',
    status_aktif: true,
    dibuat_pada: '2025-03-15',
    terakhir_login: '2026-09-16 09:05',
  },
  {
    id: 'usr-publik',
    username: 'warga_peduli',
    email: 'publik@bpom.go.id',
    password: 'publik2026',
    role: 'Masyarakat',
    nama_lengkap: 'Budi Santoso',
    status_aktif: true,
    dibuat_pada: '2025-04-01',
    terakhir_login: '2026-09-18 08:30',
  },
];

export const DEFAULT_WEBSITE_SETTINGS: WebsiteSettings = {
  nama_website: 'Badan Pengolahan Informasi Obat dan Makanan',
  singkatan_portal: 'BPIOM RI',
  tagline: 'Sistem Informasi Terpadu Pengolahan Data & Pengawasan Obat, Makanan, Kosmetik & Suplemen',
  deskripsi: 'Portal Resmi Badan Pengolahan Informasi Obat dan Makanan Republik Indonesia. Menyediakan integrasi basis data izin edar, verifikasi barcode terintegrasi, pemantauan pengujian laboratorium, dan perlindungan kesehatan masyarakat.',
  deskripsi_singkat: 'Portal Resmi Badan Pengolahan Informasi Obat dan Makanan untuk pencarian legalitas izin edar, verifikasi barcode digital, dan pelaporan obat berbahaya.',
  logo_url: '',
  logo_tipe: 'default_bpom',
  tema_warna: 'sky',
  running_text: 'PERINGATAN PUBLIK: Selalu lakukan Cek KLIK (Kemasan, Label, Izin Edar, Kedaluwarsa) sebelum membeli obat dan makanan. Pastikan produk terdaftar resmi di basis data BPIOM!',
  tampilkan_running_text: true,
  telepon_layanan: '1500533',
  whatsapp_layanan: '+62 811-1500-533',
  email_resmi: 'halobpom@pom.go.id',
  alamat_kantor: 'Jl. Percetakan Negara No. 23, Jakarta Pusat 10560, Indonesia',
  jam_operasional: 'Senin - Jumat: 08.00 - 16.00 WIB',
  teks_footer: 'Badan Pengolahan Informasi Obat dan Makanan Republik Indonesia. Seluruh hak cipta dilindungi undang-undang.',
  status_portal: 'aktif',
};

export const INITIAL_CUSTOM_PAGES: CustomPage[] = [
  {
    id: 'page-profil',
    judul: 'Profil & Tugas Pokok BPOM',
    slug: 'profil',
    ringkasan: 'Mengenal sejarah, visi, misi, dan wewenang Badan Pengawasan Obat dan Makanan Republik Indonesia.',
    kategori: 'Informasi Publik',
    urutan: 1,
    status: 'Publikasi',
    tampilkan_di_navigasi: true,
    tampilkan_di_footer: true,
    terakhir_diperbarui: '2026-09-15',
    penulis: 'Biro Humas & Protokol BPOM',
    konten: `
<h3>Tentang Badan Pengawasan Obat dan Makanan (BPOM)</h3>
<p>Badan Pengawasan Obat dan Makanan (BPOM) adalah Lembaga Pemerintah Nonkementerian yang menyelenggarakan urusan pemerintahan di bidang pengawasan Obat dan Makanan sesuai dengan ketentuan peraturan perundang-undangan.</p>

<h4>Visi</h4>
<p>Obat dan Makanan aman, bermutu, dan berdaya saing untuk mewujudkan Indonesia maju yang berdaulat, mandiri, dan berkepribadian berlandaskan gotong royong.</p>

<h4>Misi Utama</h4>
<ul>
  <li>Memfasilitasi percepatan pengembangan dunia usaha Obat dan Makanan dengan keberpihakan terhadap UMKM dalam rangka membangun struktur ekonomi yang produktif dan berdaya saing kemandirian bangsa.</li>
  <li>Menjamin keamanan, khasiat, dan mutu produk Obat dan Makanan yang beredar melalui pengawasan sebelum beredar (pre-market) dan selama beredar (post-market).</li>
  <li>Memperkuat kemitraan dengan pemangku kepentingan, pemerintah daerah, asosiasi industri, akademisi, dan masyarakat luas.</li>
  <li>Mengoptimalkan penegakan hukum terhadap kejahatan di bidang Obat dan Makanan secara profesional dan berintegritas.</li>
</ul>

<h4>Wewenang Pengawasan</h4>
<p>BPOM berwenang menerbitkan Nomor Izin Edar (NIE), melakukan sertifikasi sarana produksi (CPOB, CPKB, CPPOB), melakukan audit sarana distribusi, melakukan uji laboratorium rujukan nasional, serta merekomendasikan penarikan produk berbahaya dari peredaran nasional.</p>
    `.trim(),
  },
  {
    id: 'page-cek-klik',
    judul: 'Panduan Edukasi Cek KLIK',
    slug: 'panduan-cek-klik',
    ringkasan: 'Langkah praktis 4 langkah Cek KLIK bagi masyarakat cerdas sebelum mengonsumsi atau membeli produk.',
    kategori: 'Panduan',
    urutan: 2,
    status: 'Publikasi',
    tampilkan_di_navigasi: true,
    tampilkan_di_footer: true,
    terakhir_diperbarui: '2026-09-10',
    penulis: 'Direktorat Komunikasi Informasi Edukasi BPOM',
    konten: `
<h3>Edukasi Cerdas Konsumen: Pedoman Cek KLIK</h3>
<p>BPOM mengajak seluruh masyarakat Indonesia menjadi konsumen cerdas dengan membiasakan perilaku <strong>Cek KLIK</strong> setiap kali akan membeli atau mengonsumsi obat, kosmetik, pangan olahan, dan suplemen kesehatan.</p>

<div class="grid">
  <h4>1. Cek K - Kemasan</h4>
  <p>Pastikan kemasan produk dalam kondisi prima: tidak sobek, tidak penyok, tidak berkarat, tidak menggembung, dan segel penutup masih utuh dan rapat tanpa ada bekas pembukaan paksa.</p>

  <h4>2. Cek L - Label</h4>
  <p>Baca informasi lengkap pada label: nama produk, komposisi/bahan, informasi nilai gizi, aturan pakai/dosis, indikasi, efek samping, nama serta alamat lengkap produsen atau importir.</p>

  <h4>3. Cek I - Izin Edar (NIE)</h4>
  <p>Pastikan produk mencantumkan Nomor Izin Edar resmi dari BPOM, seperti:</p>
  <ul>
    <li><strong>Obat:</strong> DKL/DTL/DBL diikuti 12 digit (contoh: DKL1234567890A1)</li>
    <li><strong>Kosmetik:</strong> Notifikasi NA/NB/NC/ND/NE diikuti 11 digit angka (contoh: NA18210100123)</li>
    <li><strong>Pangan Olahan:</strong> BPOM RI MD atau ML diikuti 12 digit angka</li>
    <li><strong>Obat Tradisional:</strong> BPOM RI TR/TI/TL/HT/FF</li>
    <li><strong>Suplemen Kesehatan:</strong> BPOM RI SD/SI/SL</li>
  </ul>
  <p>Gunakan portal web ini atau fitur pemindai barcode untuk memverifikasi apakah nomor izin tersebut asli dan aktif.</p>

  <h4>4. Cek K - Kedaluwarsa</h4>
  <p>Pastikan tanggal kedaluwarsa (Expired Date / EXP) belum lewat. Jangan sekali-kali mengonsumsi atau memakai produk yang telah melewati tanggal kedaluwarsa meskipun tampilan fisiknya belum tampak berubah.</p>
</div>
    `.trim(),
  },
  {
    id: 'page-regulasi',
    judul: 'Regulasi & Standar Mutu Nasional',
    slug: 'regulasi',
    ringkasan: 'Daftar undang-undang dan peraturan kepala BPOM terkait standar keamanan sediaan farmasi dan pangan.',
    kategori: 'Regulasi',
    urutan: 3,
    status: 'Publikasi',
    tampilkan_di_navigasi: true,
    tampilkan_di_footer: true,
    terakhir_diperbarui: '2026-08-28',
    penulis: 'Biro Hukum & Organisasi BPOM',
    konten: `
<h3>Dasar Hukum & Regulasi Pengawasan Obat dan Makanan</h3>
<p>Pengawasan obat dan makanan di Indonesia dilaksanakan berlandaskan instrumen hukum yang mengikat untuk melindungi keselamatan publik dan ketertiban industri:</p>

<h4>Peraturan Perundang-undangan Pokok</h4>
<ul>
  <li><strong>Undang-Undang Nomor 17 Tahun 2023 tentang Kesehatan:</strong> Landasan yuridis penyelenggaraan upaya kesehatan terpadu dan perlindungan sediaan farmasi, alat kesehatan, dan makanan minuman.</li>
  <li><strong>Undang-Undang Nomor 18 Tahun 2012 tentang Pangan:</strong> Menetapkan pemenuhan standar keamanan pangan, mutu pangan, dan gizi untuk konsumsi masyarakat.</li>
  <li><strong>Undang-Undang Nomor 8 Tahun 1999 tentang Perlindungan Konsumen:</strong> Menjamin hak konsumen atas kenyamanan, keamanan, keselamatan, dan informasi yang benar, jelas, serta jujur.</li>
</ul>

<h4>Peraturan Badan Pengawas Obat dan Makanan</h4>
<ul>
  <li><strong>Peraturan BPOM No. 17 Tahun 2022 tentang Persyaratan Teknis Bahan Kosmetika:</strong> Pelarangan tegas penggunaan merkuri, hidrokuinon, asam retinoat tanpa resep, dan zat berbahaya lainnya.</li>
  <li><strong>Peraturan BPOM No. 34 Tahun 2018 tentang Pedoman Cara Pembuatan Obat yang Baik (CPOB):</strong> Menjamin obat dibuat dan dikendalikan secara konsisten sesuai standar mutu.</li>
  <li><strong>Peraturan BPOM No. 22 Tahun 2019 tentang Informasi Nilai Gizi pada Label Pangan Olahan:</strong> Kewajiban pencantuman kadar gula, garam, dan lemak bagi perlindungan kesehatan metabolik masyarakat.</li>
</ul>
    `.trim(),
  },
  {
    id: 'page-faq',
    judul: 'Tanya Jawab (FAQ) Konsumen & Industri',
    slug: 'faq',
    ringkasan: 'Pertanyaan yang sering diajukan seputar cek izin edar, sertifikasi sarana, dan pelaporan obat berbahaya.',
    kategori: 'Informasi Publik',
    urutan: 4,
    status: 'Publikasi',
    tampilkan_di_navigasi: true,
    tampilkan_di_footer: true,
    terakhir_diperbarui: '2026-09-01',
    penulis: 'Tim Layanan Pengaduan Konsumen BPOM',
    konten: `
<h3>Pertanyaan yang Sering Diajukan (FAQ)</h3>

<h4>Q: Bagaimana cara membedakan Nomor Izin Edar asli dengan yang palsu?</h4>
<p>A: Nomor Izin Edar (NIE) asli dapat diverifikasi langsung melalui portal ini dengan memasukkan nomor atau memindai barcode kemasan. Jika data nama produk, nama produsen, bentuk sediaan, dan tanggal berlaku cocok persis dengan yang ada di sistem, maka izin edar tersebut valid.</p>

<h4>Q: Mengapa saya tidak bisa mengunduh file sertifikat izin edar?</h4>
<p>A: Berdasarkan kebijakan integritas dan keamanan dokumen digital negara, pengunduhan berkas fisik sertifikat dinonaktifkan untuk publik. Hal ini diterapkan secara ketat demi mencegah rekayasa dan pemalsuan sertifikat cetak oleh pihak tak bertanggung jawab. Verifikasi resmi cukup dilakukan secara digital melalui barcode/QR code resmi yang terhubung langsung ke basis data terpusat BPOM.</p>

<h4>Q: Apa yang harus saya lakukan jika menemukan produk tanpa izin edar atau kedaluwarsa di toko?</h4>
<p>A: Jangan membeli produk tersebut dan segera laporkan melalui tombol <strong>Lapor Produk Berbahaya</strong> di portal ini atau hubungi Contact Center HALOBPOM di nomor <strong>1500533</strong>. Tim pengawas lapangan akan melakukan tindak lanjut dan investigasi.</p>

<h4>Q: Berapa lama masa berlaku Nomor Izin Edar BPOM?</h4>
<p>A: Pada umumnya masa berlaku izin edar adalah 5 (lima) tahun dan dapat diperpanjang melalui mekanisme pendaftaran ulang/perpanjangan (renewal) sebelum masa berlaku berakhir.</p>
    `.trim(),
  },
];
