// Ukur waktu memeriksa perubahan (diff) sebelum simpan, dengan data besar. Tanpa emulator: node ukur-simpan.mjs
import fs from 'node:fs'; import vm from 'node:vm';
globalThis.window = globalThis; globalThis.firebase = { firestore: { Timestamp: class { }, FieldValue: {} } };
vm.runInThisContext(fs.readFileSync(new URL('../zdata.js', import.meta.url), 'utf8'));
const { ZINV } = globalThis, N = +(process.argv[2] || 30000), M = +(process.argv[3] || 200000);
const D = ZINV.blankD();
for (let i = 0; i < N; i++) {
  const id = 'i' + i; D.items.push({ id, name: 'Barang ' + i, tp: 'jadi', size: '', sku: 'S' + i, cat: 'A', unit: 'pcs', stock: 10, min: 1, price: 1000, cost: 500, bpom: '', loc: 'R' });
  D.bt.push({ id: 'b' + id, iid: id, no: 'B' + i, exp: '2027-01-01', q: 10, q0: 10, cost: 500, vid: '', ref: '', ts: i });
}
for (let i = 0; i < M; i++) D.mv.push({ id: 'm' + i, iid: 'i' + (i % N), nm: 'Barang', t: 'out', q: -1, note: 'Penjualan INV-2026-' + i, d: '2026-10-01', ts: i, by: 'Kasir' });
let s = new ZINV.Store({ fs: null, cid: 'c', me: { uid: 'u' }, write: true, getD: () => D, setD: () => { } });
for (const [k, e] of ZINV.explode(D)) s.setB(k, { k: e.k, id: e.id, v: JSON.parse(e.j), j: e.j, u: '' });
const t = (n, f) => { const a = performance.now(); const r = f(); console.log(n.padEnd(34), (performance.now() - a).toFixed(0).padStart(6) + ' ms', r) };
console.log(`${N} barang, ${N} batch, ${M} mutasi`);
t('diff pertama', () => s.diff(D).length);
D.items[5].stock = 9; D.bt[5].q = 9; D.mv.push({ id: 'mx', iid: 'i5', nm: 'B', t: 'out', q: -1, note: '', d: '2026-10-20', ts: 1, by: 'K' });
t('diff setelah 1 penjualan', () => s.diff(D).length);
t('diff lagi (tanpa perubahan baru)', () => s.diff(D).length);
D.items.splice(7, 1);
t('diff setelah hapus 1 barang', () => s.diff(D).map(x => x.k + (x.l ? '' : ':hapus')).join(','));
const mv = D.mv[100]; D.mv[100] = Object.assign({}, mv, { q: -2 });
t('diff mutasi diganti objek baru', () => s.diff(D).length);
