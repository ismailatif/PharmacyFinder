import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Clock, Shield, Search, ArrowRight, Sparkles } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { motion } from 'framer-motion';
import PageWrapper from '../components/PageWrapper';

const LandingPage = () => {
  const { t, isRTL } = useLanguage();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 50 }
    }
  };

  const features = [
    {
      icon: <Clock className="w-8 h-8" />,
      title: isRTL ? 'خدمة 24/7' : 'Service 24/7',
      desc: isRTL
        ? 'معلومات محدثة عن الصيدليات المناوبة ليلاً ونهاراً.'
        : 'Informations à jour sur les pharmacies de garde jour et nuit.'
    },
    {
      icon: <MapPin className="w-8 h-8" />,
      title: isRTL ? 'تحديد الموقع الجغرافي' : 'Géolocalisation',
      desc: isRTL
        ? 'اعثر على أقرب صيدلية لموقعك الحالي بضغطة زر.'
        : 'Trouvez la pharmacie la plus proche de votre position actuelle en un clic.'
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: isRTL ? 'معلومات موثوقة' : 'Informations Fiables',
      desc: isRTL
        ? 'بيانات دقيقة وموثوقة يتم تحديثها بانتظام.'
        : 'Données précises et fiables mises à jour régulièrement.'
    }
  ];

  return (
    <PageWrapper>
      <div className="relative min-h-screen overflow-hidden bg-gray-50 dark:bg-gray-900 transition-colors duration-500">

        {/* Futuristic Background Elements */}
        <div className="absolute inset-0 z-0 overflow-hidden pointers-events-none">
          <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-emerald-400/20 dark:bg-emerald-600/20 rounded-full blur-[120px] animate-pulse" style={{ animationDuration: '8s' }} />
          <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-teal-400/20 dark:bg-teal-600/20 rounded-full blur-[120px] animate-pulse" style={{ animationDuration: '10s' }} />
          <div className="absolute top-[40%] left-[40%] w-[20%] h-[20%] bg-cyan-400/10 dark:bg-cyan-600/10 rounded-full blur-[80px]" />

          {/* Grid Pattern Overlay */}
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 dark:brightness-50" />
        </div>

        {/* Hero Section */}
        <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 sm:px-6 lg:px-8">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="w-full max-w-7xl mx-auto text-center"
          >
            {/* Badge */}
            <motion.div variants={itemVariants} className="flex justify-center mb-8">
              <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium bg-emerald-100/80 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-700 backdrop-blur-md shadow-sm">
                <Sparkles className="w-4 h-4" />
                {isRTL ? 'مرحبًا بكم في المستقبل' : 'Bienvenue dans le futur'}
              </span>
            </motion.div>

            {/* Title */}
            <motion.h1 variants={itemVariants} className="text-5xl sm:text-7xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-gray-900 via-emerald-800 to-gray-900 dark:from-white dark:via-emerald-400 dark:to-teal-200 mb-6 drop-shadow-sm">
              <span className="block mb-2">{isRTL ? 'صيدليتك الأقرب إليك' : 'Votre Pharmacie'}</span>
              <span className="block text-emerald-600 dark:text-emerald-400">{isRTL ? 'في أي وقت، في أي مكان' : 'La Plus Proche'}</span>
            </motion.h1>

            {/* Description */}
            <motion.p variants={itemVariants} className="mt-4 max-w-2xl mx-auto text-xl text-gray-600 dark:text-gray-300 leading-relaxed">
              {isRTL
                ? 'اعثر على الصيدليات المفتوحة والصيدليات المناوبة في مدينتك بسهولة وسرعة. نحن هنا لمساعدتك في العثور على الدواء الذي تحتاجه.'
                : 'Trouvez facilement et rapidement les pharmacies ouvertes et de garde dans votre ville. Une expérience fluide et moderne.'}
            </motion.p>

            {/* CTA Button */}
            <motion.div variants={itemVariants} className="mt-10 flex justify-center">
              <Link
                to="/search"
                className="group relative inline-flex items-center justify-center px-8 py-4 text-lg font-bold text-white transition-all duration-300 bg-emerald-600 rounded-full overflow-hidden hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:shadow-[0_0_30px_rgba(16,185,129,0.5)] active:scale-95"
              >
                <span className="absolute w-0 h-0 transition-all duration-500 ease-out bg-white rounded-full group-hover:w-56 group-hover:h-56 opacity-10"></span>
                <span className="relative flex items-center gap-3">
                  <Search className={`w-5 h-5 ${isRTL ? 'ml-1' : 'mr-1'}`} />
                  {isRTL ? 'ابحث عن صيدلية' : 'Trouver une pharmacie'}
                  <ArrowRight className={`w-5 h-5 transition-transform duration-300 ${isRTL ? 'group-hover:-translate-x-1 rotate-180' : 'group-hover:translate-x-1'}`} />
                </span>
              </Link>
            </motion.div>

            {/* Features Cards */}
            <motion.div variants={containerVariants} className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-20">
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  variants={itemVariants}
                  whileHover={{ y: -10, scale: 1.02 }}
                  className="group relative p-8 rounded-3xl bg-white/60 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-700/50 backdrop-blur-xl shadow-xl hover:shadow-2xl transition-all duration-300"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <div className="relative z-10 flex flex-col items-center text-center">
                    <div className="p-4 mb-6 rounded-2xl bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform duration-300 shadow-sm">
                      {feature.icon}
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-3 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                      {feature.title}
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400 leading-relaxed">
                      {feature.desc}
                    </p>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </div>
    </PageWrapper>
  );
};

export default LandingPage;
