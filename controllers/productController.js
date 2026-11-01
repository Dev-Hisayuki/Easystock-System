const Product = require('../models/Product');

const productController = {
  // GET /api/products - Fetch all products with supplier left join
  getProducts: async (req, res) => {
    try {
      const products = await Product.getAllWithSuppliers();
      res.status(200).json({ success: true, data: products });
    } catch (error) {
      console.error('Error fetching products:', error);
      res.status(500).json({ success: false, message: 'Server error while fetching products' });
    }
  },

  // GET /api/products/:id - Fetch single product
  getProductById: async (req, res) => {
    try {
      const product = await Product.findById(req.params.id);
      if (!product) {
        return res.status(404).json({ success: false, message: 'Product not found' });
      }
      res.status(200).json({ success: true, data: product });
    } catch (error) {
      console.error('Error fetching product:', error);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  },

  // POST /api/products - Create a new product
  createProduct: async (req, res) => {
    try {
      const { name, price, stock_quantity, category_id, supplier_id } = req.body;
      if (!name || !price) {
        return res.status(400).json({ success: false, message: 'Name and price are required' });
      }

      const productId = await Product.create({ name, price, stock_quantity, category_id, supplier_id });
      res.status(201).json({ success: true, message: 'Product created successfully', productId });
    } catch (error) {
      console.error('Error creating product:', error);
      res.status(500).json({ success: false, message: 'Server error while creating product' });
    }
  },

  // PUT /api/products/:id - Update product details
  updateProduct: async (req, res) => {
    try {
      const { name, price, stock_quantity, category_id, supplier_id } = req.body;
      await Product.update(req.params.id, { name, price, stock_quantity, category_id, supplier_id });
      res.status(200).json({ success: true, message: 'Product updated successfully' });
    } catch (error) {
      console.error('Error updating product:', error);
      res.status(500).json({ success: false, message: 'Server error while updating product' });
    }
  },

  // DELETE /api/products/:id - Remove product
  deleteProduct: async (req, res) => {
    try {
      await Product.delete(req.params.id);
      res.status(200).json({ success: true, message: 'Product deleted successfully' });
    } catch (error) {
      console.error('Error deleting product:', error);
      res.status(500).json({ success: false, message: 'Server error while deleting product' });
    }
  }
};

module.exports = productController;