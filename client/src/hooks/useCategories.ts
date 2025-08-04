import { useQuery } from "@tanstack/react-query";
import { ServiceCategory } from "@shared/schema";
import { CategoryService } from "@/services/categoryService";

/**
 * Enhanced categories hook with better data organization
 */
export function useCategories() {
  const { data: rawCategories, isLoading, error } = useQuery<ServiceCategory[]>({
    queryKey: ["/api/categories"],
  });

  const categories = rawCategories || [];
  
  return {
    // Raw data
    categories,
    isLoading,
    error,
    
    // Organized data for different UI sections
    featuredCategories: CategoryService.getFeaturedCategories(categories),
    trendingCategories: CategoryService.getTrendingCategories(categories),
    quickServices: CategoryService.getQuickServices(categories),
    
    // Utility functions
    getCategoryIcon: (name: string) => CategoryService.getEnhancedIconName(name),
    getCategoryColor: (category: ServiceCategory) => CategoryService.getEnhancedColor(category),
  };
}