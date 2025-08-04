import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useLocation, Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { ArrowLeft, User as UserIcon, MapPin, Shield, Bell, HelpCircle } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { ProfileImageUploader } from "@/components/ProfileImageUploader";
import { ProfilePreview } from "@/components/ProfilePreview";
import { useTranslation } from "@/hooks/useTranslation";
import { wilayas } from "@shared/wilayas";

export default function ProfileEdit() {
  const { user, isLoading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();
  const { t, isRTL } = useTranslation();

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    phone: user?.phone || "",
    bio: user?.bio || "",
    address: user?.address || "",
    wilaya: user?.wilaya || "",
    locationEnabled: user?.locationEnabled || false,
    notificationsEnabled: user?.notificationsEnabled || true,
    role: user?.role || 'seeker'
  });

  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        phone: user.phone || "",
        bio: user.bio || "",
        address: user.address || "",
        wilaya: user.wilaya || "",
        locationEnabled: user.locationEnabled || false,
        notificationsEnabled: user.notificationsEnabled || true,
        role: user.role || 'seeker'
      });
    }
  }, [user]);

  const updateProfileMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest("PUT", "/api/profile", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      toast({
        title: t('success'),
        description: t('profileUpdated'),
      });
      setIsEditing(false);
    },
    onError: (error) => {
      console.error("Profile update error:", error);
      toast({
        title: t('error'),
        description: t('failedToUpdate'),
        variant: "destructive",
      });
    },
  });

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    if (isEditing) {
      updateProfileMutation.mutate(formData);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">{t('loading')}...</p>
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
            <h1 className="text-xl font-semibold">{t('editProfile')}</h1>
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
                  placeholder={t('tellUsAboutYourself')}
                  rows={3}
                  className="resize-none"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  {(isEditing ? formData.bio : user?.bio || '').length}/300 characters
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Location Section */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              <CardTitle>{t('location')}</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="wilaya">{t('wilaya')}</Label>
                <select
                  id="wilaya"
                  value={isEditing ? formData.wilaya : user?.wilaya || ''}
                  onChange={(e) => handleInputChange('wilaya', e.target.value)}
                  disabled={!isEditing}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="">{t('selectWilaya')}</option>
                  {wilayas.map((wilaya) => (
                    <option key={wilaya.code} value={wilaya.name}>
                      {wilaya.code} - {wilaya.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <Label htmlFor="address">{t('address')}</Label>
                <Input
                  id="address"
                  value={isEditing ? formData.address : user?.address || ''}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  disabled={!isEditing}
                  placeholder={t('enterYourAddress')}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Account Management Section */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              <CardTitle>{t('accountManagement')}</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <h4 className="font-medium">{t('accountType')}</h4>
                <p className="text-sm text-muted-foreground">
                  {t('currentlySignedUpAs')}: <span className="font-medium capitalize">{user?.role}</span>
                </p>
              </div>
              <Link href="/signup-choice">
                <Button variant="outline" size="sm">
                  {t('change')}
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link href="/notifications">
            <Card className="cursor-pointer hover:shadow-md transition-shadow">
              <CardContent className="flex items-center gap-3 p-4">
                <Bell className="h-5 w-5 text-blue-600" />
                <div>
                  <h4 className="font-medium">{t('notifications')}</h4>
                  <p className="text-sm text-muted-foreground">{t('manageNotificationSettings')}</p>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/help-support">
            <Card className="cursor-pointer hover:shadow-md transition-shadow">
              <CardContent className="flex items-center gap-3 p-4">
                <HelpCircle className="h-5 w-5 text-green-600" />
                <div>
                  <h4 className="font-medium">{t('helpSupport')}</h4>
                  <p className="text-sm text-muted-foreground">{t('getHelpOrContactSupport')}</p>
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>

        {/* Save Button - Only show when editing */}
        {isEditing && (
          <div className="sticky bottom-6 z-10">
            <Button
              onClick={handleSave}
              className="w-full"
              disabled={updateProfileMutation.isPending}
            >
              {updateProfileMutation.isPending ? t('saving') : t('saveChanges')}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}