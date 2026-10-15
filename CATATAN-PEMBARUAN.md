# Pembaruan Zui System (16 Okt 2026)

## Yang berubah
1. **Zui Admin dihapus dari Zui System.** Folder `admin/` tidak ada lagi. Urusan admin kini lewat aplikasi terpisah `admin.zuisystem.com`.
2. **Perbaikan login.** Dulu, setelah lama tidak dibuka (lebih dari 1 hari di web / 30 hari di aplikasi terpasang), pengguna dikeluarkan lalu langsung dikeluarkan lagi setiap kali mencoba masuk. Sekarang setelah sesi berakhir pengguna bisa langsung masuk lagi. Berlaku di Zui System, Inventori, Keuangan, Karyawan, Manufaktur.
3. **Setujui / Tolak langsung dari pemberitahuan** di Zui System (tab Aplikasi → Persetujuan), tanpa membuka aplikasi divisi:
   - Pembelian (Inventori): tahap 1 Pemilik/Admin, tahap 2 Keuangan.
   - BoM (Manufaktur): Mutu atau Pemilik/Admin.
   - Pengeluaran dan transfer kas (Keuangan): Pemilik/Admin.
   - Cuti (Karyawan): Pemilik/Admin.
   Pengajuan baru muncul seketika, dengan bunyi getar, angka di judul, dan pemberitahuan perangkat (tekan "Nyalakan pemberitahuan di perangkat ini" sekali). Menolak wajib mengisi alasan. Semua tercatat di Aktivitas.
4. **DuitNow QR di menu paket.** Perusahaan bermata uang Ringgit melihat harga RM dan DuitNow QR; Rupiah dan Dolar tetap QRIS + rekening. Gambar DuitNow diunggah dari Zui Admin (Pengaturan → Zui System → pembayaran).

## Cara pasang
1. **Hapus folder `admin/`** dari repo GitHub zuisystem.com (mengunggah file baru tidak menghapus folder lama).
2. Unggah/timpa semua file di folder ini.
3. **Firestore Rules wajib diterbitkan ulang**: Firebase Console project `zuisystem` → Firestore Database → Rules → tempel isi `firestore.rules` → Publish. (Menambah izin kolom `duitnow` dan `catatanMY`.)
4. Perbarui Zui Admin (`admin.zuisystem.com`) dengan versi baru agar bisa mengunggah DuitNow QR.

## Catatan
Pemberitahuan perangkat muncul selama Zui System terbuka (termasuk di tab latar belakang). Pemberitahuan saat aplikasi benar-benar tertutup memerlukan layanan server (Cloud Functions, paket Blaze).
