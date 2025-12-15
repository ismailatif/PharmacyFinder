import React from 'react';

const PharmacySkeleton = () => {
  return (
    <div className="pharmacy-card bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 border border-gray-200 dark:border-gray-700 animate-pulse">
      <div className="p-6">
        {/* Header skeleton */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            {/* Title skeleton */}
            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
            {/* Subtitle skeleton */}
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
          </div>
          {/* Status badge skeleton */}
          <div className="h-6 w-20 bg-gray-200 dark:bg-gray-700 rounded-full ml-4"></div>
        </div>

        {/* Address skeleton */}
        <div className="mb-4 space-y-2">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
        </div>

        {/* Info row skeleton */}
        <div className="flex items-center gap-4 mb-4">
          {/* Rating skeleton */}
          <div className="flex items-center gap-1">
            <div className="h-4 w-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
            <div className="h-4 w-12 bg-gray-200 dark:bg-gray-700 rounded"></div>
          </div>
          {/* Distance skeleton */}
          <div className="flex items-center gap-1">
            <div className="h-4 w-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
            <div className="h-4 w-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
          </div>
        </div>

        {/* Services skeleton */}
        <div className="flex flex-wrap gap-2 mb-4">
          <div className="h-6 w-20 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
          <div className="h-6 w-24 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
          <div className="h-6 w-16 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
        </div>

        {/* Action buttons skeleton */}
        <div className="flex items-center gap-3 mt-4">
          <div className="h-10 flex-1 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
          <div className="h-10 w-10 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
          <div className="h-10 w-10 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
        </div>
      </div>
    </div>
  );
};

export default PharmacySkeleton;
