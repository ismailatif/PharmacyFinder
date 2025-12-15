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

const migrateData = async () => {
    try {
        console.log('🚀 Starting data migration...\n');

        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/pharmacy-finder');
        console.log('✅ Connected to MongoDB\n');

        // Read JSON data
        const dataPath = path.join(__dirname, '../data/pharmacies.json');
        const jsonData = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
        console.log(`📁 Loaded ${jsonData.length} pharmacies from JSON\n`);

        // Clear existing data (optional - be careful!)
        const existingCount = await Pharmacy.countDocuments();
        if (existingCount > 0) {
            console.log(`⚠️  Found ${existingCount} existing pharmacies in database`);
            console.log('🗑️  Clearing existing data...');
            await Pharmacy.deleteMany({});
            console.log('✅ Cleared existing data\n');
        }

        // Transform data for MongoDB
        console.log('🔄 Transforming data...');
        const pharmaciesData = jsonData.map((pharmacy) => ({
            ...pharmacy,
            // Transform coordinates to GeoJSON format
            location: {
                type: 'Point',
                coordinates: [pharmacy.coordinates.lng, pharmacy.coordinates.lat] // [longitude, latitude]
            },
            // Remove old coordinates field if you want
            // coordinates: undefined
        }));

        // Insert data in batches (better performance)
        const batchSize = 100;
        let inserted = 0;

        console.log(`📊 Inserting ${pharmaciesData.length} pharmacies in batches of ${batchSize}...\n`);

        for (let i = 0; i < pharmaciesData.length; i += batchSize) {
            const batch = pharmaciesData.slice(i, i + batchSize);
            await Pharmacy.insertMany(batch, { ordered: false });
            inserted += batch.length;

            const percentage = ((inserted / pharmaciesData.length) * 100).toFixed(1);
            console.log(`Progress: ${inserted}/${pharmaciesData.length} (${percentage}%)`);
        }

        console.log(`\n✅ Successfully migrated ${inserted} pharmacies!`);

        // Create indexes explicitly
        console.log(`\n🔧 Creating indexes...`);
        await Pharmacy.createIndexes();
        console.log(`✅ Indexes queued for creation`);

        // Verify data
        const totalInDB = await Pharmacy.countDocuments();
        console.log(`\n📊 Verification:`);
        console.log(`   - Total in database: ${totalInDB}`);
        console.log(`   - Expected: ${jsonData.length}`);
        console.log(`   - Match: ${totalInDB === jsonData.length ? '✅ YES' : '❌ NO'}`);

        // Test basic query
        console.log(`\n🔍 Testing database access...`);
        const sample = await Pharmacy.findOne();
        console.log(`   - Sample pharmacy: ${sample ? '✅ ' + sample.name : '❌ Failed'}`);

        console.log('\n🎉 Migration completed successfully!');
        console.log('\n💡 Note: Geospatial and text indexes will be built in the background');
        console.log('   They will be ready for queries shortly after this script completes\n');

    } catch (error) {
        console.error('\n❌ Migration failed:', error.message);
        process.exit(1);
    } finally {
        await mongoose.connection.close();
        console.log('👋 Disconnected from MongoDB');
        process.exit(0);
    }
};

// Run migration
migrateData();
