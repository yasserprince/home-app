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
  music: Music,
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
    console.log('ServiceIcon: Empty iconName, using fallback');
    return <Search className={className} style={style} />;
  }
  
  console.log(`ServiceIcon: Received iconName "${iconName}"`);
  
  // Try exact match first
  const ExactMatch = iconMap[iconName as keyof typeof iconMap];
  if (ExactMatch) {
    console.log(`ServiceIcon: Found exact match for "${iconName}"`);
    return <ExactMatch className={className} style={style} />;
  }
  
  // Clean and normalize icon name
  const cleanIconName = iconName.toLowerCase().trim();
  const CleanMatch = iconMap[cleanIconName as keyof typeof iconMap];
  if (CleanMatch) {
    console.log(`ServiceIcon: Found clean match for "${iconName}" -> "${cleanIconName}"`);
    return <CleanMatch className={className} style={style} />;
  }
  
  // Try common variations and mappings
  const variations = [
    cleanIconName.replace(/\s+/g, '-'), // spaces to hyphens
    cleanIconName.replace(/[-_\s]/g, ''), // Remove all separators
    cleanIconName.replace(/\s+/g, '_'), // spaces to underscores
  ];
  
  // Try to find a matching icon
  for (const variation of variations) {
    const FoundIcon = iconMap[variation as keyof typeof iconMap];
    if (FoundIcon) {
      console.log(`ServiceIcon: Found variation match for "${iconName}" -> "${variation}"`);
      return <FoundIcon className={className} style={style} />;
    }
  }
  
  // If still not found, return fallback with warning
  console.warn(`ServiceIcon: No match found for "${iconName}". Available icons:`, Object.keys(iconMap).slice(0, 10));
  return <Search className={className} style={style} />;
}