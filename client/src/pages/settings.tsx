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
  ArrowLeft
} from "lucide-react";
import { Link } from "wouter";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import type { User } from "@shared/schema";
import BottomNavigation from "@/components/bottom-navigation";
import { useTranslation, getLanguageDirection, translations } from "@/lib/i18n";
import { LanguageSelector } from "@/components/language-selector";

export default function Settings() {
  const { user, isLoading: userLoading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { t, language } = useTranslation();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    phone: user?.phone || '',
    address: user?.address || '',
    city: user?.city || '',
    state: user?.state || '',
    zipCode: user?.zipCode || '',
    notifications: user?.notifications || false,
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
    <div className="min-h-screen bg-gray-50 pb-20" dir={getLanguageDirection(language)}>
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
                {t(user?.role?.replace('_', '') as keyof typeof translations.en) || user?.role?.replace('_', ' ')}
              </Badge>
              <Button
                variant={isEditing ? "outline" : "default"}
                size="sm"
                onClick={() => setIsEditing(!isEditing)}
              >
                {isEditing ? t('cancel') : t('edit')}
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4 mb-6">
              {user?.profileImageUrl ? (
                <img
                  src={user.profileImageUrl}
                  alt="Profile"
                  className="w-16 h-16 rounded-full object-cover border-2 border-gray-200"
                />
              ) : (
                <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center text-white font-semibold text-lg">
                  {((user?.firstName?.[0] || '') + (user?.lastName?.[0] || user?.email?.[0] || '')).toUpperCase().slice(0, 2) || 'U'}
                </div>
              )}
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
          </CardContent>
        </Card>

        {/* Language Section */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <div className="h-5 w-5">🌐</div>
              <CardTitle>{t('language')}</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-base font-medium">
                  {t('selectLanguage')}
                </Label>
                <p className="text-sm text-muted-foreground">
                  Choose your preferred language
                </p>
              </div>
              <LanguageSelector />
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
              <Button variant="outline" asChild>
                <a href="/api/logout" className="text-red-600 hover:text-red-700">
                  {t('logout')}
                </a>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <BottomNavigation activeTab="profile" />
    </div>
  );
}