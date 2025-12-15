import React, { useState, useEffect } from 'react';
import { Polyline } from 'react-leaflet';
import { toast } from 'react-hot-toast';
import { useLanguage } from '../../context/LanguageContext';
import PolylineDecorator from './PolylineDecorator';

// Google Maps–like route colors
const ROUTE_COLOR_DARK = '#1858E0';
const ROUTE_COLOR_LIGHT = '#71A6FF';

const RoutingControl = ({ start, end, endId, onRouteFound }) => {
    const [positions, setPositions] = useState([]);
    const { isRTL } = useLanguage();

    useEffect(() => {
        if (!start || !end || !endId) return;

        const fetchRoute = async () => {
            try {
                const response = await fetch(
                    `http://localhost:5000/api/pharmacies/route?startLat=${start.lat}&startLng=${start.lng}&pharmacyId=${endId}`
                );

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const data = await response.json();

                if (data.success && data.data && data.data.geometry) {
                    // OSRM GeoJSON is [lng, lat], Leaflet needs [lat, lng]
                    const coords = data.data.geometry.coordinates.map(coord => [coord[1], coord[0]]);
                    setPositions(coords);

                    if (onRouteFound) {
                        onRouteFound({
                            distance: (data.data.distance / 1000).toFixed(2),
                            time: Math.round(data.data.duration / 60),
                        });
                    }
                } else {
                    // Handle API declared failure
                    throw new Error(data.message || 'Route calculation failed');
                }
            } catch (error) {
                console.error('Error fetching route:', error);
                toast.error(
                    isRTL
                        ? 'تعذر حساب المسار. يرجى المحاولة لاحقًا.'
                        : "Impossible de calculer l'itinéraire. Veuillez réessayer plus tard.",
                    {
                        id: 'route-error',
                        duration: 4000
                    }
                );
            }
        };

        fetchRoute();
    }, [start, end, endId, onRouteFound, isRTL]);

    if (positions.length === 0) return null;

    return (
        <>
            {/* Outer light blue stroke */}
            <Polyline
                positions={positions}
                pathOptions={{
                    color: ROUTE_COLOR_LIGHT,
                    weight: 9,
                    opacity: 0.8,
                    lineCap: 'round',
                    lineJoin: 'round',
                }}
            />
            {/* Inner dark blue stroke */}
            <Polyline
                positions={positions}
                pathOptions={{
                    color: ROUTE_COLOR_DARK,
                    weight: 5,
                    opacity: 1,
                    lineCap: 'round',
                    lineJoin: 'round',
                }}
            />
            {/* Small repeated arrows */}
            <PolylineDecorator positions={positions} />
        </>
    );
};

export default RoutingControl;
