import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Languages, Moon, Sun, LogOut, User as UserIcon, LogIn, ChevronDown, ScanLine } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import Logo from './Logo';
import { motion, AnimatePresence } from 'framer-motion';

const Header = () => {
  const { language, setLanguage, t, isRTL } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const { user, isAuthenticated, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <header
      dir={isRTL ? 'rtl' : 'ltr'}
      className="sticky top-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md shadow-md border-b border-emerald-100 dark:border-gray-800 transition-all duration-300"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo + Title */}
          <Link
            to="/"
            className={`flex items-center gap-3 ${isRTL ? 'ml-auto' : ''
              } hover:opacity-80 transition-opacity`}
          >
            <Logo className="h-16 w-16" />

            <div className={isRTL ? 'text-right' : 'text-left'}>
              <h1 className="text-xl font-bold text-emerald-800 dark:text-emerald-400">
                {t.title}
              </h1>
              <p className="text-sm text-emerald-600 dark:text-emerald-500">
                {isRTL
                  ? 'اعثر على أقرب صيدلية'
                  : 'Trouvez la pharmacie la plus proche'}
              </p>
            </div>
          </Link>

          <div className="flex items-center gap-3">
            {/* Theme Toggle */}
            <button
              onClick={(e) => toggleTheme(e)}
              className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              aria-label="Toggle Theme"
            >
              {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>

            {/* Language Switcher */}
            <button
              onClick={() => setLanguage(language === 'fr' ? 'ar' : 'fr')}
              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition-colors text-sm font-medium"
            >
              <Languages className="h-4 w-4" />
              <span className="hidden sm:inline">{language === 'fr' ? 'AR' : 'FR'}</span>
            </button>

            {/* Auth Buttons */}
            {isAuthenticated && user ? (
              <div className="relative pl-3 ml-3 border-l border-gray-200 dark:border-gray-700" ref={dropdownRef}>
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center text-white font-bold text-sm shadow-sm ring-2 ring-white dark:ring-gray-900">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="hidden md:flex flex-col items-start">
                    <span className="text-sm font-semibold text-gray-700 dark:text-gray-200 leading-none">
                      {user.name.split(' ')[0]}
                    </span>
                  </div>
                  <ChevronDown className={`h-4 w-4 text-gray-500 transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                <AnimatePresence>
                  {dropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                      className={`absolute top-full mt-2 w-48 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-100 dark:border-gray-700 py-1 overflow-hidden z-50 ${isRTL ? 'left-0 origin-top-left' : 'right-0 origin-top-right'
                        }`}
                    >
                      <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700">
                        <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                          {user.name}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                          {user.email}
                        </p>
                      </div>

                      <div className="py-1">
                        <Link
                          to="/profile"
                          onClick={() => setDropdownOpen(false)}
                          className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-emerald-50 dark:hover:bg-emerald-900/10 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
                        >
                          <UserIcon className="h-4 w-4" />
                          {language === 'fr' ? 'Profil' : 'الملف الشخصي'}
                        </Link>

                        <Link
                          to="/scanner"
                          onClick={() => setDropdownOpen(false)}
                          className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-emerald-50 dark:hover:bg-emerald-900/10 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
                        >
                          <ScanLine className="h-4 w-4" />
                          {language === 'fr' ? 'Scanner' : 'الماسح الضوئي'}
                        </Link>

                        <button
                          onClick={() => {
                            logout();
                            setDropdownOpen(false);
                          }}
                          className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors"
                        >
                          <LogOut className="h-4 w-4" />
                          {language === 'fr' ? 'Déconnexion' : 'خروج'}
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <div className="flex items-center gap-2 pl-3 ml-3 border-l border-gray-200 dark:border-gray-700">
                <Link
                  to="/login"
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white transition-colors text-sm font-medium shadow-md shadow-emerald-500/20"
                >
                  <LogIn className="h-4 w-4" />
                  <span className="hidden sm:inline">{language === 'fr' ? 'Connexion' : 'دخول'}</span>
                </Link>
              </div>
            )}
          </div>

        </div>
      </div>
    </header>
  );
};

export default Header;
