# Pembaruan v10 (20 Okt 2026): email bisnis

- Tombol Langganan (email) kini ke **admin@zuisystem.com**.
- Halaman Syarat dan Kebijakan Privasi: kontak **info@zuisystem.com**.
- Kaki Pengaturan semua aplikasi: "Kontak: **support@zuisystem.com**".
- Akun admin utama di Firestore Rules tetap admin.zuisystem@gmail.com (tidak berubah).

Cache service worker naik: sys v45, inv v27, mfg v25, keu v24, kar v23.

# Pembaruan v9 (19 Okt 2026): tampilan

1. Tombol di jendela dokumen (Terima ke gudang, Cetak, Kirim, Tutup) dan dialog lain kini rapi dan tidak terpotong di layar HP.
2. Kaki Pengaturan dirapikan dengan garis pemisah: Syarat dan Kebijakan Privasi, **ZUI ERP versi 26.01**, "Aplikasi ZUI ERP dikelola oleh ZUI System, PT. Zaor Utama Indonesia", dan "Jelajahi aplikasi lain di zuisystem.com".
3. **Ikon pesan** di pojok kanan atas semua aplikasi (Pemilik/Admin): membuka Langganan dan bantuan (chat ke Zui Admin), dengan titik merah bila ada balasan baru.

Cache service worker naik: sys v44, inv v26, mfg v24, keu v23, kar v22.

# Pembaruan v8 (19 Okt 2026): syarat, bantuan, versi, ubah nama

1. **Syarat dan Kebijakan Privasi di semua modul.** Layar masuk Inventori, Manufaktur, Keuangan, dan Karyawan kini memuat "Dengan masuk atau mendaftar, Anda menyetujui Syarat dan Kebijakan Privasi" (satu halaman `syarat.html` untuk semua aplikasi).
2. **Kaki halaman Pengaturan di semua aplikasi:** tautan Syarat dan Kebijakan Privasi, "ZUI ERP versi 26.01", dan "Aplikasi ZUI ERP dikelola oleh PT. Zaor Utama Indonesia".
3. **Bantuan dari modul.** Pemilik/Admin melihat tombol "Bantuan dan pertanyaan umum" di Pengaturan modul; tombol ini membuka Langganan dan bantuan di ZUI ERP (tersambung ke Zui Admin). Peran lain melihat "Hubungi pemilik atau admin perusahaan Anda" karena kotak bantuan hanya untuk Pemilik/Admin.
4. **Ubah nama sendiri** di ZUI ERP > Pengaturan > Akun > Ubah nama, termasuk untuk Pemilik (peran Pemilik tetap tidak bisa diubah). Nama baru dipakai di semua modul saat dibuka lagi.

Tidak ada perubahan Firestore Rules. Cache service worker naik: sys v43, inv v25, mfg v23, keu v22, kar v21.

# Pembaruan v7 (19 Okt 2026): perbaikan sinkron antar modul dan bug

1. **Inventori tidak lagi membuang perubahan.** Dulu, bila dua orang (atau Keuangan/ZUI ERP saat menyetujui pembelian) menyimpan hampir bersamaan, perubahan yang terlambat dibuang dan muncul "mohon ulangi". Sekarang penyimpanan memakai transaksi dan perubahan digabung per baris data (barang, batch, pembelian, penjualan, kontak), jadi keduanya tersimpan.
2. **Satu akun di dua perangkat ikut sinkron.** Dulu perubahan dari akun yang sama di perangkat lain (mis. HP dan laptop pemilik) tidak dimuat otomatis.
3. **Jam perangkat yang tidak tepat tidak lagi merusak sinkron.** Versi data selalu naik, bukan bergantung pada jam perangkat.
4. **Perubahan offline digabung saat aplikasi dibuka lagi**, tidak menimpa perubahan orang lain. Mode luar jaringan Inventori kini benar-benar bisa dipakai (dulu data perusahaan terakhir tidak pernah tersimpan) dan memakai peran terakhir, bukan Admin.
5. **Pembayaran dari Keuangan langsung masuk ke Inventori** (bayar utang, terima piutang, atau persetujuan pengeluaran di Keuangan maupun di ZUI ERP). Dulu baru diterapkan saat ada yang membuka Inventori, sehingga utang di Inventori dan Pantauan tertinggal.
6. **Serah bahan dan terima hasil produksi aman dari balapan.** Gudang mengklaim permintaan di Manufaktur dulu sebelum stok berubah: permintaan yang sudah dibatalkan tidak lagi mengurangi stok, dan hasil produksi tidak bisa diterima dua kali dari dua perangkat.
7. **Permintaan bahan, hasil lulus mutu, dan pembayaran tampil langsung di Inventori** tanpa perlu membuka ulang aplikasi. Stok di Manufaktur juga ikut diperbarui saat Inventori berubah.
8. **Manufaktur menolak aksi dengan status basi** (mis. membatalkan permintaan yang sudah diserahkan gudang) dan riwayat produksi tidak lagi tertimpa.
9. **Karyawan: Admin/Pemilik kini melihat data kehadiran.** Dulu daftar kehadiran Admin selalu kosong, sehingga Admin tidak bisa absen pulang dan absen masuk bisa tertimpa.
10. **Nomor pembelian/penjualan** melanjutkan nomor terbesar tahun ini (tidak bentrok setelah ada pembelian dihapus atau dibuat bersamaan).
11. **Terjemahan English/Melayu kembali berfungsi** pada teks yang sebelumnya diganti menjadi "ZUI ERP".

Tidak ada perubahan Firestore Rules. Cache service worker naik: sys v42, inv v24, mfg v22, keu v21, kar v20.

# Pembaruan v6 (16 Okt 2026, malam): pindah ke erp.zuisystem.com, animasi 10 detik

1. **Tautan modul mengikuti alamat ZUI SYSTEM ERP.** Dulu alamat modul tertulis tetap https://zuisystem.com/inventori/ dan seterusnya, sehingga setelah pindah ke erp.zuisystem.com tombol buka modul mengarah ke website. Sekarang alamat modul dihitung dari alamat ZUI SYSTEM ERP itu sendiri (mis. https://erp.zuisystem.com/inventori/). Tautan kembali dari modul ke ZUI SYSTEM ERP juga mengikuti alamatnya.
2. **Alamat aplikasi tersimpan diperbarui otomatis** saat Pemilik/Admin membuka ZUI SYSTEM ERP, jadi tautan di Keuangan dan pesan undangan ikut benar.
3. **Animasi pembuka 10 detik** di semua aplikasi (tetap bisa dilewati dengan ketuk layar).

## Wajib sekali saja setelah pindah domain
- Firebase Console → Authentication → Settings → **Authorized domains** → Add domain → `erp.zuisystem.com`. Tanpa ini, masuk dengan Google dan email atur kata sandi gagal di alamat baru.
- Pengguna masuk sekali lagi di erp.zuisystem.com (login lama tersimpan per alamat). Aplikasi yang terpasang dari alamat lama perlu dipasang ulang dari erp.zuisystem.com.

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
