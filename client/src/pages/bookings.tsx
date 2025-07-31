import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import BottomNavigation from "@/components/bottom-navigation";

export default function Bookings() {
  const { user, isLoading: userLoading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: bookings, isLoading } = useQuery({
    queryKey: ["/api/bookings"],
    enabled: !!user,
  });

  const cancelBookingMutation = useMutation({
    mutationFn: async (bookingId: string) => {
      await apiRequest("PATCH", `/api/bookings/${bookingId}/status`, {
        status: "cancelled",
      });
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Booking cancelled successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/bookings"] });
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
      toast({
        title: "Error",
        description: "Failed to cancel booking",
        variant: "destructive",
      });
    },
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-blue-100 text-blue-800';
      case 'in_progress':
        return 'bg-yellow-100 text-yellow-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    return status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ');
  };

  const filterBookings = (status: string) => {
    if (!bookings) return [];
    
    switch (status) {
      case 'upcoming':
        return bookings.filter((booking: any) => 
          ['pending', 'confirmed'].includes(booking.status)
        );
      case 'completed':
        return bookings.filter((booking: any) => booking.status === 'completed');
      case 'cancelled':
        return bookings.filter((booking: any) => booking.status === 'cancelled');
      default:
        return bookings;
    }
  };

  if (userLoading || isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 pb-20">
        <div className="bg-white p-4 pt-12 border-b border-gray-200">
          <Skeleton className="h-6 w-32" />
        </div>
        <div className="bg-white px-4 pb-4">
          <Skeleton className="h-10 w-full" />
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
        <h1 className="text-xl font-semibold text-gray-900">My Bookings</h1>
      </div>

      {/* Booking Tabs */}
      <Tabs defaultValue="upcoming" className="w-full">
        <div className="bg-white px-4 pb-4">
          <TabsList className="grid w-full grid-cols-3 bg-gray-100 h-10">
            <TabsTrigger value="upcoming" className="text-sm font-medium">
              Upcoming
            </TabsTrigger>
            <TabsTrigger value="completed" className="text-sm font-medium">
              Completed
            </TabsTrigger>
            <TabsTrigger value="cancelled" className="text-sm font-medium">
              Cancelled
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="upcoming" className="p-4 space-y-4 mt-0">
          {filterBookings('upcoming').length > 0 ? (
            filterBookings('upcoming').map((booking: any) => (
              <Card key={booking.id}>
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-semibold text-gray-900">{booking.serviceType}</h3>
                      <p className="text-sm text-gray-600 line-clamp-1">{booking.description}</p>
                    </div>
                    <Badge className={getStatusColor(booking.status)}>
                      {getStatusLabel(booking.status)}
                    </Badge>
                  </div>

                  <div className="flex items-center space-x-3 mb-3">
                    {booking.provider.user.profileImageUrl ? (
                      <img
                        src={booking.provider.user.profileImageUrl}
                        alt="Provider"
                        className="w-10 h-10 rounded-lg object-cover"
                      />
                    ) : (
                      <div className="w-10 h-10 bg-gray-200 rounded-lg flex items-center justify-center">
                        <i className="fas fa-user text-gray-500"></i>
                      </div>
                    )}
                    <div>
                      <p className="font-medium text-gray-900">
                        {booking.provider.user.firstName} {booking.provider.user.lastName}
                      </p>
                      <div className="flex items-center">
                        <div className="flex space-x-1 mr-1">
                          {[...Array(5)].map((_, i) => (
                            <i
                              key={i}
                              className={`fas fa-star text-xs ${
                                i < Math.floor(parseFloat(booking.provider.rating) || 0)
                                  ? "text-yellow-400"
                                  : "text-gray-300"
                              }`}
                            ></i>
                          ))}
                        </div>
                        <span className="text-xs text-gray-600">
                          {booking.provider.rating || "4.8"}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-xs text-gray-600">Date & Time</p>
                      <p className="text-sm font-medium text-gray-900">
                        {new Date(booking.scheduledDate).toLocaleDateString('en-US', { 
                          month: 'short', 
                          day: 'numeric' 
                        })}, {booking.scheduledTime}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600">Total Cost</p>
                      <p className="text-sm font-medium text-gray-900">
                        ${booking.estimatedCost}
                      </p>
                    </div>
                  </div>

                  <div className="flex space-x-3">
                    <Button variant="secondary" className="flex-1" size="sm" disabled>
                      <i className="fas fa-phone mr-1 text-xs"></i>
                      Call
                    </Button>
                    <Button variant="secondary" className="flex-1" size="sm" disabled>
                      <i className="fas fa-comment mr-1 text-xs"></i>
                      Message
                    </Button>
                    <Button
                      variant="destructive"
                      className="flex-1"
                      size="sm"
                      onClick={() => cancelBookingMutation.mutate(booking.id)}
                      disabled={cancelBookingMutation.isPending}
                    >
                      Cancel
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <i className="fas fa-calendar text-gray-400 text-2xl"></i>
                </div>
                <h3 className="font-medium text-gray-900 mb-2">No upcoming bookings</h3>
                <p className="text-sm text-gray-600">
                  Book a service to see your appointments here
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="completed" className="p-4 space-y-4 mt-0">
          {filterBookings('completed').length > 0 ? (
            filterBookings('completed').map((booking: any) => (
              <Card key={booking.id}>
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-semibold text-gray-900">{booking.serviceType}</h3>
                      <p className="text-sm text-gray-600 line-clamp-1">{booking.description}</p>
                    </div>
                    <Badge className={getStatusColor(booking.status)}>
                      {getStatusLabel(booking.status)}
                    </Badge>
                  </div>

                  <div className="flex items-center space-x-3 mb-3">
                    {booking.provider.user.profileImageUrl ? (
                      <img
                        src={booking.provider.user.profileImageUrl}
                        alt="Provider"
                        className="w-10 h-10 rounded-lg object-cover"
                      />
                    ) : (
                      <div className="w-10 h-10 bg-gray-200 rounded-lg flex items-center justify-center">
                        <i className="fas fa-user text-gray-500"></i>
                      </div>
                    )}
                    <div>
                      <p className="font-medium text-gray-900">
                        {booking.provider.user.firstName} {booking.provider.user.lastName}
                      </p>
                      <div className="flex items-center">
                        <div className="flex space-x-1 mr-1">
                          {[...Array(5)].map((_, i) => (
                            <i
                              key={i}
                              className={`fas fa-star text-xs ${
                                i < Math.floor(parseFloat(booking.provider.rating) || 0)
                                  ? "text-yellow-400"
                                  : "text-gray-300"
                              }`}
                            ></i>
                          ))}
                        </div>
                        <span className="text-xs text-gray-600">
                          {booking.provider.rating || "4.8"}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-xs text-gray-600">Date & Time</p>
                      <p className="text-sm font-medium text-gray-900">
                        {new Date(booking.scheduledDate).toLocaleDateString('en-US', { 
                          month: 'short', 
                          day: 'numeric' 
                        })}, {booking.scheduledTime}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600">Final Cost</p>
                      <p className="text-sm font-medium text-gray-900">
                        ${booking.finalCost || booking.estimatedCost}
                      </p>
                    </div>
                  </div>

                  <div className="flex space-x-3">
                    <Button className="flex-1" size="sm" disabled>
                      <i className="fas fa-star mr-1 text-xs"></i>
                      Rate Service
                    </Button>
                    <Button variant="secondary" className="flex-1" size="sm" disabled>
                      <i className="fas fa-redo mr-1 text-xs"></i>
                      Book Again
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <i className="fas fa-check-circle text-gray-400 text-2xl"></i>
                </div>
                <h3 className="font-medium text-gray-900 mb-2">No completed services</h3>
                <p className="text-sm text-gray-600">
                  Your completed services will appear here
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="cancelled" className="p-4 space-y-4 mt-0">
          {filterBookings('cancelled').length > 0 ? (
            filterBookings('cancelled').map((booking: any) => (
              <Card key={booking.id}>
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-semibold text-gray-900">{booking.serviceType}</h3>
                      <p className="text-sm text-gray-600 line-clamp-1">{booking.description}</p>
                    </div>
                    <Badge className={getStatusColor(booking.status)}>
                      {getStatusLabel(booking.status)}
                    </Badge>
                  </div>

                  <div className="flex items-center space-x-3 mb-3">
                    {booking.provider.user.profileImageUrl ? (
                      <img
                        src={booking.provider.user.profileImageUrl}
                        alt="Provider"
                        className="w-10 h-10 rounded-lg object-cover"
                      />
                    ) : (
                      <div className="w-10 h-10 bg-gray-200 rounded-lg flex items-center justify-center">
                        <i className="fas fa-user text-gray-500"></i>
                      </div>
                    )}
                    <div>
                      <p className="font-medium text-gray-900">
                        {booking.provider.user.firstName} {booking.provider.user.lastName}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-xs text-gray-600">Date & Time</p>
                      <p className="text-sm font-medium text-gray-900">
                        {new Date(booking.scheduledDate).toLocaleDateString('en-US', { 
                          month: 'short', 
                          day: 'numeric' 
                        })}, {booking.scheduledTime}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600">Cancelled</p>
                      <p className="text-sm font-medium text-gray-900">
                        {new Date(booking.updatedAt).toLocaleDateString('en-US', { 
                          month: 'short', 
                          day: 'numeric' 
                        })}
                      </p>
                    </div>
                  </div>

                  <Button className="w-full" size="sm" disabled>
                    <i className="fas fa-redo mr-1 text-xs"></i>
                    Book Again
                  </Button>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <i className="fas fa-times-circle text-gray-400 text-2xl"></i>
                </div>
                <h3 className="font-medium text-gray-900 mb-2">No cancelled bookings</h3>
                <p className="text-sm text-gray-600">
                  Cancelled services will appear here
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      <BottomNavigation activeTab="bookings" />
    </div>
  );
}
