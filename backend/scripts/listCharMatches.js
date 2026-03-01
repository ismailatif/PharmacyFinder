import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Pharmacy from '../models/Pharmacy.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

// Levenshtein distance (for character edits)
function levenshteinDistance(a, b) {
    const matrix = [];

    // Increment along the first column of each row
    for (let i = 0; i <= b.length; i++) {
        matrix[i] = [i];
    }

    // Increment along the first row of each column
    for (let j = 0; j <= a.length; j++) {
        matrix[0][j] = j;
    }

    // Fill in the rest of the matrix
    for (let i = 1; i <= b.length; i++) {
        for (let j = 1; j <= a.length; j++) {
            if (b.charAt(i - 1) == a.charAt(j - 1)) {
                matrix[i][j] = matrix[i - 1][j - 1];
            } else {
                matrix[i][j] = Math.min(matrix[i - 1][j - 1] + 1, // substitution
                    Math.min(matrix[i][j - 1] + 1, // insertion
                        matrix[i - 1][j] + 1)); // deletion
            }
        }
    }
    return matrix[b.length][a.length];
}

// Normalize name (remove prefixes, spaces, lowercase)
function normalizeName(name) {
    let normalized = name.toLowerCase()
        .replace(/pharmacie\s+/g, '') // Remove 'pharmacie'
        .replace(/^[leds]{1,3}\s+/g, '') // Remove starting le, la, les, l'
        .replace(/^(al|el|at|es|en|ar|az)\s+/g, '') // Remove common Arabic prefixes
        .replace(/[^a-z0-9]/g, ''); // Remove non-alphanumeric

    return normalized;
}

const listCharacterMatches = async () => {
    try {
        console.log('🔍 Searching for pharmacies with minor character differences (1-2 chars)...\n');

        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/pharmacy-finder');
        console.log('✅ Connected to MongoDB\n');

        const dataPath = path.join(__dirname, '../data/fes_pharmacies_scraped.json');
        const scrapedPharmacies = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));

        const dbPharmacies = await Pharmacy.find({ city: 'Fès' });
        console.log(`🗄️  Loaded ${dbPharmacies.length} pharmacies from DB\n`);

        let matches = [];

        for (const scraped of scrapedPharmacies) {
            const normScraped = normalizeName(scraped.name);
            if (normScraped.length < 3) continue; // Skip very short names

            for (const dbP of dbPharmacies) {
                const normDb = normalizeName(dbP.name);
                if (normDb.length < 3) continue;

                // Skip exact normalized matches (already likely caught)
                if (normScraped === normDb) {
                    // Treat normalized match as valuable too (e.g. Al Qods vs El Qods -> qods vs qods)
                    matches.push({
                        type: 'Normalized Exact',
                        scrapedName: scraped.name,
                        dbName: dbP.name,
                        diff: 0,
                        scrapedPhone: scraped.phone,
                        dbPhone: dbP.phone
                    });
                    continue;
                }

                const dist = levenshteinDistance(normScraped, normDb);

                // Allow 1-2 character difference
                if (dist > 0 && dist <= 2) {
                    matches.push({
                        type: 'Fuzzy Char',
                        scrapedName: scraped.name,
                        dbName: dbP.name,
                        diff: dist,
                        scrapedPhone: scraped.phone,
                        dbPhone: dbP.phone
                    });
                }
            }
        }

        // Remove duplicates
        const uniqueMatches = Array.from(new Set(matches.map(m => JSON.stringify(m)))).map(s => JSON.parse(s));
        uniqueMatches.sort((a, b) => a.diff - b.diff);

        // Display results
        console.log(`📋 Found ${uniqueMatches.length} potential matches (ignoring Al, El, etc.):\n`);

        uniqueMatches.forEach(m => {
            console.log(`🔹 [${m.type}] Scraped: "${m.scrapedName}"`);
            console.log(`   DB:      "${m.dbName}"`);
            console.log(`   Diff:    ${m.diff} chars`);
            console.log(`   Phone:   ${m.scrapedPhone} vs ${m.dbPhone}`);
            console.log('   -----------------------------------');
        });

        // Save to JSON
        const outputPath = path.join(__dirname, '../data/char_similarity_report.json');
        fs.writeFileSync(outputPath, JSON.stringify(uniqueMatches, null, 2));
        console.log(`\n💾 Report saved to: ${outputPath}`);

    } catch (error) {
        console.error(error);
    } finally {
        await mongoose.connection.close();
        process.exit();
    }
};

listCharacterMatches();
