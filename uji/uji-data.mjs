// Uji Firestore Rules + lapisan data (zdata.js) di emulator Firestore.
// Jalankan: npm run uji:data   (butuh Java; emulator dijalankan otomatis oleh firebase-tools)
import { initializeTestEnvironment, assertFails, assertSucceeds } from '@firebase/rules-unit-testing';
import firebase from 'firebase/compat/app';
import 'firebase/compat/firestore';
import fs from 'node:fs';
import vm from 'node:vm';

globalThis.window = globalThis; globalThis.firebase = firebase;
vm.runInThisContext(fs.readFileSync(new URL('../zdata.js', import.meta.url), 'utf8'));
const { ZINV, ZKAS } = globalThis;

const env = await initializeTestEnvironment({
  projectId: 'demo-zui',
  firestore: { rules: fs.readFileSync(new URL('../firestore.rules', import.meta.url), 'utf8'), host: '127.0.0.1', port: 8080 }
});
let ok = 0, bad = 0;
async function t(name, f) {
  try { await f(); ok++; console.log('  ✓ ' + name) } catch (e) { bad++; console.log('  ✗ ' + name + '\n      ' + (e && e.stack || e)) }
}
const eq = (a, b, m) => { const A = JSON.stringify(a), B = JSON.stringify(b); if (A !== B) throw new Error((m || 'beda') + ': ' + A.slice(0, 300) + ' != ' + B.slice(0, 300)) };
const isi = D => [...ZINV.explode(D).entries()].map(([k, e]) => k + '=' + e.j).sort();
const beda = (a, b) => { const A = new Set(isi(a)), B = new Set(isi(b)); return [[...A].filter(x => !B.has(x)).slice(0, 3), [...B].filter(x => !A.has(x)).slice(0, 3)] };
const yes = (v, m) => { if (!v) throw new Error(m || 'harus benar') };

const ROLES = ['pemilik', 'admin', 'gudang', 'kasir', 'keuangan', 'produksi', 'mutu'];
const CID = 'c1';
const db = r => env.authenticatedContext(r, { email: r + '@x.id', email_verified: true }).firestore();
const me = r => ({ uid: r, nama: 'Nama ' + r, peran: r });
const co = f => f.collection('perusahaan').doc(CID);

// data lama contoh: banyak baris, larik bersarang, penanda
function contoh(n) {
  const D = ZINV.blankD();
  for (let i = 0; i < n; i++) {
    const id = 'i' + String(i).padStart(5, '0');
    D.items.push({ id, name: 'Barang ' + i, tp: 'jadi', size: '', sku: 'PRD-' + i, cat: 'A', unit: 'pcs', stock: 10, min: 1, price: 1000 + i, cost: 500, bpom: '', loc: 'R' + i });
    D.bt.push({ id: 'b' + id, iid: id, no: 'B' + i, exp: '2027-01-01', q: 10, q0: 10, cost: 500, vid: 'v1', ref: '', ts: i });
    D.mv.push({ id: 'm' + id, iid: id, nm: 'Barang ' + i, t: 'in', q: 10, note: 'Stok awal', d: '2026-10-01', ts: i, by: 'x' });
  }
  D.vend.push({ id: 'v1', name: 'Vendor', phone: '1', addr: '', note: '' });
  D.cust.push({ id: 'c1x', name: 'Pelanggan', phone: '2', note: '' });
  D.po.push({ id: 'p1', no: 'PO-2026-0001', vid: 'v1', d: '2026-10-01', due: '', lines: [{ iid: 'i00000', q: 2, c: 500 }], paid: 0, st: 'dipesan', by: 'x', bu: 'admin' });
  D.so.push({ id: 's1', no: 'INV-2026-0001', cid: 'c1x', ch: '', d: '2026-10-02', lines: [{ iid: 'i00001', q: 1, p: 1000, bn: [{ no: 'B1', q: 1 }] }], disc: 0, paid: 0, due: '', st: 'selesai', grid: [[1, 2], [3, [4]]] });
  D.wo.push({ id: 'w1', d: '2026-10-03', iid: 'i00002', nm: 'Barang 2', no: 'B2', q: 1, v: 500, by: 'x' });
  D.kasDone = { k1: 100 }; D.mfgIss = { pr1: { isu: [{ sku: 'RM', qty: 1 }], ts: 1, by: 'x' } }; D.mfgDone = ['pr2'];
  D.set = { name: 'Toko', th: 'dark' };
  return D;
}
async function seedOld(D) {
  await env.withSecurityRulesDisabled(async c => {
    const f = c.firestore(), t = JSON.stringify(D), n = Math.ceil(t.length / 250000) || 1;
    for (let i = 0; i < n; i++) await co(f).collection('invc').doc(String(i)).set({ d: t.slice(i * 250000, (i + 1) * 250000) });
    await co(f).collection('inv').doc('meta').set({ n, u: 5, by: 'x' });
  });
}
async function seedCo() {
  await env.clearFirestore();
  await env.withSecurityRulesDisabled(async c => {
    const f = c.firestore();
    await co(f).set({ nama: 'PT Uji', owner: 'pemilik', ts: Date.now(), alur: true });
    for (const r of ROLES) await co(f).collection('anggota').doc(r).set({ email: r + '@x.id', nama: 'Nama ' + r, peran: r, aktif: true, ts: 1 });
  });
}
const S = (r, D0) => { let D = D0; const s = new ZINV.Store({ fs: db(r), cid: CID, me: me(r), write: true, ro: ['pemilik', 'admin'].includes(r) ? [] : ['set'], getD: () => D, setD: x => { D = x }, onNote: () => { } }); s.cur0 = () => D; return s };

console.log('Pemindahan data');
await seedCo();
const OLD = contoh(1200);
await seedOld(OLD);
await t('peran Produksi tidak memindahkan, membaca format lama', async () => {
  eq(await ZINV.ensure(db('produksi'), CID, me('produksi')), 'old');
  const v = await ZINV.view({ fs: db('produksi'), cid: CID, me: me('produksi'), kinds: ['items'] });
  eq(v.mode, 'old'); eq(v.D.items.length, 1200); v.stop();
});
await t('Kasir memindahkan data lama tanpa kehilangan (1.200 barang, larik bersarang, penanda)', async () => {
  eq(await ZINV.ensure(db('kasir'), CID, me('kasir')), 'v2');
  const s = S('kasir'); const D = await s.open();
  eq(beda(D, Object.assign(ZINV.blankD(), JSON.parse(JSON.stringify(OLD)))), [[], []], 'isi setelah pindah');
  const v = (await co(db('kasir')).collection('invcfg').doc('v2').get()).data();
  eq(v.n, 1200 * 3 + 2 + 1 + 1 + 1 + 3 + 1);
});
await t('format lama dikunci setelah pindah', async () => {
  await assertFails(co(db('admin')).collection('inv').doc('meta').set({ n: 1, u: 9, by: 'admin' }));
  await assertFails(co(db('admin')).collection('invc').doc('0').set({ d: '{}' }));
});
await t('ensure kedua kali langsung v2', async () => eq(await ZINV.ensure(db('admin'), CID, me('admin')), 'v2'));

console.log('Hak akses per peran');
const put = (r, col, id, data) => co(db(r)).collection(col).doc(id).set(Object.assign({}, data, { _u: firebase.firestore.FieldValue.serverTimestamp(), _by: r }));
const upd = (r, col, id, data) => co(db(r)).collection(col).doc(id).update(Object.assign({}, data, { _u: firebase.firestore.FieldValue.serverTimestamp(), _by: r }));
await t('Kasir: ubah stok barang boleh, ubah harga ditolak', async () => {
  await assertSucceeds(upd('kasir', 'barang', 'i00000', { stock: 9 }));
  await assertFails(upd('kasir', 'barang', 'i00000', { price: 1 }));
  await assertFails(put('kasir', 'barang', 'baru1', { name: 'x' }));
  await assertFails(upd('kasir', 'barang', 'i00000', { _del: true }));
});
await t('Kasir: batch hanya jumlah; penjualan boleh; pembelian ditolak', async () => {
  await assertSucceeds(upd('kasir', 'batch', 'bi00000', { q: 9 }));
  await assertFails(upd('kasir', 'batch', 'bi00000', { cost: 1 }));
  await assertSucceeds(put('kasir', 'penjualan', 's2', { no: 'INV-2026-0002', lines: [] }));
  await assertFails(put('kasir', 'pembelian', 'p2', { no: 'PO-2026-0002', lines: [] }));
});
await t('Gudang: barang & pembelian boleh, penjualan ditolak, kontak hanya tambah', async () => {
  await assertSucceeds(upd('gudang', 'barang', 'i00000', { price: 5 }));
  await assertSucceeds(put('gudang', 'pembelian', 'p3', { no: 'PO-2026-0003', lines: [] }));
  await assertFails(upd('gudang', 'penjualan', 's1', { paid: 1 }));
  await assertSucceeds(put('gudang', 'kontak', 'v2', { name: 'V2', _t: 'v' }));
  await assertFails(upd('gudang', 'kontak', 'v1', { name: 'Ubah' }));
});
await t('Keuangan: barang baru dari pembelian boleh, ubah harga ditolak', async () => {
  await assertSucceeds(put('keuangan', 'barang', 'baru2', { name: 'Baru', stock: 0 }));
  await assertFails(upd('keuangan', 'barang', 'i00000', { price: 7 }));
  await assertSucceeds(upd('keuangan', 'pembelian', 'p1', { paid: 100 }));
  await assertSucceeds(upd('keuangan', 'penjualan', 's1', { paid: 100 }));
});
await t('Produksi & Mutu: hanya baca', async () => {
  for (const r of ['produksi', 'mutu']) {
    await assertSucceeds(co(db(r)).collection('barang').doc('i00000').get());
    await assertFails(upd(r, 'barang', 'i00000', { stock: 1 }));
    await assertFails(put(r, 'mutasi', 'mx' + r, { q: 1 }));
  }
});
await t('Mutasi hanya bisa ditambah (kecuali Pemilik/Admin)', async () => {
  await assertSucceeds(put('kasir', 'mutasi', 'mk1', { q: 1 }));
  await assertFails(upd('kasir', 'mutasi', 'mk1', { q: 2 }));
  await assertFails(upd('gudang', 'mutasi', 'mk1', { _del: true }));
  await assertSucceeds(upd('admin', 'mutasi', 'mk1', { q: 3 }));
});
await t('Penanda tidak bisa diubah; _u wajib waktu server; hapus asli ditolak', async () => {
  await assertSucceeds(co(db('kasir')).collection('invtanda').doc('kd_zz').set({ v: 1, _u: firebase.firestore.FieldValue.serverTimestamp(), _by: 'kasir' }));
  await assertFails(co(db('kasir')).collection('invtanda').doc('kd_zz').set({ v: 2, _u: firebase.firestore.FieldValue.serverTimestamp(), _by: 'kasir' }));
  await assertFails(co(db('gudang')).collection('barang').doc('i00000').update({ price: 5, _u: firebase.firestore.Timestamp.fromMillis(1), _by: 'gudang' }));
  await assertFails(co(db('admin')).collection('barang').doc('i00000').delete());
  await assertFails(co(db('admin')).collection('invcfg').doc('v2').delete());
});
await t('Pengaturan Inventori hanya Pemilik/Admin', async () => {
  await assertFails(put('gudang', 'invcfg', 'set', { v: { name: 'x' } }));
  await assertSucceeds(put('admin', 'invcfg', 'set', { v: { name: 'Toko', th: 'dark' } }));
});

console.log('Sinkron antar perangkat');
await t('dua kasir menjual dari batch yang sama bersamaan: kedua pengurangan tersimpan', async () => {
  const a = S('kasir'), b = S('keuangan'); const Da = await a.open(), Db = await b.open();
  a.setD(Da); b.setD(Db);
  const q0 = Da.bt.find(x => x.id === 'bi00005').q;
  for (const [s, D, n] of [[a, Da, 2], [b, Db, 3]]) { const x = D.bt.find(x => x.id === 'bi00005'); x.q -= n; D.items.find(i => i.id === 'i00005').stock -= n }
  await Promise.all([a.push(), b.push()]);
  const c = S('admin'); const Dc = await c.open();
  eq(Dc.bt.find(x => x.id === 'bi00005').q, q0 - 5, 'batch'); eq(Dc.items.find(x => x.id === 'i00005').stock, 10 - 5, 'stok');
  await a.catchUp(a.cur0()); await b.catchUp(b.cur0());
  eq([a.cur0().bt.find(x => x.id === 'bi00005').q, b.cur0().bt.find(x => x.id === 'bi00005').q], [q0 - 5, q0 - 5], 'kedua perangkat tergabung');
  yes(!a.dirty() && !b.dirty(), 'tidak ada sisa perubahan');
});
await t('nomor nota sama dari dua perangkat: satu diganti otomatis', async () => {
  const a = S('kasir'), b = S('keuangan'); const Da = await a.open(), Db = await b.open(); a.setD(Da); b.setD(Db);
  Da.so.push({ id: 'sa', no: 'INV-2026-0100', lines: [], paid: 0 }); Db.so.push({ id: 'sb', no: 'INV-2026-0100', lines: [], paid: 0 });
  await a.push(); await b.push();
  const c = S('admin'); const Dc = await c.open();
  const nos = Dc.so.filter(x => x.id === 'sa' || x.id === 'sb').map(x => x.no).sort();
  eq(nos, ['INV-2026-0100', 'INV-2026-0101']);
});
await t('penanda sama dari dua perangkat (bayar diterapkan dua kali) ditolak sebagai bentrok', async () => {
  const a = S('kasir'), b = S('admin'); const Da = await a.open(), Db = await b.open(); a.setD(Da); b.setD(Db);
  for (const D of [Da, Db]) { D.kasDone.kb9 = 100; const s = D.so.find(x => x.id === 's1'); s.paid += 100 }
  let note = ''; b.onNote = m => { note = m };
  await a.push(); await b.push();
  yes(/bentrok/.test(note), 'pesan bentrok');
  const c = S('admin'); const Dc = await c.open();
  eq(Dc.so.find(x => x.id === 's1').paid, Da.so.find(x => x.id === 's1').paid, 'dibayar sekali');
});
await t('hapus di satu perangkat, ubah di perangkat lain: perubahan dipertahankan; hapus tersinkron', async () => {
  const a = S('admin'), b = S('gudang'); const Da = await a.open(), Db = await b.open(); a.setD(Da); b.setD(Db);
  Da.vend = Da.vend.filter(v => v.id !== 'v2'); Da.items = Da.items.filter(i => i.id !== 'i00010');
  await a.push();
  const c = S('kasir'); const Dc = await c.open();
  yes(!Dc.vend.some(v => v.id === 'v2'), 'vendor terhapus'); yes(!Dc.items.some(i => i.id === 'i00010'), 'barang terhapus');
  yes(Dc.cust.some(v => v.id === 'c1x'), 'pelanggan tetap');
});
await t('pendengar menerima perubahan perangkat lain', async () => {
  const a = S('kasir'); const Da = await a.open(); a.setD(Da); let got = 0; a.onChange = () => { got++ }; a.listen();
  const b = S('gudang'); const Db = await b.open(); b.setD(Db); Db.items.find(i => i.id === 'i00020').price = 4242; await b.push();
  for (let i = 0; i < 50 && a.cur0().items.find(i => i.id === 'i00020').price !== 4242; i++) await new Promise(r => setTimeout(r, 100));
  a.stop(); eq(a.cur0().items.find(i => i.id === 'i00020').price, 4242); yes(got > 0);
});
await t('ditolak server (peran): perubahan lokal dikembalikan', async () => {
  const a = S('kasir'); const Da = await a.open(); a.setD(Da); Da.items.find(i => i.id === 'i00030').price = 1;
  let note = ''; a.onNote = m => { note = m };
  await a.push().catch(e => { if (e.code !== 'permission-denied') throw e });
  yes(/ditolak/.test(note)); eq(a.cur0().items.find(i => i.id === 'i00030').price, 1030);
});

console.log('Modul lain');
await t('editDoc: Admin menyetujui pembelian', async () => {
  const p = await ZINV.editDoc(db('admin'), CID, me('admin'), 'po', 'p1', p => { p.st = 'disetujui' });
  eq(p.st, 'disetujui');
});
await t('applyPay: pembayaran Keuangan diterapkan sekali', async () => {
  await env.withSecurityRulesDisabled(async c => co(c.firestore()).collection('bayar').doc('k77').set({ t: 'po', i: 'p1', no: 'PO-2026-0001', a: 300, tgl: '2026-10-05', by: 'K', uid: 'keuangan', ts: 1, pend: true }));
  const r1 = await ZINV.applyPay(db('keuangan'), CID, me('keuangan'), 'k77', s => 0, () => '2026-10-05');
  const r2 = await ZINV.applyPay(db('keuangan'), CID, me('keuangan'), 'k77', s => 0, () => '2026-10-05');
  yes(r1 && !r2);
  const v = await ZINV.view({ fs: db('keuangan'), cid: CID, me: me('keuangan'), kinds: ['po', 'kd'] }); v.stop();
  const p = v.D.po.find(x => x.id === 'p1'); eq(p.paid, 100 + 300); eq(v.D.kasDone.k77, 300);
});
await t('view hanya-baca memuat koleksi yang diminta', async () => {
  const v = await ZINV.view({ fs: db('produksi'), cid: CID, me: me('produksi'), kinds: ['items'] }); v.stop();
  eq(v.mode, 'v2'); yes(v.D.items.length >= 1199); eq(v.D.so.length, 0);
});

console.log('Saldo kas per akun');
const kasDoc = (o) => Object.assign({ tgl: '2026-10-10', akun2: '', kat: '', ket: '', rf: null, apv: null, by: 'K', ts: Date.now(), mod: Date.now() }, o);
await t('akun baru sal 0; kas masuk sah wajib memperbarui saldo', async () => {
  const f = db('keuangan'), c = co(f);
  await assertSucceeds(c.collection('akun').doc('a1').set({ nama: 'Kas', tipe: 'kas', awal: 1000, aktif: true, by: 'K', uid: 'keuangan', ts: 1, mod: 1, sal: 0, lk: '' }));
  await assertSucceeds(c.collection('akun').doc('a2').set({ nama: 'Bank', tipe: 'bank', awal: 0, aktif: true, by: 'K', uid: 'keuangan', ts: 1, mod: 1, sal: 0, lk: '' }));
  const k = kasDoc({ jenis: 'masuk', akun: 'a1', jml: 500, st: 'disetujui', uid: 'keuangan' });
  await assertFails(c.collection('kas').doc('x1').set(k));
  const b = f.batch(); b.set(c.collection('kas').doc('x1'), k); ZKAS.salOps(b, c, 'x1', null, k); await assertSucceeds(b.commit());
  const b2 = f.batch(); const k2 = kasDoc({ jenis: 'masuk', akun: 'a1', jml: 10, st: 'disetujui', uid: 'keuangan' });
  b2.set(c.collection('kas').doc('x2'), k2); b2.update(c.collection('akun').doc('a1'), { sal: firebase.firestore.FieldValue.increment(999), lk: 'x2', mod: 2 });
  await assertFails(b2.commit());
});
await t('pengeluaran menunggu tidak mengubah saldo; disetujui Admin mengubah saldo', async () => {
  const fk = db('keuangan'), ck = co(fk), k = kasDoc({ jenis: 'keluar', akun: 'a1', jml: 200, st: 'menunggu', uid: 'keuangan' });
  await assertSucceeds(ck.collection('kas').doc('x3').set(k));
  const fa = db('admin'), ca = co(fa), after = Object.assign({}, k, { st: 'disetujui' });
  await assertFails(ca.collection('kas').doc('x3').update({ st: 'disetujui', apv: { uid: 'admin' }, mod: 3 }));
  const b = fa.batch(); b.update(ca.collection('kas').doc('x3'), { st: 'disetujui', apv: { uid: 'admin' }, mod: 3 }); ZKAS.salOps(b, ca, 'x3', k, after); await assertSucceeds(b.commit());
});
await t('transfer antar akun dan hapus transaksi sah', async () => {
  const f = db('pemilik'), c = co(f), k = kasDoc({ jenis: 'transfer', akun: 'a1', akun2: 'a2', jml: 50, st: 'disetujui', uid: 'pemilik' });
  const b = f.batch(); b.set(c.collection('kas').doc('x4'), k); ZKAS.salOps(b, c, 'x4', null, k); await assertSucceeds(b.commit());
  await assertFails(c.collection('kas').doc('x1').delete());
  const fa = db('admin'), ca = co(fa), x1 = (await ca.collection('kas').doc('x1').get()).data();
  const b2 = fa.batch(); b2.delete(ca.collection('kas').doc('x1')); ZKAS.salOps(b2, ca, 'x1', x1, null); await assertSucceeds(b2.commit());
  const a1 = (await c.collection('akun').doc('a1').get()).data(), a2 = (await c.collection('akun').doc('a2').get()).data();
  eq([ZKAS.salOf(a1), ZKAS.salOf(a2)], [1000 - 200 - 50, 50]);
});
await t('akun lama tanpa sal: diisi dari seluruh riwayat (lebih dari 1.500 transaksi)', async () => {
  await env.withSecurityRulesDisabled(async cc => {
    const f = cc.firestore(), c = co(f);
    await c.collection('akun').doc('lama').set({ nama: 'Lama', tipe: 'kas', awal: 5, aktif: true, by: 'K', uid: 'k', ts: 1, mod: 1 });
    for (let i = 0; i < 2100; i += 400) { const b = f.batch(); for (let j = i; j < Math.min(2100, i + 400); j++) b.set(c.collection('kas').doc('L' + j), kasDoc({ jenis: j % 3 ? 'masuk' : 'keluar', akun: 'lama', jml: 2, st: j % 7 ? 'disetujui' : 'menunggu', uid: 'k', ts: j })); await b.commit() }
    await c.collection('kas').doc('Lx').set({ jenis: 'masuk', akun: 'lama', jml: 1, tgl: '2020-01-01' });
  });
  const f = db('keuangan'), c = co(f);
  // sebelum diisi, transaksi sah ke akun ini ditolak
  const k = kasDoc({ jenis: 'masuk', akun: 'lama', jml: 1, st: 'disetujui', uid: 'keuangan' });
  const b = f.batch(); b.set(c.collection('kas').doc('y1'), k); ZKAS.salOps(b, c, 'y1', null, k); await assertFails(b.commit());
  const ak = (await c.collection('akun').get()).docs.map(d => Object.assign({ id: d.id }, d.data()));
  eq(await ZKAS.salInit(f, CID, ak), 1);
  let exp = 1; for (let j = 0; j < 2100; j++) if (j % 7) exp += j % 3 ? 2 : -2;
  const a = (await c.collection('akun').doc('lama').get()).data(); eq(a.sal, exp); eq(ZKAS.salOf(a), exp + 5);
  const b3 = f.batch(); b3.set(c.collection('kas').doc('y1'), k); ZKAS.salOps(b3, c, 'y1', null, k); await assertSucceeds(b3.commit());
  await assertFails(c.collection('akun').doc('lama').update({ sal: 0, lk: '', mod: 1 }));
});

await env.cleanup();
console.log(`\n${ok} lulus, ${bad} gagal`);
process.exit(bad ? 1 : 0);
