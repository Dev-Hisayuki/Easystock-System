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
// Member 4: Handle Stock-Out / Dispatch Creation
exports.createStockOut = async (req, res) => {
    try {
        const { clientId, items } = req.body;

        const [recordResult] = await db.query(
            'INSERT INTO stock_out_records (client_id, user_id, date_dispatched) VALUES (?, ?, NOW())',
            [clientId, req.user ? req.user.id : 1]
        );
        const stockOutId = recordResult.insertId;

        for (let item of items) {
            await db.query(
                'INSERT INTO stock_out_details (stock_out_id, product_id, quantity) VALUES (?, ?, ?)',
                [stockOutId, item.productId, item.quantity]
            );
        }

        res.status(201).json({ message: 'Stock-out record created successfully', stockOutId });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error during stock-out processing' });
    }
};

// Member 4 Assigned SQL LEFT JOIN Report: Stock-Out Orders with Client & Product Info
exports.getStockOutReport = async (req, res) => {
    try {
        const query = `
            SELECT 
                sor.id AS stock_out_id,
                sor.date_dispatched,
                c.name AS client_name,
                c.contact_person,
                p.name AS product_name,
                sod.quantity
            FROM stock_out_records sor
            LEFT JOIN clients c ON sor.client_id = c.id
            LEFT JOIN stock_out_details sod ON sor.id = sod.stock_out_id
            LEFT JOIN products p ON sod.product_id = p.id;
        `;
        const [rows] = await db.query(query);
        res.status(200).json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch stock-out join report' });
    }
};
