// Potret semua halaman kelima aplikasi (laptop dan HP) dengan data contoh di emulator.
// Jalankan emulator dulu (npx firebase emulators:start --config ../firebase.json --project demo-zui --only firestore,auth),
// lalu: node foto.mjs <folder-hasil> [tema: dark|light|navy] [penuh = potret setiap tab sepanjang isinya]
import { chromium } from 'playwright-core';
import { initializeTestEnvironment } from '@firebase/rules-unit-testing';
import 'firebase/compat/firestore';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(new URL('..', import.meta.url).pathname), NM = path.resolve(new URL('node_modules/firebase', import.meta.url).pathname);
const OUT = path.resolve(process.argv[2] || 'foto'), TEMA = process.argv[3] || 'dark', PENUH = process.argv[4] === 'penuh', PW = 'Rahasia123', CID = 'cofoto';
fs.mkdirSync(OUT, { recursive: true });
const HOOK = `;(function(){var o=firebase.initializeApp;firebase.initializeApp=function(){var a=o.apply(this,arguments);a.firestore().useEmulator('127.0.0.1',8080);a.auth().useEmulator('http://127.0.0.1:9099',{disableWarnings:true});return a}})();`;
const MT = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.webmanifest': 'application/manifest+json', '.png': 'image/png' };
const srv = http.createServer((q, r) => {
  let p = decodeURIComponent(new URL(q.url, 'http://x').pathname); if (p.endsWith('/')) p += 'index.html';
  const f = path.join(ROOT, p); if (!f.startsWith(ROOT) || !fs.existsSync(f)) { r.writeHead(404); r.end(); return }
  r.writeHead(200, { 'content-type': MT[path.extname(f)] || 'application/octet-stream' }); fs.createReadStream(f).pipe(r);
}).listen(8766);

const AU = 'http://127.0.0.1:9099/identitytoolkit.googleapis.com/v1';
await fetch('http://127.0.0.1:9099/emulator/v1/projects/demo-zui/accounts', { method: 'DELETE' });
const r0 = await (await fetch(AU + '/accounts:signUp?key=k', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ email: 'pemilik@foto.id', password: PW, returnSecureToken: true }) })).json();
await fetch(AU + '/projects/demo-zui/accounts:update', { method: 'POST', headers: { 'content-type': 'application/json', authorization: 'Bearer owner' }, body: JSON.stringify({ localId: r0.localId, emailVerified: true }) });
const UID = r0.localId;

const env = await initializeTestEnvironment({ projectId: 'zuisystem', firestore: { host: '127.0.0.1', port: 8080 } });
await env.clearFirestore();
const NM2 = ['Parfum Aurora EDP', 'Serum Vitamin C', 'Lipstik Matte Rose', 'Minyak Esens Oud', 'Botol Kaca 50 ml', 'Air suling', 'Krim Malam', 'Toner Mawar', 'Masker Lumpur', 'Sabun Susu', 'Body Lotion', 'Hand Cream'];
const OLD = { items: [], mv: [], vend: [{ id: 'v1', name: 'CV Aroma Nusantara', phone: '0812', addr: 'Bandung', note: '' }, { id: 'v2', name: 'PT Kemasan Prima', phone: '0813', addr: 'Tangerang', note: '' }], po: [], bt: [], cust: [{ id: 'c1', name: 'Dewi (reseller)', phone: '0814', note: 'Reseller Bandung' }], so: [], wo: [], mfgDone: [], mfgIss: {}, kasDone: {}, set: { name: 'Toko', th: TEMA, hj: { on: true, mk: 30, rb: 500 }, kat: [{ n: 'Parfum', k: 'PRF', mk: 50, mk2: '' }, { n: 'Skincare', k: 'SKN', mk: '', mk2: '' }], sat: ['pcs', 'ml', 'liter', 'botol'] } };
NM2.forEach((n, k) => {
  const id = 'it' + k, tp = k === 3 || k === 5 ? 'bahan' : k === 4 ? 'kemasan' : 'jadi';
  OLD.items.push({ id, name: n, tp, size: k % 2 ? '50 ml' : '', sku: (tp === 'jadi' ? 'PRD-' : tp === 'bahan' ? 'RM-' : 'PK-') + String(k + 1).padStart(3, '0'), cat: ['Parfum', 'Skincare', 'Makeup'][k % 3], unit: tp === 'bahan' ? 'liter' : 'pcs', stock: [24, 0, 3, 18, 300, 2, 40, 12, 9, 60, 5, 30][k], min: 5, price: 50000 + k * 5000, cost: 20000 + k * 2000, bpom: '', loc: 'Rak ' + 'ABC'[k % 3] + (k % 4 + 1), ha: k % 3 === 0 });
  if (OLD.items[k].stock) OLD.bt.push({ id: 'b' + id, iid: id, no: 'B24' + k, exp: k === 5 ? '2026-10-19' : k === 2 ? '2026-12-01' : '2027-06-01', q: OLD.items[k].stock, q0: OLD.items[k].stock, cost: 20000 + k * 2000, vid: 'v1', ref: '', ts: k });
  OLD.mv.push({ id: 'm' + id, iid: id, nm: n, t: 'in', q: OLD.items[k].stock, note: 'Stok awal', d: '2026-10-01', ts: k, by: 'ZAOR' });
});
OLD.po.push({ id: 'po1', no: 'PO-2026-0001', vid: 'v1', d: '2026-10-02', due: '2026-10-30', lines: [{ iid: 'it3', q: 10, c: 26000 }], paid: 0, st: 'diterima', by: 'ZAOR', bu: UID });
OLD.po.push({ id: 'po2', no: 'PO-2026-0002', vid: 'v2', d: '2026-10-15', due: '', lines: [{ iid: 'it4', q: 500, c: 3500 }], paid: 0, st: 'dipesan', by: 'ZAOR', bu: UID });
OLD.so.push({ id: 'so1', no: 'INV-2026-0001', cid: 'c1', ch: 'Toko', d: '2026-10-04', lines: [{ iid: 'it0', q: 2, p: 185000, bn: [{ no: 'B240', q: 2 }], cg: 40000 }], disc: 0, paid: 0, due: '2026-10-18', st: 'selesai' });
OLD.so.push({ id: 'so2', no: 'INV-2026-0002', cid: '', ch: 'Toko', d: '2026-10-19', lines: [{ iid: 'it6', q: 1, p: 80000, bn: [{ no: 'B246', q: 1 }], cg: 32000 }], disc: 0, paid: 80000, pays: [{ d: '2026-10-19', a: 80000, by: 'ZAOR' }], due: '', st: 'selesai' });
await env.withSecurityRulesDisabled(async c => {
  const f = c.firestore(), co = f.collection('perusahaan').doc(CID), now = Date.now();
  await co.set({ nama: 'PT.ZAOR UTAMA INDONESIA', owner: UID, ts: now, alur: true, apps: { inventori: 'x', keuangan: 'x', manufaktur: 'x', karyawan: 'x' } });
  await co.collection('anggota').doc(UID).set({ email: 'pemilik@foto.id', nama: 'ZAOR', peran: 'pemilik', aktif: true, ts: 1 });
  await f.collection('profil').doc(UID).set({ cid: CID });
  await co.collection('invc').doc('0').set({ d: JSON.stringify(OLD) }); await co.collection('inv').doc('meta').set({ n: 1, u: 1, by: 'x' });
  await co.collection('akun').doc('a1').set({ nama: 'Kas toko', tipe: 'kas', awal: 2000000, aktif: true, by: 'x', uid: UID, ts: 1, mod: 1, sal: 350000, lk: '' });
  await co.collection('akun').doc('a2').set({ nama: 'Bank BCA', tipe: 'bank', awal: 10000000, aktif: true, by: 'x', uid: UID, ts: 2, mod: 2, sal: 0, lk: '' });
  for (const [i, k] of [['k1', { tgl: '2026-10-19', jenis: 'masuk', akun: 'a1', jml: 450000, kat: 'Penjualan tunai', st: 'disetujui' }], ['k2', { tgl: '2026-10-18', jenis: 'keluar', akun: 'a1', jml: 100000, kat: 'Operasional', st: 'disetujui' }], ['k3', { tgl: '2026-10-20', jenis: 'keluar', akun: 'a2', jml: 750000, kat: 'Gaji', st: 'menunggu' }]])
    await co.collection('kas').doc(i).set(Object.assign({ akun2: '', ket: '', rf: null, apv: null, by: 'Keuangan', uid: 'x', ts: now, mod: now }, k));
  await co.collection('setoran').doc('s1').set({ rf: { t: 'so', i: 'so2', no: 'INV-2026-0002', nm: 'Umum' }, jml: 80000, tgl: '2026-10-19', kat: 'Penjualan tunai', by: 'Kasir', uid: 'x', ts: now, st: 'menunggu' });
  await co.collection('bom').doc('bom1').set({ kode: 'BOM-001', nama: 'Parfum Aurora 50 ml', sku: 'PRD-001', pn: 'Parfum Aurora EDP', unit: 'pcs', qty: 100, umur: 24, items: [{ sku: 'RM-004', nama: 'Minyak Esens Oud', qty: 1, unit: 'liter' }, { sku: 'PK-005', nama: 'Botol Kaca 50 ml', qty: 100, unit: 'pcs' }], qc: [], ket: '', bl: 150000, aktif: true, st: 'disetujui', apv: null, by: 'ZAOR', uid: UID, ts: 1, mod: 1 });
  await co.collection('produksi').doc('pr1').set({ no: 'PRD-2026-001', bomId: 'bom1', bom: 'BOM-001', nama: 'Parfum Aurora EDP', sku: 'PRD-001', unit: 'pcs', mult: 1, target: 100, bl: 150000, plan: [], qcp: [], umur: 24, tgl: '2026-10-20', pic: { uid: UID, nama: 'ZAOR' }, cat: '', st: 'berjalan', by: 'ZAOR', uid: UID, ts: now, mod: now, hist: [] });
  for (const [i, n] of [['kr1', 'Andi Saputra'], ['kr2', 'Siti Rahma'], ['kr3', 'Budi Santoso']]) await co.collection('karyawan').doc(i).set({ nama: n, jab: 'Staf', div: 'Gudang', tgl: '2025-01-10', hp: '0812', jatah: 12, uid: i === 'kr1' ? UID : '', aktif: true, by: 'x', ts: 1, mod: 1 });
});

const browser = await chromium.launch({ executablePath: process.env.CHROMIUM || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome', args: ['--no-sandbox'] });
const errs = [];
const APPS = [['erp', '/'], ['inventori', '/inventori/'], ['keuangan', '/keuangan/'], ['manufaktur', '/manufaktur/'], ['karyawan', '/karyawan/']];
for (const [nm, url] of APPS) {
  for (const [lb, vw] of [['laptop', { width: 1366, height: 800 }], ['hp', { width: 390, height: 844 }]]) {
    const ctx = await browser.newContext({ viewport: vw, deviceScaleFactor: 1 }); const page = await ctx.newPage();
    await ctx.addInitScript(t => { try { for (const k of ['sys', 'inv', 'keu', 'mfg', 'kar']) localStorage.setItem('zui.' + k + '.th', t); localStorage.setItem('zui.th', t) } catch (e) { } }, TEMA);
    await ctx.route(/gstatic\.com\/firebasejs\/.*\/(firebase-[a-z]+-compat\.js)/, async r => { const n = r.request().url().match(/(firebase-[a-z]+-compat\.js)/)[1]; let b = fs.readFileSync(path.join(NM, n), 'utf8'); if (n === 'firebase-firestore-compat.js') b += HOOK; await r.fulfill({ status: 200, contentType: 'text/javascript', body: b }) });
    await ctx.route(/fonts\.(googleapis|gstatic)\.com/, r => r.abort());
    page.on('pageerror', e => errs.push(nm + ': ' + e.message));
    await page.goto('http://127.0.0.1:8766' + url);
    await page.waitForFunction(() => typeof FA !== 'undefined' && FA, null, { timeout: 30000 });
    await page.evaluate(p => FA.signInWithEmailAndPassword('pemilik@foto.id', p), PW);
    try { await page.waitForFunction(() => { const a = document.getElementById('au'); return a && getComputedStyle(a).display === 'none' }, null, { timeout: 30000 }) }
    catch (e) { await page.screenshot({ path: path.join(OUT, `${nm}-GAGAL-${lb}.png`) }); errs.push(nm + ': tidak masuk ' + (await page.evaluate(() => (document.getElementById('am') || {}).textContent))); await ctx.close(); continue }
    await page.waitForLoadState('load'); await new Promise(r => setTimeout(r, 1500));
    await page.waitForFunction(() => { const a = document.getElementById('au'); return a && getComputedStyle(a).display === 'none' }, null, { timeout: 30000 });
    await page.evaluate(t => { const z = document.getElementById('zsp'); if (z) z.remove(); document.documentElement.setAttribute('data-app', t) }, TEMA);
    await new Promise(r => setTimeout(r, 2500));
    const n = await page.evaluate(() => N.length);
    for (let i = 0; i < n; i++) {
      await page.evaluate(i => { pv.scrollTo({ left: i * pv.clientWidth }) }, i); await new Promise(r => setTimeout(r, 700));
      if (PENUH) { const h = await page.evaluate(i => { const s = document.querySelectorAll('.pv>section')[i]; return s.getBoundingClientRect().top + s.scrollHeight }, i); await page.setViewportSize({ width: vw.width, height: Math.max(vw.height, Math.ceil(h)) }); await new Promise(r => setTimeout(r, 300)) }
      await page.screenshot({ path: path.join(OUT, `${nm}-${i}-${lb}.png`) });
      // periksa: tidak ada isi yang keluar dari layar atau terpotong "…" (khususnya di HP)
      const luber = await page.evaluate(i => {
        const s = document.querySelectorAll('.pv>section')[i], W = document.documentElement.clientWidth, r = [];
        for (const e of [s, ...s.querySelectorAll('*')]) {
          const b = e.getBoundingClientRect(); if (!b.width || getComputedStyle(e).visibility === 'hidden' || e.closest('.sc2,.zddm,[style*="display: none"]')) continue;
          const st = getComputedStyle(e), txt = (e.textContent || '').trim().slice(0, 40);
          if (b.right > W + 1 || b.left < -1) r.push('keluar layar: ' + e.tagName + '.' + e.className + ' "' + txt + '"');
          else if (st.textOverflow === 'ellipsis' && e.scrollWidth > e.clientWidth + 1) r.push('terpotong: ' + e.tagName + '.' + e.className + ' "' + txt + '"');
        }
        // tab aktif utuh di dalam batas tepi kiri-kanan
        const hd = document.getElementById('hd'), on = hd && hd.querySelector('.hdi .on');
        if (on) { const g = parseFloat(getComputedStyle(hd).paddingLeft) || 0, b = on.getBoundingClientRect(); if (b.left < g - 1 || b.right > W - g + 1) r.push('tab aktif keluar batas: ' + on.textContent + ' ' + Math.round(b.left) + '..' + Math.round(b.right)) }
        return [...new Set(r)].slice(0, 6);
      }, i);
      for (const x of luber) errs.push(`${nm} tab ${i} ${lb}: ${x}`);
      if (PENUH) await page.setViewportSize(vw);
    }
    await ctx.close();
  }
}
await browser.close(); srv.close(); await env.cleanup();
console.log(errs.length ? errs.join('\n') : 'tanpa galat');
process.exit(0);
