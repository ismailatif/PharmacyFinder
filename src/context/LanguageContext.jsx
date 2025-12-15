import React, { createContext, useContext, useState, useEffect } from 'react';

const translations = {
  fr: {
    title: 'Pharmacies de Garde',
    searchPlaceholder: 'Rechercher une pharmacie...',
    filterAll: 'Toutes',
    filterOpen: 'Ouvertes',
    filterOnDuty: 'De garde',
    filterClosed: 'Fermées',
    statusOpen: 'Ouverte',
    statusClosed: 'Fermée',
    statusOnDuty: 'De garde',
    call: 'Appeler',
    phone: 'Téléphone',
    address: 'Adresse',
    services: 'Services',
    directions: 'Itinéraire',
    openingHours: 'Horaires',
    noResults: 'Aucune pharmacie trouvée',
    viewDetails: 'Voir détails',
    backToList: 'Retour à la liste',
    rating: 'Note',
    reviews: 'avis',
    description: 'Description',
    pharmacist: 'Pharmacien',
    established: 'Établie en',
    specialties: 'Spécialités',
    priceRange: 'Gamme de prix',
    features: 'Caractéristiques',
    parking: 'Parking',
    accessible: 'Accessible',
    insurance: 'Assurance',
    delivery: 'Livraison',
    email: 'Email',
    website: 'Site web',
    filters: 'Filtres',
    priceRangeLow: 'Économique',
    priceRangeMedium: 'Moyen',
    priceRangeHigh: 'Premium',
    clearFilters: 'Effacer',
    applyFilters: 'Appliquer',
    sortBy: 'Trier par',
    sortRating: 'Note',
    sortDistance: 'Distance',
    sortName: 'Nom',
    locationOnMap: 'Localisation sur la carte',
    // Auth
    welcomeBack: 'Bon retour',
    signInAccess: 'Connectez-vous pour accéder à votre tableau de bord',
    emailLabel: 'Adresse email',
    emailPlaceholder: 'vous@exemple.com',
    passwordLabel: 'Mot de passe',
    passwordPlaceholder: '••••••••',
    forgotPassword: 'Mot de passe oublié ?',
    signInButton: 'Se connecter',
    signingIn: 'Connexion...',
    noAccount: "Vous n'avez pas de compte ?",
    createAccount: 'Créer un compte gratuit',
    createAccountTitle: 'Créer un compte',
    joinUs: 'Rejoignez-nous pour trouver les pharmacies près de chez vous',
    fullNameLabel: 'Nom complet',
    fullNamePlaceholder: 'Jean Dupont',
    creatingAccount: 'Création...',
    alreadyHaveAccount: 'Vous avez déjà un compte ?',
    or: 'Ou',
    googleLogin: 'Continuer avec Google',
    sendResetLink: 'Envoyer le lien',
    backToLogin: 'Retour à la connexion',
    resetPasswordTitle: 'Réinitialiser le mot de passe',
    newPasswordLabel: 'Nouveau mot de passe',
    resetSuccess: 'Mot de passe réinitialisé avec succès',
    emailSent: 'Email envoyé ! Vérifiez votre boîte de réception.',
    enterEmailReset: 'Entrez votre email pour recevoir le lien de réinitialisation.',
    authHeroQuote: 'Dédiés à vous connecter aux soins dont vous avez besoin, instantanément et sans effort.',
    footerCopyright: 'PharmacyFinder. Tous droits réservés.'
  },
  ar: {
    title: 'الصيدليات المناوبة',
    searchPlaceholder: 'البحث عن صيدلية...',
    filterAll: 'الكل',
    filterOpen: 'مفتوحة',
    filterOnDuty: 'مناوبة',
    filterClosed: 'مغلقة',
    statusOpen: 'مفتوحة',
    statusClosed: 'مغلقة',
    statusOnDuty: 'مناوبة',
    call: 'اتصال',
    phone: 'هاتف',
    address: 'عنوان',
    services: 'خدمات',
    directions: 'الاتجاهات',
    openingHours: 'ساعات العمل',
    noResults: 'لم يتم العثور على صيدليات',
    viewDetails: 'عرض التفاصيل',
    backToList: 'العودة للقائمة',
    rating: 'التقييم',
    reviews: 'مراجعة',
    description: 'الوصف',
    pharmacist: 'الصيدلي',
    established: 'تأسست في',
    specialties: 'التخصصات',
    priceRange: 'نطاق السعر',
    features: 'المميزات',
    parking: 'موقف سيارات',
    accessible: 'يمكن الوصول إليه',
    insurance: 'تأمين',
    delivery: 'توصيل',
    email: 'بريد إلكتروني',
    website: 'موقع ويب',
    filters: 'المرشحات',
    priceRangeLow: 'اقتصادي',
    priceRangeMedium: 'متوسط',
    priceRangeHigh: 'مميز',
    clearFilters: 'مسح',
    applyFilters: 'تطبيق',
    sortBy: 'ترتيب حسب',
    sortRating: 'التقييم',
    sortDistance: 'المسافة',
    sortName: 'الاسم',
    locationOnMap: 'الموقع على الخريطة',
    // Auth
    welcomeBack: 'مرحبًا بعودتك',
    signInAccess: 'سجل الدخول للوصول إلى لوحة التحكم',
    emailLabel: 'البريد الإلكتروني',
    emailPlaceholder: 'name@example.com',
    passwordLabel: 'كلمة المرور',
    passwordPlaceholder: '••••••••',
    forgotPassword: 'نسيت كلمة المرور؟',
    signInButton: 'تسجيل الدخول',
    signingIn: 'جاري الدخول...',
    noAccount: 'ليس لديك حساب؟',
    createAccount: 'إنشاء حساب مجاني',
    createAccountTitle: 'إنشاء حساب',
    joinUs: 'انضم إلينا للعثور على الصيدليات القريبة منك',
    fullNameLabel: 'الاسم الكامل',
    fullNamePlaceholder: 'فلان الفلاني',
    creatingAccount: 'جاري إنشاء الحساب...',
    alreadyHaveAccount: 'لديك حساب بالفعل؟',
    or: 'أو',
    googleLogin: 'المتابعة مع Google',
    sendResetLink: 'إرسال الرابط',
    backToLogin: 'العودة لتسجيل الدخول',
    resetPasswordTitle: 'إعادة تعيين كلمة المرور',
    newPasswordLabel: 'كلمة المرور الجديدة',
    resetSuccess: 'تم إعادة تعيين كلمة المرور بنجاح',
    emailSent: 'تم إرسال البريد الإلكتروني! تحقق من بريدك الوارد.',
    enterEmailReset: 'أدخل بريدك الإلكتروني لتلقي رابط إعادة التعيين.',
    authHeroQuote: 'ملتزمون بربطك بالرعاية التي تحتاجها، فوريًا وبسهولة.',
    footerCopyright: 'PharmacyFinder. جميع الحقوق محفوظة.'
  }
};

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState('fr');
  const isRTL = language === 'ar';

  // 🔥 Full app RTL/LTR control
  useEffect(() => {
    const root = document.documentElement;
    const dir = isRTL ? 'rtl' : 'ltr';

    // Set direction attribute
    root.setAttribute('dir', dir);

    // Helper classes for Tailwind (rtl: / ltr: variants)
    root.classList.toggle('rtl', isRTL);
    root.classList.toggle('ltr', !isRTL);
  }, [isRTL]);

  const value = {
    language,
    setLanguage,
    t: translations[language],
    isRTL
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};