import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Pharmacy from '../models/Pharmacy.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

// Function to check word difference
function getNameDifference(name1, name2) {
    // Normalize: lowercase, remove special chars, extra spaces
    const clean1 = name1.toLowerCase().replace(/[^a-z0-9\s]/g, '').trim().split(/\s+/);
    const clean2 = name2.toLowerCase().replace(/[^a-z0-9\s]/g, '').trim().split(/\s+/);

    const set1 = new Set(clean1);
    const set2 = new Set(clean2);

    let diffWords = [];

    // Words in name1 not in name2
    for (const word of clean1) {
        if (!set2.has(word)) diffWords.push(word);
    }

    // Words in name2 not in name1
    for (const word of clean2) {
        if (!set1.has(word)) diffWords.push(word);
    }

    return {
        count: diffWords.length,
        words: diffWords
    };
}

const listSimilarNames = async () => {
    try {
        console.log('🔍 Searching for pharmacies with similar names (1-2 word difference)...\n');

        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/pharmacy-finder');
        console.log('✅ Connected to MongoDB\n');

        const dataPath = path.join(__dirname, '../data/fes_pharmacies_scraped.json');
        const scrapedPharmacies = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));

        const dbPharmacies = await Pharmacy.find({ city: 'Fès' });
        console.log(`🗄️  Loaded ${dbPharmacies.length} pharmacies from DB\n`);

        let matches = [];

        for (const scraped of scrapedPharmacies) {

            for (const dbP of dbPharmacies) {
                // Skip exact matches
                if (scraped.name.toLowerCase() === dbP.name.toLowerCase()) continue;

                const diff = getNameDifference(scraped.name, dbP.name);

                // Match if difference is 1 or 2 words (and at least some similarity exists)
                // Also ensure they aren't completely different (e.g. share at least 1 word)
                const intersection = scraped.name.toLowerCase().split(/\s+/).filter(word =>
                    dbP.name.toLowerCase().includes(word) && word.length > 2
                );

                if (diff.count >= 1 && diff.count <= 2 && intersection.length > 0) {
                    matches.push({
                        scrapedName: scraped.name,
                        dbName: dbP.name,
                        diffCount: diff.count,
                        diffWords: diff.words.join(', '),
                        scrapedPhone: scraped.phone,
                        dbPhone: dbP.phone
                    });
                }
            }
        }

        // Remove duplicates and sort
        const uniqueMatches = Array.from(new Set(matches.map(m => JSON.stringify(m)))).map(s => JSON.parse(s));
        uniqueMatches.sort((a, b) => a.scrapedName.localeCompare(b.scrapedName));

        // Display results
        console.log(`📋 Found ${uniqueMatches.length} potential matches:\n`);

        uniqueMatches.forEach(m => {
            console.log(`🔹 Scraped: "${m.scrapedName}"`);
            console.log(`   DB:      "${m.dbName}"`);
            console.log(`   Diff:    ${m.diffCount} words (${m.diffWords})`);
            console.log(`   Phone:   ${m.scrapedPhone} (Scraped) vs ${m.dbPhone} (DB)`);
            console.log('   -----------------------------------');
        });

        // Save to JSON
        const outputPath = path.join(__dirname, '../data/similar_names_report.json');
        fs.writeFileSync(outputPath, JSON.stringify(uniqueMatches, null, 2));
        console.log(`\n💾 Report saved to: ${outputPath}`);

    } catch (error) {
        console.error(error);
    } finally {
        await mongoose.connection.close();
        process.exit();
    }
};

listSimilarNames();
