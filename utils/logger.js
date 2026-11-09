const db = require('../config/database');

exports.logActivity = async (userId, action, details) => {
  try {
    await db.query(
      `INSERT INTO activity_logs (user_id, action, details, timestamp) VALUES (?, ?, ?, NOW())`,
      [userId, action, JSON.stringify(details)]
    );
  } catch (error) {
    console.error('Failed to write activity log:', error);
  }
};