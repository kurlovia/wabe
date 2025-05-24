const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;

// Настройки CORS
app.use(cors({
  origin: 'http://localhost:3000',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type']
}));

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Пути к данным
const PRODUCTS_FILE = path.join(__dirname, 'data', 'products.json');
const USERS_FILE = path.join(__dirname, 'data', 'users.json');

// Чтение/запись данных
function readData(file) {
  try {
    const data = fs.readFileSync(file, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error(`Error reading ${file}:`, error);
    return [];
  }
}

function writeData(file, data) {
  fs.writeFileSync(file, JSON.stringify(data, null, 2), 'utf8');
}

// API для товаров
app.get('/api/products', (req, res) => {
  const products = readData(PRODUCTS_FILE);
  res.json(products);
});

app.get('/api/products/:id', (req, res) => {
  const products = readData(PRODUCTS_FILE);
  const product = products.find(p => p.id === parseInt(req.params.id));
  product ? res.json(product) : res.status(404).json({ error: 'Product not found' });
});

// API для пользователей
app.post('/api/register', (req, res) => {
  const users = readData(USERS_FILE);
  const newUser = { ...req.body, id: users.length + 1 };
  users.push(newUser);
  writeData(USERS_FILE, users);
  res.json(newUser);
});

// Обслуживание статических файлов
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', req.path));
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});