import React from "react";
import {
  Wrench, Zap, Thermometer, Hammer, Paintbrush, Home, LayoutGrid,
  Utensils, Bath, Sparkles, Square, Droplets, Truck,
  TreePine, Leaf, Trees, Fence, Layout, Settings, Monitor,
  Wifi, Shield, Armchair, Package, Waves, Bug, Warehouse,
  PawPrint, Dumbbell, GraduationCap, Camera, Hand, Heart,
  Calendar, UtensilsCrossed, Music, Wine, Car, Brush,
  Calculator, Scale, Code, Snowflake, Star, Sofa, Cog,
  Sun, Wind, Search, CircleDot,
  type LucideIcon
} from "lucide-react";

// Explicit icon mapping with proper TypeScript types
const iconMap: Record<string, LucideIcon> = {
  // Primary service icons
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
  square: Square,
  droplets: Droplets,
  truck: Truck,
  'tree-pine': TreePine,
  leaf: Leaf,
  trees: Trees,
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
  warehouse: Warehouse,
  dumbbell: Dumbbell,
  camera: Camera,
  hand: Hand,
  heart: Heart,
  calendar: Calendar,
  'calendar-alt': Calendar,
  'utensils-crossed': UtensilsCrossed,
  music: Music,
  wine: Wine,
  cocktail: Wine,
  car: Car,
  brush: Brush,
  'car-wash': Brush,
  calculator: Calculator,
  scale: Scale,
  gavel: Scale,
  code: Code,
  snowflake: Snowflake,
  star: Star,
  sofa: Sofa,
  cog: Cog,
  sun: Sun,
  'solar-panel': Sun,
  wind: Wind,
  search: Search,
  'paw-print': PawPrint,
  'graduation-cap': GraduationCap,
  spa: Sparkles,
  // Additional aliases
  'temperature-low': Wind,
  'swimming-pool': Waves,
  tv: Monitor,
  chair: Armchair,
  boxes: Package,
  road: Square,
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
    return (
      <Search 
        className={className} 
        style={{
          ...style,
          display: 'inline-block',
          verticalAlign: 'middle'
        }}
        width={20}
        height={20}
        strokeWidth={2}
      />
    );
  }
  
  // Get icon from reliable mapping
  const cleanIconName = iconName.toLowerCase().trim();
  let IconComponent = iconMap[cleanIconName];
  
  // Try variations if not found
  if (!IconComponent) {
    const variations = [
      cleanIconName.replace(/\s+/g, '-'),
      cleanIconName.replace(/[-_\s]/g, ''),
      cleanIconName.replace(/ing$/, ''),
      cleanIconName.replace(/s$/, '')
    ];
    
    for (const variation of variations) {
      if (iconMap[variation]) {
        IconComponent = iconMap[variation];
        break;
      }
    }
  }
  
  // Semantic fallbacks
  if (!IconComponent) {
    if (cleanIconName.includes('plumb') || cleanIconName.includes('pipe')) IconComponent = Wrench;
    else if (cleanIconName.includes('electric') || cleanIconName.includes('wiring')) IconComponent = Zap;
    else if (cleanIconName.includes('hvac') || cleanIconName.includes('air') || cleanIconName.includes('heat')) IconComponent = Thermometer;
    else if (cleanIconName.includes('handyman') || cleanIconName.includes('repair')) IconComponent = Hammer;
    else if (cleanIconName.includes('paint') || cleanIconName.includes('color')) IconComponent = Paintbrush;
    else if (cleanIconName.includes('clean') || cleanIconName.includes('wash')) IconComponent = Sparkles;
    else if (cleanIconName.includes('roof') || cleanIconName.includes('house')) IconComponent = Home;
    else if (cleanIconName.includes('landscape') || cleanIconName.includes('garden')) IconComponent = TreePine;
    else if (cleanIconName.includes('security') || cleanIconName.includes('protect')) IconComponent = Shield;
    else if (cleanIconName.includes('move') || cleanIconName.includes('transport')) IconComponent = Truck;
    else IconComponent = Search;
  }

  // Render with simple, reliable props
  return (
    <IconComponent 
      className={className}
      style={{
        ...style,
        display: 'inline-block',
        verticalAlign: 'middle'
      }}
      width={20}
      height={20}
      strokeWidth={2}
    />
  );
}