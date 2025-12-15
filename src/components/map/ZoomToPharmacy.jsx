import { useEffect } from 'react';
import { useMap } from 'react-leaflet';

// Component to zoom to selected pharmacy
const ZoomToPharmacy = ({ selectedPharmacyId, pharmacies }) => {
    const map = useMap();

    useEffect(() => {
        if (selectedPharmacyId && pharmacies.length > 0) {
            const pharmacy = pharmacies.find(p => p.id === selectedPharmacyId);
            if (pharmacy && pharmacy.coordinates) {
                map.flyTo([pharmacy.coordinates.lat, pharmacy.coordinates.lng], 16, {
                    duration: 1.5,
                    easeLinearity: 0.25,
                });
            }
        }
    }, [selectedPharmacyId, pharmacies, map]);

    return null;
};

export default ZoomToPharmacy;
