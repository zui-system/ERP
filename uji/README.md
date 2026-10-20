# Uji ZUI ERP

## 1. Uji otomatis dengan Firebase tiruan (emulator)
Butuh Node.js 18+ dan Java 11+.

```
cd uji
npm install
npm run uji        # emulator Firestore + Auth: uji-data.mjs (Rules + zdata.js) lalu uji-e2e.mjs (peramban)
npm run uji:data   # hanya uji Rules dan lapisan data
```
`uji-e2e.mjs` memakai Chromium; atur `CHROMIUM=/path/ke/chrome` bila tidak di `/opt/pw-browsers`.

Yang diuji: pemindahan data lama (1.200 barang, larik bersarang, penanda) tanpa kehilangan, format lama terkunci,
hak akses tiap peran per koleksi, gabung perubahan bersamaan (stok batch), nomor nota kembar, pembayaran tidak
diterapkan dua kali, hapus antar perangkat, perubahan ditolak dikembalikan, saldo kas per akun (catat, setujui,
transfer, hapus, isi dari 2.100 transaksi lama), lalu di peramban: Inventori (pindah, simpan, dua perangkat,
cache, perubahan offline versi lama), Keuangan (saldo dari 1.600 transaksi, bayar utang, terima piutang),
ZUI ERP (setujui kas & pembelian, Pantauan), Manufaktur (stok).

## 2. Uji di Firebase asli sebelum tayang
Aplikasi bisa dijalankan dari komputer sendiri terhadap project `zuisystem` (localhost sudah diizinkan Firebase Auth).
Pakai **perusahaan uji** (akun email terpisah), bukan perusahaan pelanggan.

1. Publish `firestore.rules` versi ini (lihat urutan di CATATAN-PEMBARUAN.md v11).
2. Dari folder repo (cabang ini): `npx http-server -p 5500 -c-1 .` lalu buka `http://localhost:5500/`.
3. Masuk sebagai pemilik perusahaan uji. Bila perlu data lama: buka Inventori versi lama (`main`) dulu,
   isi beberapa barang/pembelian/penjualan, baru buka versi ini.
4. Periksa:
   - Inventori: "Tersinkron ✓"; Firestore Console menampilkan `perusahaan/{cid}/barang`, `batch`, … dan `invcfg/v2`; data lama `inv/meta` masih ada.
   - Tambah barang, pembelian, terima ke gudang, penjualan; buka di HP lain dengan akun Kasir: perubahan tampil sendiri.
   - Kasir: coba ubah harga barang → muncul "Perubahan ditolak server".
   - Keuangan: saldo akun sama dengan sebelum pembaruan; catat kas masuk; ajukan pembayaran utang → setujui di ZUI ERP → utang di Inventori berkurang.
   - ZUI ERP > Pantauan: angka Inventori dan saldo tampil.
   - Manufaktur: stok bahan terbaca.
5. Bila ada masalah: Rules lama ada di riwayat git (`git show 756b36e:firestore.rules`). Data lama tidak dihapus,
   jadi kembali ke versi lama cukup dengan Rules lama + menghapus dokumen `invcfg/v2` di Firestore Console.
