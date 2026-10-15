# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some Oxlint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the Oxlint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and Oxlint's TypeScript related rules in your project.

## Progressive Web App (PWA)

Build produksi (`npm run build`) menghasilkan `manifest.webmanifest`, `sw.js`,
ikon instalasi 192/512 px, ikon maskable, dan Apple touch icon. Sajikan seluruh
isi `dist` melalui HTTPS (localhost juga didukung untuk pengujian).

Chrome/Edge menampilkan tombol **Instal aplikasi** jika instalasi tersedia.
Pada iPhone/iPad, gunakan Safari → Bagikan → Tambah ke Layar Utama.
Aplikasi yang terpasang berjalan dalam mode standalone.

Service worker menyimpan HTML, JavaScript, CSS, dan ikon agar tampilan dasar
aplikasi dapat dibuka kembali saat offline. Data API, login, notifikasi, dan
transaksi tidak disimpan oleh service worker. Membaca data terbaru dan
menyimpan transaksi membutuhkan koneksi internet; tidak ada antrean transaksi
offline. Banner offline menjelaskan keadaan ini kepada pengguna.

Saat build baru tersedia, pengguna mendapat pemberitahuan **Perbarui aplikasi**.
Aplikasi tidak melakukan reload paksa saat pengguna sedang mengisi transaksi.
Selesaikan pekerjaan sebelum menekan tombol update. Pemeriksaan update juga
berjalan saat aplikasi kembali terlihat, koneksi pulih, dan setiap satu jam.

Konfigurasi Vercel memastikan API/Socket.IO diproses sebelum fallback SPA dan
`sw.js` selalu divalidasi ulang. Jika memakai hosting lain, sajikan `sw.js`
dengan `Cache-Control: no-cache`, manifest sebagai `application/manifest+json`,
dan arahkan rute halaman aplikasi ke `index.html`. Hindari fallback SPA untuk
`/api` dan `/socket.io`. Ikon berasal dari logo proyek; sumber layout ada di
`scripts/pwa-icon.svg`.


## Aktivitas aplikasi

Aksi di server dicatat oleh audit backend. Untuk aksi yang terjadi di browser atau memakai cache, gunakan `recordUiActivity` dari `src/services/activityEvents.js`: navigasi/tab, preferensi pribadi, cetak QR, pencarian/pagination/filter, percobaan aksi tanpa hak akses, dan permintaan instalasi/pembaruan PWA. Catat hanya metadata yang diperlukan, jangan kirim password, OTP, token, gambar, atau seluruh state form. Perubahan data baru harus menandai cache `log-activity` untuk diperbarui agar hasilnya terlihat saat pengguna membuka riwayat.
