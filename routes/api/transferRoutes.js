const express = require('express');
const router = express.Router();
const transferController = require('../../controllers/transferController');

router.get('/', transferController.getAllTransfers);
router.post('/', transferController.createTransfer);

module.exports = router;