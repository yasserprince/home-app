import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useLocation } from "wouter";
import { ArrowLeft, MapPin, Shield, Zap } from "lucide-react";

export default function LocationSettings() {
  const { user, isLoading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();
  
  const [locationEnabled, setLocationEnabled] = useState(user?.locationEnabled || false);
  const [currentLocation, setCurrentLocation] = useState<{lat: number, lng: number} | null>(null);
  const [locationStatus, setLocationStatus] = useState<'idle' | 'requesting' | 'success' | 'error'>('idle');

  const updateLocationMutation = useMutation({
    mutationFn: async (data: { locationEnabled: boolean, latitude?: number, longitude?: number }) => {
      return await apiRequest("PUT", "/api/location", data);
    },
    onSuccess: () => {
      toast({
        title: "Location Updated",
        description: "Your location settings have been saved",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update location settings",
        variant: "destructive",
      });
    },
  });

  const getCurrentLocation = () => {
    setLocationStatus('requesting');
    
    if (!navigator.geolocation) {
      toast({
        title: "Geolocation Not Supported",
        description: "Your browser doesn't support location services",
        variant: "destructive",
      });
      setLocationStatus('error');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const location = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        setCurrentLocation(location);
        setLocationStatus('success');
        
        // Update location on server
        updateLocationMutation.mutate({
          locationEnabled: true,
          latitude: location.lat,
          longitude: location.lng,
        });
        
        setLocationEnabled(true);
      },
      (error) => {
        setLocationStatus('error');
        let message = "Unable to get your location";
        
        switch (error.code) {
          case error.PERMISSION_DENIED:
            message = "Location access denied. Please enable location permissions in your browser settings.";
            break;
          case error.POSITION_UNAVAILABLE:
            message = "Location information is unavailable.";
            break;
          case error.TIMEOUT:
            message = "Location request timed out.";
            break;
        }
        
        toast({
          title: "Location Error",
          description: message,
          variant: "destructive",
        });
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000, // 5 minutes
      }
    );
  };

  const handleLocationToggle = (enabled: boolean) => {
    if (enabled) {
      getCurrentLocation();
    } else {
      setLocationEnabled(false);
      setCurrentLocation(null);
      setLocationStatus('idle');
      updateLocationMutation.mutate({ locationEnabled: false });
    }
  };

  useEffect(() => {
    if (user?.latitude && user?.longitude) {
      setCurrentLocation({
        lat: parseFloat(user.latitude),
        lng: parseFloat(user.longitude),
      });
      setLocationStatus('success');
    }
  }, [user]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading location settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-primary text-white p-4 pt-12">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="icon"
            className="text-white hover:bg-white/20"
            onClick={() => setLocation("/profile")}
          >
            <ArrowLeft className="w-6 h-6" />
          </Button>
          <h1 className="text-xl font-semibold">Location Settings</h1>
        </div>
      </div>

      <div className="p-4 -mt-6 bg-gray-50 rounded-t-3xl relative z-10">
        {/* Location Enable/Disable */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <MapPin className="w-5 h-5" />
              <span>Location Services</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="locationEnabled" className="text-base font-medium">
                  Enable Location Services
                </Label>
                <p className="text-sm text-gray-600">
                  Allow the app to access your location for better service recommendations
                </p>
              </div>
              <Switch
                id="locationEnabled"
                checked={locationEnabled}
                onCheckedChange={handleLocationToggle}
                disabled={updateLocationMutation.isPending}
              />
            </div>

            {locationStatus === 'requesting' && (
              <div className="p-4 bg-blue-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                  <div>
                    <p className="font-medium text-blue-900">Getting your location...</p>
                    <p className="text-sm text-blue-700">Please allow location access when prompted</p>
                  </div>
                </div>
              </div>
            )}

            {locationStatus === 'success' && currentLocation && (
              <div className="p-4 bg-green-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <MapPin className="w-6 h-6 text-green-600" />
                  <div>
                    <p className="font-medium text-green-900">Location Found</p>
                    <p className="text-sm text-green-700">
                      Lat: {currentLocation.lat.toFixed(6)}, Lng: {currentLocation.lng.toFixed(6)}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {locationStatus === 'error' && (
              <div className="p-4 bg-red-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <i className="fas fa-exclamation-triangle text-red-600"></i>
                  <div>
                    <p className="font-medium text-red-900">Location Access Failed</p>
                    <p className="text-sm text-red-700">
                      Please check your browser settings and try again
                    </p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Benefits of Location Services */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Zap className="w-5 h-5" />
              <span>Location Benefits</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <i className="fas fa-search-location text-blue-600"></i>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">Find Nearby Services</h4>
                  <p className="text-sm text-gray-600">
                    Discover service providers close to your location with accurate distance information
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <i className="fas fa-clock text-green-600"></i>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">Faster Service Times</h4>
                  <p className="text-sm text-gray-600">
                    Get quicker service by connecting with providers in your immediate area
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <i className="fas fa-route text-purple-600"></i>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">Accurate Travel Times</h4>
                  <p className="text-sm text-gray-600">
                    See realistic arrival times and service costs based on distance
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Privacy & Security */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Shield className="w-5 h-5" />
              <span>Privacy & Security</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm text-gray-600">
              <div className="flex items-start space-x-2">
                <i className="fas fa-shield-alt text-green-600 mt-1"></i>
                <p>Your location is encrypted and stored securely</p>
              </div>
              <div className="flex items-start space-x-2">
                <i className="fas fa-eye-slash text-blue-600 mt-1"></i>
                <p>Location data is only shared with confirmed service providers</p>
              </div>
              <div className="flex items-start space-x-2">
                <i className="fas fa-toggle-off text-purple-600 mt-1"></i>
                <p>You can disable location services at any time</p>
              </div>
              <div className="flex items-start space-x-2">
                <i className="fas fa-trash text-red-600 mt-1"></i>
                <p>Location history is automatically deleted after 30 days</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Refresh Location Button */}
        {locationEnabled && (
          <Button
            onClick={getCurrentLocation}
            variant="outline"
            className="w-full mt-4"
            disabled={locationStatus === 'requesting' || updateLocationMutation.isPending}
          >
            {locationStatus === 'requesting' ? (
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 border-2 border-gray-600 border-t-transparent rounded-full animate-spin"></div>
                <span>Getting Location...</span>
              </div>
            ) : (
              <>
                <MapPin className="w-4 h-4 mr-2" />
                Refresh Location
              </>
            )}
          </Button>
        )}
      </div>
    </div>
  );
}