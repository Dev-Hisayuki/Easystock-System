const pool = require('../config/db');

const Item = {
    async getAll() {
        const [rows] = await pool.query('SELECT * FROM items ORDER BY id DESC');
        return rows;
    },
    async getById(id) {
        const [rows] = await pool.query('SELECT * FROM items WHERE id = ?', [id]);
        return rows[0];
    },
    async create(item_name, category, quantity, unit_price) {
        const [result] = await pool.query('INSERT INTO items (item_name, category, quantity, unit_price) VALUES (?, ?, ?, ?)', [item_name, category, quantity, unit_price]);
        return result.insertId;
    },
    async update(id, item_name, category, quantity, unit_price) {
        await pool.query('UPDATE items SET item_name = ?, category = ?, quantity = ?, unit_price = ? WHERE id = ?', [item_name, category, quantity, unit_price, id]);
    },
    async delete(id) {
        await pool.query('DELETE FROM items WHERE id = ?', [id]);
    }
};

module.exports = { Item };