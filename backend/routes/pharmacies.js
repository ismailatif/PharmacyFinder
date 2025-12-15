import express from 'express';
import {
    getAllPharmacies,
    getPharmacyById,
    getNearbyPharmacies,
    getCities
} from '../controllers/pharmacyController.js';

const router = express.Router();

// GET /api/pharmacies - Get all pharmacies with filtering
router.get('/', getAllPharmacies);

// GET /api/pharmacies/nearby - Get nearby pharmacies (must be before /:id)
router.get('/nearby', getNearbyPharmacies);

// GET /api/pharmacies/route - Get route to pharmacy
import { query } from 'express-validator';
import { getRouteToPharmacy } from '../controllers/routeController.js';

router.get(
    '/route',
    [
        query('startLat').isFloat().withMessage('Start Latitude must be a number'),
        query('startLng').isFloat().withMessage('Start Longitude must be a number'),
        query('pharmacyId').isString().notEmpty().withMessage('Pharmacy ID must be a non-empty string')
    ],
    getRouteToPharmacy
);

// GET /api/pharmacies/:id - Get single pharmacy
router.get('/:id', getPharmacyById);

export default router;
