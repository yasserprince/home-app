import { useQuery } from "@tanstack/react-query";

export interface ServiceCategory {
  id: string;
  name: string;
  nameAr?: string | null;
  nameFr?: string | null;
  description?: string | null;
  descriptionAr?: string | null;
  descriptionFr?: string | null;
  icon: string;
  color: string;
  category: string;
  isPopular: boolean;
  sortOrder: number;
  isActive: boolean;
  averagePrice?: string | null;
  estimatedDuration?: string | null;
  skillLevel: string;
  requiresLicense: boolean;
  emergencyService: boolean;
  createdAt: Date | null;
  updatedAt: Date | null;
}

export function useCategories() {
  const { data: categories, isLoading, error } = useQuery<ServiceCategory[]>({
    queryKey: ['/api/categories'],
  });

  const { data: popularCategories } = useQuery<ServiceCategory[]>({
    queryKey: ['/api/categories/popular'],
  });

  // Transform database categories into legacy format for backward compatibility
  const featuredCategories = categories?.slice(0, 8) || [];
  const trendingCategories = popularCategories?.slice(0, 6) || [];
  const quickServices = categories?.filter(cat => cat.emergencyService)?.slice(0, 4) || [];

  // Helper functions for backward compatibility
  const getCategoryIcon = (categoryName: string) => {
    const category = categories?.find(cat => cat.name === categoryName);
    return category?.icon || 'Square';
  };

  const getCategoryColor = (category: ServiceCategory) => {
    return category.color || 'bg-blue-500';
  };

  const getTranslatedName = (categoryName: string) => {
    // For now, just return the name as-is
    // TODO: Implement proper translation based on current language
    return categoryName;
  };

  return {
    data: categories,
    categories,
    featuredCategories,
    trendingCategories,
    quickServices,
    isLoading,
    error,
    getCategoryIcon,
    getCategoryColor,
    getTranslatedName
  };
}

export function usePopularCategories() {
  return useQuery<ServiceCategory[]>({
    queryKey: ['/api/categories/popular'],
  });
}

export function useCategoriesByGroup(group: string) {
  return useQuery<ServiceCategory[]>({
    queryKey: ['/api/categories/by-group', group],
    enabled: !!group,
  });
}