import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Pharmacy from '../models/Pharmacy.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

const revertAndApply = async () => {
    try {
        console.log('🔄 Reverting fuzzy match updates...\n');

        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/pharmacy-finder');
        console.log('✅ Connected to MongoDB\n');

        const reportPath = path.join(__dirname, '../data/char_similarity_report.json');
        if (!fs.existsSync(reportPath)) {
            console.error('❌ Report file not found!');
            process.exit(1);
        }

        const matches = JSON.parse(fs.readFileSync(reportPath, 'utf-8'));
        console.log(`📁 Loaded ${matches.length} potential matches for revert\n`);

        let reverted = 0;
        let notFound = 0;

        // 1. Revert ALL matches back to `dbPhone`
        for (const match of matches) {
            const { dbName, dbPhone } = match; // The original phone in DB was dbPhone

            const pharmacy = await Pharmacy.findOne({ name: dbName, city: 'Fès' });

            if (pharmacy) {
                // Only revert if current phone is different from original dbPhone
                if (pharmacy.phone !== dbPhone) {
                    pharmacy.phone = dbPhone;
                    await pharmacy.save();
                    reverted++;
                    // console.log(`✅ Reverted: "${dbName}" -> "${dbPhone}"`);
                }
            } else {
                notFound++;
            }
        }

        console.log(`✅ Reverted ${reverted} pharmacies to original state.\n`);

        // 2. Apply SPECIFIC updates requested by user
        console.log('🔄 Applying specific updates requested by user...\n');

        const specificUpdates = [
            {
                dbName: "Pharmacie Al Makkiya",
                scrapedName: "Pharmacie Al Makkia",
                scrapedPhone: "0535 76 42 46"
            },
            {
                dbName: "Pharmacie Al Jawaher",
                scrapedName: "Pharmacie Al Jawahir",
                scrapedPhone: "0535 97 45 45"
            },
            {
                dbName: "Pharmacie Jnan Drader",
                scrapedName: "Pharmacie Jnane Drader",
                scrapedPhone: "0535 76 38 49"
            }
        ];

        let applied = 0;

        for (const update of specificUpdates) {
            const pharmacy = await Pharmacy.findOne({ name: update.dbName, city: 'Fès' });

            if (pharmacy) {
                const oldPhone = pharmacy.phone;
                pharmacy.phone = update.scrapedPhone;
                await pharmacy.save();
                applied++;
                console.log(`✅ Updated Specific: "${update.dbName}"`);
                console.log(`   Old: "${oldPhone}" → New: "${update.scrapedPhone}"\n`);
            } else {
                console.log(`❌ Specific pharmacy not found: "${update.dbName}"\n`);
            }
        }

        console.log(`\n📊 Summary:`);
        console.log(`   - Bulk Reverted: ${reverted}`);
        console.log(`   - Specific Applied: ${applied}`);
        console.log(`   - Not found in DB: ${notFound}`);

    } catch (error) {
        console.error(error);
    } finally {
        await mongoose.connection.close();
        process.exit();
    }
};

revertAndApply();
