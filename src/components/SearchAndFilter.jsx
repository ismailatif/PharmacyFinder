import React, { useState, useMemo } from 'react';
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
  const { t, isRTL, language } = useLanguage();
  const [isCityDropdownOpen, setIsCityDropdownOpen] = useState(false);
  const [citySearchTerm, setCitySearchTerm] = useState('');

  const quickFilters = [
    { key: 'all', label: t.filterAll, icon: null },
    { key: 'onDuty', label: t.filterOnDuty, icon: Shield },
    { key: 'open', label: t.filterOpen, icon: Clock }
  ];

  const cities = useMemo(() => [
    { key: 'all', label: isRTL ? 'جميع المدن' : 'Toutes les villes', labelFr: 'Toutes les villes' },
    { key: 'Casablanca', label: isRTL ? 'الدار البيضاء' : 'Casablanca', labelFr: 'Casablanca' },
    { key: 'Rabat', label: isRTL ? 'الرباط' : 'Rabat', labelFr: 'Rabat' },
    { key: 'Fès', label: isRTL ? 'فاس' : 'Fès (Fes)', labelFr: 'Fès' },
    { key: 'Marrakech', label: isRTL ? 'مراكش' : 'Marrakech', labelFr: 'Marrakech' },
    { key: 'Tanger', label: isRTL ? 'طنجة' : 'Tanger (Tangier)', labelFr: 'Tanger' },
    { key: 'Agadir', label: isRTL ? 'أكادير' : 'Agadir', labelFr: 'Agadir' },
    { key: 'Meknès', label: isRTL ? 'مكناس' : 'Meknès', labelFr: 'Meknès' },
    { key: 'Oujda', label: isRTL ? 'وجدة' : 'Oujda', labelFr: 'Oujda' },
    { key: 'Kénitra', label: isRTL ? 'القنيطرة' : 'Kénitra', labelFr: 'Kénitra' },
    { key: 'Tétouan', label: isRTL ? 'تطوان' : 'Tétouan', labelFr: 'Tétouan' },
    { key: 'Safi', label: isRTL ? 'آسفي' : 'Safi', labelFr: 'Safi' },
    { key: 'El Jadida', label: isRTL ? 'الجديدة' : 'El Jadida', labelFr: 'El Jadida' },
    { key: 'Nador', label: isRTL ? 'الناظور' : 'Nador', labelFr: 'Nador' },
    { key: 'Settat', label: isRTL ? 'سطات' : 'Settat', labelFr: 'Settat' },
    { key: 'Mohammedia', label: isRTL ? 'المحمدية' : 'Mohammedia', labelFr: 'Mohammedia' },
    { key: 'Béni Mellal', label: isRTL ? 'بني ملال' : 'Béni Mellal', labelFr: 'Béni Mellal' },
    { key: 'Khouribga', label: isRTL ? 'خريبكة' : 'Khouribga', labelFr: 'Khouribga' },
    { key: 'Taza', label: isRTL ? 'تازة' : 'Taza', labelFr: 'Taza' },
    { key: 'Essaouira', label: isRTL ? 'الصويرة' : 'Essaouira', labelFr: 'Essaouira' },
    { key: 'Al Hoceima', label: isRTL ? 'الحسيمة' : 'Al Hoceima', labelFr: 'Al Hoceima' },
  ], [isRTL]);

  const filteredCities = useMemo(() => {
    if (!citySearchTerm.trim()) return cities;
    const norm = (str) => (str || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
    const query = norm(citySearchTerm);
    return cities.filter(c =>
      c.key === 'all' ||
      norm(c.key).includes(query) ||
      norm(c.label).includes(query) ||
      norm(c.labelFr).includes(query)
    );
  }, [cities, citySearchTerm]);

  const selectedCityLabel = cities.find(c => c.key.toLowerCase() === selectedCity.toLowerCase())?.label || cities[0].label;

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
              onClick={() => {
                setIsCityDropdownOpen(!isCityDropdownOpen);
                if (!isCityDropdownOpen) setCitySearchTerm('');
              }}
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
                <p className="text-xs text-gray-400 dark:text-gray-500 font-medium mb-0.5">{isRTL ? 'المدينة' : 'Ville'}</p>
                <p className="font-semibold truncate">{selectedCityLabel}</p>
              </div>
              <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform duration-300 ${isCityDropdownOpen ? 'rotate-180 text-emerald-500' : ''}`} />
            </button>

            {/* Dropdown Menu */}
            {isCityDropdownOpen && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => {
                    setIsCityDropdownOpen(false);
                    setCitySearchTerm('');
                  }}
                />
                <div className={`absolute top-full mt-4 w-[280px] bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl shadow-2xl shadow-emerald-500/20 z-20 overflow-hidden animate-in fade-in zoom-in-95 duration-200 flex flex-col ${isRTL ? 'right-0' : 'left-0'}`}>
                  {/* City Search Field */}
                  <div className="p-2 border-b border-gray-100 dark:border-gray-700 bg-gray-50/70 dark:bg-gray-800/90 backdrop-blur-sm sticky top-0 z-10">
                    <div className="relative flex items-center">
                      <Search className={`absolute h-4 w-4 text-gray-400 pointer-events-none ${isRTL ? 'right-3' : 'left-3'}`} />
                      <input
                        type="text"
                        autoFocus
                        value={citySearchTerm}
                        onChange={(e) => setCitySearchTerm(e.target.value)}
                        placeholder={isRTL ? 'بحث عن مدينة...' : (language === 'fr' ? 'Rechercher une ville...' : 'Search city...')}
                        className={`w-full py-2.5 ${isRTL ? 'pr-9 pl-7' : 'pl-9 pr-7'} text-xs bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-gray-900 dark:text-white placeholder-gray-400`}
                      />
                      {citySearchTerm && (
                        <button
                          type="button"
                          onClick={() => setCitySearchTerm('')}
                          className={`absolute ${isRTL ? 'left-2' : 'right-2'} p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-full`}
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Cities List */}
                  <div className="max-h-[260px] overflow-y-auto custom-scrollbar p-2">
                    {filteredCities.length > 0 ? (
                      filteredCities.map((city) => (
                        <button
                          key={city.key}
                          type="button"
                          onClick={() => {
                            onCityChange(city.key);
                            setIsCityDropdownOpen(false);
                            setCitySearchTerm('');
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
                      ))
                    ) : (
                      <div className="py-6 px-4 text-center text-xs text-gray-400 dark:text-gray-500 font-medium">
                        {isRTL ? 'لم يتم العثور على أي مدينة' : (language === 'fr' ? 'Aucune ville trouvée' : 'No cities found')}
                      </div>
                    )}
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