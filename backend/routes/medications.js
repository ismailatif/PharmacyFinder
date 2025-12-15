import express from 'express';
import Medication from '../models/Medication.js';

const router = express.Router();

// GET /api/medications/search?q=name
router.get('/search', async (req, res) => {
    try {
        const { q } = req.query;
        if (!q) {
            return res.status(400).json({ message: 'Query parameter q is required' });
        }

        const medications = await Medication.find({
            name: { $regex: q, $options: 'i' }
        }).limit(20);

        res.json(medications);
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
