import mongoose from 'mongoose';
import Review from '../models/Review.js';
import Pharmacy from '../models/Pharmacy.js';

/**
 * Helper to update overall pharmacy rating & reviewCount
 */
const updatePharmacyRatingStats = async (pharmacyId) => {
    try {
        const reviews = await Review.find({ pharmacy: pharmacyId });
        const count = reviews.length;
        let avgRating = 0;

        if (count > 0) {
            const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
            avgRating = Math.round((sum / count) * 10) / 10;
        }

        // Match pharmacy by custom string ID 'id' or Mongo ObjectId '_id'
        const isObjId = mongoose.Types.ObjectId.isValid(pharmacyId);
        const query = isObjId 
            ? { $or: [{ id: pharmacyId }, { _id: pharmacyId }] }
            : { id: pharmacyId };

        await Pharmacy.findOneAndUpdate(query, {
            rating: avgRating,
            reviewCount: count
        });

        return { rating: avgRating, reviewCount: count };
    } catch (error) {
        console.error('Error updating pharmacy rating stats:', error);
    }
};

/**
 * GET /api/pharmacies/:id/reviews
 * Fetch all reviews for a specific pharmacy
 */
export const getPharmacyReviews = async (req, res) => {
    try {
        const pharmacyId = req.params.id;

        const reviews = await Review.find({ pharmacy: pharmacyId })
            .sort({ createdAt: -1 })
            .populate('user', 'name email');

        res.json({
            success: true,
            count: reviews.length,
            data: reviews
        });
    } catch (error) {
        console.error('Error fetching reviews:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch reviews'
        });
    }
};

/**
 * POST /api/pharmacies/:id/reviews
 * Add or update a user's review for a pharmacy
 */
export const addOrUpdateReview = async (req, res) => {
    try {
        const pharmacyId = req.params.id;
        const { rating, comment } = req.body;
        const userId = req.user._id;
        const userName = req.user.name || 'Anonymous User';

        // Validation
        const parsedRating = Number(rating);
        if (!parsedRating || parsedRating < 1 || parsedRating > 5) {
            return res.status(400).json({
                success: false,
                message: 'Rating must be a number between 1 and 5'
            });
        }

        if (!comment || !comment.trim()) {
            return res.status(400).json({
                success: false,
                message: 'Review comment cannot be empty'
            });
        }

        // Upsert review (1 review per user per pharmacy)
        const review = await Review.findOneAndUpdate(
            { pharmacy: pharmacyId, user: userId },
            {
                pharmacy: pharmacyId,
                user: userId,
                userName: userName,
                rating: parsedRating,
                comment: comment.trim()
            },
            { new: true, upsert: true, runValidators: true }
        );

        // Update pharmacy average rating & count
        const stats = await updatePharmacyRatingStats(pharmacyId);

        res.status(201).json({
            success: true,
            data: review,
            stats
        });
    } catch (error) {
        console.error('Error adding/updating review:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to submit review'
        });
    }
};

/**
 * DELETE /api/pharmacies/:id/reviews/:reviewId
 * Delete a user's review
 */
export const deleteReview = async (req, res) => {
    try {
        const { id: pharmacyId, reviewId } = req.params;
        const userId = req.user._id;

        const review = await Review.findById(reviewId);

        if (!review) {
            return res.status(404).json({
                success: false,
                message: 'Review not found'
            });
        }

        // Authorize: user can delete their own review, or admin can delete any
        if (review.user.toString() !== userId.toString() && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to delete this review'
            });
        }

        await review.deleteOne();

        // Update stats
        const stats = await updatePharmacyRatingStats(pharmacyId);

        res.json({
            success: true,
            message: 'Review removed',
            stats
        });
    } catch (error) {
        console.error('Error deleting review:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete review'
        });
    }
};

/**
 * Sync real review ratings and reviewCounts across all pharmacies in DB
 */
export const syncAllPharmacyRatings = async () => {
    try {
        const stats = await Review.aggregate([
            {
                $group: {
                    _id: '$pharmacy',
                    avgRating: { $avg: '$rating' },
                    count: { $sum: 1 }
                }
            }
        ]);

        const statsMap = new Map();
        stats.forEach(s => {
            if (s._id) {
                statsMap.set(String(s._id), {
                    rating: Math.round(s.avgRating * 10) / 10,
                    reviewCount: s.count
                });
            }
        });

        const pharmacies = await Pharmacy.find({});
        let updatedCount = 0;

        for (const pharm of pharmacies) {
            const real = statsMap.get(pharm.id) || statsMap.get(pharm._id.toString()) || { rating: 0, reviewCount: 0 };
            if (pharm.rating !== real.rating || pharm.reviewCount !== real.reviewCount) {
                pharm.rating = real.rating;
                pharm.reviewCount = real.reviewCount;
                await pharm.save();
                updatedCount++;
            }
        }
        if (updatedCount > 0) {
            console.log(`✅ Synced real review counts & ratings for ${updatedCount} pharmacies`);
        }
    } catch (error) {
        console.error('Error syncing pharmacy ratings:', error);
    }
};
