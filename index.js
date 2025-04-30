const express = require('express');
require('dotenv').config();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('./config/db');
const auth = require('./middleware/auth');


const app = express();
const port = process.env.PORT || 10000;
const secret = process.env.SECRET_KEY;

app.use(express.json());

//User Signup
app.post('/signup', async (req, res) => {
  const { username, password } = req.body;
  const hash = await bcrypt.hash(password, 10);

  db.query(
    'INSERT INTO users (username, password) VALUES (?, ?)',
    [username, hash],
    (err) => {
      if (err) return res.status(500).json({ error: 'Username already exists' });
      res.status(201).json({ message: 'User created' });
    }
  );
});

//User Login
app.post('/login', (req, res) => {
  const { username, password } = req.body;

  db.query('SELECT * FROM users WHERE username = ?', [username], async (err, results) => {
    if (err || results.length === 0) return res.status(400).json({ error: 'User not found' });
    const user = results[0];
    const validPass = await bcrypt.compare(password, user.password);
    if (!validPass) return res.status(400).json({ error: 'Invalid password' });

    const token = jwt.sign({ id: user.id }, secret);
    res.json({ token });
  });
});

//POST - Create Product
app.post('/products', auth, (req, res) => {
  const { productName, description, quantity, price } = req.body;
  const sql = 'INSERT INTO products (productName, description, quantity, price) VALUES (?, ?, ?, ?)';
  db.query(sql, [productName, description, quantity, price], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.status(201).json({ message: 'Product created', productId: result.insertId });
  });
});
//GET - All Products
app.get('/products', auth, (req, res) => {
  db.query('SELECT * FROM products', (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

//GET - One Product by ID
app.get('/products/:id', auth, (req, res) => {
  const productId = req.params.id;
  db.query('SELECT * FROM products WHERE productId = ?', [productId], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    if (results.length === 0) return res.status(404).json({ error: 'Product not found' });
    res.json(results[0]);
  });
});

//PUT - Update Product (Full)
app.put('/products/:id', auth, (req, res) => {
  if (!req.body) {
    return res.status(400).json({ "error": "Request body is required" });
  }
  const { productName, description, quantity, price } = req.body;
  if (!productName || !description || !quantity || !price) {
    return res.status(400).json({ error: 'All fields are required' });
  }
  db.query(
    'UPDATE products SET productName = ?, description = ?, quantity = ?, price = ? WHERE productId = ?',
    [productName, description, quantity, price, req.params.id],
    (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: 'Product updated' });
    }
  );
});

//PATCH - Update Price Only (Example)
app.patch('/products/:id', auth, (req, res) => {
  const { price } = req.body;
  db.query(
    'UPDATE products SET price = ? WHERE productId = ?',
    [price, req.params.id],
    (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: 'Price updated' });
    }
  );
});

//DELETE - Remove Product
app.delete('/products/:id', auth, (req, res) => {
  db.query('DELETE FROM products WHERE productId = ?', [req.params.id], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Product deleted' });
  });
}); `Q`

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
