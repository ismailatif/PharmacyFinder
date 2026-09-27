import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema({
    pharmacy: {
        type: String, // String ID (e.g. 'casablanca-1') or ObjectId as string
        required: [true, 'Pharmacy ID is required'],
        index: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    userName: {
        type: String,
        required: true
    },
    rating: {
        type: Number,
        required: [true, 'Please provide a rating between 1 and 5'],
        min: 1,
        max: 5
    },
    comment: {
        type: String,
        required: [true, 'Please provide a review comment'],
        trim: true,
        maxlength: [1000, 'Comment cannot exceed 1000 characters']
    }
}, {
    timestamps: true
});

// Ensure a user can only leave 1 review per pharmacy (upsert/update on resubmit)
reviewSchema.index({ pharmacy: 1, user: 1 }, { unique: true });

const Review = mongoose.model('Review', reviewSchema);

export default Review;
