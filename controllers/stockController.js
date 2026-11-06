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
