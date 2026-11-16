/* 최우영고기야 레시피북 서비스워커 */
const CACHE='recipe-book-v5';
const ASSETS=['./','./index.html','./recipe-manifest.json','./recipe-icon-192.png','./recipe-icon-512.png','./recipe-apple-icon.png'];
self.addEventListener('install',e=>{
  e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)).then(()=>self.skipWaiting()));
});
self.addEventListener('activate',e=>{
  e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k.startsWith('recipe-book-')&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));
});
self.addEventListener('fetch',e=>{
  const req=e.request;
  if(req.method!=='GET')return;
  const url=new URL(req.url);
  if(url.origin!==location.origin)return; // 서버 시간 확인 등 외부 요청은 그대로
  // 최신 레시피 우선, 오프라인이면 저장본 사용
  e.respondWith(
    fetch(req).then(res=>{
      if(res.ok){const cp=res.clone();caches.open(CACHE).then(c=>c.put(req,cp));}
      return res;
    }).catch(()=>caches.match(req).then(r=>r||caches.match('./index.html')))
  );
});
