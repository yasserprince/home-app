import React from "react";
import { 
  Wrench, Zap, Thermometer, Hammer, Paintbrush, Home, 
  Car, Shirt, Shield, Smartphone, Laptop, Camera,
  TreePine, Scissors, Baby, Heart, GraduationCap, Music,
  ChefHat, Gift, Flower, Dog, Droplets,
  Lightbulb, Settings, Truck, Package, Users, Calculator,
  Sparkles
} from "lucide-react";

// Modern icon mapping with enhanced mobile compatibility
const MODERN_ICON_MAP: Record<string, React.ComponentType<any>> = {
  // Home Services
  'wrench': Wrench,
  'zap': Zap,
  'thermometer': Thermometer,
  'hammer': Hammer,
  'paintbrush': Paintbrush,
  'home': Home,
  'shield': Shield,
  'droplets': Droplets,
  'lightbulb': Lightbulb,
  'settings': Settings,
  
  // Personal Services
  'scissors': Scissors,
  'baby': Baby,
  'heart': Heart,
  'graduation-cap': GraduationCap,
  'music': Music,
  'camera': Camera,
  'dog': Dog,
  
  // Professional Services
  'laptop': Laptop,
  'smartphone': Smartphone,
  'calculator': Calculator,
  'users': Users,
  'truck': Truck,
  'package': Package,
  
  // Lifestyle
  'chef-hat': ChefHat,
  'gift': Gift,
  'flower': Flower,
  'tree-pine': TreePine,
  'car': Car,
  'shirt': Shirt,
  'cleaning': Sparkles,
  
  // Default fallback
  'search': Settings
};

interface ModernServiceIconProps {
  iconName: string;
  size?: number;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * Modern service icon component optimized for mobile devices
 * Uses Lucide React icons with enhanced mobile rendering
 */
export function ModernServiceIcon({ 
  iconName, 
  size = 24, 
  className = "", 
  style = {} 
}: ModernServiceIconProps) {
  // Get icon component with fallback
  const IconComponent = MODERN_ICON_MAP[iconName] || MODERN_ICON_MAP['search'];
  
  return (
    <IconComponent
      size={size}
      className={`${className} modern-service-icon`}
      style={{
        ...style,
        // Mobile optimization
        display: 'block',
        verticalAlign: 'middle',
        // Prevent iOS icon distortion
        WebkitBackfaceVisibility: 'hidden',
        WebkitTransform: 'translateZ(0)',
        transform: 'translateZ(0)',
        // Ensure crisp rendering
        imageRendering: 'crisp-edges',
        // Hardware acceleration
        willChange: 'transform',
      }}
      // Explicit SVG attributes for mobile
      strokeWidth={2}
      fill="none"
      stroke="currentColor"
    />
  );
}

// CSS styles for modern icons
export const modernIconStyles = `
.modern-service-icon {
  /* Mobile-specific optimizations */
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  
  /* Prevent selection and highlighting */
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
  
  /* Smooth transitions */
  transition: all 0.2s ease-in-out;
}

.modern-service-icon:hover {
  transform: translateZ(0) scale(1.1);
}

/* iOS Safari specific fixes */
@supports (-webkit-overflow-scrolling: touch) {
  .modern-service-icon {
    -webkit-transform: translate3d(0, 0, 0);
    transform: translate3d(0, 0, 0);
  }
}
`;