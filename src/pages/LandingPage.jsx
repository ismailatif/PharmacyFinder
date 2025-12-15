import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Clock, Shield, Search, ArrowRight } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

import PageWrapper from '../components/PageWrapper';

const LandingPage = () => {
  const { t, isRTL } = useLanguage();

  return (
    <PageWrapper>
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-emerald-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-colors duration-300">
        {/* Hero Section */}
        <div className="relative overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16 text-center lg:pt-32">
            <h1 className="text-4xl tracking-tight font-extrabold text-emerald-900 dark:text-emerald-400 sm:text-5xl md:text-6xl">
              <span className="block">{isRTL ? 'صيدليتك الأقرب إليك' : 'Votre Pharmacie la Plus Proche'}</span>
              <span className="block text-emerald-600 dark:text-emerald-500 mt-2">{isRTL ? 'في أي وقت، في أي مكان' : 'À tout moment, n\'importe où'}</span>
            </h1>
            <p className="mt-4 max-w-2xl mx-auto text-xl text-gray-500 dark:text-gray-300">
              {isRTL 
                ? 'اعثر على الصيدليات المفتوحة والصيدليات المناوبة في مدينتك بسهولة وسرعة. نحن هنا لمساعدتك في العثور على الدواء الذي تحتاجه.'
                : 'Trouvez facilement et rapidement les pharmacies ouvertes et de garde dans votre ville. Nous sommes là pour vous aider à trouver les médicaments dont vous avez besoin.'}
            </p>
            <div className="mt-8 flex justify-center gap-4">
              <Link
                to="/search"
                className="inline-flex items-center px-8 py-3 border border-transparent text-base font-medium rounded-full text-white bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600 md:py-4 md:text-lg md:px-10 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
              >
                <Search className={`w-5 h-5 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                {isRTL ? 'ابحث عن صيدلية' : 'Trouver une pharmacie'}
              </Link>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="py-12 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
              <div className="flex flex-col items-center text-center p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-emerald-100 dark:border-gray-700 hover:shadow-md transition-shadow">
                <div className="p-3 bg-emerald-100 dark:bg-emerald-900/30 rounded-full text-emerald-600 dark:text-emerald-400 mb-4">
                  <Clock className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  {isRTL ? 'خدمة 24/7' : 'Service 24/7'}
                </h3>
                <p className="text-gray-500 dark:text-gray-400">
                  {isRTL 
                    ? 'معلومات محدثة عن الصيدليات المناوبة ليلاً ونهاراً.'
                    : 'Informations à jour sur les pharmacies de garde jour et nuit.'}
                </p>
              </div>

              <div className="flex flex-col items-center text-center p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-emerald-100 dark:border-gray-700 hover:shadow-md transition-shadow">
                <div className="p-3 bg-emerald-100 dark:bg-emerald-900/30 rounded-full text-emerald-600 dark:text-emerald-400 mb-4">
                  <MapPin className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  {isRTL ? 'تحديد الموقع الجغرافي' : 'Géolocalisation'}
                </h3>
                <p className="text-gray-500 dark:text-gray-400">
                  {isRTL 
                    ? 'اعثر على أقرب صيدلية لموقعك الحالي بضغطة زر.'
                    : 'Trouvez la pharmacie la plus proche de votre position actuelle en un clic.'}
                </p>
              </div>

              <div className="flex flex-col items-center text-center p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-emerald-100 dark:border-gray-700 hover:shadow-md transition-shadow">
                <div className="p-3 bg-emerald-100 dark:bg-emerald-900/30 rounded-full text-emerald-600 dark:text-emerald-400 mb-4">
                  <Shield className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  {isRTL ? 'معلومات موثوقة' : 'Informations Fiables'}
                </h3>
                <p className="text-gray-500 dark:text-gray-400">
                  {isRTL 
                    ? 'بيانات دقيقة وموثوقة يتم تحديثها بانتظام.'
                    : 'Données précises et fiables mises à jour régulièrement.'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageWrapper>
  );
};

export default LandingPage;
