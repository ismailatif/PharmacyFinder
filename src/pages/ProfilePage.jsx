import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import { authApi } from '../utils/api';
import { User, Lock, Settings, Heart, Calendar, Eye, EyeOff, ChevronLeft, ChevronRight } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { motion } from 'framer-motion';
import Header from '../components/Header';
import ProfileSkeleton from '../components/ProfileSkeleton';
import PharmacyList from '../components/PharmacyList';

const ProfilePage = () => {
  const { user, setUser } = useAuth();
  const navigate = useNavigate();
  const { t, language, setLanguage, isRTL } = useLanguage();
  const { theme, setTheme, toggleTheme } = useTheme();
  const [activeTab, setActiveTab] = useState('personal');
  const [loading, setLoading] = useState(false);

  // Personal Info State
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');

  // Password State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Preferences State
  const [preferences, setPreferences] = useState({
    language: 'fr',
    theme: 'system',
    notifications: true,
    searchRadius: 5000
  });

  // Favorites State
  const [savedPharmacies, setSavedPharmacies] = useState([]);
  const [loadingFavorites, setLoadingFavorites] = useState(false);
  const [pagination, setPagination] = useState({ current: 1, pages: 1, total: 0 });

  useEffect(() => {
    if (user) {
      setName(user.name);
      setEmail(user.email);
    }
    loadPreferences();
  }, [user]);

  const loadPreferences = async () => {
    try {
      const response = await authApi.getPreferences();
      if (response.data.success) {
        const prefs = response.data.preferences;
        setPreferences(prefs);

        // Apply theme from database
        if (prefs.theme && prefs.theme !== theme) {
          setTheme(prefs.theme);
        }

        // Apply language from database
        if (prefs.language && prefs.language !== language) {
          setLanguage(prefs.language);
        }
      }
    } catch (error) {
      console.error('Error loading preferences:', error);
    }
  };

  const fetchSavedPharmacies = async (page = 1) => {
    try {
      setLoadingFavorites(true);
      const response = await authApi.getSavedPharmacies(page, 2);
      if (response.data.success) {
        setSavedPharmacies(response.data.savedPharmacies);
        if (response.data.pagination) {
          setPagination(response.data.pagination);
        }
      }
    } catch (error) {
      console.error('Error loading saved pharmacies:', error);
      toast.error(language === 'fr' ? 'Erreur lors du chargement des favoris' : 'خطأ في تحميل المفضلة');
    } finally {
      setLoadingFavorites(false);
    }
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.pages) {
      fetchSavedPharmacies(newPage);
      // smooth scroll to top of list if needed
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  useEffect(() => {
    if (activeTab === 'favorites') {
      fetchSavedPharmacies();
    }
  }, [activeTab]);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();

    if (!name || !email) {
      toast.error(language === 'fr' ? 'Veuillez remplir tous les champs' : 'يرجى ملء جميع الحقول');
      return;
    }

    try {
      setLoading(true);
      const response = await authApi.updateProfile(name, email);
      if (response.data.success) {
        setUser(response.data.user);
        toast.success(language === 'fr' ? 'Profil mis à jour avec succès' : 'تم تحديث الملف الشخصي بنجاح');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Erreur lors de la mise à jour du profil');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();

    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error(language === 'fr' ? 'Veuillez remplir tous les champs' : 'يرجى ملء جميع الحقول');
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error(language === 'fr' ? 'Les mots de passe ne correspondent pas' : 'كلمات المرور غير متطابقة');
      return;
    }

    if (newPassword.length < 6) {
      toast.error(language === 'fr' ? 'Le mot de passe doit contenir au moins 6 caractères' : 'كلمة المرور يجب أن لا تقل عن 6 أحرف');
      return;
    }

    // Frontend validation for password strength
    if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(newPassword)) {
      toast.error(
        language === 'fr'
          ? 'Le mot de passe doit contenir au moins une majuscule, une minuscule et un chiffre'
          : 'يجب أن تحتوي كلمة المرور على حرف كبير وحرف صغير ورقم واحد على الأقل'
      );
      return;
    }

    try {
      setLoading(true);
      const response = await authApi.updatePassword(currentPassword, newPassword);
      if (response.data.success) {
        toast.success(language === 'fr' ? 'Mot de passe mis à jour avec succès' : 'تم تحديث كلمة المرور بنجاح');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      }
    } catch (error) {
      // Display backend validation errors
      if (error.response?.data?.errors && Array.isArray(error.response.data.errors)) {
        error.response.data.errors.forEach(err => {
          toast.error(err.message || err.msg);
        });
      } else {
        toast.error(error.response?.data?.message || 'Erreur lors de la mise à jour du mot de passe');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePreferences = async () => {
    try {
      setLoading(true);
      const response = await authApi.updatePreferences(preferences);
      if (response.data.success) {
        toast.success(language === 'fr' ? 'Préférences mises à jour' : 'تم تحديث التفضيلات');

        // Update language context
        if (preferences.language !== language) {
          setLanguage(preferences.language);
        }

        // Update theme context
        if (preferences.theme !== theme) {
          setTheme(preferences.theme);
        }
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Erreur lors de la mise à jour des préférences');
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'personal', label: language === 'fr' ? 'Informations' : 'المعلومات', icon: User },
    { id: 'favorites', label: language === 'fr' ? 'Favoris' : 'المفضلة', icon: Heart },
    { id: 'security', label: language === 'fr' ? 'Sécurité' : 'الأمان', icon: Lock },
    { id: 'preferences', label: language === 'fr' ? 'Préférences' : 'التفضيلات', icon: Settings },
  ];

  const inputClasses = `
    block w-full py-3.5 px-4
    bg-gray-50 dark:bg-gray-800/50 
    border border-gray-200 dark:border-gray-700 
    rounded-xl 
    text-gray-900 dark:text-white 
    placeholder-gray-400 dark:placeholder-gray-500
    focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 
    transition-all duration-200
  `;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors" dir={isRTL ? 'rtl' : 'ltr'}>
      <Header />

      {loading && !user ? (
        <ProfileSkeleton />
      ) : (
        <div className="max-w-4xl mx-auto px-4 py-4 mt-4">
          {/* Profile Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 mb-6"
          >
            <div className="flex items-center gap-6">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-emerald-600 to-emerald-400 flex items-center justify-center text-white text-3xl font-bold">
                {user?.name?.charAt(0).toUpperCase()}
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{user?.name}</h1>
                <p className="text-gray-600 dark:text-gray-400">{user?.email}</p>
                <div className="flex items-center gap-2 mt-2 text-sm text-gray-500 dark:text-gray-500">
                  <Calendar className="w-4 h-4" />
                  <span>{language === 'fr' ? 'Membre depuis' : 'عضو منذ'} {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : new Date().toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Tabs */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden">
            <div className="border-b border-gray-200 dark:border-gray-700">
              <div className="flex">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex-1 flex items-center justify-center gap-2 px-6 py-4 font-semibold transition-colors ${activeTab === tab.id
                      ? 'text-emerald-600 dark:text-emerald-400 border-b-2 border-emerald-600 dark:border-emerald-400'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                      }`}
                  >
                    <tab.icon className="w-5 h-5" />
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="p-8">
              {/* Personal Info Tab */}
              {activeTab === 'personal' && (
                <motion.form
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  onSubmit={handleUpdateProfile}
                  className="space-y-6"
                >
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      {language === 'fr' ? 'Nom' : 'الاسم'}
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className={inputClasses}
                      placeholder={language === 'fr' ? 'Votre nom' : 'اسمك'}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      {language === 'fr' ? 'Email' : 'البريد الإلكتروني'}
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className={inputClasses}
                      placeholder={language === 'fr' ? 'Votre email' : 'بريدك الإلكتروني'}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3.5 px-4 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-bold rounded-xl transition-all transform active:scale-95 disabled:opacity-70"
                  >
                    {loading ? (language === 'fr' ? 'Enregistrement...' : 'جاري الحفظ...') : (language === 'fr' ? 'Enregistrer' : 'حفظ')}
                  </button>
                </motion.form>
              )}

              {/* Favorites Tab */}
              {activeTab === 'favorites' && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-6"
                >
                  {loadingFavorites ? (
                    <div className="flex justify-center py-12">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
                    </div>
                  ) : savedPharmacies.length > 0 ? (
                    <>
                      <PharmacyList
                        pharmacies={savedPharmacies}
                        onViewDetails={(pharmacy) => navigate(`/pharmacy/${pharmacy._id || pharmacy.id}`)}
                        columns={2}
                      />

                      {/* Pagination Controls */}
                      {pagination.pages > 1 && (
                        <div className="flex justify-center items-center gap-4 mt-8">
                          <button
                            onClick={() => handlePageChange(pagination.current - 1)}
                            disabled={pagination.current === 1}
                            className="p-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-emerald-50 dark:hover:bg-emerald-900/20 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
                          >
                            <ChevronLeft className="w-5 h-5" />
                          </button>

                          <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                            {pagination.current} / {pagination.pages}
                          </span>

                          <button
                            onClick={() => handlePageChange(pagination.current + 1)}
                            disabled={pagination.current === pagination.pages}
                            className="p-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-emerald-50 dark:hover:bg-emerald-900/20 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
                          >
                            <ChevronRight className="w-5 h-5" />
                          </button>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                      <Heart className="mx-auto h-12 w-12 text-gray-300 dark:text-gray-600 mb-4" />
                      <p className="text-lg font-medium">{language === 'fr' ? 'Aucun favori pour le moment' : 'لا توجد مفضلات حتى الآن'}</p>
                      <p>{language === 'fr' ? 'Les pharmacies que vous ajoutez aux favoris apparaîtront ici' : 'الصيدليات التي تضيفها إلى المفضلة ستظهر هنا'}</p>
                    </div>
                  )}
                </motion.div>
              )}

              {/* Security Tab */}
              {activeTab === 'security' && (
                <motion.form
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  onSubmit={handleUpdatePassword}
                  className="space-y-6"
                >
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      {language === 'fr' ? 'Mot de passe actuel' : 'كلمة المرور الحالية'}
                    </label>
                    <div className="relative">
                      <input
                        type={showCurrentPassword ? 'text' : 'password'}
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        className={`${inputClasses} ${isRTL ? 'pl-12' : 'pr-12'}`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                        className={`absolute inset-y-0 ${isRTL ? 'left-0 pl-4' : 'right-0 pr-4'} flex items-center text-gray-400 hover:text-emerald-500 transition-colors`}
                      >
                        {showCurrentPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      {language === 'fr' ? 'Nouveau mot de passe' : 'كلمة المرور الجديدة'}
                    </label>
                    <div className="relative">
                      <input
                        type={showNewPassword ? 'text' : 'password'}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className={`${inputClasses} ${isRTL ? 'pl-12' : 'pr-12'}`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className={`absolute inset-y-0 ${isRTL ? 'left-0 pl-4' : 'right-0 pr-4'} flex items-center text-gray-400 hover:text-emerald-500 transition-colors`}
                      >
                        {showNewPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      {language === 'fr' ? 'Confirmer le mot de passe' : 'تأكيد كلمة المرور'}
                    </label>
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className={`${inputClasses} ${isRTL ? 'pl-12' : 'pr-12'}`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className={`absolute inset-y-0 ${isRTL ? 'left-0 pl-4' : 'right-0 pr-4'} flex items-center text-gray-400 hover:text-emerald-500 transition-colors`}
                      >
                        {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3.5 px-4 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-bold rounded-xl transition-all transform active:scale-95 disabled:opacity-70"
                  >
                    {loading ? (language === 'fr' ? 'Mise à jour...' : 'جاري التحديث...') : (language === 'fr' ? 'Mettre à jour' : 'تحديث')}
                  </button>
                </motion.form>
              )}

              {/* Preferences Tab */}
              {activeTab === 'preferences' && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-8"
                >
                  {/* Language Selector */}
                  <motion.div
                    whileHover={{ scale: 1.01 }}
                    className="relative group"
                  >
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-200 mb-3 flex items-center gap-2">
                      <svg className="w-5 h-5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
                      </svg>
                      {language === 'fr' ? 'Langue' : 'اللغة'}
                    </label>
                    <div className="relative">
                      <select
                        value={preferences.language}
                        onChange={(e) => setPreferences({ ...preferences, language: e.target.value })}
                        className={`w-full px-5 py-4 bg-gradient-to-r from-emerald-50/50 to-cyan-50/50 dark:from-emerald-900/20 dark:to-cyan-900/20 border-2 border-emerald-200/50 dark:border-emerald-700/50 rounded-2xl text-gray-900 dark:text-white font-semibold appearance-none cursor-pointer transition-all duration-300 hover:border-emerald-400 dark:hover:border-emerald-500 focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 backdrop-blur-sm ${isRTL ? 'text-right pr-5 pl-12' : 'text-left pl-5 pr-12'}`}
                      >
                        <option value="fr">🇫🇷 Français</option>
                        <option value="ar">🇸🇦 العربية</option>
                      </select>
                      <div className={`absolute inset-y-0 ${isRTL ? 'left-4' : 'right-4'} flex items-center pointer-events-none`}>
                        <svg className="w-5 h-5 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>
                  </motion.div>

                  {/* Theme Selector - Card Based */}
                  <motion.div className="space-y-3">
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-200 flex items-center gap-2">
                      <svg className="w-5 h-5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                      </svg>
                      {language === 'fr' ? 'Thème' : 'المظهر'}
                    </label>
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { value: 'light', icon: '☀️', label: language === 'fr' ? 'Clair' : 'فاتح', gradient: 'from-yellow-100 to-orange-100 dark:from-yellow-900/30 dark:to-orange-900/30' },
                        { value: 'dark', icon: '🌙', label: language === 'fr' ? 'Sombre' : 'داكن', gradient: 'from-indigo-100 to-purple-100 dark:from-indigo-900/30 dark:to-purple-900/30' },
                        { value: 'system', icon: '💻', label: language === 'fr' ? 'Système' : 'النظام', gradient: 'from-emerald-100 to-teal-100 dark:from-emerald-900/30 dark:to-teal-900/30' }
                      ].map((theme) => (
                        <motion.button
                          key={theme.value}
                          type="button"
                          whileHover={{ scale: 1.05, y: -2 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => setPreferences({ ...preferences, theme: theme.value })}
                          className={`relative p-4 rounded-2xl border-2 transition-all duration-300 ${preferences.theme === theme.value
                            ? 'border-emerald-500 bg-gradient-to-br ' + theme.gradient + ' shadow-lg shadow-emerald-500/25'
                            : 'border-gray-200 dark:border-gray-700 hover:border-emerald-300 dark:hover:border-emerald-600 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm'
                            }`}
                        >
                          <div className="text-3xl mb-2">{theme.icon}</div>
                          <div className={`text-xs font-bold ${preferences.theme === theme.value
                            ? 'text-emerald-700 dark:text-emerald-300'
                            : 'text-gray-600 dark:text-gray-400'
                            }`}>
                            {theme.label}
                          </div>
                          {preferences.theme === theme.value && (
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              className={`absolute -top-2 ${isRTL ? '-left-2' : '-right-2'} w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center shadow-lg`}
                            >
                              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                              </svg>
                            </motion.div>
                          )}
                        </motion.button>
                      ))}
                    </div>
                  </motion.div>

                  {/* Notifications Toggle - Custom Switch */}
                  <motion.div
                    whileHover={{ scale: 1.01 }}
                    className="p-5 bg-gradient-to-r from-emerald-50/50 to-cyan-50/50 dark:from-emerald-900/20 dark:to-cyan-900/20 border-2 border-emerald-200/50 dark:border-emerald-700/50 rounded-2xl backdrop-blur-sm"
                  >
                    <label className="flex items-center justify-between cursor-pointer group">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-emerald-100 dark:bg-emerald-900/40 rounded-xl">
                          <svg className="w-5 h-5 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                          </svg>
                        </div>
                        <div className={isRTL ? 'text-right' : 'text-left'}>
                          <span className="text-sm font-bold text-gray-700 dark:text-gray-200 block">
                            {language === 'fr' ? 'Notifications' : 'الإشعارات'}
                          </span>
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {language === 'fr' ? 'Recevoir des alertes' : 'تلقي التنبيهات'}
                          </span>
                        </div>
                      </div>
                      <div className="relative">
                        <input
                          type="checkbox"
                          checked={preferences.notifications}
                          onChange={(e) => setPreferences({ ...preferences, notifications: e.target.checked })}
                          className="sr-only peer"
                        />
                        <div className={`w-14 h-7 rounded-full transition-all duration-300 ${preferences.notifications
                          ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 shadow-lg shadow-emerald-500/50'
                          : 'bg-gray-300 dark:bg-gray-600'
                          }`}>
                          <motion.div
                            animate={{ x: preferences.notifications ? 28 : 2 }}
                            transition={{ type: "spring", stiffness: 500, damping: 30 }}
                            className="absolute top-1 w-5 h-5 bg-white rounded-full shadow-md flex items-center justify-center"
                          >
                            {preferences.notifications && (
                              <svg className="w-3 h-3 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                              </svg>
                            )}
                          </motion.div>
                        </div>
                      </div>
                    </label>
                  </motion.div>

                  {/* Search Radius - Futuristic Slider */}
                  <motion.div className="space-y-4">
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-200 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <svg className="w-5 h-5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        {language === 'fr' ? 'Rayon de recherche' : 'نطاق البحث'}
                      </div>
                      <motion.span
                        key={preferences.searchRadius}
                        initial={{ scale: 1.2, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="px-3 py-1 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white text-sm font-bold rounded-full shadow-lg"
                      >
                        {preferences.searchRadius / 1000} km
                      </motion.span>
                    </label>
                    <div className="relative pt-2 pb-1">
                      <input
                        type="range"
                        min="1000"
                        max="50000"
                        step="1000"
                        value={preferences.searchRadius}
                        onChange={(e) => setPreferences({ ...preferences, searchRadius: parseInt(e.target.value) })}
                        dir={isRTL ? 'rtl' : 'ltr'}
                        className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-6 [&::-webkit-slider-thumb]:h-6 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-gradient-to-r [&::-webkit-slider-thumb]:from-emerald-500 [&::-webkit-slider-thumb]:to-cyan-500 [&::-webkit-slider-thumb]:shadow-lg [&::-webkit-slider-thumb]:shadow-emerald-500/50 [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:transition-transform [&::-webkit-slider-thumb]:hover:scale-110 [&::-moz-range-thumb]:w-6 [&::-moz-range-thumb]:h-6 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-gradient-to-r [&::-moz-range-thumb]:from-emerald-500 [&::-moz-range-thumb]:to-cyan-500 [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:shadow-lg [&::-moz-range-thumb]:shadow-emerald-500/50 [&::-moz-range-thumb]:cursor-pointer"
                        style={{
                          background: `linear-gradient(${isRTL ? 'to left' : 'to right'}, rgb(16 185 129) 0%, rgb(6 182 212) ${((preferences.searchRadius - 1000) / 49000) * 100}%, rgb(229 231 235) ${((preferences.searchRadius - 1000) / 49000) * 100}%, rgb(229 231 235) 100%)`
                        }}
                      />
                      <div className="flex justify-between mt-2 px-1">
                        <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">{isRTL ? '50 km' : '1 km'}</span>
                        <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">{isRTL ? '1 km' : '50 km'}</span>
                      </div>
                    </div>
                  </motion.div>

                  {/* Save Button */}
                  <motion.button
                    whileHover={{ scale: 1.02, boxShadow: "0 20px 40px -10px rgba(16, 185, 129, 0.4)" }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleUpdatePreferences}
                    disabled={loading}
                    className="relative w-full py-4 px-6 bg-gradient-to-r from-emerald-600 via-emerald-500 to-cyan-500 hover:from-emerald-500 hover:via-emerald-400 hover:to-cyan-400 text-white font-bold rounded-2xl transition-all overflow-hidden disabled:opacity-70 shadow-xl shadow-emerald-500/30 group"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-700"></div>
                    <div className="relative flex items-center justify-center gap-2">
                      {loading ? (
                        <>
                          <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          {language === 'fr' ? 'Enregistrement...' : 'جاري الحفظ...'}
                        </>
                      ) : (
                        <>
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                          </svg>
                          {language === 'fr' ? 'Enregistrer les préférences' : 'حفظ التفضيلات'}
                        </>
                      )}
                    </div>
                  </motion.button>
                </motion.div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;
