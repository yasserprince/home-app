import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link } from "wouter";
import { ArrowLeft, User, Building, Eye, EyeOff, Calendar, MapPin, Phone, Mail } from "lucide-react";
import { useTranslation, getLanguageDirection } from "@/lib/i18n";
import { LanguageSelector } from "@/components/language-selector";

// Algerian Wilayas (all 58)
const algerianWilayas = [
  { code: "01", name: "Adrar", nameAr: "أدرار" },
  { code: "02", name: "Chlef", nameAr: "الشلف" },
  { code: "03", name: "Laghouat", nameAr: "الأغواط" },
  { code: "04", name: "Oum El Bouaghi", nameAr: "أم البواقي" },
  { code: "05", name: "Batna", nameAr: "باتنة" },
  { code: "06", name: "Béjaïa", nameAr: "بجاية" },
  { code: "07", name: "Biskra", nameAr: "بسكرة" },
  { code: "08", name: "Bechar", nameAr: "بشار" },
  { code: "09", name: "Blida", nameAr: "البليدة" },
  { code: "10", name: "Bouira", nameAr: "البويرة" },
  { code: "11", name: "Tamanrasset", nameAr: "تمنراست" },
  { code: "12", name: "Tébessa", nameAr: "تبسة" },
  { code: "13", name: "Tlemcen", nameAr: "تلمسان" },
  { code: "14", name: "Tiaret", nameAr: "تيارت" },
  { code: "15", name: "Tizi Ouzou", nameAr: "تيزي وزو" },
  { code: "16", name: "Alger", nameAr: "الجزائر" },
  { code: "17", name: "Djelfa", nameAr: "الجلفة" },
  { code: "18", name: "Jijel", nameAr: "جيجل" },
  { code: "19", name: "Sétif", nameAr: "سطيف" },
  { code: "20", name: "Saïda", nameAr: "سعيدة" },
  { code: "21", name: "Skikda", nameAr: "سكيكدة" },
  { code: "22", name: "Sidi Bel Abbès", nameAr: "سيدي بلعباس" },
  { code: "23", name: "Annaba", nameAr: "عنابة" },
  { code: "24", name: "Guelma", nameAr: "قالمة" },
  { code: "25", name: "Constantine", nameAr: "قسنطينة" },
  { code: "26", name: "Médéa", nameAr: "المدية" },
  { code: "27", name: "Mostaganem", nameAr: "مستغانم" },
  { code: "28", name: "M'Sila", nameAr: "المسيلة" },
  { code: "29", name: "Mascara", nameAr: "معسكر" },
  { code: "30", name: "Ouargla", nameAr: "ورقلة" },
  { code: "31", name: "Oran", nameAr: "وهران" },
  { code: "32", name: "El Bayadh", nameAr: "البيض" },
  { code: "33", name: "Illizi", nameAr: "إليزي" },
  { code: "34", name: "Bordj Bou Arréridj", nameAr: "برج بوعريريج" },
  { code: "35", name: "Boumerdès", nameAr: "بومرداس" },
  { code: "36", name: "El Tarf", nameAr: "الطارف" },
  { code: "37", name: "Tindouf", nameAr: "تندوف" },
  { code: "38", name: "Tissemsilt", nameAr: "تسمسيلت" },
  { code: "39", name: "El Oued", nameAr: "الوادي" },
  { code: "40", name: "Khenchela", nameAr: "خنشلة" },
  { code: "41", name: "Souk Ahras", nameAr: "سوق أهراس" },
  { code: "42", name: "Tipaza", nameAr: "تيبازة" },
  { code: "43", name: "Mila", nameAr: "ميلة" },
  { code: "44", name: "Aïn Defla", nameAr: "عين الدفلى" },
  { code: "45", name: "Naâma", nameAr: "النعامة" },
  { code: "46", name: "Aïn Témouchent", nameAr: "عين تيموشنت" },
  { code: "47", name: "Ghardaïa", nameAr: "غرداية" },
  { code: "48", name: "Relizane", nameAr: "غليزان" },
  { code: "49", name: "Timimoun", nameAr: "تيميمون" },
  { code: "50", name: "Bordj Badji Mokhtar", nameAr: "برج باجي مختار" },
  { code: "51", name: "Ouled Djellal", nameAr: "أولاد جلال" },
  { code: "52", name: "Béni Abbès", nameAr: "بني عباس" },
  { code: "53", name: "In Salah", nameAr: "عين صالح" },
  { code: "54", name: "In Guezzam", nameAr: "عين قزام" },
  { code: "55", name: "Touggourt", nameAr: "تقرت" },
  { code: "56", name: "Djanet", nameAr: "جانت" },
  { code: "57", name: "El M'Ghair", nameAr: "المغير" },
  { code: "58", name: "El Meniaa", nameAr: "المنيعة" }
];

const signupSchema = z.object({
  accountType: z.enum(["service_seeker", "service_provider", "company"]),
  // Personal Information
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(10, "Phone number must be at least 10 digits"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string(),
  dateOfBirth: z.string().min(1, "Date of birth is required"),
  gender: z.enum(["male", "female", "other"]),
  
  // Location
  wilaya: z.string().min(1, "Wilaya is required"),
  city: z.string().min(2, "City is required"),
  address: z.string().min(5, "Address is required"),
  
  // Company Information (conditional)
  companyName: z.string().optional(),
  companyDescription: z.string().optional(),
  businessLicense: z.string().optional(),
  
  // Service Provider Information (conditional)
  services: z.array(z.string()).optional(),
  experience: z.string().optional(),
  hourlyRate: z.string().optional(),
  
  // Legal
  agreeToTerms: z.boolean().refine(val => val === true, "You must agree to the terms"),
  agreeToPrivacy: z.boolean().refine(val => val === true, "You must agree to the privacy policy"),
  allowMarketing: z.boolean().optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type SignupFormData = z.infer<typeof signupSchema>;

export default function Signup() {
  const { t, language } = useTranslation();
  const [currentStep, setCurrentStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      accountType: "service_seeker",
      allowMarketing: false,
      agreeToTerms: false,
      agreeToPrivacy: false,
    },
  });

  const { watch, setValue, formState } = form;
  const accountType = watch("accountType");

  const handleSocialSignup = (provider: 'google' | 'facebook' | 'apple') => {
    // Redirect to social auth endpoints
    window.location.href = `/api/auth/${provider}`;
  };

  const onSubmit = async (data: SignupFormData) => {
    console.log('Form submitted with data:', data);
    setIsLoading(true);
    try {
      console.log('Sending signup request...');
      const response = await fetch('/api/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      console.log('Response status:', response.status);
      const result = await response.json();
      console.log('Response result:', result);

      if (result.success) {
        console.log('Signup successful, redirecting...');
        // Redirect to login or dashboard
        window.location.href = '/api/login';
      } else {
        console.error('Signup failed:', result.message);
        alert(`Signup failed: ${result.message}`);
      }
    } catch (error) {
      console.error('Signup error:', error);
      alert(`Signup error: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  const nextStep = () => {
    if (currentStep < 4) setCurrentStep(currentStep + 1);
  };

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4" dir={getLanguageDirection(language)}>
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Link href="/">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              {t('back')}
            </Button>
          </Link>
          <LanguageSelector variant="compact" />
        </div>

        <Card className="shadow-lg">
          <CardHeader className="space-y-1 text-center">
            <CardTitle className="text-2xl font-bold">{t('createAccount')}</CardTitle>
            <CardDescription>
              {t('joinThousands')}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Social Signup Options */}
            <div className="space-y-3">
              <div className="text-center text-sm text-gray-600 mb-4">
                {t('signupWith')}
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <Button
                  variant="outline"
                  onClick={() => handleSocialSignup('google')}
                  className="flex items-center gap-2 py-6"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  Google
                </Button>

                <Button
                  variant="outline"
                  onClick={() => handleSocialSignup('facebook')}
                  className="flex items-center gap-2 py-6"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="#1877F2" d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                  Facebook
                </Button>

                <Button
                  variant="outline"
                  onClick={() => handleSocialSignup('apple')}
                  className="flex items-center gap-2 py-6"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="currentColor" d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
                  </svg>
                  Apple
                </Button>
              </div>

              <div className="relative my-6">
                <Separator />
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="bg-white px-4 text-sm text-gray-500">{t('orContinueWith')}</span>
                </div>
              </div>
            </div>

            {/* Multi-step Form */}
            <form onSubmit={form.handleSubmit(onSubmit, (errors) => {
              console.log('Form validation errors:', errors);
              alert('Please check the form for errors: ' + Object.keys(errors).join(', '));
            })} className="space-y-6">
              {/* Progress Indicator */}
              <div className="flex justify-center mb-6">
                <div className="flex space-x-2">
                  {[1, 2, 3, 4].map((step) => (
                    <div
                      key={step}
                      className={`w-3 h-3 rounded-full ${
                        step <= currentStep ? 'bg-primary' : 'bg-gray-300'
                      }`}
                    />
                  ))}
                </div>
              </div>

              {/* Step 1: Account Type & Basic Info */}
              {currentStep === 1 && (
                <div className="space-y-4">
                  <div>
                    <Label className="text-base font-semibold">{t('accountType')}</Label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-3">
                      <Card 
                        className={`cursor-pointer transition-all ${
                          accountType === 'service_seeker' ? 'ring-2 ring-primary' : ''
                        }`}
                        onClick={() => setValue('accountType', 'service_seeker')}
                      >
                        <CardContent className="p-4 text-center">
                          <User className="w-8 h-8 mx-auto mb-2 text-primary" />
                          <h3 className="font-medium">{t('serviceSeeker')}</h3>
                          <p className="text-xs text-gray-600 mt-1">{t('findServices')}</p>
                        </CardContent>
                      </Card>

                      <Card 
                        className={`cursor-pointer transition-all ${
                          accountType === 'service_provider' ? 'ring-2 ring-primary' : ''
                        }`}
                        onClick={() => setValue('accountType', 'service_provider')}
                      >
                        <CardContent className="p-4 text-center">
                          <User className="w-8 h-8 mx-auto mb-2 text-primary" />
                          <h3 className="font-medium">{t('serviceProvider')}</h3>
                          <p className="text-xs text-gray-600 mt-1">{t('offerServices')}</p>
                        </CardContent>
                      </Card>

                      <Card 
                        className={`cursor-pointer transition-all ${
                          accountType === 'company' ? 'ring-2 ring-primary' : ''
                        }`}
                        onClick={() => setValue('accountType', 'company')}
                      >
                        <CardContent className="p-4 text-center">
                          <Building className="w-8 h-8 mx-auto mb-2 text-primary" />
                          <h3 className="font-medium">{t('company')}</h3>
                          <p className="text-xs text-gray-600 mt-1">{t('businessAccount')}</p>
                        </CardContent>
                      </Card>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="firstName">{t('firstName')} *</Label>
                      <Input
                        id="firstName"
                        {...form.register('firstName')}
                        placeholder={t('enterFirstName')}
                      />
                      {formState.errors.firstName && (
                        <p className="text-sm text-red-600 mt-1">
                          {formState.errors.firstName.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="lastName">{t('lastName')} *</Label>
                      <Input
                        id="lastName"
                        {...form.register('lastName')}
                        placeholder={t('enterLastName')}
                      />
                      {formState.errors.lastName && (
                        <p className="text-sm text-red-600 mt-1">
                          {formState.errors.lastName.message}
                        </p>
                      )}
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="email">{t('email')} *</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="email"
                        type="email"
                        {...form.register('email')}
                        placeholder={t('enterEmail')}
                        className="pl-10"
                      />
                    </div>
                    {formState.errors.email && (
                      <p className="text-sm text-red-600 mt-1">
                        {formState.errors.email.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="phone">{t('phone')} *</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="phone"
                        type="tel"
                        {...form.register('phone')}
                        placeholder="+213 XXX XXX XXX"
                        className="pl-10"
                      />
                    </div>
                    {formState.errors.phone && (
                      <p className="text-sm text-red-600 mt-1">
                        {formState.errors.phone.message}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Step 2: Personal Details */}
              {currentStep === 2 && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="password">{t('password')} *</Label>
                      <div className="relative">
                        <Input
                          id="password"
                          type={showPassword ? "text" : "password"}
                          {...form.register('password')}
                          placeholder={t('enterPassword')}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                      </div>
                      {formState.errors.password && (
                        <p className="text-sm text-red-600 mt-1">
                          {formState.errors.password.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="confirmPassword">{t('confirmPassword')} *</Label>
                      <div className="relative">
                        <Input
                          id="confirmPassword"
                          type={showConfirmPassword ? "text" : "password"}
                          {...form.register('confirmPassword')}
                          placeholder={t('confirmPassword')}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        >
                          {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                      </div>
                      {formState.errors.confirmPassword && (
                        <p className="text-sm text-red-600 mt-1">
                          {formState.errors.confirmPassword.message}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="dateOfBirth">{t('dateOfBirth')} *</Label>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          id="dateOfBirth"
                          type="date"
                          {...form.register('dateOfBirth')}
                          className="pl-10"
                        />
                      </div>
                      {formState.errors.dateOfBirth && (
                        <p className="text-sm text-red-600 mt-1">
                          {formState.errors.dateOfBirth.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="gender">{t('gender')} *</Label>
                      <Select onValueChange={(value) => setValue('gender', value as any)}>
                        <SelectTrigger>
                          <SelectValue placeholder={t('selectGender')} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="male">{t('male')}</SelectItem>
                          <SelectItem value="female">{t('female')}</SelectItem>
                          <SelectItem value="other">{t('other')}</SelectItem>
                        </SelectContent>
                      </Select>
                      {formState.errors.gender && (
                        <p className="text-sm text-red-600 mt-1">
                          {formState.errors.gender.message}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Step 3: Location */}
              {currentStep === 3 && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="wilaya">{t('wilaya')} *</Label>
                      <Select onValueChange={(value) => setValue('wilaya', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder={t('selectWilaya')} />
                        </SelectTrigger>
                        <SelectContent className="max-h-60">
                          {algerianWilayas.map((wilaya) => (
                            <SelectItem key={wilaya.code} value={wilaya.code}>
                              {`${wilaya.code} - ${wilaya.name} (${wilaya.nameAr})`}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {formState.errors.wilaya && (
                        <p className="text-sm text-red-600 mt-1">
                          {formState.errors.wilaya.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="city">{t('city')} *</Label>
                      <Input
                        id="city"
                        {...form.register('city')}
                        placeholder={t('enterCity')}
                      />
                      {formState.errors.city && (
                        <p className="text-sm text-red-600 mt-1">
                          {formState.errors.city.message}
                        </p>
                      )}
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="address">{t('address')} *</Label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Textarea
                        id="address"
                        {...form.register('address')}
                        placeholder={t('enterFullAddress')}
                        className="pl-10"
                        rows={3}
                      />
                    </div>
                    {formState.errors.address && (
                      <p className="text-sm text-red-600 mt-1">
                        {formState.errors.address.message}
                      </p>
                    )}
                  </div>

                  {/* Company Information */}
                  {accountType === 'company' && (
                    <div className="space-y-4 border-t pt-4">
                      <h3 className="font-semibold text-lg">{t('companyInformation')}</h3>
                      
                      <div>
                        <Label htmlFor="companyName">{t('companyName')} *</Label>
                        <Input
                          id="companyName"
                          {...form.register('companyName')}
                          placeholder={t('enterCompanyName')}
                        />
                      </div>

                      <div>
                        <Label htmlFor="companyDescription">{t('companyDescription')}</Label>
                        <Textarea
                          id="companyDescription"
                          {...form.register('companyDescription')}
                          placeholder={t('describeYourCompany')}
                          rows={3}
                        />
                      </div>

                      <div>
                        <Label htmlFor="businessLicense">{t('businessLicense')}</Label>
                        <Input
                          id="businessLicense"
                          {...form.register('businessLicense')}
                          placeholder={t('enterLicenseNumber')}
                        />
                      </div>
                    </div>
                  )}

                  {/* Service Provider Information */}
                  {accountType === 'service_provider' && (
                    <div className="space-y-4 border-t pt-4">
                      <h3 className="font-semibold text-lg">{t('professionalInformation')}</h3>
                      
                      <div>
                        <Label htmlFor="experience">{t('experience')}</Label>
                        <Select onValueChange={(value) => setValue('experience', value)}>
                          <SelectTrigger>
                            <SelectValue placeholder={t('selectExperience')} />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="beginner">{t('beginner')} (0-1 {t('years')})</SelectItem>
                            <SelectItem value="intermediate">{t('intermediate')} (2-5 {t('years')})</SelectItem>
                            <SelectItem value="experienced">{t('experienced')} (5-10 {t('years')})</SelectItem>
                            <SelectItem value="expert">{t('expert')} (10+ {t('years')})</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label htmlFor="hourlyRate">{t('hourlyRate')} (DZD)</Label>
                        <Input
                          id="hourlyRate"
                          type="number"
                          {...form.register('hourlyRate')}
                          placeholder="2000"
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Step 4: Terms & Completion */}
              {currentStep === 4 && (
                <div className="space-y-6">
                  <div className="text-center">
                    <h3 className="text-lg font-semibold mb-2">{t('almostDone')}</h3>
                    <p className="text-gray-600">{t('reviewAndAgree')}</p>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-start space-x-3">
                      <Checkbox
                        id="agreeToTerms"
                        checked={watch('agreeToTerms')}
                        onCheckedChange={(checked) => setValue('agreeToTerms', !!checked)}
                      />
                      <Label htmlFor="agreeToTerms" className="text-sm leading-5">
                        {t('iAgreeToThe')} <Link href="/terms" className="text-primary hover:underline">{t('termsOfService')}</Link>
                      </Label>
                    </div>
                    {formState.errors.agreeToTerms && (
                      <p className="text-sm text-red-600">
                        {formState.errors.agreeToTerms.message}
                      </p>
                    )}

                    <div className="flex items-start space-x-3">
                      <Checkbox
                        id="agreeToPrivacy"
                        checked={watch('agreeToPrivacy')}
                        onCheckedChange={(checked) => setValue('agreeToPrivacy', !!checked)}
                      />
                      <Label htmlFor="agreeToPrivacy" className="text-sm leading-5">
                        {t('iAgreeToThe')} <Link href="/privacy" className="text-primary hover:underline">{t('privacyPolicy')}</Link>
                      </Label>
                    </div>
                    {formState.errors.agreeToPrivacy && (
                      <p className="text-sm text-red-600">
                        {formState.errors.agreeToPrivacy.message}
                      </p>
                    )}

                    <div className="flex items-start space-x-3">
                      <Checkbox
                        id="allowMarketing"
                        checked={watch('allowMarketing')}
                        onCheckedChange={(checked) => setValue('allowMarketing', !!checked)}
                      />
                      <Label htmlFor="allowMarketing" className="text-sm leading-5">
                        {t('receiveMarketing')}
                      </Label>
                    </div>
                  </div>

                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-blue-900 mb-2">{t('accountSummary')}</h4>
                    <div className="space-y-1 text-sm text-blue-800">
                      <p><strong>{t('accountType')}:</strong> {t(accountType)}</p>
                      <p><strong>{t('name')}:</strong> {watch('firstName')} {watch('lastName')}</p>
                      <p><strong>{t('email')}:</strong> {watch('email')}</p>
                      <p><strong>{t('location')}:</strong> {watch('city')}, {algerianWilayas.find(w => w.code === watch('wilaya'))?.name}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="flex justify-between pt-6 border-t">
                {currentStep > 1 && (
                  <Button type="button" variant="outline" onClick={prevStep}>
                    {t('previous')}
                  </Button>
                )}
                
                {currentStep < 4 ? (
                  <Button type="button" onClick={nextStep} className="ml-auto">
                    {t('next')}
                  </Button>
                ) : (
                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="ml-auto"
                  >
                    {isLoading ? t('creatingAccount') : t('createAccount')}
                  </Button>
                )}
              </div>
            </form>

            {/* Login Link */}
            <div className="text-center pt-6 border-t">
              <p className="text-sm text-gray-600">
                {t('alreadyHaveAccount')}{' '}
                <Link href="/login" className="text-primary hover:underline font-medium">
                  {t('signIn')}
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}