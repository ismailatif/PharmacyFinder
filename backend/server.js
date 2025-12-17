import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import compression from 'compression';
import connectDB from './config/database.js';
import pharmacyRoutes from './routes/pharmacies.js';
import authRoutes from './routes/authRoutes.js';
import medicationRoutes from './routes/medications.js';
import { errorHandler } from './middleware/errorHandler.js';
import { requestLogger } from './middleware/logger.js';
import { getCities } from './controllers/pharmacyController.js';

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();
const PORT = process.env.PORT || 5000;

// Security Headers Middleware
app.use(compression());
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            scriptSrc: ["'self'", "'unsafe-inline'", "https://accounts.google.com"],
            imgSrc: ["'self'", "data:", "https:"],
            connectSrc: ["'self'"],
            fontSrc: ["'self'", "data:"],
            objectSrc: ["'none'"],
            mediaSrc: ["'self'"],
            frameSrc: ["'self'", "https://accounts.google.com"]
        }
    },
    crossOriginEmbedderPolicy: false, // Allow embedding for Google OAuth
    crossOriginOpenerPolicy: { policy: "same-origin-allow-popups" }, // Allow Google Auth popups
}));

import rateLimit from 'express-rate-limit';

// Rate Limiting
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 1000, // Limit each IP to 1000 requests per windowMs
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    message: {
        success: false,
        message: 'Too many requests, please try again later.'
    }
});

// Apply rate limiting to all API routes
app.use('/api', apiLimiter);

// CORS Middleware
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true
}));

// Body Parser Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(requestLogger);

// Routes
app.get('/api', (req, res) => {
    res.json({
        message: 'Pharmacy Finder API',
        version: '1.0.0',
        endpoints: {
            auth: '/api/auth',
            pharmacies: '/api/pharmacies',
            pharmacyById: '/api/pharmacies/:id',
            nearbyPharmacies: '/api/pharmacies/nearby',
            cities: '/api/cities'
        }
    });
});

app.use('/api/auth', authRoutes);
app.use('/api/pharmacies', pharmacyRoutes);
app.use('/api/medications', medicationRoutes);

// Cities route
app.get('/api/cities', getCities);

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Route not found'
    });
});

// Error handler
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🌐 CORS enabled for: ${process.env.FRONTEND_URL || 'http://localhost:5173'}`);
});
