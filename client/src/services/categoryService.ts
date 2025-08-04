import { ServiceCategory } from "@shared/schema";

/**
 * Enhanced category service with better organization and mobile optimization
 */
export class CategoryService {
  
  /**
   * Get featured categories for home page (mobile-optimized selection)
   */
  static getFeaturedCategories(categories: ServiceCategory[]): ServiceCategory[] {
    const featuredNames = [
      'Plumbing', 'Electrical', 'Cleaning', 
      'Handyman', 'HVAC', 'Painting'
    ];
    
    return categories
      .filter(cat => featuredNames.includes(cat.name))
      .slice(0, 6);
  }
  
  /**
   * Get trending categories based on usage patterns
   */
  static getTrendingCategories(categories: ServiceCategory[]): ServiceCategory[] {
    const trendingNames = [
      'House Cleaning', 'Handyman', 'TV Mounting',
      'Furniture Assembly', 'Plumbing', 'Electrical'
    ];
    
    return categories
      .filter(cat => trendingNames.includes(cat.name))
      .slice(0, 4);
  }
  
  /**
   * Get quick service categories for immediate booking
   */
  static getQuickServices(categories: ServiceCategory[]): ServiceCategory[] {
    const quickNames = [
      'Furniture Assembly', 'TV Mounting', 'Picture Hanging',
      'Appliance Installation'
    ];
    
    return categories
      .filter(cat => quickNames.includes(cat.name))
      .slice(0, 3);
  }
  
  /**
   * Enhanced icon mapping for better mobile rendering
   */
  static getEnhancedIconName(categoryName: string): string {
    const iconMap: Record<string, string> = {
      // Home Infrastructure
      'Plumbing': 'wrench',
      'Electrical': 'zap',
      'HVAC': 'thermometer',
      'Roofing': 'home',
      'Security Systems': 'shield',
      
      // Home Improvement
      'Kitchen Remodeling': 'chef-hat',
      'Bathroom Remodeling': 'droplets',
      'Painting': 'paintbrush',
      'Flooring': 'home',
      'Carpentry': 'hammer',
      'Handyman': 'hammer',
      
      // Cleaning & Maintenance
      'House Cleaning': 'cleaning',
      'Carpet Cleaning': 'cleaning',
      'Window Cleaning': 'droplets',
      'Pressure Washing': 'droplets',
      'Junk Removal': 'truck',
      
      // Technology & Appliances
      'TV Mounting': 'smartphone',
      'Smart Home': 'lightbulb',
      'Appliance Repair': 'settings',
      'Furniture Assembly': 'hammer',
      
      // Personal Services
      'Pet Services': 'dog',
      'Personal Training': 'heart',
      'Tutoring': 'graduation-cap',
      'Photography': 'camera',
      'Massage Therapy': 'heart',
      'Elder Care': 'heart',
      
      // Professional Services
      'Accounting': 'calculator',
      'Legal Services': 'users',
      'Web Design': 'laptop',
      
      // Automotive
      'Auto Repair': 'car',
      'Car Detailing': 'car',
      
      // Default fallback
      'default': 'settings'
    };
    
    return iconMap[categoryName] || iconMap['default'];
  }
  
  /**
   * Get category color with enhanced mobile visibility
   */
  static getEnhancedColor(category: ServiceCategory): string {
    const colorMap: Record<string, string> = {
      'Plumbing': 'hsl(207, 90%, 54%)',
      'Electrical': 'hsl(39, 96%, 49%)',
      'HVAC': 'hsl(200, 70%, 45%)',
      'Handyman': 'hsl(25, 85%, 55%)',
      'Painting': 'hsl(291, 64%, 58%)',
      'House Cleaning': 'hsl(142, 71%, 45%)',
      'TV Mounting': 'hsl(262, 83%, 58%)',
      'Furniture Assembly': 'hsl(24, 94%, 50%)',
      'Security Systems': 'hsl(0, 84%, 60%)',
      'Smart Home': 'hsl(217, 91%, 60%)',
    };
    
    return colorMap[category.name] || category.color || 'hsl(210, 40%, 60%)';
  }
}