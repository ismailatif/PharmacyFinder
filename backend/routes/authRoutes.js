import express from 'express';
import {
    register,
    login,
    getMe,
    logout,
    refreshToken,
    googleLogin,
    forgotPassword,
    resetPassword
} from '../controllers/authController.js';
import {
    updateProfile,
    updatePassword,
    getPreferences,
    updatePreferences,
    toggleSavedPharmacy,
    getSavedPharmacies
} from '../controllers/profileController.js';
import { protect } from '../middleware/authMiddleware.js';
import {
    registerValidation,
    loginValidation,
    forgotPasswordValidation,
    resetPasswordValidation,
    validate
} from '../middleware/validation.js';
import {
    updateProfileValidation,
    updatePasswordValidation,
    updatePreferencesValidation
} from '../middleware/profileValidation.js';

const router = express.Router();

// Authentication routes
router.post('/register', registerValidation, validate, register);
router.post('/login', loginValidation, validate, login);
router.post('/google', googleLogin);
router.post('/forgotpassword', forgotPasswordValidation, validate, forgotPassword);
router.put('/resetpassword/:resettoken', resetPasswordValidation, validate, resetPassword);
router.post('/logout', logout);
router.post('/refresh-token', refreshToken);
router.get('/me', protect, getMe);

// Profile management routes
router.put('/updateprofile', protect, updateProfileValidation, validate, updateProfile);
router.put('/updatepassword', protect, updatePasswordValidation, validate, updatePassword);
router.get('/preferences', protect, getPreferences);
router.put('/preferences', protect, updatePreferencesValidation, validate, updatePreferences);
router.put('/saved-pharmacies/:id', protect, toggleSavedPharmacy);
router.get('/saved-pharmacies', protect, getSavedPharmacies);

export default router;
