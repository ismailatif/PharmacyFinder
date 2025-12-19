import User from '../models/User.js';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { OAuth2Client } from 'google-auth-library';
import sendEmail from '../utils/sendEmail.js';

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Generate Access Token
const generateAccessToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_ACCESS_SECRET || 'access_secret_123', {
        expiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m'
    });
};

// Generate Refresh Token
const generateRefreshToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_REFRESH_SECRET || 'refresh_secret_123', {
        expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d'
    });
};

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
export const register = async (req, res) => {
    try {
        const { name, email, password, role } = req.body;

        // Check if user exists
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ success: false, message: 'User already exists' });
        }

        // Create user
        const user = await User.create({
            name,
            email,
            password,
            role: role || 'user'
        });

        sendTokenResponse(user, 201, res);
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
export const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validate email & password
        if (!email || !password) {
            return res.status(400).json({ success: false, message: 'Please provide an email and password' });
        }

        // Check for user
        const user = await User.findOne({ email }).select('+password');
        if (!user) {
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }

        // Check if password matches
        const isMatch = await user.matchPassword(password);
        if (!isMatch) {
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }

        sendTokenResponse(user, 200, res);
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        res.status(200).json({ success: true, data: user });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// @desc    Log user out / clear cookie
// @route   POST /api/auth/logout
// @access  Private
export const logout = async (req, res) => {
    res.cookie('refreshToken', 'none', {
        expires: new Date(Date.now() + 10 * 1000),
        httpOnly: true
    });

    res.status(200).json({ success: true, data: {} });
};

// @desc    Refresh Access Token
// @route   POST /api/auth/refresh-token
// @access  Public (via cookie)
export const refreshToken = async (req, res) => {
    try {
        const refreshToken = req.cookies.refreshToken;

        if (!refreshToken) {
            return res.status(401).json({ success: false, message: 'Not authorized, no refresh token' });
        }

        const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET || 'refresh_secret_123');

        const user = await User.findById(decoded.id);

        if (!user) {
            return res.status(401).json({ success: false, message: 'User not found' });
        }

        const accessToken = generateAccessToken(user._id);

        res.status(200).json({
            success: true,
            accessToken
        });
    } catch (err) {
        console.error('Refresh Token Error:', err.message);
        return res.status(401).json({ success: false, message: 'Not authorized, invalid refresh token' });
    }
};

// @desc    Google Login
// @route   POST /api/auth/google
// @access  Public
export const googleLogin = async (req, res) => {
    try {
        const { tokenId } = req.body;

        const verify = await client.verifyIdToken({
            idToken: tokenId,
            audience: process.env.GOOGLE_CLIENT_ID
        });

        const { email_verified, name, email, sub: googleId } = verify.getPayload();

        if (email_verified) {
            let user = await User.findOne({ email });

            if (user) {
                if (!user.googleId) {
                    user.googleId = googleId;
                    await user.save();
                }
                sendTokenResponse(user, 200, res);
            } else {
                let password = email + process.env.JWT_ACCESS_SECRET;
                user = await User.create({ name, email, password, googleId });
                sendTokenResponse(user, 201, res);
            }
        } else {
            return res.status(400).json({ success: false, message: 'Google login failed. Email not verified.' });
        }
    } catch (err) {
        console.error('Google Auth Error:', err);
        res.status(500).json({ success: false, message: 'Google login failed' });
    }
};

// @desc    Forgot Password
// @route   POST /api/auth/forgotpassword
// @access  Public
export const forgotPassword = async (req, res) => {
    try {
        const user = await User.findOne({ email: req.body.email });

        if (!user) {
            return res.status(404).json({ success: false, message: 'There is no user with that email' });
        }

        const resetToken = user.getResetPasswordToken();

        await user.save({ validateBeforeSave: false });

        const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/resetpassword/${resetToken}`;

        // Professional HTML Email Template
        const htmlMessage = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Reset Your Password</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
    <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #f5f5f5;">
        <tr>
            <td align="center" style="padding: 40px 0;">
                <table role="presentation" style="width: 600px; max-width: 100%; border-collapse: collapse; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                    
                    <!-- Header -->
                    <tr>
                        <td style="padding: 40px 40px 20px; text-align: center; background: linear-gradient(135deg, #10b981 0%, #059669 100%); border-radius: 12px 12px 0 0;">
                            <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700; letter-spacing: -0.5px;">
                                🔐 PharmacyFinder
                            </h1>
                        </td>
                    </tr>
                    
                    <!-- Content -->
                    <tr>
                        <td style="padding: 40px;">
                            <h2 style="margin: 0 0 16px; color: #1f2937; font-size: 24px; font-weight: 600;">
                                Reset Your Password
                            </h2>
                            
                            <p style="margin: 0 0 24px; color: #6b7280; font-size: 16px; line-height: 1.6;">
                                We received a request to reset the password for your PharmacyFinder account. If you didn't make this request, you can safely ignore this email.
                            </p>
                            
                            <p style="margin: 0 0 32px; color: #6b7280; font-size: 16px; line-height: 1.6;">
                                To reset your password, click the button below:
                            </p>
                            
                            <!-- CTA Button -->
                            <table role="presentation" style="width: 100%; border-collapse: collapse;">
                                <tr>
                                    <td align="center" style="padding: 0;">
                                        <a href="${resetUrl}" style="display: inline-block; padding: 16px 40px; background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 6px rgba(16, 185, 129, 0.3);">
                                            Reset Password
                                        </a>
                                    </td>
                                </tr>
                            </table>
                            
                            <p style="margin: 32px 0 0; color: #9ca3af; font-size: 14px; line-height: 1.6;">
                                Or copy and paste this link into your browser:
                            </p>
                            
                            <p style="margin: 8px 0 0; padding: 12px; background-color: #f9fafb; border: 1px solid #e5e7eb; border-radius: 6px; color: #6b7280; font-size: 14px; word-break: break-all;">
                                ${resetUrl}
                            </p>
                            
                            <p style="margin: 32px 0 0; color: #9ca3af; font-size: 14px; line-height: 1.6;">
                                <strong>This link will expire in 10 minutes</strong> for security reasons.
                            </p>
                        </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                        <td style="padding: 32px 40px; background-color: #f9fafb; border-top: 1px solid #e5e7eb; border-radius: 0 0 12px 12px;">
                            <p style="margin: 0 0 8px; color: #6b7280; font-size: 14px; line-height: 1.6; text-align: center;">
                                If you didn't request a password reset, please ignore this email or contact support if you have concerns.
                            </p>
                            
                            <p style="margin: 16px 0 0; color: #9ca3af; font-size: 12px; text-align: center;">
                                © ${new Date().getFullYear()} PharmacyFinder. All rights reserved.
                            </p>
                        </td>
                    </tr>
                    
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
        `;

        const plainTextMessage = `You are receiving this email because you (or someone else) has requested the reset of a password.

Please click the following link to reset your password:
${resetUrl}

This link will expire in 10 minutes.

If you didn't request this, please ignore this email.

© ${new Date().getFullYear()} PharmacyFinder. All rights reserved.`;

        try {
            await sendEmail({
                email: user.email,
                subject: 'Reset Your Password - PharmacyFinder',
                message: plainTextMessage,
                html: htmlMessage
            });

            res.status(200).json({ success: true, data: 'Email sent' });
        } catch (err) {
            console.error('Email Send Error:', err);
            user.resetPasswordToken = undefined;
            user.resetPasswordExpire = undefined;

            await user.save({ validateBeforeSave: false });

            return res.status(500).json({ success: false, message: 'Email could not be sent' });
        }
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// @desc    Reset Password
// @route   PUT /api/auth/resetpassword/:resettoken
// @access  Public
export const resetPassword = async (req, res) => {
    try {
        const resetPasswordToken = crypto
            .createHash('sha256')
            .update(req.params.resettoken)
            .digest('hex');

        const user = await User.findOne({
            resetPasswordToken,
            resetPasswordExpire: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({ success: false, message: 'Invalid token' });
        }

        user.password = req.body.password;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;

        await user.save();

        sendTokenResponse(user, 200, res);
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// Helper to send tokens
const sendTokenResponse = (user, statusCode, res) => {
    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    const options = {
        expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
        httpOnly: true,
        secure: false, // Set to false for localhost development
        sameSite: 'lax',
        path: '/' // Ensure cookie is available for all paths
    };

    if (process.env.NODE_ENV === 'production') {
        options.secure = true;
        options.sameSite = 'strict';
    }

    res
        .status(statusCode)
        .cookie('refreshToken', refreshToken, options)
        .json({
            success: true,
            accessToken,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                image: user.image,
                savedPharmacies: user.savedPharmacies,
                preferences: user.preferences
            }
        });
};
