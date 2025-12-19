import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please provide a name'],
        trim: true,
        maxLength: [50, 'Name cannot differ than 50 characters']
    },
    email: {
        type: String,
        required: [true, 'Please provide an email'],
        unique: true,
        lowercase: true,
        match: [
            /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
            'Please provide a valid email'
        ]
    },
    password: {
        type: String,
        required: [function () { return !this.googleId; }, 'Please provide a password'], // Required if no googleId
        minlength: [6, 'Password must be at least 6 characters'],
        select: false
    },
    googleId: {
        type: String,
        unique: true,
        sparse: true // Allows multiple null/undefined values
    },
    resetPasswordToken: String,
    resetPasswordExpire: Date,
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user'
    },
    preferences: {
        language: {
            type: String,
            enum: ['fr', 'ar'],
            default: 'fr'
        },
        theme: {
            type: String,
            enum: ['light', 'dark', 'system'],
            default: 'system'
        },
        notifications: {
            type: Boolean,
            default: true
        },
        searchRadius: {
            type: Number,
            default: 5000, // in meters
            min: 1000,
            max: 50000
        }
    },
    savedPharmacies: [{
        type: String
    }],
    emailVerified: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Encrypt password using bcrypt
userSchema.pre('save', async function () {
    if (!this.isModified('password') || !this.password) {
        return;
    }

    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

// Match user entered password to hashed password in database
userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

// Generate and hash password token
userSchema.methods.getResetPasswordToken = function () {
    // Generate token
    const resetToken = crypto.randomBytes(20).toString('hex');

    // Hash token and set to resetPasswordToken field
    this.resetPasswordToken = crypto
        .createHash('sha256')
        .update(resetToken)
        .digest('hex');

    // Set expire
    this.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 minutes

    return resetToken;
};

const User = mongoose.model('User', userSchema);

export default User;
