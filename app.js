const express = require('express');
const cors = require('cors');
const { nanoid } = require('nanoid');

const app = express();
const port = 3000;

app.use(express.json());
app.use(cors({
    origin: "http://localhost:3001",
    methods: ["GET", "POST", "PATCH", "DELETE"],
    allowedHeaders: ["Content-Type"],
}));

// Начальные данные +  картинки
let products = [
    { id: nanoid(6), name: 'iPhone 15 Pro Max', category: 'Смартфоны', description: 'Мощный процессор A17', price: 78000, stock: 89, image: 'https://p.turbosquid.com/ts-thumb/0M/yPA1jD/Lt/iphone_15_pro_05/jpg/1698233977/1920x1080/fit_q87/136f586679ef9dc4f5334bbe659f185c73b69882/iphone_15_pro_05.jpg' },
    { id: nanoid(6), name: 'Samsung Galaxy S25 Ultra', category: 'Смартфоны', description: 'Зачем тебе он за такую цену? Купи iPhone', price: 155000, stock: 58, image: 'https://i.ebayimg.com/images/g/vQQAAOSwuCZnk77v/s-l1600.jpg' },
    { id: nanoid(6), name: 'Apple MacBook Pro 16 M4', category: 'Ноутбуки', description: 'Цена убила, но бери', price: 1099990, stock: 67, image: 'https://avatars.mds.yandex.net/get-mpic/12168282/2a00000192cd6fabde16264089349d8d6fe2/orig' },
    { id: nanoid(6), name: 'ASUS ROG Strix G835', category: 'Ноутбуки', description: 'Игровой монстр', price: 455999 , stock: 52, image: 'https://avatars.mds.yandex.net/get-mpic/16460090/2a0000019a96c2e77fea4585baa54caf671e/orig' },
    { id: nanoid(6), name: 'Logitech G435', category: 'Наушники', description: 'Лучшие в своем роде', price: 4899, stock: 120, image: 'https://ir.ozone.ru/s3/multimedia-1-o/w1200/6924052176.jpg' },
    { id: nanoid(6), name: 'Apple AirPods Pro 3', category: 'Наушники', description: 'Шумоподавление пушка', price: 25699, stock: 261, image: 'https://ir.ozone.ru/s3/multimedia-q/6559594970.jpg' },
    { id: nanoid(6), name: 'Apple iPad Pro (M4)', category: 'Планшеты', description: 'Идеален для учебы', price: 121999, stock: 0, image: 'https://i.ebayimg.com/images/g/XNYAAOSw6Otngps9/s-l1600.jpg' },
    { id: nanoid(6), name: 'ARDOR GAMING Phantom PRO V2', category: 'Аксессуары', description: 'Мышь для профи', price: 4199, stock: 273, image: 'https://basket-32.wbbasket.ru/vol6561/part656132/656132951/images/big/1.webp' },
    { id: nanoid(6), name: 'WLmouse Ying75', category: 'Аксессуары', description: 'Механическая клавиатура как у Рекрента', price: 36000, stock: 189, image: 'https://avatars.mds.yandex.net/get-mpic/16388639/2a0000019a7b50756e793e82137de976a538/orig' },
    { id: nanoid(6), name: 'MSI MAG 274QF X24', category: 'Мониторы', description: '2K монитор для игр в 240 кадров', price: 20199, stock: 131, image: 'https://dbklik.co.id/public/uploads/all/mnL5pdf8ov6jHXf9jwsn6ElZpncAQIoRNrPomBRJ.png' },
];

app.get('/api/products', (req, res) => {
    res.json(products);
});

app.get('/api/products/:id', (req, res) => {
    const product = products.find(p => p.id === req.params.id);
    if (product) res.json(product);
    else res.status(404).json({ error: 'Товар не найден' });
});

app.post('/api/products', (req, res) => {
    const { name, category, description, price, stock, image } = req.body;
    
    if (!name || !price) {
        return res.status(400).json({ error: 'Нужно указать название и цену' });
    }

    const newProduct = {
        id: nanoid(6),
        name: name.trim(),
        category: category || 'Разное',
        description: description || '',
        price: Number(price),
        stock: Number(stock) || 0,
        image: image || 'https://via.placeholder.com/400x300?text=Нет+фото' // Заглушка, если нет фото
    };

    products.push(newProduct);
    res.status(201).json(newProduct);
});

app.patch('/api/products/:id', (req, res) => {
    const product = products.find(p => p.id === req.params.id);
    if (!product) return res.status(404).json({ error: 'Товар не найден' });

    const { name, category, description, price, stock, image } = req.body;

    if (name) product.name = name.trim();
    if (category) product.category = category;
    if (description) product.description = description;
    if (price !== undefined) product.price = Number(price);
    if (stock !== undefined) product.stock = Number(stock);
    if (image !== undefined) product.image = image;

    res.json(product);
});

app.delete('/api/products/:id', (req, res) => {
    products = products.filter(p => p.id !== req.params.id);
    res.status(204).send();
});

app.listen(port, () => {
    console.log(`Сервер запущен: http://localhost:${port}`);
});