import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import Pharmacy from '../models/Pharmacy.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

const revertSpecific = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/pharmacy-finder');
        console.log('✅ Connected to MongoDB');

        // Target: Pharmacie Lalla Soukaina
        // We want to revert it back to empty string (or whatever it was before the first update)
        // Based on the log:
        // 1. "Pharmacie El Hijazi" -> "Pharmacie Lalla Soukaina" (Old: "", New: "0535 72 97 64")
        // 2. "Pharmacie Zouagha" -> "Pharmacie Lalla Soukaina" (Old: "0535 72 97 64", New: "0535 60 14 75")

        // This means the original phone was likely "" (empty string) before any of these updates.
        // The user request shows "oldPhone": "" in the first entry.

        const pharmacyName = "Pharmacie Lalla Soukaina";
        const originalPhone = ""; // Reverting to empty string based on the first log entry

        const pharmacy = await Pharmacy.findOne({ name: pharmacyName, city: 'Fès' });

        if (pharmacy) {
            console.log(`\n🔍 Found: ${pharmacy.name}`);
            console.log(`   Current Phone: ${pharmacy.phone}`);

            pharmacy.phone = originalPhone;
            await pharmacy.save();

            console.log(`✅ Reverted to: "${originalPhone}" (empty string)`);
        } else {
            console.log(`❌ Pharmacy "${pharmacyName}" not found`);
        }

    } catch (error) {
        console.error(error);
    } finally {
        await mongoose.connection.close();
        process.exit();
    }
};

revertSpecific();
