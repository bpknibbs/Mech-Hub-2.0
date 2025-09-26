// Service Worker for Offline Functionality
const CACHE_NAME = 'mech-hub-v1';
const urlsToCache = [
  '/',
  '/static/js/bundle.js',
  '/static/css/main.css',
  '/manifest.json'
];

// Install event
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
  );
});

// Fetch event
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Return cached version or fetch from network
        return response || fetch(event.request);
      }
    )
  );
});

// Background sync for offline form submissions
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    event.waitUntil(syncOfflineData());
  }
});

async function syncOfflineData() {
  // Sync offline form submissions when connection is restored
  const offlineData = await getOfflineData();
  for (const data of offlineData) {
    try {
      await submitFormData(data);
      await removeOfflineData(data.id);
    } catch (error) {
      console.error('Failed to sync data:', error);
    }
  }
}

async function getOfflineData() {
  // Get offline data from IndexedDB
  return [];
}

async function submitFormData(data) {
  // Submit form data to server
  return fetch('/api/submit', {
    method: 'POST',
    body: JSON.stringify(data),
    headers: { 'Content-Type': 'application/json' }
  });
}

async function removeOfflineData(id) {
  // Remove synced data from IndexedDB
}