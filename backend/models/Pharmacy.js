import mongoose from 'mongoose';

const pharmacySchema = new mongoose.Schema({
    // Original ID
    id: {
        type: String,
        required: true,
        unique: true,
        index: true
    },

    // Basic Info
    name: {
        type: String,
        required: true,
        index: true
    },
    nameAr: {
        type: String,
        required: true,
        index: true
    },

    // Location
    city: {
        type: String,
        required: true,
        index: true
    },
    cityAr: {
        type: String,
        required: true
    },
    address: {
        type: String,
        required: true
    },
    addressAr: {
        type: String,
        required: true
    },

    // GeoJSON for geospatial queries
    location: {
        type: {
            type: String,
            enum: ['Point'],
            required: true
        },
        coordinates: {
            type: [Number],  // [longitude, latitude]
            required: true,
            index: '2dsphere'
        }
    },

    // Contact
    phone: String,
    email: String,
    website: String,

    // Status
    isOpen: {
        type: Boolean,
        required: true,
        index: true
    },
    isOnDuty: {
        type: Boolean,
        required: true,
        index: true
    },
    openingHours: String,
    openingHoursAr: String,

    // Ratings
    rating: {
        type: Number,
        required: true,
        min: 0,
        max: 5,
        index: true
    },
    reviewCount: {
        type: Number,
        required: true,
        min: 0
    },

    // Details
    established: Number,
    priceRange: {
        type: String,
        enum: ['low', 'medium', 'high'],
        required: true
    },

    // Features
    hasParking: Boolean,
    isAccessible: Boolean,
    acceptsInsurance: Boolean,
    hasDelivery: Boolean,

    // Content
    description: String,
    descriptionAr: String,
    images: [String],
    services: [String],
    servicesAr: [String],
    specialties: [String],
    specialtiesAr: [String],

    // Pharmacist
    pharmacist: String,
    pharmacistAr: String
}, {
    timestamps: true  // Adds createdAt and updatedAt
});

// Compound indexes for common queries
pharmacySchema.index({ city: 1, isOpen: 1 });
pharmacySchema.index({ city: 1, isOnDuty: 1 });
pharmacySchema.index({ city: 1, rating: -1 });

// Text index for search functionality
pharmacySchema.index({
    name: 'text',
    nameAr: 'text',
    address: 'text',
    addressAr: 'text'
});

// Virtual for distance (set by queries)
pharmacySchema.virtual('distance').get(function () {
    return this._distance;
}).set(function (val) {
    this._distance = val;
});

// Ensure virtuals are included in JSON
pharmacySchema.set('toJSON', { virtuals: true });
pharmacySchema.set('toObject', { virtuals: true });

const Pharmacy = mongoose.model('Pharmacy', pharmacySchema);

export default Pharmacy;
