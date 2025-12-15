import React, { useState } from 'react';
import { Search, SlidersHorizontal, MapPin, ChevronDown, X, Shield, Clock, CheckCircle } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

const SearchAndFilter = ({
  searchQuery,
  onSearchChange,
  filter,
  onFilterChange,
  onOpenFilters,
  activeFiltersCount,
  selectedCity,
  onCityChange
}) => {
  const { t, isRTL } = useLanguage();
  const [isCityDropdownOpen, setIsCityDropdownOpen] = useState(false);

  const quickFilters = [
    { key: 'all', label: t.filterAll, icon: null },
    { key: 'onDuty', label: t.filterOnDuty, icon: Shield },
    { key: 'open', label: t.filterOpen, icon: Clock }
  ];

  const cities = [
    { key: 'all', label: isRTL ? 'جميع المدن' : 'All Cities', labelFr: 'Toutes les villes' },
    { key: 'Casablanca', label: isRTL ? 'الدار البيضاء' : 'Casablanca', labelFr: 'Casablanca' },
    { key: 'Marrakech', label: isRTL ? 'مراكش' : 'Marrakech', labelFr: 'Marrakech' },
    { key: 'Fès', label: isRTL ? 'فاس' : 'Fes', labelFr: 'Fès' },
    { key: 'Rabat', label: isRTL ? 'الرباط' : 'Rabat', labelFr: 'Rabat' },
    { key: 'Tanger', label: isRTL ? 'طنجة' : 'Tangier', labelFr: 'Tanger' },
    { key: 'Agadir', label: isRTL ? 'أكادير' : 'Agadir', labelFr: 'Agadir' }
  ];

  const selectedCityLabel = cities.find(c => c.key === selectedCity)?.label || cities[0].label;

  const [localSearchQuery, setLocalSearchQuery] = useState(searchQuery);

  // Debounce search input
  React.useEffect(() => {
    const timer = setTimeout(() => {
      onSearchChange(localSearchQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [localSearchQuery, onSearchChange]);

  // Update local state when prop changes externally (e.g. clear button)
  React.useEffect(() => {
    setLocalSearchQuery(searchQuery);
  }, [searchQuery]);

  return (
    <div className={`relative z-30 mb-8 ${isRTL ? 'rtl' : 'ltr'}`}>
      {/* Main Search Container */}
      <div className="bg-white dark:bg-gray-800 p-2 rounded-3xl shadow-xl shadow-emerald-500/10 border border-gray-100 dark:border-gray-700">
        <div className="flex flex-col md:flex-row gap-2">

          {/* City Selector */}
          <div className="relative min-w-[220px]">
            <button
              onClick={() => setIsCityDropdownOpen(!isCityDropdownOpen)}
              className={`w-full h-14 px-6 flex items-center gap-3 rounded-2xl transition-all duration-300 group ${isCityDropdownOpen
                  ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400'
                  : 'hover:bg-gray-50 dark:hover:bg-gray-700/50 text-gray-700 dark:text-gray-200'
                }`}
            >
              <div className={`p-2 rounded-xl transition-colors ${isCityDropdownOpen ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400' : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 group-hover:text-emerald-500 dark:group-hover:text-emerald-400'
                }`}>
                <MapPin className="h-5 w-5" />
              </div>
              <div className="flex-1 text-left">
                <p className="text-xs text-gray-400 dark:text-gray-500 font-medium mb-0.5">{isRTL ? 'المدينة' : 'City'}</p>
                <p className="font-semibold truncate">{selectedCityLabel}</p>
              </div>
              <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform duration-300 ${isCityDropdownOpen ? 'rotate-180 text-emerald-500' : ''}`} />
            </button>

            {/* Dropdown Menu */}
            {isCityDropdownOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setIsCityDropdownOpen(false)} />
                <div className="absolute top-full mt-4 w-[280px] bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl shadow-2xl shadow-emerald-500/20 z-20 overflow-hidden animate-in fade-in zoom-in-95 duration-200 p-2">
                  <div className="max-h-[320px] overflow-y-auto custom-scrollbar">
                    {cities.map((city) => (
                      <button
                        key={city.key}
                        onClick={() => {
                          onCityChange(city.key);
                          setIsCityDropdownOpen(false);
                        }}
                        className={`w-full px-4 py-3 text-left transition-all flex items-center justify-between rounded-xl mb-1 last:mb-0 ${selectedCity === city.key
                            ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400'
                            : 'hover:bg-gray-50 dark:hover:bg-gray-700/50 text-gray-700 dark:text-gray-300'
                          }`}
                      >
                        <span className={`font-medium ${selectedCity === city.key ? 'font-bold' : ''}`}>{city.label}</span>
                        {selectedCity === city.key && (
                          <CheckCircle className="h-4 w-4 text-emerald-500" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Divider */}
          <div className="hidden md:block w-px bg-gray-100 dark:bg-gray-700 my-2"></div>

          {/* Search Input */}
          <div className="flex-1 relative group">
            <div className={`absolute top-1/2 transform -translate-y-1/2 pointer-events-none transition-colors duration-300 ${isRTL ? 'right-6' : 'left-6'}`}>
              <Search className="h-5 w-5 text-gray-400 group-focus-within:text-emerald-500" />
            </div>
            <input
              type="text"
              placeholder={t.searchPlaceholder}
              value={localSearchQuery}
              onChange={(e) => setLocalSearchQuery(e.target.value)}
              className={`w-full h-14 ${isRTL ? 'pr-14 pl-12' : 'pl-14 pr-12'} bg-transparent border-none focus:ring-0 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 text-lg`}
            />
            {searchQuery && (
              <button
                onClick={() => onSearchChange('')}
                className={`absolute top-1/2 transform -translate-y-1/2 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors ${isRTL ? 'left-4' : 'right-4'}`}
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Search Button (Visual only on desktop, functional on mobile if needed) */}
          <div className="hidden md:flex items-center pr-2 pl-2">
            <button className="h-10 w-10 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl shadow-lg shadow-emerald-500/30 flex items-center justify-center transition-all hover:scale-105 active:scale-95">
              <Search className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Filters Row */}
      <div className="mt-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 px-2">
        {/* Quick Filters */}
        <div className="flex flex-wrap gap-3">
          {quickFilters.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => onFilterChange(key)}
              className={`group relative flex items-center gap-2 px-5 py-2.5 rounded-full font-medium transition-all duration-300 text-sm overflow-hidden ${filter === key
                  ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/25 ring-2 ring-emerald-500 ring-offset-2 dark:ring-offset-gray-900'
                  : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700'
                }`}
            >
              {Icon && <Icon className={`h-4 w-4 transition-transform group-hover:scale-110 ${filter === key ? 'text-white' : 'text-emerald-500'}`} />}
              {label}
              {filter === key && (
                <div className="absolute inset-0 bg-white/20 animate-pulse-slow"></div>
              )}
            </button>
          ))}
        </div>

        {/* Advanced Filters Button */}
        <button
          onClick={onOpenFilters}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-full font-medium transition-all duration-300 text-sm border ${activeFiltersCount > 0
              ? 'bg-white dark:bg-gray-800 border-emerald-500 text-emerald-600 dark:text-emerald-400 shadow-lg shadow-emerald-500/10'
              : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:border-emerald-300 dark:hover:border-emerald-700'
            }`}
        >
          <SlidersHorizontal className="h-4 w-4" />
          <span>{t.filters}</span>
          {activeFiltersCount > 0 && (
            <span className="ml-1.5 bg-emerald-500 text-white text-[10px] px-2 py-0.5 rounded-full font-bold shadow-sm">
              {activeFiltersCount}
            </span>
          )}
        </button>
      </div>
    </div>
  );
};

export default SearchAndFilter;