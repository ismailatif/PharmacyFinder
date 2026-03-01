import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import Pharmacy from '../models/Pharmacy.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

const removePharmaciesWithoutImages = async () => {
    try {
        console.log('🖼️  Starting removal of pharmacies without images...\n');

        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/pharmacy-finder');
        console.log('✅ Connected to MongoDB\n');

        const beforeCount = await Pharmacy.countDocuments({ city: 'Fes' });
        console.log(`📊 Fes pharmacies before cleanup: ${beforeCount}\n`);

        // Find pharmacies without images or with empty images array
        const noImagesCriteria = {
            city: 'Fes',
            $or: [
                { images: { $exists: false } },
                { images: null },
                { images: [] },
                { images: { $size: 0 } }
            ]
        };

        // Get the list first to show what will be removed
        const toRemove = await Pharmacy.find(noImagesCriteria).select('name images');

        console.log(`❌ Found ${toRemove.length} pharmacies without images:\n`);

        toRemove.forEach((pharmacy, index) => {
            if (index < 20) {  // Show first 20
                console.log(`   - ${pharmacy.name}`);
            }
        });

        if (toRemove.length > 20) {
            console.log(`   ... and ${toRemove.length - 20} more\n`);
        } else {
            console.log('');
        }

        if (toRemove.length > 0) {
            console.log('🗑️  Removing pharmacies without images...');
            const result = await Pharmacy.deleteMany(noImagesCriteria);
            console.log(`✅ Removed ${result.deletedCount} pharmacies\n`);
        } else {
            console.log('✅ All pharmacies have images!\n');
        }

        const afterCount = await Pharmacy.countDocuments({ city: 'Fes' });
        console.log(`📊 Fes pharmacies after cleanup: ${afterCount}`);
        console.log(`📉 Removed: ${beforeCount - afterCount}\n`);

        // Verify remaining pharmacies all have images
        const stillWithoutImages = await Pharmacy.countDocuments({
            city: 'Fes',
            $or: [
                { images: { $exists: false } },
                { images: null },
                { images: [] },
                { images: { $size: 0 } }
            ]
        });

        if (stillWithoutImages === 0) {
            console.log('✅ All remaining Fes pharmacies have images\n');
        } else {
            console.warn(`⚠️  Warning: ${stillWithoutImages} pharmacies still without images\n`);
        }

    } catch (error) {
        console.error('❌ Cleanup failed:', error);
        process.exit(1);
    } finally {
        await mongoose.connection.close();
        console.log('👋 Disconnected from MongoDB');
        process.exit(0);
    }
};

removePharmaciesWithoutImages();
