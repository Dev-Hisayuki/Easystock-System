<<<<<<< HEAD
import pool from '../db.js';
import { Log } from '../models/Log.js';

export async function adjustStock(req, res) {
    const { item_id, type, amount } = req.body;
    const userId = req.session.user ? req.session.user.id : null;
    const qtyChange = type === 'IN' ? Number(amount) : -Number(amount);

    try {
        await pool.query('UPDATE items SET quantity = quantity + ? WHERE id = ?', [qtyChange, item_id]);
        await Log.record(userId, `STOCK_${type}`, `Adjusted item #${item_id} by ${qtyChange} units.`);
        res.json({ message: 'Stock update processed successfully' });
    } catch (err) {
        res.status(500).json({ error: 'Stock transaction failed' });
    }
}
=======
const db = require('../config/db');

exports.getAllStockLogs = async (req, res) => {
    try {
        const [rows] = await db.execute(`
            SELECT sl.*, i.item_name, u.username as performed_by_user
            FROM stock_logs sl
            JOIN items i ON sl.item_id = i.item_id
            LEFT JOIN users u ON sl.performed_by = u.user_id
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

async function clearAuditLogs() {
    if (!confirm('Are you sure you want to clear all audit logs?')) return;
    
    try {
        const response = await fetch('/api/stock-logs', {
            method: 'DELETE'
        });

        if (response.ok) {
            document.getElementById('transaction-table-body').innerHTML = '';
            document.getElementById('empty-logs-state').classList.remove('hidden');
            showToast('Audit logs cleared successfully', 'success');
        } else {
            showToast('Failed to clear logs', 'error');
        }
    } catch (err) {
        console.error('Error clearing logs:', err);
        showToast('Server error while clearing logs', 'error');
    }
}

exports.clearStockLogs = async (req, res) => {
    try {
        await db.execute('DELETE FROM stock_logs');
        res.json({ message: 'Audit logs cleared successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
>>>>>>> 8a1e9ae6fb656a38a6cde5732cb25c94c15ec2f1
