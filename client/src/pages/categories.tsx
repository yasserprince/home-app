import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Search, Grid, List, ChevronRight } from "lucide-react";
import { MobileEnhancedIcon } from "@/components/mobile-enhanced-icon";
import { ServiceCategory } from "@shared/schema";

export default function Categories() {
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const { data: categories, isLoading } = useQuery<ServiceCategory[]>({
    queryKey: ["/api/categories"],
  });

  // Filter categories based on search
  const filteredCategories = categories?.filter(category =>
    category.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    category.description?.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  // Group categories by type for better organization
  const categoryGroups = {
    'Home Infrastructure': ['Plumbing', 'Electrical', 'HVAC', 'Roofing', 'Security Systems'],
    'Home Improvement': ['Kitchen Remodeling', 'Bathroom Remodeling', 'Painting', 'Flooring', 'Carpentry', 'Handyman'],
    'Cleaning & Maintenance': ['House Cleaning', 'Carpet Cleaning', 'Window Cleaning', 'Pressure Washing', 'Junk Removal'],
    'Outdoor & Landscaping': ['Landscaping', 'Lawn Care', 'Tree Services', 'Fence Installation', 'Deck Building'],
    'Technology & Appliances': ['TV Mounting', 'Smart Home', 'Appliance Repair'],
    'Personal & Lifestyle': ['Pet Services', 'Personal Training', 'Tutoring', 'Photography', 'Massage Therapy', 'Elder Care'],
    'Event & Entertainment': ['Event Planning', 'Catering', 'DJ Services', 'Bartending'],
    'Professional Services': ['Accounting', 'Legal Services', 'Web Design'],
    'Automotive': ['Auto Repair', 'Car Detailing'],
    'Seasonal & Specialty': ['Snow Removal', 'Holiday Decorating', 'Pool Services', 'Pest Control', 'Solar Installation']
  };

  const getGroupForCategory = (categoryName: string) => {
    for (const [group, names] of Object.entries(categoryGroups)) {
      if (names.includes(categoryName)) {
        return group;
      }
    }
    return 'Other Services';
  };

  const groupedCategories = filteredCategories.reduce((acc, category) => {
    const group = getGroupForCategory(category.name);
    if (!acc[group]) acc[group] = [];
    acc[group].push(category);
    return acc;
  }, {} as Record<string, ServiceCategory[]>);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white p-4 pt-12 border-b border-gray-200">
          <div className="flex items-center space-x-4 mb-4">
            <Skeleton className="w-8 h-8" />
            <Skeleton className="h-6 w-32" />
          </div>
          <Skeleton className="h-10 w-full" />
        </div>
        <div className="p-4">
          <div className="grid grid-cols-2 gap-4">
            {[...Array(12)].map((_, i) => (
              <Skeleton key={i} className="h-24" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white p-4 pt-12 border-b border-gray-200 sticky top-0 z-10">
        <div className="flex items-center space-x-4 mb-4">
          <Button
            variant="ghost"
            size="sm"
            className="p-2"
            onClick={() => setLocation("/")}
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </Button>
          <div className="flex-1">
            <h1 className="text-xl font-semibold text-gray-900">All Services</h1>
            <p className="text-sm text-gray-600">{categories?.length || 0} categories available</p>
          </div>
          <div className="flex space-x-2">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('grid')}
            >
              <Grid className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('list')}
            >
              <List className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Input
            type="text"
            placeholder="Search services..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300"
          />
          <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
        </div>
      </div>

      {/* Categories Content */}
      <div className="p-4">
        {searchQuery ? (
          // Search Results
          <div>
            <div className="mb-4">
              <h2 className="text-lg font-semibold text-gray-900 mb-2">
                Search Results for "{searchQuery}"
              </h2>
              <Badge variant="secondary">
                {filteredCategories.length} {filteredCategories.length === 1 ? 'result' : 'results'}
              </Badge>
            </div>
            
            {filteredCategories.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Search className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="font-medium text-gray-900 mb-2">No services found</h3>
                  <p className="text-sm text-gray-600">
                    Try searching with different keywords or browse all categories below
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className={viewMode === 'grid' ? "grid grid-cols-2 gap-3" : "space-y-3"}>
                {filteredCategories.map((category) => (
                  <CategoryCard key={category.id} category={category} viewMode={viewMode} />
                ))}
              </div>
            )}
          </div>
        ) : (
          // Grouped Categories
          <div className="space-y-6">
            {Object.entries(groupedCategories).map(([group, groupCategories]) => (
              <div key={group}>
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-lg font-semibold text-gray-900">{group}</h2>
                  <Badge variant="outline">{groupCategories.length}</Badge>
                </div>
                <div className={viewMode === 'grid' ? "grid grid-cols-2 gap-3" : "space-y-3"}>
                  {groupCategories.map((category) => (
                    <CategoryCard key={category.id} category={category} viewMode={viewMode} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

interface CategoryCardProps {
  category: ServiceCategory;
  viewMode: 'grid' | 'list';
}

function CategoryCard({ category, viewMode }: CategoryCardProps) {
  return (
    <Link href={`/providers?category=${category.id}`}>
      <Card className="hover:shadow-md transition-all duration-200 cursor-pointer hover:scale-[1.02]">
        <CardContent className={viewMode === 'grid' ? "p-3 sm:p-4" : "p-4 flex items-center space-x-4"}>
          {viewMode === 'grid' ? (
            <>
              <div
                className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg flex items-center justify-center mb-2 sm:mb-3 mx-auto flex-shrink-0"
                style={{ backgroundColor: `${category.color}20` }}
              >
                <MobileEnhancedIcon 
                  iconName={category.icon || 'search'} 
                  className="w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0" 
                  style={{ color: category.color || '#6B7280' }} 
                  size={24}
                />
              </div>
              <div className="text-center">
                <h3 className="font-semibold text-gray-900 text-xs sm:text-sm mb-1 group-hover:text-primary transition-colors line-clamp-2">
                  {category.name}
                </h3>
                <p className="text-xs text-gray-600 line-clamp-2">
                  {category.description}
                </p>
              </div>
            </>
          ) : (
            <>
              <div
                className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: `${category.color}20` }}
              >
                <MobileEnhancedIcon 
                  iconName={category.icon || 'search'} 
                  className="w-5 h-5 flex-shrink-0" 
                  style={{ color: category.color || '#6B7280' }} 
                  size={20}
                />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-900 text-sm mb-1 group-hover:text-primary transition-colors">
                  {category.name}
                </h3>
                <p className="text-xs text-gray-600 line-clamp-2">
                  {category.description}
                </p>
              </div>
              <div className="flex-shrink-0">
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}