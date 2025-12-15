import React from 'react';

const MapSkeleton = () => {
  return (
    <div className="w-full h-full bg-gray-100 dark:bg-gray-800 rounded-2xl overflow-hidden animate-pulse relative">
      {/* Map background pattern */}
      <div className="absolute inset-0 opacity-10">
        <svg className="w-full h-full" viewBox="0 0 100 100">
          <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
            <path d="M 10 0 L 0 0 0 10" fill="none" stroke="currentColor" strokeWidth="0.5"/>
          </pattern>
          <rect width="100" height="100" fill="url(#grid)" />
        </svg>
      </div>

      {/* Skeleton markers */}
      <div className="absolute top-1/4 left-1/4 w-8 h-8 bg-gray-300 dark:bg-gray-700 rounded-full"></div>
      <div className="absolute top-1/2 left-1/2 w-8 h-8 bg-gray-300 dark:bg-gray-700 rounded-full"></div>
      <div className="absolute top-3/4 left-3/4 w-8 h-8 bg-gray-300 dark:bg-gray-700 rounded-full"></div>
      <div className="absolute top-1/3 right-1/4 w-8 h-8 bg-gray-300 dark:bg-gray-700 rounded-full"></div>

      {/* Loading text */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-12 h-12 border-4 border-gray-300 dark:border-gray-600 border-t-emerald-500 rounded-full animate-spin mx-auto"></div>
          <div className="h-4 w-32 bg-gray-300 dark:bg-gray-600 rounded mx-auto"></div>
        </div>
      </div>

      {/* Map controls skeleton */}
      <div className="absolute top-4 right-4 space-y-2">
        <div className="w-10 h-10 bg-gray-300 dark:bg-gray-700 rounded-lg"></div>
        <div className="w-10 h-10 bg-gray-300 dark:bg-gray-700 rounded-lg"></div>
      </div>
    </div>
  );
};

export default MapSkeleton;
