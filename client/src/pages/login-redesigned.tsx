import React, { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useTranslation } from "@/hooks/useTranslation";
import { LanguageSelector } from "@/components/language-selector";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  Shield,
  Star,
  Users,
  CheckCircle,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Sparkles,
  Home as HomeIcon,
  Wrench,
  Zap,
  Heart
} from "lucide-react";
import { FaGoogle } from "react-icons/fa";
import { SiReplit } from "react-icons/si";

export default function LoginRedesigned() {
  const { isLoading } = useAuth();
  const { t, language, changeLanguage, isRTL } = useTranslation();
  
  const [showPassword, setShowPassword] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: ''
  });

  // Service showcase data
  const featuredServices = [
    { icon: HomeIcon, name: "Home Cleaning", rating: 4.9, count: "2.5k+" },
    { icon: Wrench, name: "Handyman", rating: 4.8, count: "1.8k+" },
    { icon: Zap, name: "Electrical", rating: 4.9, count: "1.2k+" },
    { icon: Heart, name: "Personal Care", rating: 4.7, count: "980+" }
  ];

  const handleGoogleLogin = () => {
    window.location.href = '/api/auth/google';
  };

  const handleReplitLogin = () => {
    window.location.href = '/api/login';
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const endpoint = isSignUp ? '/api/auth/signup' : '/api/auth/login';
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        window.location.href = '/';
      } else {
        const error = await response.json();
        console.error('Auth error:', error);
      }
    } catch (error) {
      console.error('Auth error:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-white"></div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 relative overflow-hidden ${isRTL ? 'rtl' : 'ltr'}`}>
      {/* Animated Background Orbs */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-2000"></div>
        <div className="absolute top-40 left-1/3 w-60 h-60 bg-indigo-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-4000"></div>
      </div>

      {/* Language Selector */}
      <div className="absolute top-6 right-6 z-50">
        <LanguageSelector 
          currentLanguage={language}
          onLanguageChange={(lang) => changeLanguage(lang as any)}
          variant="compact"
        />
      </div>

      <div className="relative z-10 min-h-screen flex">
        {/* Left Side - Branding & Features */}
        <div className="hidden lg:flex lg:w-1/2 flex-col justify-center p-12">
          <div className="max-w-md mx-auto">
            {/* Logo & Title */}
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-4xl font-bold text-white mb-2">
                {t('welcomeToServiceNow')}
              </h1>
              <p className="text-white/80 text-lg">
                {t('connectWithTrustedProviders')}
              </p>
            </div>

            {/* Trust Indicators */}
            <div className="grid grid-cols-2 gap-4 mb-8">
              <Card className="bg-white/10 backdrop-blur-md border-white/20">
                <CardContent className="p-4 text-center">
                  <Shield className="w-8 h-8 text-blue-400 mx-auto mb-2" />
                  <p className="text-white font-semibold">
                    {t('verifiedProviders')}
                  </p>
                  <p className="text-white/70 text-sm">5,000+</p>
                </CardContent>
              </Card>
              <Card className="bg-white/10 backdrop-blur-md border-white/20">
                <CardContent className="p-4 text-center">
                  <Star className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
                  <p className="text-white font-semibold">
                    {t('averageRating')}
                  </p>
                  <p className="text-white/70 text-sm">4.9/5.0</p>
                </CardContent>
              </Card>
            </div>

            {/* Featured Services Preview */}
            <div className="space-y-3">
              <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-400" />
                {t('featuredServices')}
              </h3>
              {featuredServices.map((service, index) => {
                const IconComponent = service.icon;
                return (
                  <div key={index} className="flex items-center gap-3 p-3 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                      <IconComponent className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="text-white font-medium">{service.name}</p>
                      <div className="flex items-center gap-2">
                        <Star className="w-4 h-4 text-yellow-400 fill-current" />
                        <span className="text-white/70 text-sm">{service.rating}</span>
                        <span className="text-white/50 text-sm">({service.count})</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Side - Login Form */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-6">
          <Card className="w-full max-w-md bg-white/15 backdrop-blur-md border-white/30 shadow-2xl">
            <CardHeader className="text-center pb-4">
              <div className="lg:hidden mb-4">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
              </div>
              <CardTitle className="text-2xl font-bold text-white mb-2">
                {isSignUp ? t('signUp') : t('signIn')}
              </CardTitle>
              <p className="text-white/70 lg:hidden">
                {t('connectWithTrustedProviders')}
              </p>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* OAuth Buttons */}
              <div className="space-y-3">
                <Button
                  onClick={handleGoogleLogin}
                  className="w-full bg-white text-gray-900 hover:bg-gray-100 flex items-center gap-3 py-6 text-base font-medium"
                >
                  <FaGoogle className="w-5 h-5 text-red-500" />
                  {t('continueWithGoogle')}
                </Button>
                
                <Button
                  onClick={handleReplitLogin}
                  className="w-full bg-orange-600 hover:bg-orange-700 text-white flex items-center gap-3 py-6 text-base font-medium"
                >
                  <SiReplit className="w-5 h-5" />
                  {t('continueWithReplit')}
                </Button>
              </div>

              <div className="relative">
                <Separator className="bg-white/20" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="bg-gray-900 px-4 text-white/70 text-sm">
                    {t('orContinueWith')}
                  </span>
                </div>
              </div>

              {/* Email/Password Form */}
              <form onSubmit={handleEmailLogin} className="space-y-4">
                {isSignUp && (
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label htmlFor="firstName" className="text-white/90">
                        First Name
                      </Label>
                      <Input
                        id="firstName"
                        type="text"
                        value={formData.firstName}
                        onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                        className="bg-white/10 border-white/30 text-white placeholder:text-white/50"
                        placeholder="John"
                        required={isSignUp}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName" className="text-white/90">
                        Last Name
                      </Label>
                      <Input
                        id="lastName"
                        type="text"
                        value={formData.lastName}
                        onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                        className="bg-white/10 border-white/30 text-white placeholder:text-white/50"
                        placeholder="Doe"
                        required={isSignUp}
                      />
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-white/90 flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    {t('email')}
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="bg-white/10 border-white/30 text-white placeholder:text-white/50"
                    placeholder={t('enterYourEmail')}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-white/90 flex items-center gap-2">
                    <Lock className="w-4 h-4" />
                    {t('password')}
                  </Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={formData.password}
                      onChange={(e) => setFormData({...formData, password: e.target.value})}
                      className="bg-white/10 border-white/30 text-white placeholder:text-white/50 pr-12"
                      placeholder={t('enterYourPassword')}
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 text-white/70 hover:text-white hover:bg-white/10"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </Button>
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-6 text-base font-medium"
                >
                  {isSignUp ? t('signUp') : t('signIn')}
                </Button>
              </form>

              {/* Toggle Sign Up/Sign In */}
              <div className="text-center">
                <p className="text-white/70 text-sm">
                  {isSignUp ? t('alreadyHaveAccount') : t('dontHaveAccount')}
                  {" "}
                  <button
                    onClick={() => setIsSignUp(!isSignUp)}
                    className="text-blue-400 hover:text-blue-300 font-medium underline"
                  >
                    {isSignUp ? t('signInHere') : t('createAccount')}
                  </button>
                </p>
              </div>

              {/* Trust Badges for Mobile */}
              <div className="lg:hidden grid grid-cols-3 gap-2 pt-4">
                <div className="text-center">
                  <CheckCircle className="w-6 h-6 text-green-400 mx-auto mb-1" />
                  <p className="text-white/70 text-xs">Verified</p>
                </div>
                <div className="text-center">
                  <Star className="w-6 h-6 text-yellow-400 mx-auto mb-1" />
                  <p className="text-white/70 text-xs">Top Rated</p>
                </div>
                <div className="text-center">
                  <Users className="w-6 h-6 text-blue-400 mx-auto mb-1" />
                  <p className="text-white/70 text-xs">5k+ Users</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}