import { getRoute as fetchRoute } from '../services/routingService.js';
import Pharmacy from '../models/Pharmacy.js';
import { AppError } from '../middleware/errorHandler.js';
import { validationResult } from 'express-validator';

export const getRouteToPharmacy = async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ success: false, errors: errors.array() });
        }

        const { startLat, startLng, pharmacyId } = req.query;

        if (!startLat || !startLng || !pharmacyId) {
            throw new AppError('Missing required parameters: startLat, startLng, pharmacyId', 400);
        }

        const pharmacy = await Pharmacy.findOne({ id: pharmacyId });
        if (!pharmacy) {
            throw new AppError('Pharmacy not found', 404);
        }

        // Extract coordinates from pharmacy
        // Pharmacy model has GeoJSON location: { type: 'Point', coordinates: [lng, lat] }
        const endLng = pharmacy.location.coordinates[0];
        const endLat = pharmacy.location.coordinates[1];

        const start = { lat: parseFloat(startLat), lng: parseFloat(startLng) };
        const end = { lat: endLat, lng: endLng };

        const routeData = await fetchRoute(start, end);

        res.json({
            success: true,
            data: {
                geometry: routeData.geometry,
                distance: routeData.distance, // meters
                duration: routeData.duration  // seconds
            }
        });

    } catch (error) {
        next(error);
    }
};
