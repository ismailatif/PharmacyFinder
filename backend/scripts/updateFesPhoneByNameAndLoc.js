import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Pharmacy from '../models/Pharmacy.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

// Haversine formula for distance
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

    return R * c;
}

// Function to check word difference
function areNamesSimilar(name1, name2) {
    // Normalize: lowercase, remove special chars, extra spaces
    const clean1 = name1.toLowerCase().replace(/[^a-z0-9\s]/g, '').trim().split(/\s+/);
    const clean2 = name2.toLowerCase().replace(/[^a-z0-9\s]/g, '').trim().split(/\s+/);

    const set1 = new Set(clean1);
    const set2 = new Set(clean2);

    let diffCount = 0;

    // Words in name1 not in name2
    for (const word of clean1) {
        if (!set2.has(word)) diffCount++;
    }

    // Words in name2 not in name1
    for (const word of clean2) {
        if (!set1.has(word)) diffCount++;
    }

    // Allow max difference of 2 words
    return diffCount <= 2;
}

const updatePhoneByNameAndLocation = async () => {
    try {
        console.log('📍 Starting name+location based phone update...\n');

        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/pharmacy-finder');
        console.log('✅ Connected to MongoDB\n');

        const dataPath = path.join(__dirname, '../data/fes_pharmacies_scraped.json');
        const scrapedPharmacies = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));

        const dbPharmacies = await Pharmacy.find({ city: 'Fès' });
        console.log(`🗄️  Loaded ${dbPharmacies.length} pharmacies from DB`);

        let updated = 0;
        let skipped = 0;
        let noMatch = 0;
        const proximityThreshold = 5; // 5 meters

        for (const scraped of scrapedPharmacies) {
            if (!scraped.coordinates || !scraped.phone) continue;

            const sLat = scraped.coordinates.lat;
            const sLng = scraped.coordinates.lng;

            // Find match in DB
            let potentialMatch = null;
            let minDistance = Infinity;

            for (const dbP of dbPharmacies) {
                if (!dbP.location?.coordinates) continue;

                const dbLng = dbP.location.coordinates[0];
                const dbLat = dbP.location.coordinates[1];
                const dist = calculateDistance(sLat, sLng, dbLat, dbLng);

                // Check distance first (optimization)
                if (dist <= proximityThreshold) {
                    // Check name similarity (1 or 2 words difference)
                    if (areNamesSimilar(scraped.name, dbP.name)) {
                        // Found a candidate
                        if (dist < minDistance) {
                            minDistance = dist;
                            potentialMatch = dbP;
                        }
                    }
                }
            }

            if (potentialMatch) {
                if (potentialMatch.phone !== scraped.phone) {
                    const oldP = potentialMatch.phone;
                    potentialMatch.phone = scraped.phone;
                    await potentialMatch.save();
                    updated++;
                    console.log(`✅ Updated: "${scraped.name}" → "${potentialMatch.name}"`);
                    console.log(`   Dist: ${Math.round(minDistance)}m | Diff: ${Math.abs(scraped.name.split(' ').length - potentialMatch.name.split(' ').length)} words`);
                    console.log(`   ${oldP} → ${scraped.phone}\n`);
                } else {
                    skipped++;
                }
            } else {
                noMatch++;
            }
        }

        console.log(`\n📊 Update Summary:`);
        console.log(`   - Updated: ${updated}`);
        console.log(`   - Skipped (phone correct): ${skipped}`);
        console.log(`   - No match: ${noMatch}`);

    } catch (error) {
        console.error(error);
    } finally {
        await mongoose.connection.close();
        process.exit();
    }
};

updatePhoneByNameAndLocation();
