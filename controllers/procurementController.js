const db = require('../config/database');

exports.createPurchaseOrder = async (req, res, next) => {
  try {
    const { supplier_id, items, total_amount } = req.body;
    const [result] = await db.query(
      `INSERT INTO purchase_orders (supplier_id, total_amount, status) VALUES (?, ?, 'Pending')`,
      [supplier_id, total_amount]
    );
    const orderId = result.insertId;
    if (items && items.length > 0) {
      const orderItems = items.map(item => [orderId, item.product_id, item.quantity, item.unit_price]);
      await db.query(
        `INSERT INTO purchase_order_items (purchase_order_id, product_id, quantity, unit_price) VALUES ?`,
        [orderItems]
      );
    }
    res.status(201).json({ success: true, message: 'Purchase order created successfully', orderId });
  } catch (error) {
    next(error);
  }
};

exports.getPurchaseOrders = async (req, res, next) => {
  try {
    const [orders] = await db.query(`SELECT * FROM purchase_orders ORDER BY created_at DESC`);
    res.status(200).json({ success: true, data: orders });
  } catch (error) {
    next(error);
  }
};