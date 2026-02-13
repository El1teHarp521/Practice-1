const express = require('express');
const app = express();
const port = 3000;

// Настройка парсинга JSON для обработки запросов
app.use(express.json());

// База данных товаров (id, название, цена)
let products = [
    { id: 1, name: 'Товар 1', price: 1000 },
    { id: 2, name: 'Товар 2', price: 2500 },
    { id: 3, name: 'Товар 3', price: 5000 },
];

// Получение всех товаров
app.get('/products', (req, res) => {
    res.json(products);
});

// Получение товара по ID
app.get('/products/:id', (req, res) => {
    const product = products.find(p => p.id === parseInt(req.params.id));
    if (product) res.json(product);
    else res.status(404).send('Товар не найден');
});

// Создание нового товара
app.post('/products', (req, res) => {
    const { name, price } = req.body;
    const newProduct = { id: Date.now(), name, price };
    products.push(newProduct);
    res.status(201).json(newProduct);
});

// Обновление товара
app.patch('/products/:id', (req, res) => {
    const product = products.find(p => p.id === parseInt(req.params.id));
    if (product) {
        if (req.body.name) product.name = req.body.name;
        if (req.body.price) product.price = req.body.price;
        res.json(product);
    } else {
        res.status(404).send('Товар не найден');
    }
});

// Удаление товара
app.delete('/products/:id', (req, res) => {
    products = products.filter(p => p.id !== parseInt(req.params.id));
    res.send('Товар удален');
});

// Запуск сервера
app.listen(port, () => {
    console.log(`Сервер запущен на http://localhost:${port}`);
});