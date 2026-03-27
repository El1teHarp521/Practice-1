const CACHE_NAME = 'task-manager-v4';
const ASSETS = [
    './',
    './index.html',
    './app.js',
    './manifest.json',
    'https://fonts.googleapis.com/css2?family=Montserrat:wght@400;700;900&display=swap'
];

self.addEventListener('install', event => {
    event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', event => {
    event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))));
});

self.addEventListener('fetch', event => {
    event.respondWith(caches.match(event.request).then(res => res || fetch(event.request)));
});

// --- 1. Показ Push-уведомления ---
self.addEventListener('push', (event) => {
    let data = { title: 'Уведомление', body: '', reminderId: null };
    
    if (event.data) {
        data = event.data.json();
    }
    
    const options = {
        body: data.body,
        icon: './icons/icon-192.png',
        badge: './icons/icon-192.png',
        data: { reminderId: data.reminderId },
        requireInteraction: true // Уведомление не исчезнет само по себе
    };

    if (data.reminderId) {
        options.actions = [
            { action: 'snooze', title: '⏳ Отложить на 5 минут' }
        ];
    }
    
    event.waitUntil(
        self.registration.showNotification(data.title, options)
    );
});

// --- 2. Обработка клика по кнопке "Отложить" ---
self.addEventListener('notificationclick', (event) => {
    const notification = event.notification;
    const action = event.action;

    // Если нажали кнопку "Отложить"
    if (action === 'snooze') {
        const reminderId = notification.data.reminderId;
        event.waitUntil(
            fetch(`http://localhost:3001/snooze?reminderId=${reminderId}`, { method: 'POST' })
                .then(() => notification.close())
                .catch(err => console.error('Ошибка откладывания:', err))
        );
    } else {
        notification.close();
    }
});