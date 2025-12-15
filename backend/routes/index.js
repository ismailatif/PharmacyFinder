import express from 'express';
import { getCities } from '../controllers/pharmacyController.js';

const router = express.Router();

// GET /api/cities - Get all cities
router.get('/cities', getCities);

export default router;
