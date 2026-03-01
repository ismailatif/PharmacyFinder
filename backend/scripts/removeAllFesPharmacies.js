import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import Pharmacy from '../models/Pharmacy.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

const removeAllFesPharmacies = async () => {
    try {
        console.log('🗑️  Removing all Fes pharmacies from database...\n');

        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/pharmacy-finder');
        console.log('✅ Connected to MongoDB\n');

        const beforeCount = await Pharmacy.countDocuments({ city: 'Fes' });
        console.log(`📊 Fes pharmacies before removal: ${beforeCount}\n`);

        if (beforeCount > 0) {
            console.log('🗑️  Deleting all Fes pharmacies...');
            const result = await Pharmacy.deleteMany({ city: 'Fes' });
            console.log(`✅ Removed ${result.deletedCount} pharmacies\n`);
        } else {
            console.log('✅ No Fes pharmacies found to remove\n');
        }

        const afterCount = await Pharmacy.countDocuments({ city: 'Fes' });
        console.log(`📊 Fes pharmacies remaining: ${afterCount}\n`);

    } catch (error) {
        console.error('❌ Removal failed:', error);
        process.exit(1);
    } finally {
        await mongoose.connection.close();
        console.log('👋 Disconnected from MongoDB');
        process.exit(0);
    }
};

removeAllFesPharmacies();
