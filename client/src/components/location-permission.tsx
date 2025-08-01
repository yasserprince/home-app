import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { MapPin, X } from "lucide-react";

interface LocationPermissionProps {
  onAllow: (location: { lat: number; lng: number }) => void;
  onDeny: () => void;
  onClose: () => void;
}

export default function LocationPermission({ onAllow, onDeny, onClose }: LocationPermissionProps) {
  const [isRequesting, setIsRequesting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const requestLocation = () => {
    setIsRequesting(true);
    setError(null);

    if (!navigator.geolocation) {
      setError("Geolocation is not supported by this browser");
      setIsRequesting(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setIsRequesting(false);
        onAllow({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
      },
      (error) => {
        setIsRequesting(false);
        let message = "Unable to get your location";
        
        switch (error.code) {
          case error.PERMISSION_DENIED:
            message = "Location access denied. You can enable it later in settings.";
            break;
          case error.POSITION_UNAVAILABLE:
            message = "Location information is unavailable.";
            break;
          case error.TIMEOUT:
            message = "Location request timed out.";
            break;
        }
        
        setError(message);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000,
      }
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                <MapPin className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold">Enable Location</h3>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="w-5 h-5" />
            </Button>
          </div>

          <p className="text-gray-600 mb-6">
            Find nearby service providers and get more accurate service recommendations by sharing your location.
          </p>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg mb-4">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <div className="space-y-3">
            <Button
              onClick={requestLocation}
              className="w-full"
              disabled={isRequesting}
            >
              {isRequesting ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Getting Location...</span>
                </div>
              ) : (
                <>
                  <MapPin className="w-4 h-4 mr-2" />
                  Allow Location Access
                </>
              )}
            </Button>
            
            <Button
              variant="outline"
              onClick={onDeny}
              className="w-full"
              disabled={isRequesting}
            >
              Maybe Later
            </Button>
          </div>

          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <p className="text-xs text-blue-700">
              <i className="fas fa-shield-alt mr-1"></i>
              Your location is encrypted and only shared with confirmed service providers.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}