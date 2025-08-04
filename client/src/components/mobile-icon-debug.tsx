import { useAuth } from "@/hooks/useAuth";
import { SimpleServiceIcon } from "./simple-service-icon";

export function MobileIconDebug() {
  const { user, isAuthenticated } = useAuth();
  
  // Test if icons render after authentication
  const testIcon = "wrench";
  
  console.log("Mobile Icon Debug:", {
    isAuthenticated,
    userId: user?.id,
    timestamp: Date.now()
  });

  return (
    <div className="fixed bottom-20 right-4 z-50 bg-black/80 text-white p-2 rounded text-xs max-w-xs">
      <div className="mb-2">
        <strong>Icon Debug</strong>
      </div>
      <div>Auth: {isAuthenticated ? 'Yes' : 'No'}</div>
      <div>User: {user?.id || 'None'}</div>
      <div className="flex items-center gap-2 mt-2">
        <span>Test:</span>
        <SimpleServiceIcon 
          iconName={testIcon} 
          size={16} 
          style={{ color: '#3b82f6' }}
          key={`debug-${user?.id || 'guest'}`}
        />
        <span>Icon</span>
      </div>
      <div className="text-xs mt-1 opacity-70">
        Agent: {navigator.userAgent.includes('iPhone') ? 'iPhone' : 'Desktop'}
      </div>
    </div>
  );
}