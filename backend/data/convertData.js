import { pharmacies } from '../../src/data/pharmacies.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dataPath = path.join(__dirname, 'pharmacies.json');

fs.writeFileSync(dataPath, JSON.stringify(pharmacies, null, 2));

console.log(`✅ Converted ${pharmacies.length} pharmacies to JSON format`);
console.log(`📁 Saved to: ${dataPath}`);
