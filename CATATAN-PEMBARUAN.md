# Pembaruan v17 (23 Okt 2026): nama PT dihapus, pengelola cukup ZUI System

1. **Nama "PT. Zaor Utama Indonesia" dihapus** dari semua aplikasi (ZUI ERP, Inventori, Manufaktur, Keuangan, Karyawan). Kaki Pengaturan kini berbunyi "Aplikasi ZUI ERP dikelola oleh ZUI System" (Indonesia, English, Melayu).
2. **Layar pembuka dan panel kiri halaman Masuk/Daftar** menampilkan `www.zuisystem.com` di tempat nama PT.
3. **Syarat dan Kebijakan (`syarat.html`)**: pengelola cukup ZUI System, baris Perusahaan di Kontak menjadi Pengelola, kaki halaman memuat www.zuisystem.com. Alamat, email, WhatsApp, dan jam layanan tidak berubah. Tanggal berlaku 23 Oktober 2026.

Tidak ada perubahan Rules. Cache service worker naik: sys v54, inv v36, keu v33, mfg v34, kar v29.

# Pembaruan v16 (22 Okt 2026): dokumen legal baru, kata sandi bisa dilihat

1. **Syarat dan Kebijakan (`syarat.html`) mengikuti dokumen legal ZUI System**, disesuaikan untuk ZUI ERP: Syarat Layanan, Kebijakan Privasi (UU PDP No. 27/2022), Kebijakan Pengembalian Dana (dengan tabel harga), dan Kontak & Alamat (alamat PT, email bantuan dan informasi, WhatsApp, jam layanan). Di HP, daftar isi menjadi empat tombol.
2. **Kata sandi bisa dilihat atau disembunyikan** dengan tombol mata di dalam isian, di halaman Masuk dan Daftar semua aplikasi dan di isian kata sandi lain (mis. konfirmasi hapus akun). Tautan "Tampilkan kata sandi" lama diganti tombol ini. Tombol mata bawaan Edge disembunyikan agar tidak dobel.

Tidak ada perubahan Rules. Cache service worker naik: sys v53, inv v35, keu v32, mfg v33, kar v28; zui-ui.css v5, zui-ui.js v3.

# Pembaruan v15 (22 Okt 2026): layar pembuka di PC, halaman Masuk/Daftar layar penuh, pindah tab tanpa bayangan

1. **Layar pembuka di PC.** Animasi logo dan ilustrasi tetap berjalan walau Windows/perangkat meminta gerakan dikurangi (dulu animasi mati dan layar tertutup setelah 1,2 detik). Di layar lebar ilustrasi ikut membesar dengan tepi kiri-kanan memudar, logo selalu tepat di atas gedung, dan saat menutup logo hilang lebih dulu sehingga tidak ada logo dobel. Tampilan HP tidak berubah.
2. **Halaman Masuk/Daftar di PC memenuhi layar**, di semua aplikasi: panel kiri biru malam berisi penjelasan aplikasi (ZUI ERP: empat aplikasi Zui; Inventori, Karyawan, Keuangan, Manufaktur: fitur utama masing-masing dengan warna aplikasinya) dan ilustrasi gedung; formulir di kanan. Teks panel tersedia dalam Indonesia, English, Melayu. Di HP tetap satu kolom.
3. **Perbaikan formulir Daftar**: di layar pendek dulu terpotong atas-bawah dan tidak bisa digulir (tombol Daftar bisa tidak terjangkau); sekarang bisa digulir. Syarat kata sandi diberi jarak, ruang kosong di atas ATAU dihapus.
4. **Pindah tab tanpa bayangan**, di semua aplikasi: menekan tab yang jauh dulu menggeser melewati semua halaman di antaranya (dan tab di antaranya menyala bergantian); sekarang langsung pindah dengan muncul singkat. Tab bersebelahan tetap bergeser halus. Kotak warna saat tombol disentuh di HP dihilangkan, dan sorotan kartu saat disentuh tidak lagi menempel di HP (hanya untuk mouse).

Tidak ada perubahan Rules. Cache service worker naik: sys v52, inv v34, keu v31, mfg v32, kar v27; zui-ui.css v4. Uji: 28 uji data + 22 uji peramban lulus.

# Pembaruan v14 (20 Okt 2026): satu warna per aplikasi, Pengaturan selebar layar, tampilan HP

1. **Satu warna per aplikasi.** Tombol aktif, tombol utama (mis. Simpan), tombol + di pojok, tautan, dan garis atas kini memakai warna aplikasi masing-masing: ZUI ERP biru (sama dengan kartu ZUI ERP; dulu garis atas dan tombol berwarna biru muda kehijauan), Inventori hijau, Manufaktur oranye, Karyawan ungu, Keuangan merah muda. Tab aktif di semua aplikasi bergaris bawah warna aplikasi. Bilah status di HP Android kini mengikuti latar aplikasi (dulu biru kehijauan).
2. **Bahasa dan Tampilan masing-masing satu tombol.** Tombol menampilkan pilihan yang aktif (mis. "Indonesia", "Gelap"); ketuk untuk membuka daftar pilihan.
3. **Bentuk tombol seragam**: semua tombol bersudut 8px dengan ukuran yang sama (tidak ada lagi tombol bulat lonjong di samping tombol kotak, atau tombol Simpan yang lebih besar).
4. **Pengaturan di laptop/PC selebar halaman** (dulu satu kolom sempit di tengah). Kolom isian tetap selebar wajar agar mudah dibaca.
5. **Kaki halaman lebih rapat ke bawah** dan tulisannya sedikit lebih kecil, di semua aplikasi.
6. **Tampilan HP tidak lagi menempel di tepi layar.** Baris tab di atas dulu digeser sampai tab menempel di tepi kiri/kanan layar sehingga terlihat terpotong; sekarang tab aktif selalu utuh di dalam batas tepi, tab lain memudar di tepi. Angka ringkasan (mis. saldo) di HP kecil tidak lagi terpotong "…".
7. **Perbaikan:** di Keuangan, Karyawan, dan Manufaktur tombol "Buka ZUI ERP" dan "Keluar" tersasar ke bagian Tampilan/Peran; sekarang ada di bagian Akun.
8. Alat potret `uji/foto.mjs` bisa memotret setiap tab sepanjang isinya (`node foto.mjs hasil dark penuh`) dan memeriksa otomatis isi yang keluar layar, terpotong "…", atau tab aktif yang keluar batas.

Tidak ada perubahan Rules. Cache service worker naik: sys v51, inv v33, keu v30, mfg v31, kar v26. Uji: 28 uji data + 22 uji peramban lulus.

# Pembaruan v13 (20 Okt 2026): tampilan seragam di semua aplikasi

1. **Daftar berbentuk kartu seperti kartu aplikasi di ZUI ERP** di semua aplikasi (ZUI ERP, Inventori, Keuangan, Manufaktur, Karyawan): garis atas menyala dengan warna modul (ZUI ERP biru, Inventori hijau, Manufaktur oranye, Karyawan ungu, Keuangan merah muda), tersusun 1 kolom di HP dan beberapa kolom di laptop.
2. **Pengaturan lebih rapi dan sederhana**: satu kolom di tengah, tiap bagian dipisah garis tipis (tanpa kotak/garis menyala), urutan sama di semua aplikasi: Akun → pengaturan khusus aplikasi → Pasang dan bagikan → Bahasa → Tampilan → Data → bantuan dan kaki halaman.
3. **Ukuran tombol seragam**: tombol aksi kecil, tombol dialog tidak lagi melebar penuh di laptop (tetap lebar penuh di HP agar mudah diketuk), tombol Setujui/Tolak dan tombol + di pojok sedikit lebih kecil.
4. **Kategori dan Satuan di formulir barang berupa pilihan** (bukan kolom ketik panjang). Satuan yang ditambah di Pengaturan langsung muncul; "+ Lainnya (ketik baru)…" untuk satuan/kategori baru. Saran satuan di formulir pembelian juga memakai daftar dari Pengaturan.
5. Gaya bersama ada di `zui-ui.css` dan `zui-ui.js` (dimuat semua aplikasi). Alat potret semua halaman: `uji/foto.mjs`.

Tidak ada perubahan Rules. Cache service worker naik: sys v50, inv v32, keu v29, mfg v30, kar v25.

# Pembaruan v12 (20 Okt 2026): kas dari penjualan, harga otomatis, kartu barang

1. **Uang penjualan masuk kas Keuangan** (bila perusahaan memakai Zui Keuangan). Penjualan yang dibayar lunas dan "Terima bayar" (cicilan) di Inventori:
   - Pemilik, Admin, Keuangan: langsung menjadi transaksi kas masuk di akun yang dipilih di formulir (saldo akun ikut naik).
   - Kasir: menjadi **setoran** yang menunggu konfirmasi. Keuangan menerima di Zui Keuangan > Ringkasan > Perlu tindakan (Terima ke akun / Tolak dengan alasan). Kasir tetap tidak bisa menulis kas langsung.
   - Tidak bisa dicatat dua kali (dijaga Rules). Retur penjualan yang mengembalikan uang belum otomatis keluar dari kas.
2. **HPP tidak tampil di layar Kasir** (daftar barang, Ringkasan, cetak/CSV daftar stok, detail penjualan). Datanya masih bisa dibaca secara teknis; ini pembatasan tampilan.
3. **Harga jual otomatis** (Pengaturan > Harga jual otomatis, Pemilik/Admin):
   - Harga = HPP + keuntungan % (markup), dibulatkan ke atas (bawaan Rp500; Ringgit/Dolar 0,50).
   - HPP naik (pembelian atau hasil produksi) → harga ikut naik. HPP turun → hanya muncul saran, dengan tombol Pakai.
   - Keuntungan bawaan, per kategori, atau khusus per barang; harga reseller dengan % sendiri (opsional).
   - Barang baru otomatis (bisa dimatikan); barang lama tetap manual sampai Anda menekan "Pakai harga otomatis untuk barang lama".
   - Harga di formulir penjualan tidak pernah di bawah harga otomatis.
4. **Kategori dan satuan** di Pengaturan: tambah, ubah, hapus. Kategori punya kode awalan dan % keuntungan. Formulir barang memilih dari daftar (atau ketik baru). Kategori/satuan yang sudah dipakai otomatis masuk daftar.
5. **Kode barang otomatis per kategori** (mis. PRF-001). Kategori tanpa kode tetap memakai kode tipe (PRD/RM/PK). Kode lama tidak diubah.
6. **Biaya lain produksi**: kolom "Biaya lain per batch" di BoM Manufaktur (tenaga kerja, listrik, gas). HPP hasil produksi = bahan + biaya lain; pesan saat menerima hasil menampilkan rinciannya dan harga jual.
7. **Daftar barang berbentuk kartu**: nama, kode, stok (merah = habis, kuning = menipis), tipe, kategori, lokasi, kedaluwarsa, harga jual, HPP. Ketuk kartu untuk detail: harga dan keuntungan, batch, mutasi terakhir, dan tombol Masuk/Keluar/Batch/Ubah/Hapus.
8. Teks baru belum diterjemahkan ke English/Melayu (tampil dalam Bahasa Indonesia).

Rules berubah (koleksi `setoran`, kolom `bl` di `bom` dan `produksi`): **publikasikan ulang `firestore.rules`**. Cache service worker naik: sys v48, inv v30, keu v27, mfg v28. Uji: 28 uji data + 22 uji peramban.

# Pembaruan v11 (20 Okt 2026): pondasi untuk perusahaan besar (Tahap 1)

1. **Data Inventori per dokumen.** Dulu seluruh data Inventori satu JSON besar (batas ±8 MB per perusahaan). Sekarang tiap barang, batch, pembelian, penjualan, mutasi, kontak, dan batch dibuang adalah dokumen sendiri (koleksi `barang`, `batch`, `pembelian`, `penjualan`, `mutasi`, `kontak`, `buang`, `invtanda`, `invcfg`). Tidak ada lagi batas ukuran total.
2. **Pemindahan otomatis tanpa kehilangan data.** Saat Inventori, Keuangan, atau ZUI ERP dibuka oleh Pemilik/Admin/Gudang/Kasir/Keuangan, data lama dipindahkan, dibaca ulang dan dicocokkan baris per baris, baru ditandai selesai (`invcfg/v2`). Data lama tetap disimpan sebagai cadangan (tidak dihapus), tetapi tidak bisa ditulis lagi. Perubahan yang belum terkirim dari Inventori versi lama di perangkat ikut digabung. Selama pemindahan, perangkat lain menunggu.
3. **Lebih cepat dan hemat.** Inventori menyimpan salinan di perangkat (IndexedDB) dan hanya mengambil perubahan sejak terakhir dibuka. Simpan hanya mengirim baris yang berubah; perubahan bersamaan pada baris yang sama digabung (mis. dua kasir menjual dari batch yang sama: kedua pengurangan tersimpan). Nomor nota yang sama dari dua perangkat otomatis diganti.
4. **Firestore Rules per koleksi dan per peran** (mengikuti hak akses yang sudah ada, tidak ada perubahan alur): Kasir/Keuangan hanya boleh mengubah stok, HPP, dan lokasi barang serta jumlah batch; Gudang tidak bisa mengubah penjualan; Kasir tidak bisa mengubah pembelian; riwayat mutasi hanya bisa ditambah; Produksi/Mutu hanya membaca. Perubahan yang ditolak dikembalikan dan diberi tahu.
5. **Saldo Keuangan tanpa batas 1.500.** Saldo tersimpan per akun (`akun.sal`) dan diperbarui di tulisan yang sama dengan transaksi kas (catat, setujui di Keuangan atau ZUI ERP, hapus). Rules memastikan saldo tidak bisa berubah tanpa transaksinya. Akun lama diisi sekali dari seluruh riwayat kas. Ringkasan bulan ini dan pengajuan menunggu juga tidak lagi terpotong.
6. Keuangan, Manufaktur, dan ZUI ERP (Pantauan, persetujuan pembelian dan kas, Hapus/Unduh data perusahaan) membaca koleksi baru dan ikut diperbarui otomatis.
7. **Simpan lebih cepat untuk data sangat besar.** Pemeriksaan perubahan sebelum simpan untuk 30.000 barang + 200.000 mutasi turun dari ±3 detik menjadi ±0,4 detik (`node uji/ukur-simpan.mjs`).
8. **Riwayat mutasi lama dimuat hanya saat dibutuhkan.** Saat dibuka, Inventori hanya memuat mutasi 180 hari terakhir (tampilan Ringkasan, Mutasi, dan Laporan memang hanya memakai yang terbaru). Mutasi lebih lama dimuat otomatis sebelum Ekspor cadangan JSON, Pulihkan cadangan, dan Hapus semua, lalu tersimpan di perangkat. Perangkat baru jadi jauh lebih hemat kuota baca.
9. `firestore.rules` kini disimpan di repo, bersama uji emulator (`uji/`: 27 uji Rules/data + 15 uji peramban).

## Urutan pemasangan (penting)
1. Unduh cadangan: ZUI ERP > Pengaturan > Data dan akun > **Unduh cadangan data** (Pemilik).
2. Firebase Console > Firestore > Rules: tempel **seluruh** `firestore.rules` versi ini > **Publish**. Rules baru tetap menerima aplikasi lama untuk Inventori sampai data dipindahkan.
3. **Segera** setelah itu gabungkan ke `main` (GitHub Pages tayang). Selama jeda antara langkah 2 dan 3, Keuangan versi lama tidak bisa mencatat transaksi kas yang sah (Rules mewajibkan saldo akun ikut diperbarui).
4. Pemilik/Admin membuka ZUI ERP lalu Inventori sekali (pemindahan berjalan otomatis; tunggu "Tersinkron ✓"), lalu Keuangan (saldo akun diisi).
5. Minta anggota menutup dan membuka ulang aplikasi (cache baru). Aplikasi lama yang masih terbuka akan gagal menyimpan Inventori (data lama dikunci) sampai dibuka ulang.

Cache service worker naik: sys v47, inv v29, keu v26, mfg v27 (kar tetap v23).

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
