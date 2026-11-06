const db = require('../config/db');

exports.getAllProducts = async (req, res) => {
    try {
        const [rows] = await db.execute('SELECT * FROM items ORDER BY created_at DESC');
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getProductById = async (req, res) => {
    try {
        const [rows] = await db.execute('SELECT * FROM items WHERE item_id = ?', [req.params.id]);
        if (rows.length === 0) {
            return res.status(404).json({ error: 'Item not found' });
        }
        res.json(rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.createProduct = async (req, res) => {
    try {
        const { item_name, category, quantity, unit_price } = req.body;
        const [result] = await db.execute(
            'INSERT INTO items (item_name, category, quantity, unit_price) VALUES (?, ?, ?, ?)',
            [item_name, category, quantity || 0, unit_price || 0.00]
        );
        res.status(201).json({ message: 'Item created successfully', item_id: result.insertId });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.updateProduct = async (req, res) => {
    try {
        const { item_name, category, quantity, unit_price } = req.body;
        const [result] = await db.execute(
            'UPDATE items SET item_name = ?, category = ?, quantity = ?, unit_price = ? WHERE item_id = ?',
            [item_name, category, quantity, unit_price, req.params.id]
        );
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Item not found' });
        }
        res.json({ message: 'Item updated successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.deleteProduct = async (req, res) => {
    try {
        const [result] = await db.execute('DELETE FROM items WHERE item_id = ?', [req.params.id]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Item not found' });
        }
        res.json({ message: 'Item deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.clearStockLogs = async (req, res) => {
    try {
        await db.execute('DELETE FROM stock_logs');
        res.json({ message: 'Audit logs cleared successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};