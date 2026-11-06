import pool from '../db.js';

export const Log = {
    async getAll() {
        const [rows] = await pool.query('SELECT logs.*, users.username FROM logs LEFT JOIN users ON logs.user_id = users.id ORDER BY timestamp DESC');
        return rows;
    },
    async record(user_id, action, details) {
        await pool.query('INSERT INTO logs (user_id, action, details) VALUES (?, ?, ?)', [user_id, action, details]);
    }
};
