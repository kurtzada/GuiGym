/* Cache local do PWA: inclui os novos arquivos visuais sem alterar os dados. */
const CACHE = 'guigym-v12-elite-visual-20261108';
const ASSETS = [
  './', './index.html', './manifest.webmanifest', './icon.svg', './apple-touch-icon.png',
  './guigym-music.js', './guigym-enhancements.js',
  './vendor/chart.umd.min.js', './vendor/purify.min.js', './vendor/lucide.min.js',
  './elite-skin.css', './elite-visual.js',
  './elite-assets/fonts/barlow-condensed-latin-700-normal.woff2',
  './elite-assets/fonts/barlow-condensed-latin-800-normal.woff2',
  './elite-assets/fonts/dm-sans-latin-wght-normal.woff2',
  './elite-assets/images/guilherme-portrait-elite.webp',
  './elite-assets/images/supino-inclinado-elite.webp',
  './elite-assets/images/remada-elite.webp',
  './elite-assets/images/desenvolvimento-elite.webp',
  './elite-assets/images/agachamento-elite.webp'
];
self.addEventListener('install', e => {
  self.skipWaiting();
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)));
});
self.addEventListener('activate', e => e.waitUntil(
  caches.keys()
    .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
    .then(() => self.clients.claim())
));
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  if (e.request.mode === 'navigate') {
    e.respondWith(fetch(e.request).then(r => {
      if (r.ok) {
        const copy = r.clone();
        caches.open(CACHE).then(c => c.put(e.request, copy));
      }
      return r;
    }).catch(() => caches.match('./index.html')));
  } else {
    e.respondWith(caches.match(e.request).then(r => r || fetch(e.request)));
  }
});
