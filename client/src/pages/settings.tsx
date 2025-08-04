import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Settings as SettingsIcon, 
  User as UserIcon, 
  Bell, 
  Shield, 
  MapPin,
  Save,
  ArrowLeft,
  Users,
  UserCheck,
  Briefcase
} from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Link } from "wouter";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import type { User } from "@shared/schema";
import BottomNavigation from "@/components/bottom-navigation";
import { useTranslation } from "@/hooks/useTranslation";
import { LanguageSelector } from "@/components/language-selector";
import { ObjectUploader } from "@/components/ObjectUploader";
import { ProfileImageUploader } from "@/components/ProfileImageUploader";
import { PortfolioManager } from "@/components/PortfolioManager";
import { ProfilePreview } from "@/components/ProfilePreview";
import { ALGERIA_WILAYAS } from "@shared/wilayas";
import type { UploadResult } from "@uppy/core";

export default function Settings() {
  const { user, isLoading: userLoading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { t, language, isRTL } = useTranslation();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    phone: user?.phone || '',
    address: user?.address || '',
    city: user?.city || '',
    state: user?.state || '',
    wilaya: user?.wilaya || '',
    zipCode: user?.zipCode || '',
    sex: user?.sex || '',
    notifications: user?.notifications || false,
    role: user?.role || 'service_seeker',
    accountType: user?.accountType || 'individual',
    companyName: user?.companyName || '',
    bio: user?.bio || ''
  });

  const updateProfileMutation = useMutation({
    mutationFn: async (data: Partial<User>) => {
      await apiRequest("PUT", "/api/profile", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      setIsEditing(false);
      toast({
        title: t('success'),
        description: t('profileUpdated'),
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: t('unauthorized'),
          description: t('loggedOut'),
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: t('error'),
        description: t('failedToUpdate'),
        variant: "destructive",
      });
    },
  });

  const handleSave = () => {
    console.log('Saving profile data:', formData);
    updateProfileMutation.mutate(formData);
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (userLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <SettingsIcon className="mx-auto h-12 w-12 text-muted-foreground animate-pulse mb-4" />
          <p className="text-muted-foreground">{t('loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="bg-primary text-white p-6 pt-12">
        <div className="flex items-center gap-4 mb-4">
          <Link href="/profile">
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-white hover:bg-blue-600 border border-white/20 hover:border-white/40 px-3 py-2"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              {t('back')}
            </Button>
          </Link>
          <div>
            <h1 className="text-xl font-semibold">{t('settings')}</h1>
            <p className="text-blue-200 text-sm">{t('manageAccountPreferences')}</p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Profile Section */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div className="flex items-center gap-2">
              <UserIcon className="h-5 w-5" />
              <CardTitle>{t('profileInformation')}</CardTitle>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={user?.role === 'admin' ? 'destructive' : 'outline'}>
                {user?.role?.replace('_', ' ')}
              </Badge>
              <div className="flex items-center gap-2">
                <ProfilePreview user={user} />
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => setIsEditing(!isEditing)}
                >
                  {t('edit')}
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4 mb-6">
              <ProfileImageUploader 
                currentImageUrl={user?.profileImageUrl} 
                userName={`${user?.firstName || ''} ${user?.lastName || ''}`.trim()}
              />
              <div>
                <h3 className="font-medium text-lg">
                  {user?.firstName && user?.lastName 
                    ? `${user.firstName} ${user.lastName}`
                    : user?.email
                  }
                </h3>
                <p className="text-sm text-muted-foreground">{user?.email}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="firstName">{t('firstName')}</Label>
                <Input
                  id="firstName"
                  value={isEditing ? formData.firstName : user?.firstName || ''}
                  onChange={(e) => handleInputChange('firstName', e.target.value)}
                  disabled={!isEditing}
                  placeholder={t('firstName')}
                />
              </div>
              <div>
                <Label htmlFor="lastName">{t('lastName')}</Label>
                <Input
                  id="lastName"
                  value={isEditing ? formData.lastName : user?.lastName || ''}
                  onChange={(e) => handleInputChange('lastName', e.target.value)}
                  disabled={!isEditing}
                  placeholder={t('lastName')}
                />
              </div>
              <div>
                <Label htmlFor="phone">{t('phone')}</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={isEditing ? formData.phone : user?.phone || ''}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  disabled={!isEditing}
                  placeholder={t('phone')}
                />
              </div>
              <div>
                <Label htmlFor="email">{t('email')}</Label>
                <Input
                  id="email"
                  type="email"
                  value={user?.email || ''}
                  disabled
                  className="bg-gray-50"
                />
              </div>
              <div className="col-span-2">
                <Label htmlFor="bio">Bio (Max 300 characters)</Label>
                <Textarea
                  id="bio"
                  value={isEditing ? formData.bio : user?.bio || ''}
                  onChange={(e) => {
                    if (e.target.value.length <= 300) {
                      handleInputChange('bio', e.target.value);
                    }
                  }}
                  disabled={!isEditing}
                  placeholder="Tell us about yourself... (Max 300 characters)"
                  maxLength={300}
                  className="resize-none"
                  rows={3}
                />
                <div className="text-right text-xs text-muted-foreground mt-1">
                  {(isEditing ? formData.bio : user?.bio || '').length}/300
                </div>
              </div>
            </div>

            {isEditing && (
              <div className="flex justify-end gap-2 pt-4">
                <Button
                  onClick={handleSave}
                  disabled={updateProfileMutation.isPending}
                  className="flex items-center gap-2"
                >
                  <Save className="h-4 w-4" />
                  {updateProfileMutation.isPending ? `${t('save')}...` : `${t('save')} Changes`}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Account Type Section */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              <CardTitle>{t('accountType')}</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
              <div className="flex items-center gap-3">
                {user?.role === 'service_seeker' && <Users className="h-6 w-6 text-blue-600" />}
                {user?.role === 'service_provider' && <UserCheck className="h-6 w-6 text-green-600" />}
                {user?.role === 'company' && <Briefcase className="h-6 w-6 text-purple-600" />}
                <div>
                  <p className="font-medium">
                    {user?.role === 'service_seeker' && t('roleSeeker')}
                    {user?.role === 'service_provider' && t('roleProvider')}
                    {user?.role === 'company' && t('roleCompany')}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {user?.role === 'service_seeker' && "Find and book services"}
                    {user?.role === 'service_provider' && "Provide individual services"}
                    {user?.role === 'company' && "Manage business services"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={user?.role === 'service_seeker' ? 'default' : 'secondary'}>
                  Current
                </Badge>
                {!isEditing && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsEditing(true)}
                    className="text-xs"
                  >
                    Change
                  </Button>
                )}
              </div>
            </div>

            {!isEditing && (
              <div className="text-center py-2">
                <p className="text-sm text-muted-foreground">
                  Click "Edit" above or "Change" button to modify your account type
                </p>
              </div>
            )}

            {isEditing && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="role">{t('changeAccountType')}</Label>
                  <Select
                    value={formData.role}
                    onValueChange={(value) => handleInputChange('role', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="service_seeker">
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4" />
                          {t('roleSeeker')} - Find services
                        </div>
                      </SelectItem>
                      <SelectItem value="service_provider">
                        <div className="flex items-center gap-2">
                          <UserCheck className="h-4 w-4" />
                          {t('roleProvider')} - Provide services
                        </div>
                      </SelectItem>
                      <SelectItem value="company">
                        <div className="flex items-center gap-2">
                          <Briefcase className="h-4 w-4" />
                          {t('roleCompany')} - Business account
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {formData.role === 'company' && (
                  <div>
                    <Label htmlFor="companyName">{t('companyName')} *</Label>
                    <Input
                      id="companyName"
                      value={formData.companyName}
                      onChange={(e) => handleInputChange('companyName', e.target.value)}
                      placeholder="Enter company name"
                      required
                    />
                  </div>
                )}

                <div className="p-4 bg-amber-50 dark:bg-amber-950 rounded-lg">
                  <p className="text-sm text-amber-800 dark:text-amber-200">
                    <strong>Important:</strong> Changing your account type will affect your available features and how others can find you on the platform.
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Address Section */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              <CardTitle>{t('addressInformation')}</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="address">{t('streetAddress')}</Label>
              <Textarea
                id="address"
                rows={2}
                value={isEditing ? formData.address : user?.address || ''}
                onChange={(e) => handleInputChange('address', e.target.value)}
                disabled={!isEditing}
                placeholder={t('streetAddress')}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="city">{t('city')}</Label>
                <Input
                  id="city"
                  value={isEditing ? formData.city : user?.city || ''}
                  onChange={(e) => handleInputChange('city', e.target.value)}
                  disabled={!isEditing}
                  placeholder={t('city')}
                />
              </div>
              <div>
                <Label htmlFor="state">{t('state')}</Label>
                <Input
                  id="state"
                  value={isEditing ? formData.state : user?.state || ''}
                  onChange={(e) => handleInputChange('state', e.target.value)}
                  disabled={!isEditing}
                  placeholder={t('state')}
                />
              </div>
              <div>
                <Label htmlFor="wilaya">{t('wilaya')}</Label>
                <Select
                  value={isEditing ? formData.wilaya : user?.wilaya || ''}
                  onValueChange={(value) => handleInputChange('wilaya', value)}
                  disabled={!isEditing}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t('selectWilaya')} />
                  </SelectTrigger>
                  <SelectContent>
                    {ALGERIA_WILAYAS.map((wilaya) => (
                      <SelectItem key={wilaya.code} value={wilaya.code}>
                        {language === 'ar' ? wilaya.arabic : wilaya.latin} ({wilaya.code})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="zipCode">{t('zipCode')}</Label>
                <Input
                  id="zipCode"
                  value={isEditing ? formData.zipCode : user?.zipCode || ''}
                  onChange={(e) => handleInputChange('zipCode', e.target.value)}
                  disabled={!isEditing}
                  placeholder={t('zipCode')}
                />
              </div>
            </div>
            
            {/* Additional Profile Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div>
                <Label htmlFor="sex">{t('sex')}</Label>
                <Select
                  value={isEditing ? formData.sex : user?.sex || ''}
                  onValueChange={(value) => handleInputChange('sex', value)}
                  disabled={!isEditing}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t('selectSex')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">{t('male')}</SelectItem>
                    <SelectItem value="female">{t('female')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>



        {/* Notifications Section */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              <CardTitle>{t('notifications')}</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="notifications" className="text-base font-medium">
                  {t('emailNotifications')}
                </Label>
                <p className="text-sm text-muted-foreground">
                  {t('receiveEmailUpdates')}
                </p>
              </div>
              <Switch
                id="notifications"
                checked={isEditing ? formData.notifications : user?.notifications || false}
                onCheckedChange={(checked) => handleInputChange('notifications', checked)}
                disabled={!isEditing}
              />
            </div>
          </CardContent>
        </Card>

        {/* Account Security */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              <CardTitle>{t('accountSecurity')}</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium">{t('accountStatus')}</p>
                <p className="text-sm text-muted-foreground">
                  Your account is {user?.isActive ? t('active') : t('inactive')}
                </p>
              </div>
              <Badge variant={user?.isActive ? 'default' : 'secondary'}>
                {user?.isActive ? t('active') : t('inactive')}
              </Badge>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium">{t('verificationStatus')}</p>
                <p className="text-sm text-muted-foreground">
                  Your account is {user?.isVerified ? t('verified') : t('notVerified')}
                </p>
              </div>
              <Badge variant={user?.isVerified ? 'default' : 'outline'}>
                {user?.isVerified ? t('verified') : t('notVerified')}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Logout Section */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">{t('signOut')}</p>
                <p className="text-sm text-muted-foreground">
                  {t('signOutDescription')}
                </p>
              </div>
              <Button 
                variant="outline" 
                className="text-red-600 hover:text-red-700"
                onClick={async () => {
                  try {
                    await fetch('/api/logout', { method: 'POST', credentials: 'include' });
                    window.location.href = '/';
                  } catch (error) {
                    console.error('Logout error:', error);
                    window.location.href = '/api/logout'; // Fallback to GET
                  }
                }}
              >
                {t('logout')}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Portfolio Management for Service Providers */}
        {user?.role === 'service_provider' && user?.id && (
          <PortfolioManager 
            userId={user.id} 
            isProvider={true} 
          />
        )}

        {/* Save Button at Bottom */}
        {isEditing && (
          <Card>
            <CardContent className="pt-6">
              <div className="flex justify-end gap-3">
                <Button
                  variant="outline"
                  onClick={() => setIsEditing(false)}
                >
                  {t('cancel')}
                </Button>
                <Button
                  onClick={handleSave}
                  disabled={updateProfileMutation.isPending}
                  className="flex items-center gap-2"
                >
                  <Save className="h-4 w-4" />
                  {updateProfileMutation.isPending ? t('saving') : t('saveChanges')}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      <BottomNavigation activeTab="profile" />
    </div>
  );
}