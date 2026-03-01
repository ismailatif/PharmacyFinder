import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Pharmacy from '../models/Pharmacy.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

function normalizePhone(phone) {
    if (!phone) return '';
    // Remove all non-digits
    let cleaned = phone.replace(/\D/g, '');

    // Normalize Morocco format
    // +212 6... -> 06...
    // 212 6... -> 06...
    if (cleaned.startsWith('212')) {
        cleaned = '0' + cleaned.substring(3);
    }

    return cleaned;
}

const updateFromCharMatches = async () => {
    try {
        console.log('🔄 Updating phone numbers from character similarity matches...\n');

        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/pharmacy-finder');
        console.log('✅ Connected to MongoDB\n');

        const reportPath = path.join(__dirname, '../data/char_similarity_report.json');
        if (!fs.existsSync(reportPath)) {
            console.error('❌ Report file not found!');
            process.exit(1);
        }

        const matches = JSON.parse(fs.readFileSync(reportPath, 'utf-8'));
        console.log(`📁 Loaded ${matches.length} potential matches from report\n`);

        let updated = 0;
        let skippedSame = 0;
        let notFound = 0;

        for (const match of matches) {
            const { dbName, scrapedPhone, dbPhone } = match;

            if (!scrapedPhone) continue;

            const normScraped = normalizePhone(scrapedPhone);
            const normDb = normalizePhone(dbPhone);

            // Skip if phone numbers are effectively the same
            if (normScraped === normDb && normScraped !== '') {
                skippedSame++;
                continue;
            }

            // Find the pharmacy in DB to update
            const pharmacy = await Pharmacy.findOne({ name: dbName, city: 'Fès' });

            if (pharmacy) {
                // Double check current DB phone (in case it changed since report generation)
                const currentNormDb = normalizePhone(pharmacy.phone);

                if (normScraped === currentNormDb && normScraped !== '') {
                    skippedSame++;
                } else {
                    // Update!
                    const oldPhone = pharmacy.phone;
                    pharmacy.phone = scrapedPhone;
                    await pharmacy.save();
                    updated++;
                    console.log(`✅ Updated: "${dbName}" (Match: "${match.scrapedName}")`);
                    console.log(`   Old: "${oldPhone}" → New: "${scrapedPhone}"\n`);
                }
            } else {
                notFound++;
                console.log(`❌ Pharmacy not found in DB: "${dbName}"\n`);
            }
        }

        console.log(`\n📊 Update Summary:`);
        console.log(`   - Updated: ${updated}`);
        console.log(`   - Skipped (same phone): ${skippedSame}`);
        console.log(`   - Not found in DB: ${notFound}`);
        console.log(`   - Total processed: ${matches.length}`);

    } catch (error) {
        console.error(error);
    } finally {
        await mongoose.connection.close();
        process.exit();
    }
};

updateFromCharMatches();
