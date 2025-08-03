import { useEffect } from 'react';

export function ForceIconRefresh() {
  useEffect(() => {
    // Force browser to recognize new CSS and components
    const forceRefresh = () => {
      // Clear any cached SVG components
      const svgElements = document.querySelectorAll('svg');
      svgElements.forEach(svg => {
        // Force re-render of SVG elements
        const parent = svg.parentNode;
        if (parent) {
          const nextSibling = svg.nextSibling;
          parent.removeChild(svg);
          parent.insertBefore(svg, nextSibling);
        }
      });
      
      // Clear any component caches
      if ('caches' in window) {
        caches.keys().then(cacheNames => {
          cacheNames.forEach(cacheName => {
            if (cacheName.includes('vite') || cacheName.includes('workbox')) {
              caches.delete(cacheName);
            }
          });
        });
      }
    };

    // Run on component mount
    const timer = setTimeout(forceRefresh, 100);
    
    return () => clearTimeout(timer);
  }, []);

  return null; // This component doesn't render anything
}