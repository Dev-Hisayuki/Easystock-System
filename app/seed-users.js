// Creates starter accounts. Run once AFTER importing easystock.sql:
//   node seed-users.js
require('dotenv').config();
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

const users = [
  { username: 'admin',   password: 'admin123',   full_name: 'System Administrator', role: 'admin',      department_id: null },
  { username: 'staff',   password: 'staff123',   full_name: 'Warehouse Staff',      role: 'staff',      department_id: null },
  { username: 'science', password: 'science123', full_name: 'Science Dept Head',    role: 'department', department_id: 1 },
];

(async () => {
  const db = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'easystock',
  });

  for (const u of users) {
    const hash = await bcrypt.hash(u.password, 10);
    await db.query(
      `INSERT IGNORE INTO users (username, password_hash, full_name, role, department_id)
       VALUES (?, ?, ?, ?, ?)`,
      [u.username, hash, u.full_name, u.role, u.department_id]
    );
    console.log(`Created: ${u.username} (${u.role})`);
  }

  console.log('Done. Change these default passwords before presenting or deploying!');
  await db.end();
})().catch(err => { console.error(err.message); process.exit(1); });
