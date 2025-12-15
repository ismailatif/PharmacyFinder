export const getRoute = async (start, end, timeout = 5000) => {
    const startCoord = `${start.lng},${start.lat}`;
    const endCoord = `${end.lng},${end.lat}`;

    // Using local OSRM instance (Port 5001 to avoid conflict with backend)
    const url = `http://localhost:5001/route/v1/driving/${startCoord};${endCoord}?overview=full&geometries=geojson`;

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
