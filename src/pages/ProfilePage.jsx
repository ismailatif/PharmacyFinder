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
      const response = await authApi.getSavedPharmacies(page, 6);
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
      toast.error(error.response?.data?.message || 'Error updating profile');
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
        toast.error(error.response?.data?.message || 'Error updating password');
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
      toast.error(error.response?.data?.message || 'Error updating preferences');
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
                  className="space-y-6"
                >
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      {language === 'fr' ? 'Langue' : 'اللغة'}
                    </label>
                    <select
                      value={preferences.language}
                      onChange={(e) => setPreferences({ ...preferences, language: e.target.value })}
                      className={inputClasses}
                    >
                      <option value="fr">Français</option>
                      <option value="ar">العربية</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      {language === 'fr' ? 'Thème' : 'المظهر'}
                    </label>
                    <select
                      value={preferences.theme}
                      onChange={(e) => setPreferences({ ...preferences, theme: e.target.value })}
                      className={inputClasses}
                    >
                      <option value="light">{language === 'fr' ? 'Clair' : 'فاتح'}</option>
                      <option value="dark">{language === 'fr' ? 'Sombre' : 'داكن'}</option>
                      <option value="system">{language === 'fr' ? 'Système' : 'النظام'}</option>
                    </select>
                  </div>

                  <div>
                    <label className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                        {language === 'fr' ? 'Notifications' : 'الإشعارات'}
                      </span>
                      <input
                        type="checkbox"
                        checked={preferences.notifications}
                        onChange={(e) => setPreferences({ ...preferences, notifications: e.target.checked })}
                        className="w-5 h-5 text-emerald-600 rounded focus:ring-emerald-500"
                      />
                    </label>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      {language === 'fr' ? 'Rayon de recherche' : 'نطاق البحث'} ({preferences.searchRadius / 1000} km)
                    </label>
                    <input
                      type="range"
                      min="1000"
                      max="50000"
                      step="1000"
                      value={preferences.searchRadius}
                      onChange={(e) => setPreferences({ ...preferences, searchRadius: parseInt(e.target.value) })}
                      className="w-full"
                    />
                  </div>

                  <button
                    onClick={handleUpdatePreferences}
                    disabled={loading}
                    className="w-full py-3.5 px-4 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-bold rounded-xl transition-all transform active:scale-95 disabled:opacity-70"
                  >
                    {loading ? (language === 'fr' ? 'Enregistrement...' : 'جاري الحفظ...') : (language === 'fr' ? 'Enregistrer' : 'حفظ')}
                  </button>
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
