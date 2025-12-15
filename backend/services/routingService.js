/**
 * Calculate route between two points using OSRM
 * @param {Object} start - Start coordinates {lat, lng}
 * @param {Object} end - End coordinates {lat, lng}
 * @param {number} timeout - Timeout in milliseconds
 * @returns {Promise<Object>} Route object
 */
export const getRoute = async (start, end, timeout = 5000) => {
    // Validate inputs
    if (!start || !end || typeof start.lat !== 'number' || typeof start.lng !== 'number' || typeof end.lat !== 'number' || typeof end.lng !== 'number') {
        throw new Error('Invalid coordinates provided for routing');
    }

    const startCoord = `${start.lng},${start.lat}`;
    const endCoord = `${end.lng},${end.lat}`;

    // Use environment variable or default to local OSRM
    const baseUrl = process.env.OSRM_URL || 'http://localhost:5001/route/v1/driving';
    // Remove trailing slash if present to avoid double slashes
    const cleanBaseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;

    const url = `${cleanBaseUrl}/${startCoord};${endCoord}?overview=full&geometries=geojson`;

    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);

    try {
        const response = await fetch(url, { signal: controller.signal });
        clearTimeout(id);

        if (!response.ok) {
            throw new Error(`OSRM API error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();

        if (data.code !== 'Ok' || !data.routes || data.routes.length === 0) {
            throw new Error('No route found');
        }

        return data.routes[0];
    } catch (error) {
        // Clear timeout if request failed for other reasons
        clearTimeout(id);

        if (error.name === 'AbortError') {
            throw new Error(`Request timed out after ${timeout}ms`);
        }
        throw error;
    }
};
