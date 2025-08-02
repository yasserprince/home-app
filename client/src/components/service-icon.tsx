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
  // Primary icons
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
  'paw-print': PawPrint,
  dumbbell: Dumbbell,
  'graduation-cap': GraduationCap,
  camera: Camera,
  hand: Hand,
  heart: Heart,
  calendar: Calendar,
  'utensils-crossed': UtensilsCrossed,
  'chef-hat': Utensils,
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
  
  // Aliases and variations (no duplicates)
  saw: Hammer, // Better mapping for carpentry
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
  
  // Database specific mappings (exact matches from service_categories table)
  'chef-hat': Utensils,
  'calendar-alt': Calendar,
  'swimming-pool': Waves,
  'paw-print': PawPrint,
  'graduation-cap': GraduationCap,
  'car-wash': Brush,
  'solar-panel': Sun,
  'temperature-low': Wind,
  
  // Common service category mappings
  plumbing: Wrench,
  electrical: Zap,
  hvac: Thermometer,
  carpentry: Hammer,
  painting: Paintbrush,
  cleaning: Sparkles,
  landscaping: Leaf,
  moving: Truck,
  'pest-control': Bug,
  fitness: Dumbbell,
  tutoring: GraduationCap,
  photography: Camera,
  massage: Hand,
  wellness: Heart,
  catering: Utensils,
  entertainment: Music,
  automotive: Car,
  legal: Scale,
  'it-support': Monitor,
  'home-security': Shield,
  'furniture-assembly': Armchair,
  delivery: Package,
  'pool-cleaning': Waves,
  'ac-repair': Snowflake,
  'solar-installation': Sun,
  'event-planning': Calendar,
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
  ];
  
  // Try to find a matching icon
  for (const variation of variations) {
    const FoundIcon = iconMap[variation as keyof typeof iconMap];
    if (FoundIcon) {
      return <FoundIcon className={className} style={style} />;
    }
  }
  
  // If still not found, return fallback
  console.warn(`Icon "${iconName}" not found in iconMap.`);
  return <Search className={className} style={style} />;
}