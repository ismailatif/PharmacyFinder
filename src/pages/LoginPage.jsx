
import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import { Mail, Lock, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { GoogleLogin } from '@react-oauth/google';
import { motion, AnimatePresence } from 'framer-motion';
import AuthLayout from '../components/AuthLayout';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { login, googleLogin, loading } = useAuth();
  const { t, language, isRTL } = useLanguage();
  const { theme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/';

  const handleGoogleSuccess = async (credentialResponse) => {
    const result = await googleLogin(credentialResponse.credential);
    if (result.success) {
      navigate(from, { replace: true });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      toast.error(language === 'fr' ? 'Veuillez remplir tous les champs' : 'يرجى ملء جميع الحقول');
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error(language === 'fr' ? 'Veuillez fournir une adresse email valide' : 'يرجى تقديم عنوان بريد إلكتروني صالح');
      return;
    }

    const result = await login(email, password);
    if (result.success) {
      navigate(from, { replace: true });
    }
  };

  const inputClasses = `
    block w-full py-3.5 
    bg-gray-50 dark:bg-gray-800/50 
    border border-gray-200 dark:border-gray-700 
    rounded-xl 
    text-gray-900 dark:text-white 
    placeholder-gray-400 dark:placeholder-gray-500
    focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 
    transition-all duration-200
  `;

  return (
    <AuthLayout
      title={t.welcomeBack}
      subtitle={t.signInAccess}
    >
      <form className="space-y-6" onSubmit={handleSubmit}>
        <div className="space-y-5">
          {/* Email Input */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <label htmlFor="email" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5 ml-1">
              {t.emailLabel}
            </label>
            <div className="relative group">
              <div className={`absolute inset-y-0 ${isRTL ? 'right-0 pr-4' : 'left-0 pl-4'} flex items-center pointer-events-none transition-colors group-focus-within:text-emerald-500`}>
                <Mail className="h-5 w-5 text-gray-400 group-focus-within:text-emerald-500 transition-colors" />
              </div>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`${inputClasses} ${isRTL ? 'pr-11 pl-4' : 'pl-11 pr-4'}`}
                placeholder={t.emailPlaceholder}
              />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
          >
            <div className="flex justify-between items-center mb-1.5 ml-1">
              <label htmlFor="password" className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                {t.passwordLabel}
              </label>
              <Link to="/forgot-password" className="text-sm font-medium text-emerald-600 hover:text-emerald-500 dark:text-emerald-400 transition-colors">
                {t.forgotPassword}
              </Link>
            </div>
            <div className="relative group">
              <div className={`absolute inset-y-0 ${isRTL ? 'right-0 pr-4' : 'left-0 pl-4'} flex items-center pointer-events-none`}>
                <Lock className="h-5 w-5 text-gray-400 group-focus-within:text-emerald-500 transition-colors" />
              </div>
              <input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`${inputClasses} ${isRTL ? 'pr-11 pl-12' : 'pl-11 pr-12'}`}
                placeholder={t.passwordPlaceholder}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className={`absolute inset-y-0 ${isRTL ? 'left-0 pl-4' : 'right-0 pr-4'} flex items-center text-gray-400 hover:text-emerald-500 transition-colors`}
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </motion.div>
        </div>

        {/* Submit Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <button
            type="submit"
            disabled={loading}
            className="group relative w-full flex justify-center py-3.5 px-4 border border-transparent text-sm font-bold rounded-xl text-white bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-all transform active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed shadow-lg shadow-emerald-500/20"
          >
            <span className={`absolute ${isRTL ? 'right-0 pr-4' : 'left-0 pl-4'} inset-y-0 flex items-center`}>
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <ArrowRight className={`h-5 w-5 text-emerald-100 group-hover:text-white transition-colors ${isRTL ? 'rotate-180' : ''}`} aria-hidden="true" />
              )}
            </span>
            {loading ? t.signingIn : t.signInButton}
          </button>
        </motion.div>

        {/* Divider */}
        <motion.div
          className="relative"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200 dark:border-gray-700/50"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-4 bg-white dark:bg-gray-900 text-gray-500 font-medium">
              {t.or}
            </span>
          </div>
        </motion.div>

        {/* Google Login */}
        <motion.div
          className="flex justify-center"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <div className="w-full flex justify-center" dir="ltr">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => toast.error('Google Login Failed')}
              theme={theme === 'dark' ? 'filled_black' : 'outline'}
              shape="pill"
              text="continue_with"
              size="large"
              locale={language}
            />
          </div>
        </motion.div>

      </form>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="text-center mt-2 text-sm text-gray-600 dark:text-gray-400"
      >
        {t.noAccount}{' '}
        <Link to="/register" className="font-bold text-emerald-600 hover:text-emerald-500 dark:text-emerald-400 transition-colors border-b-2 border-transparent hover:border-emerald-500 ml-1">
          {t.createAccount}
        </Link>
      </motion.p>
    </AuthLayout>
  );
};

export default LoginPage;
