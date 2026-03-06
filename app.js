const express = require('express');
const cors = require('cors');
const { nanoid } = require('nanoid');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken'); 
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const app = express();
const port = 3000;

const JWT_SECRET = "super_secret_store_key";
const ACCESS_EXPIRES_IN = "1h";

app.use(express.json());
app.use(cors({
    origin: "http://localhost:3001",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"], 
}));

// --- Базы данных в оперативной памяти ---
let users = [];

// ВСЕ 10 ТОВАРОВ ВЕРНУЛИСЬ!
let products = [
    { id: nanoid(6), title: 'iPhone 15 Pro Max', category: 'Смартфоны', description: 'Мощный процессор A17', price: 78000, stock: 89, image: 'https://p.turbosquid.com/ts-thumb/0M/yPA1jD/Lt/iphone_15_pro_05/jpg/1698233977/1920x1080/fit_q87/136f586679ef9dc4f5334bbe659f185c73b69882/iphone_15_pro_05.jpg' },
    { id: nanoid(6), title: 'Samsung Galaxy S25 Ultra', category: 'Смартфоны', description: 'Зачем тебе он за такую цену? Купи iPhone', price: 155000, stock: 58, image: 'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?auto=format&fit=crop&q=80&w=800' },
    { id: nanoid(6), title: 'Apple MacBook Pro 16 M4', category: 'Ноутбуки', description: 'Цена убила, но бери', price: 1099990, stock: 67, image: 'https://avatars.mds.yandex.net/get-mpic/12168282/2a00000192cd6fabde16264089349d8d6fe2/orig' },
    { id: nanoid(6), title: 'ASUS ROG Strix G835', category: 'Ноутбуки', description: 'Игровой монстр', price: 455999 , stock: 52, image: 'https://avatars.mds.yandex.net/get-altay/13220782/2a000001916830e59aa8f500bdecf6027946/XXL_height' },
    { id: nanoid(6), title: 'Logitech G435', category: 'Наушники', description: 'Лучшие в своем роде', price: 4899, stock: 120, image: 'https://ir.ozone.ru/s3/multimedia-1-o/w1200/6924052176.jpg' },
    { id: nanoid(6), title: 'Apple AirPods Pro 3', category: 'Наушники', description: 'Шумоподавление пушка', price: 25699, stock: 261, image: 'https://ir.ozone.ru/s3/multimedia-q/6559594970.jpg' },
    { id: nanoid(6), title: 'Apple iPad Pro (M4)', category: 'Планшеты', description: 'Идеален для учебы', price: 121999, stock: 0, image: 'https://frankfurt.apollo.olxcdn.com/v1/files/ey53r12bxakk1-KZ/image' },
    { id: nanoid(6), title: 'ARDOR GAMING Phantom PRO V2', category: 'Аксессуары', description: 'Мышь для профи', price: 4199, stock: 273, image: 'https://basket-32.wbbasket.ru/vol6561/part656132/656132951/images/big/1.webp' },
    { id: nanoid(6), title: 'WLmouse Ying75', category: 'Аксессуары', description: 'Механическая клавиатура', price: 36000, stock: 189, image: 'https://avatars.mds.yandex.net/get-mpic/16388639/2a0000019a7b50756e793e82137de976a538/orig' },
    { id: nanoid(6), title: 'MSI MAG 274QF X24', category: 'Мониторы', description: '2K монитор для игр в 240 кадров', price: 20199, stock: 131, image: 'https://dbklik.co.id/public/uploads/all/mnL5pdf8ov6jHXf9jwsn6ElZpncAQIoRNrPomBRJ.png' },
];

// --- Вспомогательные функции ---
async function hashPassword(password) {  
	return bcrypt.hash(password, 10);  
}

async function verifyPassword(password, passwordHash) {  
	return bcrypt.compare(password, passwordHash);  
}

// --- Middleware для защиты маршрутов (JWT) ---
function authMiddleware(req, res, next) {
    const header = req.headers.authorization || "";
    const [scheme, token] = header.split(" ");
  
    if (scheme !== "Bearer" || !token) {
      return res.status(401).json({ error: "Отсутствует или неверен заголовок Authorization" });
    }
  
    try {
      const payload = jwt.verify(token, JWT_SECRET);
      req.user = payload; 
      next();
    } catch (err) {
      return res.status(401).json({ error: "Недействительный или просроченный токен" });
    }
}

// --- Настройка Swagger ---
const swaggerOptions = {
    definition: {
        openapi: '3.0.0',
        info: { title: 'API Магазина + JWT Auth', version: '1.0.0' },
        servers: [{ url: `http://localhost:${port}` }],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                }
            }
        }
    },
    apis: ['./app.js'],
};
const swaggerSpec = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));


// ==========================================
//           МАРШРУТЫ АВТОРИЗАЦИИ
// ==========================================

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Регистрация
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email: { type: string }
 *               first_name: { type: string }
 *               last_name: { type: string }
 *               password: { type: string }
 *     responses:
 *       201: { description: "Успешно" }
 */
app.post("/api/auth/register", async (req, res) => {
    const { email, first_name, last_name, password } = req.body;
    if (!email || !first_name || !last_name || !password) return res.status(400).json({ error: "Заполните все поля" });

    const existingUser = users.find(u => u.email === email);
    if (existingUser) return res.status(400).json({ error: "Email занят" });

    const newUser = {
        id: nanoid(6),
        email, first_name, last_name,
        hashedPassword: await hashPassword(password)
    };
    users.push(newUser);

    const { hashedPassword, ...userWithoutPassword } = newUser;
    res.status(201).json(userWithoutPassword);
});

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Вход в систему (Получение токена)
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email: { type: string }
 *               password: { type: string }
 *     responses:
 *       200: { description: "Успешная авторизация (возвращает accessToken)" }
 */
app.post("/api/auth/login", async (req, res) => {
    const { email, password } = req.body;
    const user = users.find(u => u.email === email);
    if (!user) return res.status(401).json({ error: "Неверные данные" });

    const isValid = await verifyPassword(password, user.hashedPassword);
    if (!isValid) return res.status(401).json({ error: "Неверные данные" });

    const accessToken = jwt.sign(
        { sub: user.id, email: user.email },
        JWT_SECRET,
        { expiresIn: ACCESS_EXPIRES_IN }
    );

    res.status(200).json({ accessToken });
});

/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     summary: Получить данные текущего пользователя
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200: { description: "Данные пользователя" }
 *       401: { description: "Не авторизован" }
 */
app.get("/api/auth/me", authMiddleware, (req, res) => {
    const userId = req.user.sub;
    const user = users.find(u => u.id === userId);
    
    if (!user) return res.status(404).json({ error: "Пользователь не найден" });
  
    res.json({ id: user.id, email: user.email, first_name: user.first_name, last_name: user.last_name });
});

// ==========================================
//             МАРШРУТЫ ТОВАРОВ
// ==========================================

/**
 * @swagger
 * /api/products:
 *   get:
 *     summary: Получить список товаров
 *     tags: [Products]
 *     responses:
 *       200: { description: "Список товаров" }
 */
app.get('/api/products', (req, res) => { res.json(products); });

/**
 * @swagger
 * /api/products:
 *   post:
 *     summary: Создать товар
 *     tags: [Products]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title: { type: string }
 *               price: { type: integer }
 *               category: { type: string }
 *               description: { type: string }
 *               stock: { type: integer }
 *               image: { type: string }
 *     responses:
 *       201: { description: "Товар создан" }
 */
app.post('/api/products', (req, res) => {
    const { title, category, description, price, stock, image } = req.body;
    if (!title || !price) return res.status(400).json({ error: 'Укажите title и price' });

    const newProduct = {
        id: nanoid(6), title: title.trim(), category: category || 'Разное',
        description: description || '', price: Number(price), stock: Number(stock) || 0,
        image: image || 'https://via.placeholder.com/400x300?text=Нет+фото' 
    };

    products.push(newProduct);
    res.status(201).json(newProduct);
});

// --- ЗАЩИЩЕННЫЕ МАРШРУТЫ ТОВАРОВ (ТОЛЬКО С ТОКЕНОМ) ---

/**
 * @swagger
 * /api/products/{id}:
 *   get:
 *     summary: Получить товар по id (Защищено)
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters: [{ in: path, name: id, required: true, schema: { type: string } }]
 *     responses:
 *       200: { description: "Данные товара" }
 */
app.get('/api/products/:id', authMiddleware, (req, res) => {
    const product = products.find(p => p.id === req.params.id);
    if (product) res.json(product);
    else res.status(404).json({ error: 'Товар не найден' });
});

/**
 * @swagger
 * /api/products/{id}:
 *   put:
 *     summary: Обновить параметры товара (Защищено)
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters: [{ in: path, name: id, required: true, schema: { type: string } }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title: { type: string }
 *               price: { type: integer }
 *               category: { type: string }
 *               description: { type: string }
 *               stock: { type: integer }
 *               image: { type: string }
 *     responses:
 *       200: { description: "Товар обновлен" }
 */
app.put('/api/products/:id', authMiddleware, (req, res) => {
    const product = products.find(p => p.id === req.params.id);
    if (!product) return res.status(404).json({ error: 'Товар не найден' });

    const { title, category, description, price, stock, image } = req.body;
    if (title) product.title = title.trim();
    if (category) product.category = category;
    if (description) product.description = description;
    if (price !== undefined) product.price = Number(price);
    if (stock !== undefined) product.stock = Number(stock);
    if (image !== undefined) product.image = image;

    res.json(product);
});

/**
 * @swagger
 * /api/products/{id}:
 *   delete:
 *     summary: Удалить товар (Защищено)
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters: [{ in: path, name: id, required: true, schema: { type: string } }]
 *     responses:
 *       204: { description: "Товар удален" }
 */
app.delete('/api/products/:id', authMiddleware, (req, res) => {
    const exists = products.some(p => p.id === req.params.id);
    if (!exists) return res.status(404).json({ error: 'Товар не найден' });
    products = products.filter(p => p.id !== req.params.id);
    res.status(204).send();
});

app.listen(port, () => {
    console.log(`Сервер запущен: http://localhost:${port}`);
    console.log(`Swagger UI: http://localhost:${port}/api-docs`);
});