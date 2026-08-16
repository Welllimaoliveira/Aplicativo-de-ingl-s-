const CACHE='fala-real-v4-ai-vercel';
const CORE=['./','./index.html','./manifest.webmanifest','./vocabulary-bank.js'];
self.addEventListener('install',event=>event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(CORE)).then(()=>self.skipWaiting())));
self.addEventListener('activate',event=>event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(key=>key!==CACHE).map(key=>caches.delete(key)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',event=>{
  if(event.request.method!=='GET')return;
  const url=new URL(event.request.url);
  if(url.origin===self.location.origin&&url.pathname.startsWith('/api/'))return;
  event.respondWith(fetch(event.request).then(response=>{
    let copy=response.clone();
    caches.open(CACHE).then(cache=>cache.put(event.request,copy));
    return response
  }).catch(()=>caches.match(event.request).then(hit=>hit||caches.match('./index.html'))))
});
