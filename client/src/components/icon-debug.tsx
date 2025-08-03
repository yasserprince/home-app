import { InlineSvgServiceIcon } from "@/components/inline-svg-service-icon";

export function IconDebug() {
  const handleHardRefresh = () => {
    // Force cache clearing
    if ('caches' in window) {
      caches.keys().then(names => {
        names.forEach(name => caches.delete(name));
      });
    }
    // Force reload without cache
    window.location.reload();
  };

  return (
    <div className="fixed top-4 right-4 z-50 bg-red-500 text-white p-4 rounded-lg max-w-sm">
      <h3 className="font-bold mb-2">Icon Debug v2.1</h3>
      <button 
        onClick={handleHardRefresh}
        className="bg-white text-red-500 px-2 py-1 rounded text-xs mb-2"
      >
        Hard Refresh
      </button>
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <InlineSvgServiceIcon iconName="wrench" size={24} style={{ color: 'white' }} />
          <span>Wrench (should be wrench icon)</span>
        </div>
        <div className="flex items-center gap-2">
          <InlineSvgServiceIcon iconName="zap" size={24} style={{ color: 'yellow' }} />
          <span>Zap (should be lightning bolt)</span>
        </div>
        <div className="flex items-center gap-2">
          <InlineSvgServiceIcon iconName="hammer" size={24} style={{ color: 'orange' }} />
          <span>Hammer (should be hammer icon)</span>
        </div>
      </div>
      <p className="text-xs mt-2">If you see colored squares instead of icons, try the Hard Refresh button above</p>
      <div className="mt-2 text-xs">
        <p>Browser: {navigator.userAgent.includes('iPhone') ? 'iPhone Safari' : 'Other'}</p>
        <p>Time: {new Date().toLocaleTimeString()}</p>
      </div>
    </div>
  );
}