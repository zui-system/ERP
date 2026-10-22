const C='zui-sys-v52',A=['./','index.html','manifest.webmanifest','zdata.js?v=2','zui-ui.css?v=4','zui-ui.js?v=2'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(C).then(c=>c.addAll(A)).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==C&&x.startsWith('zui-sys-')).map(x=>caches.delete(x)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{
  const h=new URL(e.request.url).hostname;
  if(e.request.method!=='GET'||(/(googleapis\.com|firebaseio\.com|firebaseapp\.com)$/.test(h)&&h!=='fonts.googleapis.com'))return;
  const nv=e.request.mode==='navigate';e.respondWith((nv?fetch(e.request.url,{cache:'no-store'}):fetch(e.request)).then(r=>{const c=r.clone();caches.open(C).then(x=>x.put(e.request,c)).catch(()=>{});return r})
    .catch(()=>caches.match(e.request).then(m=>m||caches.match('index.html'))));
});
self.addEventListener('notificationclick',e=>{e.notification.close();e.waitUntil(clients.openWindow('./'))});
