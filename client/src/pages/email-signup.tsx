import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useTranslation } from "@/lib/i18n";
import { algerianWilayas } from "@/lib/wilayas";
import { ArrowLeft, Users, UserCheck, Briefcase, Eye, EyeOff } from "lucide-react";
import { Link, useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function EmailSignup() {
  const { t } = useTranslation();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [formData, setFormData] = useState({
    role: new URLSearchParams(window.location.search).get('role') || 'seeker',
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    phone: '',
    dateOfBirth: '',
    gender: '',
    address: '',
    wilaya: '',
    commune: '',
    postalCode: ''
  });

  const signupMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const { confirmPassword, ...signupData } = data;
      const response = await apiRequest("POST", "/api/auth/signup", signupData);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: t('accountCreated'),
        description: t('welcomeToServiceNow'),
      });
      setLocation('/');
    },
    onError: (error: any) => {
      toast({
        title: t('signupFailed'),
        description: error.message || "Please try again",
        variant: "destructive",
      });
    },
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      toast({
        title: t('passwordMismatch'),
        description: t('passwordsDoNotMatch'),
        variant: "destructive",
      });
      return;
    }

    if (formData.password.length < 8) {
      toast({
        title: t('passwordTooShort'),
        description: t('passwordMinLength'),
        variant: "destructive",
      });
      return;
    }

    signupMutation.mutate(formData);
  };

  const roleIcons = {
    seeker: Users,
    provider: UserCheck,
    company: Briefcase
  };

  const RoleIcon = roleIcons[formData.role as keyof typeof roleIcons] || Users;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <Link href="/signup">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              {t('back')}
            </Button>
          </Link>
          
          <div className="mx-auto w-16 h-16 rounded-full bg-blue-50 dark:bg-blue-950 flex items-center justify-center mb-4">
            <RoleIcon className="w-8 h-8 text-blue-600 dark:text-blue-400" />
          </div>
          
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            {t('createAccount')}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {t('signupAs')} {formData.role === 'seeker' ? t('roleSeeker') : formData.role === 'provider' ? t('roleProvider') : t('roleCompany')}
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{t('accountInformation')}</CardTitle>
            <CardDescription>{t('fillRequiredFields')}</CardDescription>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Role Selection */}
              <div>
                <Label htmlFor="role">{t('accountType')} *</Label>
                <Select value={formData.role} onValueChange={(value) => handleInputChange('role', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="seeker">{t('roleSeeker')}</SelectItem>
                    <SelectItem value="provider">{t('roleProvider')}</SelectItem>
                    <SelectItem value="company">{t('roleCompany')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Basic Information */}
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName">{t('firstName')} *</Label>
                  <Input
                    id="firstName"
                    value={formData.firstName}
                    onChange={(e) => handleInputChange('firstName', e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="lastName">{t('lastName')} *</Label>
                  <Input
                    id="lastName"
                    value={formData.lastName}
                    onChange={(e) => handleInputChange('lastName', e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Contact Information */}
              <div>
                <Label htmlFor="email">{t('email')} *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  required
                />
              </div>

              <div>
                <Label htmlFor="phone">{t('phone')} *</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+213 XXX XXX XXX"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  required
                />
              </div>

              {/* Password */}
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="password">{t('password')} *</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={formData.password}
                      onChange={(e) => handleInputChange('password', e.target.value)}
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
                <div>
                  <Label htmlFor="confirmPassword">{t('confirmPassword')} *</Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      value={formData.confirmPassword}
                      onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
              </div>

              {/* Personal Information */}
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="dateOfBirth">{t('dateOfBirth')}</Label>
                  <Input
                    id="dateOfBirth"
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="gender">{t('gender')}</Label>
                  <Select value={formData.gender} onValueChange={(value) => handleInputChange('gender', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder={t('selectGender')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">{t('male')}</SelectItem>
                      <SelectItem value="female">{t('female')}</SelectItem>
                      <SelectItem value="other">{t('other')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Location Information */}
              <div>
                <Label htmlFor="address">{t('address')}</Label>
                <Textarea
                  id="address"
                  value={formData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  placeholder={t('enterFullAddress')}
                />
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="wilaya">{t('wilaya')} *</Label>
                  <Select value={formData.wilaya} onValueChange={(value) => handleInputChange('wilaya', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder={t('selectWilaya')} />
                    </SelectTrigger>
                    <SelectContent>
                      {algerianWilayas.map((wilaya) => (
                        <SelectItem key={wilaya.code} value={wilaya.code}>
                          {wilaya.code} - {wilaya.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="commune">{t('commune')}</Label>
                  <Input
                    id="commune"
                    value={formData.commune}
                    onChange={(e) => handleInputChange('commune', e.target.value)}
                    placeholder={t('enterCommune')}
                  />
                </div>
                <div>
                  <Label htmlFor="postalCode">{t('postalCode')}</Label>
                  <Input
                    id="postalCode"
                    value={formData.postalCode}
                    onChange={(e) => handleInputChange('postalCode', e.target.value)}
                    placeholder="XXXXX"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-6">
                <Link href="/signin" className="text-sm text-blue-600 dark:text-blue-400 hover:underline">
                  {t('alreadyHaveAccount')}
                </Link>
                <Button 
                  type="submit" 
                  disabled={signupMutation.isPending}
                  className="px-8"
                >
                  {signupMutation.isPending ? t('creatingAccount') : t('createAccount')}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}