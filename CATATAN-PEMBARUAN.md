# Pembaruan v4 (16 Okt 2026, malam): nama baru, logo, animasi, mode Biru Malam

1. **Nama baru.** Aplikasi pusat kini **ZUI SYSTEM ERP** (di layar, judul tab, nama saat dipasang, teks undangan, pemberitahuan, halaman Syarat). Modul tanpa kata "Zui": **Inventori, Manufaktur, Keuangan, Karyawan**. Di ikon HP, aplikasi pusat bernama pendek **ZUI ERP**.
2. **Logo baru** di layar masuk semua aplikasi: ZUI besar, SYSTEM sejajar di bawahnya (S sejajar Z, M sejajar I), lalu nama aplikasi di antara dua garis menyala warna aplikasi (ERP biru, Inventori hijau, Manufaktur oranye, Keuangan merah muda, Karyawan ungu).
3. **Animasi pembuka baru.** ZUI SYSTEM ERP: logo + ilustrasi garis (gudang, pabrik, kantor) dengan jendela menyala warna modul, sekitar 3,6 detik. Modul: logo saja, sekitar 2,5 detik. Tampil sekali tiap aplikasi dibuka, bisa dilewati dengan ketuk layar, dan langsung diam bila HP diatur "kurangi gerakan". (Animasi lama 7,6 detik dihapus.)
4. **Mode tampilan Biru Malam** di Pengaturan → Tampilan semua aplikasi: Otomatis, Terang, Gelap, Biru Malam (warna latar logo dengan cahaya biru samar, tanpa ilustrasi).
5. **Ikon baru** untuk semua aplikasi (ZUI / SYSTEM / garis warna aplikasi).

## Cara pasang v4
1. Unggah/timpa semua file di folder ini ke repo zuisystem.com (termasuk ikon dan manifest di tiap folder).
2. Tidak ada perubahan Firestore Rules.
3. Disarankan: Firebase Console → Project settings → General → **Public-facing name** = "ZUI SYSTEM ERP" (nama di email undangan dan atur kata sandi).
4. Aplikasi yang sudah terpasang di HP akan memperbarui diri sendiri saat dibuka. Nama dan ikon di layar HP biasanya baru berubah setelah beberapa hari; agar langsung berubah, hapus pintasan lalu pasang ulang.

# Pembaruan v3 (16 Okt 2026, siang)

1. **Undangan langsung dikirim ke email.** Saat Pemilik/Admin menekan Kirim undangan, Zui membuat akun untuk email itu dan Firebase mengirim email berisi tautan untuk membuat kata sandi. Tautannya kembali ke Zui System, layar masuk menampilkan "Anda diundang ke (perusahaan) sebagai (peran)" dengan email sudah terisi, dan setelah masuk orang itu langsung bergabung. Pilihan "Buat perusahaan" disembunyikan untuk orang yang datang dari tautan undangan.
   - Daftar Undangan menunggu kini punya tombol Kirim ulang email dan Bagikan tautan (WhatsApp/pesan).
   - Jika email itu sudah punya akun Zui, tidak ada email atur kata sandi; undangan aktif begitu ia masuk, dan Anda ditawari membagikan tautan undangan.
   - Batas Firebase paket gratis: 150 email atur kata sandi per hari.
2. **Keuangan mengonfirmasi pembelian langsung di Zui Keuangan** (Ringkasan → Perlu tindakan, dan tab Utang). Tombol Konfirmasi / Tolak; Pemilik/Admin juga bisa menyetujui tahap 1 di sini.
3. **BoM memakai satuan resep bebas.** Bahan yang stoknya dalam liter bisa ditulis dalam ml (atau sebaliknya), kg ↔ g/mg/ons. Konversi ke satuan stok gudang otomatis dan ditampilkan langsung ("= 0,25 liter dari stok gudang"). Permintaan bahan ke gudang tetap memakai satuan stok.

## Pengaturan Firebase untuk email undangan (sekali saja)
- Firebase Console → Authentication → Sign-in method: **Email/Password** harus aktif (sudah aktif bila pendaftaran berjalan).
- Disarankan: Project settings → General → **Public-facing name** = "Zui System" (nama ini muncul di email).
- Opsional: Authentication → Templates → **Password reset** → ubah subjek menjadi mis. "Atur kata sandi akun Zui System Anda".
- Tidak ada perubahan Firestore Rules di v3 (rules dari v2 tetap dipakai).

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
