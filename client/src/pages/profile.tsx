import React, { useState } from "react";
import { Link } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { useTranslation } from "@/hooks/useTranslation";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import ModernAvatar from "@/components/ModernAvatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import BottomNavigation from "@/components/bottom-navigation";
import { LanguageSelector } from "@/components/language-selector";
import { ProfileImageCropper } from "@/components/ProfileImageCropper";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  User,
  Edit3,
  CreditCard,
  MapPin,
  Bell,
  HelpCircle,
  Shield,
  Star,
  Calendar,
  Heart,
  Settings,
  LogOut,
  ChevronRight,
  MoreVertical,
  Verified,
  Award,
  Clock,
} from "lucide-react";

export default function Profile() {
  const { user, isLoading } = useAuth();
  const { t } = useTranslation();
  const [avatarKey, setAvatarKey] = useState(0);

  const handleLogout = () => {
    window.location.href = '/api/logout';
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
          <div>
            <h1 className="text-2xl font-bold text-white">{t('profile')}</h1>
            <p className="text-white/70 text-sm">Manage your account</p>
          </div>
          <div className="flex items-center gap-2">
            <LanguageSelector variant="compact" />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="text-white hover:bg-white/10">
                  <MoreVertical className="w-5 h-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-gray-800/95 backdrop-blur-lg border-gray-700">
                <DropdownMenuItem onClick={handleLogout} className="text-red-400 hover:text-red-300 hover:bg-red-400/10">
                  <LogOut className="w-4 h-4 mr-2" />
                  {t('logout')}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Profile Header Card */}
        <Card className="mb-6 bg-white/10 backdrop-blur-lg border-white/20">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <ProfileImageCropper
                onSuccess={() => {
                  setAvatarKey(prev => prev + 1);
                }}
              >
                <div className="relative group cursor-pointer">
                  <ModernAvatar
                    key={avatarKey}
                    src={user?.profileImageUrl ? `${user.profileImageUrl}?t=${avatarKey || Date.now()}` : null}
                    name={user?.firstName && user?.lastName ? `${user.firstName} ${user.lastName}` : user?.firstName || ''}
                    email={user?.email || ''}
                    size={80}
                    className="ring-4 ring-white/20 transition-all duration-200 group-hover:ring-white/40"
                    showOnlineStatus={true}
                  />
                  <div className="absolute inset-0 bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                    <div className="text-white text-xs font-medium">Edit</div>
                  </div>
                </div>
              </ProfileImageCropper>
              
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h2 className="text-xl font-bold text-white">
                    {user?.firstName && user?.lastName ? `${user.firstName} ${user.lastName}` : 'User'}
                  </h2>
                  {user?.isVerified && (
                    <Verified className="w-5 h-5 text-blue-400" />
                  )}
                </div>
                <p className="text-white/70 text-sm mb-2">@{user?.email?.split('@')[0] || 'user'}</p>
                <div className="flex items-center gap-4 text-sm text-white/60">
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-yellow-400" />
                    <span>5.0</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Award className="w-4 h-4 text-purple-400" />
                    <span>Pro</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4 text-green-400" />
                    <span>Online</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-3 gap-4 mt-6 pt-4 border-t border-white/10">
              <div className="text-center">
                <div className="text-2xl font-bold text-white">12</div>
                <div className="text-xs text-white/60">{t('bookings')}</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-white">4.9</div>
                <div className="text-xs text-white/60">{t('rating')}</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-white">8</div>
                <div className="text-xs text-white/60">{t('favorites')}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="mb-6 bg-white/10 backdrop-blur-lg border-white/20">
          <CardHeader className="pb-3">
            <h3 className="text-lg font-semibold text-white">Quick Actions</h3>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="grid grid-cols-2 gap-3">
              <Link href="/bookings">
                <Button variant="ghost" className="w-full h-auto p-4 flex flex-col items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/20">
                  <Calendar className="w-6 h-6 text-blue-400" />
                  <span className="text-sm font-medium text-white">{t('myBookings')}</span>
                </Button>
              </Link>
              <Link href="/providers?favorites=true">
                <Button variant="ghost" className="w-full h-auto p-4 flex flex-col items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/20">
                  <Heart className="w-6 h-6 text-red-400" />
                  <span className="text-sm font-medium text-white">{t('favorites')}</span>
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Account Management */}
        <Card className="mb-6 bg-white/10 backdrop-blur-lg border-white/20">
          <CardHeader className="pb-3">
            <h3 className="text-lg font-semibold text-white">Account</h3>
          </CardHeader>
          <CardContent className="pt-0 space-y-2">
            <Link href="/profile/edit">
              <Button variant="ghost" className="w-full justify-between p-4 h-auto bg-white/5 hover:bg-white/10 border border-white/10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-500/20 rounded-xl flex items-center justify-center">
                    <Edit3 className="w-5 h-5 text-blue-400" />
                  </div>
                  <span className="font-medium text-white">{t('editProfile')}</span>
                </div>
                <ChevronRight className="w-5 h-5 text-white/50" />
              </Button>
            </Link>

            <Link href="/profile/payment-methods">
              <Button variant="ghost" className="w-full justify-between p-4 h-auto bg-white/5 hover:bg-white/10 border border-white/10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-500/20 rounded-xl flex items-center justify-center">
                    <CreditCard className="w-5 h-5 text-green-400" />
                  </div>
                  <span className="font-medium text-white">{t('paymentMethods')}</span>
                </div>
                <ChevronRight className="w-5 h-5 text-white/50" />
              </Button>
            </Link>

            <Link href="/profile/addresses">
              <Button variant="ghost" className="w-full justify-between p-4 h-auto bg-white/5 hover:bg-white/10 border border-white/10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-yellow-500/20 rounded-xl flex items-center justify-center">
                    <MapPin className="w-5 h-5 text-yellow-400" />
                  </div>
                  <span className="font-medium text-white">{t('savedAddresses')}</span>
                </div>
                <ChevronRight className="w-5 h-5 text-white/50" />
              </Button>
            </Link>

            <Link href="/profile/verification">
              <Button variant="ghost" className="w-full justify-between p-4 h-auto bg-white/5 hover:bg-white/10 border border-white/10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-500/20 rounded-xl flex items-center justify-center">
                    <Shield className="w-5 h-5 text-purple-400" />
                  </div>
                  <div className="flex flex-col items-start">
                    <span className="font-medium text-white">{t('verification')}</span>
                    <Badge variant="secondary" className="text-xs bg-purple-500/20 text-purple-300 hover:bg-purple-500/30">
                      Verified
                    </Badge>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-white/50" />
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Settings & Support */}
        <Card className="mb-6 bg-white/10 backdrop-blur-lg border-white/20">
          <CardHeader className="pb-3">
            <h3 className="text-lg font-semibold text-white">Settings & Support</h3>
          </CardHeader>
          <CardContent className="pt-0 space-y-2">
            <Link href="/profile/notifications">
              <Button variant="ghost" className="w-full justify-between p-4 h-auto bg-white/5 hover:bg-white/10 border border-white/10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-orange-500/20 rounded-xl flex items-center justify-center">
                    <Bell className="w-5 h-5 text-orange-400" />
                  </div>
                  <span className="font-medium text-white">{t('notifications')}</span>
                </div>
                <ChevronRight className="w-5 h-5 text-white/50" />
              </Button>
            </Link>

            <Link href="/profile/help">
              <Button variant="ghost" className="w-full justify-between p-4 h-auto bg-white/5 hover:bg-white/10 border border-white/10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gray-500/20 rounded-xl flex items-center justify-center">
                    <HelpCircle className="w-5 h-5 text-gray-400" />
                  </div>
                  <span className="font-medium text-white">{t('helpCenter')}</span>
                </div>
                <ChevronRight className="w-5 h-5 text-white/50" />
              </Button>
            </Link>

            {/* Admin Panel - only show for admin users */}
            {user?.role === 'admin' && (
              <Link href="/admin">
                <Button variant="ghost" className="w-full justify-between p-4 h-auto bg-red-500/10 hover:bg-red-500/20 border border-red-500/20">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-red-500/20 rounded-xl flex items-center justify-center">
                      <Shield className="w-5 h-5 text-red-400" />
                    </div>
                    <span className="font-medium text-white">{t('adminPanel')}</span>
                  </div>
                  <ChevronRight className="w-5 h-5 text-red-400/70" />
                </Button>
              </Link>
            )}
          </CardContent>
        </Card>

        {/* Logout Button */}
        <Button
          variant="destructive"
          className="w-full py-4 font-medium bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30"
          onClick={handleLogout}
        >
          <LogOut className="w-5 h-5 mr-2" />
          {t('logout')}
        </Button>
      </div>

      <BottomNavigation activeTab="profile" />
    </div>
  );
}