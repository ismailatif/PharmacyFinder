const mongoose = require('mongoose');
const XLSX = require('xlsx');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.join(__dirname, '../.env') });

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('MongoDB Connected for Seeding');
    } catch (err) {
        console.error('MongoDB Connection Error:', err);
        process.exit(1);
    }
};

const medicationSchema = new mongoose.Schema({
    code: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true },
    activeIngredient: String,
    dosage: String,
    dosageUnit: String,
    form: String,
    presentation: String,
    ppv: Number,
    hospitalPrice: Number,
    reimbursementPrice: Number,
    type: { type: String, enum: ['P', 'G', 'Unknown'], default: 'Unknown' },
    reimbursementRate: String
}, { timestamps: true });

const Medication = mongoose.model('Medication', medicationSchema);

const seedMedications = async () => {
    await connectDB();

    const filePath = path.join(__dirname, '../../ref-des-medicaments-cnops-2014 (1).xlsx');

    console.log(`Reading file: ${filePath}`);
    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];

    const data = XLSX.utils.sheet_to_json(worksheet, {
        raw: false // Parse numbers as strings initially to avoid issues, or true for raw values
    });

    console.log(`Found ${data.length} records. Processing...`);

    let count = 0;
    const batchSize = 100;
    let batch = [];

    // Clear existing? Maybe not, upsert is safer.
    // await Medication.deleteMany({}); 

    for (const row of data) {
        if (!row.CODE) continue;

        const med = {
            code: row.CODE.toString(),
            name: row.NOM || 'Unknown',
            activeIngredient: row.DCI1 || '',
            dosage: row.DOSAGE1 || '',
            dosageUnit: row.UNITE_DOSAGE1 || '',
            form: row.FORME || '',
            presentation: row.PRESENTATION || '',
            ppv: parseFloat(row.PPV) || 0,
            hospitalPrice: parseFloat(row.PH) || 0,
            reimbursementPrice: parseFloat(row.PRIX_BR) || 0,
            type: ['P', 'G'].includes(row.PRINCEPS_GENERIQUE) ? row.PRINCEPS_GENERIQUE : 'Unknown',
            reimbursementRate: row.TAUX_REMBOURSEMENT || ''
        };

        batch.push({
            updateOne: {
                filter: { code: med.code },
                update: { $set: med },
                upsert: true
            }
        });

        if (batch.length >= batchSize) {
            await Medication.bulkWrite(batch);
            count += batch.length;
            process.stdout.write(`\rProcessed ${count} medications...`);
            batch = [];
        }
    }

    if (batch.length > 0) {
        await Medication.bulkWrite(batch);
        count += batch.length;
    }

    console.log(`\n\nSeeding complete! Total processed: ${count}`);
    mongoose.connection.close();
};

seedMedications();
