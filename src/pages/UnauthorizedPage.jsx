import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { ShieldOff, Home, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';

const UnauthorizedPage = () => {
  const { language, isRTL } = useLanguage();

  const content = {
    fr: {
      title: 'Accès Non Autorisé',
      subtitle: "Vous n'avez pas la permission d'accéder à cette page",
      description: "Cette page est réservée aux administrateurs. Si vous pensez que c'est une erreur, veuillez contacter le support.",
      backHome: 'Retour à l\'accueil',
      errorCode: '403'
    },
    ar: {
      title: 'غير مصرح بالدخول',
      subtitle: 'ليس لديك إذن للوصول إلى هذه الصفحة',
      description: 'هذه الصفحة مخصصة للمسؤولين. إذا كنت تعتقد أن هذا خطأ، يرجى الاتصال بالدعم.',
      backHome: 'العودة إلى الصفحة الرئيسية',
      errorCode: '403'
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
          className="mx-auto w-24 h-24 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mb-8"
        >
          <ShieldOff className="w-12 h-12 text-red-600 dark:text-red-400" />
        </motion.div>

        {/* Error Code */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mb-4"
        >
          <span className="text-8xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-red-400">
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

        {/* Back Home Button */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-semibold rounded-xl shadow-lg shadow-emerald-500/30 transition-all transform hover:scale-105"
          >
            {isRTL ? <ArrowLeft className="w-5 h-5 rotate-180" /> : <Home className="w-5 h-5" />}
            {t.backHome}
          </Link>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default UnauthorizedPage;
