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
        const parsedQuantity = parseInt(quantity, 10) || 0;
        
        const [result] = await db.execute(
            'INSERT INTO items (item_name, category, quantity, unit_price) VALUES (?, ?, ?, ?)',
            [item_name, category, parsedQuantity, unit_price || 0.00]
        );
        
        const itemId = result.insertId;
        const userId = req.user ? req.user.user_id : null;

        await db.execute(
            'INSERT INTO stock_logs (item_id, action_type, quantity_changed, remarks, performed_by) VALUES (?, ?, ?, ?, ?)',
            [itemId, 'CREATED', Math.abs(parsedQuantity), `New item created (By User ID: ${userId || 'System'})`, userId]
        );

        res.status(201).json({ message: 'Item created and logged successfully', item_id: itemId });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.updateProduct = async (req, res) => {
    try {
        const { item_name, category, quantity, unit_price } = req.body;
        const parsedQuantity = parseInt(quantity, 10) || 0;
        
        const [result] = await db.execute(
            'UPDATE items SET item_name = ?, category = ?, quantity = ?, unit_price = ? WHERE item_id = ?',
            [item_name, category, parsedQuantity, unit_price, req.params.id]
        );
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Item not found' });
        }

        const userId = req.user ? req.user.user_id : null;

        await db.execute(
            'INSERT INTO stock_logs (item_id, action_type, quantity_changed, remarks, performed_by) VALUES (?, ?, ?, ?, ?)',
            [req.params.id, 'UPDATED', parsedQuantity, 'Item details updated', userId]
        );

        res.json({ message: 'Item updated successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.deleteProduct = async (req, res) => {
    try {
        const userId = req.user ? req.user.user_id : null;

        await db.execute(
            'INSERT INTO stock_logs (item_id, action_type, quantity_changed, remarks, performed_by) VALUES (?, ?, ?, ?, ?)',
            [req.params.id, 'DELETED', 0, 'Item deleted', userId]
        );

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