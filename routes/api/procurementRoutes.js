const express = require('express');
const router = express.Router();
const procurementController = require('../controllers/procurementController');

router.get('/orders', procurementController.getPurchaseOrders);
router.post('/orders', procurementController.createPurchaseOrder);

module.exports = router;
