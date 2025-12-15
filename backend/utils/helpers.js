/**
 * Calculate distance between two coordinates using Haversine formula
 * @param {number} lat1 - Latitude of first point
 * @param {number} lon1 - Longitude of first point
 * @param {number} lat2 - Latitude of second point
 * @param {number} lon2 - Longitude of second point
 * @returns {number} Distance in kilometers
 */
export const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Earth's radius in kilometers
    const dLat = toRadians(lat2 - lat1);
    const dLon = toRadians(lon2 - lon1);

    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRadians(lat1)) *
        Math.cos(toRadians(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;

    return distance;
};

const toRadians = (degrees) => {
    return degrees * (Math.PI / 180);
};

/**
 * Filter pharmacies based on query parameters
 * @param {Array} pharmacies - Array of pharmacy objects
 * @param {Object} filters - Filter criteria
 * @returns {Array} Filtered pharmacies
 */
export const filterPharmacies = (pharmacies, filters) => {
    let filtered = [...pharmacies];

    // Filter by city
    if (filters.city) {
        filtered = filtered.filter(
            (p) => p.city.toLowerCase() === filters.city.toLowerCase()
        );
    }

    // Filter by open status
    if (filters.isOpen !== undefined) {
        const isOpen = filters.isOpen === 'true' || filters.isOpen === true;
        filtered = filtered.filter((p) => p.isOpen === isOpen);
    }

    // Filter by on-duty status
    if (filters.isOnDuty !== undefined) {
        const isOnDuty = filters.isOnDuty === 'true' || filters.isOnDuty === true;
        filtered = filtered.filter((p) => p.isOnDuty === isOnDuty);
    }

    // Filter by minimum rating
    if (filters.rating) {
        const minRating = parseFloat(filters.rating);
        filtered = filtered.filter((p) => p.rating >= minRating);
    }

    // Search by name or address
    if (filters.search) {
        const searchTerm = filters.search.toLowerCase();
        filtered = filtered.filter(
            (p) =>
                p.name.toLowerCase().includes(searchTerm) ||
                p.nameAr.includes(searchTerm) ||
                p.address.toLowerCase().includes(searchTerm) ||
                p.addressAr.includes(searchTerm)
        );
    }

    return filtered;
};

/**
 * Paginate results
 * @param {Array} data - Data to paginate
 * @param {number} limit - Items per page
 * @param {number} offset - Starting index
 * @returns {Object} Paginated data with metadata
 */
export const paginate = (data, limit = 20, offset = 0) => {
    const parsedLimit = parseInt(limit);
    const parsedOffset = parseInt(offset);

    const paginatedData = data.slice(parsedOffset, parsedOffset + parsedLimit);

    return {
        data: paginatedData,
        metadata: {
            total: data.length,
            limit: parsedLimit,
            offset: parsedOffset,
            count: paginatedData.length
        }
    };
};
