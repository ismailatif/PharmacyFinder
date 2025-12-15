import { useEffect } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';

// Component to handle cluster tooltips on hover
const ClusterTooltipHandler = () => {
    const map = useMap();

    useEffect(() => {
        const handleClusterHover = e => {
            const target = e.target;
            // Safety checks
            if (target && target.classList && target.classList.contains('cluster-marker')) {
                const tooltipHtml = target.getAttribute('data-tooltip');
                if (tooltipHtml && !target._tooltip) {
                    const tooltip = L.tooltip({
                        permanent: false,
                        direction: 'top',
                        className: 'cluster-info-tooltip',
                        offset: [0, -10],
                    })
                        .setLatLng(e.latlng)
                        .setContent(tooltipHtml)
                        .addTo(map);

                    target._tooltip = tooltip;

                    target.addEventListener(
                        'mouseout',
                        () => {
                            if (target._tooltip) {
                                map.removeLayer(target._tooltip);
                                target._tooltip = null;
                            }
                        },
                        { once: true }
                    );
                }
            }
        };

        map.on('mouseover', handleClusterHover);

        return () => {
            map.off('mouseover', handleClusterHover);
        };
    }, [map]);

    return null;
};

export default ClusterTooltipHandler;
