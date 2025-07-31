import { useQuery } from "@tanstack/react-query";
import { Link, useParams } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

export default function ProviderDetail() {
  const params = useParams();
  const providerId = params.id;

  const { data: provider, isLoading } = useQuery({
    queryKey: ["/api/providers", providerId],
    enabled: !!providerId,
  });

  const { data: reviews } = useQuery({
    queryKey: ["/api/providers", providerId, "reviews"],
    enabled: !!providerId,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 pb-20">
        <div className="relative">
          <Skeleton className="w-full h-64" />
          <div className="absolute top-12 left-4">
            <Skeleton className="w-10 h-10 rounded-lg" />
          </div>
        </div>
        <div className="p-6 bg-white -mt-8 rounded-t-3xl relative z-10">
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-4 w-32 mb-4" />
          <div className="grid grid-cols-3 gap-4 mb-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="text-center">
                <Skeleton className="h-8 w-12 mx-auto mb-1" />
                <Skeleton className="h-4 w-16 mx-auto" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!provider) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card>
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <i className="fas fa-exclamation-triangle text-gray-400 text-2xl"></i>
            </div>
            <h3 className="font-medium text-gray-900 mb-2">Provider not found</h3>
            <p className="text-sm text-gray-600 mb-4">
              The service provider you're looking for doesn't exist
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
      {/* Header with Image */}
      <div className="relative">
        {provider.profileImageUrl ? (
          <img
            src={provider.profileImageUrl}
            alt="Provider"
            className="w-full h-64 object-cover"
          />
        ) : (
          <div className="w-full h-64 bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center">
            <i className="fas fa-user text-white text-6xl"></i>
          </div>
        )}
        <Link href="/providers">
          <Button
            variant="ghost"
            size="sm"
            className="absolute top-12 left-4 p-2 bg-white/90 hover:bg-white"
          >
            <i className="fas fa-arrow-left text-gray-600"></i>
          </Button>
        </Link>
        <Button
          variant="ghost"
          size="sm"
          className="absolute top-12 right-4 p-2 bg-white/90 hover:bg-white"
        >
          <i className="fas fa-heart text-gray-600"></i>
        </Button>
      </div>

      {/* Provider Info */}
      <div className="p-6 bg-white -mt-8 rounded-t-3xl relative z-10">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-1">
              {provider.user.firstName} {provider.user.lastName}
            </h1>
            <p className="text-gray-600 mb-2">{provider.businessName}</p>
            <div className="flex items-center">
              <div className="flex space-x-1 mr-2">
                {[...Array(5)].map((_, i) => (
                  <i
                    key={i}
                    className={`fas fa-star ${
                      i < Math.floor(parseFloat(provider.rating) || 0)
                        ? "text-yellow-400"
                        : "text-gray-300"
                    }`}
                  ></i>
                ))}
              </div>
              <span className="text-gray-900 font-medium">
                {provider.rating || "4.8"}
              </span>
              <span className="text-gray-600 ml-1">
                ({provider.reviewCount || 0} reviews)
              </span>
            </div>
          </div>
          <Badge
            variant={provider.isAvailable ? "secondary" : "outline"}
            className={
              provider.isAvailable
                ? "bg-green-100 text-green-800"
                : "bg-yellow-100 text-yellow-800"
            }
          >
            {provider.isAvailable ? "Available" : "Busy"}
          </Badge>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900">
              {provider.experienceYears || "5+"}
            </p>
            <p className="text-sm text-gray-600">Years Exp.</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900">
              {provider.reviewCount || "234"}
            </p>
            <p className="text-sm text-gray-600">Jobs Done</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900">
              {provider.location || "2.3km"}
            </p>
            <p className="text-sm text-gray-600">Away</p>
          </div>
        </div>

        {/* About */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">About</h3>
          <p className="text-gray-600 leading-relaxed">
            {provider.description ||
              "Professional service provider with years of experience in residential and commercial work. Available for same-day service."}
          </p>
        </div>

        {/* Services */}
        {provider.services && provider.services.length > 0 && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Services</h3>
            <div className="grid grid-cols-2 gap-3">
              {provider.services.map((service: string, index: number) => (
                <div key={index} className="bg-gray-50 p-3 rounded-lg">
                  <p className="font-medium text-gray-900">{service}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Contact Actions */}
        <div className="flex space-x-3 mb-6">
          <Button variant="secondary" className="flex-1" disabled>
            <i className="fas fa-phone mr-2"></i>
            Call
          </Button>
          <Button variant="secondary" className="flex-1" disabled>
            <i className="fas fa-comment mr-2"></i>
            Message
          </Button>
        </div>

        {/* Book Service Button */}
        <Link href={`/booking?provider=${provider.id}`}>
          <Button className="w-full py-4 text-lg font-semibold" disabled={!provider.isAvailable}>
            {provider.isAvailable
              ? `Book Service - $${provider.hourlyRate}/hour`
              : "Currently Unavailable"}
          </Button>
        </Link>
      </div>
    </div>
  );
}
