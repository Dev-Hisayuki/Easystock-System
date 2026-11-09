const db = require('../config/database');

exports.checkLowStock = async (productId, threshold = 10) => {
  const [rows] = await db.query(
    `SELECT SUM(quantity) as total_quantity FROM inventory WHERE product_id = ?`,
    [productId]
  );
  const total = rows[0]?.total_quantity || 0;
  return { isLowStock: total < threshold, totalQuantity: total };
};

exports.calculateTotalInventory = async () => {
  const [rows] = await db.query(`SELECT SUM(quantity) as grand_total FROM inventory`);
  return rows[0]?.grand_total || 0;
};