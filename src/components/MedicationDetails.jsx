import React, { useState } from 'react';
import { motion } from 'framer-motion';

const MedicationDetails = ({ medication }) => {
    const [isFlipped, setIsFlipped] = useState(false);

    if (!medication) return null;

    return (
        <div className="w-full max-w-md mx-auto perspective-1000">
            <div
                className="relative w-full h-[500px] cursor-pointer group"
                onClick={() => setIsFlipped(!isFlipped)}
            >
                <motion.div
                    className="w-full h-full relative preserve-3d transition-all duration-500"
                    initial={false}
                    animate={{ rotateY: isFlipped ? 180 : 0 }}
                    transition={{ duration: 0.6, type: "spring", stiffness: 260, damping: 20 }}
                    style={{ transformStyle: 'preserve-3d' }}
                >
                    {/* FRONT */}
                    <div className="absolute inset-0 backface-hidden w-full h-full bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-6 flex flex-col justify-between overflow-hidden border border-gray-100 dark:border-gray-700">
                        <div className="absolute top-0 right-0 p-4 opacity-50">
                            <span className="text-6xl font-bold text-emerald-100 dark:text-emerald-900/30">RX</span>
                        </div>

                        <div className="z-10 mt-8">
                            <div className="inline-block px-3 py-1 mb-4 text-xs font-semibold text-emerald-600 bg-emerald-100 rounded-full dark:text-emerald-300 dark:bg-emerald-900/50">
                                {medication.type === 'P' ? 'Princeps' : medication.type === 'G' ? 'Générique' : 'Medication'}
                            </div>
                            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 leading-tight">
                                {medication.name}
                            </h2>
                            <p className="text-lg text-emerald-600 dark:text-emerald-400 font-medium">
                                {medication.activeIngredient}
                            </p>
                        </div>

                        <div className="z-10 space-y-4">
                            <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-xl">
                                <p className="text-sm text-gray-500 dark:text-gray-400 uppercase tracking-wider font-semibold mb-1">Form & Dosage</p>
                                <p className="text-lg font-medium text-gray-800 dark:text-gray-200">
                                    {medication.form}
                                </p>
                                <p className="text-base text-gray-600 dark:text-gray-300">
                                    {medication.dosage} {medication.dosageUnit}
                                </p>
                            </div>

                            <div className="flex items-center justify-center pt-4">
                                <span className="text-sm text-gray-400 animate-pulse">Tap to see price & details</span>
                            </div>
                        </div>
                    </div>

                    {/* BACK */}
                    <div
                        className="absolute inset-0 backface-hidden w-full h-full bg-gradient-to-br from-emerald-600 to-teal-700 text-white rounded-2xl shadow-2xl p-6 flex flex-col justify-between overflow-hidden"
                        style={{ transform: "rotateY(180deg)" }}
                    >
                        <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
                        <div className="absolute top-10 -left-10 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>

                        <div className="z-10 mt-8">
                            <h3 className="text-xl font-bold mb-6 opacity-90 border-b border-white/20 pb-2">Pricing Details</h3>

                            <div className="space-y-6">
                                <div className="flex justify-between items-center">
                                    <span className="text-emerald-100 font-medium">Public Price (PPV)</span>
                                    <span className="text-3xl font-bold">{medication.ppv ? medication.ppv.toFixed(2) : 'N/A'} <span className="text-lg font-normal">MAD</span></span>
                                </div>

                                <div className="flex justify-between items-center">
                                    <span className="text-emerald-100 font-medium">Hospital Price</span>
                                    <span className="text-xl font-semibold">{medication.hospitalPrice ? medication.hospitalPrice.toFixed(2) : 'N/A'} MAD</span>
                                </div>

                                <div className="flex justify-between items-center">
                                    <span className="text-emerald-100 font-medium">Reimbursement Base</span>
                                    <span className="text-xl font-semibold">{medication.reimbursementPrice ? medication.reimbursementPrice.toFixed(2) : 'N/A'} MAD</span>
                                </div>
                            </div>
                        </div>

                        <div className="z-10">
                            <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-emerald-100 text-sm">Reimbursement Rate</span>
                                    <span className="font-bold text-xl">{medication.reimbursementRate || 'N/A'}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-emerald-100 text-sm">Barcode</span>
                                    <span className="font-mono text-sm opacity-80">{medication.code}</span>
                                </div>
                            </div>

                            <div className="flex items-center justify-center pt-6">
                                <span className="text-sm text-emerald-200 animate-pulse">Tap to view info</span>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default MedicationDetails;
