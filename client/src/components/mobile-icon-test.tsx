import { InlineSvgServiceIcon } from "./inline-svg-service-icon";

export function MobileIconTest() {
  const testIcons = [
    { name: 'wrench', color: '#2563eb', label: 'Plumbing' },
    { name: 'zap', color: '#ea580c', label: 'Electrical' },
    { name: 'thermometer', color: '#2563eb', label: 'HVAC' },
    { name: 'hammer', color: '#ea580c', label: 'Handyman' },
    { name: 'paintbrush', color: '#16a34a', label: 'Painting' },
    { name: 'sparkles', color: '#7c3aed', label: 'Cleaning' }
  ];

  return (
    <div className="p-6 bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900">
      <h3 className="text-white text-xl font-bold mb-4 text-center">Mobile Icon Test</h3>
      <div className="text-white text-sm mb-6 text-center">
        If you see colored squares instead of icons, the mobile fix needs adjustment.
      </div>
      
      {/* Grid Layout Test */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        {testIcons.map((icon) => (
          <div 
            key={icon.name}
            className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-4 flex flex-col items-center"
          >
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center mb-3 shadow-sm"
              style={{ backgroundColor: `${icon.color}15`, border: `2px solid ${icon.color}30` }}
            >
              <InlineSvgServiceIcon 
                iconName={icon.name} 
                className="w-8 h-8 flex-shrink-0" 
                style={{ color: icon.color }} 
                size={32}
              />
            </div>
            <span className="text-white text-sm font-medium text-center">{icon.label}</span>
          </div>
        ))}
      </div>

      {/* Size Variations Test */}
      <div className="bg-white/5 rounded-xl p-4 mb-6">
        <h4 className="text-white font-semibold mb-3">Size Variations</h4>
        <div className="flex items-center justify-center space-x-6">
          {[16, 24, 32, 48].map((size) => (
            <div key={size} className="text-center">
              <div className="bg-blue-500/20 rounded-lg p-2 mb-2 flex items-center justify-center">
                <InlineSvgServiceIcon 
                  iconName="wrench" 
                  size={size}
                  style={{ color: '#3b82f6' }} 
                />
              </div>
              <span className="text-white text-xs">{size}px</span>
            </div>
          ))}
        </div>
      </div>

      {/* Browser Info */}
      <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3">
        <div className="text-yellow-200 text-xs">
          <div><strong>User Agent:</strong> {navigator.userAgent}</div>
          <div><strong>Platform:</strong> {navigator.platform}</div>
          <div><strong>Screen:</strong> {window.screen.width}x{window.screen.height}</div>
        </div>
      </div>
    </div>
  );
}