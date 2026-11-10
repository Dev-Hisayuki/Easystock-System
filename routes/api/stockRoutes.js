const express = require('express');
const router = express.Router();
const stockController = require('../../controllers/stockController');

router.get('/', stockController.getAllStockLogs);
router.post('/', stockController.createStockLog);
router.delete('/', stockController.clearStockLogs);

module.exports = router;