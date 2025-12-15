import { useEffect } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet-polylinedecorator';

// Google-style arrow decorator along the route
const PolylineDecorator = ({ positions }) => {
    const map = useMap();

    useEffect(() => {
        if (!map || !positions || positions.length < 2) return;

        const polyline = L.polyline(positions);

        const decorator = L.polylineDecorator(polyline, {
            patterns: [
                {
                    offset: '6%',   // start a bit after the beginning
                    repeat: '10%',   // small frequent arrows, Google-like
                    symbol: L.Symbol.arrowHead({
                        pixelSize: 4.5,   // small arrows
                        headAngle: 45,
                        pathOptions: {
                            color: '#a5c1ffab', //  arrows for better contrast
                            weight: 2,
                            opacity: 1,
                            fillOpacity: 1,
                        },
                    }),
                },
            ],
        }).addTo(map);

        decorator.bringToFront();

        return () => {
            map.removeLayer(decorator);
        };
    }, [map, positions]);

    return null;
};

export default PolylineDecorator;
