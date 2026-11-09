const db = require('../config/database');

exports.sendLowStockAlert = async (userId, productId, currentStock) => {
  const message = `Alert: Product ID ${productId} is low on stock (${currentStock} units remaining).`;
  await db.query(
    `INSERT INTO notifications (user_id, message, type) VALUES (?, ?, 'LOW_STOCK')`,
    [userId, message]
  );
};

exports.sendStatusNotification = async (userId, title, message) => {
  await db.query(
    `INSERT INTO notifications (user_id, title, message, type) VALUES (?, ?, ?, 'STATUS_UPDATE')`,
    [userId, title, message]
  );
};