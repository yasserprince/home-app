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
    handyman: 'Handyman',
    painting: 'Painting',
    roofing: 'Roofing',
    flooring: 'Flooring',
    kitchenRemodeling: 'Kitchen Remodeling',
    bathroomRemodeling: 'Bathroom Remodeling',
    cleaning: 'Cleaning',
    
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
    handyman: 'Bricoleur',
    painting: 'Peinture',
    roofing: 'Toiture',
    flooring: 'Revêtement de Sol',
    kitchenRemodeling: 'Rénovation de Cuisine',
    bathroomRemodeling: 'Rénovation de Salle de Bain',
    cleaning: 'Nettoyage',
    
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
    handyman: 'الصيانة العامة',
    painting: 'الطلاء',
    roofing: 'الأسقف',
    flooring: 'الأرضيات',
    kitchenRemodeling: 'تجديد المطبخ',
    bathroomRemodeling: 'تجديد الحمام',
    cleaning: 'التنظيف',
    
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