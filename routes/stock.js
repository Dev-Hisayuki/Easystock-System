import express from 'express';
import { adjustStock } from '../controllers/stockController.js';

const router = express.Router();
router.post('/adjust', adjustStock);

export default router;
