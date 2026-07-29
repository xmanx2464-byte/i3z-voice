const CACHE_NAME = "i3z-voice-v1";
const urlsToCache = ["/", "/index.html"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(urlsToCache))
  );
});

self.addEventListener("fetch", (event) => {
  const url = event.request.url;
  // لا تخزن طلبات الـ functions أو لوحة التحكم أو أي API
  if (url.includes("/.netlify/functions/") || url.includes("dashboard")) {
    return; // اتركها تذهب مباشرة للسيرفر بدون تخزين مؤقت
  }
  event.respondWith(
    caches.match(event.request).then((response) => response || fetch(event.request))
  );
});
