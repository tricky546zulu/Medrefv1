// Define a new name for the cache to force an update
const CACHE_NAME = 'paramedic-guide-cache-v2';

// List of files to cache. This list is more comprehensive to ensure all assets are available offline.
const urlsToCache = [
  './', // Caches the root URL
  './index.html',
  './manifest.json',
  'https://cdn.tailwindcss.com',
  'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap'
];

// Install event: opens the cache and adds the core files to it.
self.addEventListener('install', event => {
  console.log('Service Worker: Installing new version...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Service Worker: Caching app shell');
        // Use addAll to ensure all assets are cached. If one fails, the entire install fails.
        return cache.addAll(urlsToCache);
      })
      .then(() => self.skipWaiting()) // Activate the new service worker immediately
  );
});

// Activate event: this is where we clean up old caches.
self.addEventListener('activate', event => {
  console.log('Service Worker: Activating new version...');
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        // Delete any caches that are not our current one
        cacheNames.filter(cacheName => cacheName !== CACHE_NAME).map(cacheName => {
          console.log('Service Worker: Deleting old cache:', cacheName);
          return caches.delete(cacheName);
        })
      );
    }).then(() => self.clients.claim()) // Take control of all open clients
  );
});

// Fetch event: serves assets from cache first (cache-first strategy).
self.addEventListener('fetch', event => {
  // We only want to handle GET requests
  if (event.request.method !== 'GET') {
    return;
  }

  event.respondWith(
    caches.open(CACHE_NAME).then(cache => {
      return cache.match(event.request).then(response => {
        // Return the cached response if it exists.
        // Otherwise, fetch from the network, cache it, and then return the network response.
        const fetchPromise = fetch(event.request).then(networkResponse => {
          // Check if we received a valid response
          if (networkResponse && networkResponse.status === 200) {
            cache.put(event.request, networkResponse.clone());
          }
          return networkResponse;
        });

        // Return the cached response immediately if found, otherwise wait for the network.
        return response || fetchPromise;
      });
    })
  );
});

