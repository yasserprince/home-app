import React, { useState, useRef, useEffect } from "react";
import { Link } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { useCategories } from "@/hooks/useCategories";
import { useTranslation } from "@/hooks/useTranslation";
import { ModernServiceIcon } from "@/components/modern-service-icon";
import { LanguageSelector } from "@/components/language-selector";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import BottomNavigation from "@/components/bottom-navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  Search, X, ArrowRight, Settings, User as UserIcon, LogOut, 
  Star, Calendar, Clock, Shield, TrendingUp, Zap 
} from "lucide-react";

export default function HomeRedesigned() {
  const { user, isLoading: userLoading } = useAuth();
  const { 
    featuredCategories, 
    trendingCategories, 
    quickServices, 
    isLoading: categoriesLoading,
    getCategoryIcon,
    getCategoryColor,
    getTranslatedName
  } = useCategories();
  const { t, language, changeLanguage } = useTranslation();
  
  const [searchQuery, setSearchQuery] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Search suggestions based on categories
  const searchSuggestions = featuredCategories
    .filter(category => 
      category.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      category.description?.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .slice(0, 5)
    .map(category => ({
      text: category.name,
      description: category.description || '',
      icon: getCategoryIcon(category.name),
      color: getCategoryColor(category),
      type: 'category' as const
    }));

  const handleSearchSelect = (suggestion: any) => {
    setSearchQuery(suggestion.text);
    setShowSuggestions(false);
  };

  if (userLoading) {
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
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-60 h-60 bg-indigo-500/20 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      {/* Header */}
      <div className="relative z-10 p-6 pt-12">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <Avatar className="w-12 h-12 ring-2 ring-white/20">
              <AvatarImage src={user?.profileImageUrl || ''} alt={user?.firstName || ''} />
              <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-semibold">
                {user?.firstName?.[0]}{user?.lastName?.[0]}
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-xl font-bold text-white">
                {t('welcomeBack')}, {user?.firstName}! 👋
              </h1>
              <p className="text-white/70 text-sm">{t('findYourPerfectService')}</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <LanguageSelector 
              currentLanguage={language}
              onLanguageChange={(lang) => changeLanguage(lang as any)}
            />
            <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="text-white hover:bg-white/10">
                <Settings className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem asChild>
                <Link href="/profile" className="flex items-center gap-2 cursor-pointer">
                  <UserIcon className="h-4 w-4" />
                  {t('profile')}
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/settings" className="flex items-center gap-2 cursor-pointer">
                  <Settings className="h-4 w-4" />
                  {t('settings')}
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={async () => {
                  try {
                    await fetch('/api/logout', { method: 'POST', credentials: 'include' });
                    window.location.href = '/';
                  } catch (error) {
                    console.error('Logout error:', error);
                    window.location.href = '/';
                  }
                }}
                className="flex items-center gap-2 cursor-pointer text-red-600 focus:text-red-600"
              >
                <LogOut className="h-4 w-4" />
                {t('logout')}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          </div>
        </div>

        {/* Enhanced Search Bar */}
        <div className="relative mb-8">
          <Input
            ref={searchInputRef}
            type="text"
            placeholder={t('searchServices')}
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setShowSuggestions(e.target.value.trim().length > 0);
            }}
            onFocus={() => {
              if (searchQuery.trim()) setShowSuggestions(true);
            }}
            className="w-full py-4 px-6 pl-14 pr-12 rounded-2xl text-gray-900 bg-white/95 backdrop-blur-md border-0 shadow-xl text-lg"
            data-testid="search-input"
          />
          <Search className="w-6 h-6 absolute left-5 top-1/2 transform -translate-y-1/2 text-gray-400" />
          {searchQuery && (
            <button
              onClick={() => {
                setSearchQuery("");
                setShowSuggestions(false);
              }}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              data-testid="clear-search"
            >
              <X className="w-5 h-5" />
            </button>
          )}
          
          {/* Search Suggestions */}
          {showSuggestions && searchSuggestions.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-gray-100 z-50 max-h-80 overflow-y-auto">
              {searchSuggestions.map((suggestion, index) => (
                <button
                  key={`${suggestion.type}-${suggestion.text}`}
                  onClick={() => handleSearchSelect(suggestion)}
                  className="w-full flex items-center space-x-4 px-6 py-4 hover:bg-gray-50 transition-colors first:rounded-t-2xl last:rounded-b-2xl"
                  data-testid={`suggestion-${index}`}
                >
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: `${suggestion.color}20` }}
                  >
                    <ModernServiceIcon 
                      iconName={suggestion.icon} 
                      className="w-5 h-5" 
                      style={{ color: suggestion.color }} 
                      size={20}
                    />
                  </div>
                  <div className="flex-1 text-left">
                    <div className="font-semibold text-gray-900 text-sm">{suggestion.text}</div>
                    <div className="text-xs text-gray-600 truncate">{suggestion.description}</div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-gray-400" />
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="relative z-10 px-6 mb-8">
        <div className="grid grid-cols-3 gap-4">
          <Link href="/bookings">
            <Card className="bg-white/10 backdrop-blur-md border-white/20 hover:bg-white/20 transition-all duration-300 hover:scale-105">
              <CardContent className="p-4 text-center">
                <Calendar className="w-8 h-8 text-white mx-auto mb-2" />
                <p className="text-white text-sm font-medium">{t('myBookings')}</p>
              </CardContent>
            </Card>
          </Link>
          
          <Link href="/providers">
            <Card className="bg-white/10 backdrop-blur-md border-white/20 hover:bg-white/20 transition-all duration-300 hover:scale-105">
              <CardContent className="p-4 text-center">
                <Star className="w-8 h-8 text-white mx-auto mb-2" />
                <p className="text-white text-sm font-medium">{t('topRated')}</p>
              </CardContent>
            </Card>
          </Link>
          
          <Link href="/categories">
            <Card className="bg-white/10 backdrop-blur-md border-white/20 hover:bg-white/20 transition-all duration-300 hover:scale-105">
              <CardContent className="p-4 text-center">
                <Search className="w-8 h-8 text-white mx-auto mb-2" />
                <p className="text-white text-sm font-medium">{t('allServices')}</p>
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>

      {/* Trending Services */}
      <div className="relative z-10 px-6 mb-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-white" />
            <h2 className="text-xl font-bold text-white">{t('trending')}</h2>
          </div>
          <Badge className="bg-white/20 text-white border-white/30">
            {t('popular')}
          </Badge>
        </div>
        
        {categoriesLoading ? (
          <div className="flex gap-4 overflow-x-auto pb-2">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="min-w-[120px] h-32 bg-white/20 rounded-2xl" />
            ))}
          </div>
        ) : (
          <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
            {trendingCategories.map((category) => (
              <Link 
                key={category.id} 
                href={`/providers?category=${category.id}`}
                className="min-w-[120px]"
              >
                <Card className="bg-white/15 backdrop-blur-md border-white/30 hover:bg-white/25 transition-all duration-300 hover:scale-105 h-32">
                  <CardContent className="p-4 flex flex-col items-center justify-center h-full text-center">
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center mb-2"
                      style={{ backgroundColor: `${getCategoryColor(category)}30` }}
                    >
                      <ModernServiceIcon 
                        iconName={getCategoryIcon(category.name)} 
                        className="w-6 h-6" 
                        style={{ color: '#ffffff' }} 
                        size={24}
                      />
                    </div>
                    <h3 className="text-white text-xs font-semibold line-clamp-2">
                      {getTranslatedName(category.name)}
                    </h3>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Featured Services */}
      <div className="relative z-10 px-6 mb-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-white" />
            <h2 className="text-xl font-bold text-white">{t('featuredServices')}</h2>
          </div>
          <Link href="/categories">
            <Button variant="ghost" size="sm" className="text-white hover:bg-white/10">
              {t('viewAll')} <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </Link>
        </div>
        
        {categoriesLoading ? (
          <div className="grid grid-cols-2 gap-4">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-24 bg-white/20 rounded-2xl" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {featuredCategories.map((category) => (
              <Link 
                key={category.id} 
                href={`/providers?category=${category.id}`}
              >
                <Card className="bg-white/15 backdrop-blur-md border-white/30 hover:bg-white/25 transition-all duration-300 hover:scale-105">
                  <CardContent className="p-4 flex items-center space-x-3">
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: `${getCategoryColor(category)}30` }}
                    >
                      <ModernServiceIcon 
                        iconName={getCategoryIcon(category.name)} 
                        className="w-6 h-6" 
                        style={{ color: '#ffffff' }} 
                        size={24}
                      />
                    </div>
                    <div>
                      <h3 className="text-white font-semibold text-sm line-clamp-1">
                        {getTranslatedName(category.name)}
                      </h3>
                      <p className="text-white/70 text-xs line-clamp-1">
                        {category.description}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Trust & Safety Section */}
      <div className="relative z-10 px-6 mb-8">
        <Card className="bg-white/10 backdrop-blur-md border-white/20">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <Shield className="w-6 h-6 text-white" />
              <h3 className="text-white font-bold text-lg">{t('whyChooseUs')}</h3>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-white mb-1">100K+</div>
                <div className="text-white/70 text-sm">{t('verifiedProviders')}</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-white mb-1">4.8★</div>
                <div className="text-white/70 text-sm">{t('averageRating')}</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <div className="relative z-10 px-6 mb-24">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-white" />
            <h2 className="text-xl font-bold text-white">{t('recentActivity')}</h2>
          </div>
        </div>
        
        <Card className="bg-white/10 backdrop-blur-md border-white/20">
          <CardContent className="p-6 text-center">
            <Calendar className="w-12 h-12 text-white/50 mx-auto mb-3" />
            <h3 className="text-white font-semibold mb-2">{t('noRecentActivity')}</h3>
            <p className="text-white/70 text-sm mb-4">{t('startByBookingService')}</p>
            <Link href="/categories">
              <Button className="bg-white text-gray-900 hover:bg-white/90">
                {t('browseServices')}
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Navigation */}
      <div className="pb-20">
        <BottomNavigation activeTab="home" />
      </div>
    </div>
  );
}