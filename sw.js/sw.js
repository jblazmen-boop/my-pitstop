// =========================================
// 1. CONFIGURACIÓN DE CACHÉ (Network First)
// =========================================
const CACHE_NAME = 'my-pitstop-cache-v100'; // <--- Si cambias algo, sube este número (v101, v102...)

const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './css/styles.css',
  './js/app.js',
  './manifest.json'
];

// Instalación: Guarda los archivos base
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    }).then(() => self.skipWaiting())
  );
});

// Activación: Borra cachés viejas
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch: Estrategia Red Primero (Network First)
// Esto asegura que siempre veas los cambios nuevos si tienes internet
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  
  // Ignorar Firebase y extensiones
  if (event.request.url.includes('firestore') || 
      event.request.url.includes('firebase') || 
      event.request.url.includes('chrome-extension')) {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        // Si hay respuesta de la red, actualizamos la caché
        if (networkResponse && networkResponse.status === 200 && event.request.url.startsWith(self.location.origin)) {
          const responseClone = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone);
          });
        }
        return networkResponse;
      })
      .catch(() => {
        // Si no hay internet, usamos lo que haya en caché
        return caches.match(event.request);
      })
  );
});

// =========================================
// 2. NOTIFICACIONES PUSH (Tu código original)
// =========================================
self.addEventListener('push', function(event) {
  const options = {
    body: event.data ? event.data.text() : 'Tienes un recordatorio pendiente en My PitStop.',
    icon: 'logo-nuevo.png',
    badge: 'logo-nuevo.png',
    vibrate: [200, 100, 200]
  };
  event.waitUntil(
    self.registration.showNotification('My PitStop', options)
  );
});

// Extra: Abrir la app al tocar la notificación
self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: 'window' }).then(windowClients => {
      for (let i = 0; i < windowClients.length; i++) {
        let client = windowClients[i];
        if (client.url === '/' && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow('/');
      }
    })
  );
});