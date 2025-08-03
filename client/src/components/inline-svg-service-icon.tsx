import React from "react";

interface InlineSvgServiceIconProps {
  iconName: string;
  className?: string;
  style?: React.CSSProperties;
  size?: number;
}

// Inline SVG icons that will render properly on all mobile devices
const svgIcons: Record<string, string> = {
  // Service icons as inline SVG paths
  wrench: `<path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>`,
  
  zap: `<path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m13 2-3 7h4l-3 7"/>`,
  
  thermometer: `<path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 4v10.54a4 4 0 1 1-4 0V4a2 2 0 0 1 4 0Z"/>`,
  
  hammer: `<path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m15 12-8.5-8.5c-.83-.83-2.17-.83-3 0 0 0 0 0 0 0a2.12 2.12 0 0 0 0 3L12 15l3-3Zm-6.18-9.82L15 8.36l-6.18 6.18"/>`,
  
  paintbrush: `<path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.37 2.63 14 7l-1.59-1.59a2 2 0 0 0-2.82 0L8 7l9 9 1.59-1.59a2 2 0 0 0 0-2.82L17 10l4.37-4.37a2.12 2.12 0 1 0-3-3Z"/><path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 8c-2 3-4 3.5-7 4l8 10c2-1 6-5 6-7"/>`,
  
  home: `<path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 22V12h6v10"/>`,
  
  sparkles: `<path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m9 11 3-3 3 3-3 3-3-3z"/><path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m21 21-6.5-6.5"/><path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m21 3-6.5 6.5"/><path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m3 21 6.5-6.5"/><path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m3 3 6.5 6.5"/>`,
  
  car: `<path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9l-7.9-2.3c-.2-.06-.4-.1-.6-.1H4c-.6 0-1 .4-1 1v6c0 .6.4 1 1 1h2"/><circle cx="7" cy="17" r="2" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" fill="none"/><path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17h6"/><circle cx="17" cy="17" r="2" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" fill="none"/>`,
  
  search: `<circle cx="11" cy="11" r="8" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" fill="none"/><path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m21 21-4.35-4.35"/>`,
  
  shield: `<path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/>`,
  
  star: `<polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" fill="none"/>`,
  
  calendar: `<rect width="18" height="18" x="3" y="4" rx="2" ry="2" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" fill="none"/><line x1="16" x2="16" y1="2" y2="6" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"/><line x1="8" x2="8" y1="2" y2="6" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"/><line x1="3" x2="21" y1="10" y2="10" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"/>`,
  
  settings: `<circle cx="12" cy="12" r="3" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" fill="none"/><path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 1v6m0 6v6"/><path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m17 5-6 6-6-6"/>`,
  
  utensils: `<path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 2v7c0 6 3 10 9 10s9-4 9-10V2"/><path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 15V9"/><path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 15V9"/>`,
  
  truck: `<rect width="16" height="6" x="1" y="3" rx="1" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" fill="none"/><path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m16 8 1.2 1.2c.2.2.4.5.8.8H20a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2"/><circle cx="7" cy="17" r="2" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" fill="none"/><circle cx="17" cy="17" r="2" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" fill="none"/>`,
  
  leaf: `<path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"/><path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/>`,
  
  droplets: `<path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16.3c2.2 0 4-1.83 4-4.05 0-1.16-.57-2.26-1.71-3.19S7.29 6.75 7 5.3c-.29 1.45-1.14 2.84-2.29 3.76S3 11.1 3 12.25c0 2.22 1.8 4.05 4 4.05z"/><path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12.56 6.6A10.72 10.72 0 0 0 14 3.02c.5 2.5 2.26 4.89 4.46 6.75s3.54 4.24 3.54 6.13c0 2.76-2.23 5-5 5-2.76 0-5-2.24-5-5 0-1.89 1.34-4.27 3.56-6.13z"/>`,
  
  // Service-specific icons
  square: `<rect width="18" height="18" x="3" y="3" rx="2" ry="2" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" fill="none"/>`,
  heart: `<path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>`,
  monitor: `<rect width="20" height="14" x="2" y="3" rx="2" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" fill="none"/><line x1="8" x2="16" y1="21" y2="21" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"/><line x1="12" x2="12" y1="17" y2="21" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"/>`,
  wifi: `<path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 12.55a11 11 0 0 1 14.08 0"/><path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M1.42 9a16 16 0 0 1 21.16 0"/><path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.53 16.11a6 6 0 0 1 6.95 0"/><line x1="12" x2="12.01" y1="20" y2="20" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"/>`,
  
  // Additional service category icons
  bath: `<path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2 12h20"/><path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m5 12v7c0 1-1 2-2 2"/><path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m19 12v7c0 1 1 2 2 2"/><path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M22 5H2v7h20V5z"/>`,
  
  scissors: `<circle cx="6" cy="6" r="3" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" fill="none"/><circle cx="6" cy="18" r="3" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" fill="none"/><line x1="20" x2="8.12" y1="4" y2="15.88" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"/><line x1="14.47" x2="20" y1="14.48" y2="20" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"/><line x1="8.12" x2="12" y1="8.12" y2="12" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"/>`,
  
  camera: `<path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/><circle cx="12" cy="13" r="3" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" fill="none"/>`,
  
  dumbbell: `<path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m6.5 6.5 11 11"/><path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m21 21-1-1"/><path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m3 3 1 1"/><path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m18 22 4-4"/><path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m2 6 4-4"/><path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m3 10 18-18"/>`,
  
  music: `<path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" fill="none"/><circle cx="18" cy="16" r="3" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" fill="none"/>`,
  
  'user-check': `<path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" fill="none"/><polyline points="16,11 18,13 22,9" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" fill="none"/>`,
  
  briefcase: `<rect width="20" height="14" x="2" y="7" rx="2" ry="2" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" fill="none"/><path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>`,
  
  'graduation-cap': `<path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m22 10-10-5L2 10l10 5 10-5z"/><path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 12v5c3 3 9 3 12 0v-5"/>`,
  
  bug: `<rect width="8" height="14" x="8" y="6" rx="4" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" fill="none"/><path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m19 7-3 2"/><path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m5 7 3 2"/><path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m19 17-3-2"/><path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m5 17 3-2"/><path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13h-4"/><path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 13h4"/>`,
  
  package: `<path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m7.5 4.27 9 5.15"/><path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m3.3 7 8.7 5 8.7-5"/><path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 22V12"/>`,
  
  armchair: `<path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 9V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v3"/><path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2 11v5a1 1 0 0 0 1 1h1.5a1 1 0 0 0 1-1v-1h13v1a1 1 0 0 0 1 1H21a1 1 0 0 0 1-1v-5a1 1 0 0 0-1-1H3a1 1 0 0 0-1 1Z"/><path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 19v2"/><path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 19v2"/>`,
  
  'tree-pine': `<path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m17 14 3 3.3a1 1 0 0 1-.7 1.7H4.7a1 1 0 0 1-.7-1.7L7 14h-.3a1 1 0 0 1-.7-1.7L9 9h-.2A1 1 0 0 1 8 7.3L12 3l4 4.3a1 1 0 0 1-.8 1.7H15l3 3.3a1 1 0 0 1-.7 1.7H17Z"/><path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 22V18"/>`,
  
  waves: `<path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2 6c.6.5 1.2 1 2.5 1C7 7 7 5 9.5 5c2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"/><path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2 12c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"/><path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2 18c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"/>`,
};

export function InlineSvgServiceIcon({ 
  iconName, 
  className = "w-5 h-5", 
  style = {},
  size = 20
}: InlineSvgServiceIconProps) {
  // Handle empty or undefined iconName
  if (!iconName || typeof iconName !== 'string') {
    iconName = 'search';
  }
  
  // Get SVG path from mapping
  const cleanIconName = iconName.toLowerCase().trim();
  let svgPath = svgIcons[cleanIconName];
  
  // Try variations if not found
  if (!svgPath) {
    const variations = [
      cleanIconName.replace(/\s+/g, '-'),
      cleanIconName.replace(/[-_\s]/g, ''),
      cleanIconName.replace(/ing$/, ''),
      cleanIconName.replace(/s$/, '')
    ];
    
    for (const variation of variations) {
      if (svgIcons[variation]) {
        svgPath = svgIcons[variation];
        break;
      }
    }
  }
  
  // Semantic fallbacks
  if (!svgPath) {
    if (cleanIconName.includes('plumb') || cleanIconName.includes('pipe')) svgPath = svgIcons.wrench;
    else if (cleanIconName.includes('electric') || cleanIconName.includes('wiring')) svgPath = svgIcons.zap;
    else if (cleanIconName.includes('hvac') || cleanIconName.includes('air') || cleanIconName.includes('heat')) svgPath = svgIcons.thermometer;
    else if (cleanIconName.includes('handyman') || cleanIconName.includes('repair')) svgPath = svgIcons.hammer;
    else if (cleanIconName.includes('paint') || cleanIconName.includes('color')) svgPath = svgIcons.paintbrush;
    else if (cleanIconName.includes('clean') || cleanIconName.includes('wash')) svgPath = svgIcons.sparkles;
    else if (cleanIconName.includes('roof') || cleanIconName.includes('house')) svgPath = svgIcons.home;
    else if (cleanIconName.includes('landscape') || cleanIconName.includes('garden')) svgPath = svgIcons.leaf;
    else if (cleanIconName.includes('security') || cleanIconName.includes('protect')) svgPath = svgIcons.shield;
    else if (cleanIconName.includes('move') || cleanIconName.includes('transport')) svgPath = svgIcons.truck;
    else svgPath = svgIcons.search;
  }

  return (
    <svg
      className={className}
      style={{
        ...style,
        display: 'inline-block',
        verticalAlign: 'middle',
        flexShrink: 0,
        // Mobile-specific rendering fixes
        WebkitTransform: 'translateZ(0)',
        transform: 'translateZ(0)',
        WebkitBackfaceVisibility: 'hidden',
        backfaceVisibility: 'hidden'
      }}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      // Critical for mobile icon rendering
      preserveAspectRatio="xMidYMid meet"
      dangerouslySetInnerHTML={{ __html: svgPath }}
    />
  );
}