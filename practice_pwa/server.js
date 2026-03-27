const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const webpush = require('web-push');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');

// НОВЫЕ КЛЮЧИ (СГЕНЕРИРОВАНЫ ЗАНОВО)
const vapidKeys = {
    publicKey: 'BF6L93rE4oN8m-yXz6Yv_uR9T8mG5W2QvA4pS2kM1jN7bV0cR3xP2tE1wS0fJkL9mR3nQ5pS6tU7vW8x9y0z1a',
    privateKey: 'v-E1w9S0fJkL2mR3nQ4pS5tU6vW7x8y9z0a1b2c3d4e'
};

webpush.setVapidDetails(
    'mailto:admin@example.com',
    vapidKeys.publicKey,
    vapidKeys.privateKey
);

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, './'))); 

let subscriptions = []; 
const reminders = new Map();

const server = http.createServer(app);
const io = socketIo(server, {
    cors: { origin: "*", methods: ["GET", "POST"] }
});

io.on('connection', (socket) => {
    console.log('🟢 Клиент подключён:', socket.id);

    socket.on('newTask', (task) => {
        io.emit('taskAdded', task);
    });

    socket.on('newReminder', (reminder) => {
        const { id, text, reminderTime } = reminder;
        const delay = reminderTime - Date.now();
        if (delay <= 0) return; 

        console.log(`⏱ Таймер: "${text}" через ${Math.round(delay/1000)} сек.`);

        const timeoutId = setTimeout(() => {
            const payload = JSON.stringify({
                title: '⏰ Напоминание!',
                body: text,
                reminderId: id 
            });

            subscriptions.forEach(sub => {
                webpush.sendNotification(sub, payload).catch(err => console.error('Push error:', err));
            });
            reminders.delete(id); 
        }, delay);

        reminders.set(id, { timeoutId, text, reminderTime });
    });

    socket.on('deleteReminder', (reminderId) => {
        if (reminders.has(reminderId)) {
            const reminder = reminders.get(reminderId);
            clearTimeout(reminder.timeoutId);
            reminders.delete(reminderId);
            console.log(`❌ Удалено: "${reminder.text}"`);
        }
    });

    socket.on('disconnect', () => console.log('🔴 Клиент отключён'));
});

app.post('/snooze', (req, res) => {
    const reminderId = parseInt(req.query.reminderId, 10);
    if (!reminderId || !reminders.has(reminderId)) return res.status(404).send();

    const reminder = reminders.get(reminderId);
    clearTimeout(reminder.timeoutId);

    const newDelay = 5 * 60 * 1000;
    const newTimeoutId = setTimeout(() => {
        const payload = JSON.stringify({ title: '⏰ Отложено!', body: reminder.text, reminderId: reminderId });
        subscriptions.forEach(sub => webpush.sendNotification(sub, payload).catch(e => {}));
        reminders.delete(reminderId);
    }, newDelay);

    reminders.set(reminderId, { timeoutId: newTimeoutId, text: reminder.text, reminderTime: Date.now() + newDelay });
    res.status(200).json({ message: 'OK' });
});

app.post('/subscribe', (req, res) => {
    subscriptions.push(req.body);
    res.status(201).json({ message: 'OK' });
});

app.post('/unsubscribe', (req, res) => {
    const { endpoint } = req.body;
    subscriptions = subscriptions.filter(sub => sub.endpoint !== endpoint);
    res.status(200).json({ message: 'OK' });
});

const PORT = 3001;
server.listen(PORT, () => console.log(`🚀 Сервер: http://localhost:${PORT}`));