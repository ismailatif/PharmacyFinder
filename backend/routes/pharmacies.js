import express from 'express';
import { query } from 'express-validator';
import {
    getAllPharmacies,
    getPharmacyById,
    getNearbyPharmacies,
    getCities
} from '../controllers/pharmacyController.js';
import {
    getPharmacyReviews,
    addOrUpdateReview,
    deleteReview
} from '../controllers/reviewController.js';
import { getRouteToPharmacy } from '../controllers/routeController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// GET /api/pharmacies - Get all pharmacies with filtering
router.get('/', getAllPharmacies);

// GET /api/pharmacies/cities - Get all cities (must be before /:id)
router.get('/cities', getCities);

// GET /api/pharmacies/nearby - Get nearby pharmacies (must be before /:id)
router.get('/nearby', getNearbyPharmacies);

// GET /api/pharmacies/route - Get route to pharmacy
router.get(
    '/route',
    [
        query('startLat').isFloat().withMessage('Start Latitude must be a number'),
        query('startLng').isFloat().withMessage('Start Longitude must be a number'),
        query('pharmacyId').isString().notEmpty().withMessage('Pharmacy ID must be a non-empty string')
    ],
    getRouteToPharmacy
);

// Review routes
router.get('/:id/reviews', getPharmacyReviews);
router.post('/:id/reviews', protect, addOrUpdateReview);
router.delete('/:id/reviews/:reviewId', protect, deleteReview);

// GET /api/pharmacies/:id - Get single pharmacy
router.get('/:id', getPharmacyById);

export default router;
