/* ZUI ERP: Pengaturan di semua aplikasi dikelompokkan per bagian (judul .hh) menjadi kotak, dengan urutan yang sama:
   Akun → pengaturan khusus aplikasi → Pasang dan bagikan → Bahasa → Tampilan → bantuan/kaki halaman. */
(function () {
  'use strict';
  // judul dalam Bahasa Indonesia, English, Melayu (teks bisa sudah diterjemahkan saat dikelompokkan)
  const ORD = [[0, ['Akun', 'Account', 'Akaun']], [80, ['Pasang dan bagikan', 'Install and share', 'Pasang dan kongsi']], [81, ['Bahasa', 'Language']], [82, ['Tampilan', 'Appearance', 'Paparan']], [83, ['Data']]];
  const rank = t => { t = String(t || '').trim(); for (const [r, L] of ORD) if (L.includes(t)) return r; return 50 };
  const tail = n => n.nodeType === 1 && /(^|\s)(zfb|zfn|zft|zt)(\s|$)/.test(n.className || '');
  function group(sec) {
    // buka kelompok lama, lalu kelompokkan ulang dari awal
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
    for (const g of G) { if (!g.n.length) continue; const d = document.createElement('div'); d.className = 'zs'; g.n.forEach(x => d.appendChild(x)); f.appendChild(d) }
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
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', watch); else watch();
})();
