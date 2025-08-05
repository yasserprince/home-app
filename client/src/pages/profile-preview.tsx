import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ModernPortfolioGallery } from "@/components/ModernPortfolioGallery";
import { Star, MapPin, Calendar, Phone, Mail, Globe, ArrowLeft, ExternalLink } from "lucide-react";
import { Link, useLocation } from "wouter";
import { useTranslation } from "@/hooks/useTranslation";

export default function ProfilePreview() {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [, setLocation] = useLocation();

  const { data: profileData, isLoading } = useQuery({
    queryKey: ["/api/auth/user"],
    enabled: !!user,
  });

  const { data: portfolioData } = useQuery({
    queryKey: ["/api/portfolios/galleries"],
    enabled: !!user,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-white"></div>
      </div>
    );
  }

  if (!profileData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 flex items-center justify-center">
        <Card className="w-full max-w-md bg-gray-800/50 backdrop-blur-lg border-gray-700">
          <CardContent className="p-6 text-center">
            <p className="text-gray-300">Profile not found</p>
            <Button 
              onClick={() => setLocation("/profile-edit")}
              className="mt-4"
            >
              Back to Profile Edit
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase();
  };

  const totalImages = portfolioData?.reduce((total: number, gallery: any) => total + (gallery.images?.length || 0), 0) || 0;
  const rating = 4.8; // Mock rating for preview
  const reviewCount = 127; // Mock review count for preview
  const completedJobs = 89; // Mock completed jobs for preview

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900">
      {/* Header with Back Button */}
      <div className="sticky top-0 z-50 bg-gray-900/95 backdrop-blur-lg border-b border-gray-700">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setLocation("/profile-edit")}
                className="text-gray-300 hover:text-white hover:bg-gray-700"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Edit
              </Button>
              <div className="h-6 w-px bg-gray-600" />
              <div className="flex items-center gap-2">
                <ExternalLink className="w-4 h-4 text-blue-400" />
                <span className="text-sm text-gray-300">Public Profile Preview</span>
              </div>
            </div>
            <Badge variant="secondary" className="bg-blue-600/20 text-blue-300 border-blue-500/30">
              Preview Mode
            </Badge>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Profile Header */}
          <Card className="bg-gray-800/50 backdrop-blur-lg border-gray-700 overflow-hidden">
            <div className="relative">
              {/* Cover Image Placeholder */}
              <div className="h-32 sm:h-48 bg-gradient-to-r from-blue-600 to-purple-600"></div>
              
              {/* Profile Info */}
              <div className="relative px-6 pb-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4 -mt-16 sm:-mt-20">
                  <Avatar className="w-24 h-24 sm:w-32 sm:h-32 border-4 border-gray-800 bg-gray-700">
                    <AvatarImage 
                      src={profileData.profileImageUrl || '/default-avatar.png'} 
                      alt="Profile" 
                    />
                    <AvatarFallback className="text-2xl sm:text-3xl font-bold bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                      {getInitials(profileData.firstName || '', profileData.lastName || '')}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1 space-y-4">
                    <div>
                      <h1 className="text-2xl sm:text-3xl font-bold text-white">
                        {profileData.firstName} {profileData.lastName}
                      </h1>
                      <p className="text-gray-300 mt-1">
                        {profileData.title || "Professional Service Provider"}
                      </p>
                      <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-gray-400">
                        {profileData.location && (
                          <div className="flex items-center gap-1">
                            <MapPin className="w-4 h-4" />
                            <span>{profileData.location}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          <span>Member since {new Date().getFullYear()}</span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Stats */}
                    <div className="flex flex-wrap gap-6">
                      <div className="flex items-center gap-2">
                        <Star className="w-5 h-5 text-yellow-400 fill-current" />
                        <span className="font-semibold text-white">{rating}</span>
                        <span className="text-gray-400">({reviewCount} reviews)</span>
                      </div>
                      <div className="text-gray-300">
                        <span className="font-semibold text-white">{completedJobs}</span>
                        <span className="text-gray-400 ml-1">jobs completed</span>
                      </div>
                      {totalImages > 0 && (
                        <div className="text-gray-300">
                          <span className="font-semibold text-white">{totalImages}</span>
                          <span className="text-gray-400 ml-1">portfolio images</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button className="bg-blue-600 hover:bg-blue-700">
                      Contact
                    </Button>
                    <Button variant="outline" className="border-gray-600 text-gray-300 hover:bg-gray-700">
                      Message
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* About Section */}
          {profileData.bio && (
            <Card className="bg-gray-800/50 backdrop-blur-lg border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">About</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-300 leading-relaxed">{profileData.bio}</p>
              </CardContent>
            </Card>
          )}

          {/* Contact Information */}
          <Card className="bg-gray-800/50 backdrop-blur-lg border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {profileData.email && (
                <div className="flex items-center gap-3 text-gray-300">
                  <Mail className="w-5 h-5 text-blue-400" />
                  <span>{profileData.email}</span>
                </div>
              )}
              {profileData.phone && (
                <div className="flex items-center gap-3 text-gray-300">
                  <Phone className="w-5 h-5 text-green-400" />
                  <span>{profileData.phone}</span>
                </div>
              )}
              {profileData.website && (
                <div className="flex items-center gap-3 text-gray-300">
                  <Globe className="w-5 h-5 text-purple-400" />
                  <a 
                    href={profileData.website} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="hover:text-white transition-colors"
                  >
                    {profileData.website}
                  </a>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Skills Section */}
          {profileData.skills && profileData.skills.length > 0 && (
            <Card className="bg-gray-800/50 backdrop-blur-lg border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Skills & Expertise</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {profileData.skills.map((skill: string, index: number) => (
                    <Badge 
                      key={index} 
                      variant="secondary" 
                      className="bg-blue-600/20 text-blue-300 border-blue-500/30"
                    >
                      {skill}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Portfolio Gallery */}
          {portfolioData && portfolioData.length > 0 && (
            <Card className="bg-gray-800/50 backdrop-blur-lg border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Portfolio Gallery</CardTitle>
                <CardDescription className="text-gray-400">
                  Showcase of completed work and projects
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ModernPortfolioGallery 
                  galleries={portfolioData} 
                  isEditable={false}
                  onEdit={() => {}}
                  onDelete={() => {}}
                />
              </CardContent>
            </Card>
          )}

          {/* Languages Section */}
          {profileData.languages && profileData.languages.length > 0 && (
            <Card className="bg-gray-800/50 backdrop-blur-lg border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Languages</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {profileData.languages.map((language: string, index: number) => (
                    <Badge 
                      key={index} 
                      variant="outline" 
                      className="border-gray-600 text-gray-300"
                    >
                      {language}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Reviews Placeholder */}
          <Card className="bg-gray-800/50 backdrop-blur-lg border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Reviews & Testimonials</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-gray-400">
                <Star className="w-12 h-12 mx-auto mb-4 text-gray-600" />
                <p>Reviews will appear here once clients start rating your services</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}