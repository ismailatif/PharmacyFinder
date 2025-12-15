import User from '../models/User.js';

// @desc    Update user profile
// @route   PUT /api/auth/updateprofile
// @access  Private
export const updateProfile = async (req, res) => {
    try {
        const { name, email } = req.body;

        const user = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        // Check if email is being changed and if it's already taken
        if (email && email !== user.email) {
            const emailExists = await User.findOne({ email });
            if (emailExists) {
                return res.status(400).json({ success: false, message: 'Email already in use' });
            }
            user.email = email;
            user.emailVerified = false; // Reset verification if email changes
        }

        if (name) user.name = name;

        await user.save();

        res.status(200).json({
            success: true,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                emailVerified: user.emailVerified,
                createdAt: user.createdAt,
                preferences: user.preferences
            }
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// @desc    Update password
// @route   PUT /api/auth/updatepassword
// @access  Private
export const updatePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;

        const user = await User.findById(req.user.id).select('+password');

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        // Check if user has a password (not Google OAuth user)
        if (!user.password) {
            return res.status(400).json({ success: false, message: 'Cannot change password for Google OAuth accounts' });
        }

        // Verify current password
        const isMatch = await user.matchPassword(currentPassword);
        if (!isMatch) {
            return res.status(401).json({ success: false, message: 'Current password is incorrect' });
        }

        // Update password
        user.password = newPassword;
        await user.save();

        res.status(200).json({
            success: true,
            message: 'Password updated successfully'
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// @desc    Get user preferences
// @route   GET /api/auth/preferences
// @access  Private
export const getPreferences = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        res.status(200).json({
            success: true,
            preferences: user.preferences || {
                language: 'fr',
                theme: 'system',
                notifications: true,
                searchRadius: 5000
            }
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// @desc    Update user preferences
// @route   PUT /api/auth/preferences
// @access  Private
export const updatePreferences = async (req, res) => {
    try {
        const { language, theme, notifications, searchRadius } = req.body;

        const user = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        // Initialize preferences if it doesn't exist
        if (!user.preferences) {
            user.preferences = {
                language: 'fr',
                theme: 'system',
                notifications: true,
                searchRadius: 5000
            };
        }

        // Update preferences
        if (language) user.preferences.language = language;
        if (theme) user.preferences.theme = theme;
        if (notifications !== undefined) user.preferences.notifications = notifications;
        if (searchRadius) user.preferences.searchRadius = searchRadius;

        await user.save();

        res.status(200).json({
            success: true,
            preferences: user.preferences
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// @desc    Toggle saved pharmacy (add/remove)
// @route   PUT /api/auth/saved-pharmacies/:id
// @access  Private
export const toggleSavedPharmacy = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        const pharmacyId = req.params.id;

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        // Check if pharmacy is already saved
        const index = user.savedPharmacies.indexOf(pharmacyId);

        if (index > -1) {
            // Remove from saved
            user.savedPharmacies.splice(index, 1);
        } else {
            // Add to saved
            user.savedPharmacies.push(pharmacyId);
        }

        await user.save();

        res.status(200).json({
            success: true,
            savedPharmacies: user.savedPharmacies
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// @desc    Get user's saved pharmacies
// @route   GET /api/auth/saved-pharmacies
// @access  Private
export const getSavedPharmacies = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).populate('savedPharmacies');

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        res.status(200).json({
            success: true,
            savedPharmacies: user.savedPharmacies
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
