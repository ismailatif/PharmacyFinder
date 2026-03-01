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

const updatePhoneNumbers = async () => {
    try {
        console.log('📞 Starting phone number update for Fes pharmacies...\n');

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

        let updated = 0;
        let notFound = 0;
        let skipped = 0;
        const notFoundPharmacies = [];

        for (const p of scrapedPharmacies) {
            // Skip if no name or phone
            if (!p.name || !p.phone) {
                skipped++;
                continue;
            }

            // Find existing pharmacy by name and city
            const existing = await Pharmacy.findOne({
                name: p.name,
                city: 'Fès'
            });

            if (existing) {
                // Only update if phone number has changed
                if (existing.phone !== p.phone) {
                    existing.phone = p.phone;
                    await existing.save();
                    updated++;
                    console.log(`✅ Updated: ${p.name} | Old: ${existing.phone} → New: ${p.phone}`);
                } else {
                    console.log(`⏭️  Skipped: ${p.name} | Phone already up to date`);
                    skipped++;
                }
            } else {
                notFound++;
                notFoundPharmacies.push(p);
                console.log(`❌ Not found in DB: ${p.name}`);
            }
        }

        // Save not found pharmacies to JSON file
        if (notFoundPharmacies.length > 0) {
            const notFoundPath = path.join(__dirname, '../data/fes_pharmacies_not_in_db.json');
            fs.writeFileSync(notFoundPath, JSON.stringify(notFoundPharmacies, null, 2));
            console.log(`\n💾 Saved ${notFoundPharmacies.length} not-found pharmacies to: ${notFoundPath}`);
        }

        console.log(`\n📊 Update Summary:`);
        console.log(`   - Updated: ${updated}`);
        console.log(`   - Not found in DB: ${notFound}`);
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

updatePhoneNumbers();
