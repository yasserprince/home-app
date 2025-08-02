import { Wrench, Zap, Thermometer, Hammer } from "lucide-react";

// Test component to debug mobile icon rendering
export function ServiceIconTest() {
  return (
    <div className="p-4 space-y-4">
      <h3 className="text-lg font-bold">Icon Test</h3>
      
      <div className="flex space-x-4">
        <div className="w-20 h-20 bg-blue-100 rounded-xl flex items-center justify-center">
          <Wrench className="w-10 h-10 text-blue-600" strokeWidth={2} />
        </div>
        
        <div className="w-20 h-20 bg-orange-100 rounded-xl flex items-center justify-center">
          <Zap className="w-10 h-10 text-orange-600" strokeWidth={2} />
        </div>
        
        <div className="w-20 h-20 bg-blue-100 rounded-xl flex items-center justify-center">
          <Thermometer className="w-10 h-10 text-blue-600" strokeWidth={2} />
        </div>
        
        <div className="w-20 h-20 bg-orange-100 rounded-xl flex items-center justify-center">
          <Hammer className="w-10 h-10 text-orange-600" strokeWidth={2} />
        </div>
      </div>
      
      <div className="text-sm text-gray-600">
        These should show proper Lucide icons, not colored squares
      </div>
    </div>
  );
}