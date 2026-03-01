import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Pharmacy from '../models/Pharmacy.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

const importData = async () => {
    try {
        console.log('🚀 Starting Fes pharmacies import...\n');

        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/pharmacy-finder');
        console.log('✅ Connected to MongoDB\n');

        // Read scraped data
        const dataPath = path.join(__dirname, '../data/fes_pharmacies_scraped.json');
        if (!fs.existsSync(dataPath)) {
            console.error('❌ Scraped data file not found!');
            process.exit(1);
        }

        const pharmacies = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
        console.log(`📁 Loaded ${pharmacies.length} pharmacies from JSON\n`);

        let inserted = 0;
        let updated = 0;
        let skipped = 0;

        for (const p of pharmacies) {
            // Basic validation
            if (!p.name) {
                console.warn('⚠️  Skipping pharmacy without name:', p);
                skipped++;
                continue;
            }

            // Create unique ID if not present (simple slug)
            const id = `pharmacy-${p.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${Date.now()}`;

            // Prepare object for MongoDB
            const pharmacyData = {
                id: p.id || id,
                name: p.name,
                nameAr: p.name, // Fallback to same name if no Arabic
                city: 'Fes',
                cityAr: 'Fes',
                address: p.address || 'Fes',
                addressAr: p.address || 'Fes',
                phone: p.phone,
                location: {
                    type: 'Point',
                    coordinates: p.coordinates ? [p.coordinates.lng, p.coordinates.lat] : [0, 0] // Default if missing
                },
                isOpen: true, // Default
                isOnDuty: false, // Default
                rating: 0, // Default
                reviewCount: 0,
                priceRange: 'medium',
                hasParking: false,
                isAccessible: false,
                acceptsInsurance: false,
                hasDelivery: false,
                openingHours: '09:00 - 19:00',
                openingHoursAr: '09:00 - 19:00',
                images: [
                    'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=800',
                    'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800',
                    'https://images.unsplash.com/photo-1631549916768-4119b2e5f926?w=800'
                ]
            };

            // If coordinates are missing (0,0), we might want to skip or flag
            if (pharmacyData.location.coordinates[0] === 0 && pharmacyData.location.coordinates[1] === 0) {
                console.warn(`⚠️  No coordinates for ${p.name}, using default (0,0)`);
            }

            // Try to find existing pharmacy by name and city
            const existing = await Pharmacy.findOne({
                name: p.name,
                city: 'Fes'
            });

            if (existing) {
                // Update existing
                // Only update fields that are present in scraped data to avoid wiping out manual edits
                if (p.phone) existing.phone = p.phone;
                if (p.address) existing.address = p.address;
                if (p.coordinates) {
                    existing.location = {
                        type: 'Point',
                        coordinates: [p.coordinates.lng, p.coordinates.lat]
                    };
                }
                await existing.save();
                updated++;
                console.log(`Updated: ${p.name}`);
            } else {
                // Insert new
                await Pharmacy.create(pharmacyData);
                inserted++;
                console.log(`Inserted: ${p.name}`);
            }
        }

        console.log(`\n📊 Import Summary:`);
        console.log(`   - Inserted: ${inserted}`);
        console.log(`   - Updated: ${updated}`);
        console.log(`   - Skipped: ${skipped}`);
        console.log(`   - Total processed: ${pharmacies.length}`);

    } catch (error) {
        console.error('\n❌ Import failed:', error);
        process.exit(1);
    } finally {
        await mongoose.connection.close();
        console.log('👋 Disconnected from MongoDB');
        process.exit(0);
    }
};

importData();
