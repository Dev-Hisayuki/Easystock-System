const express = require('express');
const router = express.Router();
const stockController = require('../controllers/stockController');

router.get('/', stockController.getAllStockLogs);
router.post('/', stockController.createStockLog);

module.exports = router;