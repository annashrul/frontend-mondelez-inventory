export const db = {
  barang: [
    { id: 1, kode: 'BRG-001', barcode: '8991001000011', nama: 'Kertas A4 70gsm', kelompok_id: 1, satuan_id: 3, rak_id: 1, stok: 150, stok_min: 50, harga: 45000, kata_kunci: 'kertas putih dokumen a4', gambar: ['https://placehold.co/400?text=Kertas+A4'] },
    { id: 2, kode: 'BRG-002', barcode: '8991001000028', nama: 'Pulpen Pilot G-2', kelompok_id: 1, satuan_id: 1, rak_id: 2, stok: 200, stok_min: 30, harga: 15000 },
    { id: 3, kode: 'BRG-003', barcode: '8991001000035', nama: 'Tinta Printer HP', kelompok_id: 2, satuan_id: 1, rak_id: 3, stok: 8, stok_min: 10, harga: 250000 },
    { id: 4, kode: 'BRG-004', barcode: '8991001000042', nama: 'Map Ordner', kelompok_id: 1, satuan_id: 1, rak_id: 4, stok: 45, stok_min: 25, harga: 35000 },
    { id: 5, kode: 'BRG-005', barcode: '8991001000059', nama: 'Amplop Coklat F4', kelompok_id: 1, satuan_id: 2, rak_id: 5, stok: 12, stok_min: 20, harga: 55000 },
  ],
  kelompok_barang: [
    { id: 1, kode: 'KLP-001', nama: 'Alat Tulis Kantor', deskripsi: 'Perlengkapan tulis menulis', jumlah_barang: 45 },
    { id: 2, kode: 'KLP-002', nama: 'IT Supply', deskripsi: 'Perlengkapan IT', jumlah_barang: 18 },
    { id: 3, kode: 'KLP-003', nama: 'Kebersihan', deskripsi: 'Alat dan bahan kebersihan', jumlah_barang: 22 },
    { id: 4, kode: 'KLP-004', nama: 'Elektrikal', deskripsi: 'Peralatan listrik', jumlah_barang: 15 },
  ],
  satuan: [
    { id: 1, kode: 'STN-001', nama: 'Pcs', deskripsi: 'Satuan per buah/piece' },
    { id: 2, kode: 'STN-002', nama: 'Box', deskripsi: 'Satuan per kotak' },
    { id: 3, kode: 'STN-003', nama: 'Rim', deskripsi: 'Satuan rim (500 lembar)' },
    { id: 4, kode: 'STN-004', nama: 'Roll', deskripsi: 'Satuan per gulungan' },
    { id: 5, kode: 'STN-005', nama: 'Lusin', deskripsi: 'Satuan per 12 buah' },
    { id: 6, kode: 'STN-006', nama: 'Pack', deskripsi: 'Satuan per pak' },
    { id: 7, kode: 'STN-007', nama: 'Kg', deskripsi: 'Satuan per kilogram' },
    { id: 8, kode: 'STN-008', nama: 'Liter', deskripsi: 'Satuan per liter' },
  ],

  lokasi: [
    { id: 1, kode: 'LOK-001', nama: 'Gudang Utama - Lantai 1', alamat: 'Gedung A, Lantai 1', deskripsi: 'Gudang utama penyimpanan barang lantai dasar', jumlah_rak: 4 },
    { id: 2, kode: 'LOK-002', nama: 'Gudang Utama - Lantai 2', alamat: 'Gedung A, Lantai 2', deskripsi: 'Gudang utama penyimpanan barang lantai atas', jumlah_rak: 2 },
    { id: 3, kode: 'LOK-003', nama: 'Gudang Sekunder', alamat: 'Gedung B', deskripsi: 'Gudang tambahan untuk overflow barang', jumlah_rak: 1 },
    { id: 4, kode: 'LOK-004', nama: 'Ruang Arsip', alamat: 'Gedung A, Lantai 3', deskripsi: 'Ruang penyimpanan dokumen dan arsip', jumlah_rak: 0 },
  ],
  rak: [
    { id: 1, kode: 'RAK-A01', qr_code: 'RAK:RAK-A01', nama: 'Rak A-01', lokasi_id: 1, kapasitas: 100, terisi: 65 },
    { id: 2, kode: 'RAK-A02', qr_code: 'RAK:RAK-A02', nama: 'Rak A-02', lokasi_id: 1, kapasitas: 100, terisi: 80 },
    { id: 3, kode: 'RAK-B01', qr_code: 'RAK:RAK-B01', nama: 'Rak B-01', lokasi_id: 2, kapasitas: 150, terisi: 45 },
    { id: 4, kode: 'RAK-B02', qr_code: 'RAK:RAK-B02', nama: 'Rak B-02', lokasi_id: 2, kapasitas: 150, terisi: 120 },
    { id: 5, kode: 'RAK-C01', qr_code: 'RAK:RAK-C01', nama: 'Rak C-01', lokasi_id: 3, kapasitas: 80, terisi: 30 },
  ],
  pengguna: [
    { id: 1, username: 'admin', nama: 'Administrator', email: 'admin@company.com', level_id: 1, status: 'Aktif' },
    { id: 2, username: 'budi', nama: 'Budi Santoso', email: 'budi@company.com', level_id: 2, status: 'Aktif' },
    { id: 3, username: 'sari', nama: 'Sari Dewi', email: 'sari@company.com', level_id: 2, status: 'Aktif' },
    { id: 4, username: 'owner', nama: 'Pemilik Perusahaan', email: 'owner@company.com', level_id: 3, status: 'Aktif' },
  ],
  level_pengguna: [
    { id: 1, kode: 'LVL-001', nama: 'Admin', deskripsi: 'Akses penuh ke semua fitur', hak_akses: 'Semua Menu', jumlah_user: 1 },
    { id: 2, kode: 'LVL-002', nama: 'Operator', deskripsi: 'Akses operasional harian', hak_akses: 'Transaksi, Master Barang', jumlah_user: 2 },
    { id: 3, kode: 'LVL-003', nama: 'Owner', deskripsi: 'Monitoring, laporan, dan audit', hak_akses: 'Dashboard, Laporan, Audit (read-only)', jumlah_user: 1 },
  ],
  adjustment: [
    { id: 1, tanggal: '2026-09-10', no_ref: 'ADJ-001', barang_id: 1, tipe: 'Tambah', qty: 10, alasan: 'Koreksi stok fisik', user_id: 1 },
    { id: 2, tanggal: '2026-09-09', no_ref: 'ADJ-002', barang_id: 2, tipe: 'Kurang', qty: 5, alasan: 'Barang rusak', user_id: 2 },
    { id: 3, tanggal: '2026-09-08', no_ref: 'ADJ-003', barang_id: 4, tipe: 'Tambah', qty: 20, alasan: 'Stok opname', user_id: 1 },
  ],
  kartu_stok: [
    { id: 1, tanggal: '2026-09-10T08:30:00Z', tipe: 'Masuk', no_ref: 'IN-001', barang_id: 1, qty: 100, saldo: 250, keterangan: 'Pembelian', user_id: 1 },
    { id: 2, tanggal: '2026-09-10T10:15:00Z', tipe: 'Keluar', no_ref: 'OUT-001', barang_id: 1, qty: 50, saldo: 200, keterangan: 'Pengambilan Dept. HRD', user_id: 2 },
    { id: 3, tanggal: '2026-09-09T14:00:00Z', tipe: 'Masuk', no_ref: 'IN-002', barang_id: 2, qty: 48, saldo: 248, keterangan: 'Pembelian', user_id: 1 },
    { id: 4, tanggal: '2026-09-09T16:30:00Z', tipe: 'Keluar', no_ref: 'OUT-002', barang_id: 2, qty: 12, saldo: 236, keterangan: 'Pengambilan Dept. Finance', user_id: 3 },
    { id: 5, tanggal: '2026-09-08T09:00:00Z', tipe: 'Masuk', no_ref: 'ADJ-003', barang_id: 4, qty: 20, saldo: 65, keterangan: 'Adjustment stok', user_id: 1 },
    { id: 6, tanggal: '2026-09-08T11:20:00Z', tipe: 'Keluar', no_ref: 'OUT-003', barang_id: 4, qty: 10, saldo: 55, keterangan: 'Pengambilan Dept. GA', user_id: 2 },
  ],
  pengambilan: [
    { id: 1, tanggal: '2026-09-10', no_ref: 'AMB-001', pemohon: 'Dept. HRD', barang_id: 1, rak_id: 1, operator_id: 2, qty: 50, status: 'Disetujui' },
    { id: 2, tanggal: '2026-09-10', no_ref: 'AMB-002', pemohon: 'Dept. Finance', barang_id: 2, rak_id: 2, operator_id: 3, qty: 12, status: 'Pending' },
    { id: 3, tanggal: '2026-09-09', no_ref: 'AMB-003', pemohon: 'Dept. GA', barang_id: 4, rak_id: 4, operator_id: 2, qty: 10, status: 'Disetujui' },
    { id: 4, tanggal: '2026-09-09', no_ref: 'AMB-004', pemohon: 'Dept. IT', barang_id: 3, rak_id: 3, operator_id: 1, qty: 2, status: 'Ditolak' },
  ],
  log_activity: [
    { id: 1, waktu: '2026-09-10T14:30:22Z', user_id: 1, aksi: 'Login', modul: 'Auth', detail: 'Login berhasil', ip: '192.168.1.100' },
    { id: 2, waktu: '2026-09-10T14:25:10Z', user_id: 1, aksi: 'Tambah', modul: 'Master Barang', detail: 'Tambah barang: Kertas A4 70gsm', ip: '192.168.1.100' },
    { id: 3, waktu: '2026-09-10T13:15:45Z', user_id: 2, aksi: 'Edit', modul: 'Master Barang', detail: 'Update stok: Pulpen Pilot G-2', ip: '192.168.1.102' },
    { id: 4, waktu: '2026-09-10T12:00:00Z', user_id: 3, aksi: 'Hapus', modul: 'Kelompok Barang', detail: 'Hapus kelompok: Lain-lain', ip: '192.168.1.103' },
    { id: 5, waktu: '2026-09-10T11:30:00Z', user_id: 2, aksi: 'Tambah', modul: 'Pengambilan', detail: 'Pengambilan AMB-001', ip: '192.168.1.102' },
    { id: 6, waktu: '2026-09-10T10:00:00Z', user_id: 1, aksi: 'Closing', modul: 'Closing', detail: 'Closing shift pagi', ip: '192.168.1.100' },
  ],
  shift: [
    { id: 1, shift: 'Pagi', tanggal: '2026-09-10', waktu_closing: '14:00', user_id: 1, total_transaksi: 32, status: 'Selesai' },
    { id: 2, shift: 'Siang', tanggal: '2026-09-09', waktu_closing: '22:00', user_id: 2, total_transaksi: 28, status: 'Selesai' },
    { id: 3, shift: 'Pagi', tanggal: '2026-09-09', waktu_closing: '14:00', user_id: 1, total_transaksi: 35, status: 'Selesai' },
  ]
};