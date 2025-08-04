import React, { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";

interface MobileEnhancedIconProps {
  iconName: string;
  size?: number;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * Enhanced service icon component specifically designed to handle mobile post-login rendering issues
 * Implements multiple fallback strategies and forced re-rendering on authentication state changes
 */
export function MobileEnhancedIcon({ 
  iconName, 
  size = 24, 
  className = "", 
  style = {} 
}: MobileEnhancedIconProps) {
  
  const { user, isAuthenticated } = useAuth();
  const [renderKey, setRenderKey] = useState(0);
  
  // Force re-render when authentication state changes
  useEffect(() => {
    setRenderKey(prev => prev + 1);
  }, [isAuthenticated, user?.id]);
  
  // Enhanced icon path mapping with mobile-specific optimizations
  const getIconPath = (name: string) => {
    const paths = {
      'wrench': "M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z",
      'zap': "m13 2-3 7h4l-3 7",
      'thermometer': "M14 4v10.54a4 4 0 1 1-4 0V4a2 2 0 0 1 4 0Z",
      'hammer': "m15 12-8.5-8.5c-.83-.83-2.17-.83-3 0 0 0 0 0 0 0a2.12 2.12 0 0 0 0 3L12 15l3-3Zm-6.18-9.82L15 8.36l-6.18 6.18",
      'paintbrush': "M18.37 2.63 14 7l-1.59-1.59a2 2 0 0 0-2.82 0L8 7l9 9 1.59-1.59a2 2 0 0 0 0-2.82L17 10l4.37-4.37a2.12 2.12 0 1 0-3-3ZM9 8c-2 3-4 3.5-7 4l8 10c2-1 6-5 6-7",
      'home': "m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2zM9 22V12h6v10",
      'sparkles': "m9 11 3-3 3 3-3 3-3-3zm12 10-6.5-6.5M21 3l-6.5 6.5M3 21l6.5-6.5M3 3l6.5 6.5",
      'shield': "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10",
      'car': "M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9l-7.9-2.3c-.2-.06-.4-.1-.6-.1H4c-.6 0-1 .4-1 1v6c0 .6.4 1 1 1h2m4 0h6M7 17a2 2 0 1 1 0-4 2 2 0 0 1 0 4zm10 0a2 2 0 1 1 0-4 2 2 0 0 1 0 4z",
      'leaf': "M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10ZM2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12",
      'truck': "M16 3h5v5M16 8l1.2 1.2c.2.2.4.5.8.8H20a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2M7 17a2 2 0 1 1 0-4 2 2 0 0 1 0 4zm10 0a2 2 0 1 1 0-4 2 2 0 0 1 0 4zM1 3h15v6H1z",
      'scissors': "M6 6a3 3 0 1 1 0-6 3 3 0 0 1 0 6zM6 18a3 3 0 1 1 0-6 3 3 0 0 1 0 6zm14-16L8.12 15.88M14.47 14.48L20 20M8.12 8.12L12 12",
      'heart': "M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z",
      'camera': "M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3zM12 13a3 3 0 1 1 0-6 3 3 0 0 1 0 6z",
      'search': "M11 11a8 8 0 1 1 0-16 8 8 0 0 1 0 16zm10 10l-4.35-4.35"
    };
    
    return paths[name as keyof typeof paths] || paths.search;
  };

  const pathData = getIconPath(iconName);
  
  // Enhanced mobile-specific styles
  const enhancedStyle = {
    display: 'inline-block',
    minWidth: `${size}px`,
    minHeight: `${size}px`,
    width: `${size}px`,
    height: `${size}px`,
    flexShrink: 0,
    WebkitBackfaceVisibility: 'hidden',
    backfaceVisibility: 'hidden',
    WebkitTransform: 'translateZ(0)',
    transform: 'translateZ(0)',
    WebkitFontSmoothing: 'antialiased',
    verticalAlign: 'middle',
    ...style
  };

  return (
    <svg
      key={`mobile-icon-${iconName}-${renderKey}-${user?.id || 'guest'}`}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`mobile-enhanced-icon ${className}`}
      style={enhancedStyle}
      data-icon={iconName}
      data-auth={isAuthenticated ? 'true' : 'false'}
      data-user={user?.id || 'guest'}
    >
      <path d={pathData} />
    </svg>
  );
}