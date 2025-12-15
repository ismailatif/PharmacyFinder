import React, { useMemo, useEffect } from "react";
import {
  X,
  Filter,
  Star,
  DollarSign,
  Car,
  Armchair as Wheelchair,
  Shield,
  Truck,
  ChevronDown,
} from "lucide-react";
import { useLanguage } from "../context/LanguageContext";

const FilterSidebar = ({ isOpen, onClose, filters, onFiltersChange }) => {
  const { t, isRTL } = useLanguage();

  // Prevent body scroll when sidebar is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const statusOptions = [
    { key: "all", label: t.filterAll },
    { key: "open", label: t.filterOpen },
    { key: "onDuty", label: t.filterOnDuty },
    { key: "closed", label: t.filterClosed },
  ];

  const priceRangeOptions = [
    { key: "low", label: t.priceRangeLow, icon: DollarSign },
    { key: "medium", label: t.priceRangeMedium, icon: DollarSign },
    { key: "high", label: t.priceRangeHigh, icon: DollarSign },
  ];

  const featureOptions = [
    { key: "hasParking", label: t.parking, icon: Car },
    { key: "isAccessible", label: t.accessible, icon: Wheelchair },
    { key: "acceptsInsurance", label: t.insurance, icon: Shield },
    { key: "hasDelivery", label: t.delivery, icon: Truck },
  ];

  const sortOptions = [
    { key: "rating", label: t.sortRating },
    { key: "name", label: t.sortName },
    { key: "distance", label: t.sortDistance },
  ];

  const handleStatusChange = (status) => {
    onFiltersChange({ ...filters, status });
  };

  const handlePriceRangeChange = (priceRange) => {
    const newPriceRange = filters.priceRange.includes(priceRange)
      ? filters.priceRange.filter((p) => p !== priceRange)
      : [...filters.priceRange, priceRange];
    onFiltersChange({ ...filters, priceRange: newPriceRange });
  };

  const handleFeatureChange = (feature) => {
    const newFeatures = filters.features.includes(feature)
      ? filters.features.filter((f) => f !== feature)
      : [...filters.features, feature];
    onFiltersChange({ ...filters, features: newFeatures });
  };

  const handleRatingChange = (rating) => {
    onFiltersChange({
      ...filters,
      rating: filters.rating === rating ? 0 : rating,
    });
  };

  const handleSortChange = (sortBy) => {
    onFiltersChange({ ...filters, sortBy });
  };

  const clearFilters = () => {
    onFiltersChange({
      status: "all",
      priceRange: [],
      features: [],
      rating: 0,
      sortBy: "rating",
    });
  };

  // Count active filters
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.status !== "all") count++;
    if (filters.priceRange.length > 0) count += filters.priceRange.length;
    if (filters.features.length > 0) count += filters.features.length;
    if (filters.rating > 0) count++;
    if (filters.sortBy !== "rating") count++;
    return count;
  }, [filters]);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-40 z-40 transition-opacity duration-300"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Sidebar Panel */}
      <div
        className={`fixed top-0 ${isRTL ? "right-0" : "left-0"
          } h-[100dvh] w-full sm:w-96 bg-white dark:bg-gray-800 shadow-2xl z-50 transform transition-transform duration-300 flex flex-col`}
      >
        {/* Sticky Header */}
        <div className="sticky top-0 bg-gradient-to-b from-white via-white to-gray-50 dark:from-gray-800 dark:via-gray-800 dark:to-gray-900 border-b border-emerald-100 dark:border-gray-700 px-6 py-4 sm:py-5 z-10 shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg">
                <Filter className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {t.filters}
                </h2>
                {activeFilterCount > 0 && (
                  <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                    {activeFilterCount}{" "}
                    {activeFilterCount === 1 ? "filter" : "filters"} active
                  </span>
                )}
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-all duration-200 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              aria-label="Close filters"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto min-h-0 overscroll-contain px-6 py-6 space-y-6">
          {/* Status Filter */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider">{` ${isRTL ? "الحالة" : "Status"
              }`}</h3>
            <div className="grid grid-cols-2 gap-2">
              {statusOptions.map((option) => (
                <button
                  key={option.key}
                  onClick={() => handleStatusChange(option.key)}
                  className={`px-4 py-2.5 rounded-lg font-medium text-sm transition-all duration-200 ${filters.status === option.key
                    ? "bg-emerald-500 text-white shadow-md shadow-emerald-500/30"
                    : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                    }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* Price Range Filter */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider">
              {t.priceRange}
            </h3>
            <div className="space-y-2">
              {priceRangeOptions.map((option) => (
                <button
                  key={option.key}
                  onClick={() => handlePriceRangeChange(option.key)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg border-2 transition-all duration-200 ${filters.priceRange.includes(option.key)
                    ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20"
                    : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-600"
                    }`}
                >
                  <div
                    className={`h-5 w-5 rounded border-2 flex items-center justify-center transition-all ${filters.priceRange.includes(option.key)
                      ? "border-emerald-500 bg-emerald-500"
                      : "border-gray-300 dark:border-gray-600"
                      }`}
                  >
                    {filters.priceRange.includes(option.key) && (
                      <span className="text-white text-xs font-bold">✓</span>
                    )}
                  </div>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {option.label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Features Filter */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider">
              {t.features}
            </h3>
            <div className="space-y-2">
              {featureOptions.map((option) => {
                const Icon = option.icon;
                return (
                  <button
                    key={option.key}
                    onClick={() => handleFeatureChange(option.key)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg border-2 transition-all duration-200 ${filters.features.includes(option.key)
                      ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20"
                      : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-600"
                      }`}
                  >
                    <div
                      className={`h-5 w-5 rounded border-2 flex items-center justify-center transition-all ${filters.features.includes(option.key)
                        ? "border-emerald-500 bg-emerald-500"
                        : "border-gray-300 dark:border-gray-600"
                        }`}
                    >
                      {filters.features.includes(option.key) && (
                        <span className="text-white text-xs font-bold">✓</span>
                      )}
                    </div>
                    <Icon
                      className={`h-4 w-4 ${filters.features.includes(option.key)
                        ? "text-emerald-600 dark:text-emerald-400"
                        : "text-gray-400 dark:text-gray-500"
                        }`}
                    />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {option.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Rating Filter */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider">
              {t.rating}
            </h3>
            <div className="space-y-2">
              <button
                onClick={() => handleRatingChange(0)}
                className={`w-full px-4 py-3 rounded-lg border-2 transition-all duration-200 text-sm font-medium ${filters.rating === 0
                  ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400"
                  : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600"
                  }`}
              >
                {t.all || "All Ratings"}
              </button>
              {[5, 4, 3, 2, 1].map((rating) => (
                <button
                  key={rating}
                  onClick={() => handleRatingChange(rating)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg border-2 transition-all duration-200 ${filters.rating === rating
                    ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20"
                    : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-600"
                    }`}
                >
                  <div className="flex gap-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`h-4 w-4 ${i < rating
                          ? "text-yellow-400 fill-current"
                          : "text-gray-300 dark:text-gray-600"
                          }`}
                      />
                    ))}
                  </div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {rating}.0 {isRTL ? "و أعلى" : "et supérieure"}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Sort By */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider">
              {t.sortBy}
            </h3>
            <div className="relative">
              <select
                value={filters.sortBy}
                onChange={(e) => handleSortChange(e.target.value)}
                className="w-full appearance-none px-4 py-3 pr-10 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-lg focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all duration-200 text-gray-700 dark:text-gray-300 font-medium"
              >
                {sortOptions.map((option) => (
                  <option key={option.key} value={option.key}>
                    {option.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Sticky Footer */}
        <div className="sticky bottom-0 bg-gradient-to-t from-white via-white to-gray-50 dark:from-gray-800 dark:via-gray-800 dark:to-gray-900 border-t border-emerald-100 dark:border-gray-700 px-6 py-4 sm:py-5 flex gap-3">
          <button
            onClick={clearFilters}
            className="flex-1 px-4 py-2.5 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:border-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200 font-medium"
          >
            {t.clearFilters}
          </button>
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-all duration-200 font-medium shadow-md shadow-emerald-500/30 hover:shadow-emerald-500/40"
          >
            Done
          </button>
        </div>
      </div>
    </>
  );
};

export default FilterSidebar;
