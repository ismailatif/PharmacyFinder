import React, { useState } from 'react';
// Lazy load Scanner
const Scanner = React.lazy(() => import('../components/Scanner'));
import MedicationDetails from '../components/MedicationDetails';
import { medicationApi } from '../utils/api';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import Pagination from '../components/Pagination';
import { useLanguage } from '../context/LanguageContext';

const ScannerPage = () => {
    const { t } = useLanguage();
    const [activeTab, setActiveTab] = useState('scan'); // 'scan' or 'search'
    const [scannedMedication, setScannedMedication] = useState(null);
    const [isScanning, setIsScanning] = useState(true);
    const [loading, setLoading] = useState(false);

    // Manual Scan State
    const [manualCode, setManualCode] = useState('');
    const [showManualInput, setShowManualInput] = useState(false);

    // Search Mode State
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [searchLoading, setSearchLoading] = useState(false);
    const [searchFilters, setSearchFilters] = useState({
        type: 'all', // all, princeps, generic
        form: 'all'  // all, tablet, syrup...
    });
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const ITEMS_PER_PAGE = 10;

    // Derived state for unique forms from results
    const availableForms = React.useMemo(() => {
        const forms = new Set(searchResults.map(m => m.form).filter(Boolean));
        return Array.from(forms).sort();
    }, [searchResults]);

    // Cleanup when component unmounts or tab changes
    React.useEffect(() => {
        return () => {
            setIsScanning(false);
        };
    }, []);

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
        setManualCode('');
        if (activeTab === 'scan') {
            setIsScanning(true);
            setShowManualInput(false);
        } else {
            setIsScanning(false);
        }
    };

    // Debounced Search
    React.useEffect(() => {
        const delayDebounceFn = setTimeout(async () => {
            if (searchQuery.trim().length < 2) {
                setSearchResults([]);
                return;
            }

            try {
                setSearchLoading(true);
                const { data } = await medicationApi.search(searchQuery, currentPage, ITEMS_PER_PAGE);
                // Handle new paginated response structure
                if (data.pagination) {
                    setSearchResults(data.data);
                    setTotalPages(data.pagination.pages);
                } else {
                    // Fallback for old API just in case
                    setSearchResults(data);
                    setTotalPages(1);
                }
            } catch (error) {
                console.error("Search error", error);
                toast.error("Failed to search medications");
            } finally {
                setSearchLoading(false);
            }
        }, 500);

        return () => clearTimeout(delayDebounceFn);
    }, [searchQuery, currentPage]);

    // Reset pagination when query changes
    React.useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery]);

    const filteredResults = React.useMemo(() => {
        return searchResults.filter(med => {
            const matchesType = searchFilters.type === 'all'
                ? true
                : searchFilters.type === 'generic'
                    ? med.type === 'G'
                    : med.type === 'P';

            const matchesForm = searchFilters.form === 'all'
                ? true
                : med.form === searchFilters.form;

            return matchesType && matchesForm;
        });
    }, [searchResults, searchFilters]);

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950 py-8 px-4 sm:px-6 lg:px-8 transition-colors font-sans">
            <div className="max-w-4xl mx-auto space-y-8">

                {/* Header Section */}
                <div className="text-center space-y-3">
                    <h1 className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 via-teal-500 to-cyan-500 tracking-tight pb-1">
                        Medication Lookup
                    </h1>
                    <p className="text-base text-gray-500 dark:text-gray-400 max-w-xl mx-auto">
                        Instantly access medication details, pricing, and availability by scanning a barcode or searching by name.
                    </p>
                </div>

                {/* Main Content Area */}
                <div className="bg-white/80 dark:bg-gray-900/60 backdrop-blur-xl rounded-[2.5rem] shadow-2xl overflow-hidden border border-white/20 dark:border-gray-800">

                    {/* Tabs / Mode Switcher */}
                    {!scannedMedication && (
                        <div className="flex justify-center pt-8 pb-2">
                            <div className="bg-gray-100/50 dark:bg-gray-800/80 p-1.5 rounded-2xl inline-flex relative shadow-inner">
                                <button
                                    onClick={() => { setActiveTab('scan'); setIsScanning(true); }}
                                    className={`relative z-10 px-8 py-3 rounded-xl text-sm font-bold transition-all duration-300 flex items-center gap-2.5 ${activeTab === 'scan'
                                        ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/25 scale-105'
                                        : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                                        }`}
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" /></svg>
                                    {t.scanBarcode}
                                </button>
                                <button
                                    onClick={() => { setActiveTab('search'); setIsScanning(false); }}
                                    className={`relative z-10 px-8 py-3 rounded-xl text-sm font-bold transition-all duration-300 flex items-center gap-2.5 ${activeTab === 'search'
                                        ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/25 scale-105'
                                        : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                                        }`}
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                                    {t.searchName}
                                </button>
                            </div>
                        </div>
                    )}

                    <div className="p-6 md:p-8">
                        <AnimatePresence mode="wait">
                            {scannedMedication ? (
                                <motion.div
                                    key="details"
                                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                                    className="space-y-8"
                                >
                                    <div className="bg-gray-50 dark:bg-gray-800/50 rounded-3xl p-6 border border-gray-100 dark:border-gray-700">
                                        <MedicationDetails medication={scannedMedication} />
                                    </div>

                                    <div className="flex justify-center">
                                        <button
                                            onClick={handleReset}
                                            className="group px-8 py-3.5 bg-gray-900 dark:bg-white text-white dark:text-black font-bold rounded-full shadow-2xl hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-300 flex items-center gap-3"
                                        >
                                            <span className="bg-gray-800 dark:bg-gray-100 rounded-full p-1 group-hover:rotate-180 transition-transform duration-500">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                                            </span>
                                            {activeTab === 'scan' ? t.scanAnother : t.startNewSearch}
                                        </button>
                                    </div>
                                </motion.div>
                            ) : (
                                <motion.div
                                    key={activeTab}
                                    initial={{ opacity: 0, x: activeTab === 'scan' ? -20 : 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: activeTab === 'scan' ? -20 : 20 }}
                                    transition={{ duration: 0.2 }}
                                    className="w-full"
                                >
                                    {activeTab === 'scan' ? (
                                        // SCANNER MODE
                                        <div className="space-y-6 max-w-lg mx-auto">
                                            {!showManualInput ? (
                                                <>
                                                    <div className="relative rounded-[2rem] overflow-hidden shadow-2xl border-8 border-white dark:border-gray-800 bg-black aspect-square flex items-center justify-center group">
                                                        <React.Suspense fallback={
                                                            <div className="flex flex-col items-center justify-center text-white/50">
                                                                <div className="w-12 h-12 border-4 border-emerald-500/50 border-t-emerald-500 rounded-full animate-spin mb-4"></div>
                                                                <p className="font-medium tracking-wide text-sm uppercase">{t.loadingCamera}</p>
                                                            </div>
                                                        }>
                                                            <Scanner onScan={handleScan} />
                                                        </React.Suspense>
                                                    </div>

                                                    <div className="text-center">
                                                        <button
                                                            onClick={() => setShowManualInput(true)}
                                                            className="text-gray-500 dark:text-gray-400 text-sm font-semibold hover:text-emerald-500 dark:hover:text-emerald-400 transition-colors flex items-center justify-center gap-2 mx-auto py-2 hover:bg-gray-100 dark:hover:bg-gray-800 px-4 rounded-full"
                                                        >
                                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" /></svg>
                                                            {t.enterBarcode}
                                                        </button>
                                                    </div>
                                                </>
                                            ) : (
                                                /* Manual Entry Form */
                                                <div className="bg-gray-50 dark:bg-gray-800/80 rounded-[2rem] p-8 border border-gray-100 dark:border-gray-700">
                                                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6 text-center">{t.manualEntry}</h3>
                                                    <form onSubmit={handleManualSubmit} className="space-y-4">
                                                        <div className="relative">
                                                            <input
                                                                type="text"
                                                                value={manualCode}
                                                                onChange={(e) => setManualCode(e.target.value)}
                                                                placeholder="e.g. 6118000040521"
                                                                className="w-full pl-5 pr-5 py-4 rounded-2xl border-2 border-transparent bg-white dark:bg-gray-700/50 text-gray-900 dark:text-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all outline-none font-mono tracking-wider text-xl text-center shadow-lg shadow-gray-200/50 dark:shadow-none"
                                                                autoFocus
                                                            />
                                                        </div>
                                                        <div className="flex gap-3 pt-2">
                                                            <button
                                                                type="button"
                                                                onClick={() => setShowManualInput(false)}
                                                                className="flex-1 px-6 py-3.5 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 font-bold rounded-xl hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                                                            >
                                                                {t.cancel}
                                                            </button>
                                                            <button
                                                                type="submit"
                                                                className="flex-1 px-6 py-3.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold rounded-xl shadow-lg hover:shadow-emerald-500/30 transform hover:-translate-y-0.5 transition-all"
                                                            >
                                                                {t.lookupCode}
                                                            </button>
                                                        </div>
                                                    </form>
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        // SEARCH MODE
                                        <div className="space-y-6">
                                            {/* Search Bar & Filters Container */}
                                            <div className="bg-white dark:bg-gray-800 p-3 rounded-[1.5rem] shadow-xl border border-gray-100 dark:border-gray-700 flex flex-col md:flex-row gap-2">
                                                <div className="relative flex-grow group">
                                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                                        <svg className="h-5 w-5 text-gray-400 group-focus-within:text-emerald-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                                                    </div>
                                                    <input
                                                        type="text"
                                                        className="block w-full pl-12 pr-10 py-3.5 rounded-xl border-none bg-gray-50 dark:bg-gray-700/50 text-gray-900 dark:text-white placeholder-gray-400 focus:bg-white dark:focus:bg-gray-700 focus:ring-2 focus:ring-emerald-500/20 transition-all font-medium text-lg"
                                                        placeholder={t.searchMedication}
                                                        value={searchQuery}
                                                        onChange={(e) => setSearchQuery(e.target.value)}
                                                    />
                                                    {searchQuery && (
                                                        <button
                                                            onClick={() => { setSearchQuery(''); setSearchResults([]); }}
                                                            className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-red-500 transition-colors"
                                                        >
                                                            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                                                        </button>
                                                    )}
                                                </div>

                                                {/* Filters - Inline with search on desktop, stacked on mobile */}
                                                <div className="flex gap-2">
                                                    <div className="relative">
                                                        <select
                                                            value={searchFilters.type}
                                                            onChange={(e) => setSearchFilters(prev => ({ ...prev, type: e.target.value }))}
                                                            className="w-full h-full pl-4 pr-10 py-3.5 rounded-xl appearance-none bg-gray-50 dark:bg-gray-700/50 text-sm font-semibold border-none focus:ring-2 focus:ring-emerald-500/20 text-gray-700 dark:text-gray-200 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                                                        >
                                                            <option value="all">{t.allTypes}</option>
                                                            <option value="princeps">{t.princeps}</option>
                                                            <option value="generic">{t.generic}</option>
                                                        </select>
                                                        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-gray-400">
                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                                                        </div>
                                                    </div>

                                                    <div className="relative min-w-[140px]">
                                                        <select
                                                            value={searchFilters.form}
                                                            onChange={(e) => setSearchFilters(prev => ({ ...prev, form: e.target.value }))}
                                                            className="w-full h-full pl-4 pr-10 py-3.5 rounded-xl appearance-none bg-gray-50 dark:bg-gray-700/50 text-sm font-semibold border-none focus:ring-2 focus:ring-emerald-500/20 text-gray-700 dark:text-gray-200 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors truncate"
                                                        >
                                                            <option value="all">{t.allForms}</option>
                                                            {availableForms.map(form => (
                                                                <option key={form} value={form}>{form}</option>
                                                            ))}
                                                        </select>
                                                        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-gray-400">
                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Results List */}
                                            {/* Results List */}
                                            <div className="space-y-4 max-h-[calc(100vh-380px)] overflow-y-auto pr-2 custom-scrollbar p-1">
                                                {searchLoading ? (
                                                    <div className="flex flex-col items-center justify-center py-20 gap-4">
                                                        <div className="w-10 h-10 border-4 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin"></div>
                                                        <span className="text-gray-500 dark:text-gray-400 font-medium animate-pulse">Searching global database...</span>
                                                    </div>
                                                ) : searchQuery.length > 2 && filteredResults.length === 0 ? (
                                                    <div className="flex flex-col items-center justify-center py-20 text-center px-4">
                                                        <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-full mb-4">
                                                            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                                        </div>
                                                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">{t.noMatches}</h3>
                                                        <p className="text-gray-500 dark:text-gray-400 max-w-xs">
                                                            {t.noMatchesDesc} "{searchQuery}".
                                                        </p>
                                                    </div>
                                                ) : (
                                                    filteredResults.map((med) => (
                                                        <motion.button
                                                            key={med.code}
                                                            layoutId={`card-${med.code}`}
                                                            initial={{ opacity: 0, y: 10 }}
                                                            animate={{ opacity: 1, y: 0 }}
                                                            whileHover={{ scale: 1.01, translateY: -2 }}
                                                            whileTap={{ scale: 0.99 }}
                                                            className="w-full text-left bg-white dark:bg-gray-800 p-5 rounded-[1.25rem] shadow-sm border border-gray-100 dark:border-gray-700 group hover:shadow-xl hover:shadow-emerald-500/5 hover:border-emerald-500/30 dark:hover:border-emerald-500/30 transition-all duration-300 relative overflow-hidden"
                                                            onClick={() => setScannedMedication(med)}
                                                        >
                                                            {/* Decoratiive colored bar on left */}
                                                            <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${med.type === 'G' ? 'bg-blue-500' : 'bg-purple-500'} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></div>

                                                            <div className="flex justify-between items-start gap-4">
                                                                <div className="flex-grow">
                                                                    <div className="flex flex-wrap items-center gap-2 mb-1.5">
                                                                        <h4 className="font-extrabold text-gray-900 dark:text-white text-lg tracking-tight group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                                                                            {med.name}
                                                                        </h4>
                                                                        <span className={`text-[10px] px-2.5 py-1 rounded-md font-bold uppercase tracking-wider border ${med.type === 'G'
                                                                            ? 'bg-blue-50 text-blue-700 border-blue-100 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800'
                                                                            : 'bg-purple-50 text-purple-700 border-purple-100 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-800'
                                                                            }`}>
                                                                            {med.type === 'G' ? t.generic : t.princeps}
                                                                        </span>
                                                                    </div>
                                                                    <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 font-medium">
                                                                        <span className="bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded text-gray-600 dark:text-gray-300">
                                                                            {med.form}
                                                                        </span>
                                                                        <span className="text-gray-300 dark:text-gray-600">•</span>
                                                                        <span>{med.dosage}</span>
                                                                    </div>
                                                                </div>

                                                                <div className="flex flex-col items-end min-w-[90px]">
                                                                    <div className="font-black text-2xl text-emerald-600 dark:text-emerald-400 flex items-baseline gap-1">
                                                                        {med.ppv} <span className="text-xs font-bold text-emerald-600/60 dark:text-emerald-400/60">MAD</span>
                                                                    </div>
                                                                    {med.reimbursementRate && (
                                                                        <div className="mt-1 text-[10px] bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 px-2 py-1 rounded-lg border border-emerald-100 dark:border-emerald-800 font-bold whitespace-nowrap">
                                                                            {med.reimbursementRate} Refund
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </motion.button>
                                                    ))
                                                )}

                                                {!searchQuery && (
                                                    <div className="flex flex-col items-center justify-center py-24 text-center opacity-40">
                                                        <svg className="w-20 h-20 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                                                        <p className="text-lg font-medium text-gray-500">{t.searchMedication}</p>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Pagination - Outside scrollable area */}
                                            {searchResults.length > 0 && totalPages > 1 && (
                                                <div className="pt-4 border-t border-gray-100 dark:border-gray-800 mt-2">
                                                    <Pagination
                                                        currentPage={currentPage}
                                                        totalPages={totalPages}
                                                        onPageChange={setCurrentPage}
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>

                {/* Global Loading Overlay */}
                {
                    loading && (
                        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center">
                            <div className="bg-white dark:bg-gray-900 p-8 rounded-3xl shadow-2xl flex flex-col items-center gap-6 border border-gray-100 dark:border-gray-800">
                                <div className="relative">
                                    <div className="w-16 h-16 border-4 border-gray-200 dark:border-gray-700 rounded-full"></div>
                                    <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin absolute inset-0"></div>
                                </div>
                                <p className="font-bold text-lg text-gray-800 dark:text-white">{t.fetchingDetails}</p>
                            </div>
                        </div>
                    )
                }

            </div>
        </div >
    );
};

export default ScannerPage;
