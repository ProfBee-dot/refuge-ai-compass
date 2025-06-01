const CACHE_NAME = 'refugeeaid-cache-v1';
const OFFLINE_URL = '/offline.html';
const OFFLINE_VERSION = 1.0;


// Fetch the manifest and cache the assets
async function cacheAssets() {
    const cache = await caches.open(CACHE_NAME);

    // Fetch the manifest.json file
    let assetsToCache = [];
    // try {
    //     const response = await fetch('/.vite/manifest.json');
    //     if (!response.ok) {
    //         throw new Error('Failed to fetch manifest.json');
    //     }
    //     const manifest = await response.json();
    //     assetsToCache = Object.values(manifest).map(entry => entry.file);
    // } catch (error) {
    //     console.error('Error fetching manifest:', error);
    // }

    // Add additional static assets (e.g., HTML files)
    // const staticAssets = [
    //     '/index.html',
    //     '/offline.html', // included offline file
    //     '/logo.png',
    //     '/manifest.json',
    //     '/assets/emergency-main.[hash].js',
    // ];

    
      // Match emergency JS dynamically
      const manifest = await fetch('/.vite/manifest.json').then(r => r.json());
      const emergencyJs = Object.values(manifest).find((asset) =>
        asset.file?.startsWith('assets/emergency-main-')
      )?.file;

      const urlsToCache = [
        '/offline.html',
        '/logo.png',
        '/manifest.json',
        emergencyJs ? `/${emergencyJs}` : null
      ].filter(Boolean);

    // Cache all assets
    return cache.addAll(urlsToCache);
}

  
// Install the Service Worker
self.addEventListener('install', (event) => {
    event.waitUntil(
        cacheAssets().catch((error) => {
            console.error('Failed to cache assets:', error);
        })
    );
});


self.addEventListener('fetch', (event) => {
    // We only want to call event.respondWith() if this is a navigation request
    // for an HTML page.
    const {request} = event;
    event.respondWith(
      fetch(request).catch(() =>
        caches.match(OFFLINE_URL)
      )
    );

});


// Update the Service Worker and clear old caches
self.addEventListener('activate', (event) => {
    const cacheWhitelist = [CACHE_NAME];

    event.waitUntil( (async _ => {
        if ('navigationPreload' in self.registration) {
          await self.registration.navigationPreload.enable();
        };

        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (!cacheWhitelist.includes(cacheName)) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    })());
});