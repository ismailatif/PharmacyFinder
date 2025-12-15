import Pharmacy from '../models/Pharmacy.js';
import { AppError } from '../middleware/errorHandler.js';

/**
 * Transform MongoDB pharmacy data to frontend format
 * Converts GeoJSON location to the coordinates format expected by frontend
 */
const transformPharmacyData = (pharmacy) => {
    if (!pharmacy) return null;

    const transformed = { ...pharmacy };

    // Convert MongoDB GeoJSON format to frontend format
    if (pharmacy.location && pharmacy.location.coordinates) {
        transformed.coordinates = {
            lng: pharmacy.location.coordinates[0],
            lat: pharmacy.location.coordinates[1]
        };
    }

    // Remove MongoDB internal fields if present
    delete transformed.__v;
    delete transformed._id;

    return transformed;
};

/**
 * GET /api/pharmacies
 * Get all pharmacies with optional filtering and pagination
 */
export const getAllPharmacies = async (req, res, next) => {
    try {
        const { city, isOpen, isOnDuty, rating, search, limit, offset } = req.query;

        // Build query
        const query = {};

        if (city && city !== 'all') {
            query.city = city;
        }

        if (isOpen !== undefined) {
            query.isOpen = isOpen === 'true';
        }

        if (isOnDuty !== undefined) {
            query.isOnDuty = isOnDuty === 'true';
        }

        if (rating) {
            query.rating = { $gte: parseFloat(rating) };
        }

        if (search && search.trim()) {
            // Use text search if available, otherwise use regex
            query.$text = { $search: search };
        }

        // Execute query with pagination
        let parsedLimit = parseInt(limit) || 20;
        let parsedOffset = parseInt(offset) || 0;

        // Constraint limit to prevent performance issues
        // Increased max limit to allow fetching all pharmacies for map view
        if (parsedLimit > 5000) parsedLimit = 5000;
        if (parsedLimit < 1) parsedLimit = 20;
        if (parsedOffset < 0) parsedOffset = 0;

        const pharmacies = await Pharmacy
            .find(query)
            .limit(parsedLimit)
            .skip(parsedOffset)
            .sort({ rating: -1 })
            .lean(); // Use lean() for better performance (returns plain JS objects)

        // Transform data to frontend format
        const transformedPharmacies = pharmacies.map(transformPharmacyData);

        // Get total count for pagination metadata
        const total = await Pharmacy.countDocuments(query);

        res.json({
            success: true,
            data: transformedPharmacies,
            metadata: {
                total,
                limit: parsedLimit,
                offset: parsedOffset,
                count: transformedPharmacies.length
            }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * GET /api/pharmacies/:id
 * Get a single pharmacy by ID
 */
export const getPharmacyById = async (req, res, next) => {
    try {
        const { id } = req.params;

        const pharmacy = await Pharmacy.findOne({ id }).lean();

        if (!pharmacy) {
            throw new AppError('Pharmacy not found', 404);
        }

        res.json({
            success: true,
            data: transformPharmacyData(pharmacy)
        });
    } catch (error) {
        next(error);
    }
};

/**
 * GET /api/pharmacies/nearby
 * Get pharmacies near a specific location using geospatial query
 */
export const getNearbyPharmacies = async (req, res, next) => {
    try {
        const { lat, lng, radius, limit } = req.query;

        if (!lat || !lng) {
            throw new AppError('Latitude and longitude are required', 400);
        }

        const latitude = parseFloat(lat);
        const longitude = parseFloat(lng);
        let searchRadius = parseFloat(radius) || 10; // Default 10km
        let maxResults = parseInt(limit) || 50;

        // Validate coordinates range
        if (isNaN(latitude) || latitude < -90 || latitude > 90 ||
            isNaN(longitude) || longitude < -180 || longitude > 180) {
            throw new AppError('Invalid coordinates. Latitude must be between -90 and 90, Longitude between -180 and 180.', 400);
        }

        // Validate radius and limit
        if (searchRadius <= 0 || searchRadius > 500) searchRadius = 10;
        if (maxResults <= 0 || maxResults > 100) maxResults = 50;

        // Use geospatial query with $near
        const pharmacies = await Pharmacy.aggregate([
            {
                $geoNear: {
                    near: {
                        type: 'Point',
                        coordinates: [longitude, latitude] // [lng, lat]
                    },
                    distanceField: 'distance',
                    maxDistance: searchRadius * 1000, // Convert km to meters
                    spherical: true
                }
            },
            {
                $limit: maxResults
            },
            {
                $project: {
                    __v: 0 // Exclude version field
                }
            }
        ]);

        // Transform and convert distance from meters to kilometers
        const transformedPharmacies = pharmacies.map(p => {
            const transformed = transformPharmacyData(p);
            if (p.distance !== undefined) {
                transformed.distance = p.distance / 1000;
            }
            return transformed;
        });

        res.json({
            success: true,
            data: transformedPharmacies,
            metadata: {
                searchCenter: { lat: latitude, lng: longitude },
                radius: searchRadius,
                count: transformedPharmacies.length
            }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * GET /api/cities
 * Get list of all unique cities with pharmacy counts
 */
export const getCities = async (req, res, next) => {
    try {
        // Use aggregation to get cities with counts
        const cities = await Pharmacy.aggregate([
            {
                $group: {
                    _id: {
                        city: '$city',
                        cityAr: '$cityAr'
                    },
                    count: { $sum: 1 }
                }
            },
            {
                $project: {
                    _id: 0,
                    name: '$_id.city',
                    nameAr: '$_id.cityAr',
                    count: 1
                }
            },
            {
                $sort: { name: 1 }
            }
        ]);

        res.json({
            success: true,
            data: cities
        });
    } catch (error) {
        next(error);
    }
};
