/* ZUI ERP: lapisan data bersama (dipakai Inventori, Keuangan, Manufaktur, ZUI ERP).
   ZINV  = data Inventori per dokumen (barang, batch, pembelian, penjualan, mutasi, kontak, buang),
           cache IndexedDB + muat inkremental (_u = waktu server), simpan = transaksi per dokumen dengan gabung 3 arah,
           pemindahan otomatis dari format lama (inv/meta + invc/0..n).
   ZKAS  = saldo kas/bank tersimpan per akun (akun.sal), diperbarui di tulisan yang sama dengan transaksi kas. */
(function (G) {
  'use strict';
  const FV = () => firebase.firestore.FieldValue, TSF = () => firebase.firestore.Timestamp;

  /* ---------- bentuk data ---------- */
  // jenis baris di objek D Inventori -> koleksi Firestore
  const KINDS = {
    items: { c: 'barang' }, bt: { c: 'batch' }, po: { c: 'pembelian' }, so: { c: 'penjualan' },
    mv: { c: 'mutasi' }, vend: { c: 'kontak', t: 'v' }, cust: { c: 'kontak', t: 'c' }, wo: { c: 'buang' }
  };
  // penanda sekali-pakai (invtanda/{px}_{id}) dan pengaturan (invcfg/set)
  const TANDA = { kd: 'kasDone', mi: 'mfgIss', md: 'mfgDone', no: null };
  const COLS = ['barang', 'batch', 'pembelian', 'penjualan', 'mutasi', 'kontak', 'buang', 'invtanda', 'invcfg'];
  const OLD_ROLES = ['pemilik', 'admin', 'gudang', 'kasir', 'keuangan'];
  const blankD = () => ({ items: [], mv: [], vend: [], po: [], bt: [], cust: [], so: [], wo: [], mfgDone: [], mfgIss: {}, kasDone: {}, set: { name: 'Toko utama', th: 'auto' } });

  // JSON dengan kunci terurut (Firestore tidak menjaga urutan kunci)
  function canon(v) {
    if (v === undefined) return undefined;
    if (v === null || typeof v !== 'object') return JSON.stringify(v);
    if (Array.isArray(v)) return '[' + v.map(x => { const s = canon(x); return s === undefined ? 'null' : s }).join(',') + ']';
    if (typeof v.toJSON === 'function') return canon(v.toJSON());
    const ks = Object.keys(v).sort(), o = [];
    for (const k of ks) { const s = canon(v[k]); if (s !== undefined) o.push(JSON.stringify(k) + ':' + s) }
    return '{' + o.join(',') + '}';
  }
  const clone = v => v === undefined ? undefined : JSON.parse(JSON.stringify(v));
  // Firestore tidak menerima larik di dalam larik: dibungkus {_a_:[...]}
  function enc(v, inArr) {
    if (v === null || typeof v !== 'object') return v;
    if (Array.isArray(v)) { const a = v.map(x => enc(x, true)); return inArr ? { _a_: a } : a }
    const o = {}; for (const k in v) o[k] = enc(v[k], false); return o;
  }
  function dec(v) {
    if (v === null || typeof v !== 'object') return v;
    if (v instanceof TSF()) return v.toMillis();
    if (Array.isArray(v)) return v.map(dec);
    const ks = Object.keys(v); if (ks.length === 1 && ks[0] === '_a_' && Array.isArray(v._a_)) return v._a_.map(dec);
    const o = {}; for (const k of ks) o[k] = dec(v[k]); return o;
  }
  const tsKey = t => t && typeof t.seconds === 'number' ? String(t.seconds).padStart(12, '0') + '.' + String(t.nanoseconds).padStart(9, '0') : '';
  const safeId = s => /^[A-Za-z0-9_\-]{1,200}$/.test(String(s || '')) && !/^__.*__$/.test(s);
  const noId = no => 'no_' + String(no).replace(/[^A-Za-z0-9_\-]/g, '_').slice(0, 300);

  // dokumen Firestore -> entri {k, id, v} (v null = dihapus)
  function decodeDoc(col, id, data) {
    if (!data) return null;
    const del = data._del === true, u = tsKey(data._u);
    if (col === 'invcfg') return id === 'set' ? { k: 'set', id, v: del ? null : { v: dec(data.v) }, u } : null;
    if (col === 'invtanda') {
      const i = id.indexOf('_'), px = id.slice(0, i), rid = id.slice(i + 1);
      if (!(px in TANDA)) return null;
      return { k: px, id: rid, v: del ? null : px === 'no' ? { i: data.i } : { v: dec(data.v) }, u };
    }
    let k = null; for (const n in KINDS) if (KINDS[n].c === col && (!KINDS[n].t || KINDS[n].t === data._t)) k = n;
    if (!k) { if (col === 'kontak' && del) k = 'vend'; else return null }
    if (del) return { k, id, v: null, u };
    const v = {}; for (const f in data) if (f !== '_u' && f !== '_by' && f !== '_t' && f !== '_del') v[f] = dec(data[f]);
    v.id = id; return { k, id, v, u };
  }
  const keyOf = (k, id) => KINDS[k] ? (KINDS[k].c === 'kontak' ? 'kontak/' + id : KINDS[k].c + '/' + id) : k === 'set' ? 'invcfg/set' : 'invtanda/' + k + '_' + id;
  const refOf = (co, key) => { const i = key.indexOf('/'); return co.collection(key.slice(0, i)).doc(key.slice(i + 1)) };
  function payload(k, v, by) {
    const m = { _u: FV().serverTimestamp(), _by: by };
    if (v === null) return Object.assign({ _del: true }, KINDS[k] && KINDS[k].t ? { _t: KINDS[k].t } : {}, m);
    if (KINDS[k]) { const o = enc(clone(v)); delete o.id; if (KINDS[k].t) o._t = KINDS[k].t; return Object.assign(o, m) }
    if (k === 'no') return Object.assign({ i: v.i }, m);
    return Object.assign({ v: enc(clone(v.v)) }, m);
  }

  // D -> Map(key -> {k,id,v,j})
  function explode(D) {
    const M = new Map(), put = (k, id, v) => { const key = keyOf(k, id); M.set(key, { k, id, v, j: canon(v) }) };
    for (const k in KINDS) for (const r of (D[k] || [])) if (r && r.id) put(k, String(r.id), r);
    for (const id in (D.kasDone || {})) put('kd', id, { v: D.kasDone[id] });
    for (const id in (D.mfgIss || {})) put('mi', id, { v: D.mfgIss[id] });
    for (const id of (D.mfgDone || [])) put('md', String(id), { v: 1 });
    if (D.set) put('set', 'set', { v: D.set });
    return M;
  }
  // Map entri -> D baru
  function implode(entries) {
    const D = blankD(); D.set = null; const L = [];
    for (const e of entries) if (e.v) L.push(e);
    L.sort((a, b) => a.id < b.id ? -1 : a.id > b.id ? 1 : 0);
    for (const e of L) {
      if (KINDS[e.k]) D[e.k].push(clone(e.v));
      else if (e.k === 'kd') D.kasDone[e.id] = clone(e.v.v);
      else if (e.k === 'mi') D.mfgIss[e.id] = clone(e.v.v);
      else if (e.k === 'md') D.mfgDone.push(e.id);
      else if (e.k === 'set') D.set = clone(e.v.v);
    }
    if (!D.set) delete D.set;
    return D;
  }
  function setRec(D, k, id, v) {
    if (KINDS[k]) {
      const A = D[k] = D[k] || [], i = A.findIndex(x => x && String(x.id) === id);
      if (v === null) { if (i >= 0) A.splice(i, 1) } else if (i >= 0) A[i] = clone(v); else A.push(clone(v));
    } else if (k === 'kd' || k === 'mi') { const o = D[TANDA[k]] = D[TANDA[k]] || {}; if (v === null) delete o[id]; else o[id] = clone(v.v) }
    else if (k === 'md') { const A = D.mfgDone = D.mfgDone || [], i = A.indexOf(id); if (v === null) { if (i >= 0) A.splice(i, 1) } else if (i < 0) A.push(id) }
    else if (k === 'set') { if (v) D.set = clone(v.v) }
  }
  function getRec(D, k, id) {
    if (KINDS[k]) { const r = (D[k] || []).find(x => x && String(x.id) === id); return r === undefined ? null : r }
    if (k === 'kd' || k === 'mi') { const o = D[TANDA[k]] || {}; return id in o ? { v: o[id] } : null }
    if (k === 'md') return (D.mfgDone || []).includes(id) ? { v: 1 } : null;
    if (k === 'set') return D.set ? { v: D.set } : null;
    return null;
  }

  /* ---------- gabung 3 arah (sama dengan Inventori lama, perbandingan kanonik) ---------- */
  const isRec = a => Array.isArray(a) && a.every(x => x && typeof x === 'object' && !Array.isArray(x) && x.id);
  function mgV(b, l, r) {
    const J = canon; if (J(l) === J(r)) return r; if (J(l) === J(b)) return r; if (J(r) === J(b)) return l;
    if (typeof l === 'number' && typeof r === 'number' && typeof b === 'number') return Math.round((r + l - b) * 1e6) / 1e6;
    if (Array.isArray(l) && Array.isArray(r)) {
      const B = Array.isArray(b) ? b : []; if (isRec(l) && isRec(r) && isRec(B)) return mgR(B, l, r);
      const bs = new Set(B.map(J)), ls = new Set(l.map(J)), rs = new Set(r.map(J));
      return r.filter(x => ls.has(J(x)) || !bs.has(J(x))).concat(l.filter(x => !bs.has(J(x)) && !rs.has(J(x))));
    }
    if (l && r && typeof l === 'object' && typeof r === 'object') return mgO(b && typeof b === 'object' ? b : {}, l, r);
    return l;
  }
  function mgO(b, l, r) {
    const o = {}, J = canon;
    for (const k of new Set(Object.keys(r).concat(Object.keys(l)))) {
      if (!(k in l) && (k in b) && J(r[k]) === J(b[k])) continue;
      if (!(k in r) && (k in b) && J(l[k]) === J(b[k])) continue;
      o[k] = !(k in l) ? r[k] : !(k in r) ? l[k] : mgV(b[k], l[k], r[k]);
    }
    return o;
  }
  function mgR(B, L, R) {
    const mb = new Map(B.map(x => [x.id, x])), ml = new Map(L.map(x => [x.id, x])), rs = new Set(R.map(x => x.id)), o = [];
    for (const x of R) { const b = mb.get(x.id), l = ml.get(x.id); if (!l) { if (b && canon(b) === canon(x)) continue; o.push(x) } else o.push(b ? mgV(b, l, x) : l) }
    for (const l of L) if (!rs.has(l.id) && !mb.has(l.id)) o.push(l);
    return o;
  }
  // gabung satu entri: b/l/r = nilai atau null (tidak ada); hasil null = dihapus
  function mergeEntry(k, b, l, r) {
    const J = x => x === null ? null : canon(x);
    if (!KINDS[k] && k !== 'set' && l && !b && r) throw CONFLICT;  // penanda sekali-pakai dibuat di dua tempat
    if (J(r) === J(b) || J(l) === J(r)) return l;
    if (J(l) === J(b)) return r;
    if (!KINDS[k] && k !== 'set') { if (l && !b && r) throw CONFLICT; return l === null ? null : r }
    if (b === null && k === 'set') return r;
    if (l === null) return r;          // dihapus di sini, diubah di tempat lain: perubahan dipertahankan
    if (r === null) return null;       // dihapus di tempat lain
    return mgV(b || {}, l, r);
  }
  const CONFLICT = { conflict: true };

  /* ---------- IndexedDB (cache per perangkat) ---------- */
  let IDBP = null;
  function idb() {
    if (IDBP) return IDBP;
    IDBP = new Promise(ok => {
      try {
        const q = indexedDB.open('zui-data', 1);
        q.onupgradeneeded = () => { const d = q.result; ['b', 'l', 'm'].forEach(n => { if (!d.objectStoreNames.contains(n)) d.createObjectStore(n) }) };
        q.onsuccess = () => ok(q.result); q.onerror = () => ok(null); q.onblocked = () => ok(null);
      } catch (e) { ok(null) }
    });
    return IDBP;
  }
  async function idbAll(st, cid) {
    const d = await idb(); if (!d) return [];
    return new Promise(ok => {
      try {
        const r = d.transaction(st).objectStore(st).getAll(IDBKeyRange.bound(cid + '\n', cid + '\n￿'));
        r.onsuccess = () => ok(r.result || []); r.onerror = () => ok([]);
      } catch (e) { ok([]) }
    });
  }
  async function idbGet(st, key) {
    const d = await idb(); if (!d) return null;
    return new Promise(ok => { try { const r = d.transaction(st).objectStore(st).get(key); r.onsuccess = () => ok(r.result || null); r.onerror = () => ok(null) } catch (e) { ok(null) } });
  }
  async function idbPut(st, cid, puts, dels, clear) {
    const d = await idb(); if (!d) return;
    return new Promise(ok => {
      try {
        const t = d.transaction(st, 'readwrite'), s = t.objectStore(st);
        if (clear) s.delete(IDBKeyRange.bound(cid + '\n', cid + '\n￿'));
        for (const [k, v] of puts) s.put(v, cid + '\n' + k);
        for (const k of (dels || [])) s.delete(cid + '\n' + k);
        t.oncomplete = () => ok(); t.onerror = () => ok(); t.onabort = () => ok();
      } catch (e) { ok() }
    });
  }
  async function idbMeta(cid, v) {
    const d = await idb(); if (!d) return null;
    if (v === undefined) return idbGet('m', cid);
    return new Promise(ok => { try { const t = d.transaction('m', 'readwrite'); t.objectStore('m').put(v, cid); t.oncomplete = () => ok(); t.onerror = () => ok() } catch (e) { ok() } });
  }

  /* ---------- format lama ---------- */
  async function oldGet(co) {
    for (let k = 0; ; k++) {
      const m = await co.collection('inv').doc('meta').get(); if (!m.exists) return null;
      const n = m.data().n || 0, cs = await Promise.all(Array.from({ length: n }, (_, i) => co.collection('invc').doc(String(i)).get()));
      try { return { D: JSON.parse(cs.map(x => x.data().d).join('')), u: m.data().u || 0 } } catch (e) { if (k >= 2) throw e }
    }
  }
  // perbaiki id yang tidak bisa jadi id dokumen / kembar sebelum dipindahkan
  function fixIds(D) {
    const seen = new Set(), nid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
    for (const k in KINDS) {
      D[k] = Array.isArray(D[k]) ? D[k].filter(x => x && typeof x === 'object') : [];
      for (const r of D[k]) {
        let id = r.id == null ? '' : String(r.id);
        const key = KINDS[k].c + '/' + id;
        if (!safeId(id) || seen.has(key)) {
          const old = r.id; id = nid(); while (seen.has(KINDS[k].c + '/' + id)) id = nid();
          if (old != null) for (const k2 in KINDS) for (const x of D[k2]) for (const f of ['iid', 'vid', 'cid']) if (x !== r && x[f] === old && ((f === 'iid' && k === 'items') || (f === 'vid' && k === 'vend') || (f === 'cid' && k === 'cust'))) x[f] = id;
          r.id = id;
        } else r.id = id;
        seen.add(KINDS[k].c + '/' + id);
      }
    }
    for (const m of ['kasDone', 'mfgIss']) { const o = D[m] && typeof D[m] === 'object' && !Array.isArray(D[m]) ? D[m] : {}; D[m] = {}; for (const i in o) if (safeId(i)) D[m][i] = o[i] }
    D.mfgDone = Array.isArray(D.mfgDone) ? D.mfgDone.map(String).filter(safeId) : [];
    return D;
  }

  async function readAll(co, cols) {
    const out = new Map();
    await Promise.all(cols.map(async c => {
      const s = await co.collection(c).get({ source: 'server' });
      s.docs.forEach(d => { const e = decodeDoc(c, d.id, d.data()); if (e) out.set(keyOf(e.k, e.id), Object.assign(e, { j: e.v ? canon(e.v) : null })) });
    }));
    return out;
  }
  async function commitChunks(fs, ops) {
    for (let i = 0; i < ops.length; i += 400) { const b = fs.batch(); ops.slice(i, i + 400).forEach(f => f(b)); await b.commit() }
  }

  // status format: 'v2' (sudah dipindahkan / perusahaan baru), 'old' (belum, peran ini tidak bisa memindahkan), 'none'
  async function ensure(fs, cid, me, note) {
    const co = fs.collection('perusahaan').doc(cid), vr = co.collection('invcfg').doc('v2'), lr = co.collection('invcfg').doc('mig');
    const v = await vr.get(); if (v.exists) return 'v2';
    const canMig = OLD_ROLES.includes(me.peran);
    const om = await co.collection('inv').doc('meta').get();
    if (!om.exists) {
      if (!canMig) return 'none';
      const sr = co.collection('invcfg').doc('set');
      if (!(await sr.get()).exists) await sr.set(payload('set', { v: blankD().set }, me.uid));
      await vr.set({ ts: Date.now(), by: me.uid, u: 0, n: 0, _u: FV().serverTimestamp(), _by: me.uid });
      return 'v2';
    }
    if (!canMig) return 'old';
    // kunci pemindahan: satu perangkat saja yang memindahkan
    for (let w = 0; w < 300; w++) {
      let mine = false;
      await fs.runTransaction(async tx => {
        const [a, l] = await Promise.all([tx.get(vr), tx.get(lr)]);
        if (a.exists) { mine = 'done'; return }
        const L = l.exists ? l.data() : null;
        if (!L || L.by === me.uid || Date.now() - (L.ts || 0) > 600000) { tx.set(lr, { by: me.uid, ts: Date.now(), _u: FV().serverTimestamp(), _by: me.uid }); mine = true }
      });
      if (mine === 'done') return 'v2';
      if (mine) break;
      if (note) note('Data Inventori sedang dipindahkan ke format baru di perangkat lain…');
      await new Promise(r => setTimeout(r, 3000));
    }
    if (note) note('Memindahkan data Inventori ke format baru…');
    for (let round = 0; round < 6; round++) {
      const src = await oldGet(co); if (!src) break;
      const D = fixIds(Object.assign(blankD(), src.D)), want = explode(D);
      // tulis sampai isi koleksi baru sama persis dengan data lama
      for (let pass = 0; pass < 4; pass++) {
        const have = await readAll(co, COLS), ops = [];
        for (const [key, e] of want) { const h = have.get(key); if (!h || h.j !== e.j) ops.push(b => b.set(refOf(co, key), payload(e.k, e.v, me.uid))) }
        for (const [key, h] of have) if (h.j !== null && h.k !== 'no' && !want.has(key)) ops.push(b => b.set(refOf(co, key), payload(h.k, null, me.uid)));
        if (!ops.length) break;
        if (note) note('Memindahkan data Inventori: ' + ops.length + ' baris…');
        await commitChunks(fs, ops);
        if (pass === 3) throw new Error('Pemindahan data Inventori belum cocok. Coba buka lagi.');
      }
      let moved = false;
      await fs.runTransaction(async tx => {
        const m = await tx.get(co.collection('inv').doc('meta'));
        if (m.exists && (m.data().u || 0) !== src.u) return;
        tx.set(vr, { ts: Date.now(), by: me.uid, u: src.u, n: want.size, _u: FV().serverTimestamp(), _by: me.uid }); moved = true;
      });
      if (moved) { try { await lr.delete() } catch (e) { } return 'v2' }
    }
    throw new Error('Data lama terus berubah selama pemindahan. Tutup Inventori versi lama di perangkat lain lalu coba lagi.');
  }

  /* ---------- Store: cache + muat inkremental + simpan ---------- */
  function Store(o) {
    this.fs = o.fs; this.cid = o.cid; this.me = o.me; this.co = o.fs ? o.fs.collection('perusahaan').doc(o.cid) : null;
    this.cols = o.cols || COLS; this.write = !!o.write; this.ro = new Set(o.ro || []); this.getD = o.getD; this.setD = o.setD;
    this.onChange = o.onChange || (() => { }); this.onNote = o.onNote || (() => { });
    this.B = new Map(); this.cur = 0; this.un = []; this.q = []; this.busy = 0; this.again = 0; this.pt = 0; this.mode = 'v2';
  }
  Store.prototype.ns = function () { return this.cid + '|' + this.cols.join(',') };
  Store.prototype.D = function () { return implode(this.B.values()) };
  // muat dari cache perangkat, lalu ambil perubahan dari server sejak terakhir
  Store.prototype.open = async function (offline) {
    const ns = this.ns(), [rows, meta] = await Promise.all([idbAll('b', ns), idbMeta(ns)]);
    const same = !!meta && meta.uid === this.me.uid;
    if (same) { for (const e of rows) this.B.set(keyOf(e.k, e.id), e); this.cur = meta.cur || 0 }
    else { this.cur = 0; await idbPut('b', ns, [], [], true); await idbPut('l', ns, [], [], true) }
    let loc = [];
    if (this.write && same) loc = (await idbAll('l', ns)).filter(x => x);
    const D = this.D(); for (const x of loc) setRec(D, x.k, x.id, x.v);
    if (offline) return D;
    await this.catchUp(D);
    return D;
  };
  Store.prototype.saveIdb = function (puts, dels, clear) {
    const ns = this.ns();
    return idbPut('b', ns, puts.map(e => [keyOf(e.k, e.id), e]), dels, clear).then(() => idbMeta(ns, { cur: this.cur, uid: this.me.uid }));
  };
  Store.prototype.q1 = function (c) {
    let q = this.co.collection(c);
    if (this.cur) q = q.where('_u', '>', TSF().fromMillis(Math.max(0, this.cur - 120000)));
    return q;
  };
  Store.prototype.catchUp = async function (D) {
    const ch = [];
    await Promise.all(this.cols.map(async c => { const s = await this.q1(c).get({ source: 'server' }); s.docs.forEach(d => ch.push([c, d])) }));
    const r = this.applyRemote(ch, D); return r;
  };
  // terapkan dokumen dari server ke cache dan ke D (gabung bila ada perubahan lokal)
  Store.prototype.applyRemote = function (docs, D) {
    let any = false, conflict = false; const puts = [];
    for (const [c, d] of docs) {
      const data = d.data(), e = decodeDoc(c, d.id, data); if (data && data._u && data._u.toMillis) this.cur = Math.max(this.cur, data._u.toMillis());
      if (!e) continue;
      const key = keyOf(e.k, e.id), b = this.B.get(key);
      if (b && e.u && b.u && e.u <= b.u) continue;
      if (b && e.v === null) e.k = b.k;
      e.j = e.v ? canon(e.v) : null;
      if (b && b.j === e.j) { b.u = e.u; puts.push(b); continue }
      if (D) {
        const l = getRec(D, e.k, e.id), bv = b ? b.v : null;
        let m; try { m = mergeEntry(e.k, bv, l === null ? null : clone(l), e.v) } catch (x) { if (x === CONFLICT) { conflict = true; m = e.v } else throw x }
        if (canon(m) !== canon(l)) setRec(D, e.k, e.id, m);
      }
      this.B.set(key, e); puts.push(e); any = true;
    }
    if (puts.length) this.saveIdb(puts);
    return { any, conflict };
  };
  Store.prototype.listen = function () {
    this.stop();
    for (const c of this.cols) {
      try {
        this.un.push(this.q1(c).onSnapshot(s => {
          const ch = s.docChanges().filter(x => x.type !== 'removed' && !x.doc.metadata.hasPendingWrites).map(x => [c, x.doc]);
          if (!ch.length) return;
          if (this.busy) { this.q.push(...ch); return }
          this.remote(ch);
        }, () => { }));
      } catch (e) { }
    }
  };
  Store.prototype.remote = function (ch) {
    const D = this.write ? this.getD() : null, r = this.applyRemote(ch, D);
    if (r.conflict && D) { this.reset('Perubahan Anda bentrok dengan perubahan yang sama dari perangkat lain. Data terbaru dimuat, mohon periksa dan ulangi.'); return }
    if (r.any) { if (!this.write) this.onChange(this.D()); else { this.setD(D); this.onChange(D) } }
  };
  Store.prototype.stop = function () { this.un.forEach(f => { try { f() } catch (e) { } }); this.un = [] };
  // buang perubahan lokal yang belum tersimpan
  Store.prototype.reset = function (msg) {
    const D = this.D(); this.setD(D); idbPut('l', this.ns(), [], [], true); this.onChange(D); if (msg) this.onNote(msg, 1);
  };
  Store.prototype.diff = function (D) {
    const cur = explode(D), out = [];
    for (const [key, e] of cur) { if (this.ro.has(e.k)) continue; const b = this.B.get(key); if (!b || b.j !== e.j) out.push({ key, k: e.k, id: e.id, b: b && b.v ? b.v : null, l: clone(e.v), lj: e.j }) }
    for (const [key, b] of this.B) if (b.j !== null && b.k !== 'no' && !this.ro.has(b.k) && !cur.has(key)) out.push({ key, k: b.k, id: b.id, b: b.v, l: null, lj: null });
    return out;
  };
  Store.prototype.dirty = function () { return this.write && this.diff(this.getD()).length > 0 };
  Store.prototype.keepLocal = function (ds) {
    return idbPut('l', this.ns(), ds.map(d => [d.key, { k: d.k, id: d.id, v: d.l }]), [], true);
  };
  // kirim semua perubahan lokal; true = tersimpan, false = tidak ada perubahan
  Store.prototype.push = async function () {
    if (!this.write) return false;
    if (this.busy) { this.again = 1; return false }
    this.busy = 1;
    try {
      let any = false;
      for (let round = 0; round < 25; round++) {
        const ds = this.diff(this.getD()); if (!ds.length) break;
        await this.keepLocal(ds);
        const r = await this.pushSome(ds.slice(0, 150));
        any = true;
        if (r === 'conflict') { this.reset('Perubahan Anda bentrok dengan perubahan yang sama dari perangkat lain. Data terbaru dimuat, mohon periksa dan ulangi.'); break }
      }
      const rest = this.diff(this.getD()); await this.keepLocal(rest);
      return any;
    } catch (e) {
      if (e && e.code === 'permission-denied') this.reset('Perubahan ditolak server (hak akses peran Anda). Data dikembalikan ke versi tersimpan.');
      throw e;
    } finally {
      this.busy = 0; const q = this.q.splice(0); if (q.length) this.remote(q);
      if (this.again) { this.again = 0; setTimeout(() => this.push().catch(() => { }), 0) }
    }
  };
  Store.prototype.pushSome = async function (ds) {
    const co = this.co, me = this.me, taken = {};
    for (let tries = 0; tries < 20; tries++) {
      let out = [], renum = null;
      const nos = ds.filter(d => (d.k === 'po' || d.k === 'so') && !d.b && d.l && d.l.no).map(d => ({ d, key: 'invtanda/' + noId(d.l.no) }));
      try {
        await this.fs.runTransaction(async tx => {
          out = []; renum = null;
          const [ss, ns] = await Promise.all([Promise.all(ds.map(d => tx.get(refOf(co, d.key)))), Promise.all(nos.map(n => tx.get(refOf(co, n.key))))]);
          for (let i = 0; i < nos.length; i++) { const x = ns[i].exists ? ns[i].data() : null; if (x && x._del !== true && x.i !== nos[i].d.id) { renum = nos[i].d; return } }
          for (let i = 0; i < ds.length; i++) {
            const d = ds[i], s = ss[i], re = s.exists ? decodeDoc(d.key.slice(0, d.key.indexOf('/')), s.id, s.data()) : null, r = re ? re.v : null, ru = re ? re.u : '';
            const res = mergeEntry(d.k, d.b, d.l, r);
            const rj = r === null ? null : canon(r), resj = res === null ? null : canon(res);
            if (resj !== rj) tx.set(refOf(co, d.key), payload(d.k, res, me.uid));
            out.push({ d, res, resj, ru });
          }
          for (const n of nos) tx.set(refOf(co, n.key), payload('no', { i: n.d.id }, me.uid));
        });
      } catch (e) { if (e === CONFLICT) return 'conflict'; throw e }
      if (renum) {
        const m = String(renum.l.no).match(/^(.*?)(\d+)$/), D = this.getD(), rec = getRec(D, renum.k, renum.id);
        if (!m || !rec) throw new Error('Nomor ' + renum.l.no + ' sudah dipakai.');
        const px = m[1], w = m[2].length; taken[px] = Math.max(taken[px] || 0, +m[2]);
        const mx = (D[renum.k] || []).reduce((a, x) => { const s = String(x.no || ''); if (s.indexOf(px) !== 0) return a; const q = s.slice(px.length).match(/^(\d+)$/); return q && x.id !== renum.id ? Math.max(a, +q[1]) : a }, 0);
        const nn = Math.max(mx, taken[px]) + 1; taken[px] = nn; rec.no = px + String(nn).padStart(w, '0');
        renum.l = clone(rec); renum.lj = canon(rec); this.onNote('Nomor ' + m[0] + ' sudah dipakai perangkat lain, diganti ' + rec.no);
        continue;
      }
      // perbarui cache dan D
      const D = this.getD(), puts = [];
      for (const o of out) {
        const e = { k: o.d.k, id: o.d.id, v: o.res === null ? null : clone(o.res), j: o.resj, u: o.ru };
        this.B.set(o.d.key, e); puts.push(e);
        const now = getRec(D, o.d.k, o.d.id), nj = now === null ? null : canon(now);
        if (nj === o.d.lj) { if (nj !== o.resj) setRec(D, o.d.k, o.d.id, o.res) }
        else { let m; try { m = mergeEntry(o.d.k, o.d.l, now === null ? null : clone(now), o.res) } catch (x) { m = o.res } setRec(D, o.d.k, o.d.id, m) }
      }
      for (const n of nos) { const e = { k: 'no', id: n.key.slice(12), v: { i: n.d.id }, j: canon({ i: n.d.id }), u: '' }; this.B.set(n.key, e); puts.push(e) }
      await this.saveIdb(puts);
      this.setD(D);
      return true;
    }
    throw new Error('Gagal mendapatkan nomor nota baru.');
  };

  /* ---------- untuk modul lain ---------- */
  // ubah satu baris (mis. persetujuan pembelian) dalam transaksi
  async function editDoc(fs, cid, me, k, id, fn) {
    const co = fs.collection('perusahaan').doc(cid), ref = refOf(co, keyOf(k, id));
    let res = null;
    await fs.runTransaction(async tx => {
      const s = await tx.get(ref), e = s.exists ? decodeDoc(KINDS[k].c, s.id, s.data()) : null;
      if (!e || !e.v) throw new Error('Data tidak ditemukan.');
      const v = clone(e.v); fn(v); res = v; tx.set(ref, payload(k, v, me.uid));
    });
    return res;
  }
  const ptot = p => (p.lines || []).reduce((s, l) => s + ((l.q || 0) - (l.rt || 0)) * (l.c || 0), 0);
  // terapkan pembayaran dari Keuangan (bayar/{id}) ke pembelian/penjualan, sekali saja (penanda invtanda/kd_{id})
  async function applyPay(fs, cid, me, id, stot, today) {
    const co = fs.collection('perusahaan').doc(cid), br = co.collection('bayar').doc(id), kr = refOf(co, keyOf('kd', id));
    let ok = false;
    try {
      await fs.runTransaction(async tx => {
        ok = false;
        const [bs, ks] = await Promise.all([tx.get(br), tx.get(kr)]);
        if (!bs.exists || bs.data().pend !== true) return;
        const b = bs.data(), kd = ks.exists && ks.data()._del !== true ? dec(ks.data().v) : null;
        let a2 = kd;
        if (kd === null) {
          const k = b.t === 'po' ? 'po' : b.t === 'so' ? 'so' : null; if (!k || !(b.a > 0)) return;
          const or = refOf(co, keyOf(k, b.i)), os = await tx.get(or), e = os.exists ? decodeDoc(KINDS[k].c, os.id, os.data()) : null;
          if (!e || !e.v) return;
          const o = clone(e.v), tot = k === 'po' ? ptot(o) : stot(o), pa = Math.max(0, Math.min(tot, (o.paid || 0) + b.a) - (o.paid || 0));
          (o.pays = o.pays || []).push({ d: b.tgl || today(), a: pa, by: b.by || '', k: id }); o.paid = (o.paid || 0) + pa;
          tx.set(or, payload(k, o, me.uid)); tx.set(kr, payload('kd', { v: pa }, me.uid)); a2 = pa;
        }
        tx.update(br, { pend: false, apBy: me.nama, apTs: Date.now(), a2: a2 || 0 }); ok = true;
      });
    } catch (e) { ok = false }
    return ok;
  }
  // tampilan hanya-baca (Keuangan, Manufaktur, ZUI ERP). kinds: daftar jenis yang perlu
  async function view(o) {
    const need = new Set();
    for (const k of o.kinds) { if (KINDS[k]) need.add(KINDS[k].c); else if (k === 'set') need.add('invcfg'); else need.add('invtanda') }
    const st = await ensure(o.fs, o.cid, o.me, o.note).catch(e => { if (o.note) o.note(e && e.message || String(e), 1); return 'err' });
    const co = o.fs.collection('perusahaan').doc(o.cid);
    if (st !== 'v2') {
      // belum dipindahkan: baca format lama (hanya-baca)
      const get = async () => { try { const x = await oldGet(co); return x ? Object.assign(blankD(), x.D) : blankD() } catch (e) { return blankD() } };
      const V = { mode: st, D: await get(), stop() { if (this.u) this.u() } };
      let f = true, t = 0;
      try { V.u = co.collection('inv').doc('meta').onSnapshot(() => { if (f) { f = false; return } clearTimeout(t); t = setTimeout(async () => { V.D = await get(); o.onChange && o.onChange(V.D) }, 1200) }, () => { }) } catch (e) { }
      return V;
    }
    const S = new Store({ fs: o.fs, cid: o.cid, me: o.me, cols: COLS.filter(c => need.has(c)), write: false, onChange: D => { V.D = D; o.onChange && o.onChange(D) } });
    const V = { mode: 'v2', S, D: null, stop() { S.stop() }, async reload() { await S.catchUp(null); V.D = S.D(); return V.D } };
    await S.open(); V.D = S.D(); S.listen();
    return V;
  }

  G.ZINV = { KINDS, COLS, canon, enc, dec, explode, implode, mgV, mergeEntry, decodeDoc, keyOf, payload, fixIds, blankD, ensure, Store, editDoc, applyPay, view, oldGet, idbAll, OLD_ROLES };

  /* ================= ZKAS: saldo per akun ================= */
  const okK = k => !!k && (k.st === 'disetujui' || k.st === undefined);
  // pengaruh satu transaksi kas ke saldo akun a
  const eff = (k, a) => !okK(k) ? 0 : (k.akun === a ? (k.jenis === 'masuk' ? k.jml : -k.jml) : 0) + (k.jenis === 'transfer' && k.akun2 === a ? k.jml : 0);
  // tambahkan perubahan saldo ke batch: before/after = isi dokumen kas sebelum/sesudah (null = tidak ada)
  function salOps(b, co, id, before, after) {
    const A = new Set(); [before, after].forEach(k => { if (k) { if (k.akun) A.add(k.akun); if (k.jenis === 'transfer' && k.akun2) A.add(k.akun2) } });
    for (const a of A) {
      const d = eff(after, a) - eff(before, a);
      if (Math.abs(d) > 1e-9) b.update(co.collection('akun').doc(a), { sal: FV().increment(d), lk: id, mod: Date.now() });
    }
  }
  const salOf = (a, kas) => typeof a.sal === 'number' ? (a.awal || 0) + a.sal : (kas || []).reduce((s, k) => s + eff(k, a.id), a.awal || 0);
  // isi saldo awal akun lama dari SELURUH riwayat kas (sekali saja per akun)
  async function salInit(fs, cid, akun) {
    const need = akun.filter(a => typeof a.sal !== 'number'); if (!need.length) return 0;
    const co = fs.collection('perusahaan').doc(cid), S = {}; need.forEach(a => S[a.id] = 0);
    let last = null;
    for (; ;) {
      let q = co.collection('kas').orderBy(firebase.firestore.FieldPath.documentId()).limit(1000);
      if (last) q = q.startAfter(last);
      const s = await q.get({ source: 'server' }); if (s.empty) break;
      s.docs.forEach(d => { const k = d.data(); for (const a in S) S[a] += eff(k, a) });
      last = s.docs[s.docs.length - 1]; if (s.size < 1000) break;
    }
    const b = fs.batch();
    for (const a in S) b.update(co.collection('akun').doc(a), { sal: Math.round(S[a] * 1e6) / 1e6, lk: '', mod: Date.now() });
    await b.commit();
    return need.length;
  }
  G.ZKAS = { okK, eff, salOps, salOf, salInit };
})(window);
