import { body } from 'express-validator';

// Update profile validation
export const updateProfileValidation = [
    body('name')
        .optional()
        .trim()
        .isLength({ min: 2, max: 50 }).withMessage('Name must be between 2 and 50 characters')
        .matches(/^[a-zA-Z\s\u0600-\u06FF]+$/).withMessage('Name can only contain letters and spaces'),

    body('email')
        .optional()
        .trim()
        .isEmail().withMessage('Please provide a valid email address')
        .normalizeEmail()
];

// Update password validation
export const updatePasswordValidation = [
    body('currentPassword')
        .notEmpty().withMessage('Current password is required'),

    body('newPassword')
        .notEmpty().withMessage('New password is required')
        .isLength({ min: 6 }).withMessage('Password must be at least 6 characters long')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/).withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number')
];

// Update preferences validation
export const updatePreferencesValidation = [
    body('language')
        .optional()
        .isIn(['fr', 'ar']).withMessage('Language must be either fr or ar'),

    body('theme')
        .optional()
        .isIn(['light', 'dark', 'system']).withMessage('Theme must be light, dark, or system'),

    body('notifications')
        .optional()
        .isBoolean().withMessage('Notifications must be a boolean'),

    body('searchRadius')
        .optional()
        .isInt({ min: 1000, max: 50000 }).withMessage('Search radius must be between 1000 and 50000 meters')
];
