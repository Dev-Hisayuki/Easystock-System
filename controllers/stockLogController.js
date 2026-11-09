const db = require('../config/database');

exports.recordStockIn = async (req, res, next) => {
  try {
    const { supplier_id, warehouse_id, items } = req.body;
    const [header] = await db.query(
      `INSERT INTO stock_in_records (supplier_id, warehouse_id, received_by) VALUES (?, ?, ?)`,
      [supplier_id, warehouse_id, req.user.id]
    );
    const stockInId = header.insertId;
    if (items && items.length > 0) {
      const details = items.map(item => [stockInId, item.product_id, item.quantity_received]);
      await db.query(
        `INSERT INTO stock_in_details (stock_in_id, product_id, quantity_received) VALUES ?`,
        [details]
      );
      for (let item of items) {
        await db.query(
          `INSERT INTO inventory (product_id, warehouse_id, quantity) VALUES (?, ?, ?)
           ON DUPLICATE KEY UPDATE quantity = quantity + ?`,
          [item.product_id, warehouse_id, item.quantity_received, item.quantity_received]
        );
      }
    }
    res.status(201).json({ success: true, message: 'Stock-in shipment recorded successfully' });
  } catch (error) {
    next(error);
  }
};

exports.recordStockOut = async (req, res, next) => {
  try {
    const { warehouse_id, items, recipient } = req.body;
    const [header] = await db.query(
      `INSERT INTO stock_out_records (warehouse_id, recipient, issued_by) VALUES (?, ?, ?)`,
      [warehouse_id, recipient, req.user.id]
    );
    const stockOutId = header.insertId;
    if (items && items.length > 0) {
      const details = items.map(item => [stockOutId, item.product_id, item.quantity_issued]);
      await db.query(
        `INSERT INTO stock_out_details (stock_out_id, product_id, quantity_issued) VALUES ?`,
        [details]
      );
      for (let item of items) {
        await db.query(
          `UPDATE inventory SET quantity = quantity - ? WHERE product_id = ? AND warehouse_id = ?`,
          [item.quantity_issued, item.product_id, warehouse_id]
        );
      }
    }
    res.status(201).json({ success: true, message: 'Stock-out recorded successfully' });
  } catch (error) {
    next(error);
  }
};