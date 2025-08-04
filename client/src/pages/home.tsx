import { useEffect, useState, useRef, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest } from "@/lib/queryClient";
import BottomNavigation from "@/components/bottom-navigation";

import { SimpleServiceIcon } from "@/components/simple-service-icon";
import { MobileEnhancedIcon } from "@/components/mobile-enhanced-icon";


import { Search, X, ArrowRight, Shield, Settings, User as UserIcon, LogOut, ChevronDown, Star, Calendar } from "lucide-react";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTranslation, getLanguageDirection, translateCategoryName } from "@/lib/i18n";
import { LanguageSelector } from "@/components/language-selector";

export default function Home() {
  const { user, isLoading: userLoading } = useAuth();
  const { toast } = useToast();
  const { t, language } = useTranslation();
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedSuggestion, setSelectedSuggestion] = useState(-1);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // Initialize sample data
  const initDataMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/init-data");
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
    },
  });

  // Fetch service categories
  const { data: categories, isLoading: categoriesLoading, error: categoriesError } = useQuery({
    queryKey: ["/api/categories"],
    enabled: true, // Categories should be publicly available
  });

  // Debug logging
  console.log('Categories data:', categories);
  console.log('Categories loading:', categoriesLoading);
  console.log('Categories error:', categoriesError);

  // Generate search suggestions
  const searchSuggestions = useMemo(() => {
    if (!searchQuery.trim() || !categories) return [];
    
    const query = searchQuery.toLowerCase();
    const suggestions: any[] = [];
    
    // Add matching categories
    (categories as any[]).forEach((category: any) => {
      if (category.name.toLowerCase().includes(query)) {
        suggestions.push({
          type: 'category',
          text: category.name,
          description: category.description,
          icon: category.icon,
          color: category.color,
          id: category.id
        });
      }
    });
    
    // Add common service keywords
    const serviceKeywords = [
      'plumbing repair', 'electrical installation', 'house cleaning', 'lawn mowing',
      'painting interior', 'handyman services', 'appliance repair', 'furniture assembly',
      'carpet cleaning', 'pest control', 'tree trimming', 'deck repair'
    ];
    
    serviceKeywords.forEach(keyword => {
      if (keyword.toLowerCase().includes(query)) {
        suggestions.push({
          type: 'service',
          text: keyword,
          description: `Find providers for ${keyword}`,
          icon: 'search',
          color: '#6B7280'
        });
      }
    });
    
    return suggestions.slice(0, 6);
  }, [searchQuery, categories]);

  const handleSearchSelect = (suggestion: any) => {
    if (suggestion.type === 'category') {
      setLocation(`/providers?category=${suggestion.id}`);
    } else {
      setLocation(`/providers?search=${encodeURIComponent(suggestion.text)}`);
    }
    setSearchQuery("");
    setShowSuggestions(false);
    setSelectedSuggestion(-1);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions || searchSuggestions.length === 0) return;
    
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedSuggestion(prev => 
        prev < searchSuggestions.length - 1 ? prev + 1 : 0
      );
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedSuggestion(prev => 
        prev > 0 ? prev - 1 : searchSuggestions.length - 1
      );
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (selectedSuggestion >= 0) {
        handleSearchSelect(searchSuggestions[selectedSuggestion]);
      } else if (searchQuery.trim()) {
        setLocation(`/providers?search=${encodeURIComponent(searchQuery.trim())}`);
        setSearchQuery("");
        setShowSuggestions(false);
      }
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
      setSelectedSuggestion(-1);
    }
  };

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(event.target as Node) &&
          searchInputRef.current && !searchInputRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
        setSelectedSuggestion(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch recent bookings
  const { data: bookings, isLoading: bookingsLoading } = useQuery({
    queryKey: ["/api/bookings"],
    enabled: !!user,
  });

  useEffect(() => {
    if (user && !categoriesLoading && (!categories || (categories as any[]).length === 0)) {
      initDataMutation.mutate();
    }
  }, [user, categories, categoriesLoading]);

  if (userLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 relative overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-20 -right-20 w-80 h-80 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-gradient-to-br from-purple-400 to-pink-500 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>
        
        <div className="relative z-10 bg-white/10 backdrop-blur-md text-white p-6 pt-12 border-b border-white/20">
          <Skeleton className="h-6 w-32 mb-2 bg-white/20" />
          <Skeleton className="h-4 w-48 mb-4 bg-white/20" />
          <Skeleton className="h-12 w-full bg-white/20" />
        </div>
        <div className="relative z-10 p-6">
          <Skeleton className="h-6 w-32 mb-4 bg-white/20" />
          <div className="grid grid-cols-2 gap-4">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-24 bg-white/20" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 pb-20 relative overflow-hidden" dir={getLanguageDirection(language)}>
      {/* Background Effects */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-20 -right-20 w-80 h-80 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-gradient-to-br from-purple-400 to-pink-500 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>
      
      {/* Header */}
      <div className="relative z-10 bg-white/10 backdrop-blur-md text-white p-6 pt-12 border-b border-white/20">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-xl font-semibold">
              {t('hello')}, {user?.firstName || "User"}!
            </h1>
            <p className="text-blue-100 text-sm">{t('whatServiceToday')}</p>
          </div>
          <div className="flex items-center gap-2">
            <LanguageSelector variant="button" className="mr-2" />
            {user?.role === 'admin' && (
              <Link href="/admin">
                <div className="flex items-center gap-1 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-medium hover:bg-red-600 transition-colors">
                  <Shield className="h-3 w-3" />
                  {t('admin')}
                </div>
              </Link>
            )}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-1 focus:outline-none">
                  {user?.profileImageUrl ? (
                    <img
                      src={user.profileImageUrl}
                      alt="Profile"
                      className="w-10 h-10 rounded-full object-cover border-2 border-white/30"
                    />
                  ) : (
                    <div className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center border border-white/30 text-white font-semibold text-sm">
                      {((user?.firstName?.[0] || '') + (user?.lastName?.[0] || user?.email?.[0] || '')).toUpperCase().slice(0, 2) || 'U'}
                    </div>
                  )}
                  <ChevronDown className="h-3 w-3 text-white/70" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="px-2 py-1.5 text-sm font-medium">
                  {user?.firstName && user?.lastName 
                    ? `${user.firstName} ${user.lastName}`
                    : user?.email
                  }
                </div>
                <div className="px-2 py-1 text-xs text-muted-foreground">
                  {user?.email}
                </div>
                <DropdownMenuSeparator />
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
                <DropdownMenuSeparator />
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

        {/* Search Bar */}
        <div className="relative">
          <Input
            ref={searchInputRef}
            type="text"
            placeholder={t('searchServices')}
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setShowSuggestions(e.target.value.trim().length > 0);
              setSelectedSuggestion(-1);
            }}
            onKeyDown={handleKeyDown}
            onFocus={() => {
              if (searchQuery.trim()) setShowSuggestions(true);
            }}
            className="w-full py-3 px-4 pl-12 pr-10 rounded-xl text-gray-900 bg-white/90 backdrop-blur-md border border-white/20 shadow-lg"
          />
          <Search className="w-5 h-5 absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
          {searchQuery && (
            <button
              onClick={() => {
                setSearchQuery("");
                setShowSuggestions(false);
                setSelectedSuggestion(-1);
              }}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          
          {/* Search Suggestions */}
          {showSuggestions && searchSuggestions.length > 0 && (
            <div
              ref={suggestionsRef}
              className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-lg border border-gray-200 z-50 max-h-80 overflow-y-auto"
            >
              {searchSuggestions.map((suggestion, index) => (
                <button
                  key={`${suggestion.type}-${suggestion.text}`}
                  onClick={() => handleSearchSelect(suggestion)}
                  className={`w-full flex items-center space-x-3 px-4 py-3 hover:bg-gray-50 transition-colors ${
                    selectedSuggestion === index ? 'bg-blue-50 border-l-2 border-blue-500' : ''
                  }`}
                >
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: `${suggestion.color}20` }}
                  >
                    <MobileEnhancedIcon 
                      iconName={suggestion.icon} 
                      className="w-4 h-4" 
                      style={{ color: suggestion.color }} 
                      size={16}
                    />
                  </div>
                  <div className="flex-1 text-left">
                    <div className="font-medium text-gray-900 text-sm">{suggestion.text}</div>
                    <div className="text-xs text-gray-600 truncate">{suggestion.description}</div>
                  </div>
                  <div className="text-gray-400">
                    <ArrowRight className="w-3 h-3" />
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Service Categories */}
      <div className="relative z-10 p-6">
        <h2 className="text-lg font-semibold text-white mb-4">{t('popularServices')}</h2>
        {categoriesLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-20 sm:h-24 bg-white/20" />
            ))}
          </div>
        ) : (
          <div key={`categories-${user?.id || 'guest'}-${(categories as any[])?.length || 0}`} className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
            {(categories as any[])?.slice(0, 6).map((category: any) => (
              <Link key={`${category.id}-${user?.id || 'guest'}`} href={`/providers?category=${category.id}`}>
                <Card className="hover:shadow-lg transition-all duration-300 cursor-pointer h-full hover:scale-105 bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white/20">
                  <CardContent className="p-4 flex flex-col items-center justify-center h-full min-h-[100px] sm:min-h-[120px]">
                    <div
                      className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl flex items-center justify-center mb-3 mx-auto flex-shrink-0 shadow-sm"
                      style={{ backgroundColor: `${category.color}15`, border: `2px solid ${category.color}30` }}
                    >
                      <MobileEnhancedIcon 
                        iconName={category.icon || 'search'} 
                        className="w-8 h-8 sm:w-10 sm:h-10 flex-shrink-0" 
                        style={{ color: category.color || '#6B7280' }} 
                        size={32}
                      />
                    </div>
                    <h3 className="font-semibold text-white text-sm sm:text-base text-center leading-tight line-clamp-2">
                      {translateCategoryName(category.name, language)}
                    </h3>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
        
        {/* Show More Services */}
        {categories && Array.isArray(categories) && categories.length > 6 && (
          <div className="mb-6">
            <Link href="/categories">
              <Card className="hover:shadow-lg transition-all duration-300 cursor-pointer border-dashed border-2 border-white/30 hover:scale-105 bg-white/10 backdrop-blur-md hover:bg-white/20">
                <CardContent className="p-4 text-center min-h-[100px] sm:min-h-[120px] flex flex-col items-center justify-center">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-sm border border-white/30">
                    <MobileEnhancedIcon iconName="search" className="w-8 h-8 sm:w-10 sm:h-10 text-white/70" size={32} />
                  </div>
                  <h3 className="font-semibold text-white text-sm sm:text-base">{t('viewAllServices')}</h3>
                  <p className="text-xs text-white/70">+{Array.isArray(categories) ? categories.length - 6 : 0} {t('moreCategories')}</p>
                </CardContent>
              </Card>
            </Link>
          </div>
        )}

        {/* Recent Bookings */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white">{t('recentBookings')}</h2>
            <Link href="/bookings">
              <button className="text-blue-300 text-sm font-medium hover:text-white transition-colors">{t('viewAll')}</button>
            </Link>
          </div>

          {bookingsLoading ? (
            <Skeleton className="h-20 bg-white/20" />
          ) : bookings && (bookings as any[]).length > 0 ? (
            <Card className="bg-white/10 backdrop-blur-md border border-white/20">
              <CardContent className="p-4">
                {(bookings as any[]).slice(0, 1).map((booking: any) => (
                  <div key={booking.id} className="flex items-center space-x-3">
                    {booking.provider.user.profileImageUrl ? (
                      <img
                        src={booking.provider.user.profileImageUrl}
                        alt="Provider"
                        className="w-12 h-12 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                        <UserIcon className="w-6 h-6 text-gray-500" />
                      </div>
                    )}
                    <div className="flex-1">
                      <h4 className="font-medium text-white">
                        {booking.provider.user.firstName} {booking.provider.user.lastName}
                      </h4>
                      <p className="text-sm text-white/70">{booking.serviceType}</p>
                      <p className={`text-sm font-medium ${
                        booking.status === 'completed' ? 'text-green-600' :
                        booking.status === 'confirmed' ? 'text-blue-600' :
                        'text-yellow-600'
                      }`}>
                        {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-white/70">
                        {new Date(booking.scheduledDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </p>
                      <div className="flex items-center">
                        <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                        <span className="text-sm text-white ml-1">
                          {booking.provider.rating || '4.8'}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          ) : (
            <Card className="bg-white/10 backdrop-blur-md border border-white/20">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-white/30">
                  <Calendar className="w-8 h-8 text-white/70" />
                </div>
                <h3 className="font-medium text-white mb-2">{t('noBookingsYet')}</h3>
                <p className="text-sm text-white/70 mb-4">
                  {t('bookFirstService')}
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>


      
      <div className="pb-20">
        <BottomNavigation activeTab="home" />
      </div>
      

    </div>
  );
}
