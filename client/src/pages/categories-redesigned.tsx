import React, { useState, useMemo } from "react";
import { Link } from "wouter";
import { useCategories, usePopularCategories, type ServiceCategory } from "@/hooks/useCategories";
import { useTranslation } from "@/hooks/useTranslation";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import BottomNavigation from "@/components/bottom-navigation";
import * as LucideIcons from "lucide-react";
import {
  ArrowLeft,
  Search,
  Grid3X3,
  List,
  X,
  Filter,
  TrendingUp,
  Home as HomeIcon,
  Zap,
  User,
  Car,
  Laptop,
  Heart,
  Calculator
} from "lucide-react";

// Category groups mapping database categories to display groups
const getCategoryGroups = (t: (key: string) => string) => ({
  home_maintenance: {
    name: t('homeMaintenanceRepairs'),
    icon: HomeIcon,
    color: "hsl(207, 90%, 54%)",
  },
  cleaning: {
    name: t('cleaningServices'),
    icon: LucideIcons.Sparkles,
    color: "hsl(291, 64%, 58%)",
  },
  painting: {
    name: t('paintingDecoration'),
    icon: LucideIcons.Paintbrush,
    color: "hsl(25, 85%, 55%)",
  },
  outdoor: {
    name: t('outdoorLandscaping'),
    icon: LucideIcons.Trees,
    color: "hsl(142, 71%, 45%)",
  },
  moving: {
    name: t('movingDelivery'),
    icon: LucideIcons.Truck,
    color: "hsl(39, 96%, 49%)",
  },
  tech: {
    name: t('techElectronics'),
    icon: Laptop,
    color: "hsl(217, 91%, 60%)",
  },
  pets: {
    name: t('petServices'),
    icon: LucideIcons.Dog,
    color: "hsl(39, 96%, 49%)",
  },
  automotive: {
    name: t('automotiveServices'),
    icon: Car,
    color: "hsl(0, 84%, 60%)",
  },
  business: {
    name: t('businessServices'),
    icon: Calculator,
    color: "hsl(217, 91%, 60%)",
  },
  education: {
    name: t('educationTutoring'),
    icon: LucideIcons.GraduationCap,
    color: "hsl(142, 71%, 45%)",
  },
  events: {
    name: t('eventsParty'),
    icon: LucideIcons.Calendar,
    color: "hsl(291, 64%, 58%)",
  },
  beauty: {
    name: t('beautyWellness'),
    icon: Heart,
    color: "hsl(0, 84%, 60%)",
  },
  creative: {
    name: t('creativeServices'),
    icon: LucideIcons.Palette,
    color: "hsl(25, 85%, 55%)",
  }
});

// Helper function to get Lucide icon component by name
const getIconComponent = (iconName: string) => {
  // @ts-ignore - Dynamic icon access
  const IconComponent = LucideIcons[iconName];
  return IconComponent || LucideIcons.Square; // Fallback to Square if icon not found
};

export default function CategoriesRedesigned() {
  const { data: categories, isLoading, error } = useCategories();
  const { data: popularCategories } = usePopularCategories();
  const { t, language, changeLanguage, isRTL } = useTranslation();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  
  const CATEGORY_GROUPS = getCategoryGroups(t);

  // Filter categories based on search and selected group
  const filteredCategories = useMemo(() => {
    let filtered = categories || [];

    // Filter by search query
    if (searchQuery.trim()) {
      filtered = filtered.filter(category =>
        category.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        category.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter by selected group
    if (selectedGroup && selectedGroup !== 'all') {
      filtered = filtered.filter(category => 
        category.category === selectedGroup
      );
    }

    return filtered;
  }, [categories, searchQuery, selectedGroup]);

  // Group categories for display
  const groupedCategories = useMemo(() => {
    if (selectedGroup && selectedGroup !== 'all') {
      return { [selectedGroup]: filteredCategories };
    }

    const grouped: Record<string, ServiceCategory[]> = {};
    Object.keys(CATEGORY_GROUPS).forEach(groupKey => {
      grouped[groupKey] = filteredCategories.filter(category =>
        category.category === groupKey
      );
    });

    return grouped;
  }, [filteredCategories, selectedGroup, CATEGORY_GROUPS]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900">
        <div className="p-6 pt-12">
          <Skeleton className="h-8 w-48 mb-6 bg-white/20" />
          <Skeleton className="h-12 w-full mb-6 bg-white/20" />
          <div className="grid grid-cols-2 gap-4">
            {[...Array(8)].map((_, i) => (
              <Skeleton key={i} className="h-32 bg-white/20 rounded-2xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-gradient-to-r from-gray-900/95 via-blue-900/95 to-purple-900/95 backdrop-blur-md border-b border-white/10">
        <div className="flex items-center justify-between p-6 pt-12">
          <div className="flex items-center space-x-4">
            <Link href="/">
              <Button variant="ghost" size="icon" className="text-white hover:bg-white/10">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-white">{t('allServices')}</h1>
              <p className="text-white/70 text-sm">
                {filteredCategories.length} {t('categoriesAvailable')}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
              className="text-white hover:bg-white/10"
            >
              {viewMode === 'grid' ? <List className="h-5 w-5" /> : <Grid3X3 className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="px-6 pb-4">
          <div className="relative">
            <Input
              type="text"
              placeholder={t('searchServices')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full py-3 px-4 pl-12 pr-10 rounded-xl text-gray-900 bg-white/95 backdrop-blur-md border-0 shadow-lg"
            />
            <Search className="w-5 h-5 absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Category Group Filters */}
        <div className="px-6 pb-4">
          <div className="flex gap-2 overflow-x-auto scrollbar-hide">
            <Button
              variant={selectedGroup === null || selectedGroup === 'all' ? "default" : "ghost"}
              size="sm"
              onClick={() => setSelectedGroup('all')}
              className={`whitespace-nowrap ${
                selectedGroup === null || selectedGroup === 'all'
                  ? 'bg-white text-gray-900 hover:bg-white/90'
                  : 'text-white hover:bg-white/10'
              }`}
            >
              <Filter className="w-4 h-4 mr-1" />
              {t('showAll')}
            </Button>
            {Object.entries(CATEGORY_GROUPS).map(([key, group]) => {
              const IconComponent = group.icon;
              const categoryCount = categories?.filter(cat => cat.category === key).length || 0;
              return (
                <Button
                  key={key}
                  variant={selectedGroup === key ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setSelectedGroup(key)}
                  className={`whitespace-nowrap flex items-center gap-2 ${
                    selectedGroup === key
                      ? 'bg-white text-gray-900 hover:bg-white/90'
                      : 'text-white hover:bg-white/10'
                  }`}
                >
                  <IconComponent className="w-4 h-4" />
                  {group.name}
                  <Badge 
                    variant="secondary" 
                    className={`ml-1 text-xs ${
                      selectedGroup === key ? 'bg-gray-200 text-gray-700' : 'bg-white/20 text-white'
                    }`}
                  >
                    {categoryCount}
                  </Badge>
                </Button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Categories Content */}
      <div className="p-6 pb-24">
        {Object.entries(groupedCategories).map(([groupKey, groupCategories]) => {
          if (groupCategories.length === 0) return null;
          
          const group = CATEGORY_GROUPS[groupKey as keyof typeof CATEGORY_GROUPS] || {
            name: 'Other Services',
            icon: Grid3X3,
            color: 'hsl(210, 40%, 60%)'
          };

          return (
            <div key={groupKey} className="mb-8">
              {(!selectedGroup || selectedGroup === 'all') && (
                <div className="flex items-center gap-3 mb-4">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: `${group.color}30` }}
                  >
                    <group.icon className="w-4 h-4" style={{ color: group.color }} />
                  </div>
                  <h2 className="text-xl font-bold text-white">{group.name}</h2>
                  <Badge className="bg-white/20 text-white border-white/30">
                    {groupCategories.length}
                  </Badge>
                </div>
              )}

              {viewMode === 'grid' ? (
                <div className="grid grid-cols-2 gap-4">
                  {groupCategories.map((category) => (
                    <Link key={category.id} href={`/providers?category=${category.id}`}>
                      <Card className="bg-white/15 backdrop-blur-md border-white/30 hover:bg-white/25 transition-all duration-300 hover:scale-105">
                        <CardContent className="p-4 flex flex-col items-center text-center h-32">
                          <div
                            className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-3 shadow-lg ${category.color}`}
                          >
                            {React.createElement(getIconComponent(category.icon), {
                              className: "w-8 h-8 text-white"
                            })}
                          </div>
                          <h3 className="text-white font-semibold text-sm line-clamp-2">
                            {category.name}
                          </h3>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="space-y-3">
                  {groupCategories.map((category) => (
                    <Link key={category.id} href={`/providers?category=${category.id}`}>
                      <Card className="bg-white/15 backdrop-blur-md border-white/30 hover:bg-white/25 transition-all duration-300">
                        <CardContent className="p-4 flex items-center space-x-4">
                          <div
                            className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg ${category.color}`}
                          >
                            {React.createElement(getIconComponent(category.icon), {
                              className: "w-6 h-6 text-white"
                            })}
                          </div>
                          <div className="flex-1">
                            <h3 className="text-white font-semibold line-clamp-1">
                              {category.name}
                            </h3>
                            <p className="text-white/70 text-sm line-clamp-2">
                              {category.description}
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                              {category.averagePrice && (
                                <Badge variant="outline" className="text-xs bg-white/10 text-white border-white/20">
                                  ${category.averagePrice}/hr
                                </Badge>
                              )}
                              {category.emergencyService && (
                                <Badge variant="outline" className="text-xs bg-red-500/20 text-red-200 border-red-300/20">
                                  24/7
                                </Badge>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          );
        })}

        {filteredCategories.length === 0 && (
          <div className="text-center py-12">
            <Search className="w-16 h-16 text-white/30 mx-auto mb-4" />
            <h3 className="text-white text-xl font-semibold mb-2">{t('noServicesFound')}</h3>
            <p className="text-white/70 mb-4">{t('tryAdjustingFilters')}</p>
            <Button 
              onClick={() => {
                setSearchQuery("");
                setSelectedGroup(null);
              }}
              className="bg-white text-gray-900 hover:bg-white/90"
            >
              {t('clearFilters')}
            </Button>
          </div>
        )}
      </div>

      {/* Bottom Navigation */}
      <BottomNavigation activeTab="home" />
    </div>
  );
}