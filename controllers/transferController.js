const db = require('../config/db');

exports.createTransfer = async (req, res) => {
    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();

        const { item_id, from_warehouse_id, to_warehouse_id, quantity, remarks } = req.body;
        const transferQty = parseInt(quantity, 10);
        const userId = req.user ? req.user.user_id : null;

        if (!item_id || !from_warehouse_id || !to_warehouse_id || !transferQty || transferQty <= 0) {
            await connection.rollback();
            connection.release();
            return res.status(400).json({ error: 'Please provide valid item, warehouses, and quantity' });
        }

        if (from_warehouse_id === to_warehouse_id) {
            await connection.rollback();
            connection.release();
            return res.status(400).json({ error: 'Source and destination warehouses cannot be the same' });
        }

        const [result] = await connection.execute(
            `INSERT INTO stock_transfers (item_id, from_warehouse_id, to_warehouse_id, quantity, status, remarks, performed_by) 
             VALUES (?, ?, ?, ?, 'Completed', ?, ?)`,
            [item_id, from_warehouse_id, to_warehouse_id, transferQty, remarks || 'Warehouse transfer', userId]
        );

        await connection.execute(
            `INSERT INTO stock_logs (item_id, action_type, quantity_changed, remarks, performed_by) 
             VALUES (?, 'TRANSFER', ?, ?, ?)`,
            [item_id, transferQty, `Transferred from Warehouse #${from_warehouse_id} to #${to_warehouse_id}`, userId]
        );

        await connection.commit();
        connection.release();

        res.status(201).json({ 
            message: 'Stock transfer recorded successfully', 
            transfer_id: result.insertId 
        });
    } catch (err) {
        await connection.rollback();
        connection.release();
        res.status(500).json({ error: err.message });
    }
};

exports.getAllTransfers = async (req, res) => {
    try {
        const [rows] = await db.execute(`
            SELECT st.*, i.item_name, fw.name as from_warehouse, tw.name as to_warehouse, u.username as performed_by_user
            FROM stock_transfers st
            JOIN items i ON st.item_id = i.item_id
            LEFT JOIN warehouses fw ON st.from_warehouse_id = fw.warehouse_id
            LEFT JOIN warehouses tw ON st.to_warehouse_id = tw.warehouse_id
            LEFT JOIN users u ON st.performed_by = u.user_id
            ORDER BY st.created_at DESC
        `);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};