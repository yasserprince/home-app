import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Search, Grid, List, Filter, Star, TrendingUp, Zap, Home, Wrench, Users, Sparkles, TreePine, Shield, Car, Heart } from "lucide-react";
import { ServiceCategory } from "@shared/schema";
import { useTranslation, translateCategoryName } from "@/lib/i18n";

// Modern icon mapping for better visual hierarchy
const categoryIcons = {
  // Home Infrastructure
  'Plumbing': Wrench,
  'Electrical': Zap,
  'HVAC': Home,
  'Roofing': Home,
  'Security Systems': Shield,
  
  // Home Improvement
  'Kitchen Remodeling': Home,
  'Bathroom Remodeling': Home,
  'Painting': Sparkles,
  'Flooring': Home,
  'Carpentry': Wrench,
  'Handyman': Wrench,
  
  // Cleaning & Maintenance
  'House Cleaning': Sparkles,
  'Carpet Cleaning': Sparkles,
  'Window Cleaning': Sparkles,
  'Pressure Washing': Sparkles,
  'Junk Removal': Sparkles,
  
  // Outdoor & Landscaping
  'Landscaping': TreePine,
  'Lawn Care': TreePine,
  'Tree Services': TreePine,
  'Fence Installation': Home,
  'Deck Building': Home,
  
  // Automotive
  'Auto Repair': Car,
  'Car Detailing': Car,
  
  // Personal Services
  'Pet Services': Heart,
  'Personal Training': Users,
  'Tutoring': Users,
  'Photography': Users,
  'Massage Therapy': Heart,
  'Elder Care': Heart,
};

const getCategoryIcon = (categoryName: string) => {
  return categoryIcons[categoryName as keyof typeof categoryIcons] || Home;
};

export default function CategoriesNew() {
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);
  const { t, language } = useTranslation();

  const { data: categories, isLoading } = useQuery<ServiceCategory[]>({
    queryKey: ["/api/categories"],
    staleTime: 0,
  });

  // Enhanced category groupings with modern structure
  const categoryGroups = {
    'trending': {
      name: 'Trending Services',
      description: 'Most popular this week',
      icon: TrendingUp,
      color: 'bg-gradient-to-br from-pink-500 to-purple-600',
      categories: ['House Cleaning', 'Handyman', 'Electrical', 'Plumbing']
    },
    'home-infrastructure': {
      name: 'Home Infrastructure',
      description: 'Essential home systems',
      icon: Home,
      color: 'bg-gradient-to-br from-blue-500 to-cyan-500',
      categories: ['Plumbing', 'Electrical', 'HVAC', 'Roofing', 'Security Systems']
    },
    'home-improvement': {
      name: 'Home Improvement',
      description: 'Transform your space',
      icon: Sparkles,
      color: 'bg-gradient-to-br from-orange-500 to-red-500',
      categories: ['Kitchen Remodeling', 'Bathroom Remodeling', 'Painting', 'Flooring', 'Carpentry', 'Handyman']
    },
    'cleaning': {
      name: 'Cleaning & Maintenance',
      description: 'Keep your home pristine',
      icon: Sparkles,
      color: 'bg-gradient-to-br from-green-500 to-emerald-500',
      categories: ['House Cleaning', 'Carpet Cleaning', 'Window Cleaning', 'Pressure Washing', 'Junk Removal']
    },
    'outdoor': {
      name: 'Outdoor & Landscaping',
      description: 'Beautiful outdoor spaces',
      icon: TreePine,
      color: 'bg-gradient-to-br from-green-600 to-lime-500',
      categories: ['Landscaping', 'Lawn Care', 'Tree Services', 'Fence Installation', 'Deck Building']
    },
    'personal': {
      name: 'Personal Services',
      description: 'Care for you and your family',
      icon: Heart,
      color: 'bg-gradient-to-br from-pink-500 to-rose-500',
      categories: ['Pet Services', 'Personal Training', 'Tutoring', 'Photography', 'Massage Therapy', 'Elder Care']
    },
    'automotive': {
      name: 'Automotive',
      description: 'Vehicle care and maintenance',
      icon: Car,
      color: 'bg-gradient-to-br from-gray-600 to-slate-700',
      categories: ['Auto Repair', 'Car Detailing']
    }
  };

  // Filter categories based on search and selected group
  const filteredCategories = useMemo(() => {
    if (!categories) return [];
    
    let filtered = categories.filter(category =>
      category.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      category.description?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (selectedGroup && selectedGroup !== 'trending') {
      const groupCategories = categoryGroups[selectedGroup as keyof typeof categoryGroups]?.categories || [];
      filtered = filtered.filter(category => groupCategories.includes(category.name));
    } else if (selectedGroup === 'trending') {
      const trendingCategories = categoryGroups.trending.categories;
      filtered = filtered.filter(category => trendingCategories.includes(category.name));
    }

    return filtered;
  }, [categories, searchQuery, selectedGroup]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header Skeleton */}
        <div className="bg-white p-4 pt-12 border-b border-gray-100 sticky top-0 z-10">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4">
              <Skeleton className="w-8 h-8 rounded-full" />
              <div>
                <Skeleton className="h-6 w-32 mb-1" />
                <Skeleton className="h-4 w-24" />
              </div>
            </div>
            <Skeleton className="w-20 h-8 rounded-lg" />
          </div>
          <Skeleton className="h-12 w-full rounded-xl" />
        </div>
        
        {/* Categories Skeleton */}
        <div className="p-4 space-y-6">
          <div className="flex space-x-3 overflow-x-auto pb-2">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="w-32 h-20 rounded-xl flex-shrink-0" />
            ))}
          </div>
          <div className="grid grid-cols-2 gap-4">
            {[...Array(12)].map((_, i) => (
              <Skeleton key={i} className="h-32 rounded-2xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Enhanced Header */}
      <div className="bg-white p-4 pt-12 border-b border-gray-100 sticky top-0 z-10 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setLocation("/")}
              className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <div>
              <h1 className="text-xl font-bold text-gray-900">All Services</h1>
              <p className="text-sm text-gray-500">{filteredCategories.length} categories available</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
              className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center hover:bg-blue-100 transition-colors"
            >
              {viewMode === 'grid' ? <List className="w-5 h-5 text-blue-600" /> : <Grid className="w-5 h-5 text-blue-600" />}
            </button>
          </div>
        </div>
        
        {/* Enhanced Search */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <Input
            placeholder="Search services..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-12 pr-4 h-12 rounded-xl border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 focus:bg-white transition-all"
          />
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* Category Group Filters */}
        <div className="flex space-x-3 overflow-x-auto pb-2">
          <button
            onClick={() => setSelectedGroup(null)}
            className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
              selectedGroup === null 
                ? 'bg-blue-600 text-white shadow-lg' 
                : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            All Categories
          </button>
          {Object.entries(categoryGroups).map(([key, group]) => {
            const IconComponent = group.icon;
            return (
              <button
                key={key}
                onClick={() => setSelectedGroup(selectedGroup === key ? null : key)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
                  selectedGroup === key 
                    ? 'bg-blue-600 text-white shadow-lg' 
                    : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                }`}
              >
                <IconComponent className="w-4 h-4" />
                <span>{group.name}</span>
              </button>
            );
          })}
        </div>

        {/* Featured Groups (when no filter selected) */}
        {!selectedGroup && !searchQuery && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-gray-900">Browse by Category</h2>
            <div className="grid grid-cols-2 gap-4">
              {Object.entries(categoryGroups).slice(0, 6).map(([key, group]) => {
                const IconComponent = group.icon;
                const matchingCategories = categories?.filter(cat => 
                  group.categories.includes(cat.name)
                ).length || 0;
                
                return (
                  <button
                    key={key}
                    onClick={() => setSelectedGroup(key)}
                    className="group"
                  >
                    <Card className="h-full border-0 shadow-md hover:shadow-xl transition-all duration-300 group-hover:scale-[1.02]">
                      <CardContent className="p-4">
                        <div className={`w-12 h-12 rounded-2xl ${group.color} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                          <IconComponent className="w-6 h-6 text-white" />
                        </div>
                        <h3 className="font-semibold text-gray-900 text-left mb-1 text-sm">
                          {group.name}
                        </h3>
                        <p className="text-xs text-gray-500 text-left mb-2">
                          {group.description}
                        </p>
                        <Badge variant="secondary" className="text-xs">
                          {matchingCategories} services
                        </Badge>
                      </CardContent>
                    </Card>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Service Categories Grid/List */}
        {(selectedGroup || searchQuery) && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900">
                {selectedGroup 
                  ? categoryGroups[selectedGroup as keyof typeof categoryGroups]?.name || 'Services'
                  : 'Search Results'
                }
              </h2>
              <span className="text-sm text-gray-500">{filteredCategories.length} services</span>
            </div>
            
            {viewMode === 'grid' ? (
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredCategories.map((category) => {
                  const IconComponent = getCategoryIcon(category.name);
                  return (
                    <Link key={category.id} href={`/providers?category=${category.id}`}>
                      <Card className="group hover:shadow-xl transition-all duration-300 cursor-pointer h-full hover:scale-[1.02] border-0 shadow-md">
                        <CardContent className="p-6 flex flex-col items-center justify-center h-full min-h-[140px]">
                          <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 border border-blue-100">
                            <IconComponent className="w-8 h-8 text-blue-600" strokeWidth={1.5} />
                          </div>
                          <h3 className="font-bold text-gray-900 text-center leading-tight text-sm group-hover:text-blue-600 transition-colors">
                            {translateCategoryName(category.name, language)}
                          </h3>
                          <p className="text-xs text-gray-500 text-center mt-1 line-clamp-2">
                            {category.description}
                          </p>
                        </CardContent>
                      </Card>
                    </Link>
                  );
                })}
              </div>
            ) : (
              <div className="space-y-3">
                {filteredCategories.map((category) => {
                  const IconComponent = getCategoryIcon(category.name);
                  return (
                    <Link key={category.id} href={`/providers?category=${category.id}`}>
                      <Card className="group hover:shadow-lg transition-all duration-200 cursor-pointer border-0 shadow-sm">
                        <CardContent className="p-4 flex items-center space-x-4">
                          <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center flex-shrink-0 border border-blue-100">
                            <IconComponent className="w-6 h-6 text-blue-600" strokeWidth={1.5} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                              {translateCategoryName(category.name, language)}
                            </h3>
                            <p className="text-sm text-gray-500 truncate">
                              {category.description}
                            </p>
                          </div>
                          <div className="flex items-center space-x-2 text-gray-400">
                            <Star className="w-4 h-4" />
                            <span className="text-sm">4.8</span>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Empty State */}
        {filteredCategories.length === 0 && (searchQuery || selectedGroup) && (
          <div className="text-center py-12">
            <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No services found</h3>
            <p className="text-gray-500 mb-4">
              {searchQuery 
                ? `No services match "${searchQuery}"`
                : "No services in this category"
              }
            </p>
            <Button 
              onClick={() => {
                setSearchQuery("");
                setSelectedGroup(null);
              }}
              variant="outline"
              className="rounded-xl"
            >
              Show All Services
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}