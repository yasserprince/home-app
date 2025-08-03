import React from "react";
import {
  Wrench, Zap, Thermometer, Hammer, Paintbrush, Home, LayoutGrid,
  Utensils, Bath, Sparkles, Square, Droplets, Truck,
  TreePine, Leaf, Trees, Fence, Layout, Settings, Monitor,
  Wifi, Shield, Armchair, Package, Waves, Bug, Warehouse,
  PawPrint, Dumbbell, GraduationCap, Camera, Hand, Heart,
  Calendar, UtensilsCrossed, Music, Wine, Car, Brush,
  Calculator, Scale, Code, Snowflake, Star, Sofa, Cog,
  Sun, Wind, Search, CircleDot, Wrench as WrenchIcon,
  type LucideIcon
} from "lucide-react";

const iconMap = {
  // Primary Lucide icons
  wrench: Wrench,
  zap: Zap,
  thermometer: Thermometer,
  hammer: Hammer,
  paintbrush: Paintbrush,
  home: Home,
  'layout-grid': LayoutGrid,
  grid: LayoutGrid,
  utensils: Utensils,
  bath: Bath,
  sparkles: Sparkles,
  spray: CircleDot,
  square: Square,
  droplets: Droplets,
  truck: Truck,
  'tree-pine': TreePine,
  leaf: Leaf,
  tree: Trees,
  fence: Fence,
  layout: Layout,
  settings: Settings,
  monitor: Monitor,
  wifi: Wifi,
  shield: Shield,
  armchair: Armchair,
  package: Package,
  waves: Waves,
  bug: Bug,
  road: Square,
  warehouse: Warehouse,
  dumbbell: Dumbbell,
  camera: Camera,
  hand: Hand,
  heart: Heart,
  calendar: Calendar,
  'utensils-crossed': UtensilsCrossed,
  wine: Wine,
  car: Car,
  brush: Brush,
  calculator: Calculator,
  scale: Scale,
  code: Code,
  snowflake: Snowflake,
  star: Star,
  sofa: Sofa,
  cog: Cog,
  sun: Sun,
  wind: Wind,
  search: Search,
  
  // Database specific mappings (from service_categories table)
  'chef-hat': Utensils,
  'calendar-alt': Calendar,
  'swimming-pool': Waves,
  'paw-print': PawPrint,
  'graduation-cap': GraduationCap,
  'car-wash': Brush,
  'solar-panel': Sun,
  'temperature-low': Wind,
  
  // Additional service mappings
  'tool': Wrench,
  'electrical': Zap,
  'plumbing': Wrench,
  'painting': Paintbrush,
  'cleaning': Sparkles,
  'hvac': Thermometer,
  'handyman': Hammer,
  'roofing': Home,
  'flooring': Square,
  'landscaping': TreePine,
  'appliance': Square,
  'pest': Bug,
  'moving': Truck,
  'security': Shield,
  'pool': Waves,
  'automotive': Car,
  'wellness': Heart,
  'pet': PawPrint,
  'fitness': Dumbbell,
  'education': GraduationCap,
  'photography': Camera,
  'events': Calendar,
  'catering': Utensils,
  'legal': Scale,
  'technology': Monitor,
  'design': Layout,
  'finance': Calculator,
  saw: Hammer,
  tv: Monitor,
  spa: Sparkles,
  cocktail: Wine,
  gavel: Scale,
  'border-style': Fence,
  th: Layout,
  chair: Armchair,
  boxes: Package,
  couch: Sofa,
  cogs: Settings,
};

interface ServiceIconProps {
  iconName: string;
  className?: string;
  style?: React.CSSProperties;
}

export function ServiceIcon({ iconName, className = "w-5 h-5", style }: ServiceIconProps) {
  // Handle empty or undefined iconName
  if (!iconName || typeof iconName !== 'string') {
    return <Search className={`${className} text-gray-500`} style={style} strokeWidth={2} />;
  }
  
  // Debug logging
  console.log('🔧 ServiceIcon Debug:', {
    iconName,
    IconComponentName: iconMap[iconName as keyof typeof iconMap]?.name || 'unknown',
    iconMapHasKey: iconName in iconMap,
    availableKeys: Object.keys(iconMap).slice(0, 10)
  });
  
  // Get the icon component - try exact match first
  let IconComponent: LucideIcon | null = iconMap[iconName as keyof typeof iconMap] || null;
  
  if (!IconComponent) {
    // Clean and normalize icon name
    const cleanIconName = iconName.toLowerCase().trim();
    IconComponent = iconMap[cleanIconName as keyof typeof iconMap] || null;
  }
  
  if (!IconComponent) {
    // Try common variations and mappings
    const variations = [
      iconName.toLowerCase().replace(/\s+/g, '-'), // spaces to hyphens
      iconName.toLowerCase().replace(/[-_\s]/g, ''), // Remove all separators
      iconName.toLowerCase().replace(/\s+/g, '_'), // spaces to underscores
      iconName.toLowerCase().replace(/ing$/, ''), // Remove 'ing' suffix
      iconName.toLowerCase().replace(/s$/, ''), // Remove plural 's'
    ];
    
    // Try to find a matching icon
    for (const variation of variations) {
      const mappedIcon = iconMap[variation as keyof typeof iconMap];
      if (mappedIcon) {
        IconComponent = mappedIcon;
        break;
      }
    }
  }
  
  if (!IconComponent) {
    // Category-specific fallbacks
    const cleanIconName = iconName.toLowerCase();
    if (cleanIconName.includes('plumb') || cleanIconName.includes('pipe') || cleanIconName.includes('water')) {
      IconComponent = Wrench;
    } else if (cleanIconName.includes('electric') || cleanIconName.includes('wiring') || cleanIconName.includes('light')) {
      IconComponent = Zap;
    } else if (cleanIconName.includes('hvac') || cleanIconName.includes('air') || cleanIconName.includes('heat') || cleanIconName.includes('cool')) {
      IconComponent = Thermometer;
    } else if (cleanIconName.includes('handyman') || cleanIconName.includes('repair') || cleanIconName.includes('fix')) {
      IconComponent = Hammer;
    } else if (cleanIconName.includes('paint') || cleanIconName.includes('color')) {
      IconComponent = Paintbrush;
    } else if (cleanIconName.includes('clean') || cleanIconName.includes('wash')) {
      IconComponent = Sparkles;
    } else if (cleanIconName.includes('roof') || cleanIconName.includes('home') || cleanIconName.includes('house')) {
      IconComponent = Home;
    } else if (cleanIconName.includes('landscape') || cleanIconName.includes('garden') || cleanIconName.includes('tree')) {
      IconComponent = TreePine;
    } else if (cleanIconName.includes('security') || cleanIconName.includes('protect')) {
      IconComponent = Shield;
    } else if (cleanIconName.includes('move') || cleanIconName.includes('transport')) {
      IconComponent = Truck;
    } else {
      IconComponent = Search; // Ultimate fallback
    }
  }
  
  // Debug logging for troubleshooting
  if (typeof window !== 'undefined') {
    console.log(`🔧 ServiceIcon Debug:`, {
      iconName,
      IconComponentName: IconComponent?.name || 'unknown',
      iconMapHasKey: !!iconMap[iconName as keyof typeof iconMap],
      availableKeys: Object.keys(iconMap).slice(0, 10)
    });
  }

  // Ensure we have a valid component to render
  if (!IconComponent || typeof IconComponent !== 'function') {
    console.warn('ServiceIcon: Invalid icon component for', iconName, 'using fallback');
    return <Search className={className} style={style} strokeWidth={2} />;
  }

  // Render the icon component with proper props
  return (
    <IconComponent 
      className={className}
      style={style}
      strokeWidth={2}
    />
  );
}