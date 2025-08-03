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
    return (
      <Search 
        className={className} 
        style={style} 
        size={20}
        color="currentColor"
        strokeWidth={2}
        fill="none"
        stroke="currentColor"
      />
    );
  }
  
  // Simple direct mapping approach
  const getIconComponent = (name: string): LucideIcon => {
    const lowerName = name.toLowerCase().trim();
    
    // Direct mapping
    switch (lowerName) {
      case 'wrench': return Wrench;
      case 'zap': return Zap;
      case 'thermometer': return Thermometer;
      case 'hammer': return Hammer;
      case 'paintbrush': return Paintbrush;
      case 'home': return Home;
      case 'layout-grid':
      case 'grid': return LayoutGrid;
      case 'utensils': return Utensils;
      case 'bath': return Bath;
      case 'sparkles': return Sparkles;
      case 'square': return Square;
      case 'droplets': return Droplets;
      case 'truck': return Truck;
      case 'tree-pine': return TreePine;
      case 'leaf': return Leaf;
      case 'trees': return Trees;
      case 'fence': return Fence;
      case 'layout': return Layout;
      case 'settings': return Settings;
      case 'monitor': return Monitor;
      case 'wifi': return Wifi;
      case 'shield': return Shield;
      case 'armchair': return Armchair;
      case 'package': return Package;
      case 'waves': return Waves;
      case 'bug': return Bug;
      case 'warehouse': return Warehouse;
      case 'dumbbell': return Dumbbell;
      case 'camera': return Camera;
      case 'hand': return Hand;
      case 'heart': return Heart;
      case 'calendar':
      case 'calendar-alt': return Calendar;
      case 'utensils-crossed': return UtensilsCrossed;
      case 'music': return Music;
      case 'wine':
      case 'cocktail': return Wine;
      case 'car': return Car;
      case 'brush':
      case 'car-wash': return Brush;
      case 'calculator': return Calculator;
      case 'scale':
      case 'gavel': return Scale;
      case 'code': return Code;
      case 'snowflake': return Snowflake;
      case 'star': return Star;
      case 'sofa': return Sofa;
      case 'cog': return Cog;
      case 'sun':
      case 'solar-panel': return Sun;
      case 'wind': return Wind;
      case 'search': return Search;
      case 'paw-print': return PawPrint;
      case 'graduation-cap': return GraduationCap;
      case 'spa': return Sparkles;
      default:
        // Fallback logic
        if (lowerName.includes('plumb') || lowerName.includes('pipe')) return Wrench;
        if (lowerName.includes('electric') || lowerName.includes('wiring')) return Zap;
        if (lowerName.includes('hvac') || lowerName.includes('air') || lowerName.includes('heat')) return Thermometer;
        if (lowerName.includes('handyman') || lowerName.includes('repair')) return Hammer;
        if (lowerName.includes('paint') || lowerName.includes('color')) return Paintbrush;
        if (lowerName.includes('clean') || lowerName.includes('wash')) return Sparkles;
        if (lowerName.includes('roof') || lowerName.includes('house')) return Home;
        if (lowerName.includes('landscape') || lowerName.includes('garden')) return TreePine;
        if (lowerName.includes('security') || lowerName.includes('protect')) return Shield;
        if (lowerName.includes('move') || lowerName.includes('transport')) return Truck;
        return Search;
    }
  };

  const IconComponent = getIconComponent(iconName);

  // Render with all required SVG props for mobile compatibility
  return (
    <IconComponent 
      className={className}
      style={style}
      size={20}
      color="currentColor"
      strokeWidth={2}
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  );
}