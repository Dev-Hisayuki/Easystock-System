const db = require('../config/db');

class StockLog {
  static async createLog(productId, type, quantityChanged, finalStock, notes) {
    await db.query(
      'INSERT INTO stock_logs (product_id, type, quantity_changed, final_stock, notes) VALUES (?, ?, ?, ?, ?)',
      [productId, type, quantityChanged, finalStock, notes]
    );
  }

  static async getAllLogs() {
    const [rows] = await db.query(`
      SELECT sl.*, p.name as product_name, p.sku 
      FROM stock_logs sl 
      JOIN products p ON sl.product_id = p.id 
      ORDER BY sl.created_at DESC
    `);
    return rows;
  }

  static async clearAll() {
    await db.query('DELETE FROM stock_logs');
  }
}

module.exports = StockLog;