import React from "react";
import { Icon } from "@iconify/react";

interface IconifyServiceIconProps {
  iconName: string;
  className?: string;
  style?: React.CSSProperties;
  size?: number;
  color?: string;
}

// Mapping service icon names to Iconify icon identifiers
const iconifyIconMap: Record<string, string> = {
  // Primary service icons
  'wrench': 'mdi:wrench',
  'zap': 'mdi:lightning-bolt',
  'thermometer': 'mdi:thermometer',
  'hammer': 'mdi:hammer',
  'paintbrush': 'mdi:brush',
  'home': 'mdi:home',
  'layout-grid': 'mdi:grid',
  'grid': 'mdi:grid',
  'utensils': 'mdi:silverware-fork-knife',
  'bath': 'mdi:bathtub',
  'sparkles': 'mdi:sparkles',
  'square': 'mdi:square',
  'droplets': 'mdi:water-drop',
  'truck': 'mdi:truck',
  'tree-pine': 'mdi:pine-tree',
  'leaf': 'mdi:leaf',
  'trees': 'mdi:forest',
  'fence': 'mdi:fence',
  'layout': 'mdi:view-dashboard',
  'settings': 'mdi:cog',
  'monitor': 'mdi:monitor',
  'wifi': 'mdi:wifi',
  'shield': 'mdi:shield-check',
  'armchair': 'mdi:sofa',
  'package': 'mdi:package-variant',
  'waves': 'mdi:waves',
  'bug': 'mdi:bug',
  'warehouse': 'mdi:warehouse',
  'dumbbell': 'mdi:dumbbell',
  'camera': 'mdi:camera',
  'hand': 'mdi:hand',
  'heart': 'mdi:heart',
  'calendar': 'mdi:calendar',
  'calendar-alt': 'mdi:calendar',
  'utensils-crossed': 'mdi:silverware-fork-knife',
  'music': 'mdi:music',
  'wine': 'mdi:glass-wine',
  'cocktail': 'mdi:glass-cocktail',
  'car': 'mdi:car',
  'brush': 'mdi:brush',
  'car-wash': 'mdi:car-wash',
  'calculator': 'mdi:calculator',
  'scale': 'mdi:scale-balance',
  'gavel': 'mdi:gavel',
  'code': 'mdi:code-tags',
  'snowflake': 'mdi:snowflake',
  'star': 'mdi:star',
  'sofa': 'mdi:sofa',
  'cog': 'mdi:cog',
  'sun': 'mdi:white-balance-sunny',
  'solar-panel': 'mdi:solar-panel',
  'wind': 'mdi:weather-windy',
  'search': 'mdi:magnify',
  'paw-print': 'mdi:paw',
  'graduation-cap': 'mdi:school',
  'spa': 'mdi:spa',
  
  // Additional aliases and semantic mappings
  'temperature-low': 'mdi:thermometer-low',
  'swimming-pool': 'mdi:pool',
  'tv': 'mdi:television',
  'chair': 'mdi:chair-rolling',
  'boxes': 'mdi:package-variant-closed',
  'road': 'mdi:road',
  'couch': 'mdi:sofa',
  'cogs': 'mdi:cogs',
  
  // Service type mappings
  'plumbing': 'mdi:pipe-wrench',
  'electrical': 'mdi:lightning-bolt',
  'hvac': 'mdi:air-conditioner',
  'handyman': 'mdi:hammer-screwdriver',
  'painting': 'mdi:format-paint',
  'cleaning': 'mdi:broom',
  'roofing': 'mdi:home-roof',
  'flooring': 'mdi:view-grid',
  'landscaping': 'mdi:tree',
  'appliance': 'mdi:washing-machine',
  'pest': 'mdi:bug-outline',
  'moving': 'mdi:truck-delivery',
  'security': 'mdi:security',
  'pool': 'mdi:pool',
  'automotive': 'mdi:car-wrench',
  'wellness': 'mdi:heart-pulse',
  'pet': 'mdi:dog',
  'fitness': 'mdi:weight-lifter',
  'education': 'mdi:school',
  'photography': 'mdi:camera',
  'events': 'mdi:calendar-star',
  'catering': 'mdi:food',
  'legal': 'mdi:scale-balance',
  'technology': 'mdi:laptop',
  'design': 'mdi:palette',
  'finance': 'mdi:calculator-variant',
};

export function IconifyServiceIcon({ 
  iconName, 
  className = "", 
  style = {}, 
  size = 20,
  color = "currentColor"
}: IconifyServiceIconProps) {
  // Handle empty or undefined iconName
  if (!iconName || typeof iconName !== 'string') {
    return (
      <Icon 
        icon="mdi:magnify"
        className={className}
        style={style}
        width={size}
        height={size}
        color={color}
      />
    );
  }
  
  // Get icon from reliable mapping
  const cleanIconName = iconName.toLowerCase().trim();
  let iconifyIcon = iconifyIconMap[cleanIconName];
  
  // Try variations if not found
  if (!iconifyIcon) {
    const variations = [
      cleanIconName.replace(/\s+/g, '-'),
      cleanIconName.replace(/[-_\s]/g, ''),
      cleanIconName.replace(/ing$/, ''),
      cleanIconName.replace(/s$/, '')
    ];
    
    for (const variation of variations) {
      if (iconifyIconMap[variation]) {
        iconifyIcon = iconifyIconMap[variation];
        break;
      }
    }
  }
  
  // Semantic fallbacks using Iconify icons
  if (!iconifyIcon) {
    if (cleanIconName.includes('plumb') || cleanIconName.includes('pipe')) iconifyIcon = 'mdi:pipe-wrench';
    else if (cleanIconName.includes('electric') || cleanIconName.includes('wiring')) iconifyIcon = 'mdi:lightning-bolt';
    else if (cleanIconName.includes('hvac') || cleanIconName.includes('air') || cleanIconName.includes('heat')) iconifyIcon = 'mdi:air-conditioner';
    else if (cleanIconName.includes('handyman') || cleanIconName.includes('repair')) iconifyIcon = 'mdi:hammer-screwdriver';
    else if (cleanIconName.includes('paint') || cleanIconName.includes('color')) iconifyIcon = 'mdi:format-paint';
    else if (cleanIconName.includes('clean') || cleanIconName.includes('wash')) iconifyIcon = 'mdi:broom';
    else if (cleanIconName.includes('roof') || cleanIconName.includes('house')) iconifyIcon = 'mdi:home-roof';
    else if (cleanIconName.includes('landscape') || cleanIconName.includes('garden')) iconifyIcon = 'mdi:tree';
    else if (cleanIconName.includes('security') || cleanIconName.includes('protect')) iconifyIcon = 'mdi:security';
    else if (cleanIconName.includes('move') || cleanIconName.includes('transport')) iconifyIcon = 'mdi:truck-delivery';
    else iconifyIcon = 'mdi:magnify';
  }

  return (
    <Icon 
      icon={iconifyIcon}
      className={className}
      style={style}
      width={size}
      height={size}
      color={color}
    />
  );
}