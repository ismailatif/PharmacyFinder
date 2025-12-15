import React from 'react';

const ProfileSkeleton = () => {
    return (
        <div className="max-w-4xl mx-auto px-4 py-8 mt-20 animate-pulse">
            {/* Header Skeleton */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 mb-6">
                <div className="flex items-center gap-6">
                    <div className="w-20 h-20 rounded-full bg-gray-200 dark:bg-gray-700"></div>
                    <div className="space-y-3 flex-1">
                        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/5"></div>
                    </div>
                </div>
            </div>

            {/* Tabs Skeleton */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden">
                <div className="border-b border-gray-200 dark:border-gray-700">
                    <div className="flex">
                        <div className="flex-1 py-4 px-6">
                            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded mx-auto w-1/2"></div>
                        </div>
                        <div className="flex-1 py-4 px-6">
                            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded mx-auto w-1/2"></div>
                        </div>
                        <div className="flex-1 py-4 px-6">
                            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded mx-auto w-1/2"></div>
                        </div>
                    </div>
                </div>

                {/* Content Skeleton */}
                <div className="p-8 space-y-6">
                    <div>
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-2"></div>
                        <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded-xl w-full"></div>
                    </div>
                    <div>
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-2"></div>
                        <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded-xl w-full"></div>
                    </div>
                    <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded-xl w-full mt-8"></div>
                </div>
            </div>
        </div>
    );
};

export default ProfileSkeleton;
