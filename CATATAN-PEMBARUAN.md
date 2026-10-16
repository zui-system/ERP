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
