const express = require('express');
const router = express.Router();
const stockController = require('../controllers/stockController');

// Member 3 / Existing Routes
router.get('/', stockController.getAllStockLogs);
router.post('/', stockController.createStockLog);

// Member 4: Stock-Out routes
router.post('/stock-out', stockController.createStockOut);
router.get('/stock-out/report', stockController.getStockOutReport);

module.exports = router;

