import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { calculateDistance, formatDistance, getStoredLocation, getCurrentLocationAndStore, sortProvidersByDistance } from "@/lib/location";
import LocationPermission from "@/components/location-permission";
import { MapPin, Navigation } from "lucide-react";
import { ServiceProvider, ServiceCategory, User } from "@shared/schema";

export default function Providers() {
  const [location] = useLocation();
  const [searchParams] = useState(() => new URLSearchParams(location.split('?')[1] || ''));
  const categoryId = searchParams.get('category');
  const [activeFilter, setActiveFilter] = useState('all');
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [showLocationPrompt, setShowLocationPrompt] = useState(false);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  
  const { user } = useAuth();
  const { toast } = useToast();

  type ProviderWithDetails = ServiceProvider & { 
    user: User; 
    category: ServiceCategory;
    distance?: number;
  };

  const { data: providers, isLoading } = useQuery<ProviderWithDetails[]>({
    queryKey: ["/api/providers", categoryId, userLocation],
    enabled: true,
  });

  const { data: categories } = useQuery<ServiceCategory[]>({
    queryKey: ["/api/categories"],
  });

  const currentCategory = categories?.find((cat) => cat.id === categoryId);

  // Initialize user location
  useEffect(() => {
    // Check if user has location enabled
    if (user?.locationEnabled && user?.latitude && user?.longitude) {
      setUserLocation({
        lat: parseFloat(user.latitude),
        lng: parseFloat(user.longitude),
      });
    } else {
      // Check for stored location
      const stored = getStoredLocation();
      if (stored) {
        setUserLocation(stored);
      }
    }
  }, [user]);

  // Handle location-based filtering
  const handleNearbyFilter = () => {
    if (!userLocation) {
      setShowLocationPrompt(true);
    } else {
      setActiveFilter('nearby');
    }
  };

  const handleLocationAllow = (location: { lat: number; lng: number }) => {
    setUserLocation(location);
    setShowLocationPrompt(false);
    setActiveFilter('nearby');
    
    // Store in localStorage
    localStorage.setItem('userLocation', JSON.stringify({
      ...location,
      timestamp: Date.now(),
    }));
    
    toast({
      title: "Location Enabled",
      description: "Now showing nearby service providers",
    });
  };

  const handleLocationDeny = () => {
    setShowLocationPrompt(false);
    toast({
      title: "Location Not Enabled",
      description: "You can enable location later in settings to see nearby providers",
    });
  };

  // Process providers based on location and filter
  const processedProviders = providers ? (() => {
    let filtered: ProviderWithDetails[] = [...providers];
    
    // Add distance information if user location is available
    if (userLocation) {
      filtered = sortProvidersByDistance(filtered, userLocation);
    }
    
    // Apply filters
    switch (activeFilter) {
      case 'nearby':
        // Only show providers with location and within reasonable distance
        filtered = filtered.filter(p => p.distance !== null && p.distance !== undefined && p.distance <= 50);
        break;
      case 'toprated':
        filtered = filtered.sort((a, b) => parseFloat(b.rating || '0') - parseFloat(a.rating || '0'));
        break;
      default:
        // 'all' - already processed
        break;
    }
    
    return filtered;
  })() : [];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 pb-20">
        <div className="bg-white p-4 pt-12 border-b border-gray-200">
          <div className="flex items-center space-x-4 mb-4">
            <Skeleton className="w-8 h-8" />
            <Skeleton className="h-6 w-32" />
          </div>
          <div className="flex space-x-3">
            <Skeleton className="h-8 w-16" />
            <Skeleton className="h-8 w-16" />
            <Skeleton className="h-8 w-20" />
          </div>
        </div>
        <div className="p-4 space-y-4">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-40" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white p-4 pt-12 border-b border-gray-200">
        <div className="flex items-center space-x-4 mb-4">
          <Link href="/">
            <Button variant="ghost" size="sm" className="p-2">
              <i className="fas fa-arrow-left text-gray-600"></i>
            </Button>
          </Link>
          <h1 className="text-xl font-semibold text-gray-900">
            {currentCategory?.name || 'All'} Services
          </h1>
        </div>

        {/* Filter Buttons */}
        <div className="flex space-x-3">
          <Button
            size="sm"
            variant={activeFilter === 'all' ? 'default' : 'secondary'}
            onClick={() => setActiveFilter('all')}
            className="rounded-full"
          >
            All
          </Button>
          <Button
            size="sm"
            variant={activeFilter === 'nearby' ? 'default' : 'secondary'}
            onClick={handleNearbyFilter}
            className="rounded-full"
          >
            <Navigation className="w-3 h-3 mr-1" />
            Nearby
          </Button>
          <Button
            size="sm"
            variant={activeFilter === 'toprated' ? 'default' : 'secondary'}
            onClick={() => setActiveFilter('toprated')}
            className="rounded-full"
          >
            Top Rated
          </Button>
        </div>
      </div>

      {/* Provider List */}
      <div className="p-4 space-y-4">
        {activeFilter === 'nearby' && !userLocation && (
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-4 text-center">
              <MapPin className="w-8 h-8 text-blue-600 mx-auto mb-2" />
              <h3 className="font-medium text-blue-900 mb-1">Enable Location for Nearby Services</h3>
              <p className="text-sm text-blue-700 mb-3">
                Find service providers close to you with accurate distance information
              </p>
              <Button 
                size="sm" 
                onClick={() => setShowLocationPrompt(true)}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <MapPin className="w-4 h-4 mr-1" />
                Enable Location
              </Button>
            </CardContent>
          </Card>
        )}
        
        {processedProviders && processedProviders.length > 0 ? (
          processedProviders.map((provider) => (
            <Link key={provider.id} href={`/provider/${provider.id}`}>
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex space-x-4">
                    {provider.profileImageUrl ? (
                      <img
                        src={provider.profileImageUrl}
                        alt="Provider"
                        className="w-16 h-16 rounded-xl object-cover"
                      />
                    ) : (
                      <div className="w-16 h-16 bg-gray-200 rounded-xl flex items-center justify-center">
                        <i className="fas fa-user text-gray-500 text-xl"></i>
                      </div>
                    )}
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="font-semibold text-gray-900">
                            {provider.user.firstName} {provider.user.lastName}
                          </h3>
                          <p className="text-sm text-gray-600">{provider.businessName}</p>
                        </div>
                        <Badge
                          variant={provider.isAvailable ? "secondary" : "outline"}
                          className={provider.isAvailable ? "bg-green-100 text-green-800" : ""}
                        >
                          {provider.isAvailable ? "Available" : "Busy"}
                        </Badge>
                      </div>

                      <div className="flex items-center space-x-4 mb-2">
                        <div className="flex items-center">
                          <div className="flex space-x-1">
                            {[...Array(5)].map((_, i) => (
                              <i
                                key={i}
                                className={`fas fa-star text-xs ${
                                  i < Math.floor(parseFloat(provider.rating || '0'))
                                    ? "text-yellow-400"
                                    : "text-gray-300"
                                }`}
                              ></i>
                            ))}
                          </div>
                          <span className="text-sm text-gray-900 ml-1">
                            {provider.rating || "4.8"} ({provider.reviewCount || 0})
                          </span>
                        </div>
                        <span className="text-sm text-gray-600 flex items-center">
                          <MapPin className="w-3 h-3 mr-1" />
                          {provider.distance !== null && provider.distance !== undefined ? (
                            `${formatDistance(provider.distance)} away`
                          ) : (
                            provider.location || "Distance unavailable"
                          )}
                        </span>
                      </div>

                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                        {provider.description ||
                          "Professional service provider with years of experience"}
                      </p>

                      <div className="flex items-center justify-between">
                        <span className="text-lg font-semibold text-gray-900">
                          ${provider.hourlyRate}/hour
                        </span>
                        <Button
                          size="sm"
                          disabled={!provider.isAvailable}
                          onClick={(e) => {
                            e.preventDefault();
                            window.location.href = `/provider/${provider.id}`;
                          }}
                        >
                          {provider.isAvailable ? "Book Now" : "Unavailable"}
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))
        ) : (
          <Card>
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="fas fa-search text-gray-400 text-2xl"></i>
              </div>
              <h3 className="font-medium text-gray-900 mb-2">No providers found</h3>
              <p className="text-sm text-gray-600">
                Try adjusting your search or check back later
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
