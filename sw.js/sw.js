// Service Worker para notificaciones de My PitStop
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