import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import PharmacyDetails from '../components/PharmacyDetails';
import PageWrapper from '../components/PageWrapper';
import { toast } from 'react-hot-toast';
import api from '../utils/api';

const PharmacyDetailsPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [pharmacy, setPharmacy] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchPharmacy = async () => {
            try {
                setLoading(true);
                const response = await api.get(`/pharmacies/${id}`);
                if (response.data.success) {
                    setPharmacy(response.data.data);
                } else {
                    setError('Pharmacy not found');
                    toast.error('Pharmacy not found');
                }
            } catch (err) {
                console.error('Error fetching pharmacy:', err);
                setError('Failed to load pharmacy details');
                toast.error('Failed to load pharmacy details');
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchPharmacy();
        }
    }, [id]);

    const handleBack = () => {
        navigate(-1); // Go back to previous page
    };

    if (loading) {
        return (
            <PageWrapper>
                <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
                    <div className="relative w-16 h-16">
                        <div className="absolute top-0 left-0 w-full h-full border-4 border-emerald-200 dark:border-emerald-900 rounded-full"></div>
                        <div className="absolute top-0 left-0 w-full h-full border-4 border-emerald-500 rounded-full border-t-transparent animate-spin"></div>
                    </div>
                </div>
            </PageWrapper>
        );
    }

    if (error || !pharmacy) {
        return (
            <PageWrapper>
                <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
                    <div className="text-center max-w-md mx-auto px-4">
                        <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-8 h-8 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Pharmacy Not Found</h3>
                        <p className="text-gray-600 dark:text-gray-400 mb-6">{error || 'The pharmacy you are looking for does not exist.'}</p>
                        <button
                            onClick={handleBack}
                            className="px-6 py-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors font-medium shadow-lg shadow-emerald-500/25"
                        >
                            Go Back
                        </button>
                    </div>
                </div>
            </PageWrapper>
        );
    }

    return (
        <PageWrapper>
            <PharmacyDetails pharmacy={pharmacy} onBack={handleBack} />
        </PageWrapper>
    );
};

export default PharmacyDetailsPage;
