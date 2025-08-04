import { useState, useEffect } from "react";

export type Language = 'en' | 'fr' | 'ar';

interface Translations {
  [key: string]: {
    en: string;
    fr: string;
    ar: string;
  };
}

const translations: Translations = {
  // Authentication & Navigation
  'welcomeBack': {
    en: 'Welcome back',
    fr: 'Bon retour',
    ar: 'مرحباً بعودتك'
  },
  'getStarted': {
    en: 'Get Started',
    fr: 'Commencer',
    ar: 'ابدأ الآن'
  },
  'signIn': {
    en: 'Sign In',
    fr: 'Se connecter',
    ar: 'تسجيل الدخول'
  },
  'signUp': {
    en: 'Sign Up',
    fr: "S'inscrire",
    ar: 'إنشاء حساب'
  },
  'login': {
    en: 'Login',
    fr: 'Connexion',
    ar: 'تسجيل الدخول'
  },
  'logout': {
    en: 'Logout',
    fr: 'Déconnexion',
    ar: 'تسجيل الخروج'
  },
  'profile': {
    en: 'Profile',
    fr: 'Profil',
    ar: 'الملف الشخصي'
  },
  'settings': {
    en: 'Settings',
    fr: 'Paramètres',
    ar: 'الإعدادات'
  },

  // Home & Services
  'findYourPerfectService': {
    en: 'Find your perfect service',
    fr: 'Trouvez votre service parfait',
    ar: 'اعثر على الخدمة المثالية'
  },
  'searchServices': {
    en: 'Search for services...',
    fr: 'Rechercher des services...',
    ar: 'البحث عن الخدمات...'
  },
  'allServices': {
    en: 'All Services',
    fr: 'Tous les services',
    ar: 'جميع الخدمات'
  },
  'myBookings': {
    en: 'My Bookings',
    fr: 'Mes réservations',
    ar: 'حجوزاتي'
  },
  'topRated': {
    en: 'Top Rated',
    fr: 'Les mieux notés',
    ar: 'الأعلى تقييماً'
  },
  'trending': {
    en: 'Trending',
    fr: 'Tendance',
    ar: 'الرائج'
  },
  'popular': {
    en: 'Popular',
    fr: 'Populaire',
    ar: 'شائع'
  },
  'featuredServices': {
    en: 'Featured Services',
    fr: 'Services en vedette',
    ar: 'الخدمات المميزة'
  },
  'viewAll': {
    en: 'View All',
    fr: 'Voir tout',
    ar: 'عرض الكل'
  },
  'whyChooseUs': {
    en: 'Why Choose Us',
    fr: 'Pourquoi nous choisir',
    ar: 'لماذا تختارنا'
  },
  'verifiedProviders': {
    en: 'Verified Providers',
    fr: 'Fournisseurs vérifiés',
    ar: 'مقدمو خدمات موثقون'
  },
  'averageRating': {
    en: 'Average Rating',
    fr: 'Note moyenne',
    ar: 'متوسط التقييم'
  },
  'recentActivity': {
    en: 'Recent Activity',
    fr: 'Activité récente',
    ar: 'النشاط الأخير'
  },
  'noRecentActivity': {
    en: 'No recent activity',
    fr: 'Aucune activité récente',
    ar: 'لا يوجد نشاط حديث'
  },
  'startByBookingService': {
    en: 'Start by booking your first service',
    fr: 'Commencez par réserver votre premier service',
    ar: 'ابدأ بحجز خدمتك الأولى'
  },
  'browseServices': {
    en: 'Browse Services',
    fr: 'Parcourir les services',
    ar: 'تصفح الخدمات'
  },
  'categoriesAvailable': {
    en: 'categories available',
    fr: 'catégories disponibles',
    ar: 'فئة متاحة'
  },

  // Categories & Filtering
  'clearSearch': {
    en: 'Clear search',
    fr: 'Effacer la recherche',
    ar: 'مسح البحث'
  },
  'gridView': {
    en: 'Grid view',
    fr: 'Vue grille',
    ar: 'عرض الشبكة'
  },
  'listView': {
    en: 'List view',
    fr: 'Vue liste',
    ar: 'عرض القائمة'
  },
  'showAll': {
    en: 'Show All',
    fr: 'Afficher tout',
    ar: 'عرض الكل'
  },
  'services': {
    en: 'services',
    fr: 'services',
    ar: 'خدمات'
  },

  // Login Page
  'welcomeToServiceNow': {
    en: 'Welcome to ServiceNow',
    fr: 'Bienvenue sur ServiceNow',
    ar: 'مرحباً بك في ServiceNow'
  },
  'connectWithTrustedProviders': {
    en: 'Connect with trusted service providers in your area',
    fr: 'Connectez-vous avec des fournisseurs de services de confiance dans votre région',
    ar: 'تواصل مع مقدمي خدمات موثوقين في منطقتك'
  },
  'continueWithGoogle': {
    en: 'Continue with Google',
    fr: 'Continuer avec Google',
    ar: 'متابعة مع Google'
  },
  'continueWithReplit': {
    en: 'Continue with Replit',
    fr: 'Continuer avec Replit',
    ar: 'متابعة مع Replit'
  },
  'orContinueWith': {
    en: 'Or continue with',
    fr: 'Ou continuer avec',
    ar: 'أو تابع مع'
  },
  'email': {
    en: 'Email',
    fr: 'E-mail',
    ar: 'البريد الإلكتروني'
  },
  'password': {
    en: 'Password',
    fr: 'Mot de passe',
    ar: 'كلمة المرور'
  },
  'enterYourEmail': {
    en: 'Enter your email',
    fr: 'Entrez votre e-mail',
    ar: 'أدخل بريدك الإلكتروني'
  },
  'enterYourPassword': {
    en: 'Enter your password',
    fr: 'Entrez votre mot de passe',
    ar: 'أدخل كلمة المرور'
  },
  'dontHaveAccount': {
    en: "Don't have an account?",
    fr: "Vous n'avez pas de compte ?",
    ar: 'ليس لديك حساب؟'
  },
  'alreadyHaveAccount': {
    en: 'Already have an account?',
    fr: 'Vous avez déjà un compte ?',
    ar: 'لديك حساب بالفعل؟'
  },
  'createAccount': {
    en: 'Create one',
    fr: 'Créer un compte',
    ar: 'إنشاء حساب'
  },
  'signInHere': {
    en: 'Sign in here',
    fr: 'Connectez-vous ici',
    ar: 'سجل الدخول هنا'
  }
};

export function useTranslation() {
  const [language, setLanguage] = useState<Language>(() => {
    // Check localStorage first, then check HTML lang attribute, fallback to 'en'
    const stored = localStorage.getItem('preferredLanguage') as Language;
    const htmlLang = document.documentElement.lang as Language;
    return stored || htmlLang || 'en';
  });

  useEffect(() => {
    // Update HTML lang attribute when language changes
    document.documentElement.lang = language;
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
  }, [language]);

  const changeLanguage = (newLanguage: Language) => {
    setLanguage(newLanguage);
    localStorage.setItem('preferredLanguage', newLanguage);
  };

  const t = (key: string): string => {
    const translation = translations[key];
    if (!translation) {
      console.warn(`Translation missing for key: ${key}`);
      return key;
    }
    return translation[language] || translation.en || key;
  };

  return {
    language,
    changeLanguage,
    t,
    isRTL: language === 'ar'
  };
}