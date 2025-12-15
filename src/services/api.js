const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

/**
 * Fetch all pharmacies with optional filters
 * @param {Object} params - Query parameters
 * @returns {Promise<Object>} API response
 */
export const getPharmacies = async (params = {}) => {
    try {
        const queryString = new URLSearchParams(params).toString();
        const url = `${API_BASE_URL}/pharmacies${queryString ? `?${queryString}` : ''}`;

        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error('Error fetching pharmacies:', error);
        throw error;
    }
};

/**
 * Fetch a single pharmacy by ID
 * @param {string} id - Pharmacy ID
 * @returns {Promise<Object>} API response
 */
export const getPharmacyById = async (id) => {
    try {
        const response = await fetch(`${API_BASE_URL}/pharmacies/${id}`);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error('Error fetching pharmacy:', error);
        throw error;
    }
};

/**
 * Fetch nearby pharmacies based on coordinates
 * @param {number} lat - Latitude
 * @param {number} lng - Longitude
 * @param {number} radius - Search radius in km (default: 10)
 * @param {number} limit - Maximum results (default: 50)
 * @returns {Promise<Object>} API response
 */
export const getNearbyPharmacies = async (lat, lng, radius = 10, limit = 50) => {
    try {
        const params = new URLSearchParams({
            lat: lat.toString(),
            lng: lng.toString(),
            radius: radius.toString(),
            limit: limit.toString()
        });

        const response = await fetch(`${API_BASE_URL}/pharmacies/nearby?${params}`);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error('Error fetching nearby pharmacies:', error);
        throw error;
    }
};

/**
 * Fetch all cities
 * @returns {Promise<Object>} API response
 */
export const getCities = async () => {
    try {
        const response = await fetch(`${API_BASE_URL}/cities`);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error('Error fetching cities:', error);
        throw error;
    }
};
