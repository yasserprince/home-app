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
  
  // Profile & Settings
  'editProfile': {
    en: 'Edit Profile',
    fr: 'Modifier le profil',
    ar: 'تحرير الملف الشخصي'
  },
  'verification': {
    en: 'Identity Verification',
    fr: 'Vérification d\'identité',
    ar: 'التحقق من الهوية'
  },
  'paymentMethods': {
    en: 'Payment Methods',
    fr: 'Modes de paiement',
    ar: 'طرق الدفع'
  },
  'savedAddresses': {
    en: 'Saved Addresses',
    fr: 'Adresses sauvegardées',
    ar: 'العناوين المحفوظة'
  },
  'notifications': {
    en: 'Notifications',
    fr: 'Notifications',
    ar: 'الإشعارات'
  },
  'helpCenter': {
    en: 'Help Center',
    fr: 'Centre d\'aide',
    ar: 'مركز المساعدة'
  },
  'adminPanel': {
    en: 'Admin Panel',
    fr: 'Panneau d\'administration',
    ar: 'لوحة الإدارة'
  },
  'bookings': {
    en: 'Bookings',
    fr: 'Réservations',
    ar: 'الحجوزات'
  },
  'rating': {
    en: 'Rating',
    fr: 'Note',
    ar: 'التقييم'
  },
  'favorites': {
    en: 'Favorites',
    fr: 'Favoris',
    ar: 'المفضلة'
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
  'noServicesFound': {
    en: 'No services found',
    fr: 'Aucun service trouvé',
    ar: 'لم يتم العثور على خدمات'
  },
  'tryAdjustingFilters': {
    en: 'Try adjusting your search or filters',
    fr: 'Essayez d\'ajuster votre recherche ou vos filtres',
    ar: 'حاول تعديل البحث أو المرشحات'
  },
  'clearFilters': {
    en: 'Clear filters',
    fr: 'Effacer les filtres',
    ar: 'مسح المرشحات'
  },

  // Navigation & Menu
  'home': {
    en: 'Home',
    fr: 'Accueil',
    ar: 'الرئيسية'
  },
  'categories': {
    en: 'Categories',
    fr: 'Catégories',
    ar: 'الفئات'
  },
  'bookings': {
    en: 'Bookings',
    fr: 'Réservations',
    ar: 'الحجوزات'
  },
  'providers': {
    en: 'Providers',
    fr: 'Fournisseurs',
    ar: 'مقدمو الخدمات'
  },

  // Profile & User Management
  'firstName': {
    en: 'First Name',
    fr: 'Prénom',
    ar: 'الاسم الأول'
  },
  'lastName': {
    en: 'Last Name',
    fr: 'Nom de famille',
    ar: 'اسم العائلة'
  },
  'phoneNumber': {
    en: 'Phone Number',
    fr: 'Numéro de téléphone',
    ar: 'رقم الهاتف'
  },
  'dateOfBirth': {
    en: 'Date of Birth',
    fr: 'Date de naissance',
    ar: 'تاريخ الميلاد'
  },
  'gender': {
    en: 'Gender',
    fr: 'Genre',
    ar: 'الجنس'
  },
  'location': {
    en: 'Location',
    fr: 'Localisation',
    ar: 'الموقع'
  },
  'bio': {
    en: 'Bio',
    fr: 'Biographie',
    ar: 'السيرة الذاتية'
  },
  'editProfile': {
    en: 'Edit Profile',
    fr: 'Modifier le profil',
    ar: 'تحرير الملف الشخصي'
  },
  'saveChanges': {
    en: 'Save Changes',
    fr: 'Enregistrer les modifications',
    ar: 'حفظ التغييرات'
  },
  'cancel': {
    en: 'Cancel',
    fr: 'Annuler',
    ar: 'إلغاء'
  },

  // Booking & Services
  'bookNow': {
    en: 'Book Now',
    fr: 'Réserver maintenant',
    ar: 'احجز الآن'
  },
  'selectDate': {
    en: 'Select Date',
    fr: 'Sélectionner la date',
    ar: 'اختر التاريخ'
  },
  'selectTime': {
    en: 'Select Time',
    fr: 'Sélectionner l\'heure',
    ar: 'اختر الوقت'
  },
  'serviceDetails': {
    en: 'Service Details',
    fr: 'Détails du service',
    ar: 'تفاصيل الخدمة'
  },
  'price': {
    en: 'Price',
    fr: 'Prix',
    ar: 'السعر'
  },
  'duration': {
    en: 'Duration',
    fr: 'Durée',
    ar: 'المدة'
  },
  'rating': {
    en: 'Rating',
    fr: 'Note',
    ar: 'التقييم'
  },
  'reviews': {
    en: 'Reviews',
    fr: 'Avis',
    ar: 'المراجعات'
  },
  'availability': {
    en: 'Availability',
    fr: 'Disponibilité',
    ar: 'التوفر'
  },

  // Status & States
  'pending': {
    en: 'Pending',
    fr: 'En attente',
    ar: 'معلق'
  },
  'confirmed': {
    en: 'Confirmed',
    fr: 'Confirmé',
    ar: 'مؤكد'
  },
  'completed': {
    en: 'Completed',
    fr: 'Terminé',
    ar: 'مكتمل'
  },
  'cancelled': {
    en: 'Cancelled',
    fr: 'Annulé',
    ar: 'ملغى'
  },
  'available': {
    en: 'Available',
    fr: 'Disponible',
    ar: 'متاح'
  },
  'unavailable': {
    en: 'Unavailable',
    fr: 'Indisponible',
    ar: 'غير متاح'
  },

  // Common Actions
  'search': {
    en: 'Search',
    fr: 'Rechercher',
    ar: 'بحث'
  },
  'filter': {
    en: 'Filter',
    fr: 'Filtrer',
    ar: 'تصفية'
  },
  'sort': {
    en: 'Sort',
    fr: 'Trier',
    ar: 'ترتيب'
  },
  'edit': {
    en: 'Edit',
    fr: 'Modifier',
    ar: 'تحرير'
  },
  'delete': {
    en: 'Delete',
    fr: 'Supprimer',
    ar: 'حذف'
  },
  'save': {
    en: 'Save',
    fr: 'Enregistrer',
    ar: 'حفظ'
  },
  'back': {
    en: 'Back',
    fr: 'Retour',
    ar: 'رجوع'
  },
  'next': {
    en: 'Next',
    fr: 'Suivant',
    ar: 'التالي'
  },
  'previous': {
    en: 'Previous',
    fr: 'Précédent',
    ar: 'السابق'
  },
  'confirm': {
    en: 'Confirm',
    fr: 'Confirmer',
    ar: 'تأكيد'
  },
  'close': {
    en: 'Close',
    fr: 'Fermer',
    ar: 'إغلاق'
  },
  'loading': {
    en: 'Loading...',
    fr: 'Chargement...',
    ar: 'جاري التحميل...'
  },

  // Time & Date
  'today': {
    en: 'Today',
    fr: 'Aujourd\'hui',
    ar: 'اليوم'
  },
  'tomorrow': {
    en: 'Tomorrow',
    fr: 'Demain',
    ar: 'غداً'
  },
  'thisWeek': {
    en: 'This Week',
    fr: 'Cette semaine',
    ar: 'هذا الأسبوع'
  },
  'nextWeek': {
    en: 'Next Week',
    fr: 'La semaine prochaine',
    ar: 'الأسبوع القادم'
  },
  'morning': {
    en: 'Morning',
    fr: 'Matin',
    ar: 'صباح'
  },
  'afternoon': {
    en: 'Afternoon',
    fr: 'Après-midi',
    ar: 'بعد الظهر'
  },
  'evening': {
    en: 'Evening',
    fr: 'Soir',
    ar: 'مساء'
  },

  // Messages & Notifications
  'success': {
    en: 'Success',
    fr: 'Succès',
    ar: 'نجح'
  },
  'error': {
    en: 'Error',
    fr: 'Erreur',
    ar: 'خطأ'
  },
  'warning': {
    en: 'Warning',
    fr: 'Avertissement',
    ar: 'تحذير'
  },
  'info': {
    en: 'Info',
    fr: 'Information',
    ar: 'معلومات'
  },
  
  // Profile specific
  'myBookings': {
    en: 'My Bookings',
    fr: 'Mes réservations',
    ar: 'حجوزاتي'
  },
  'favorites': {
    en: 'Favorites',
    fr: 'Favoris',
    ar: 'المفضلات'
  },
  'paymentMethods': {
    en: 'Payment Methods',
    fr: 'Méthodes de paiement',
    ar: 'طرق الدفع'
  },
  'settings': {
    en: 'Settings',
    fr: 'Paramètres',
    ar: 'الإعدادات'
  },
  'helpSupport': {
    en: 'Help & Support',
    fr: 'Aide et support',
    ar: 'المساعدة والدعم'
  },
  'logout': {
    en: 'Logout',
    fr: 'Déconnexion',
    ar: 'تسجيل الخروج'
  },

  // Booking status and actions
  'active': {
    en: 'Active',
    fr: 'Actif',
    ar: 'نشط'
  },
  'past': {
    en: 'Past',
    fr: 'Passé',
    ar: 'السابق'
  },
  'upcoming': {
    en: 'Upcoming',
    fr: 'À venir',
    ar: 'القادم'
  },
  'cancelBooking': {
    en: 'Cancel Booking',
    fr: 'Annuler la réservation',
    ar: 'إلغاء الحجز'
  },
  'viewDetails': {
    en: 'View Details',
    fr: 'Voir les détails',
    ar: 'عرض التفاصيل'
  },
  'noBookingsYet': {
    en: 'No bookings yet',
    fr: 'Aucune réservation encore',
    ar: 'لا توجد حجوزات بعد'
  },
  'getStarted': {
    en: 'Get started by booking your first service',
    fr: 'Commencez par réserver votre premier service',
    ar: 'ابدأ بحجز خدمتك الأولى'
  },
  'browseServices': {
    en: 'Browse Services',
    fr: 'Parcourir les services',
    ar: 'تصفح الخدمات'
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
  },
  
  // Toast messages and additional common terms
  'bookingCancelledSuccess': {
    en: 'Booking cancelled successfully',
    fr: 'Réservation annulée avec succès',
    ar: 'تم إلغاء الحجز بنجاح'
  },
  'unauthorized': {
    en: 'Unauthorized',
    fr: 'Non autorisé',
    ar: 'غير مُصرح'
  },
  'loggedOutRedirecting': {
    en: 'You are logged out. Logging in again...',
    fr: 'Vous êtes déconnecté. Reconnexion en cours...',
    ar: 'تم تسجيل خروجك. جاري تسجيل الدخول مرة أخرى...'
  },
  'failedToCancelBooking': {
    en: 'Failed to cancel booking',
    fr: 'Échec de l\'annulation de la réservation',
    ar: 'فشل في إلغاء الحجز'
  },
  'myProfile': {
    en: 'My Profile',
    fr: 'Mon profil',
    ar: 'ملفي الشخصي'
  },
  
  // Booking specific terms
  'dateTime': {
    en: 'Date & Time',
    fr: 'Date et heure',
    ar: 'التاريخ والوقت'
  },
  'totalCost': {
    en: 'Total Cost',
    fr: 'Coût total',
    ar: 'التكلفة الإجمالية'
  },
  'call': {
    en: 'Call',
    fr: 'Appeler',
    ar: 'اتصال'
  },
  'message': {
    en: 'Message',
    fr: 'Message',
    ar: 'رسالة'
  },
  'cancel': {
    en: 'Cancel',
    fr: 'Annuler',
    ar: 'إلغاء'
  },
  'completed': {
    en: 'Completed',
    fr: 'Terminé',
    ar: 'مكتمل'
  },
  'cancelled': {
    en: 'Cancelled',
    fr: 'Annulé',
    ar: 'ملغي'
  },
  
  // Empty states
  'noUpcomingBookings': {
    en: 'No upcoming bookings',
    fr: 'Aucune réservation à venir',
    ar: 'لا توجد حجوزات قادمة'
  },
  'bookServiceToSeeAppointments': {
    en: 'Book a service to see your appointments here',
    fr: 'Réservez un service pour voir vos rendez-vous ici',
    ar: 'احجز خدمة لرؤية مواعيدك هنا'
  },
  'noCompletedBookings': {
    en: 'No completed bookings',
    fr: 'Aucune réservation terminée',
    ar: 'لا توجد حجوزات مكتملة'
  },
  'completedBookingsWillAppear': {
    en: 'Your completed bookings will appear here',
    fr: 'Vos réservations terminées apparaîtront ici',
    ar: 'ستظهر حجوزاتك المكتملة هنا'
  },
  'noCancelledBookings': {
    en: 'No cancelled bookings',
    fr: 'Aucune réservation annulée',
    ar: 'لا توجد حجوزات ملغية'
  },
  'cancelledBookingsWillAppear': {
    en: 'Your cancelled bookings will appear here',
    fr: 'Vos réservations annulées apparaîtront ici',
    ar: 'ستظهر حجوزاتك الملغية هنا'
  },
  
  // Categories page translations
  'trending': {
    en: 'Trending',
    fr: 'Tendance',
    ar: 'الأكثر طلباً'
  },
  'homeInfrastructure': {
    en: 'Home Infrastructure',
    fr: 'Infrastructure domestique',
    ar: 'البنية التحتية للمنزل'
  },
  'homeImprovement': {
    en: 'Home Improvement',
    fr: 'Amélioration de l\'habitat',
    ar: 'تحسين المنزل'
  },
  'cleaningMaintenance': {
    en: 'Cleaning & Maintenance',
    fr: 'Nettoyage et entretien',
    ar: 'التنظيف والصيانة'
  },
  'personalServices': {
    en: 'Personal Services',
    fr: 'Services personnels',
    ar: 'الخدمات الشخصية'
  },
  'professionalServices': {
    en: 'Professional Services',
    fr: 'Services professionnels',
    ar: 'الخدمات المهنية'
  },
  'automotiveTransport': {
    en: 'Automotive & Transport',
    fr: 'Automobile et transport',
    ar: 'السيارات والنقل'
  },
  
  // Common terms
  'back': {
    en: 'Back',
    fr: 'Retour',
    ar: 'العودة'
  },
  'allCategories': {
    en: 'All Categories',
    fr: 'Toutes les catégories',
    ar: 'جميع الفئات'
  },
  'searchCategories': {
    en: 'Search categories...',
    fr: 'Rechercher des catégories...',
    ar: 'البحث في الفئات...'
  },

  'services': {
    en: 'services',
    fr: 'services',
    ar: 'خدمات'
  },
  'from': {
    en: 'from',
    fr: 'à partir de',
    ar: 'من'
  },
  
  // Profile page specific (removing duplicate editProfile)
  'servicesBooked': {
    en: 'Services Booked',
    fr: 'Services réservés',
    ar: 'الخدمات المحجوزة'
  },
  'totalSpent': {
    en: 'Total Spent',
    fr: 'Total dépensé',
    ar: 'إجمالي المبلغ المنفق'
  },
  'yourRating': {
    en: 'Your Rating',
    fr: 'Votre note',
    ar: 'تقييمك'
  },
  'memberSince': {
    en: 'Member since',
    fr: 'Membre depuis',
    ar: 'عضو منذ'
  },
  
  // Settings page translations
  'savedAddresses': {
    en: 'Saved Addresses',
    fr: 'Adresses sauvegardées',
    ar: 'العناوين المحفوظة'
  },
  'locationSettings': {
    en: 'Location Settings',
    fr: 'Paramètres de localisation',
    ar: 'إعدادات الموقع'
  },
  'earningsAnalytics': {
    en: 'Earnings & Analytics',
    fr: 'Revenus et analyses',
    ar: 'الأرباح والتحليلات'
  },
  'reviewsRatings': {
    en: 'Reviews & Ratings',
    fr: 'Avis et évaluations',
    ar: 'المراجعات والتقييمات'
  },
  'verificationCenter': {
    en: 'Verification Center',
    fr: 'Centre de vérification',
    ar: 'مركز التحقق'
  },
  'preferencesPrivacy': {
    en: 'Preferences & Privacy',
    fr: 'Préférences et confidentialité',
    ar: 'التفضيلات والخصوصية'
  },
  'notifications': {
    en: 'Notifications',
    fr: 'Notifications',
    ar: 'الإشعارات'
  },
  'helpCenter': {
    en: 'Help Center',
    fr: 'Centre d\'aide',
    ar: 'مركز المساعدة'
  },
  
  // Individual category translations
  'plumbing': {
    en: 'Plumbing',
    fr: 'Plomberie',
    ar: 'السباكة'
  },
  'electrical': {
    en: 'Electrical',
    fr: 'Électricité',
    ar: 'الكهرباء'
  },
  'hvac': {
    en: 'HVAC',
    fr: 'CVC',
    ar: 'التكييف والتهوية'
  },
  'houseCleaning': {
    en: 'House Cleaning',
    fr: 'Nettoyage de maison',
    ar: 'تنظيف المنزل'
  },
  'handyman': {
    en: 'Handyman',
    fr: 'Bricoleur',
    ar: 'عامل صيانة'
  },
  'carpetCleaning': {
    en: 'Carpet Cleaning',
    fr: 'Nettoyage de tapis',
    ar: 'تنظيف السجاد'
  },
  'painting': {
    en: 'Painting',
    fr: 'Peinture',
    ar: 'الدهان'
  },
  'kitchenRemodeling': {
    en: 'Kitchen Remodeling',
    fr: 'Rénovation de cuisine',
    ar: 'تجديد المطبخ'
  },
  'bathroomRemodeling': {
    en: 'Bathroom Remodeling',
    fr: 'Rénovation de salle de bain',
    ar: 'تجديد الحمام'
  },
  'roofing': {
    en: 'Roofing',
    fr: 'Toiture',
    ar: 'الأسقف'
  },
  'flooring': {
    en: 'Flooring',
    fr: 'Revêtement de sol',
    ar: 'الأرضيات'
  },
  'carpentry': {
    en: 'Carpentry',
    fr: 'Menuiserie',
    ar: 'النجارة'
  },
  'autoRepair': {
    en: 'Auto Repair',
    fr: 'Réparation automobile',
    ar: 'إصلاح السيارات'
  },
  
  // Settings page specific keys
  'manageAccountPreferences': {
    en: 'Manage your account and preferences',
    fr: 'Gérez votre compte et préférences',
    ar: 'إدارة حسابك وتفضيلاتك'
  },
  'profileInformation': {
    en: 'Profile Information',
    fr: 'Informations du profil',
    ar: 'معلومات الملف الشخصي'
  },
  
  // Settings page missing translations
  'phone': {
    en: 'Phone',
    fr: 'Téléphone',
    ar: 'الهاتف'
  },
  'accountType': {
    en: 'Account Type',
    fr: 'Type de compte',
    ar: 'نوع الحساب'
  },
  'roleSeeker': {
    en: 'Service Seeker',
    fr: 'Chercheur de services',
    ar: 'باحث عن الخدمات'
  },
  'roleProvider': {
    en: 'Service Provider',
    fr: 'Fournisseur de services',
    ar: 'مقدم الخدمات'
  },
  'roleCompany': {
    en: 'Company',
    fr: 'Entreprise',
    ar: 'شركة'
  },
  'changeAccountType': {
    en: 'Change Account Type',
    fr: 'Changer le type de compte',
    ar: 'تغيير نوع الحساب'
  },
  'companyName': {
    en: 'Company Name',
    fr: 'Nom de l\'entreprise',
    ar: 'اسم الشركة'
  },
  'addressInformation': {
    en: 'Address Information',
    fr: 'Informations d\'adresse',
    ar: 'معلومات العنوان'
  },
  'streetAddress': {
    en: 'Street Address',
    fr: 'Adresse de la rue',
    ar: 'عنوان الشارع'
  },
  'city': {
    en: 'City',
    fr: 'Ville',
    ar: 'المدينة'
  },
  'state': {
    en: 'State',
    fr: 'État',
    ar: 'الولاية'
  },
  'zipCode': {
    en: 'ZIP Code',
    fr: 'Code postal',
    ar: 'الرمز البريدي'
  },
  'language': {
    en: 'Language',
    fr: 'Langue',
    ar: 'اللغة'
  },
  'selectLanguage': {
    en: 'Select Language',
    fr: 'Sélectionner la langue',
    ar: 'اختر اللغة'
  },
  'emailNotifications': {
    en: 'Email Notifications',
    fr: 'Notifications par e-mail',
    ar: 'إشعارات البريد الإلكتروني'
  },
  'receiveEmailUpdates': {
    en: 'Receive email updates about your bookings and account',
    fr: 'Recevoir des mises à jour par e-mail sur vos réservations et votre compte',
    ar: 'تلقي تحديثات البريد الإلكتروني حول حجوزاتك وحسابك'
  },
  'accountSecurity': {
    en: 'Account Security',
    fr: 'Sécurité du compte',
    ar: 'أمان الحساب'
  },
  'accountStatus': {
    en: 'Account Status',
    fr: 'Statut du compte',
    ar: 'حالة الحساب'
  },
  'verificationStatus': {
    en: 'Verification Status',
    fr: 'Statut de vérification',
    ar: 'حالة التحقق'
  },
  'notVerified': {
    en: 'Not Verified',
    fr: 'Non vérifié',
    ar: 'غير محقق'
  },
  'verified': {
    en: 'Verified',
    fr: 'Vérifié',
    ar: 'محقق'
  },
  'active': {
    en: 'Active',
    fr: 'Actif',
    ar: 'نشط'
  },
  'inactive': {
    en: 'Inactive',
    fr: 'Inactif',
    ar: 'غير نشط'
  },
  'signOut': {
    en: 'Sign Out',
    fr: 'Se déconnecter',
    ar: 'تسجيل الخروج'
  },
  'signOutDescription': {
    en: 'Sign out of your account on this device',
    fr: 'Déconnectez-vous de votre compte sur cet appareil',
    ar: 'تسجيل الخروج من حسابك على هذا الجهاز'
  },
  'logout': {
    en: 'Logout',
    fr: 'Déconnexion',
    ar: 'تسجيل خروج'
  },
  
  // Address and personal information
  'wilaya': {
    en: 'Wilaya',
    fr: 'Wilaya',
    ar: 'الولاية'
  },
  'selectWilaya': {
    en: 'Select Wilaya',
    fr: 'Sélectionnez la wilaya',
    ar: 'اختر الولاية'
  },
  'sex': {
    en: 'Sex',
    fr: 'Sexe',
    ar: 'الجنس'
  },
  'selectSex': {
    en: 'Select Sex',
    fr: 'Sélectionnez le sexe',
    ar: 'اختر الجنس'
  },
  'male': {
    en: 'Male',
    fr: 'Homme',
    ar: 'ذكر'
  },
  'female': {
    en: 'Female',
    fr: 'Femme',
    ar: 'أنثى'
  },
  
  // Profile preview
  'previewProfile': {
    en: 'Preview Profile',
    fr: 'Aperçu du profil',
    ar: 'معاينة الملف الشخصي'
  },
  'viewAsOthers': {
    en: 'View as others see you',
    fr: 'Voir comme les autres vous voient',
    ar: 'عرض كما يراك الآخرون'
  },
  'joinedIn': {
    en: 'Joined',
    fr: 'Inscrit',
    ar: 'انضم في'
  },
  'failedToUpdate': {
    en: 'Failed to update profile',
    fr: 'Échec de la mise à jour du profil',
    ar: 'فشل في تحديث الملف الشخصي'
  },
  'saving': {
    en: 'Saving...',
    fr: 'Enregistrement...',
    ar: 'حفظ...'
  },
  'saveChanges': {
    en: 'Save Changes',
    fr: 'Enregistrer les modifications',
    ar: 'حفظ التغييرات'
  },
  'profileUpdated': {
    en: 'Profile updated successfully',
    fr: 'Profil mis à jour avec succès',
    ar: 'تم تحديث الملف الشخصي بنجاح'
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