import { useEffect } from 'react';
import { useMap } from 'react-leaflet';

// Component to capture map reference
const MapRefHandler = ({ mapRef }) => {
    const map = useMap();

    useEffect(() => {
        if (mapRef) {
            mapRef.current = map;
        }
    }, [map, mapRef]);

    return null;
};

export default MapRefHandler;
