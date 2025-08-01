import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Language = 'en' | 'fr' | 'ar';

interface LanguageStore {
  language: Language;
  setLanguage: (lang: Language) => void;
}

export const useLanguage = create<LanguageStore>()(
  persist(
    (set) => ({
      language: 'en',
      setLanguage: (language) => set({ language }),
    }),
    {
      name: 'language-storage',
    }
  )
);

export const translations = {
  en: {
    // Navigation & Common
    home: 'Home',
    profile: 'Profile',
    settings: 'Settings',
    admin: 'Admin',
    back: 'Back',
    save: 'Save',
    cancel: 'Cancel',
    edit: 'Edit',
    delete: 'Delete',
    loading: 'Loading...',
    search: 'Search',
    logout: 'Logout',
    login: 'Login',
    
    // Home Page
    hello: 'Hello',
    whatServiceToday: 'What service do you need today?',
    searchServices: 'Search for services...',
    popularServices: 'Popular Services',
    recentBookings: 'Recent Bookings',
    viewAll: 'View All',
    noBookingsYet: 'No bookings yet',
    bookFirstService: 'Book your first service to get started',
    viewAllServices: 'View All Services',
    moreCategories: 'more categories',
    
    // Auth & Profile
    getStarted: 'Get Started',
    signInWithGoogle: 'Sign in with Google',
    firstName: 'First Name',
    lastName: 'Last Name',
    email: 'Email',
    phone: 'Phone',
    address: 'Address',
    city: 'City',
    state: 'State',
    zipCode: 'ZIP Code',
    
    // Settings
    manageAccountPreferences: 'Manage your account preferences',
    profileInformation: 'Profile Information',
    addressInformation: 'Address Information',
    streetAddress: 'Street Address',
    notifications: 'Notifications',
    emailNotifications: 'Email Notifications',
    receiveEmailUpdates: 'Receive email updates about your bookings and account',
    accountSecurity: 'Account Security',
    accountStatus: 'Account Status',
    verificationStatus: 'Verification Status',
    active: 'Active',
    inactive: 'Inactive',
    verified: 'Verified',
    notVerified: 'Not Verified',
    signOut: 'Sign Out',
    signOutDescription: 'Sign out of your account on this device',
    language: 'Language',
    selectLanguage: 'Select Language',
    
    // Profile Menu Items
    editProfile: 'Edit Profile',
    paymentMethods: 'Payment Methods',
    savedAddresses: 'Saved Addresses',
    locationSettings: 'Location Settings',
    earningsAnalytics: 'Earnings & Analytics',
    reviewsRatings: 'Reviews & Ratings',
    verificationCenter: 'Identity & Verification',
    preferencesPrivacy: 'Preferences & Privacy',
    helpCenter: 'Help & Support',
    
    // Admin Panel
    adminPanel: 'Admin Panel',
    manageUsers: 'Manage all user accounts and system access',
    totalUsers: 'Total Users',
    serviceSeekers: 'Service Seekers',
    serviceProviders: 'Service Providers',
    companies: 'Companies',
    support: 'Support',
    allUsers: 'All Users',
    changeRole: 'Change Role',
    toggleStatus: 'Toggle Status',
    deleteUser: 'Delete User',
    deleteUserConfirm: 'Are you sure you want to delete this user? This action cannot be undone.',
    cannotChangeOwnRole: 'Cannot change your own role',
    cannotDeactivateOwn: 'Cannot deactivate your own account',
    cannotDeleteOwn: 'Cannot delete your own account',
    
    // Service Categories
    plumbing: 'Plumbing',
    electrical: 'Electrical',
    hvac: 'HVAC',
    acRepair: 'AC Repair',
    handyman: 'Handyman',
    painting: 'Painting',
    roofing: 'Roofing',
    flooring: 'Flooring',
    kitchenRemodeling: 'Kitchen Remodeling',
    bathroomRemodeling: 'Bathroom Remodeling',
    cleaning: 'Cleaning',
    landscaping: 'Landscaping',
    carpentry: 'Carpentry',
    tiling: 'Tiling',
    locksmith: 'Locksmith',
    
    // Signup & Authentication
    createAccount: 'Create Account',
    signupWith: 'Sign up with',
    orContinueWith: 'or continue with',
    joinThousands: 'Join thousands of users connecting with local service providers',
    accountType: 'Account Type',
    findServices: 'Find and book services',
    offerServices: 'Offer your services',
    businessAccount: 'Business services',
    enterFirstName: 'Enter your first name',
    enterLastName: 'Enter your last name',
    enterEmail: 'Enter your email address',
    enterPassword: 'Enter your password',
    confirmPassword: 'Confirm Password',
    dateOfBirth: 'Date of Birth',
    gender: 'Gender',
    selectGender: 'Select your gender',
    male: 'Male',
    female: 'Female',
    other: 'Other',
    wilaya: 'Wilaya',
    selectWilaya: 'Select your wilaya',
    enterCity: 'Enter your city',
    enterFullAddress: 'Enter your full address',
    companyInformation: 'Company Information',
    companyName: 'Company Name',
    enterCompanyName: 'Enter your company name',
    companyDescription: 'Company Description',
    describeYourCompany: 'Describe your company and services',
    businessLicense: 'Business License',
    enterLicenseNumber: 'Enter your license number',
    professionalInformation: 'Professional Information',
    experience: 'Experience Level',
    selectExperience: 'Select your experience level',
    beginner: 'Beginner',
    intermediate: 'Intermediate',
    experienced: 'Experienced',
    expert: 'Expert',
    years: 'years',
    hourlyRate: 'Hourly Rate',
    almostDone: 'Almost Done!',
    reviewAndAgree: 'Please review your information and agree to our terms',
    iAgreeToThe: 'I agree to the',
    termsOfService: 'Terms of Service',
    privacyPolicy: 'Privacy Policy',
    receiveMarketing: 'I would like to receive marketing emails and updates',
    accountSummary: 'Account Summary',
    name: 'Name',
    location: 'Location',
    previous: 'Previous',
    next: 'Next',
    creatingAccount: 'Creating Account...',
    alreadyHaveAccount: 'Already have an account?',
    signIn: 'Sign In',
    
    // Roles
    serviceSeeker: 'Service Seeker',
    serviceProvider: 'Service Provider',
    company: 'Company',
    administrator: 'Administrator',
    
    // Messages
    success: 'Success',
    error: 'Error',
    unauthorized: 'Unauthorized',
    profileUpdated: 'Profile updated successfully',
    failedToUpdate: 'Failed to update profile',
    userRoleUpdated: 'User role updated successfully',
    userStatusUpdated: 'User status updated successfully',
    userDeleted: 'User deleted successfully',
    loggedOut: 'You are logged out. Logging in again...',
    
    // Signup
    chooseAccountType: 'Choose Your Account Type',
    serviceSeekerDesc: 'Find and book home services',
    serviceProviderDesc: 'Provide services to customers',
    companyDesc: 'Manage multiple service providers',
  },
  
  fr: {
    // Navigation & Common
    home: 'Accueil',
    profile: 'Profil',
    settings: 'Paramètres',
    admin: 'Admin',
    back: 'Retour',
    save: 'Enregistrer',
    cancel: 'Annuler',
    edit: 'Modifier',
    delete: 'Supprimer',
    loading: 'Chargement...',
    search: 'Rechercher',
    logout: 'Déconnexion',
    login: 'Connexion',
    
    // Auth & Profile
    getStarted: 'Commencer',
    signInWithGoogle: 'Se connecter avec Google',
    
    // Home Page
    hello: 'Bonjour',
    whatServiceToday: 'De quel service avez-vous besoin aujourd\'hui ?',
    searchServices: 'Rechercher des services...',
    popularServices: 'Services Populaires',
    recentBookings: 'Réservations Récentes',
    viewAll: 'Voir Tout',
    noBookingsYet: 'Aucune réservation pour le moment',
    bookFirstService: 'Réservez votre premier service pour commencer',
    viewAllServices: 'Voir Tous les Services',
    moreCategories: 'catégories supplémentaires',
    
    // Auth & Profile
    getStarted: 'Commencer',
    firstName: 'Prénom',
    lastName: 'Nom',
    email: 'Email',
    phone: 'Téléphone',
    address: 'Adresse',
    city: 'Ville',
    state: 'État',
    zipCode: 'Code Postal',
    
    // Settings
    manageAccountPreferences: 'Gérer vos préférences de compte',
    profileInformation: 'Informations du Profil',
    addressInformation: 'Informations d\'Adresse',
    streetAddress: 'Adresse de la Rue',
    notifications: 'Notifications',
    emailNotifications: 'Notifications Email',
    receiveEmailUpdates: 'Recevoir des mises à jour par email sur vos réservations et votre compte',
    accountSecurity: 'Sécurité du Compte',
    accountStatus: 'Statut du Compte',
    verificationStatus: 'Statut de Vérification',
    active: 'Actif',
    inactive: 'Inactif',
    verified: 'Vérifié',
    notVerified: 'Non Vérifié',
    signOut: 'Déconnexion',
    signOutDescription: 'Se déconnecter de votre compte sur cet appareil',
    language: 'Langue',
    selectLanguage: 'Sélectionner la Langue',
    
    // Profile Menu Items
    editProfile: 'Modifier le Profil',
    paymentMethods: 'Méthodes de Paiement',
    savedAddresses: 'Adresses Sauvegardées',
    locationSettings: 'Paramètres de Localisation',
    earningsAnalytics: 'Revenus et Analyses',
    reviewsRatings: 'Avis et Évaluations',
    verificationCenter: 'Identité et Vérification',
    preferencesPrivacy: 'Préférences et Confidentialité',
    helpCenter: 'Aide et Support',
    
    // Admin Panel
    adminPanel: 'Panneau d\'Administration',
    manageUsers: 'Gérer tous les comptes utilisateur et l\'accès au système',
    totalUsers: 'Total Utilisateurs',
    serviceSeekers: 'Demandeurs de Services',
    serviceProviders: 'Fournisseurs de Services',
    companies: 'Entreprises',
    support: 'Support',
    allUsers: 'Tous les Utilisateurs',
    changeRole: 'Changer le Rôle',
    toggleStatus: 'Basculer le Statut',
    deleteUser: 'Supprimer l\'Utilisateur',
    deleteUserConfirm: 'Êtes-vous sûr de vouloir supprimer cet utilisateur ? Cette action ne peut pas être annulée.',
    cannotChangeOwnRole: 'Impossible de changer votre propre rôle',
    cannotDeactivateOwn: 'Impossible de désactiver votre propre compte',
    cannotDeleteOwn: 'Impossible de supprimer votre propre compte',
    
    // Service Categories
    plumbing: 'Plomberie',
    electrical: 'Électricité',
    hvac: 'CVC',
    acRepair: 'Réparation de Climatisation',
    handyman: 'Bricoleur',
    painting: 'Peinture',
    roofing: 'Toiture',
    flooring: 'Revêtement de Sol',
    kitchenRemodeling: 'Rénovation de Cuisine',
    bathroomRemodeling: 'Rénovation de Salle de Bain',
    cleaning: 'Nettoyage',
    landscaping: 'Aménagement Paysager',
    carpentry: 'Menuiserie',
    tiling: 'Carrelage',
    locksmith: 'Serrurier',
    
    // Signup & Authentication
    createAccount: 'Créer un Compte',
    signupWith: "S'inscrire avec",
    orContinueWith: 'ou continuer avec',
    joinThousands: 'Rejoignez des milliers d\'utilisateurs qui se connectent avec des prestataires locaux',
    accountType: 'Type de Compte',
    findServices: 'Trouver et réserver des services',
    offerServices: 'Offrir vos services',
    businessAccount: 'Services professionnels',
    enterFirstName: 'Entrez votre prénom',
    enterLastName: 'Entrez votre nom de famille',
    enterEmail: 'Entrez votre adresse email',
    enterPassword: 'Entrez votre mot de passe',
    confirmPassword: 'Confirmer le Mot de Passe',
    dateOfBirth: 'Date de Naissance',
    gender: 'Genre',
    selectGender: 'Sélectionnez votre genre',
    male: 'Homme',
    female: 'Femme',
    other: 'Autre',
    wilaya: 'Wilaya',
    selectWilaya: 'Sélectionnez votre wilaya',
    enterCity: 'Entrez votre ville',
    enterFullAddress: 'Entrez votre adresse complète',
    companyInformation: 'Informations sur l\'Entreprise',
    companyName: 'Nom de l\'Entreprise',
    enterCompanyName: 'Entrez le nom de votre entreprise',
    companyDescription: 'Description de l\'Entreprise',
    describeYourCompany: 'Décrivez votre entreprise et vos services',
    businessLicense: 'Licence Commerciale',
    enterLicenseNumber: 'Entrez votre numéro de licence',
    professionalInformation: 'Informations Professionnelles',
    experience: 'Niveau d\'Expérience',
    selectExperience: 'Sélectionnez votre niveau d\'expérience',
    beginner: 'Débutant',
    intermediate: 'Intermédiaire',
    experienced: 'Expérimenté',
    expert: 'Expert',
    years: 'ans',
    hourlyRate: 'Tarif Horaire',
    almostDone: 'Presque Terminé !',
    reviewAndAgree: 'Veuillez vérifier vos informations et accepter nos conditions',
    iAgreeToThe: 'J\'accepte les',
    termsOfService: 'Conditions de Service',
    privacyPolicy: 'Politique de Confidentialité',
    receiveMarketing: 'Je souhaite recevoir des emails marketing et des actualités',
    accountSummary: 'Résumé du Compte',
    name: 'Nom',
    location: 'Localisation',
    previous: 'Précédent',
    next: 'Suivant',
    creatingAccount: 'Création du Compte...',
    alreadyHaveAccount: 'Vous avez déjà un compte ?',
    signIn: 'Se Connecter',
    
    // Roles
    serviceSeeker: 'Demandeur de Service',
    serviceProvider: 'Fournisseur de Service',
    company: 'Entreprise',
    administrator: 'Administrateur',
    
    // Messages
    success: 'Succès',
    error: 'Erreur',
    unauthorized: 'Non Autorisé',
    profileUpdated: 'Profil mis à jour avec succès',
    failedToUpdate: 'Échec de la mise à jour du profil',
    userRoleUpdated: 'Rôle utilisateur mis à jour avec succès',
    userStatusUpdated: 'Statut utilisateur mis à jour avec succès',
    userDeleted: 'Utilisateur supprimé avec succès',
    loggedOut: 'Vous êtes déconnecté. Reconnexion...',
    
    // Signup
    chooseAccountType: 'Choisissez Votre Type de Compte',
    serviceSeekerDesc: 'Trouver et réserver des services à domicile',
    serviceProviderDesc: 'Fournir des services aux clients',
    companyDesc: 'Gérer plusieurs fournisseurs de services',
  },
  
  ar: {
    // Navigation & Common
    home: 'الرئيسية',
    profile: 'الملف الشخصي',
    settings: 'الإعدادات',
    admin: 'المشرف',
    back: 'رجوع',
    save: 'حفظ',
    cancel: 'إلغاء',
    edit: 'تعديل',
    delete: 'حذف',
    loading: 'جاري التحميل...',
    search: 'بحث',
    logout: 'تسجيل الخروج',
    login: 'تسجيل الدخول',
    
    // Home Page
    hello: 'مرحباً',
    whatServiceToday: 'أي خدمة تحتاجها اليوم؟',
    searchServices: 'البحث عن الخدمات...',
    popularServices: 'الخدمات الشائعة',
    recentBookings: 'الحجوزات الأخيرة',
    viewAll: 'عرض الكل',
    noBookingsYet: 'لا توجد حجوزات بعد',
    bookFirstService: 'احجز خدمتك الأولى للبدء',
    viewAllServices: 'عرض جميع الخدمات',
    moreCategories: 'فئات أخرى',
    
    // Auth & Profile
    getStarted: 'ابدأ الآن',
    signInWithGoogle: 'تسجيل الدخول باستخدام جوجل',
    firstName: 'الاسم الأول',
    lastName: 'اسم العائلة',
    email: 'البريد الإلكتروني',
    phone: 'الهاتف',
    address: 'العنوان',
    city: 'المدينة',
    state: 'الولاية',
    zipCode: 'الرمز البريدي',
    
    // Settings
    manageAccountPreferences: 'إدارة تفضيلات حسابك',
    profileInformation: 'معلومات الملف الشخصي',
    addressInformation: 'معلومات العنوان',
    streetAddress: 'عنوان الشارع',
    notifications: 'الإشعارات',
    emailNotifications: 'إشعارات البريد الإلكتروني',
    receiveEmailUpdates: 'تلقي تحديثات البريد الإلكتروني حول حجوزاتك وحسابك',
    accountSecurity: 'أمان الحساب',
    accountStatus: 'حالة الحساب',
    verificationStatus: 'حالة التحقق',
    active: 'نشط',
    inactive: 'غير نشط',
    verified: 'محقق',
    notVerified: 'غير محقق',
    signOut: 'تسجيل الخروج',
    signOutDescription: 'تسجيل الخروج من حسابك على هذا الجهاز',
    language: 'اللغة',
    selectLanguage: 'اختر اللغة',
    
    // Profile Menu Items
    editProfile: 'تحرير الملف الشخصي',
    paymentMethods: 'طرق الدفع',
    savedAddresses: 'العناوين المحفوظة',
    locationSettings: 'إعدادات الموقع',
    earningsAnalytics: 'الأرباح والتحليلات',
    reviewsRatings: 'المراجعات والتقييمات',
    verificationCenter: 'الهوية والتحقق',
    preferencesPrivacy: 'التفضيلات والخصوصية',
    helpCenter: 'المساعدة والدعم',
    
    // Admin Panel
    adminPanel: 'لوحة الإدارة',
    manageUsers: 'إدارة جميع حسابات المستخدمين والوصول إلى النظام',
    totalUsers: 'إجمالي المستخدمين',
    serviceSeekers: 'طالبو الخدمات',
    serviceProviders: 'مقدمو الخدمات',
    companies: 'الشركات',
    support: 'الدعم',
    allUsers: 'جميع المستخدمين',
    changeRole: 'تغيير الدور',
    toggleStatus: 'تبديل الحالة',
    deleteUser: 'حذف المستخدم',
    deleteUserConfirm: 'هل أنت متأكد من أنك تريد حذف هذا المستخدم؟ لا يمكن التراجع عن هذا الإجراء.',
    cannotChangeOwnRole: 'لا يمكن تغيير دورك الخاص',
    cannotDeactivateOwn: 'لا يمكن إلغاء تنشيط حسابك الخاص',
    cannotDeleteOwn: 'لا يمكن حذف حسابك الخاص',
    
    // Service Categories
    plumbing: 'السباكة',
    electrical: 'الكهرباء',
    hvac: 'التدفئة والتهوية',
    acRepair: 'إصلاح المكيفات',
    handyman: 'الصيانة العامة',
    painting: 'الطلاء',
    roofing: 'الأسقف',
    flooring: 'الأرضيات',
    kitchenRemodeling: 'تجديد المطبخ',
    bathroomRemodeling: 'تجديد الحمام',
    cleaning: 'التنظيف',
    landscaping: 'تنسيق الحدائق',
    carpentry: 'النجارة',
    tiling: 'البلاط',
    locksmith: 'الأقفال',
    
    // Signup & Authentication
    createAccount: 'إنشاء حساب',
    signupWith: 'التسجيل باستخدام',
    orContinueWith: 'أو المتابعة باستخدام',
    joinThousands: 'انضم إلى آلاف المستخدمين المتصلين بمقدمي الخدمات المحليين',
    accountType: 'نوع الحساب',
    findServices: 'البحث عن الخدمات وحجزها',
    offerServices: 'عرض خدماتك',
    businessAccount: 'خدمات الأعمال',
    enterFirstName: 'أدخل اسمك الأول',
    enterLastName: 'أدخل اسم عائلتك',
    enterEmail: 'أدخل عنوان بريدك الإلكتروني',
    enterPassword: 'أدخل كلمة المرور',
    confirmPassword: 'تأكيد كلمة المرور',
    dateOfBirth: 'تاريخ الميلاد',
    gender: 'الجنس',
    selectGender: 'اختر جنسك',
    male: 'ذكر',
    female: 'أنثى',
    other: 'آخر',
    wilaya: 'الولاية',
    selectWilaya: 'اختر ولايتك',
    enterCity: 'أدخل مدينتك',
    enterFullAddress: 'أدخل عنوانك الكامل',
    companyInformation: 'معلومات الشركة',
    companyName: 'اسم الشركة',
    enterCompanyName: 'أدخل اسم شركتك',
    companyDescription: 'وصف الشركة',
    describeYourCompany: 'صف شركتك وخدماتك',
    businessLicense: 'رخصة العمل',
    enterLicenseNumber: 'أدخل رقم الرخصة',
    professionalInformation: 'المعلومات المهنية',
    experience: 'مستوى الخبرة',
    selectExperience: 'اختر مستوى خبرتك',
    beginner: 'مبتدئ',
    intermediate: 'متوسط',
    experienced: 'خبير',
    expert: 'محترف',
    years: 'سنوات',
    hourlyRate: 'السعر بالساعة',
    almostDone: 'أوشكنا على الانتهاء!',
    reviewAndAgree: 'يرجى مراجعة معلوماتك والموافقة على شروطنا',
    iAgreeToThe: 'أوافق على',
    termsOfService: 'شروط الخدمة',
    privacyPolicy: 'سياسة الخصوصية',
    receiveMarketing: 'أرغب في تلقي رسائل التسويق والتحديثات',
    accountSummary: 'ملخص الحساب',
    name: 'الاسم',
    location: 'الموقع',
    previous: 'السابق',
    next: 'التالي',
    creatingAccount: 'جاري إنشاء الحساب...',
    alreadyHaveAccount: 'هل لديك حساب بالفعل؟',
    signIn: 'تسجيل الدخول',
    
    // Roles
    serviceSeeker: 'طالب خدمة',
    serviceProvider: 'مقدم خدمة',
    company: 'شركة',
    administrator: 'مشرف',
    
    // Messages
    success: 'نجح',
    error: 'خطأ',
    unauthorized: 'غير مخول',
    profileUpdated: 'تم تحديث الملف الشخصي بنجاح',
    failedToUpdate: 'فشل في تحديث الملف الشخصي',
    userRoleUpdated: 'تم تحديث دور المستخدم بنجاح',
    userStatusUpdated: 'تم تحديث حالة المستخدم بنجاح',
    userDeleted: 'تم حذف المستخدم بنجاح',
    loggedOut: 'تم تسجيل خروجك. جاري تسجيل الدخول مرة أخرى...',
    
    // Signup
    chooseAccountType: 'اختر نوع حسابك',
    serviceSeekerDesc: 'العثور على وحجز الخدمات المنزلية',
    serviceProviderDesc: 'تقديم الخدمات للعملاء',
    companyDesc: 'إدارة عدة مقدمي خدمات',
  },
};

export function useTranslation() {
  const { language } = useLanguage();
  
  const t = (key: keyof typeof translations.en): string => {
    return translations[language][key] || translations.en[key] || key;
  };
  
  return { t, language };
}

export const getLanguageDirection = (lang: Language): 'ltr' | 'rtl' => {
  return lang === 'ar' ? 'rtl' : 'ltr';
};

export const getLanguageName = (lang: Language): string => {
  const names = {
    en: 'English',
    fr: 'Français', 
    ar: 'العربية'
  };
  return names[lang];
};

export const translateCategoryName = (categoryName: string, language: Language): string => {
  // Convert category name to camelCase key
  const key = categoryName
    .toLowerCase()
    .replace(/[^a-z0-9]/g, ' ')
    .trim()
    .split(' ')
    .map((word, index) => index === 0 ? word : word.charAt(0).toUpperCase() + word.slice(1))
    .join('');
  
  // Return translated category name or original if not found
  return translations[language][key as keyof typeof translations.en] || categoryName;
};