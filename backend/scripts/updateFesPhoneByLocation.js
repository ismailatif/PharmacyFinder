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

// Calculate distance between two coordinates in meters using Haversine formula
function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lon2 - lon1) * Math.PI / 180;

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
        Math.cos(φ1) * Math.cos(φ2) *
        Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // Distance in meters
}

const updatePhoneNumbersByLocation = async () => {
    try {
        console.log('📍 Starting location-based phone number update for Fès pharmacies...\n');

        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/pharmacy-finder');
        console.log('✅ Connected to MongoDB\n');

        // Read scraped data
        const dataPath = path.join(__dirname, '../data/fes_pharmacies_scraped.json');
        if (!fs.existsSync(dataPath)) {
            console.error('❌ Scraped data file not found!');
            process.exit(1);
        }

        const scrapedPharmacies = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
        console.log(`📁 Loaded ${scrapedPharmacies.length} pharmacies from JSON\n`);

        // Get all Fès pharmacies from database
        const dbPharmacies = await Pharmacy.find({ city: 'Fès' });
        console.log(`🗄️  Found ${dbPharmacies.length} pharmacies in database\n`);

        let updated = 0;
        let skipped = 0;
        let noMatch = 0;
        const proximityThreshold = 5; // Match if within 5 meters (GPS error margin)
        const matchLog = [];

        for (const scrapedPharmacy of scrapedPharmacies) {
            // Skip if no coordinates or phone
            if (!scrapedPharmacy.coordinates || !scrapedPharmacy.phone) {
                skipped++;
                continue;
            }

            const scrapedLat = scrapedPharmacy.coordinates.lat;
            const scrapedLng = scrapedPharmacy.coordinates.lng;

            // Find closest pharmacy in database
            let closestPharmacy = null;
            let minDistance = Infinity;

            for (const dbPharmacy of dbPharmacies) {
                if (!dbPharmacy.location || !dbPharmacy.location.coordinates) {
                    continue;
                }

                // MongoDB stores as [lng, lat], we need [lat, lng]
                const dbLng = dbPharmacy.location.coordinates[0];
                const dbLat = dbPharmacy.location.coordinates[1];

                const distance = calculateDistance(scrapedLat, scrapedLng, dbLat, dbLng);

                if (distance < minDistance) {
                    minDistance = distance;
                    closestPharmacy = dbPharmacy;
                }
            }

            // If we found a match within threshold
            if (closestPharmacy && minDistance <= proximityThreshold) {
                const oldPhone = closestPharmacy.phone;
                const newPhone = scrapedPharmacy.phone;

                if (oldPhone !== newPhone) {
                    closestPharmacy.phone = newPhone;
                    await closestPharmacy.save();
                    updated++;

                    const logEntry = {
                        scrapedName: scrapedPharmacy.name,
                        dbName: closestPharmacy.name,
                        distance: Math.round(minDistance),
                        oldPhone,
                        newPhone
                    };
                    matchLog.push(logEntry);

                    console.log(`✅ Updated: "${scrapedPharmacy.name}" → "${closestPharmacy.name}"`);
                    console.log(`   Distance: ${Math.round(minDistance)}m | Old: ${oldPhone} → New: ${newPhone}\n`);
                } else {
                    skipped++;
                    console.log(`⏭️  Skipped: "${scrapedPharmacy.name}" → "${closestPharmacy.name}"`);
                    console.log(`   Distance: ${Math.round(minDistance)}m | Phone already correct\n`);
                }
            } else {
                noMatch++;
                if (closestPharmacy) {
                    console.log(`❌ No match: "${scrapedPharmacy.name}" (closest: "${closestPharmacy.name}" at ${Math.round(minDistance)}m)`);
                } else {
                    console.log(`❌ No match: "${scrapedPharmacy.name}" (no nearby pharmacies found)`);
                }
            }
        }

        // Save match log to JSON file
        if (matchLog.length > 0) {
            const logPath = path.join(__dirname, '../data/location_phone_updates.json');
            fs.writeFileSync(logPath, JSON.stringify(matchLog, null, 2));
            console.log(`\n💾 Saved update log to: ${logPath}`);
        }

        console.log(`\n📊 Update Summary:`);
        console.log(`   - Updated: ${updated}`);
        console.log(`   - No match within ${proximityThreshold}m: ${noMatch}`);
        console.log(`   - Skipped (no change or invalid): ${skipped}`);
        console.log(`   - Total processed: ${scrapedPharmacies.length}`);

    } catch (error) {
        console.error('\n❌ Update failed:', error);
        process.exit(1);
    } finally {
        await mongoose.connection.close();
        console.log('\n👋 Disconnected from MongoDB');
        process.exit(0);
    }
};

updatePhoneNumbersByLocation();
