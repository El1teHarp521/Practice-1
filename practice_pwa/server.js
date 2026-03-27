const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const webpush = require('web-push');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');

const vapidKeys = {
    publicKey: 'BMS825JFiGB14-d93Sg3n9g-kbxMdE9M6yLt9AnMKTWdHdLjPeG61yTPGNutovEn897wPVy11v5walHSE6q_mG0',
    privateKey: '3xGNj5nnTaqLj8y2ZGqQWnSPwhHaD-VtuMqx6XRgBio'
};

webpush.setVapidDetails(
    'mailto:test@example.com',
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

    // Обычная задача 
    socket.on('newTask', (task) => {
        io.emit('taskAdded', task);
    });

    // Задача с НАПОМИНАНИЕМ
    socket.on('newReminder', (reminder) => {
        const { id, text, reminderTime } = reminder;
        const delay = reminderTime - Date.now();
        
        if (delay <= 0) return;

        console.log(`⏱ Установлено напоминание "${text}" через ${Math.round(delay/1000)} сек.`);

        // Заводим таймер
        const timeoutId = setTimeout(() => {
            const payload = JSON.stringify({
                title: '⏰ Напоминание!',
                body: text,
                reminderId: id
            });

            subscriptions.forEach(sub => {
                webpush.sendNotification(sub, payload).catch(err => console.error('Push error:', err));
            });

            reminders.delete(id); // Удаляем таймер после срабатывания
        }, delay);
        reminders.set(id, { timeoutId, text, reminderTime });
    });

    socket.on('disconnect', () => {
        console.log('🔴 Клиент отключён:', socket.id);
        // Отмена напоминания
    socket.on('deleteReminder', (reminderId) => {
        if (reminders.has(reminderId)) {
            const reminder = reminders.get(reminderId);
            clearTimeout(reminder.timeoutId);
            reminders.delete(reminderId);
            console.log(`❌ Отменено напоминание: "${reminder.text}"`);
        }
    });
    });
});

// Эндпоинт для кнопки "Отложить на 5 минут"
app.post('/snooze', (req, res) => {
    const reminderId = parseInt(req.query.reminderId, 10);
    
    if (!reminderId || !reminders.has(reminderId)) {
        return res.status(404).json({ error: 'Напоминание не найдено' });
    }

    const reminder = reminders.get(reminderId);
    
    // 1. Отменяем старый таймер
    clearTimeout(reminder.timeoutId);

    // 2. Ставим новый на 5 минут
    const newDelay = 5 * 60 * 1000;
    console.log(`💤 Напоминание "${reminder.text}" отложено на 5 минут.`);

    const newTimeoutId = setTimeout(() => {
        const payload = JSON.stringify({
            title: '⏰ Отложенное напоминание!',
            body: reminder.text,
            reminderId: reminderId
        });

        subscriptions.forEach(sub => {
            webpush.sendNotification(sub, payload).catch(err => console.error('Push error:', err));
        });

        reminders.delete(reminderId);
    }, newDelay);

    // 3. Обновляем хранилище
    reminders.set(reminderId, {
        timeoutId: newTimeoutId,
        text: reminder.text,
        reminderTime: Date.now() + newDelay
    });

    res.status(200).json({ message: 'Отложено на 5 минут' });
});

// Эндпоинты подписок
app.post('/subscribe', (req, res) => {
    subscriptions.push(req.body);
    res.status(201).json({ message: 'Подписка сохранена' });
});
app.post('/unsubscribe', (req, res) => {
    const { endpoint } = req.body;
    subscriptions = subscriptions.filter(sub => sub.endpoint !== endpoint);
    res.status(200).json({ message: 'Подписка удалена' });
});

const PORT = 3001;
server.listen(PORT, () => {
    console.log(`🚀 Сервер запущен на http://localhost:${PORT}`);
});