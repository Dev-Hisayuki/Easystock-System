// EasyStock back end: Express server + MySQL + user login (JWT) with roles
require('dotenv').config();
const express = require('express');
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const path = require('path');

const app = express();
app.use(express.json());

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-me';

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'easystock',
});

// ---------- Auth helpers ----------

// Requires a valid token on the request
function requireAuth(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return res.status(401).json({ error: 'Please log in' });
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ error: 'Session expired, please log in again' });
  }
}

// Requires the user to have one of the given roles
const requireRole = (...roles) => (req, res, next) =>
  roles.includes(req.user.role)
    ? next()
    : res.status(403).json({ error: 'You do not have permission for this' });

// Helper: run a query and return JSON
const query = (sql) => async (req, res) => {
  try {
    const [rows] = await pool.query(sql);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
};

// ---------- Pages ----------
app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'index.html')));

// ---------- Auth routes ----------
app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required' });
  }
  try {
    const [rows] = await pool.query(
      'SELECT * FROM users WHERE username = ? AND is_active = TRUE',
      [username]
    );
    const user = rows[0];
    // Same message for both cases so attackers can't tell which was wrong
    if (!user || !(await bcrypt.compare(password, user.password_hash))) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }
    const payload = {
      user_id: user.user_id,
      username: user.username,
      full_name: user.full_name,
      role: user.role,
      department_id: user.department_id,
    };
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '8h' });
    res.json({ token, user: payload });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});

app.get('/api/me', requireAuth, (req, res) => res.json(req.user));

// ---------- Data routes (login required) ----------
app.get('/api/products', requireAuth, query('SELECT * FROM vw_product_catalog'));
app.get('/api/stock', requireAuth, requireRole('admin', 'staff'), query('SELECT * FROM vw_stock_summary'));

// Departments only see their own requisitions; admin/staff see all
app.get('/api/requisitions', requireAuth, async (req, res) => {
  try {
    const sql = req.user.role === 'department'
      ? `SELECT v.* FROM vw_requisition_details v
         JOIN requisitions r ON r.requisition_id = v.requisition_id
         WHERE r.department_id = ?`
      : 'SELECT * FROM vw_requisition_details';
    const [rows] = await pool.query(sql, [req.user.department_id]);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});

// Only admin/staff can add products
app.post('/api/products', requireAuth, requireRole('admin', 'staff'), async (req, res) => {
  const { sku, product_name, category_id, supplier_id, unit, unit_price } = req.body;
  try {
    const [result] = await pool.query(
      `INSERT INTO products (sku, product_name, category_id, supplier_id, unit, unit_price)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [sku, product_name, category_id, supplier_id, unit || 'pcs', unit_price]
    );
    res.status(201).json({ product_id: result.insertId });
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: 'Could not add product' });
  }
});

// ---------- Admin: user management ----------
app.get('/api/users', requireAuth, requireRole('admin'),
  query('SELECT user_id, username, full_name, role, department_id, is_active FROM users'));

app.post('/api/users', requireAuth, requireRole('admin'), async (req, res) => {
  const { username, password, full_name, role, department_id } = req.body;
  if (!username || !password || !full_name) {
    return res.status(400).json({ error: 'username, password and full_name are required' });
  }
  try {
    const hash = await bcrypt.hash(password, 10);
    const [result] = await pool.query(
      `INSERT INTO users (username, password_hash, full_name, role, department_id)
       VALUES (?, ?, ?, ?, ?)`,
      [username, hash, full_name, role || 'department', department_id || null]
    );
    res.status(201).json({ user_id: result.insertId });
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: 'Could not create user (username may already exist)' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`EasyStock running at http://localhost:${PORT}`));
                          
