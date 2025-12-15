import React, { useMemo, useState, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import { divIcon, point } from 'leaflet';
import { renderToStaticMarkup } from 'react-dom/server';
import { MapPin, Phone, Navigation2, Maximize, Minimize } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Import extracted map components
import MapUpdater from './map/MapUpdater';
import RoutingControl from './map/RoutingControl';
import ClusterTooltipHandler from './map/ClusterTooltipHandler';
import ZoomToPharmacy from './map/ZoomToPharmacy';
import MapRefHandler from './map/MapRefHandler';

// Fix for default Leaflet marker shadow
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: null,
  iconUrl: null,
  shadowUrl: null,
});

const PharmacyMap = ({ pharmacies, onViewDetails, selectedLocation, selectedPharmacyId }) => {
  const { t, isRTL } = useLanguage();
  const [routeInfo, setRouteInfo] = useState(null);
  const [selectedPharmacyForRoute, setSelectedPharmacyForRoute] = useState(null);
  const mapRef = useRef(null);

  // Filter out pharmacies with invalid coordinates
  const validPharmacies = useMemo(() => {
    return pharmacies.filter(
      p =>
        p.coordinates &&
        typeof p.coordinates.lat === 'number' &&
        typeof p.coordinates.lng === 'number'
    );
  }, [pharmacies]);

  // Custom marker icons
  const createCustomIcon = type => {
    const bg =
      type === 'onDuty'
        ? 'bg-purple-100'
        : type === 'open'
          ? 'bg-emerald-100'
          : 'bg-gray-100';
    const border =
      type === 'onDuty'
        ? 'border-purple-600'
        : type === 'open'
          ? 'border-emerald-600'
          : 'border-gray-500';

    const iconMarkup = renderToStaticMarkup(
      <div
        className={`relative flex items-center justify-center w-12 h-12 rounded-full border-2 ${border} ${bg} shadow-lg transform transition-transform hover:scale-110 p-1`}
      >
        <img src="/logo.png" alt="Pharmacy" className="w-full h-full object-contain" />
        {type === 'onDuty' && (
          <span className="absolute -top-1 -right-1 flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-purple-500"></span>
          </span>
        )}
      </div>
    );

    return divIcon({
      html: iconMarkup,
      className: 'custom-marker-icon',
      iconSize: [48, 48],
      iconAnchor: [24, 48],
      popupAnchor: [0, -48],
    });
  };

  const createClusterCustomIcon = cluster => {
    const count = cluster.getChildCount();
    const markers = cluster.getAllChildMarkers();

    // Count pharmacy statuses in this cluster
    const onDutyCount = markers.filter(m => m.options.pharmacy?.isOnDuty).length;
    const openCount = markers.filter(
      m => m.options.pharmacy?.isOpen && !m.options.pharmacy?.isOnDuty
    ).length;
    const closedCount = count - onDutyCount - openCount;

    // Density-based styling
    let size = 'w-12 h-12 text-base';
    let colorClass = 'bg-emerald-400';
    let shadowClass = 'shadow-lg shadow-emerald-400/30';

    if (count > 10) {
      size = 'w-14 h-14 text-lg';
      colorClass = 'bg-gradient-to-br from-emerald-500 to-emerald-600';
      shadowClass = 'shadow-xl shadow-emerald-500/40';
    }
    if (count > 50) {
      size = 'w-16 h-16 text-xl';
      colorClass = 'bg-gradient-to-br from-emerald-600 to-emerald-800';
      shadowClass = 'shadow-2xl shadow-emerald-600/50';
    }

    // Create tooltip content
    const tooltipContent = `
      <div class="cluster-tooltip">
        <div class="font-bold text-gray-800 dark:text-gray-100 mb-2">${count} ${count === 1 ? 'Pharmacie' : 'Pharmacies'
      }</div>
        ${onDutyCount > 0
        ? `<div class="flex items-center gap-2 text-xs text-purple-600 dark:text-purple-400"><span class="w-2 h-2 rounded-full bg-purple-500"></span> ${onDutyCount} de garde</div>`
        : ''
      }
        ${openCount > 0
        ? `<div class="flex items-center gap-2 text-xs text-emerald-600 dark:text-emerald-400"><span class="w-2 h-2 rounded-full bg-emerald-500"></span> ${openCount} ouvertes</div>`
        : ''
      }
        ${closedCount > 0
        ? `<div class="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400"><span class="w-2 h-2 rounded-full bg-gray-400"></span> ${closedCount} fermées</div>`
        : ''
      }
      </div>
    `;

    const icon = divIcon({
      html: `<div class="flex items-center justify-center ${size} ${colorClass} text-white rounded-full font-bold border-4 border-white/40 ${shadowClass} backdrop-blur-sm transition-all duration-300 transform hover:scale-125 hover:border-white/60 cursor-pointer cluster-marker" data-tooltip='${tooltipContent
        .replace(/'/g, '&apos;')
        .replace(/\n/g, '')}'>
              <span>${count}</span>
            </div>`,
      className: 'custom-marker-cluster',
      iconSize: point(
        count > 50 ? 64 : count > 10 ? 56 : 48,
        count > 50 ? 64 : count > 10 ? 56 : 48,
        true
      ),
    });

    return icon;
  };

  const icons = useMemo(
    () => ({
      onDuty: createCustomIcon('onDuty'),
      open: createCustomIcon('open'),
      closed: createCustomIcon('closed'),
    }),
    []
  );

  const getPharmacyStatus = pharmacy => {
    if (pharmacy.isOnDuty) return 'onDuty';
    if (pharmacy.isOpen) return 'open';
    return 'closed';
  };

  return (
    <div id="pharmacy-map-container" className="relative h-full w-full rounded-2xl overflow-hidden shadow-inner border border-emerald-100 dark:border-gray-700 z-0 bg-gray-50 dark:bg-gray-900">
      <MapContainer
        center={[31.7917, -7.0926]} // Default center (Morocco)
        zoom={6}
        className="h-full w-full z-0"
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution=''
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <MapUpdater pharmacies={validPharmacies} selectedLocation={selectedLocation} />
        <ClusterTooltipHandler />
        <ZoomToPharmacy
          selectedPharmacyId={selectedPharmacyId}
          pharmacies={validPharmacies}
        />
        <MapRefHandler mapRef={mapRef} />

        {selectedPharmacyForRoute &&
          selectedLocation &&
          selectedLocation.coordinates && (
            <RoutingControl
              start={selectedLocation.coordinates}
              end={selectedPharmacyForRoute}
              endId={selectedPharmacyForRoute.id}
              onRouteFound={setRouteInfo}
            />
          )}

        <MarkerClusterGroup
          chunkedLoading
          iconCreateFunction={createClusterCustomIcon}
          polygonOptions={{
            fillColor: '#10b981',
            color: '#059669',
            weight: 1,
            opacity: 1,
            fillOpacity: 0.2,
          }}
        >
          {validPharmacies.map(pharmacy => (
            <Marker
              key={pharmacy.id}
              position={[pharmacy.coordinates.lat, pharmacy.coordinates.lng]}
              icon={icons[getPharmacyStatus(pharmacy)]}
              pharmacy={pharmacy}
            >
              <Popup className={`custom-popup ${isRTL ? "rtl-popup" : "ltr-popup"}`}>
                <div
                  className={`p-2 min-w-[220px] ${isRTL ? "rtl" : "ltr"}`}
                  dir={isRTL ? "rtl" : "ltr"}
                >
                  {/* Header */}
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h3 className="font-bold text-gray-900 dark:text-white text-sm">
                      {isRTL ? pharmacy.nameAr : pharmacy.name}
                    </h3>

                    {pharmacy.isOnDuty && (
                      <span className="px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 text-xs font-medium whitespace-nowrap">
                        {isRTL ? "مناوبة" : "Garde"}
                      </span>
                    )}
                  </div>

                  <div className="space-y-2 mb-3">
                    {/* Address */}
                    <div className="flex items-start gap-2 text-gray-600 dark:text-gray-300 text-xs">
                      <MapPin className="w-3 h-3 mt-[2px] shrink-0" />
                      <span className="break-words">
                        {isRTL ? pharmacy.addressAr : pharmacy.address}
                      </span>
                    </div>

                    {/* Phone: keep number LTR only */}
                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300 text-xs">
                      <Phone className="w-3 h-3 shrink-0" />
                      <span dir="ltr" className="unicode-bidi-plaintext">
                        {pharmacy.phone}
                      </span>
                    </div>

                    {/* Hours */}
                    <div className="pt-2 mt-2 border-t border-gray-200 dark:border-gray-600">
                      <div className="flex items-center justify-between gap-2 text-xs">
                        <span className="font-semibold text-gray-700 dark:text-gray-200">
                          {isRTL ? "ساعات العمل:" : "Horaires:"}
                        </span>

                        <span
                          className={`px-2 py-0.5 rounded-full text-xs font-medium ${pharmacy.isOpen
                              ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300"
                              : "bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-300"
                            }`}
                        >
                          {pharmacy.isOpen ? (isRTL ? "مفتوحة" : "Ouvert") : (isRTL ? "مغلقة" : "Fermé")}
                        </span>
                      </div>

                      <div className="mt-1 text-xs text-gray-600 dark:text-gray-300">
                        {pharmacy.isOpen ? (
                          <span className="unicode-bidi-plaintext">{isRTL ? "مفتوح حتى 22:00" : "Ouvert jusqu'à 22:00"}</span>
                        ) : (
                          <span className="unicode-bidi-plaintext">{isRTL ? "يفتح في 08:00" : "Ouvre à 08:00"}</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => onViewDetails(pharmacy)}
                    className="w-full py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium rounded-lg transition-colors flex items-center justify-center mb-2"
                  >
                    {isRTL ? "عرض التفاصيل" : "Voir détails"}
                  </button>

                  {selectedLocation?.coordinates && (
                    <button
                      onClick={() => {
                        setSelectedPharmacyForRoute({
                          lat: pharmacy.coordinates.lat,
                          lng: pharmacy.coordinates.lng,
                          id: pharmacy.id,
                        });
                        setTimeout(() => {
                          mapRef.current?.closePopup();
                        }, 100);
                      }}
                      className="w-full py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-lg transition-colors flex items-center justify-center gap-1"
                    >
                      <Navigation2 className="w-3 h-3" />
                      {isRTL ? "الحصول على الاتجاهات" : "Itinéraire"}
                    </button>
                  )}
                </div>
              </Popup>

            </Marker>
          ))}
        </MarkerClusterGroup>

        {/* User Location Marker (Blue Dot like Google Maps) */}
        {selectedLocation && selectedLocation.coordinates && (
          <Marker
            position={[
              selectedLocation.coordinates.lat,
              selectedLocation.coordinates.lng,
            ]}
            icon={divIcon({
              html: renderToStaticMarkup(
                <div className="relative flex items-center justify-center">
                  <div className="absolute w-16 h-16 bg-blue-400 rounded-full opacity-20 animate-pulse"></div>
                  <div className="relative w-4 h-4 bg-blue-500 rounded-full border-2 border-white shadow-lg"></div>
                </div>
              ),
              className: 'user-location-marker',
              iconSize: [16, 16],
              iconAnchor: [8, 8],
            })}
          >
            <Popup>
              <div className="text-center p-2">
                <p className="font-semibold text-blue-600">
                  {isRTL ? 'موقعك الحالي' : 'Votre position'}
                </p>
              </div>
            </Popup>
          </Marker>
        )}
      </MapContainer>

      {/* Full Screen Toggle */}
      <div className={`absolute top-4 right-4 z-[400]`}>
        <button
          onClick={() => {
            const element = document.getElementById('pharmacy-map-container');
            if (!document.fullscreenElement) {
              element.requestFullscreen().catch(err => {
                console.error(`Error attempting to enable full-screen mode: ${err.message} (${err.name})`);
              });
            } else {
              document.exitFullscreen();
            }
          }}
          className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm p-3 rounded-xl shadow-lg border border-emerald-100 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 transition-colors"
          title={document.fullscreenElement ? (isRTL ? 'خروج من وضع ملء الشاشة' : 'Quitter le plein écran') : (isRTL ? 'ملء الشاشة' : 'Plein écran')}
        >
          {document.fullscreenElement ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
        </button>
      </div>

      {/* Legend / Controls Overlay + Route Info */}
      <div className={`absolute bottom-4 ${isRTL ? 'right-4 items-start' : 'left-4 items-start'} z-[400] flex flex-col gap-2`}>
        {routeInfo && (
          <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm px-3 py-2 rounded-xl shadow-lg border border-blue-100 dark:border-blue-500/40 text-xs flex items-center justify-between gap-3">
            <div className={`flex flex-col ${isRTL ? 'text-right' : 'text-left'}`}>
              <span className="font-semibold text-blue-600 dark:text-blue-300">
                {isRTL ? 'المسار' : 'Itinéraire'}
              </span>
              <div className="flex items-center gap-3">
                <span className="text-gray-700 dark:text-gray-200">
                  📏 {isRTL ? 'المسافة:' : 'Distance:'}{' '}
                  <span className="font-bold">{routeInfo.distance} km</span>
                </span>
                <span className="text-gray-700 dark:text-gray-200">
                  ⏱️ {isRTL ? 'المدة:' : 'Durée:'}{' '}
                  <span className="font-bold">~{routeInfo.time} min</span>
                </span>
              </div>
            </div>
            <button
              onClick={() => {
                setSelectedPharmacyForRoute(null);
                setRouteInfo(null);
              }}
              className="text-gray-400 hover:text-red-500 dark:hover:text-red-400 font-bold text-base leading-none px-2"
            >
              ✕
            </button>
          </div>
        )}

        <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm p-3 rounded-xl shadow-lg border border-emerald-100 dark:border-gray-700 text-xs">
          <div className="flex items-center gap-3 mb-1">
            <span className="w-3 h-3 rounded-full bg-purple-500 border border-purple-600"></span>
            <span className="text-gray-700 dark:text-gray-300">
              {isRTL ? 'صيدلية مناوبة' : 'Pharmacie de garde'}
            </span>
          </div>
          <div className="flex items-center gap-3 mb-1">
            <span className="w-3 h-3 rounded-full bg-emerald-500 border border-emerald-600"></span>
            <span className="text-gray-700 dark:text-gray-300">
              {isRTL ? 'مفتوحة الآن' : 'Ouverte maintenant'}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="w-3 h-3 rounded-full bg-gray-400 border border-gray-500"></span>
            <span className="text-gray-700 dark:text-gray-300">
              {isRTL ? 'مغلقة' : 'Fermée'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PharmacyMap;
