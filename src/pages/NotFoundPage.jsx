import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { FileQuestion, Home, ArrowLeft, Search } from 'lucide-react';
import { motion } from 'framer-motion';

const NotFoundPage = () => {
  const { language, isRTL } = useLanguage();

  const content = {
    fr: {
      title: 'Page Non Trouvée',
      subtitle: "Oups ! La page que vous recherchez n'existe pas",
      description: "Il semble que vous ayez suivi un lien incorrect ou que la page ait été déplacée.",
      backHome: 'Retour à l\'accueil',
      searchPharmacies: 'Rechercher des pharmacies',
      errorCode: '404'
    },
    ar: {
      title: 'الصفحة غير موجودة',
      subtitle: 'عذرًا! الصفحة التي تبحث عنها غير موجودة',
      description: 'يبدو أنك اتبعت رابطًا خاطئًا أو تم نقل الصفحة.',
      backHome: 'العودة إلى الصفحة الرئيسية',
      searchPharmacies: 'البحث عن الصيدليات',
      errorCode: '404'
    }
  };

  const t = content[language];

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4" dir={isRTL ? 'rtl' : 'ltr'}>
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full text-center"
      >
        {/* Icon */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          className="mx-auto w-24 h-24 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mb-8"
        >
          <FileQuestion className="w-12 h-12 text-emerald-600 dark:text-emerald-400" />
        </motion.div>

        {/* Error Code */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mb-4"
        >
          <span className="text-8xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-emerald-400">
            {t.errorCode}
          </span>
        </motion.div>

        {/* Title */}
        <motion.h1
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-3xl font-bold text-gray-900 dark:text-white mb-4"
        >
          {t.title}
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-lg text-gray-600 dark:text-gray-400 mb-4"
        >
          {t.subtitle}
        </motion.p>

        {/* Description */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-sm text-gray-500 dark:text-gray-500 mb-8"
        >
          {t.description}
        </motion.p>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <Link
            to="/"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-semibold rounded-xl shadow-lg shadow-emerald-500/30 transition-all transform hover:scale-105"
          >
            {isRTL ? <ArrowLeft className="w-5 h-5 rotate-180" /> : <Home className="w-5 h-5" />}
            {t.backHome}
          </Link>
          
          <Link
            to="/search"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 font-semibold rounded-xl border-2 border-gray-200 dark:border-gray-700 transition-all transform hover:scale-105"
          >
            <Search className="w-5 h-5" />
            {t.searchPharmacies}
          </Link>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default NotFoundPage;
