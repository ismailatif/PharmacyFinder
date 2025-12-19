import React, { useState, useMemo, useEffect } from 'react';
import toast from 'react-hot-toast';
import Header from '../components/Header';
import SearchAndFilter from '../components/SearchAndFilter';
import FilterSidebar from '../components/FilterSidebar';
import PharmacyList from '../components/PharmacyList';
// Lazy load PharmacyMap
const PharmacyMap = React.lazy(() => import('../components/PharmacyMap'));
import PharmacyListSkeleton from '../components/PharmacyListSkeleton';
import MapSkeleton from '../components/MapSkeleton';
import { Map as MapIcon, List, Navigation, Loader, MapPin } from 'lucide-react';
import { getPharmacies } from '../services/api';
import { useNavigate } from 'react-router-dom';

import PageWrapper from '../components/PageWrapper';

import Pagination from '../components/Pagination';

const ITEMS_PER_PAGE = 10;

const SearchPage = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState('all');
  const [selectedCity, setSelectedCity] = useState('all');
  const [isFilterSidebarOpen, setIsFilterSidebarOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [advancedFilters, setAdvancedFilters] = useState({
    status: 'all',
    priceRange: [],
    features: [],
    rating: 0,
    sortBy: 'rating'
  });
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'map'
  const [userLocation, setUserLocation] = useState(null);
  const [isLocating, setIsLocating] = useState(false);

  // API state
  const [pharmacies, setPharmacies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch pharmacies from API
  useEffect(() => {
    const fetchPharmacies = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await getPharmacies({ limit: 10000 }); // Get all pharmacies
        setPharmacies(response.data);
      } catch (err) {
        console.error('Error fetching pharmacies:', err);
        setError('Failed to load pharmacies. Please try again later.');
        toast.error('Failed to load pharmacies');
      } finally {
        setLoading(false);
      }
    };

    fetchPharmacies();
  }, []);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, filter, selectedCity, advancedFilters]);

  // Scroll to top when page changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentPage]);

  // Haversine formula to calculate distance in km
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Radius of the earth in km
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const d = R * c; // Distance in km
    return d;
  };

  const deg2rad = (deg) => {
    return deg * (Math.PI / 180);
  };

  const filteredPharmacies = useMemo(() => {
    let filtered = pharmacies;

    // Apply city filter
    if (selectedCity !== 'all') {
      filtered = filtered.filter((pharmacy) => pharmacy.city === selectedCity);
    }

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (pharmacy) =>
          pharmacy.name.toLowerCase().includes(query) ||
          pharmacy.nameAr.includes(query) ||
          pharmacy.address.toLowerCase().includes(query) ||
          pharmacy.addressAr.includes(query) ||
          pharmacy.services.some(service => service.toLowerCase().includes(query)) ||
          pharmacy.servicesAr.some(service => service.includes(query))
      );
    }

    // Apply quick status filter
    if (filter !== 'all') {
      switch (filter) {
        case 'open':
          filtered = filtered.filter((pharmacy) => pharmacy.isOpen);
          break;
        case 'onDuty':
          filtered = filtered.filter((pharmacy) => pharmacy.isOnDuty);
          break;
        case 'closed':
          filtered = filtered.filter((pharmacy) => !pharmacy.isOpen);
          break;
      }
    }

    // Apply advanced filters
    if (advancedFilters.status !== 'all') {
      switch (advancedFilters.status) {
        case 'open':
          filtered = filtered.filter((pharmacy) => pharmacy.isOpen);
          break;
        case 'onDuty':
          filtered = filtered.filter((pharmacy) => pharmacy.isOnDuty);
          break;
        case 'closed':
          filtered = filtered.filter((pharmacy) => !pharmacy.isOpen);
          break;
      }
    }

    // Apply price range filter
    if (advancedFilters.priceRange.length > 0) {
      filtered = filtered.filter((pharmacy) =>
        advancedFilters.priceRange.includes(pharmacy.priceRange)
      );
    }

    // Apply features filter
    if (advancedFilters.features.length > 0) {
      filtered = filtered.filter((pharmacy) =>
        advancedFilters.features.every(feature => {
          switch (feature) {
            case 'hasParking': return pharmacy.hasParking;
            case 'isAccessible': return pharmacy.isAccessible;
            case 'acceptsInsurance': return pharmacy.acceptsInsurance;
            case 'hasDelivery': return pharmacy.hasDelivery;
            default: return true;
          }
        })
      );
    }

    // Apply rating filter
    if (advancedFilters.rating > 0) {
      filtered = filtered.filter((pharmacy) => pharmacy.rating >= advancedFilters.rating);
    }

    // Calculate distances if user location is available
    if (userLocation) {
      filtered = filtered.map(pharmacy => {
        if (pharmacy.coordinates && pharmacy.coordinates.lat && pharmacy.coordinates.lng) {
          const distance = calculateDistance(
            userLocation.lat,
            userLocation.lng,
            pharmacy.coordinates.lat,
            pharmacy.coordinates.lng
          );
          return { ...pharmacy, distance };
        }
        return pharmacy;
      });
    }

    // Apply sorting
    switch (advancedFilters.sortBy) {
      case 'rating':
        filtered.sort((a, b) => b.rating - a.rating);
        break;
      case 'name':
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'distance':
        if (userLocation) {
          filtered.sort((a, b) => (a.distance || Infinity) - (b.distance || Infinity));
        }
        break;
    }

    return filtered;
  }, [searchQuery, filter, selectedCity, advancedFilters, userLocation, pharmacies]);

  const totalPages = Math.ceil(filteredPharmacies.length / ITEMS_PER_PAGE);
  const currentPharmacies = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredPharmacies.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredPharmacies, currentPage]);

  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (advancedFilters.status !== 'all') count++;
    if (advancedFilters.priceRange.length > 0) count++;
    if (advancedFilters.features.length > 0) count++;
    if (advancedFilters.rating > 0) count++;
    if (advancedFilters.sortBy !== 'rating') count++;
    return count;
  }, [advancedFilters]);

  const handleViewDetails = (pharmacy) => {
    navigate(`/pharmacy/${pharmacy.id}`);
  };

  const handleNearMe = () => {
    setIsLocating(true);
    const loadingToast = toast.loading('Locating you...');

    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
          setAdvancedFilters(prev => ({ ...prev, sortBy: 'distance' }));
          setIsLocating(false);
          toast.success(
            <div className="flex items-center gap-3">
              <div className="relative">
                <MapPin className="w-6 h-6 text-emerald-600 animate-bounce" />
                <div className="absolute inset-0 animate-ping">
                  <MapPin className="w-6 h-6 text-emerald-400 opacity-75" />
                </div>
              </div>
              <span className="font-medium">Location found!</span>
            </div>,
            { id: loadingToast }
          );
        },
        (error) => {
          console.error('Error getting location:', error);
          setIsLocating(false);
          toast.error('Could not get your location', { id: loadingToast });
        }
      );
    } else {
      setIsLocating(false);
      toast.error('Geolocation is not supported', { id: loadingToast });
    }
  };

  // Show error state
  if (error) {
    return (
      <PageWrapper>
        <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-emerald-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
          <Header />
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center max-w-md mx-auto px-4">
              <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Oops! Something went wrong</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="px-6 py-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors font-medium shadow-lg shadow-emerald-500/25"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-emerald-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-colors duration-300">
        <Header />

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <SearchAndFilter
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            filter={filter}
            onFilterChange={setFilter}
            selectedCity={selectedCity}
            onCityChange={setSelectedCity}
            onOpenFilters={() => setIsFilterSidebarOpen(true)}
            activeFiltersCount={activeFiltersCount}
          />

          {/* View Toggle & Near Me */}
          <div className="flex justify-between items-center mb-6">
            <button
              onClick={handleNearMe}
              disabled={isLocating}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${userLocation
                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-500/30'
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-emerald-100 dark:border-gray-700 hover:bg-emerald-50 dark:hover:bg-gray-700'
                }`}
            >
              <Navigation className={`w-4 h-4 ${isLocating ? 'animate-spin' : ''}`} />
              {isLocating ? 'Locating...' : userLocation ? 'Near Me Active' : 'Near Me'}
            </button>

            <div className="bg-white dark:bg-gray-800 p-1 rounded-xl shadow-sm border border-emerald-100 dark:border-gray-700 inline-flex">
              <button
                onClick={() => setViewMode('list')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${viewMode === 'list'
                  ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
              >
                <List className="w-4 h-4" />
                List
              </button>
              <button
                onClick={() => setViewMode('map')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${viewMode === 'map'
                  ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
              >
                <MapIcon className="w-4 h-4" />
                Map
              </button>
            </div>
          </div>

          {viewMode === 'list' ? (
            <>
              {loading ? (
                <PharmacyListSkeleton count={6} />
              ) : (
                <>
                  <PharmacyList
                    pharmacies={currentPharmacies}
                    onViewDetails={handleViewDetails}
                  />
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                  />
                </>
              )}
            </>
          ) : (
            <div className="h-[600px] w-full rounded-2xl overflow-hidden shadow-lg border border-emerald-100 dark:border-gray-700">
              {loading ? (
                <MapSkeleton />
              ) : (
                <React.Suspense fallback={<MapSkeleton />}>
                  <PharmacyMap
                    pharmacies={filteredPharmacies}
                    onViewDetails={handleViewDetails}
                    selectedLocation={userLocation ? { coordinates: userLocation } : null}
                  />
                </React.Suspense>
              )}
            </div>
          )}
        </main>

        <FilterSidebar
          isOpen={isFilterSidebarOpen}
          onClose={() => setIsFilterSidebarOpen(false)}
          filters={advancedFilters}
          onFiltersChange={setAdvancedFilters}
        />

        <footer className="bg-white dark:bg-gray-800 border-t border-emerald-200 dark:border-gray-700 mt-16 transition-colors duration-300">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="text-center">
              <div className="flex items-center justify-center mb-4">
                <img src="/logo.png" alt="Logo" className="w-12 h-12 mr-3 object-contain" />
                <span className="text-lg font-semibold text-emerald-800 dark:text-emerald-400">Pharmacies de Garde</span>
              </div>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                © 2025 Pharmacies de Garde. Informations mises à jour en temps réel.
              </p>
              <p className="text-gray-500 dark:text-gray-500 text-xs mt-2">
                Trouvez rapidement les pharmacies ouvertes près de chez vous
              </p>
            </div>
          </div>
        </footer>
      </div>
    </PageWrapper>
  );
};

export default SearchPage;
