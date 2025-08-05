import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link, useRoute } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ObjectUploader } from "@/components/ObjectUploader";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { UploadResult } from "@uppy/core";

// Gallery categories inspired by TaskRabbit and Thumbtack
const GALLERY_CATEGORIES = [
  {
    key: "featured",
    label: "Featured Work",
    description: "Your best projects and completed work",
    icon: "fas fa-star",
    color: "bg-yellow-100 text-yellow-800"
  },
  {
    key: "before_after",
    label: "Before & After",
    description: "Show transformations and improvements", 
    icon: "fas fa-exchange-alt",
    color: "bg-blue-100 text-blue-800"
  },
  {
    key: "work_samples",
    label: "Work Samples",
    description: "Examples of your completed projects",
    icon: "fas fa-hammer",
    color: "bg-green-100 text-green-800"
  },
  {
    key: "equipment",
    label: "Tools & Equipment",
    description: "Professional tools and equipment you use",
    icon: "fas fa-tools",
    color: "bg-purple-100 text-purple-800"
  },
  {
    key: "certifications",
    label: "Certifications",
    description: "Licenses and professional certifications",
    icon: "fas fa-certificate",
    color: "bg-orange-100 text-orange-800"
  }
];

type PortfolioImage = {
  id: string;
  galleryId: string;
  providerId: string;
  imageUrl: string;
  objectPath: string;
  title?: string;
  description?: string;
  imageType: string;
  isPrimary: boolean;
  sortOrder: number;
  uploadedAt: string;
  createdAt: string;
};

type PortfolioGallery = {
  id: string;
  providerId: string;
  title: string;
  description?: string;
  category: string;
  serviceType?: string;
  isActive: boolean;
  sortOrder: number;
  images: PortfolioImage[];
  createdAt: string;
  updatedAt: string;
};

export default function PortfolioGallery() {
  const [match, params] = useRoute('/portfolio/:providerId?');
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [showCreateGallery, setShowCreateGallery] = useState(false);
  const [newGalleryData, setNewGalleryData] = useState({
    title: '',
    description: '',
    category: 'featured',
    serviceType: ''
  });

  // Get provider ID from URL params or current user
  const providerId = params?.providerId || user?.serviceProviderId;
  const isOwner = !params?.providerId && isAuthenticated;

  const { data: galleries, isLoading } = useQuery({
    queryKey: ['/api/portfolios', providerId, 'galleries'],
    enabled: !!providerId,
  });

  const createGalleryMutation = useMutation({
    mutationFn: async (galleryData: any) => {
      return apiRequest('/api/portfolios/galleries', {
        method: 'POST',
        body: JSON.stringify(galleryData),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/portfolios', providerId, 'galleries'] });
      setShowCreateGallery(false);
      setNewGalleryData({
        title: '',
        description: '',
        category: 'featured',
        serviceType: ''
      });
      toast({
        title: "Success",
        description: "Gallery created successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create gallery",
        variant: "destructive",
      });
    },
  });

  const uploadImagesMutation = useMutation({
    mutationFn: async (images: any[]) => {
      return apiRequest('/api/portfolios/images', {
        method: 'POST',
        body: JSON.stringify(images),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/portfolios', providerId, 'galleries'] });
      toast({
        title: "Success",
        description: "Images uploaded successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error", 
        description: "Failed to upload images",
        variant: "destructive",
      });
    },
  });

  const handleGetUploadParameters = async () => {
    const response = await apiRequest('/api/portfolios/images/upload', {
      method: 'POST',
    });
    return {
      method: 'PUT' as const,
      url: response.uploadURL,
    };
  };

  const handleUploadComplete = (result: UploadResult, galleryId: string) => {
    const uploadedImages = result.successful.map((file, index) => ({
      galleryId,
      imageUrl: file.uploadURL,
      title: file.meta?.title || file.name,
      description: file.meta?.description || '',
      imageType: getImageTypeForCategory(selectedCategory || 'work_samples'),
      sortOrder: index,
    }));

    uploadImagesMutation.mutate(uploadedImages);
  };

  const getImageTypeForCategory = (category: string) => {
    switch (category) {
      case 'before_after': return 'before';
      case 'equipment': return 'equipment';
      case 'certifications': return 'certificate';
      default: return 'work_sample';
    }
  };

  const filteredGalleries = selectedCategory 
    ? galleries?.filter((g: PortfolioGallery) => g.category === selectedCategory)
    : galleries;

  if (!providerId) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md mx-auto">
          <CardContent className="p-8 text-center">
            <h3 className="font-medium text-gray-900 mb-2">Provider not found</h3>
            <p className="text-sm text-gray-600 mb-4">
              Unable to load portfolio gallery
            </p>
            <Button asChild>
              <Link href="/">Go Home</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white p-4 pt-12 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/">
              <Button variant="ghost" size="sm" className="p-2">
                <i className="fas fa-arrow-left text-gray-600"></i>
              </Button>
            </Link>
            <h1 className="text-xl font-semibold text-gray-900">
              {isOwner ? 'My Portfolio' : 'Portfolio Gallery'}
            </h1>
          </div>
          {isOwner && (
            <Button
              onClick={() => setShowCreateGallery(true)}
              size="sm"
              className="bg-blue-600 hover:bg-blue-700"
            >
              <i className="fas fa-plus mr-2"></i>
              New Gallery
            </Button>
          )}
        </div>
      </div>

      <div className="p-6">
        {/* Category Filter */}
        <div className="mb-6">
          <div className="flex flex-wrap gap-2">
            <Button
              variant={selectedCategory === null ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(null)}
            >
              All ({galleries?.length || 0})
            </Button>
            {GALLERY_CATEGORIES.map((category) => {
              const count = galleries?.filter((g: PortfolioGallery) => g.category === category.key)?.length || 0;
              return (
                <Button
                  key={category.key}
                  variant={selectedCategory === category.key ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(category.key)}
                >
                  <i className={`${category.icon} mr-2`}></i>
                  {category.label} ({count})
                </Button>
              );
            })}
          </div>
        </div>

        {/* Create Gallery Form */}
        {showCreateGallery && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Create New Gallery</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Gallery Title
                </label>
                <input
                  type="text"
                  value={newGalleryData.title}
                  onChange={(e) => setNewGalleryData(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Kitchen Renovation Project"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category
                </label>
                <select
                  value={newGalleryData.category}
                  onChange={(e) => setNewGalleryData(prev => ({ ...prev, category: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {GALLERY_CATEGORIES.map(cat => (
                    <option key={cat.key} value={cat.key}>{cat.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description (Optional)
                </label>
                <textarea
                  value={newGalleryData.description}
                  onChange={(e) => setNewGalleryData(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Describe this gallery..."
                />
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={() => createGalleryMutation.mutate(newGalleryData)}
                  disabled={!newGalleryData.title || createGalleryMutation.isPending}
                >
                  {createGalleryMutation.isPending ? 'Creating...' : 'Create Gallery'}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowCreateGallery(false)}
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Galleries Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i}>
                <CardContent className="p-4">
                  <Skeleton className="w-full h-48 rounded-lg mb-4" />
                  <Skeleton className="h-4 w-3/4 mb-2" />
                  <Skeleton className="h-3 w-1/2" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredGalleries?.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <i className="fas fa-images text-gray-400 text-xl"></i>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {selectedCategory ? 'No galleries in this category' : 'No portfolio galleries yet'}
            </h3>
            <p className="text-gray-600 mb-4">
              {isOwner 
                ? 'Create your first gallery to showcase your work to potential clients.'
                : 'This provider hasn\'t added any portfolio galleries yet.'
              }
            </p>
            {isOwner && (
              <Button onClick={() => setShowCreateGallery(true)}>
                <i className="fas fa-plus mr-2"></i>
                Create First Gallery
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredGalleries?.map((gallery: PortfolioGallery) => {
              const category = GALLERY_CATEGORIES.find(c => c.key === gallery.category);
              const primaryImage = gallery.images?.find(img => img.isPrimary) || gallery.images?.[0];
              
              return (
                <Card key={gallery.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-0">
                    {/* Gallery Cover Image */}
                    <div className="relative h-48 bg-gray-100 rounded-t-lg overflow-hidden">
                      {primaryImage ? (
                        <img
                          src={primaryImage.imageUrl}
                          alt={gallery.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <i className={`${category?.icon || 'fas fa-image'} text-4xl text-gray-400`}></i>
                        </div>
                      )}
                      
                      {/* Category Badge */}
                      <div className="absolute top-3 left-3">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${category?.color || 'bg-gray-100 text-gray-800'}`}>
                          <i className={`${category?.icon} mr-1`}></i>
                          {category?.label}
                        </span>
                      </div>

                      {/* Image Count */}
                      <div className="absolute top-3 right-3">
                        <span className="bg-black bg-opacity-70 text-white px-2 py-1 text-xs rounded-full">
                          <i className="fas fa-images mr-1"></i>
                          {gallery.images?.length || 0}
                        </span>
                      </div>
                    </div>

                    {/* Gallery Info */}
                    <div className="p-4">
                      <h3 className="font-semibold text-gray-900 mb-2">{gallery.title}</h3>
                      {gallery.description && (
                        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                          {gallery.description}
                        </p>
                      )}
                      
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500">
                          Updated {new Date(gallery.updatedAt).toLocaleDateString()}
                        </span>
                        
                        <div className="flex gap-2">
                          {isOwner && (
                            <ObjectUploader
                              maxNumberOfFiles={10}
                              onGetUploadParameters={handleGetUploadParameters}
                              onComplete={(result) => handleUploadComplete(result, gallery.id)}
                              buttonClassName="text-xs px-2 py-1"
                            >
                              <i className="fas fa-plus mr-1"></i>
                              Add Photos
                            </ObjectUploader>
                          )}
                          <Button
                            size="sm"
                            variant="outline"
                            asChild
                          >
                            <Link href={`/portfolio/${providerId}/gallery/${gallery.id}`}>
                              View Gallery
                            </Link>
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}