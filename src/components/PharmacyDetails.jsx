import React, { useState, useEffect, useRef } from 'react';
import {
  ArrowLeft,
  Phone,
  MapPin,
  Clock,
  Navigation,
  Star,
  Mail,
  Globe,
  User,
  Calendar,
  Shield,
  CheckCircle,
  XCircle,
  Car,
  Armchair as Wheelchair,
  CreditCard,
  Truck,
  ChevronLeft,
  ChevronRight,
  X,
  ZoomIn,
  Heart
} from 'lucide-react';
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMapEvents
} from 'react-leaflet';
import L from 'leaflet';
import { divIcon } from 'leaflet';
import { createPortal } from 'react-dom';
import { renderToStaticMarkup } from 'react-dom/server';
import { useLanguage } from '../context/LanguageContext';
import 'leaflet/dist/leaflet.css';
import { useAuth } from '../context/AuthContext';
import { authApi } from '../utils/api';
import { toast } from 'react-hot-toast';


// Create custom pharmacy marker icon
const createPharmacyIcon = () => {
  const iconMarkup = renderToStaticMarkup(
    <div className="relative flex items-center justify-center w-10 h-10 rounded-full border-2 border-emerald-600 bg-emerald-100 shadow-lg">
      <svg className="w-6 h-6 text-emerald-600" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
      </svg>
    </div>
  );

  return divIcon({
    html: iconMarkup,
    className: 'pharmacy-detail-marker',
    iconSize: [40, 40],
    iconAnchor: [20, 40],
    popupAnchor: [0, -40],
  });
};

const PharmacyDetails = ({ pharmacy, onBack }) => {
  const { language, t, isRTL } = useLanguage();
  const { user, setUser, isAuthenticated } = useAuth();
  const [isSaving, setIsSaving] = useState(false);

  const isSaved = user?.savedPharmacies?.some(p =>
    (typeof p === 'object' ? p._id === (pharmacy.id || pharmacy._id) : p === (pharmacy.id || pharmacy._id))
  );

  const handleToggleSaved = async () => {
    if (!isAuthenticated) {
      toast.error(language === 'fr' ? 'Veuillez vous connecter pour sauvegarder' : 'يرجى تسجيل الدخول للحفظ');
      return;
    }

    try {
      setIsSaving(true);
      const id = pharmacy.id || pharmacy._id;
      const response = await authApi.toggleSavedPharmacy(id);

      if (response.data.success) {
        setUser({
          ...user,
          savedPharmacies: response.data.savedPharmacies
        });

        const isNowSaved = response.data.savedPharmacies.includes(id);
        toast.success(
          isNowSaved
            ? (language === 'fr' ? 'Pharmacie sauvegardée' : 'تم حفظ الصيدلية')
            : (language === 'fr' ? 'Pharmacie retirée' : 'تم إزالة الصيدلية')
        );
      }
    } catch (error) {
      toast.error(language === 'fr' ? 'Erreur lors de la sauvegarde' : 'خطأ في الحفظ');
    } finally {
      setIsSaving(false);
    }
  };
  const [selectedImageIndex, setSelectedImageIndex] = useState(null);

  const handlePrevImage = (e) => {
    e?.stopPropagation();
    setSelectedImageIndex((prev) =>
      prev === 0 ? pharmacy.images.length - 1 : prev - 1
    );
  };

  const handleNextImage = (e) => {
    e?.stopPropagation();
    setSelectedImageIndex((prev) =>
      prev === pharmacy.images.length - 1 ? 0 : prev + 1
    );
  };

  const handleCloseLightbox = () => {
    setSelectedImageIndex(null);
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (selectedImageIndex === null) return;

      if (e.key === 'Escape') handleCloseLightbox();
      if (e.key === 'ArrowLeft') isRTL ? handleNextImage() : handlePrevImage();
      if (e.key === 'ArrowRight') isRTL ? handlePrevImage() : handleNextImage();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedImageIndex, isRTL]);

  // Prevent body scroll when lightbox is open
  useEffect(() => {
    if (selectedImageIndex !== null) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [selectedImageIndex]);

  const getStatusInfo = () => {
    if (pharmacy.isOnDuty) {
      return {
        label: t.statusOnDuty,
        color: 'bg-purple-100 text-purple-800 border-purple-200',
        icon: Shield
      };
    }
    if (pharmacy.isOpen) {
      return {
        label: t.statusOpen,
        color: 'bg-emerald-100 text-emerald-800 border-emerald-200',
        icon: CheckCircle
      };
    }
    return {
      label: t.statusClosed,
      color: 'bg-red-100 text-red-800 border-red-200',
      icon: XCircle
    };
  };

  const statusInfo = getStatusInfo();
  const StatusIcon = statusInfo.icon;

  const getPriceRangeLabel = (range) => {
    switch (range) {
      case 'low':
        return t.priceRangeLow;
      case 'medium':
        return t.priceRangeMedium;
      case 'high':
        return t.priceRangeHigh;
      default:
        return range;
    }
  };

  const features = [
    { key: 'hasParking', label: t.parking, icon: Car, value: pharmacy.hasParking },
    { key: 'isAccessible', label: t.accessible, icon: Wheelchair, value: pharmacy.isAccessible },
    { key: 'acceptsInsurance', label: t.insurance, icon: CreditCard, value: pharmacy.acceptsInsurance },
    { key: 'hasDelivery', label: t.delivery, icon: Truck, value: pharmacy.hasDelivery }
  ];

  // Check if coordinates are valid
  const hasValidCoordinates = pharmacy.coordinates &&
    typeof pharmacy.coordinates.lat === 'number' &&
    typeof pharmacy.coordinates.lng === 'number' &&
    !isNaN(pharmacy.coordinates.lat) &&
    !isNaN(pharmacy.coordinates.lng);
  const markerRef = useRef(null);

  useEffect(() => {
    if (markerRef.current) {
      markerRef.current.openPopup();
    }
  }, [pharmacy.coordinates?.lat, pharmacy.coordinates?.lng]);


  return (
    <div
      dir={isRTL ? 'rtl' : 'ltr'}
      className={`min-h-screen bg-gray-50 dark:bg-gray-900 ${isRTL ? 'rtl text-right' : 'ltr text-left'}`}
    >
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-emerald-100 dark:border-gray-700">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <button
            onClick={onBack}
            className="flex items-center text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors mb-4 gap-2"
          >
            <ArrowLeft className={`h-5 w-5 ${isRTL ? 'rotate-180' : ''}`} />
            {t.backToList}
          </button>

          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                {language === 'ar' ? pharmacy.nameAr : pharmacy.name}
              </h1>

              <div className="flex items-center gap-4 text-gray-600 dark:text-gray-400 text-sm flex-wrap">
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 text-yellow-400 fill-current" />
                  <span className="font-medium">{pharmacy.rating}</span>
                  <span>({pharmacy.reviewCount} {t.reviews})</span>
                </div>

                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <span>{t.established} {pharmacy.established}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={handleToggleSaved}
                disabled={isSaving}
                className={`p-2.5 rounded-full transition-all border ${isSaved
                    ? 'bg-red-50 border-red-100 text-red-500 hover:bg-red-100'
                    : 'bg-gray-50 border-gray-200 text-gray-400 hover:bg-gray-100 hover:text-red-500 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-500 dark:hover:text-red-400'
                  }`}
                title={isSaved ? (language === 'fr' ? 'Retirer des favoris' : 'إزالة من المفضلة') : (language === 'fr' ? 'Ajouter aux favoris' : 'إضافة إلى المفضلة')}
              >
                <Heart className={`h-6 w-6 ${isSaved ? 'fill-current' : ''}`} />
              </button>

              <div className="flex items-center px-4 py-2 rounded-full border whitespace-nowrap" style={{
                backgroundColor: statusInfo.color.includes('purple') ? 'rgb(243 232 255)' :
                  statusInfo.color.includes('emerald') ? 'rgb(209 250 229)' :
                    'rgb(254 226 226)',
                color: statusInfo.color.includes('purple') ? 'rgb(107 33 168)' :
                  statusInfo.color.includes('emerald') ? 'rgb(6 95 70)' :
                    'rgb(153 27 27)',
                borderColor: statusInfo.color.includes('purple') ? 'rgb(233 213 255)' :
                  statusInfo.color.includes('emerald') ? 'rgb(167 243 208)' :
                    'rgb(254 202 202)'
              }}>
                <StatusIcon className="h-5 w-5" style={{ marginInlineEnd: '0.5rem' }} />
                <span className="font-medium">{statusInfo.label}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* PAGE LAYOUT */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* SIDEBAR – order 1 (left in FR, right in AR because of dir) */}

          <div className="space-y-6 lg:order-1">
            {/* Contact Info */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-emerald-100 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                {language === 'ar' ? 'معلومات الاتصال' : 'Contact'}
              </h3>

              <div className="space-y-4">
                {/* Phone */}

                {pharmacy.phone ? (
                  <a
                    href={`tel:${pharmacy.phone}`}
                    className="flex items-center gap-3 text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors group"
                  >
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center group-hover:bg-emerald-100 dark:group-hover:bg-emerald-900/50 transition-colors">
                      <Phone className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <span className="font-medium" dir="ltr">{pharmacy.phone}</span>
                  </a>
                ) : (
                  <div className="flex items-center gap-3 text-gray-500 dark:text-gray-400">
                    <div className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                      <Phone className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                    </div>
                    <span className="font-medium italic">
                      {language === 'ar' ? 'المعدرة لا نتوفر على رقم هده الصيدلية' : 'Sorry we don\'t have a phone number for this pharmacy'}
                    </span>
                  </div>
                )}

                {/* Email */}

                <a
                  href={`mailto:${pharmacy.email}`}
                  className="flex items-center gap-3 text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors group"
                >
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center group-hover:bg-emerald-100 dark:group-hover:bg-emerald-900/50 transition-colors">
                    <Mail className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <span className="font-medium break-all">{pharmacy.email}</span>
                </a>

                {/* Website */}
                {pharmacy.website && (
                  <a
                    href={pharmacy.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors group"
                  >
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center group-hover:bg-emerald-100 dark:group-hover:bg-emerald-900/50 transition-colors">
                      <Globe className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <span className="font-medium">{t.website}</span>
                  </a>
                )}

                {/* Address */}
                <div className="flex items-start gap-3 text-gray-700 dark:text-gray-300">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center flex-shrink-0">
                    <MapPin className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <span className="leading-relaxed pt-2">
                    {language === 'ar' ? pharmacy.addressAr : pharmacy.address}
                  </span>
                </div>

                {/* Hours */}
                <div className="flex items-center gap-3 text-gray-700 dark:text-gray-300">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center">
                    <Clock className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <span className="font-medium">
                    {language === 'ar' ? pharmacy.openingHoursAr : pharmacy.openingHours}
                  </span>
                </div>
              </div>

              <button
                onClick={() =>
                  window.open(
                    `https://maps.google.com/?q=${pharmacy.coordinates.lat},${pharmacy.coordinates.lng}`,
                    '_blank'
                  )
                }
                className="w-full mt-6 flex items-center justify-center gap-2 px-4 py-3 bg-emerald-500 text-white rounded-xl hover:bg-emerald-600 transition-colors font-medium shadow-lg shadow-emerald-500/25"
              >
                <Navigation className="h-5 w-5" />
                {t.directions}
              </button>

              {/* Leaflet Map Box */}
              {hasValidCoordinates ? (
                <div className="mt-4">
                  <div className="flex items-center gap-2 mb-3 px-2">
                    <MapPin className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                    <h4 className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                      {language === 'ar' ? 'الموقع على الخريطة' : t.locationOnMap || 'Location on Map'}
                    </h4>
                  </div>
                  <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl border border-emerald-100 dark:border-gray-700 overflow-hidden shadow-sm relative">
                    <div className="h-56 sm:h-64">
                      <MapContainer
                        center={[pharmacy.coordinates.lat, pharmacy.coordinates.lng]}
                        zoom={15}
                        scrollWheelZoom={true}
                        style={{ height: '100%', width: '100%' }}
                        className="z-0"
                      >
                        <TileLayer
                          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />
                        <Marker
                          position={[pharmacy.coordinates.lat, pharmacy.coordinates.lng]}
                          icon={createPharmacyIcon()}
                        >
                          <Popup>
                            <div className="text-center">
                              <p className="font-semibold text-gray-900">
                                {language === 'ar' ? pharmacy.nameAr : pharmacy.name}
                              </p>
                              <p className="text-xs text-gray-600 mt-1">
                                {language === 'ar' ? pharmacy.addressAr : pharmacy.address}
                              </p>
                            </div>
                          </Popup>
                        </Marker>
                      </MapContainer>
                    </div>
                    {/* Morocco Flag Badge */}
                    <div className="absolute bottom-0.5 right-0.5 bg-white  shadow-md px-1 py-1 flex items-center gap-1 border border-emerald-200">

                      <img src="https://upload.wikimedia.org/wikipedia/commons/2/2c/Flag_of_Morocco.svg" alt="" srcSet="" height={14} width={20} />
                      <span className="text-xs font-bold  text-emerald-700">Morocco</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="mt-4 p-3 rounded-xl bg-opacity-20 border border-gray-200 dark:border-gray-700">
                  <p className="text-xs text-gray-600 dark:text-gray-400 text-center">
                    {language === 'ar'
                      ? 'إحداثيات الموقع غير متوفرة'
                      : 'Location coordinates are not available.'}
                  </p>
                </div>
              )}
            </div>

            {/* Pharmacist Info */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-emerald-100 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                {t.pharmacist}
              </h3>
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-gradient-to-br from-emerald-100 to-emerald-50 dark:from-emerald-900/50 dark:to-emerald-800/30 rounded-2xl flex items-center justify-center flex-shrink-0">
                  <User className="h-7 w-7 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white text-base">
                    {language === 'ar' ? pharmacy.pharmacistAr : pharmacy.pharmacist}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-0.5">{t.pharmacist}</p>
                </div>
              </div>
            </div>

            {/* Price Range */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-emerald-100 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                {t.priceRange}
              </h3>
              <div className="flex">
                <span className="px-6 py-2.5 bg-gradient-to-r from-emerald-50 to-emerald-100 dark:from-emerald-900/30 dark:to-emerald-800/30 text-emerald-800 dark:text-emerald-300 rounded-full text-base font-semibold border border-emerald-200 dark:border-emerald-800/50">
                  {getPriceRangeLabel(pharmacy.priceRange)}
                </span>
              </div>
            </div>

            {/* Features */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-emerald-100 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                {t.features}
              </h3>
              <div className="space-y-3">
                {features.map((feature) => {
                  const Icon = feature.icon;
                  return (
                    <div
                      key={feature.key}
                      className={`flex items-center justify-between p-3 rounded-xl transition-colors ${feature.value
                        ? 'bg-emerald-50 dark:bg-emerald-900/20 hover:bg-emerald-100 dark:hover:bg-emerald-900/30'
                        : 'bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700'
                        }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${feature.value ? 'bg-emerald-100 dark:bg-emerald-900/50' : 'bg-gray-200 dark:bg-gray-600'
                          }`}>
                          <Icon className={`h-5 w-5 ${feature.value ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-400 dark:text-gray-300'}`} />
                        </div>
                        <span className={`font-medium ${feature.value ? 'text-gray-900 dark:text-gray-100' : 'text-gray-500 dark:text-gray-400'}`}>
                          {feature.label}
                        </span>
                      </div>
                      <div
                        className={`w-7 h-7 rounded-full flex items-center justify-center ${feature.value
                          ? 'bg-emerald-500 text-white'
                          : 'bg-gray-300 text-gray-500'
                          }`}
                      >
                        {feature.value ? (
                          <CheckCircle className="h-4 w-4" />
                        ) : (
                          <XCircle className="h-4 w-4" />
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* MAIN CONTENT – order 2 (right in FR, left in AR) */}
          <div className="lg:col-span-2 space-y-8 lg:order-2">
            {/* Image Gallery */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-emerald-100 dark:border-gray-700 overflow-hidden">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-6">
                {pharmacy.images.map((image, index) => (
                  <div
                    key={index}
                    className={`${index === 0 ? 'md:col-span-2' : ''} relative overflow-hidden rounded-xl cursor-pointer group`}
                    onClick={() => setSelectedImageIndex(index)}
                  >
                    <img
                      src={image}
                      alt={`${language === 'ar' ? pharmacy.nameAr : pharmacy.name
                        } - Image ${index + 1}`}
                      className={`w-full ${index === 0 ? 'h-64' : 'h-32'
                        } object-cover group-hover:scale-105 transition-transform duration-300`}
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                      <ZoomIn className="text-white h-8 w-8 drop-shadow-lg" />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Description */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-emerald-100 dark:border-gray-700 p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                {t.description}
              </h2>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                {language === 'ar'
                  ? pharmacy.descriptionAr
                  : pharmacy.description}
              </p>
            </div>

            {/* Services */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-emerald-100 dark:border-gray-700 p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-5">
                {t.services}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {(language === 'ar'
                  ? pharmacy.servicesAr
                  : pharmacy.services
                ).map((service, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-3 p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl hover:bg-emerald-100 dark:hover:bg-emerald-900/30 transition-colors"
                  >
                    <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center flex-shrink-0">
                      <CheckCircle className="h-5 w-5 text-white" />
                    </div>
                    <span className="text-sm text-emerald-900 dark:text-emerald-100 font-medium">
                      {service}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Specialties */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-emerald-100 dark:border-gray-700 p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-5">
                {t.specialties}
              </h2>
              <div className="flex flex-wrap gap-3">
                {(language === 'ar'
                  ? pharmacy.specialtiesAr
                  : pharmacy.specialties
                ).map((specialty, index) => (
                  <span
                    key={index}
                    className="px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-full text-sm font-semibold shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/40 hover:scale-105 transition-all"
                  >
                    {specialty}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Lightbox Modal */}
      {selectedImageIndex !== null && createPortal(
        <div
          className="fixed inset-0 z-[99999] bg-black/90 backdrop-blur-sm flex items-center justify-center w-screen h-screen"
          onClick={handleCloseLightbox}
        >
          <button
            onClick={handleCloseLightbox}
            className="absolute top-4 right-4 p-2 text-white/70 hover:text-white bg-white/10 hover:bg-white/20 rounded-full transition-colors z-[100000]"
          >
            <X className="h-6 w-6" />
          </button>

          <button
            onClick={handlePrevImage}
            className={`absolute left-4 p-3 text-white/70 hover:text-white bg-white/10 hover:bg-white/20 rounded-full transition-colors z-[100000] ${isRTL ? 'order-last' : ''}`}
          >
            <ChevronLeft className="h-8 w-8" />
          </button>

          <img
            src={pharmacy.images[selectedImageIndex]}
            alt={`Gallery image ${selectedImageIndex + 1}`}
            className="max-h-[85vh] max-w-[85vw] w-auto h-auto object-contain rounded-lg shadow-2xl select-none"
            onClick={(e) => e.stopPropagation()}
            draggable={false}
          />

          <button
            onClick={handleNextImage}
            className={`absolute right-4 p-3 text-white/70 hover:text-white bg-white/10 hover:bg-white/20 rounded-full transition-colors z-[100000] ${isRTL ? 'order-first' : ''}`}
          >
            <ChevronRight className="h-8 w-8" />
          </button>

          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-[100000]">
            {pharmacy.images.map((_, idx) => (
              <button
                key={idx}
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedImageIndex(idx);
                }}
                className={`w-2 h-2 rounded-full transition-all ${idx === selectedImageIndex ? 'bg-white w-4' : 'bg-white/50 hover:bg-white/80'
                  }`}
              />
            ))}
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default PharmacyDetails;