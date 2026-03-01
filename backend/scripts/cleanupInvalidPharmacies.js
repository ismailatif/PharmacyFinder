import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import Pharmacy from '../models/Pharmacy.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

const cleanupInvalidPharmacies = async () => {
    try {
        console.log('🧹 Starting cleanup of invalid pharmacy entries...\n');

        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/pharmacy-finder');
        console.log('✅ Connected to MongoDB\n');

        const beforeCount = await Pharmacy.countDocuments({ city: 'Fes' });
        console.log(`📊 Fes pharmacies before cleanup: ${beforeCount}\n`);

        // Find and remove pharmacies with missing required fields
        const invalidCriteria = {
            city: 'Fes',
            $or: [
                { phone: { $in: ['', null] } },  // No phone
                { address: { $in: ['', 'Fes', null] } },  // No address or just "Fes"
                { 'location.coordinates': { $in: [null, []] } },  // No coordinates
                { 'location.coordinates.0': 0, 'location.coordinates.1': 0 }  // Invalid (0,0) coordinates
            ]
        };

        // Get the list first to show what will be removed
        const toRemove = await Pharmacy.find(invalidCriteria).select('name phone address location');

        console.log(`❌ Found ${toRemove.length} invalid pharmacies to remove:\n`);

        toRemove.forEach(pharmacy => {
            const reasons = [];
            if (!pharmacy.phone || pharmacy.phone === '') reasons.push('no phone');
            if (!pharmacy.address || pharmacy.address === '' || pharmacy.address === 'Fes') reasons.push('no address');
            if (!pharmacy.location || !pharmacy.location.coordinates || pharmacy.location.coordinates.length === 0) {
                reasons.push('no coordinates');
            } else if (pharmacy.location.coordinates[0] === 0 && pharmacy.location.coordinates[1] === 0) {
                reasons.push('invalid coordinates (0,0)');
            }

            console.log(`   - ${pharmacy.name} (${reasons.join(', ')})`);
        });

        if (toRemove.length > 0) {
            console.log('\n🗑️  Removing invalid entries...');
            const result = await Pharmacy.deleteMany(invalidCriteria);
            console.log(`✅ Removed ${result.deletedCount} pharmacies\n`);
        } else {
            console.log('\n✅ No invalid pharmacies found!\n');
        }

        const afterCount = await Pharmacy.countDocuments({ city: 'Fes' });
        console.log(`📊 Fes pharmacies after cleanup: ${afterCount}`);
        console.log(`📉 Removed: ${beforeCount - afterCount}\n`);

        // Verify remaining pharmacies all have valid data
        const stillInvalid = await Pharmacy.countDocuments({
            city: 'Fes',
            $or: [
                { phone: { $in: ['', null] } },
                { address: { $in: ['', 'Fes', null] } },
                { 'location.coordinates': { $in: [null, []] } },
                { 'location.coordinates.0': 0, 'location.coordinates.1': 0 }
            ]
        });

        if (stillInvalid === 0) {
            console.log('✅ All remaining Fes pharmacies have valid data (phone, address, coordinates)\n');
        } else {
            console.warn(`⚠️  Warning: ${stillInvalid} pharmacies still have invalid data\n`);
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

cleanupInvalidPharmacies();
