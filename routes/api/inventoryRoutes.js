const express = require('express');
const router = express.Router();
const inventoryController = require('../controllers/inventoryController');

router.get('/', inventoryController.getInventoryLevels);
router.put('/update', inventoryController.updateStockQuantity);

module.exports = router;
