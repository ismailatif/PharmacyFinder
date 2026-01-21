import express from 'express';
import Medication from '../models/Medication.js';

const router = express.Router();

// GET /api/medications/search?q=name&page=1&limit=10
router.get('/search', async (req, res) => {
    try {
        const { q, page = 1, limit = 10 } = req.query;
        if (!q) {
            return res.status(400).json({ message: 'Query parameter q is required' });
        }

        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);
        const skip = (pageNum - 1) * limitNum;

        const query = { name: { $regex: q, $options: 'i' } };

        const [medications, total] = await Promise.all([
            Medication.find(query)
                .skip(skip)
                .limit(limitNum),
            Medication.countDocuments(query)
        ]);

        res.json({
            data: medications,
            pagination: {
                total,
                page: pageNum,
                pages: Math.ceil(total / limitNum)
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// GET /api/medications/:code
router.get('/:code', async (req, res) => {
    try {
        const { code } = req.params;

        // Strict EAN/Barcode Validation
        if (!/^\d{8,14}$/.test(code)) {
            return res.status(400).json({ message: 'Invalid barcode format' });
        }

        const medication = await Medication.findOne({ code });

        if (!medication) {
            return res.status(404).json({ message: 'Medication not found' });
        }

        res.json(medication);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

export default router;
