const db = require('../config/database');

exports.createRequisition = async (req, res, next) => {
  try {
    const { department_id, items } = req.body;
    const [result] = await db.query(
      `INSERT INTO requisitions (department_id, requested_by, status) VALUES (?, ?, 'Pending')`,
      [department_id, req.user.id]
    );
    const requisitionId = result.insertId;
    if (items && items.length > 0) {
      const reqItems = items.map(item => [requisitionId, item.product_id, item.quantity_requested]);
      await db.query(
        `INSERT INTO requisition_items (requisition_id, product_id, quantity_requested) VALUES ?`,
        [reqItems]
      );
    }
    res.status(201).json({ success: true, message: 'Requisition submitted successfully', requisitionId });
  } catch (error) {
    next(error);
  }
};

exports.getRequisitions = async (req, res, next) => {
  try {
    const [requisitions] = await db.query(`SELECT * FROM requisitions ORDER BY created_at DESC`);
    res.status(200).json({ success: true, data: requisitions });
  } catch (error) {
    next(error);
  }
};