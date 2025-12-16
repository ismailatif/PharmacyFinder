import React from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import { Moon, Sun, Languages, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

const AuthLayout = ({ children, title, subtitle, backLink = '/' }) => {
  const { theme, toggleTheme } = useTheme();
  const { t, language, setLanguage, isRTL } = useLanguage();

  return (
    <div className="h-screen overflow-hidden flex bg-white dark:bg-gray-900 transition-colors" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Left Side - Form Section (Mobile: Full Width, Desktop: 50%) */}
      <div className="w-full lg:w-1/2 flex flex-col relative z-10 h-full">
        {/* Header Controls */}
        <div className="flex justify-between items-center p-6">
          <Link
            to={backLink}
            className="group flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-emerald-600 dark:text-gray-400 dark:hover:text-emerald-400 transition-colors"
          >
            <div className={`p-2 rounded-full bg-gray-100 dark:bg-gray-800 group-hover:bg-emerald-50 dark:group-hover:bg-emerald-900/20 transition-colors`}>
              <ArrowLeft className={`w-4 h-4 ${isRTL ? 'rotate-180' : ''}`} />
            </div>
            <span className="opacity-0 group-hover:opacity-100 transition-opacity -translate-x-2 group-hover:translate-x-0">
              {language === 'fr' ? 'Retour' : 'regarder'}
            </span>
          </Link>

          <div className="flex items-center gap-3">
            <button
              onClick={(e) => toggleTheme(e)}
              className="p-2.5 rounded-xl bg-gray-50/50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 transition-all border border-gray-200/50 dark:border-gray-700/50 backdrop-blur-sm"
              aria-label="Toggle Theme"
            >
              {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>
            <button
              onClick={() => setLanguage(language === 'fr' ? 'ar' : 'fr')}
              className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-gray-50/50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition-all border border-gray-200/50 dark:border-gray-700/50 backdrop-blur-sm text-sm font-semibold"
            >
              <Languages className="h-4 w-4" />
              <span>{language === 'fr' ? 'AR' : 'FR'}</span>
            </button>
          </div>
        </div>

        {/* Form Content */}
        <div className="flex-1 flex items-center justify-center p-4 sm:p-12 lg:p-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="w-full max-w-md space-y-8"
          >
            <div className="text-center space-y-2 mb-10">
              <motion.h2
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-4xl font-bold tracking-tight text-gray-900 dark:text-white"
              >
                {title}
              </motion.h2>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="text-gray-500 dark:text-gray-400"
              >
                {subtitle}
              </motion.p>
            </div>

            {children}

          </motion.div>
        </div>

        {/* Footer info (optional) */}
        <div className="p-2 text-center text-xs text-gray-400 dark:text-gray-600">
          © {new Date().getFullYear()} {t.footerCopyright}
        </div>
      </div>

      {/* Right Side - Hero Image (Desktop Only) */}
      <div className="hidden lg:block lg:w-1/2 relative overflow-hidden bg-gray-900">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-600/20 to-gray-900/90 z-10 mix-blend-multiply" />
        <div className="absolute inset-0 bg-emerald-900/20 z-10" />

        {/* Animated Background Blobs */}
        <div className="absolute inset-0 z-0 overflow-hidden">
          <div className="absolute top-1/4 -right-20 w-[600px] h-[600px] bg-emerald-500/30 rounded-full mix-blend-screen filter blur-3xl opacity-30 animate-blob"></div>
          <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-500/20 rounded-full mix-blend-screen filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>
        </div>

        <motion.div
          initial={{ scale: 1.1, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1.5 }}
          className="absolute inset-0 z-0"
        >
          <img
            src="/auth-hero.jpg"
            alt="Pharmacy"
            className="w-full h-full object-cover opacity-60"
          />
        </motion.div>

        <div className="absolute bottom-0 left-0 right-0 p-12 z-20 bg-gradient-to-t from-gray-900 via-gray-900/50 to-transparent">
          <motion.blockquote
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="max-w-xl"
          >
            <p className="text-2xl font-medium text-white mb-6 leading-relaxed">
              "{t.authHeroQuote}"
            </p>
            <footer className="text-emerald-200 font-medium">
              — {language === 'fr' ? 'L\'équipe PharmacyFinder' : 'فريق PharmacyFinder'}
            </footer>
          </motion.blockquote>
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
