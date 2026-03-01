import { useEffect } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';

const BingLayer = ({ type = 'Road' }) => {
    const map = useMap();

    useEffect(() => {
        // Map types: 
        // Road: 'r' (Road)
        // Aerial: 'a' (Aerial)
        // Hybrid: 'h' (Aerial + Labels)
        let code = 'r';
        if (type === 'Aerial') code = 'a';
        if (type === 'Hybrid') code = 'h';

        const tileUrl = `https://ecn.t{s}.tiles.virtualearth.net/tiles/${code}{q}.jpeg?g=12327`;

        const layer = L.tileLayer(tileUrl, {
            subdomains: ['0', '1', '2', '3'],
            attribution: '&copy; <a href="http://bing.com/maps">Bing Maps</a>',
        });

        // Override getTileUrl to handle quadkeys
        layer.getTileUrl = function (coords) {
            const x = coords.x;
            const y = coords.y;
            const z = coords.z;

            let quad = '';
            for (let i = z; i > 0; i--) {
                let digit = 0;
                const mask = 1 << (i - 1);
                if ((x & mask) !== 0) digit += 1;
                if ((y & mask) !== 0) digit += 2;
                quad += digit;
            }

            return L.Util.template(this._url, {
                s: this._getSubdomain(coords),
                q: quad
            });
        };

        layer.addTo(map);

        return () => {
            map.removeLayer(layer);
        };
    }, [map, type]);

    return null;
};

export default BingLayer;
