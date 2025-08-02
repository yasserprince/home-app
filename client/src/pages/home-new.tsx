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
import { ServiceIcon } from "@/components/service-icon";
import { ServiceIconTest } from "@/components/service-icon-test";
import { Search, X, ArrowRight, Shield, Settings, User as UserIcon, LogOut, Calendar, MapPin, Star, Clock, Briefcase } from "lucide-react";
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
    enabled: true,
  });

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
      setSelectedSuggestion(prev => prev < searchSuggestions.length - 1 ? prev + 1 : prev);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedSuggestion(prev => prev > 0 ? prev - 1 : prev);
    } else if (e.key === 'Enter' && selectedSuggestion >= 0) {
      e.preventDefault();
      handleSearchSelect(searchSuggestions[selectedSuggestion]);
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
      setSelectedSuggestion(-1);
    }
  };

  const handleLogout = async () => {
    try {
      window.location.href = "/api/auth/logout";
    } catch (error) {
      console.error("Logout error:", error);
      toast({
        title: "Error",
        description: "Failed to logout",
        variant: "destructive",
      });
    }
  };

  // Auto-initialize data on first load
  useEffect(() => {
    if (!userLoading && categories && (categories as any[]).length === 0) {
      initDataMutation.mutate();
    }
  }, [userLoading, categories]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionsRef.current && 
        !suggestionsRef.current.contains(event.target as Node) &&
        searchInputRef.current &&
        !searchInputRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
        setSelectedSuggestion(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (userLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div 
      className={`min-h-screen bg-gray-50 pb-20 ${getLanguageDirection(language) === 'rtl' ? 'rtl' : 'ltr'}`}
    >
      {/* Modern Header Section */}
      <div className="bg-white border-b border-gray-100 shadow-sm">
        <div className="px-6 pt-12 pb-6">
          {/* User Greeting & Profile */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg">
                  <span className="text-white text-xl font-bold">
                    {user?.firstName?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase() || 'U'}
                  </span>
                </div>
                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                </div>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {t('hello')}, {user?.firstName || user?.email?.split('@')[0] || 'User'}!
                </h1>
                <p className="text-gray-600 text-sm">{t('whatServiceToday')}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <LanguageSelector variant="compact" />
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="p-3 rounded-xl bg-gray-100 hover:bg-gray-200 transition-colors">
                    <Settings className="w-5 h-5 text-gray-600" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 p-2">
                  <DropdownMenuItem asChild>
                    <Link href="/profile" className="flex items-center px-3 py-2 rounded-lg hover:bg-gray-100">
                      <UserIcon className="w-4 h-4 mr-3 text-gray-500" />
                      <span>{t('profile')}</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/settings" className="flex items-center px-3 py-2 rounded-lg hover:bg-gray-100">
                      <Settings className="w-4 h-4 mr-3 text-gray-500" />
                      <span>{t('settings')}</span>
                    </Link>
                  </DropdownMenuItem>
                  {user?.role === 'admin' && (
                    <DropdownMenuItem asChild>
                      <Link href="/admin" className="flex items-center px-3 py-2 rounded-lg hover:bg-gray-100">
                        <Shield className="w-4 h-4 mr-3 text-blue-500" />
                        <span>Admin Panel</span>
                      </Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator className="my-2" />
                  <DropdownMenuItem onClick={handleLogout} className="flex items-center px-3 py-2 rounded-lg hover:bg-red-50 text-red-600">
                    <LogOut className="w-4 h-4 mr-3" />
                    <span>{t('logout')}</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Enhanced Search Bar */}
          <div className="relative">
            <div className="relative">
              <Search className="absolute left-5 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 z-10" />
              <Input
                ref={searchInputRef}
                type="text"
                placeholder={t('search')}
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setShowSuggestions(true);
                  setSelectedSuggestion(-1);
                }}
                onKeyDown={handleKeyDown}
                onFocus={() => {
                  if (searchQuery.trim()) setShowSuggestions(true);
                }}
                className="w-full pl-14 pr-12 py-5 rounded-2xl border border-gray-200 bg-gray-50 text-gray-900 placeholder-gray-500 focus:bg-white focus:border-blue-300 focus:ring-4 focus:ring-blue-50 transition-all duration-200 text-lg"
              />
              {searchQuery && (
                <button
                  onClick={() => {
                    setSearchQuery("");
                    setShowSuggestions(false);
                    setSelectedSuggestion(-1);
                  }}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>

            {/* Enhanced Search Suggestions */}
            {showSuggestions && searchSuggestions.length > 0 && (
              <div 
                ref={suggestionsRef}
                className="absolute top-full left-0 right-0 mt-3 bg-white rounded-2xl shadow-2xl border border-gray-100 z-50 overflow-hidden"
              >
                {searchSuggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => handleSearchSelect(suggestion)}
                    className={`w-full px-5 py-4 text-left hover:bg-gray-50 flex items-center space-x-4 border-b border-gray-50 last:border-b-0 transition-all duration-150 ${
                      selectedSuggestion === index ? 'bg-blue-50 border-blue-100' : ''
                    }`}
                  >
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm"
                      style={{ backgroundColor: `${suggestion.color}10`, border: `1px solid ${suggestion.color}20` }}
                    >
                      <ServiceIcon 
                        iconName={suggestion.icon} 
                        className="w-6 h-6" 
                        style={{ color: suggestion.color }} 
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-gray-900 truncate text-base">{suggestion.text}</div>
                      <div className="text-sm text-gray-500 truncate">{suggestion.description}</div>
                    </div>
                    <div className="text-gray-400">
                      <ArrowRight className="w-5 h-5" />
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Icon Test Section - for debugging mobile icons */}
      <div className="px-6 py-4">
        <ServiceIconTest />
      </div>

      {/* Popular Services Section */}
      <div className="px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">{t('popularServices')}</h2>
          <Link href="/categories">
            <button className="text-blue-600 text-sm font-semibold hover:text-blue-700 flex items-center">
              {t('viewAll')}
              <ArrowRight className="w-4 h-4 ml-1" />
            </button>
          </Link>
        </div>
        
        {categoriesLoading ? (
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-32 rounded-2xl" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            {(categories as any[])?.slice(0, 6).map((category: any) => (
              <Link key={category.id} href={`/providers?category=${category.id}`}>
                <Card className="group hover:shadow-xl transition-all duration-300 cursor-pointer h-full hover:scale-[1.02] border-0 shadow-md">
                  <CardContent className="p-6 flex flex-col items-center justify-center h-full min-h-[140px]">
                    <div
                      className="w-20 h-20 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300"
                      style={{ 
                        backgroundColor: `${category.color}15`, 
                        border: `2px solid ${category.color}25`,
                        boxShadow: `0 4px 12px ${category.color}20`
                      }}
                    >
                      <ServiceIcon 
                        iconName={category.icon || 'search'} 
                        className="w-10 h-10 flex-shrink-0" 
                        style={{ color: category.color || '#6B7280' }} 
                      />
                    </div>
                    <h3 className="font-bold text-gray-900 text-center leading-tight text-base group-hover:text-blue-600 transition-colors">
                      {translateCategoryName(category.name, language)}
                    </h3>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}

        {/* Quick Actions Section */}
        <div className="mb-8">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-4">
            <Link href="/bookings">
              <Card className="hover:shadow-lg transition-all duration-200 cursor-pointer border border-blue-100 bg-blue-50">
                <CardContent className="p-6 flex items-center space-x-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                    <Calendar className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">{t('bookings')}</h4>
                    <p className="text-sm text-gray-600">View & manage</p>
                  </div>
                </CardContent>
              </Card>
            </Link>
            
            <Link href="/profile">
              <Card className="hover:shadow-lg transition-all duration-200 cursor-pointer border border-green-100 bg-green-50">
                <CardContent className="p-6 flex items-center space-x-4">
                  <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                    <UserIcon className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">{t('profile')}</h4>
                    <p className="text-sm text-gray-600">Edit details</p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          </div>
        </div>

        {/* Trust & Quality Section */}
        <div className="mb-8">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Why Choose Us</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white p-6 rounded-2xl border border-gray-100 text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-blue-600" />
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Verified Providers</h4>
              <p className="text-sm text-gray-600">All professionals are background checked and verified</p>
            </div>
            
            <div className="bg-white p-6 rounded-2xl border border-gray-100 text-center">
              <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Star className="w-8 h-8 text-green-600" />
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Top Rated</h4>
              <p className="text-sm text-gray-600">Highly rated professionals with excellent reviews</p>
            </div>
            
            <div className="bg-white p-6 rounded-2xl border border-gray-100 text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Clock className="w-8 h-8 text-purple-600" />
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Same Day Service</h4>
              <p className="text-sm text-gray-600">Fast booking and quick service availability</p>
            </div>
          </div>
        </div>

        {/* Service Provider CTA */}
        {user?.role !== 'service_provider' && (
          <div className="mb-8">
            <Card className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white border-0">
              <CardContent className="p-8 text-center">
                <div className="flex justify-center mb-4">
                  <Briefcase className="w-16 h-16 text-white opacity-90" />
                </div>
                <h3 className="text-2xl font-bold mb-2">Become a Service Provider</h3>
                <p className="text-indigo-100 mb-6">Join thousands of professionals and grow your business with us</p>
                <Link href="/profile">
                  <button className="bg-white text-indigo-600 px-8 py-3 rounded-xl font-semibold hover:bg-gray-100 transition-colors">
                    Get Started Today
                  </button>
                </Link>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      <BottomNavigation activeTab="home" />
    </div>
  );
}