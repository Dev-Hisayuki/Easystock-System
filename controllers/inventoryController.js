const db = require('../config/db');

exports.getInventoryLevels = async (req, res, next) => {
  try {
    const [rows] = await db.query(
      `SELECT i.*, p.name AS product_name, w.warehouse_name 
       FROM inventory i
       JOIN products p ON i.product_id = p.id
       JOIN warehouses w ON i.warehouse_id = w.id
       ORDER BY w.warehouse_name, p.name`
    );
    res.status(200).json({ success: true, data: rows });
  } catch (error) {
    next(error);
  }
};

exports.updateStockQuantity = async (req, res, next) => {
  try {
    const { product_id, warehouse_id, quantity } = req.body;
    await db.query(
      `INSERT INTO inventory (product_id, warehouse_id, quantity) 
       VALUES (?, ?, ?) 
       ON DUPLICATE KEY UPDATE quantity = ?`,
      [product_id, warehouse_id, quantity, quantity]
    );
    res.status(200).json({ success: true, message: 'Inventory updated successfully' });
  } catch (error) {
    next(error);
  }
};