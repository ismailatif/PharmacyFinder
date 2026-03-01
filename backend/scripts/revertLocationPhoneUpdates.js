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

const revertPhoneNumbers = async () => {
    try {
        console.log('🔄 Reverting phone numbers to original values...\n');

        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/pharmacy-finder');
        console.log('✅ Connected to MongoDB\n');

        // Read the update log
        const logPath = path.join(__dirname, '../data/location_phone_updates.json');
        if (!fs.existsSync(logPath)) {
            console.error('❌ Update log file not found!');
            console.log('Cannot revert without the log file.');
            process.exit(1);
        }

        const updates = JSON.parse(fs.readFileSync(logPath, 'utf-8'));
        console.log(`📁 Loaded ${updates.length} updates to revert\n`);

        // Reverse the array to process from last to first
        const reversedUpdates = updates.reverse();
        console.log(`🔄 Processing in reverse order (last to first)\n`);

        let reverted = 0;
        let notFound = 0;
        let skipped = 0;

        for (const update of reversedUpdates) {
            const { dbName, oldPhone, newPhone } = update;

            // Find the pharmacy by name
            const pharmacy = await Pharmacy.findOne({
                name: dbName,
                city: 'Fès'
            });

            if (pharmacy) {
                // Check if the phone is still the "new" value we set
                if (pharmacy.phone === newPhone) {
                    pharmacy.phone = oldPhone;
                    await pharmacy.save();
                    reverted++;
                    console.log(`✅ Reverted: "${dbName}"`);
                    console.log(`   ${newPhone} → ${oldPhone}\n`);
                } else {
                    skipped++;
                    console.log(`⏭️  Skipped: "${dbName}" (phone already changed: ${pharmacy.phone})\n`);
                }
            } else {
                notFound++;
                console.log(`❌ Not found: "${dbName}"\n`);
            }
        }

        console.log(`\n📊 Revert Summary:`);
        console.log(`   - Reverted: ${reverted}`);
        console.log(`   - Not found: ${notFound}`);
        console.log(`   - Skipped: ${skipped}`);
        console.log(`   - Total processed: ${updates.length}`);

    } catch (error) {
        console.error('\n❌ Revert failed:', error);
        process.exit(1);
    } finally {
        await mongoose.connection.close();
        console.log('\n👋 Disconnected from MongoDB');
        process.exit(0);
    }
};

revertPhoneNumbers();
