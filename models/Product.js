const db = require('../config/db');

const Product = {
  // Assigned SQL JOIN Report: LEFT JOIN All Products with optional Supplier information
  getAllWithSuppliers: async () => {
    const query = `
      SELECT 
        p.id AS product_id,
        p.name AS product_name,
        p.price,
        p.stock_quantity,
        c.name AS category_name,
        s.id AS supplier_id,
        s.name AS supplier_name,
        s.contact_info AS supplier_contact
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN suppliers s ON p.supplier_id = s.id
    `;
    const [rows] = await db.query(query);
    return rows;
  },

  findById: async (id) => {
    const [rows] = await db.query('SELECT * FROM products WHERE id = ?', [id]);
    return rows[0];
  },

  create: async (productData) => {
    const { name, price, stock_quantity, category_id, supplier_id } = productData;
    const [result] = await db.query(
      'INSERT INTO products (name, price, stock_quantity, category_id, supplier_id) VALUES (?, ?, ?, ?, ?)',
      [name, price, stock_quantity, category_id, supplier_id]
    );
    return result.insertId;
  },

  update: async (id, productData) => {
    const { name, price, stock_quantity, category_id, supplier_id } = productData;
    await db.query(
      'UPDATE products SET name = ?, price = ?, stock_quantity = ?, category_id = ?, supplier_id = ? WHERE id = ?',
      [name, price, stock_quantity, category_id, supplier_id, id]
    );
  },

  delete: async (id) => {
    await db.query('DELETE FROM products WHERE id = ?', [id]);
  }
};

module.exports = Product;