import mongoose from 'mongoose';

const medicationSchema = new mongoose.Schema({
    code: {
        type: String,
        required: true,
        unique: true,
        index: true
    },
    name: {
        type: String,
        required: true
    },
    activeIngredient: String, // DCI1
    dosage: String,
    dosageUnit: String,
    form: String, // FORME
    presentation: String,
    ppv: Number, // Public Price
    hospitalPrice: Number, // PH
    reimbursementPrice: Number, // PRIX_BR
    type: {
        type: String,
        enum: ['P', 'G', 'Unknown'], // Princeps / Generique
        default: 'Unknown'
    },
    reimbursementRate: String
}, {
    timestamps: true
});

export default mongoose.model('Medication', medicationSchema);
