// Service Worker for TaskPan PWA - Offline Support & Push Notifications
const CACHE_NAME = 'taskpan-pwa-v5';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.ico',
  '/icon.svg',
  '/icon-192.png',
  '/icon-512.png',
  '/apple-touch-icon.png',
  '/apple-touch-icon-precomposed.png',
  '/apple-touch-icon-120x120.png',
  '/apple-touch-icon-152x152.png',
  '/apple-touch-icon-167x167.png',
  '/favicon.png'
];

// Install Event: Cache Core Assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS).catch((err) => {
        console.warn('Some assets could not be pre-cached:', err);
      });
    })
  );
  self.skipWaiting();
});

// Activate Event: Clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch Event: Network-first with cache fallback for navigation, Cache-first for static icons
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET and API/TTS requests
  if (request.method !== 'GET' || url.pathname.startsWith('/api/')) {
    return;
  }

  // Static images and fonts cache-first
  if (
    url.pathname.endsWith('.png') ||
    url.pathname.endsWith('.svg') ||
    url.pathname.endsWith('.ico') ||
    url.hostname.includes('fonts.googleapis.com') ||
    url.hostname.includes('fonts.gstatic.com')
  ) {
    event.respondWith(
      caches.match(request).then((cached) => {
        return (
          cached ||
          fetch(request).then((response) => {
            if (response.ok) {
              const resClone = response.clone();
              caches.open(CACHE_NAME).then((cache) => cache.put(request, resClone));
            }
            return response;
          })
        );
      })
    );
    return;
  }

  // Navigation requests: Network first, fallback to cache
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request).catch(() => {
        return caches.match('/index.html') || caches.match('/');
      })
    );
    return;
  }
});

// Push Notifications Event (Web Push Protocol)
self.addEventListener('push', (event) => {
  let data = {
    title: '⏰ Pengingat TaskPan',
    body: 'Anda memiliki tugas atau peringatan anggaran baru!',
    tag: 'taskpan-general',
    url: '/',
  };

  if (event.data) {
    try {
      data = event.data.json();
    } catch (e) {
      data.body = event.data.text();
    }
  }

  const options = {
    body: data.body || data.message || 'Buka TaskPan untuk melihat detail.',
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    image: data.image || undefined,
    vibrate: [300, 100, 300, 100, 400],
    tag: data.tag || `taskpan-${Date.now()}`,
    renotify: true,
    requireInteraction: true,
    data: {
      url: data.url || '/',
      timestamp: Date.now(),
    },
    actions: [
      { action: 'open', title: '📱 Buka Aplikasi' },
      { action: 'dismiss', title: 'Tutup' }
    ]
  };

  event.waitUntil(self.registration.showNotification(data.title || 'TaskPan Reminder', options));
});

// Notification Click Event: Focus existing window or open new one
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'dismiss') {
    return;
  }

  const targetUrl = event.notification.data?.url || '/';

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if ('focus' in client) {
          if (client.url.includes(self.location.origin)) {
            return client.focus();
          }
        }
      }
      if (self.clients.openWindow) {
        return self.clients.openWindow(targetUrl);
      }
    })
  );
});

// In-memory alarms store inside Service Worker
let scheduledAlarms = [];

function checkPendingAlarms() {
  const now = Date.now();
  const dueAlarms = scheduledAlarms.filter((a) => a.time <= now && !a.executed);
  
  dueAlarms.forEach((alarm) => {
    alarm.executed = true;
    self.registration.showNotification(alarm.title || 'Pengingat TaskPan', {
      body: alarm.body || 'Waktunya menyelesaikan jadwal Anda!',
      icon: '/icon-192.png',
      badge: '/icon-192.png',
      vibrate: [300, 100, 300, 100, 400],
      tag: alarm.tag || `alarm-${alarm.id}`,
      renotify: true,
      requireInteraction: true,
      data: { url: '/', id: alarm.id }
    });
  });

  // Keep future alarms only
  scheduledAlarms = scheduledAlarms.filter((a) => !a.executed);
}

// Background ticker in Service Worker
setInterval(checkPendingAlarms, 15000);

// Listen for message from main thread (for direct SW notification triggering and alarms)
self.addEventListener('message', (event) => {
  if (!event.data) return;

  if (event.data.type === 'SHOW_NOTIFICATION') {
    const { title, options } = event.data;
    self.registration.showNotification(title || 'TaskPan', {
      icon: '/icon-192.png',
      badge: '/icon-192.png',
      vibrate: [300, 100, 300, 100, 400],
      ...options,
    });
  } else if (event.data.type === 'SCHEDULE_ALARMS') {
    const { alarms } = event.data;
    if (Array.isArray(alarms)) {
      scheduledAlarms = alarms.map((a) => ({ ...a, executed: false }));
      checkPendingAlarms();
    }
  } else if (event.data.type === 'SCHEDULE_SINGLE_ALARM') {
    const { alarm } = event.data;
    if (alarm && alarm.time) {
      scheduledAlarms.push({ ...alarm, executed: false });
      checkPendingAlarms();
    }
  }
});
