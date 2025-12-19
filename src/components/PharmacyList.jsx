import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  MapPin,
  Clock,
  Phone,
  Star,
  Navigation,
  ArrowRight,
  ArrowLeft,
  Shield,
  CheckCircle,
  XCircle,
  Eye,
  Heart
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { authApi } from '../utils/api';
import { toast } from 'react-hot-toast';

const PharmacyList = ({ pharmacies, onViewDetails, columns = 3 }) => {
  const { t, isRTL, language } = useLanguage();
  const { user, setUser, isAuthenticated } = useAuth();
  const [savingId, setSavingId] = useState(null);

  const isPharmacySaved = (id) => {
    if (!user || !user.savedPharmacies) return false;
    return user.savedPharmacies.some(p => (typeof p === 'object' ? p._id === id : p === id));
  };

  const handleToggleSaved = async (e, pharmacy) => {
    e.stopPropagation();
    if (!isAuthenticated) {
      toast.error(language === 'fr' ? 'Veuillez vous connecter pour sauvegarder' : 'يرجى تسجيل الدخول للحفظ');
      return;
    }

    try {
      setSavingId(pharmacy.id);
      const response = await authApi.toggleSavedPharmacy(pharmacy.id);

      if (response.data.success) {
        // Update user context with new saved list
        setUser({
          ...user,
          savedPharmacies: response.data.savedPharmacies
        });

        const isNowSaved = response.data.savedPharmacies.includes(pharmacy.id);
        toast.success(
          isNowSaved
            ? (language === 'fr' ? 'Pharmacie sauvegardée' : 'تم حفظ الصيدلية')
            : (language === 'fr' ? 'Pharmacie retirée' : 'تم إزالة الصيدلية')
        );
      }
    } catch (error) {
      toast.error(language === 'fr' ? 'Erreur lors de la sauvegarde' : 'خطأ في الحفظ');
      console.error(error);
    } finally {
      setSavingId(null);
    }
  };

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  if (!pharmacies || pharmacies.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center justify-center py-16 px-4 text-center bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm transition-colors duration-300"
      >
        <div className="bg-emerald-50 dark:bg-emerald-900/20 p-4 rounded-full mb-4">
          <MapPin className="w-8 h-8 text-emerald-500 dark:text-emerald-400 opacity-50" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          {isRTL ? 'لا توجد صيدليات' : 'No pharmacies found'}
        </h3>
        <p className="text-gray-500 dark:text-gray-400 max-w-md">
          {isRTL
            ? 'لم نتمكن من العثور على أي صيدليات تطابق معايير البحث الخاصة بك. حاول تعديل عوامل التصفية.'
            : 'We couldn\'t find any pharmacies matching your search criteria. Try adjusting your filters.'}
        </p>
      </motion.div>
    );
  }

  const getStatusConfig = (pharmacy) => {
    if (pharmacy.isOnDuty) {
      return {
        label: t.statusOnDuty,
        className: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300 border border-purple-200 dark:border-purple-800',
        icon: Shield
      };
    }
    if (pharmacy.isOpen) {
      return {
        label: t.statusOpen,
        className: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800',
        icon: CheckCircle
      };
    }
    return {
      label: t.statusClosed,
      className: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300 border border-red-200 dark:border-red-800',
      icon: XCircle
    };
  };

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className={`grid grid-cols-1 ${columns === 3 ? 'md:grid-cols-2 lg:grid-cols-3' : 'md:grid-cols-2'} gap-6`}
    >
      {pharmacies.map((pharmacy) => {
        const { label, className, icon: StatusIcon } = getStatusConfig(pharmacy);
        const isSaved = isPharmacySaved(pharmacy.id);
        const isSaving = savingId === pharmacy.id;

        return (
          <motion.div
            key={pharmacy.id}
            variants={item}
            className="group bg-white dark:bg-gray-800 rounded-[2rem] overflow-hidden shadow-lg shadow-gray-200/50 dark:shadow-none border border-gray-100 dark:border-gray-700 hover:border-emerald-500/30 dark:hover:border-emerald-500/30 transition-all duration-300 flex flex-col"
          >
            {/* Image Banner Section */}
            <div className="relative h-48 w-full bg-gray-100 dark:bg-gray-700">
              {pharmacy.images && pharmacy.images.length > 0 ? (
                <img
                  src={pharmacy.images[0]}
                  alt={pharmacy.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  <MapPin className="w-12 h-12 opacity-20" />
                </div>
              )}

              {/* Overlay Gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent dark:from-gray-900/60" />

              {/* Heart Button - positioned based on direction */}
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={(e) => handleToggleSaved(e, pharmacy)}
                disabled={isSaving}
                className={`absolute top-4 ${isRTL ? 'right-4' : 'left-4'} p-2.5 rounded-full backdrop-blur-md transition-all ${isSaved
                  ? 'bg-red-500 text-white shadow-lg shadow-red-500/30'
                  : 'bg-white/30 text-white hover:bg-white hover:text-red-500'
                  }`}
              >
                <Heart className={`w-5 h-5 ${isSaved ? 'fill-current' : ''}`} />
              </motion.button>

              {/* Status Badge - positioned based on direction */}
              <div className={`absolute top-4 ${isRTL ? 'left-4' : 'right-4'} px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 shadow-sm backdrop-blur-md ${className}`}>
                <StatusIcon className="w-3.5 h-3.5" />
                <span>{label}</span>
              </div>

              {/* Rating Badge (Bottom Left) */}
              <div className="absolute bottom-4 left-4 flex items-center gap-1.5 px-2.5 py-1 bg-white/90 dark:bg-gray-900/80 backdrop-blur-sm rounded-lg text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 shadow-sm">
                <Star className="w-3.5 h-3.5 text-yellow-500 fill-current" />
                <span className="font-bold text-sm">{pharmacy.rating}</span>
                <span className="text-xs text-gray-500 dark:text-gray-400">({pharmacy.reviewCount})</span>
              </div>
            </div>

            {/* Content Section */}
            <div className="p-5 flex flex-col flex-1">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3 line-clamp-1 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                {language === 'ar' ? pharmacy.nameAr : pharmacy.name}
              </h3>

              {/* Location & Distance */}
              <div className="flex items-center gap-3 mb-3 text-sm">
                <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
                  <MapPin className="w-4 h-4" />
                  <span className="text-gray-600 dark:text-gray-300 font-medium">{pharmacy.city || 'Fès'}</span>
                </div>
                {pharmacy.distance && (
                  <span className="bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 px-2 py-0.5 rounded text-xs font-medium border border-blue-100 dark:border-blue-800">
                    {pharmacy.distance.toFixed(1)} km
                  </span>
                )}
              </div>

              {/* Hours */}
              <div className="flex items-center gap-2 mb-5 text-sm text-gray-500 dark:text-gray-400 font-medium">
                <Clock className="w-4 h-4 text-emerald-500" />
                <span>
                  {language === 'ar' ? pharmacy.openingHoursAr : pharmacy.openingHours}
                </span>
              </div>

              {/* Tags / Services */}
              <div className="flex flex-wrap gap-2 mb-6">
                {(language === 'ar' ? pharmacy.servicesAr : pharmacy.services).slice(0, 2).map((service, idx) => (
                  <span key={idx} className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-800">
                    {service}
                  </span>
                ))}
                {(language === 'ar' ? pharmacy.servicesAr : pharmacy.services).length > 2 && (
                  <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400 border border-gray-200 dark:border-gray-700">
                    +{(language === 'ar' ? pharmacy.servicesAr : pharmacy.services).length - 2}
                  </span>
                )}
              </div>

              {/* Footer Buttons - Improved Layout */}
              <div className="space-y-2 mt-auto">
                {/* Primary Action: View Details */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => onViewDetails(pharmacy)}
                  className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-emerald-500 text-white hover:bg-emerald-600 dark:bg-emerald-600 dark:hover:bg-emerald-500 transition-all text-sm font-bold shadow-md shadow-emerald-500/20"
                >
                  <Eye className="w-4 h-4" />
                  <span>{t.viewDetails}</span>
                </motion.button>

                {/* Secondary Actions: Call & Directions */}
                <div className="grid grid-cols-2 gap-2">
                  {/* Call Button */}
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (pharmacy.phone) window.location.href = `tel:${pharmacy.phone}`;
                    }}
                    disabled={!pharmacy.phone}
                    className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl transition-all text-sm font-bold border ${pharmacy.phone
                      ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 border-blue-200 dark:border-blue-500/30 hover:bg-blue-100 dark:hover:bg-blue-900/50 cursor-pointer'
                      : 'bg-gray-100 text-gray-400 dark:bg-gray-800 dark:text-gray-500 border-gray-200 dark:border-gray-700 cursor-not-allowed opacity-60'
                      }`}
                  >
                    <Phone className="w-4 h-4" />
                    <span className="hidden sm:inline">{language === 'ar' ? 'اتصال' : 'Appeler'}</span>
                  </motion.button>

                  {/* Directions Button */}
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={(e) => {
                      e.stopPropagation();
                      window.open(`https://maps.google.com/?q=${pharmacy.coordinates.lat},${pharmacy.coordinates.lng}`, '_blank');
                    }}
                    className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-200 hover:bg-emerald-500 hover:text-white dark:hover:bg-emerald-600 transition-all border border-gray-200 dark:border-gray-600 text-sm font-bold"
                  >
                    <Navigation className="w-4 h-4" />
                    <span className="hidden sm:inline">{language === 'ar' ? 'اتجاهات' : 'Itinéraire'}</span>
                  </motion.button>
                </div>
              </div>
            </div>
          </motion.div>
        );
      })}
    </motion.div>
  );
};

export default PharmacyList;
