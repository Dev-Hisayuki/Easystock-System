const express = require('express');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/api/authRoutes');
const productRoutes = require('./routes/api/productRoutes');
const stockRoutes = require('./routes/api/stockRoutes');
const inventoryRoutes = require('./routes/api/inventoryRoutes');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/stock', stockRoutes);
app.use('/api/inventory', inventoryRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});