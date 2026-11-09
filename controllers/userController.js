const db = require('../config/database');

exports.getAllUsers = async (req, res, next) => {
  try {
    const [users] = await db.query(
      `SELECT u.id, u.username, u.email, r.role_name, u.created_at 
       FROM users u 
       JOIN roles r ON u.role_id = r.id`
    );
    res.status(200).json({ success: true, data: users });
  } catch (error) {
    next(error);
  }
};

exports.updateUserRole = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { role_id } = req.body;
    await db.query(`UPDATE users SET role_id = ? WHERE id = ?`, [role_id, userId]);
    res.status(200).json({ success: true, message: 'User role updated successfully' });
  } catch (error) {
    next(error);
  }
};