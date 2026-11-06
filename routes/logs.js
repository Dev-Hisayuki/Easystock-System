import express from 'express';
import { Log } from '../models/Log.js';

const router = express.Router();
router.get('/', async (req, res) => {
    try {
        const logs = await Log.getAll();
        res.json(logs);
    } catch (err) {
        res.status(500).json({ error: 'Failed to retrieve logs' });
    }
});

export default router;
