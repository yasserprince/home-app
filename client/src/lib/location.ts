// Haversine formula to calculate distance between two coordinates
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Radius of the Earth in kilometers
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c; // Distance in kilometers
  return Math.round(distance * 10) / 10; // Round to 1 decimal place
}

function deg2rad(deg: number): number {
  return deg * (Math.PI / 180);
}

export function formatDistance(distance: number): string {
  if (distance < 1) {
    return `${Math.round(distance * 1000)}m`;
  }
  return `${distance}km`;
}

export function getLocationPermission(): Promise<{ lat: number; lng: number }> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
      },
      (error) => {
        let message = 'Unable to get location';
        switch (error.code) {
          case error.PERMISSION_DENIED:
            message = 'Location access denied';
            break;
          case error.POSITION_UNAVAILABLE:
            message = 'Location unavailable';
            break;
          case error.TIMEOUT:
            message = 'Location request timeout';
            break;
        }
        reject(new Error(message));
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000,
      }
    );
  });
}

// Get user's current location and store it
export async function getCurrentLocationAndStore(): Promise<{ lat: number; lng: number }> {
  try {
    const location = await getLocationPermission();
    
    // Store location in localStorage for quick access
    localStorage.setItem('userLocation', JSON.stringify({
      ...location,
      timestamp: Date.now(),
    }));
    
    return location;
  } catch (error) {
    throw error;
  }
}

// Get stored location if it's recent (within 5 minutes)
export function getStoredLocation(): { lat: number; lng: number } | null {
  try {
    const stored = localStorage.getItem('userLocation');
    if (!stored) return null;
    
    const { lat, lng, timestamp } = JSON.parse(stored);
    const fiveMinutesAgo = Date.now() - (5 * 60 * 1000);
    
    if (timestamp > fiveMinutesAgo) {
      return { lat, lng };
    }
    
    // Remove expired location
    localStorage.removeItem('userLocation');
    return null;
  } catch {
    return null;
  }
}

export function sortProvidersByDistance(
  providers: any[],
  userLocation: { lat: number; lng: number }
): any[] {
  return providers
    .map(provider => {
      if (provider.latitude && provider.longitude) {
        const distance = calculateDistance(
          userLocation.lat,
          userLocation.lng,
          parseFloat(provider.latitude),
          parseFloat(provider.longitude)
        );
        return { ...provider, distance };
      }
      return { ...provider, distance: null };
    })
    .sort((a, b) => {
      // Providers with location come first, sorted by distance
      if (a.distance !== null && b.distance !== null) {
        return a.distance - b.distance;
      }
      if (a.distance !== null) return -1;
      if (b.distance !== null) return 1;
      // Then sort by rating
      return parseFloat(b.rating || '0') - parseFloat(a.rating || '0');
    });
}