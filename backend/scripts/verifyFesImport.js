import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import Pharmacy from '../models/Pharmacy.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

const verifyImport = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/pharmacy-finder');
        console.log('✅ Connected to MongoDB');

        const count = await Pharmacy.countDocuments({ city: 'Fes' });
        console.log(`\n📊 Total pharmacies in Fes: ${count}`);

        const sample = await Pharmacy.findOne({ city: 'Fes' });
        if (sample) {
            console.log('\n🔍 Sample Pharmacy:');
            console.log(`   Name: ${sample.name}`);
            console.log(`   Address: ${sample.address}`);
            console.log(`   Phone: ${sample.phone}`);
            console.log(`   Coordinates: [${sample.location.coordinates.join(', ')}]`);
        } else {
            console.log('\n❌ No pharmacies found in Fes!');
        }

        // Check for any with default coordinates (0,0) which might indicate failed parsing
        const invalidCoords = await Pharmacy.countDocuments({
            city: 'Fes',
            'location.coordinates': { $all: [0, 0] }
        });

        if (invalidCoords > 0) {
            console.warn(`\n⚠️  ${invalidCoords} pharmacies in Fes have invalid (0,0) coordinates.`);
        } else {
            console.log('\n✅ All Fes pharmacies have valid non-zero coordinates.');
        }

    } catch (error) {
        console.error('Verify failed:', error);
    } finally {
        await mongoose.connection.close();
        process.exit(0);
    }
};

verifyImport();
