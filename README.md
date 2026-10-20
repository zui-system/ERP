# Zui System: pusat login, perusahaan, anggota, dan peran

Satu project Firebase (**zuisystem**) dipakai semua aplikasi Zui. Zui System mengurus login, perusahaan, anggota, peran, dan jejak aktivitas. Aplikasi lain (Zui Inventori, nanti Manufaktur, Karyawan, Keuangan) membaca perusahaan dan peran dari sini.

## Pasang di Firebase (sekali saja)
1. **Authentication > Sign-in method**: aktifkan **Email/Password** dan **Google**.
2. **Authentication > Settings > Authorized domains**: tambahkan domain GitHub Pages Anda (mis. `namaanda.github.io`).
3. **Firestore Database > Create database** (mode produksi, region terdekat).
4. Tab **Rules**: tempel seluruh isi `firestore.rules` di folder ini (sudah memuat aturan semua modul, termasuk data Inventori per dokumen dan saldo per akun), lalu **Publish**. Rules ini mengamankan data per perusahaan dan peran, jadi jangan dilewati.

## Pasang di GitHub Pages
Satu repo per aplikasi. Unggah `index.html`, `manifest.webmanifest`, `sw.js`, `icon-192.png`, `icon-512.png`, lalu Settings > Pages > Deploy from a branch > main / root.

Bila semua repo ada di akun GitHub yang sama (`namaanda.github.io/zui-system/`, `namaanda.github.io/zui-inventori/`), alamat dasarnya sama sehingga **sekali login berlaku di semua aplikasi**.

## Cara pakai
1. Buka Zui System, daftar (email diverifikasi), masuk, lalu **Buat perusahaan**. Anda menjadi **Pemilik**.
2. Tab **Pengaturan**: atur saklar **Wajib persetujuan dan serah-terima antar divisi** (bawaan: nyala), unggah **Logo** perusahaan (tampil di semua aplikasi) dan isi **Alamat aplikasi** (alamat GitHub Pages tiap aplikasi). Tab **Aplikasi** lalu menampilkan tombol Buka.
3. Tab **Anggota**: undang email karyawan beserta perannya. Orang itu masuk atau mendaftar dengan email tersebut di aplikasi Zui mana pun, lalu otomatis bergabung.
4. Tab **Aktivitas**: riwayat siapa melakukan apa (untuk Pemilik, Admin, Keuangan). Riwayat hanya bisa ditambah, tidak bisa diubah atau dihapus.

## Peran
| Peran | Inventori |
|---|---|
| Pemilik, Admin | Semua modul, termasuk pengaturan dan data |
| Gudang | Barang dan Pembelian (ubah), Ringkasan dan Kontak (lihat) |
| Kasir | Penjualan dan Kontak (ubah), Barang dan Ringkasan (lihat) |
| Keuangan | Penjualan dan Pembelian (ubah, termasuk pembayaran), Laporan, Barang, Kontak, Ringkasan (lihat) |
| Produksi, Mutu | Ringkasan dan Barang (lihat) |

Pemilik tidak bisa diubah atau dikeluarkan oleh siapa pun. Satu akun hanya bisa tergabung di satu perusahaan.

## Batasan yang perlu diketahui
- Rules kini membatasi data Inventori per koleksi dan per peran (lihat tabel di bawah), tetapi pembacaan belum dibedakan per kolom: anggota yang boleh membaca Inventori secara teknis dapat membaca semua isinya, termasuk HPP.
- Perangkat yang pertama kali membuka Inventori membaca seluruh dokumen sekali; berikutnya hanya perubahan sejak terakhir (cache di perangkat).

## Data Inventori per dokumen (sejak v11)
Data Inventori disimpan per baris di koleksi `perusahaan/{cid}/…`:

| Koleksi | Isi | Tulis (selain Pemilik/Admin) |
|---|---|---|
| `barang` | barang | Gudang; Keuangan menambah barang baru dari pembelian; Kasir/Keuangan hanya `stock`, `cost`, `loc` |
| `batch` | batch stok | Gudang; Kasir/Keuangan menambah batch dan mengubah `q` saja |
| `pembelian` | pembelian | Gudang, Keuangan |
| `penjualan` | penjualan | Kasir, Keuangan |
| `mutasi` | riwayat stok | semua peran penulis Inventori, **hanya tambah** |
| `kontak` | vendor (`_t:'v'`) dan pelanggan (`_t:'c'`) | Kasir; Gudang/Keuangan hanya menambah |
| `buang` | batch dibuang | Gudang (tambah) |
| `invtanda` | penanda sekali-pakai: `kd_` pembayaran Keuangan diterapkan, `mi_`/`md_` serah bahan/terima hasil produksi, `no_` nomor nota | semua peran penulis Inventori, tidak bisa diubah |
| `invcfg` | `set` pengaturan Inventori, `v2` penanda data sudah dipindahkan | Pemilik/Admin |

Tiap dokumen memuat `_u` (waktu server, dipakai untuk muat inkremental) dan `_by` (uid penulis). Hapus = tombstone `{_del: true}` agar perangkat lain ikut menghapus. Produksi dan Mutu hanya membaca.

Kode bersama untuk semua modul ada di `zdata.js` (ZINV = data Inventori, ZKAS = saldo kas). Data format lama (`inv/meta` + `invc/0..n`) dipindahkan otomatis saat Inventori, Keuangan, atau ZUI ERP dibuka oleh peran yang dulu boleh menulis Inventori; data lama **tidak dihapus** (tetap sebagai cadangan) tetapi tidak bisa ditulis lagi setelah `invcfg/v2` ada.

## Saldo kas per akun (sejak v11)
`akun/{id}.sal` = jumlah semua transaksi kas sah (di luar saldo awal `awal`). Setiap transaksi kas yang sah, disetujui, atau dihapus wajib memperbarui `sal` di tulisan yang sama (Rules memeriksa besarnya). Akun lama diisi otomatis sekali dari seluruh riwayat kas saat Keuangan atau persetujuan ZUI ERP dibuka. Tidak ada lagi batas 1.500 transaksi untuk saldo.

## Uji
Folder `uji/`: `npm install` lalu `npm run uji` (butuh Java 11+). Menjalankan emulator Firestore + Auth, 25 uji Rules/data dan 14 uji peramban. Lihat `uji/README.md` untuk uji di Firebase asli.

## Menunggu tindakan Anda
Tab Aplikasi menampilkan daftar pekerjaan yang menunggu peran Anda dari semua aplikasi (persetujuan BoM, permintaan bahan, uji mutu, hasil menunggu diterima, pembelian menunggu persetujuan atau konfirmasi keuangan), lengkap dengan tombol Buka ke aplikasinya.


## Zui Keuangan
Rules sudah memuat blok `akun`, `kas`, `bayar`. Kolom Menunggu tindakan memuat "Pengeluaran kas menunggu persetujuan" untuk Pemilik/Admin.

## Zui Karyawan
Rules memuat blok `karyawan`, `absen`, `cuti`. Menunggu tindakan memuat "Cuti menunggu persetujuan" untuk Pemilik/Admin.

## Zui Karyawan
Rules memuat blok `karyawan`, `hadir`, `cuti`. Semua peran bisa membuka Zui Karyawan; Admin/Pemilik melihat tugas "Cuti menunggu persetujuan".

## Pendaftaran dibatasi
Hanya email yang terdaftar di koleksi `izin` yang boleh membuat perusahaan baru. Daftar ini diisi manual lewat Firebase Console (tidak bisa ditulis dari aplikasi):
1. Firebase > Firestore Database > Start collection, ID koleksi `izin`.
2. ID dokumen = email huruf kecil (mis. `info.zuisystem@gmail.com`), isi satu kolom bebas (mis. `ts` angka 1).
3. Tambahkan email Anda sendiri dulu. Perusahaan yang sudah ada tidak terpengaruh.

Karyawan tetap bergabung lewat undangan pemilik, tanpa perlu izin ini.

## Uji coba dan langganan
- Setiap perusahaan baru otomatis mendapat **uji coba 14 hari** sejak dibuat. Setelah itu semua aplikasi Zui terkunci dan Rules menolak penulisan data (data tetap tersimpan).
- Untuk memperpanjang atau mengaktifkan langganan, isi sendiri lewat Firebase Console: Firestore > `perusahaan` > dokumen perusahaan > Add field:
  - `langganan` bertipe **map**, berisi:
    - `paket` (string), mis. `Bulanan`
    - `sampai` bertipe **timestamp**, pilih tanggal berakhirnya
- Perpanjang dengan mengganti `sampai`. Menghapus field `langganan` mengembalikan ke hitungan uji coba.
- Pemilik melihat sisa waktu di Zui System > Pengaturan > Langganan, dan peringatan di tab Aplikasi saat tinggal 7 hari.
- Perusahaan Anda sendiri juga kena aturan ini. **Isi `langganan.sampai` untuk perusahaan Anda sebelum Publish Rules**, kalau tidak terkunci setelah 14 hari sejak dibuat.
- Lama uji coba diubah di `firestore.rules` (angka `1209600000` = 14 hari dalam milidetik).

## Permintaan akses
Email yang belum diizinkan melihat formulir "Kirim permintaan" di layar awal. Permintaan masuk ke Zui Admin untuk disetujui atau ditolak.

## Bahasa dan mata uang

- **Bahasa:** Indonesia, English, Melayu. Pemilik/Admin memilih bahasa bawaan perusahaan di Zui System > Pengaturan > "Bahasa dan mata uang". Tiap anggota boleh memilih bahasanya sendiri di Pengaturan setiap aplikasi (tersimpan di `profil/{uid}.bahasa`, berlaku di semua aplikasi).
- **Mata uang:** Rupiah (IDR), Ringgit Malaysia (MYR), Dolar AS (USD), pilihan perusahaan (`perusahaan/{cid}.mata`). Hanya mengubah simbol dan format angka (IDR tanpa desimal, MYR/USD dua desimal). **Nilai tidak dikonversi**, tidak ada kurs.
- Isi data yang diketik pengguna (nama barang, catatan) tidak diterjemahkan. Cetak/ekspor CSV tetap berformat Indonesia agar impor Manufaktur tetap cocok.
- **Wajib publikasi ulang `firestore.rules`** (kunci baru `bahasa` di `profil` dan `bahasa`, `mata` di `perusahaan`).
- Cache service worker naik: sys v9, inv v7, mfg v4, keu v3, kar v3.

## Pendaftaran uji coba terbuka, tautan otomatis, pasang, bagikan, langganan

- **Daftar sendiri:** email yang sudah diverifikasi bisa membuat perusahaan sendiri dan langsung dapat uji coba 14 hari, tanpa persetujuan. Setelah 14 hari (atau setelah `langganan.sampai` lewat) semua aplikasi terkunci sampai Zui Admin mengisi langganan. Koleksi `izin` dan `permintaan` tidak lagi diperlukan.
- **Tautan aplikasi otomatis:** `https://inventori.`, `manufaktur.`, `keuangan.`, `karyawan.zuisystem.com`. Kolom "Alamat aplikasi" di Pengaturan dihapus. Perusahaan lama otomatis diperbarui saat pemilik/admin membuka Zui System.
- **Pasang:** tombol Pasang di tiap kartu aplikasi membuka aplikasinya dengan spanduk "Pasang"; ada juga di Pengaturan tiap aplikasi (Pasang dan bagikan).
- **Bagikan:** per aplikasi dan "Bagikan semua tautan ke staf".
- **Langganan:** tombol di tab Aplikasi dan Pengaturan membuka email ke info.zuisystem@gmail.com berisi nama perusahaan dan ID. Layar terkunci juga punya tombol Langganan. Pembayaran dan perpanjangan tetap manual lewat Zui Admin.
- Cache SW: sys v11, inv v8, mfg v5, keu v4, kar v4. Publikasikan ulang `firestore.rules`.

## Tab Pantauan (pemilik/admin)
Ringkasan hanya-baca dari semua divisi dalam satu layar: Inventori (nilai stok, menipis, kedaluwarsa 90 hari, penjualan dan laba kotor bulan ini), Pembelian (menunggu Admin / Keuangan / barang), Keuangan (saldo, utang, piutang, lewat jatuh tempo, pengeluaran menunggu), Manufaktur (produksi berjalan, uji mutu, BoM menunggu), Karyawan (hadir, cuti hari ini, cuti menunggu). Tiap blok punya tombol "Buka Zui X".
- Data dibaca langsung dari Firestore perusahaan; dimuat saat tab dibuka (maks. 1x/menit) atau tombol Muat ulang.
- Angka mengikuti rumus aplikasi masing-masing; hasilnya bergantung pada data yang diinput divisi dengan benar.
- Peran selain pemilik/admin melihat pesan bahwa Pantauan hanya untuk Pemilik dan Admin. Rules tidak berubah.
