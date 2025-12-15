import { useEffect } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';

// Component to update map view bounds when pharmacies change
const MapUpdater = ({ pharmacies, selectedLocation }) => {
    const map = useMap();

    useEffect(() => {
        if (selectedLocation && selectedLocation.coordinates) {
            // When user location is available, fly to it with smooth animation
            map.flyTo([selectedLocation.coordinates.lat, selectedLocation.coordinates.lng], 13, {
                duration: 1.5,
                easeLinearity: 0.25,
            });
        } else if (pharmacies.length > 0) {
            // Otherwise, fit all pharmacies
            const validPharmacies = pharmacies.filter(
                p =>
                    p.coordinates &&
                    typeof p.coordinates.lat === 'number' &&
                    typeof p.coordinates.lng === 'number'
            );
            if (validPharmacies.length > 0) {
                const bounds = L.latLngBounds(
                    validPharmacies.map(p => [p.coordinates.lat, p.coordinates.lng])
                );
                map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
            }
        }
    }, [selectedLocation, pharmacies, map]);

    return null;
};

export default MapUpdater;
