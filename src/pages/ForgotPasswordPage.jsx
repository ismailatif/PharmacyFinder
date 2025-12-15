import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { authApi } from '../utils/api';
import { useLanguage } from '../context/LanguageContext';
import { Mail, ArrowRight, KeyRound } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { motion } from 'framer-motion';
import AuthLayout from '../components/AuthLayout';

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const { t, language, isRTL } = useLanguage();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return;

    try {
      setLoading(true);
      await authApi.forgotPassword(email);
      setEmailSent(true);
      toast.success(t.emailSent);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error sending email');
    } finally {
      setLoading(false);
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
      title={t.resetPasswordTitle}
      subtitle={emailSent ? t.emailSent : t.enterEmailReset}
      backLink="/login"
    >
      {!emailSent ? (
        <form className="space-y-6" onSubmit={handleSubmit}>
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <label htmlFor="email" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5 ml-1">
              {t.emailLabel}
            </label>
            <div className="relative group">
              <div className={`absolute inset-y-0 ${isRTL ? 'right-0 pr-4' : 'left-0 pl-4'} flex items-center pointer-events-none`}>
                <Mail className="h-5 w-5 text-gray-400 group-focus-within:text-emerald-500 transition-colors" />
              </div>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`${inputClasses} ${isRTL ? 'pr-11 pl-4' : 'pl-11 pr-4'}`}
                placeholder={t.emailPlaceholder}
              />
            </div>
          </motion.div>

          <motion.div
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ delay: 0.4 }}
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
              {loading ? (language === 'fr' ? 'Envoi...' : 'جاري الإرسال...') : t.sendResetLink}
            </button>
          </motion.div>
        </form>
      ) : (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-8"
        >
          <div className="rounded-xl bg-emerald-50 dark:bg-emerald-900/20 p-6 border border-emerald-100 dark:border-emerald-900/50">
            <div className="flex items-center justify-center mb-4">
              <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                <KeyRound className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
              </div>
            </div>
            <p className="text-sm text-emerald-800 dark:text-emerald-200 text-center font-medium">
              {t.emailSent}
            </p>
            <p className="text-xs text-emerald-700 dark:text-emerald-300 text-center mt-2">
              {language === 'fr' ? 'Vérifiez votre boîte de réception.' : 'تحقق من بريدك الوارد.'}
            </p>
          </div>
        </motion.div>
      )}

      <motion.p 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="text-center mt-8 text-sm text-gray-600 dark:text-gray-400"
      >
        <Link to="/login" className="font-bold text-emerald-600 hover:text-emerald-500 dark:text-emerald-400 transition-colors border-b-2 border-transparent hover:border-emerald-500">
            {t.backToLogin}
        </Link>
      </motion.p>
    </AuthLayout>
  );
};

export default ForgotPasswordPage;
