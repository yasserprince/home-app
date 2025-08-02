import {
  Wrench, Zap, Thermometer, Hammer, Paintbrush, Home, LayoutGrid,
  Utensils, Bath, Sparkles, Square, Droplets, Truck,
  TreePine, Leaf, Trees, Fence, Layout, Settings, Monitor,
  Wifi, Shield, Armchair, Package, Waves, Bug, Warehouse,
  PawPrint, Dumbbell, GraduationCap, Camera, Hand, Heart,
  Calendar, UtensilsCrossed, Music, Wine, Car, Brush,
  Calculator, Scale, Code, Snowflake, Star, Sofa, Cog,
  Sun, Wind, Search, CircleDot
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
    return <Search className={className} style={style} />;
  }
  
  // Try exact match first
  const ExactMatch = iconMap[iconName as keyof typeof iconMap];
  if (ExactMatch) {
    return <ExactMatch className={className} style={style} />;
  }
  
  // Clean and normalize icon name
  const cleanIconName = iconName.toLowerCase().trim();
  const CleanMatch = iconMap[cleanIconName as keyof typeof iconMap];
  if (CleanMatch) {
    return <CleanMatch className={className} style={style} />;
  }
  
  // Try common variations and mappings
  const variations = [
    cleanIconName.replace(/\s+/g, '-'), // spaces to hyphens
    cleanIconName.replace(/[-_\s]/g, ''), // Remove all separators
    cleanIconName.replace(/\s+/g, '_'), // spaces to underscores
    cleanIconName.replace(/ing$/, ''), // Remove 'ing' suffix
    cleanIconName.replace(/s$/, ''), // Remove plural 's'
  ];
  
  // Try to find a matching icon
  for (const variation of variations) {
    const FoundIcon = iconMap[variation as keyof typeof iconMap];
    if (FoundIcon) {
      return <FoundIcon className={className} style={style} />;
    }
  }
  
  // Category-specific fallbacks
  const categoryKeywords = {
    'repair': Wrench,
    'clean': Sparkles,
    'electric': Zap,
    'water': Droplets,
    'home': Home,
    'garden': Leaf,
    'tech': Monitor,
    'food': Utensils,
    'health': Heart,
    'transport': Car,
    'build': Hammer,
    'design': Layout,
  };
  
  // Check for keyword matches
  for (const [keyword, IconComponent] of Object.entries(categoryKeywords)) {
    if (cleanIconName.includes(keyword)) {
      return <IconComponent className={className} style={style} />;
    }
  }
  
  // Return fallback
  return <Search className={className} style={style} />;
}