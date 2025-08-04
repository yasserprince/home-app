import { useQuery } from "@tanstack/react-query";
import { ServiceCategory } from "@shared/schema";
import { CategoryService } from "@/services/categoryService";
import { useTranslation } from "./useTranslation";

// Translation key mapping for categories
const categoryTranslationMap: Record<string, string> = {
  "Plumbing": "plumbing",
  "Electrical": "electrical", 
  "HVAC": "hvac",
  "House Cleaning": "houseCleaning",
  "Handyman": "handyman",
  "Carpet Cleaning": "carpetCleaning",
  "Painting": "painting",
  "Kitchen Remodeling": "kitchenRemodeling",
  "Bathroom Remodeling": "bathroomRemodeling",
  "Roofing": "roofing",
  "Flooring": "flooring",
  "Carpentry": "carpentry",
  "Auto Repair": "autoRepair",
  "Car Detailing": "autoRepair" // Using same translation as Auto Repair
};

/**
 * Enhanced categories hook with better data organization and translation
 */
export function useCategories() {
  const { data: rawCategories, isLoading, error } = useQuery<ServiceCategory[]>({
    queryKey: ["/api/categories"],
  });
  const { t } = useTranslation();

  // Transform categories with translations
  const categories = (rawCategories || []).map(category => ({
    ...category,
    translatedName: getTranslatedCategoryName(category.name, t)
  }));
  
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
    getTranslatedName: (name: string) => getTranslatedCategoryName(name, t),
  };
}

/**
 * Get translated category name
 */
function getTranslatedCategoryName(categoryName: string, t: (key: string) => string): string {
  const translationKey = categoryTranslationMap[categoryName];
  if (translationKey) {
    return t(translationKey);
  }
  return categoryName; // Fallback to original name
}