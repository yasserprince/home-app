import React, { useState, useEffect } from "react";
import { Link } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { useTranslation } from "@/hooks/useTranslation";
import { wilayas } from "@shared/wilayas";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import ModernAvatar from "@/components/ModernAvatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ProfileImageManager } from "@/components/ProfileImageManager";
import { LanguageSelector } from "@/components/language-selector";
import BottomNavigation from "@/components/bottom-navigation";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  Camera,
  Save,
  User,
  Phone,
  Mail,
  MapPin,
  FileText,
  Settings,
  Bell,
  HelpCircle,
  Shield,
  Edit3,
  Check,
  X
} from "lucide-react";

export default function ProfileEdit() {
  const { user, isLoading } = useAuth();
  const { t } = useTranslation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [avatarKey, setAvatarKey] = useState(0); // Force avatar refresh
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    bio: '',
    location: '',
    gender: ''
  });

  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        phone: user.phone || '',
        bio: user.bio || '',
        location: user.wilaya || '',
        gender: user.sex || ''
      });
    }
  }, [user]);

  const handleInputChange = (field: string, value: string) => {
    if (field === 'bio' && value.length > 300) return;
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Map frontend field names to backend field names
      const backendData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone,
        bio: formData.bio,
        wilaya: formData.location, // Map location to wilaya
        sex: formData.gender        // Map gender to sex
      };

      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(backendData),
      });

      if (response.ok) {
        toast({
          title: "Profile Updated",
          description: "Your profile has been successfully updated.",
        });
        setIsEditing(false);
        
        // Invalidate and refetch user data without page refresh
        await queryClient.invalidateQueries({ queryKey: ['/api/auth/user'] });
      } else {
        throw new Error('Failed to update profile');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    if (user) {
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        phone: user.phone || '',
        bio: user.bio || '',
        location: user.wilaya || '',
        gender: user.sex || ''
      });
    }
    setIsEditing(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-white/30 border-t-white rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white/70">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 relative overflow-hidden">
      {/* Animated Background Orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute top-40 left-1/2 w-80 h-80 bg-indigo-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      <div className="relative z-10 max-w-md mx-auto p-4 pb-24">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 pt-4">
          <div className="flex items-center gap-3">
            <Link href="/profile">
              <Button variant="ghost" size="icon" className="text-white hover:bg-white/10">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-white">{t('editProfile')}</h1>
              <p className="text-white/70 text-sm">Update your information</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <LanguageSelector variant="compact" />
            {isEditing && (
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleCancel}
                  className="text-white hover:bg-white/10"
                >
                  <X className="w-5 h-5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleSave}
                  disabled={isSaving}
                  className="text-green-400 hover:bg-green-400/10"
                >
                  {isSaving ? (
                    <div className="w-4 h-4 border-2 border-green-400/30 border-t-green-400 rounded-full animate-spin" />
                  ) : (
                    <Check className="w-5 h-5" />
                  )}
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Profile Picture Card */}
        <Card className="mb-6 bg-white/10 backdrop-blur-lg border-white/20">
          <CardContent className="p-6">
            <div className="flex flex-col items-center gap-4">
              <ProfileImageManager
                currentImageUrl={user?.profileImageUrl}
                userName={user?.firstName && user?.lastName ? `${user.firstName} ${user.lastName}` : user?.firstName || ''}
                userEmail={user?.email || ''}
                size={96}
                className="ring-4 ring-white/20"
              />
              <div className="text-center">
                <h3 className="text-lg font-semibold text-white">
                  {user?.firstName && user?.lastName ? `${user.firstName} ${user.lastName}` : 'User'}
                </h3>
                <p className="text-white/70 text-sm">@{user?.email?.split('@')[0] || 'user'}</p>
                <Badge variant="secondary" className="mt-2 bg-green-500/20 text-green-300 hover:bg-green-500/30">
                  Online
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Personal Information */}
        <Card className="mb-6 bg-white/10 backdrop-blur-lg border-white/20">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <h3 className="text-lg font-semibold text-white">Personal Information</h3>
            {!isEditing && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsEditing(true)}
                className="text-blue-400 hover:text-blue-300 hover:bg-blue-400/10"
              >
                <Edit3 className="w-4 h-4 mr-2" />
                Edit
              </Button>
            )}
          </CardHeader>
          <CardContent className="pt-0 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium text-white/80 flex items-center gap-2">
                  <User className="w-4 h-4" />
                  First Name
                </Label>
                {isEditing ? (
                  <Input
                    value={formData.firstName}
                    onChange={(e) => handleInputChange('firstName', e.target.value)}
                    className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                    placeholder="Enter first name"
                  />
                ) : (
                  <p className="text-white bg-white/5 rounded-md px-3 py-2 border border-white/10">
                    {user?.firstName || 'Not set'}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium text-white/80">Last Name</Label>
                {isEditing ? (
                  <Input
                    value={formData.lastName}
                    onChange={(e) => handleInputChange('lastName', e.target.value)}
                    className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                    placeholder="Enter last name"
                  />
                ) : (
                  <p className="text-white bg-white/5 rounded-md px-3 py-2 border border-white/10">
                    {user?.lastName || 'Not set'}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium text-white/80 flex items-center gap-2">
                <Phone className="w-4 h-4" />
                Phone Number
              </Label>
              {isEditing ? (
                <Input
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                  placeholder="Enter phone number"
                  type="tel"
                />
              ) : (
                <p className="text-white bg-white/5 rounded-md px-3 py-2 border border-white/10">
                  {user?.phone || 'Not set'}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium text-white/80 flex items-center gap-2">
                <Mail className="w-4 h-4" />
                Email
              </Label>
              <p className="text-white/70 bg-white/5 rounded-md px-3 py-2 border border-white/10">
                {user?.email} <span className="text-xs text-white/50">(cannot be changed)</span>
              </p>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium text-white/80">Gender</Label>
              {isEditing ? (
                <Select value={formData.gender} onValueChange={(value) => handleInputChange('gender', value)}>
                  <SelectTrigger className="bg-white/10 border-white/20 text-white">
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800/95 backdrop-blur-lg border-gray-700">
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                  </SelectContent>
                </Select>
              ) : (
                <p className="text-white bg-white/5 rounded-md px-3 py-2 border border-white/10 capitalize">
                  {user?.sex || 'Not set'}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium text-white/80 flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                Location (Wilaya)
              </Label>
              {isEditing ? (
                <Select value={formData.location} onValueChange={(value) => handleInputChange('location', value)}>
                  <SelectTrigger className="bg-white/10 border-white/20 text-white">
                    <SelectValue placeholder="Select your wilaya" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800/95 backdrop-blur-lg border-gray-700 max-h-60">
                    {wilayas.map((wilaya) => (
                      <SelectItem key={wilaya.code} value={wilaya.name}>
                        <div className="flex items-center justify-between w-full">
                          <span className="text-white">{wilaya.code} - {wilaya.name}</span>
                          <span className="text-white/60 text-sm mr-2" dir="rtl">{wilaya.arabic}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <div className="text-white bg-white/5 rounded-md px-3 py-2 border border-white/10">
                  {user?.wilaya ? (
                    <div className="flex items-center justify-between">
                      <span>{user.wilaya}</span>
                      <span className="text-white/60 text-sm" dir="rtl">
                        {wilayas.find(w => w.name === user.wilaya)?.arabic || ''}
                      </span>
                    </div>
                  ) : (
                    'Not set'
                  )}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium text-white/80 flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Bio {isEditing && <span className="text-xs text-white/50">({formData.bio.length}/300)</span>}
              </Label>
              {isEditing ? (
                <Textarea
                  value={formData.bio}
                  onChange={(e) => handleInputChange('bio', e.target.value)}
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/50 min-h-[100px]"
                  placeholder="Tell us about yourself..."
                  maxLength={300}
                />
              ) : (
                <p className="text-white bg-white/5 rounded-md px-3 py-2 border border-white/10 min-h-[60px]">
                  {user?.bio || 'No bio added yet'}
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Account Management */}
        <Card className="mb-6 bg-white/10 backdrop-blur-lg border-white/20">
          <CardHeader className="pb-3">
            <h3 className="text-lg font-semibold text-white">Account Management</h3>
          </CardHeader>
          <CardContent className="pt-0 space-y-3">
            <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/10">
              <div>
                <p className="text-white font-medium">Account Type</p>
                <p className="text-white/70 text-sm capitalize">Currently signed up as {user?.role || 'user'}</p>
              </div>
              <Button variant="outline" size="sm" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-0 shadow-lg">
                Change
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Quick Settings */}
        <Card className="mb-6 bg-white/10 backdrop-blur-lg border-white/20">
          <CardHeader className="pb-3">
            <h3 className="text-lg font-semibold text-white">Quick Settings</h3>
          </CardHeader>
          <CardContent className="pt-0 space-y-2">
            <Link href="/profile/notifications">
              <Button variant="ghost" className="w-full justify-between p-4 h-auto bg-white/5 hover:bg-white/10 border border-white/10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-orange-500/20 rounded-xl flex items-center justify-center">
                    <Bell className="w-5 h-5 text-orange-400" />
                  </div>
                  <span className="font-medium text-white">Manage notification settings</span>
                </div>
              </Button>
            </Link>

            <Link href="/profile/help">
              <Button variant="ghost" className="w-full justify-between p-4 h-auto bg-white/5 hover:bg-white/10 border border-white/10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gray-500/20 rounded-xl flex items-center justify-center">
                    <HelpCircle className="w-5 h-5 text-gray-400" />
                  </div>
                  <span className="font-medium text-white">Get help or contact support</span>
                </div>
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Save Changes Button - Only show when editing */}
        {isEditing && (
          <Button
            onClick={handleSave}
            disabled={isSaving}
            className="w-full py-4 font-medium bg-blue-500 hover:bg-blue-600 text-white"
          >
            {isSaving ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Saving...
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Save className="w-5 h-5" />
                Save Changes
              </div>
            )}
          </Button>
        )}
      </div>

      <BottomNavigation activeTab="profile" />
    </div>
  );
}