const express = require('express');
const app = express();
const port = 3000;

// Middleware, чтобы сервер понимал JSON-данные в запросах
app.use(express.json());

// Массив товаров (как база данных)
// Поля по заданию: id, название (name), стоимость (price)
let products = [
    { id: 1, name: 'Товар 1', price: 1000 },
    { id: 2, name: 'Товар 2', price: 2500 },
    { id: 3, name: 'Товар 3', price: 5000 },
];

// --- 1. Просмотр всех товаров (GET) ---
app.get('/products', (req, res) => {
    res.json(products);
});

// --- 2. Просмотр товара по id (GET) ---
app.get('/products/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const product = products.find(p => p.id === id);
    
    if (product) {
        res.json(product);
    } else {
        res.status(404).json({ message: 'Товар не найден' });
    }
});

// --- 3. Добавление товара (POST) ---
app.post('/products', (req, res) => {
    const { name, price } = req.body;

    // Проверка, что данные прислали
    if (!name || !price) {
        return res.status(400).json({ message: 'Нужно указать название (name) и стоимость (price)' });
    }

    const newProduct = {
        id: Date.now(), // Генерируем уникальный ID
        name,
        price
    };

    products.push(newProduct);
    res.status(201).json(newProduct);
});

// --- 4. Редактирование товара (PATCH) ---
app.patch('/products/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const product = products.find(p => p.id === id);

    if (!product) {
        return res.status(404).json({ message: 'Товар не найден' });
    }

    // Обновляем только те поля, которые прислали
    if (req.body.name) product.name = req.body.name;
    if (req.body.price) product.price = req.body.price;

    res.json(product);
});

// --- 5. Удаление товара (DELETE) ---
app.delete('/products/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const initialLength = products.length;
    
    // Фильтруем массив: оставляем всё, кроме удаляемого ID
    products = products.filter(p => p.id !== id);

    if (products.length < initialLength) {
        res.json({ message: 'Товар удален' });
    } else {
        res.status(404).json({ message: 'Товар не найден' });
    }
});

// Запуск сервера
app.listen(port, () => {
    console.log(`Сервер запущен: http://localhost:${port}`);
    console.log(`Список товаров доступен по адресу: http://localhost:${port}/products`);
});