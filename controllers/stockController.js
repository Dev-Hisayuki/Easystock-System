const db = require('../config/db');

exports.getAllStockLogs = async (req, res) => {
    try {
        const [rows] = await db.execute(`
            SELECT sl.*, i.item_name, u.username as performed_by_user 
            FROM stock_logs sl
            JOIN items i ON sl.item_id = i.item_id
            LEFT JOIN users u ON sl.performed_by = u.id
            ORDER BY sl.created_at DESC
        `);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.createStockLog = async (req, res) => {
    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();

        const { item_id, action_type, quantity_changed, remarks, performed_by } = req.body;

        const [itemRows] = await connection.execute(
            'SELECT quantity FROM items WHERE item_id = ?',
            [item_id]
        );

        if (itemRows.length === 0) {
            await connection.release();
            return res.status(404).json({ error: 'Item not found' });
        }

        let currentQty = itemRows[0].quantity;
        let newQty = currentQty;

        if (action_type === 'IN') {
            newQty += Number(quantity_changed);
        } else if (action_type === 'OUT') {
            newQty -= Number(quantity_changed);
            if (newQty < 0) {
                await connection.rollback();
                connection.release();
                return res.status(400).json({ error: 'Insufficient stock quantity' });
            }
        } else if (action_type === 'ADJUSTMENT') {
            newQty = Number(quantity_changed);
        }

        await connection.execute(
            'UPDATE items SET quantity = ? WHERE item_id = ?',
            [newQty, item_id]
        );

        const [result] = await connection.execute(
            'INSERT INTO stock_logs (item_id, action_type, quantity_changed, remarks, performed_by) VALUES (?, ?, ?, ?, ?)',
            [item_id, action_type, quantity_changed, remarks, performed_by]
        );

        await connection.commit();
        connection.release();

        res.status(201).json({ 
            message: 'Stock log recorded and inventory updated successfully', 
            log_id: result.insertId,
            updated_quantity: newQty 
        });
    } catch (err) {
        await connection.rollback();
        connection.release();
        res.status(500).json({ error: err.message });
    }
};