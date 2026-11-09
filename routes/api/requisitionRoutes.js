const express = require('express');
const router = express.Router();
const requisitionController = require('../controllers/requisitionController');

router.get('/', requisitionController.getRequisitions);
router.post('/', requisitionController.createRequisition);

module.exports = router;
