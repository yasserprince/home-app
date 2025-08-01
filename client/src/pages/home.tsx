import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest } from "@/lib/queryClient";
import BottomNavigation from "@/components/bottom-navigation";
import { Search } from "lucide-react";

export default function Home() {
  const { user, isLoading: userLoading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");

  // Initialize sample data
  const initDataMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/init-data");
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
    },
  });

  // Fetch service categories
  const { data: categories, isLoading: categoriesLoading } = useQuery({
    queryKey: ["/api/categories"],
    enabled: !!user,
  });

  // Fetch recent bookings
  const { data: bookings, isLoading: bookingsLoading } = useQuery({
    queryKey: ["/api/bookings"],
    enabled: !!user,
  });

  useEffect(() => {
    if (user && !categoriesLoading && (!categories || categories.length === 0)) {
      initDataMutation.mutate();
    }
  }, [user, categories, categoriesLoading]);

  if (userLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-primary text-white p-6 pt-12">
          <Skeleton className="h-6 w-32 mb-2" />
          <Skeleton className="h-4 w-48 mb-4" />
          <Skeleton className="h-12 w-full" />
        </div>
        <div className="p-6">
          <Skeleton className="h-6 w-32 mb-4" />
          <div className="grid grid-cols-2 gap-4">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-24" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-primary text-white p-6 pt-12">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-xl font-semibold">
              Hello, {user?.firstName || "User"}!
            </h1>
            <p className="text-blue-200 text-sm">What service do you need today?</p>
          </div>
          {user?.profileImageUrl ? (
            <img
              src={user.profileImageUrl}
              alt="Profile"
              className="w-12 h-12 rounded-full object-cover border-2 border-blue-300"
            />
          ) : (
            <div className="w-12 h-12 bg-blue-300 rounded-full flex items-center justify-center">
              <i className="fas fa-user text-primary"></i>
            </div>
          )}
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Input
            type="text"
            placeholder="Search for services..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter' && searchQuery.trim()) {
                setLocation(`/providers?search=${encodeURIComponent(searchQuery.trim())}`);
              }
            }}
            className="w-full py-3 px-4 pl-12 rounded-xl text-gray-900 bg-white border-0"
          />
          <Search className="w-5 h-5 absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
        </div>
      </div>

      {/* Service Categories */}
      <div className="p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Popular Services</h2>
        {categoriesLoading ? (
          <div className="grid grid-cols-2 gap-4 mb-6">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-24" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-3 mb-6">
            {categories?.slice(0, 6).map((category: any) => (
              <Link key={category.id} href={`/providers?category=${category.id}`}>
                <Card className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardContent className="p-3">
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center mb-2 mx-auto"
                      style={{ backgroundColor: `${category.color}20` }}
                    >
                      <i className={`${category.icon} text-lg`} style={{ color: category.color }}></i>
                    </div>
                    <h3 className="font-medium text-gray-900 text-xs text-center leading-tight">{category.name}</h3>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
        
        {/* Show More Services */}
        {categories && categories.length > 6 && (
          <div className="mb-6">
            <Link href="/categories">
              <Card className="hover:shadow-md transition-shadow cursor-pointer border-dashed border-2 border-gray-300">
                <CardContent className="p-4 text-center">
                  <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                    <i className="fas fa-plus text-gray-400 text-xl"></i>
                  </div>
                  <h3 className="font-medium text-gray-900 text-sm">View All Services</h3>
                  <p className="text-xs text-gray-600">+{categories.length - 6} more categories</p>
                </CardContent>
              </Card>
            </Link>
          </div>
        )}

        {/* Recent Bookings */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Recent Bookings</h2>
            <Link href="/bookings">
              <button className="text-primary text-sm font-medium">View All</button>
            </Link>
          </div>

          {bookingsLoading ? (
            <Skeleton className="h-20" />
          ) : bookings && bookings.length > 0 ? (
            <Card>
              <CardContent className="p-4">
                {bookings.slice(0, 1).map((booking: any) => (
                  <div key={booking.id} className="flex items-center space-x-3">
                    {booking.provider.user.profileImageUrl ? (
                      <img
                        src={booking.provider.user.profileImageUrl}
                        alt="Provider"
                        className="w-12 h-12 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                        <i className="fas fa-user text-gray-500"></i>
                      </div>
                    )}
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">
                        {booking.provider.user.firstName} {booking.provider.user.lastName}
                      </h4>
                      <p className="text-sm text-gray-600">{booking.serviceType}</p>
                      <p className={`text-sm font-medium ${
                        booking.status === 'completed' ? 'text-green-600' :
                        booking.status === 'confirmed' ? 'text-blue-600' :
                        'text-yellow-600'
                      }`}>
                        {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600">
                        {new Date(booking.scheduledDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </p>
                      <div className="flex items-center">
                        <i className="fas fa-star text-yellow-400 text-xs"></i>
                        <span className="text-sm text-gray-900 ml-1">
                          {booking.provider.rating || '4.8'}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <i className="fas fa-calendar text-gray-400 text-2xl"></i>
                </div>
                <h3 className="font-medium text-gray-900 mb-2">No bookings yet</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Book your first service to get started
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      <BottomNavigation activeTab="home" />
    </div>
  );
}
