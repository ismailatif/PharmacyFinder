import React, { useState } from 'react';
// Lazy load Scanner
const Scanner = React.lazy(() => import('../components/Scanner'));
import MedicationDetails from '../components/MedicationDetails';
import { medicationApi } from '../utils/api';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

const ScannerPage = () => {
    const [scannedMedication, setScannedMedication] = useState(null);
    const [isScanning, setIsScanning] = useState(true);
    const [loading, setLoading] = useState(false);

    const [manualCode, setManualCode] = useState('');
    const [showManualInput, setShowManualInput] = useState(false);

    const handleScan = async (code) => {
        if (loading || scannedMedication) return;

        try {
            setLoading(true);
            setIsScanning(false);

            const { data } = await medicationApi.getMedication(code);
            setScannedMedication(data);
            toast.success('Medication found!');
        } catch (error) {
            console.error(error);
            const errorMessage = error.response?.status === 404
                ? 'Medication not found in database.'
                : 'Network error or invalid code.';
            toast.error(errorMessage);
            setIsScanning(true); // Auto-resume on error
        } finally {
            setLoading(false);
        }
    };

    const handleManualSubmit = (e) => {
        e.preventDefault();
        if (manualCode.length < 3) {
            toast.error('Please enter a valid code');
            return;
        }
        handleScan(manualCode);
    };

    const handleReset = () => {
        setScannedMedication(null);
        setIsScanning(true);
        setManualCode('');
        setShowManualInput(false);
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-6 px-4 sm:px-6 lg:px-8 transition-colors">
            <div className="max-w-2xl mx-auto space-y-6">

                <div className="text-center">
                    <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-500 mb-1">
                        Scan Medication
                    </h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        Scan EAN-13 barcode or enter code manually
                    </p>
                </div>

                <AnimatePresence mode="wait">
                    {isScanning ? (
                        <motion.div
                            key="scanner"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="space-y-4"
                        >
                            {!showManualInput ? (
                                <>
                                    <div className="relative rounded-3xl overflow-hidden shadow-2xl border-4 border-gray-100 dark:border-gray-800 min-h-[300px] flex items-center justify-center bg-black">
                                        <React.Suspense fallback={
                                            <div className="flex flex-col items-center justify-center text-white">
                                                <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mb-2"></div>
                                                <p>Initializing Camera...</p>
                                            </div>
                                        }>
                                            <Scanner onScan={handleScan} />
                                        </React.Suspense>
                                    </div>

                                    <div className="flex justify-center">
                                        <button
                                            onClick={() => setShowManualInput(true)}
                                            className="text-emerald-600 dark:text-emerald-400 text-sm font-medium hover:underline"
                                        >
                                            Switch to Manual Input
                                        </button>
                                    </div>
                                </>
                            ) : (
                                <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-8 border border-gray-100 dark:border-gray-700">
                                    <form onSubmit={handleManualSubmit} className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                Barcode Number
                                            </label>
                                            <input
                                                type="text"
                                                value={manualCode}
                                                onChange={(e) => setManualCode(e.target.value)}
                                                placeholder="e.g. 6118000040521"
                                                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all outline-none font-mono tracking-wider"
                                                autoFocus
                                            />
                                        </div>
                                        <div className="flex gap-3">
                                            <button
                                                type="button"
                                                onClick={() => setShowManualInput(false)}
                                                className="flex-1 px-4 py-3 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 font-semibold rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                type="submit"
                                                className="flex-1 px-4 py-3 bg-emerald-500 text-white font-bold rounded-xl shadow-lg hover:bg-emerald-600 hover:shadow-emerald-500/25 transition-all"
                                            >
                                                Search Code
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            )}

                            {loading && (
                                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
                                    <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-xl flex flex-col items-center gap-4">
                                        <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
                                        <p className="font-medium text-gray-700 dark:text-gray-200">Looking up medication...</p>
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    ) : (
                        <motion.div
                            key="details"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="space-y-6"
                        >
                            {scannedMedication && (
                                <MedicationDetails medication={scannedMedication} />
                            )}

                            <div className="flex justify-center">
                                <button
                                    onClick={handleReset}
                                    className="px-8 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold rounded-full shadow-lg hover:shadow-xl hover:shadow-emerald-500/20 transform hover:-translate-y-1 transition-all duration-200 flex items-center gap-2"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                                    </svg>
                                    Scan Another
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

            </div>
        </div>
    );
};

export default ScannerPage;
