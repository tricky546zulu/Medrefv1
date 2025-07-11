// Define a name for the cache
const CACHE_NAME = 'paramedic-guide-cache-v1';

// List of files to cache when the service worker is installed.
// This includes the main HTML file and critical external resources.
const urlsToCache = [
  '/',
  '/index.html',
  'https://cdn.tailwindcss.com',
  'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap'
];

// Install event: opens the cache and adds the core files to it.
self.addEventListener('install', event => {
  console.log('Service Worker: Installing...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Service Worker: Caching app shell');
        return cache.addAll(urlsToCache);
      })
      .then(() => self.skipWaiting()) // Activate the new service worker immediately
  );
});

// Activate event: cleans up old caches.
self.addEventListener('activate', event => {
  console.log('Service Worker: Activating...');
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cache => {
          if (cache !== CACHE_NAME) {
            console.log('Service Worker: Clearing old cache');
            return caches.delete(cache);
          }
        })
      );
    })
  );
  return self.clients.claim(); // Take control of all open clients
});

// Fetch event: serves assets from cache first.
// If the resource isn't in the cache, it fetches it from the network.
self.addEventListener('fetch', event => {
  console.log('Service Worker: Fetching ', event.request.url);
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // If the request is in the cache, return the cached version
        if (response) {
          return response;
        }
        // Otherwise, fetch the request from the network
        return fetch(event.request);
      })
      .catch(error => {
        // This is a simplified offline fallback. 
        // For a more robust app, you might want a custom offline page.
        console.log('Fetch failed; returning offline page instead.', error);
      })
  );
});

