import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link, useLocation, useRouter } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";

const bookingSchema = z.object({
  providerId: z.string().min(1, "Provider is required"),
  serviceType: z.string().min(1, "Service type is required"),
  description: z.string().min(10, "Please provide more details about the service needed"),
  scheduledDate: z.string().min(1, "Date is required"),
  scheduledTime: z.string().min(1, "Time is required"),
  address: z.string().min(5, "Please provide a complete address"),
  estimatedDuration: z.number().min(1).max(8),
});

type BookingForm = z.infer<typeof bookingSchema>;

export default function Booking() {
  const [location] = useLocation();
  const [, navigate] = useRouter();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const searchParams = new URLSearchParams(location.split('?')[1] || '');
  const providerId = searchParams.get('provider');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [confirmedBooking, setConfirmedBooking] = useState<any>(null);

  const { data: provider, isLoading } = useQuery({
    queryKey: ["/api/providers", providerId],
    enabled: !!providerId,
  });

  const form = useForm<BookingForm>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      providerId: providerId || '',
      serviceType: 'Standard Service',
      description: '',
      scheduledDate: '',
      scheduledTime: '',
      address: '',
      estimatedDuration: 2,
    },
  });

  const createBookingMutation = useMutation({
    mutationFn: async (data: BookingForm) => {
      const response = await apiRequest("POST", "/api/bookings", {
        ...data,
        estimatedCost: calculateTotalCost(data.serviceType, data.estimatedDuration),
      });
      return response.json();
    },
    onSuccess: (booking) => {
      setConfirmedBooking(booking);
      setShowConfirmation(true);
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
        description: "Failed to create booking. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: BookingForm) => {
    createBookingMutation.mutate(data);
  };

  const calculateTotalCost = (serviceType: string, duration: number) => {
    const baseRate = provider?.hourlyRate ? parseFloat(provider.hourlyRate.toString()) : 85;
    let hourlyRate = baseRate;
    
    if (serviceType === 'Emergency Repair') {
      hourlyRate = baseRate * 1.4; // 40% premium
    } else if (serviceType === 'Maintenance Check') {
      hourlyRate = baseRate * 0.75; // 25% discount
    }
    
    return parseFloat((hourlyRate * duration + 15).toFixed(2)); // Add $15 service fee
  };

  const generateDates = () => {
    const dates = [];
    const today = new Date();
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      dates.push({
        value: date.toISOString().split('T')[0],
        label: date.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric' }),
        dayName: date.toLocaleDateString('en-US', { weekday: 'short' }),
        dayNumber: date.getDate(),
      });
    }
    
    return dates;
  };

  const availableTimes = [
    { value: '09:00', label: '9:00 AM', available: true },
    { value: '11:00', label: '11:00 AM', available: true },
    { value: '14:00', label: '2:00 PM', available: true },
    { value: '16:00', label: '4:00 PM', available: true },
    { value: '18:00', label: '6:00 PM', available: false },
    { value: '20:00', label: '8:00 PM', available: true },
  ];

  useEffect(() => {
    if (selectedDate) {
      form.setValue('scheduledDate', selectedDate);
    }
  }, [selectedDate, form]);

  useEffect(() => {
    if (selectedTime) {
      form.setValue('scheduledTime', selectedTime);
    }
  }, [selectedTime, form]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 pb-20">
        <div className="bg-white p-4 pt-12 border-b border-gray-200">
          <div className="flex items-center space-x-4">
            <Skeleton className="w-8 h-8" />
            <Skeleton className="h-6 w-32" />
          </div>
        </div>
        <div className="p-6 space-y-6">
          <Skeleton className="h-20" />
          <Skeleton className="h-40" />
          <Skeleton className="h-32" />
        </div>
      </div>
    );
  }

  if (!provider) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card>
          <CardContent className="p-8 text-center">
            <h3 className="font-medium text-gray-900 mb-2">Provider not found</h3>
            <p className="text-sm text-gray-600 mb-4">
              Unable to load provider information
            </p>
            <Link href="/">
              <Button>Go Home</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white p-4 pt-12 border-b border-gray-200">
        <div className="flex items-center space-x-4">
          <Link href={`/provider/${provider.id}`}>
            <Button variant="ghost" size="sm" className="p-2">
              <i className="fas fa-arrow-left text-gray-600"></i>
            </Button>
          </Link>
          <h1 className="text-xl font-semibold text-gray-900">Book Service</h1>
        </div>
      </div>

      <div className="p-6">
        {/* Provider Summary */}
        <Card className="mb-6">
          <CardContent className="p-4 bg-gray-50">
            <div className="flex items-center space-x-3">
              {provider.profileImageUrl ? (
                <img
                  src={provider.profileImageUrl}
                  alt="Provider"
                  className="w-12 h-12 rounded-lg object-cover"
                />
              ) : (
                <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                  <i className="fas fa-user text-gray-500"></i>
                </div>
              )}
              <div>
                <h3 className="font-semibold text-gray-900">
                  {provider?.user?.firstName} {provider?.user?.lastName}
                </h3>
                <p className="text-sm text-gray-600">
                  {provider?.businessName} • ${provider?.hourlyRate ? parseFloat(provider.hourlyRate.toString()).toFixed(0) : '85'}/hour
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Service Type */}
            <FormField
              control={form.control}
              name="serviceType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Service Type</FormLabel>
                  <FormControl>
                    <RadioGroup
                      value={field.value}
                      onValueChange={field.onChange}
                      className="space-y-2"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="Emergency Repair" id="emergency" />
                        <Label htmlFor="emergency">
                          Emergency Repair - ${Math.round((provider?.hourlyRate ? parseFloat(provider.hourlyRate.toString()) : 85) * 1.4)}/hour
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="Standard Service" id="standard" />
                        <Label htmlFor="standard">
                          Standard Service - ${provider?.hourlyRate ? parseFloat(provider.hourlyRate.toString()).toFixed(0) : '85'}/hour
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="Maintenance Check" id="maintenance" />
                        <Label htmlFor="maintenance">
                          Maintenance Check - ${Math.round((provider?.hourlyRate ? parseFloat(provider.hourlyRate.toString()) : 85) * 0.75)}/hour
                        </Label>
                      </div>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Date Selection */}
            <div>
              <Label className="text-sm font-medium text-gray-700 mb-3 block">Select Date</Label>
              <div className="grid grid-cols-7 gap-2">
                {generateDates().map((date) => (
                  <button
                    key={date.value}
                    type="button"
                    onClick={() => setSelectedDate(date.value)}
                    className={`text-center p-3 rounded-lg cursor-pointer transition-colors ${
                      selectedDate === date.value
                        ? 'bg-primary text-white'
                        : 'bg-gray-100 hover:bg-gray-200'
                    }`}
                  >
                    <p className="text-xs">{date.dayName}</p>
                    <p className="text-sm font-medium">{date.dayNumber}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Time Selection */}
            <div>
              <Label className="text-sm font-medium text-gray-700 mb-3 block">Select Time</Label>
              <div className="grid grid-cols-3 gap-3">
                {availableTimes.map((time) => (
                  <button
                    key={time.value}
                    type="button"
                    onClick={() => time.available && setSelectedTime(time.value)}
                    disabled={!time.available}
                    className={`p-3 rounded-lg text-center text-sm font-medium transition-colors ${
                      selectedTime === time.value
                        ? 'bg-primary text-white'
                        : time.available
                        ? 'bg-gray-100 hover:bg-gray-200 text-gray-900'
                        : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    {time.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Problem Description */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Describe the Problem</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      rows={4}
                      placeholder="Please describe what needs to be fixed..."
                      className="resize-none"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Address */}
            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Service Address</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        {...field}
                        placeholder="Enter your address"
                        className="pl-12"
                      />
                      <i className="fas fa-map-marker-alt absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Price Summary */}
            <Card>
              <CardContent className="p-4 bg-gray-50">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Service Rate</span>
                    <span className="text-gray-900">
                      ${form.watch('serviceType') === 'Emergency Repair' 
                        ? Math.round((provider?.hourlyRate ? parseFloat(provider.hourlyRate.toString()) : 85) * 1.4)
                        : form.watch('serviceType') === 'Maintenance Check'
                        ? Math.round((provider?.hourlyRate ? parseFloat(provider.hourlyRate.toString()) : 85) * 0.75)
                        : (provider?.hourlyRate ? parseFloat(provider.hourlyRate.toString()).toFixed(0) : '85')}/hour
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Estimated Duration</span>
                    <span className="text-gray-900">{form.watch('estimatedDuration')} hours</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Service Fee</span>
                    <span className="text-gray-900">$15</span>
                  </div>
                  <hr className="my-3" />
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-gray-900">Total Estimate</span>
                    <span className="font-semibold text-gray-900">
                      ${calculateTotalCost(form.watch('serviceType'), form.watch('estimatedDuration'))}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Book Button */}
            <Button
              type="submit"
              className="w-full py-4 text-lg font-semibold"
              disabled={createBookingMutation.isPending}
            >
              {createBookingMutation.isPending ? "Processing..." : "Confirm Booking"}
            </Button>
          </form>
        </Form>
      </div>

      {/* Booking Confirmation Modal */}
      <Dialog open={showConfirmation} onOpenChange={setShowConfirmation}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="fas fa-check text-green-600 text-2xl"></i>
              </div>
              <DialogTitle className="text-xl font-bold text-gray-900 mb-2">
                Booking Confirmed!
              </DialogTitle>
              <p className="text-gray-600">
                Your service has been booked successfully. The provider will contact you soon.
              </p>
            </div>
          </DialogHeader>
          
          {confirmedBooking && (
            <div className="space-y-3 mb-6">
              <div className="flex justify-between">
                <span className="text-gray-600">Service:</span>
                <span className="font-medium">{confirmedBooking.serviceType}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Provider:</span>
                <span className="font-medium">
                  {provider?.user?.firstName} {provider?.user?.lastName}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Date & Time:</span>
                <span className="font-medium">
                  {new Date(confirmedBooking.scheduledDate).toLocaleDateString('en-US', { 
                    month: 'short', 
                    day: 'numeric' 
                  })}, {confirmedBooking.scheduledTime}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Total:</span>
                <span className="font-medium">${confirmedBooking.estimatedCost}</span>
              </div>
            </div>
          )}
          
          <Button
            className="w-full"
            onClick={() => {
              setShowConfirmation(false);
              navigate('/bookings');
            }}
          >
            View Booking Details
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}
