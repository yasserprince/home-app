import React, { useState, useEffect } from "react";
import { MobileEnhancedIcon } from "./mobile-enhanced-icon";
import { SimpleServiceIcon } from "./simple-service-icon";

/**
 * Test component to simulate and debug mobile icon rendering issues
 * Shows both icon components side by side to compare rendering behavior
 */
export function IconRenderTest() {
  const [renderCount, setRenderCount] = useState(0);
  const [showOld, setShowOld] = useState(true);
  
  // Simulate authentication state changes that cause icon issues
  useEffect(() => {
    const interval = setInterval(() => {
      setRenderCount(prev => prev + 1);
    }, 3000);
    
    return () => clearInterval(interval);
  }, []);

  const testIcons = ['wrench', 'zap', 'thermometer', 'hammer', 'paintbrush', 'home'];
  
  return (
    <div className="fixed top-4 left-4 z-50 bg-black/90 text-white p-4 rounded-lg text-xs max-w-sm">
      <div className="mb-2 font-bold">Mobile Icon Test</div>
      <div className="mb-2">
        <button 
          onClick={() => setShowOld(!showOld)}
          className="bg-blue-600 px-2 py-1 rounded text-xs"
        >
          Toggle: {showOld ? 'Old' : 'New'} Icons
        </button>
      </div>
      <div className="grid grid-cols-3 gap-2 mb-2">
        {testIcons.map(icon => (
          <div key={`${icon}-${renderCount}`} className="flex flex-col items-center p-2 bg-white/10 rounded">
            {showOld ? (
              <SimpleServiceIcon 
                iconName={icon} 
                size={24} 
                style={{ color: '#3b82f6' }}
              />
            ) : (
              <MobileEnhancedIcon 
                iconName={icon} 
                size={24} 
                style={{ color: '#3b82f6' }}
              />
            )}
            <span className="text-xs mt-1">{icon}</span>
          </div>
        ))}
      </div>
      <div className="text-xs opacity-70">
        Renders: {renderCount} | iOS: {navigator.userAgent.includes('iPhone') ? 'Yes' : 'No'}
      </div>
    </div>
  );
}