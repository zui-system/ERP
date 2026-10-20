// Uji peramban (Chromium) untuk Inventori, Keuangan, ZUI ERP, Manufaktur dengan emulator Firestore + Auth.
// Jalankan: npm run uji   (emulator dijalankan otomatis). Skrip Firebase dari node_modules, diarahkan ke emulator.
import { chromium } from 'playwright-core';
import { initializeTestEnvironment } from '@firebase/rules-unit-testing';
import firebase from 'firebase/compat/app';
import 'firebase/compat/firestore';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(new URL('..', import.meta.url).pathname), NM = path.resolve(new URL('node_modules/firebase', import.meta.url).pathname);
const PROJECT = 'zuisystem', AUTHP = 'demo-zui', CID = 'co1', PW = 'Rahasia123';
const HOOK = `;(function(){var o=firebase.initializeApp;firebase.initializeApp=function(){var a=o.apply(this,arguments);a.firestore().useEmulator('127.0.0.1',8080);a.auth().useEmulator('http://127.0.0.1:9099',{disableWarnings:true});return a}})();`;

// server statis untuk folder repo
const MT = { '.html': 'text/html', '.js': 'text/javascript', '.json': 'application/json', '.webmanifest': 'application/manifest+json', '.png': 'image/png' };
const srv = http.createServer((q, r) => {
  let p = decodeURIComponent(new URL(q.url, 'http://x').pathname); if (p.endsWith('/')) p += 'index.html';
  const f = path.join(ROOT, p); if (!f.startsWith(ROOT) || !fs.existsSync(f)) { r.writeHead(404); r.end(); return }
  r.writeHead(200, { 'content-type': MT[path.extname(f)] || 'application/octet-stream' }); fs.createReadStream(f).pipe(r);
}).listen(8765);

let ok = 0, bad = 0;
async function t(name, f) { try { await f(); ok++; console.log('  ✓ ' + name) } catch (e) { bad++; console.log('  ✗ ' + name + '\n      ' + (e && e.stack || e).split('\n').slice(0, 4).join('\n      ')) } }
const yes = (v, m) => { if (!v) throw new Error(m || 'harus benar') };
const eq = (a, b, m) => { if (JSON.stringify(a) !== JSON.stringify(b)) throw new Error((m || 'beda') + ': ' + JSON.stringify(a) + ' != ' + JSON.stringify(b)) };
const wait = async (page, fn, arg, ms = 20000) => { await page.waitForFunction(fn, arg, { timeout: ms, polling: 200 }) };

// akun di emulator Auth (email terverifikasi)
const AU = 'http://127.0.0.1:9099/identitytoolkit.googleapis.com/v1';
async function user(email) {
  const r = await (await fetch(AU + '/accounts:signUp?key=k', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ email, password: PW, returnSecureToken: true }) })).json();
  await fetch(AU + '/projects/' + AUTHP + '/accounts:update', { method: 'POST', headers: { 'content-type': 'application/json', authorization: 'Bearer owner' }, body: JSON.stringify({ localId: r.localId, emailVerified: true }) });
  return r.localId;
}
await fetch('http://127.0.0.1:9099/emulator/v1/projects/' + AUTHP + '/accounts', { method: 'DELETE' });
const env = await initializeTestEnvironment({ projectId: PROJECT, firestore: { host: '127.0.0.1', port: 8080, rules: fs.readFileSync(path.join(ROOT, 'firestore.rules'), 'utf8') } });
await env.clearFirestore();
const U = {}; for (const r of ['pemilik', 'kasir', 'keuangan', 'gudang']) U[r] = await user(r + '@uji.id');

// data lama: format satu JSON (inv/meta + invc), akun kas tanpa saldo tersimpan + 1.600 transaksi
const OLD = { items: [], mv: [], vend: [{ id: 'v1', name: 'CV Vendor', phone: '', addr: '', note: '' }], po: [], bt: [], cust: [{ id: 'c1', name: 'Toko Pelanggan', phone: '', note: '' }], so: [], wo: [], mfgDone: [], mfgIss: {}, kasDone: {}, set: { name: 'Toko uji', th: 'auto' }, u: 7 };
for (let i = 0; i < 300; i++) {
  const id = 'it' + String(i).padStart(4, '0');
  OLD.items.push({ id, name: 'Barang ' + i, tp: i % 3 ? 'jadi' : 'bahan', size: '', sku: 'SKU-' + i, cat: 'Umum', unit: 'pcs', stock: 20, min: 5, price: 10000, cost: 4000, bpom: '', loc: 'Rak' });
  OLD.bt.push({ id: 'bt' + id, iid: id, no: 'B-' + i, exp: '2027-06-01', q: 20, q0: 20, cost: 4000, vid: 'v1', ref: '', ts: i });
  OLD.mv.push({ id: 'mv' + id, iid: id, nm: 'Barang ' + i, t: 'in', q: 20, note: 'Stok awal', d: '2026-10-01', ts: i, by: 'Pemilik' });
}
for (let i = 0; i < 20; i++) OLD.mv.push({ id: 'mvlama' + String(i).padStart(2, '0'), iid: 'it0000', nm: 'Barang 0', t: 'in', q: 1, note: 'mutasi lama', d: '2025-03-01', ts: i, by: 'Pemilik' });
OLD.mv.sort((a, b) => a.id < b.id ? -1 : 1);
OLD.po.push({ id: 'po1', no: 'PO-2026-0001', vid: 'v1', d: '2026-10-02', due: '2026-10-30', lines: [{ iid: 'it0001', q: 10, c: 4000 }], paid: 0, st: 'diterima', by: 'Pemilik', bu: U.pemilik });
OLD.po.push({ id: 'po2', no: 'PO-2026-0002', vid: 'v1', d: '2026-10-03', due: '', lines: [{ iid: 'it0002', q: 5, c: 4000 }], paid: 0, st: 'draf', by: 'Gudang', bu: U.gudang });
OLD.so.push({ id: 'so1', no: 'INV-2026-0001', cid: 'c1', ch: '', d: '2026-10-04', lines: [{ iid: 'it0003', q: 2, p: 10000, bn: [{ no: 'B-3', q: 2 }] }], disc: 0, paid: 0, due: '', st: 'selesai' });
await env.withSecurityRulesDisabled(async c => {
  const f = c.firestore(), co = f.collection('perusahaan').doc(CID);
  await co.set({ nama: 'PT Uji Besar', owner: U.pemilik, ts: Date.now(), alur: true, apps: { inventori: 'x', keuangan: 'x' } });
  for (const r in U) {
    await co.collection('anggota').doc(U[r]).set({ email: r + '@uji.id', nama: 'Nama ' + r, peran: r, aktif: true, ts: 1 });
    await f.collection('profil').doc(U[r]).set({ cid: CID });
  }
  const t = JSON.stringify(OLD); await co.collection('invc').doc('0').set({ d: t }); await co.collection('inv').doc('meta').set({ n: 1, u: 7, by: 'x' });
  await co.collection('akun').doc('ak1').set({ nama: 'Kas toko', tipe: 'kas', awal: 100000, aktif: true, by: 'x', uid: 'x', ts: 1, mod: 1 });
  for (let i = 0; i < 1600; i += 400) {
    const b = f.batch();
    for (let j = i; j < i + 400; j++) b.set(co.collection('kas').doc('k' + String(j).padStart(5, '0')), { tgl: '2026-09-01', jenis: 'masuk', akun: 'ak1', akun2: '', jml: 1000, kat: 'Penjualan', ket: '', rf: null, st: 'disetujui', apv: null, by: 'x', uid: 'x', ts: j, mod: j });
    await b.commit();
  }
});
const adminDb = async f => env.withSecurityRulesDisabled(async c => f(c.firestore().collection('perusahaan').doc(CID)));
const get = async (col, id) => { let v; await adminDb(async co => { const s = await co.collection(col).doc(id).get(); v = s.exists ? s.data() : null }); return v };

const browser = await chromium.launch({ executablePath: process.env.CHROMIUM || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome', args: ['--no-sandbox'] });
const errs = [];
async function open(role, url, init, arg) {
  const ctx = await browser.newContext(); if (init) await ctx.addInitScript(init, arg); const page = await ctx.newPage();
  await ctx.route(/gstatic\.com\/firebasejs\/.*\/(firebase-[a-z]+-compat\.js)/, async (r) => {
    const n = r.request().url().match(/(firebase-[a-z]+-compat\.js)/)[1];
    let b = fs.readFileSync(path.join(NM, n), 'utf8'); if (n === 'firebase-firestore-compat.js') b += HOOK;
    await r.fulfill({ status: 200, contentType: 'text/javascript', body: b });
  });
  await ctx.route(/fonts\.(googleapis|gstatic)\.com/, r => r.abort());
  page.on('pageerror', e => errs.push(role + ' ' + url + ': ' + e.message));
  await page.goto('http://127.0.0.1:8765' + url);
  await wait(page, () => window.FA || (typeof FA !== 'undefined' && FA));
  await page.evaluate(([e, p]) => FA.signInWithEmailAndPassword(e, p), [role + '@uji.id', PW]);
  return { ctx, page };
}

console.log('Inventori');
const own = await open('pemilik', '/inventori/');
await t('Pemilik membuka Inventori: data lama dipindahkan otomatis, semua baris ada', async () => {
  await wait(own.page, () => typeof ZS !== 'undefined' && ZS && /Tersinkron/.test(SY), null, 60000);
  eq(await own.page.evaluate(() => [D.items.length, D.bt.length, D.mv.length, D.po.length, D.so.length, D.set.name]), [300, 300, 300, 2, 1, 'Toko uji']);
  const v = await get('invcfg', 'v2'); yes(v && v.n === 300 * 3 + 20 + 2 + 1 + 2 + 1, 'penanda v2 ' + JSON.stringify(v));
  yes(await get('mutasi', 'mvlama00'), 'mutasi lama ikut dipindahkan');
  yes(await get('inv', 'meta'), 'data lama tetap ada sebagai cadangan');
});
await t('Pemilik mengeluarkan stok: batch, barang, mutasi tersimpan per dokumen', async () => {
  await own.page.evaluate(() => { move('it0010', 'out', 3, 'uji keluar'); save(); return pushNow() });
  await wait(own.page, () => !PB && !dirty());
  eq((await get('batch', 'btit0010')).q, 17); eq((await get('barang', 'it0010')).stock, 17);
  const mv = await own.page.evaluate(() => D.mv.filter(m => m.note === 'uji keluar').map(m => m.id));
  yes(mv.length === 1 && (await get('mutasi', mv[0])).q === -3);
});
const kas = await open('kasir', '/inventori/');
await t('Kasir: penjualan dari batch yang sama bersamaan dengan Pemilik tetap tergabung', async () => {
  await wait(kas.page, () => typeof ZS !== 'undefined' && ZS && /Tersinkron/.test(SY), null, 60000);
  await Promise.all([
    kas.page.evaluate(() => { move('it0020', 'out', 4, 'jual kasir'); save(); return pushNow() }),
    own.page.evaluate(() => { move('it0020', 'out', 5, 'pakai pemilik'); save(); return pushNow() })]);
  await wait(kas.page, () => !PB && !dirty()); await wait(own.page, () => !PB && !dirty());
  eq((await get('batch', 'btit0020')).q, 11, 'batch');
  await wait(kas.page, () => D.bt.find(b => b.id === 'btit0020').q === 11);
  await wait(own.page, () => D.bt.find(b => b.id === 'btit0020').q === 11);
});
await t('Kasir mengubah harga barang: ditolak server, dikembalikan', async () => {
  await kas.page.evaluate(() => { D.items.find(i => i.id === 'it0030').price = 1; save(); return pushNow() });
  await wait(kas.page, () => D.items.find(i => i.id === 'it0030').price === 10000);
  eq((await get('barang', 'it0030')).price, 10000);
});
await t('Perubahan Pemilik tampil di perangkat Kasir tanpa membuka ulang', async () => {
  await own.page.evaluate(() => { D.items.find(i => i.id === 'it0040').name = 'Nama Baru'; save(); return pushNow() });
  await wait(kas.page, () => D.items.find(i => i.id === 'it0040').name === 'Nama Baru');
});
await t('Muat ulang: data dari cache perangkat + perubahan terbaru', async () => {
  await adminDb(co => co.collection('barang').doc('it0050').update({ name: 'Diubah server', _u: firebase.firestore.FieldValue.serverTimestamp() }));
  await kas.page.reload();
  await wait(kas.page, () => typeof FA !== 'undefined' && FA);
  await wait(kas.page, () => typeof ZS !== 'undefined' && ZS && /Tersinkron/.test(SY), null, 60000);
  eq(await kas.page.evaluate(() => [D.items.length, D.items.find(i => i.id === 'it0050').name, D.bt.find(b => b.id === 'btit0020').q]), [300, 'Diubah server', 11]);
});

await t('Mutasi lebih dari 180 hari tidak dimuat saat dibuka; dimuat lengkap sebelum ekspor', async () => {
  eq(await kas.page.evaluate(() => [D.mv.filter(m => m.note === 'mutasi lama').length, zFull()]), [0, false]);
  eq(await kas.page.evaluate(() => zOld().then(() => [D.mv.filter(m => m.note === 'mutasi lama').length, zFull(), dirty()])), [20, true, false]);
  const ids = await kas.page.evaluate(() => D.mv.map(m => m.id)); eq(ids.slice().sort(), ids, 'urutan mutasi');
  yes((await get('mutasi', 'mvlama00'))._del !== true, 'tidak terhapus');
});

console.log('Keuangan');
const keu = await open('keuangan', '/keuangan/');
await t('Saldo akun lama diisi dari seluruh 1.600 transaksi (bukan 1.500 terakhir)', async () => {
  await wait(keu.page, () => typeof AKN !== 'undefined' && AKN.length && typeof AKN[0].sal === 'number', null, 30000);
  eq(await keu.page.evaluate(() => saldo(AKN[0])), 100000 + 1600 * 1000);
});
await t('Bayar utang pembelian dari Keuangan: kas, saldo, dan Inventori diperbarui', async () => {
  await wait(keu.page, () => INV.ok && INV.po.length === 2, null, 30000);
  await keu.page.evaluate(async () => {
    const m = Date.now(), id = uid(), rec = { tgl: today(), jenis: 'keluar', akun: 'ak1', akun2: '', jml: 15000, kat: 'Pembayaran utang', ket: '', rf: { t: 'po', i: 'po1', no: 'PO-2026-0001', nm: 'CV Vendor' }, st: 'menunggu', apv: null, by: ME.nama, uid: ME.uid, ts: m, mod: m };
    await putKas(id, rec, null); window.__kid = id;
  });
  const kid = await keu.page.evaluate(() => window.__kid);
  eq((await get('kas', kid)).st, 'menunggu');
  // Pemilik menyetujui dari ZUI ERP (pengeluaran perlu persetujuan)
  const erp = await open('pemilik', '/');
  await wait(erp.page, () => typeof AP !== 'undefined' && AP.kas && AP.kas.some(k => k.id === window.__k), null, 30000).catch(() => { });
  await erp.page.evaluate(k => { window.__k = k }, kid);
  await wait(erp.page, () => typeof AP !== 'undefined' && AP.kas && AP.kas.some(k => k.id === window.__k), null, 30000);
  await wait(erp.page, () => typeof APR !== 'undefined' && APR.some(x => x.k === 'kas:' + window.__k), null, 30000);
  eq(await erp.page.evaluate(k => apDo('kas:' + k, true), kid), true);
  eq((await get('kas', kid)).st, 'disetujui');
  eq((await get('akun', 'ak1')).sal, 1600 * 1000 - 15000);
  await wait(own.page, () => D.po.find(p => p.id === 'po1').paid === 15000, null, 30000);
  eq((await get('pembelian', 'po1')).paid, 15000);
  await wait(keu.page, () => saldo(AKN[0]) === 100000 + 1600 * 1000 - 15000, null, 20000);
  console.log('Persetujuan dan Pantauan ZUI ERP');
  await t('ZUI ERP: setujui pembelian tahap 1 langsung ke dokumen pembelian', async () => {
    await wait(erp.page, () => APR.some(x => x.k === 'po1:po2'), null, 30000);
    eq(await erp.page.evaluate(() => apDo('po1:po2', true)), true);
    eq((await get('pembelian', 'po2')).st, 'disetujui');
    await wait(own.page, () => D.po.find(p => p.id === 'po2').st === 'disetujui', null, 20000);
  });
  await t('ZUI ERP Pantauan membaca Inventori dan saldo baru', async () => {
    await erp.page.evaluate(() => ldPantau());
    const p = await erp.page.evaluate(() => PAN);
    yes(p.inv && p.inv.nilai > 0, 'nilai stok ' + JSON.stringify(p.inv));
    eq(p.keu.saldo, 100000 + 1600 * 1000 - 15000);
    eq(p.beli.kf, 1);
  });
  await erp.ctx.close();
});
await t('Terima piutang: penerimaan langsung sah, diterapkan ke penjualan sekali', async () => {
  await keu.page.evaluate(async () => {
    const m = Date.now(), id = uid(), rec = { tgl: today(), jenis: 'masuk', akun: 'ak1', akun2: '', jml: 20000, kat: 'Penerimaan piutang', ket: '', rf: { t: 'so', i: 'so1', no: 'INV-2026-0001', nm: 'Toko' }, st: 'disetujui', apv: null, by: ME.nama, uid: ME.uid, ts: m, mod: m },
      bay = { t: 'so', i: 'so1', no: 'INV-2026-0001', a: 20000, tgl: today(), by: ME.nama, uid: ME.uid, ts: m, pend: true };
    await putKas(id, rec, bay); window.__ap = await byApply(id); window.__ap2 = await byApply(id);
  });
  eq(await keu.page.evaluate(() => [window.__ap, window.__ap2]), [true, false]);
  eq((await get('penjualan', 'so1')).paid, 20000);
  await wait(own.page, () => D.so.find(s => s.id === 'so1').paid === 20000, null, 20000);
  // Inventori tidak menerapkan dua kali
  await own.page.evaluate(() => ldBayar()); await new Promise(r => setTimeout(r, 1500));
  eq(await own.page.evaluate(() => D.so.find(s => s.id === 'so1').paid), 20000);
});

await t('Perubahan offline dari Inventori versi lama (localStorage) digabung, tidak hilang', async () => {
  const L = JSON.parse(JSON.stringify(OLD)); L.u = 8; L.items.find(i => i.id === 'it0060').price = 7777; L.vend.push({ id: 'vbaru', name: 'Vendor offline', phone: '', addr: '', note: '' });
  const g = await open('gudang', '/inventori/', ([l, b]) => { localStorage.setItem('zui.inv.c.co1', l); localStorage.setItem('zui.inv.c.co1.b', b) }, [JSON.stringify(L), JSON.stringify(OLD)]);
  await wait(g.page, () => typeof ZS !== 'undefined' && ZS && !PB && !dirty() && D.vend.some(v => v.id === 'vbaru'), null, 60000);
  await wait(g.page, () => !PT && !PB && /Tersinkron/.test(SY), null, 30000);
  eq((await get('barang', 'it0060')).price, 7777); eq((await get('kontak', 'vbaru')).name, 'Vendor offline');
  eq((await get('batch', 'btit0010')).q, 17, 'stok terbaru tidak tertimpa data lama');
  eq(await g.page.evaluate(() => localStorage.getItem('zui.inv.c.co1')), null);
  await g.ctx.close();
});

console.log('Uang penjualan ke kas Keuangan');
await t('Kasir: HPP tidak tampil; penjualan tunai jadi setoran, Keuangan menerima, saldo naik', async () => {
  eq(await kas.page.evaluate(() => { go(1); return document.querySelector('#p_brg').textContent.includes('HPP') }), false, 'HPP tampil di layar Kasir');
  const sal0 = (await get('akun', 'ak1')).sal;
  const sid = await kas.page.evaluate(async () => { nsale(); await new Promise(r => setTimeout(r, 300)); document.querySelector('#sl .sq').value = 2; document.querySelector('#sl .sp').value = 10000; ss(); return D.so[D.so.length - 1].id });
  let st = null; for (let i = 0; i < 60 && !st; i++) { await adminDb(async co => { const q = await co.collection('setoran').where('rf.i', '==', sid).get(); st = q.docs[0] ? Object.assign({ id: q.docs[0].id }, q.docs[0].data()) : null }); if (!st) await new Promise(r => setTimeout(r, 250)) }
  yes(st && st.st === 'menunggu' && st.jml === 20000, 'setoran ' + JSON.stringify(st));
  await wait(keu.page, id => STR.some(x => x.id === id), st.id, 20000);
  await keu.page.evaluate(async id => { stOk(id); await stOk2(id) }, st.id);
  eq((await get('setoran', st.id)).st, 'diterima'); eq((await get('kas', 'st' + st.id)).jml, 20000);
  eq((await get('akun', 'ak1')).sal, sal0 + 20000);
  // dikonfirmasi dua kali tidak bisa
  let dua = 'tidak'; await keu.page.evaluate(async id => { const m = Date.now(); try { await coRef().collection('setoran').doc(id).update({ st: 'diterima', akun: 'ak1', kas: 'st' + id, apv: null, mod: m }); return 'bisa' } catch (e) { return 'tidak' } }, st.id).then(x => { dua = x });
  eq(dua, 'tidak');
});
await t('Pemilik terima cicilan di Inventori: langsung masuk kas akun yang dipilih', async () => {
  const sal0 = (await get('akun', 'ak1')).sal;
  const sid = await own.page.evaluate(async () => { nsale(); await new Promise(r => setTimeout(r, 300)); document.querySelector('#sl .sq').value = 1; document.querySelector('#sl .sp').value = 50000; $('#sr').checked = false; ss(); return D.so[D.so.length - 1].id });
  await own.page.evaluate(id => bys(id), sid);
  await wait(own.page, () => $('#kak') && $('#kak').value === 'ak1', null, 15000);
  await own.page.evaluate(id => { $('#by').value = 30000; bys2(id) }, sid);
  for (let i = 0; i < 60 && (await get('akun', 'ak1')).sal !== sal0 + 30000; i++) await new Promise(r => setTimeout(r, 250));
  eq((await get('akun', 'ak1')).sal, sal0 + 30000);
  await wait(own.page, () => !PB && !dirty(), null, 20000);
  eq((await get('penjualan', sid)).paid, 30000);
});

console.log('Harga otomatis, kategori, kode');
await t('Kategori dengan kode & keuntungan: kode barang otomatis, harga = HPP + %, dibulatkan ke atas Rp500', async () => {
  const r = await own.page.evaluate(async () => {
    go(6); hjSet('mk', 30); hjSet('rb', 500);
    ktF(-1); $('#kn').value = 'Parfum'; $('#kk').value = 'PRF'; $('#km').value = 50; ktS(-1);
    ai(); $('#n').value = 'Parfum Uji'; $('#ct').value = 'Parfum'; tpc(); const sku = $('#sk').value; $('#cs').value = 10000; hjPrev(); const prev = $('#hji').textContent; si();
    const i = D.items.find(x => x.name === 'Parfum Uji');
    ai(); $('#n').value = 'Tanpa kategori'; tpc(); $('#cs').value = 10100; si();
    const j = D.items.find(x => x.name === 'Tanpa kategori');
    return { sku, prev, price: i.price, ha: i.ha, sku2: j.sku, p2: j.price, sat: D.set.sat.includes('pcs'), kat: D.set.kat.map(k => k.n) };
  });
  eq([r.sku, r.price, r.ha, r.sku2, r.p2], ['PRF-001', 15000, true, 'PRD-001', 13500]);
  yes(/33,3% dari harga jual/.test(r.prev), r.prev); yes(r.sat && r.kat.filter(k => k === 'Umum').length === 1 && r.kat.filter(k => k === 'Parfum').length === 1, JSON.stringify(r.kat));
  await own.page.evaluate(() => pushNow()); await wait(own.page, () => !PB && !dirty());
  eq((await get('invcfg', 'set')).v.kat.find(k => k.n === 'Parfum').k, 'PRF');
  // satuan yang ditambah di Pengaturan muncul di pilihan formulir barang; "Lainnya" untuk satuan baru
  const u = await own.page.evaluate(() => { go(6); r(); $('#stn').value = 'jerigen'; stA(); ai(); const o = [...$('#un').options].map(x => x.value); $('#n').value = 'Satuan baru'; $('#un').value = '__baru'; selN($('#un')); $('#un_n').value = 'karung'; si(); return [o.includes('jerigen'), o.includes('__baru'), D.items.find(i => i.name === 'Satuan baru').unit] });
  eq(u, [true, true, 'karung']);
});
await t('HPP naik: harga ikut naik; HPP turun: hanya saran; Pakai saran', async () => {
  const r = await own.page.evaluate(() => {
    const i = D.items.find(x => x.name === 'Parfum Uji'); addB(i, 1, { cost: 20000 }); const naik = [i.cost, i.price];
    addB(i, 8, { cost: 1000 }); const turun = [Math.round(i.cost), i.price, hjSaran(i)]; hjPakai(i.id); return { naik, turun, akhir: i.price };
  });
  eq(r.naik, [20000, 30000]); eq(r.turun, [3111, 30000, 5000]); eq(r.akhir, 5000);
});
await t('Barang lama tetap manual sampai dinyalakan; harga di formulir penjualan tidak di bawah harga otomatis', async () => {
  const r = await own.page.evaluate(() => { const i = D.items.find(x => x.id === 'it0100'); const a = [hjOn(i), i.price]; i.ha = true; i.cost = 9000; const p = prc(i); i.ha = false; i.cost = 4000; return a.concat([p]) });
  eq(r, [false, 10000, 12000]);
});
await t('Hasil produksi: HPP = bahan + biaya lain, harga jual otomatis', async () => {
  const r = await own.page.evaluate(() => { const x = mfgFin({ real: { qty: 10, bn: 'PX', exp: '2027-01-01', pakai: [] }, isu: [], sku: 'PRD-HASIL', nama: 'Hasil Uji', unit: 'pcs', no: 'PRD-9', bl: 5000 }, 'pq-uji'); const i = D.items.find(z => z.sku === 'PRD-HASIL'); return { m: x.m, cost: i.cost, price: i.price } });
  eq([r.cost, r.price], [500, 1000]); yes(/HPP Rp\s?500\/pcs \(bahan Rp\s?0 \+ biaya lain Rp\s?5\.000\)/.test(r.m), r.m);
});

await t('Daftar barang berbentuk kartu; ketuk kartu membuka detail (Kasir tanpa HPP dan tanpa tombol ubah)', async () => {
  const r = await kas.page.evaluate(async () => { go(1); Q = 'Barang 7'; bl(); const n = document.querySelectorAll('#bl .cd').length; document.querySelector('#bl .cd').click(); await new Promise(r => setTimeout(r, 200)); const d = $('#dp'); const o = [n, d.open, d.textContent.includes('Batch'), d.textContent.includes('HPP'), !!d.querySelector('button[onclick^="xiD"]')]; d.close(); Q = ''; return o });
  eq(r, [11, true, true, false, false]);
  const o = await own.page.evaluate(async () => { go(1); Q = 'Barang 70'; bl(); document.querySelector('#bl .cd').click(); await new Promise(r => setTimeout(r, 200)); const d = $('#dp'); const x = [d.textContent.includes('HPP'), !!d.querySelector('button[onclick^="xiD"]')]; d.close(); Q = ''; bl(); return x });
  eq(o, [true, true]);
});

console.log('Manufaktur');
await t('Manufaktur membaca stok dari koleksi barang', async () => {
  const m = await open('pemilik', '/manufaktur/');
  await wait(m.page, () => typeof STK !== 'undefined' && STK.ok && STK.items.length >= 300, null, 30000);
  eq(await m.page.evaluate(() => STK.items.find(i => i.sku === 'SKU-10').stock), 17);
  await m.ctx.close();
});

await t('Tidak ada galat JavaScript di halaman', async () => { eq(errs, []) });
await browser.close(); srv.close(); await env.cleanup();
console.log(`\n${ok} lulus, ${bad} gagal`);
process.exit(bad ? 1 : 0);
