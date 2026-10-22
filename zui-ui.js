/* ZUI ERP: Pengaturan di semua aplikasi dikelompokkan per bagian (judul .hh), dengan urutan yang sama:
   Akun → pengaturan khusus aplikasi → Pasang dan bagikan → Bahasa → Tampilan → bantuan/kaki halaman.
   Pilihan Bahasa dan Tampilan menjadi satu tombol dengan daftar pilihan (tombol asli tetap ada, disembunyikan). */
(function () {
  'use strict';
  // judul dalam Bahasa Indonesia, English, Melayu (teks bisa sudah diterjemahkan saat dikelompokkan)
  const ORD = [[0, ['Akun', 'Account', 'Akaun']], [80, ['Pasang dan bagikan', 'Install and share', 'Pasang dan kongsi']], [81, ['Bahasa', 'Language']], [82, ['Tampilan', 'Appearance', 'Paparan']], [83, ['Data']]];
  const rank = t => { t = String(t || '').trim(); for (const [r, L] of ORD) if (L.includes(t)) return r; return 50 };
  const tail = n => n.nodeType === 1 && /(^|\s)(zfb|zfn|zft|zt)(\s|$)/.test(n.className || '');
  // satu tombol untuk deretan pilihan .sg: menampilkan pilihan aktif, ketuk untuk membuka daftar
  function pick(sgs) {
    const w = document.createElement('div'), b = document.createElement('button'), m = document.createElement('div');
    w.className = 'zsel'; b.type = 'button'; b.className = 'zdd'; b.setAttribute('aria-haspopup', 'listbox'); b.setAttribute('aria-expanded', 'false');
    m.className = 'zddm'; m.setAttribute('role', 'listbox'); m.hidden = true;
    const chips = () => [...sgs.children].filter(c => c.classList.contains('sg'));
    const label = () => { const c = chips(), on = c.find(x => x.classList.contains('on')) || c[0]; b.textContent = on ? on.textContent.trim() : '' };
    b.onclick = e => {
      e.stopPropagation(); const open = m.hidden; shut();
      if (!open) return;
      m.textContent = '';
      for (const c of chips()) {
        const o = document.createElement('button'); o.type = 'button'; o.setAttribute('role', 'option'); o.textContent = c.textContent.trim();
        const on = c.classList.contains('on'); o.setAttribute('aria-selected', on); if (on) o.className = 'on';
        o.onclick = ev => { ev.stopPropagation(); shut(); c.click(); label() };
        m.appendChild(o);
      }
      m.hidden = false; b.setAttribute('aria-expanded', 'true'); (m.querySelector('.on') || m.firstChild).focus();
    };
    new MutationObserver(label).observe(sgs, { subtree: true, childList: true, attributes: true, attributeFilter: ['class'], characterData: true });
    label(); w.append(b, m); sgs.style.display = 'none'; sgs.after(w);
  }
  function shut() { for (const m of document.querySelectorAll('.zddm:not([hidden])')) { m.hidden = true; m.previousSibling.setAttribute('aria-expanded', 'false') } }
  document.addEventListener('click', shut);
  document.addEventListener('keydown', e => { if (e.key === 'Escape') shut() });
  function group(sec) {
    // buka kelompok lama, lalu kelompokkan ulang dari awal
    for (const w of [...sec.querySelectorAll('.zsel')]) { if (w.previousElementSibling) w.previousElementSibling.style.display = ''; w.remove() }
    for (const g of [...sec.querySelectorAll(':scope>.zs,:scope>.zt')]) { while (g.firstChild) sec.insertBefore(g.firstChild, g); g.remove() }
    const G = [], T = []; let cur = null;
    for (const n of [...sec.childNodes]) {
      if (n.nodeType === 3 && !n.textContent.trim()) continue;
      if (tail(n)) { T.push(n); continue }
      if (n.nodeType === 1 && n.classList.contains('hh')) { cur = { r: rank(n.textContent), i: G.length, n: [n] }; G.push(cur); continue }
      if (!cur) { cur = { r: 0, i: G.length, n: [] }; G.push(cur) }
      cur.n.push(n);
    }
    G.sort((a, b) => a.r - b.r || a.i - b.i);
    const f = document.createDocumentFragment();
    for (const g of G) {
      if (!g.n.length) continue; const d = document.createElement('div'); d.className = 'zs'; g.n.forEach(x => d.appendChild(x)); f.appendChild(d);
      if (g.r === 81 || g.r === 82) { const s = [...d.children].find(x => x.classList.contains('sgs') && x.children.length > 1 && [...x.children].every(c => c.classList.contains('sg'))); if (s) pick(s) }
    }
    if (T.length) { const d = document.createElement('div'); d.className = 'zt'; T.forEach(x => d.appendChild(x)); f.appendChild(d) }
    sec.appendChild(f);
  }
  function watch() {
    const sec = document.getElementById('p_set'); if (!sec) return;
    let busy = false, t = 0;
    const run = () => { busy = true; ob.disconnect(); try { group(sec) } catch (e) { } ob.observe(sec, { childList: true }); busy = false };
    const ob = new MutationObserver(() => { if (busy) return; clearTimeout(t); t = setTimeout(run, 0) });
    ob.observe(sec, { childList: true }); run();
  }
  // baris tab di atas: tab aktif selalu utuh di dalam batas tepi; tab lain yang tidak muat memudar di tepi, tidak terpotong tajam di tepi layar.
  // x = geseran baris tab, v = lebar di dalam batas tepi, g = lebar tepi
  window.zTabMask = function (x, v, g) {
    const h = document.getElementById('hdi'); if (!h) return;
    const r = x + v, fl = Math.min(x, g), fr = Math.max(0, Math.min(h.offsetWidth - r, g));
    const m = `linear-gradient(90deg,transparent ${x - fl}px,#000 ${x}px,#000 ${r}px,transparent ${r + fr}px)`;
    h.style.webkitMaskImage = m; h.style.maskImage = m;
  };
  // baris tab di atas: hitung ulang posisi setelah huruf dimuat atau lebar tab berubah (mis. ganti bahasa)
  function tabs() {
    const h = document.getElementById('hdi'); if (!h || typeof window.sync !== 'function') return;
    const re = () => { try { window.sync() } catch (e) { } };
    if (window.ResizeObserver) new ResizeObserver(re).observe(h);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(re);
  }
  // bilah status HP (theme-color) mengikuti latar aplikasi, bukan warna lain di atas kepala halaman
  function bar() {
    const m = document.querySelector('meta[name="theme-color"]'); if (!m) return;
    const up = () => { const c = getComputedStyle(document.body).backgroundColor; if (c && c !== 'rgba(0, 0, 0, 0)') m.setAttribute('content', c) };
    new MutationObserver(up).observe(document.documentElement, { attributes: true, attributeFilter: ['data-app', 'data-theme'] });
    if (window.matchMedia) { const q = matchMedia('(prefers-color-scheme: dark)'); q.addEventListener ? q.addEventListener('change', up) : q.addListener(up) }
    up();
  }
  // isian kata sandi: tombol mata di dalam isian untuk melihat atau menyembunyikan kata sandi
  const EYE = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z"/><circle cx="12" cy="12" r="3"/></svg>';
  const EYE_OFF = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9.9 5.2A10.4 10.4 0 0 1 12 5c6.5 0 10 7 10 7a17.6 17.6 0 0 1-2.6 3.6M6.6 6.6C3.8 8.4 2 12 2 12s3.5 7 10 7a10 10 0 0 0 5.4-1.6"/><path d="M9.9 9.9a3 3 0 0 0 4.2 4.2"/><path d="M2 2l20 20"/></svg>';
  function eye(inp) {
    if (inp.dataset.zpw) return; inp.dataset.zpw = '1';
    const w = document.createElement('span'), b = document.createElement('button');
    w.className = 'zpw'; b.type = 'button'; b.className = 'zpe';
    w.style.marginTop = getComputedStyle(inp).marginTop; inp.style.marginTop = '0';
    inp.parentNode.insertBefore(w, inp); w.append(inp, b);
    const up = () => {
      const s = inp.type !== 'password', t = s ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi', l = window.ztr ? window.ztr(t) : t;
      b.innerHTML = s ? EYE_OFF : EYE; b.title = l; b.setAttribute('aria-label', l); b.setAttribute('aria-pressed', String(s));
      w.style.display = inp.style.display === 'none' ? 'none' : '';
    };
    b.onclick = () => { inp.type = inp.type === 'password' ? 'text' : 'password'; inp.focus() };
    new MutationObserver(up).observe(inp, { attributes: true, attributeFilter: ['type', 'style'] }); up();
  }
  function eyes() {
    const scan = () => document.querySelectorAll('input[type="password"]:not([data-zpw])').forEach(eye);
    new MutationObserver(scan).observe(document.body, { childList: true, subtree: true }); scan();
  }
  const go = () => { watch(); tabs(); bar(); eyes() };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', go); else go();
})();
