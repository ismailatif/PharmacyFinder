import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  const { isRTL } = useLanguage();

  if (totalPages <= 1) return null;

  const getPageNumbers = () => {
    const pages = [];
    // Always show first page
    pages.push(1);

    // Logic for showing ellipsis and surrounding pages
    if (currentPage > 3) {
      pages.push('...');
    }

    for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
      pages.push(i);
    }

    if (currentPage < totalPages - 2) {
      pages.push('...');
    }

    // Always show last page if more than 1 page
    if (totalPages > 1) {
      pages.push(totalPages);
    }
    
    // Simple fallback for small number of pages to avoid duplicates or complex logic issues
    if (totalPages <= 5) {
        return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    return pages;
  };

  const pageNumbers = getPageNumbers();

  return (
    <div className="flex justify-center items-center gap-2 mt-12" dir={isRTL ? 'rtl' : 'ltr'}>
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className={`p-2.5 rounded-xl border transition-all duration-200 ${
          currentPage === 1
            ? 'bg-gray-50 text-gray-300 border-gray-100 dark:bg-gray-800/50 dark:text-gray-700 dark:border-gray-800 cursor-not-allowed'
            : 'bg-white text-gray-600 border-gray-200 hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-600 hover:shadow-md hover:shadow-emerald-100/50 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700 dark:hover:bg-gray-700 dark:hover:text-emerald-400 dark:hover:border-gray-600 active:scale-95'
        }`}
        aria-label="Previous Page"
      >
        {isRTL ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
      </button>

      <div className="flex items-center gap-1.5 bg-white dark:bg-gray-800 p-1.5 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm">
        {pageNumbers.map((page, index) => (
          <React.Fragment key={index}>
            {page === '...' ? (
              <span className="px-3 py-2 text-gray-400 dark:text-gray-600 font-medium select-none">...</span>
            ) : (
              <button
                onClick={() => onPageChange(page)}
                className={`min-w-[40px] h-10 rounded-lg text-sm font-semibold transition-all duration-200 ${
                  currentPage === page
                    ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30 scale-105'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-emerald-600 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-emerald-400'
                }`}
              >
                {page}
              </button>
            )}
          </React.Fragment>
        ))}
      </div>

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className={`p-2.5 rounded-xl border transition-all duration-200 ${
          currentPage === totalPages
            ? 'bg-gray-50 text-gray-300 border-gray-100 dark:bg-gray-800/50 dark:text-gray-700 dark:border-gray-800 cursor-not-allowed'
            : 'bg-white text-gray-600 border-gray-200 hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-600 hover:shadow-md hover:shadow-emerald-100/50 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700 dark:hover:bg-gray-700 dark:hover:text-emerald-400 dark:hover:border-gray-600 active:scale-95'
        }`}
        aria-label="Next Page"
      >
        {isRTL ? <ChevronLeft className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
      </button>
    </div>
  );
};

export default Pagination;
