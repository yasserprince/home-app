import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link, useRoute } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ObjectUploader } from "@/components/ObjectUploader";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { UploadResult } from "@uppy/core";

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

export default function GalleryDetail() {
  const [match, params] = useRoute('/portfolio/:providerId/gallery/:galleryId');
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedImage, setSelectedImage] = useState<PortfolioImage | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const providerId = params?.providerId;
  const galleryId = params?.galleryId;
  const isOwner = user?.isServiceProvider && !params?.providerId;

  const { data: galleries, isLoading } = useQuery({
    queryKey: ['/api/portfolios', providerId, 'galleries'],
    enabled: !!providerId,
  });

  const uploadImagesMutation = useMutation({
    mutationFn: async (images: any[]) => {
      return apiRequest('/api/portfolios/images', 'POST', images);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/portfolios', providerId, 'galleries'] });
      toast({
        title: "Success",
        description: "Images uploaded successfully",
      });
    },
  });

  const setPrimaryImageMutation = useMutation({
    mutationFn: async ({ imageId, galleryId }: { imageId: string; galleryId: string }) => {
      return apiRequest(`/api/portfolios/images/${imageId}/primary`, 'PUT', { galleryId });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/portfolios', providerId, 'galleries'] });
      toast({
        title: "Success",
        description: "Primary image updated",
      });
    },
  });

  const deleteImageMutation = useMutation({
    mutationFn: async (imageId: string) => {
      return apiRequest(`/api/portfolios/images/${imageId}`, 'DELETE');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/portfolios', providerId, 'galleries'] });
      setSelectedImage(null);
      toast({
        title: "Success",
        description: "Image deleted successfully",
      });
    },
  });

  const gallery = Array.isArray(galleries) ? galleries.find((g: PortfolioGallery) => g.id === galleryId) : undefined;

  const handleGetUploadParameters = async () => {
    const response = await apiRequest('/api/portfolios/images/upload', 'POST');
    return {
      method: 'PUT' as const,
      url: (response as any).uploadURL,
    };
  };

  const handleUploadComplete = (result: UploadResult<Record<string, unknown>, Record<string, unknown>>) => {
    const uploadedImages = result.successful.map((file: any, index: number) => ({
      galleryId: galleryId!,
      imageUrl: file.uploadURL,
      title: file.meta?.title || file.name,
      description: file.meta?.description || '',
      imageType: getImageTypeForCategory(gallery?.category || 'work_samples'),
      sortOrder: (gallery?.images?.length || 0) + index,
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

  if (!providerId || !galleryId) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md mx-auto">
          <CardContent className="p-8 text-center">
            <h3 className="font-medium text-gray-900 mb-2">Gallery not found</h3>
            <p className="text-sm text-gray-600 mb-4">
              Unable to load gallery details
            </p>
            <Button asChild>
              <Link href={`/portfolio/${providerId}`}>Back to Portfolio</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="p-4 pt-12">
          <Skeleton className="h-8 w-64 mb-4" />
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <Skeleton key={i} className="aspect-square rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!gallery) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md mx-auto">
          <CardContent className="p-8 text-center">
            <h3 className="font-medium text-gray-900 mb-2">Gallery not found</h3>
            <p className="text-sm text-gray-600 mb-4">
              This gallery may have been deleted or is no longer available
            </p>
            <Button asChild>
              <Link href={`/portfolio/${providerId}`}>Back to Portfolio</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white p-4 pt-12 border-b border-gray-200 sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href={`/portfolio/${providerId}`}>
              <Button variant="ghost" size="sm" className="p-2">
                <i className="fas fa-arrow-left text-gray-600"></i>
              </Button>
            </Link>
            <div>
              <h1 className="text-xl font-semibold text-gray-900">{gallery.title}</h1>
              {gallery.description && (
                <p className="text-sm text-gray-600 mt-1">{gallery.description}</p>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {/* View Mode Toggle */}
            <div className="flex bg-gray-100 rounded-lg p-1">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('grid')}
                className="px-3 py-1 h-8"
              >
                <i className="fas fa-th text-xs"></i>
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('list')}
                className="px-3 py-1 h-8"
              >
                <i className="fas fa-list text-xs"></i>
              </Button>
            </div>

            {isOwner && (
              <ObjectUploader
                maxNumberOfFiles={10}
                onGetUploadParameters={handleGetUploadParameters}
                onComplete={handleUploadComplete}
                buttonClassName="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <i className="fas fa-plus mr-2"></i>
                Add Photos
              </ObjectUploader>
            )}
          </div>
        </div>

        {/* Gallery Stats */}
        <div className="flex items-center gap-4 mt-3 text-sm text-gray-600">
          <span>
            <i className="fas fa-images mr-1"></i>
            {gallery.images?.length || 0} photos
          </span>
          <span>
            <i className="fas fa-calendar mr-1"></i>
            Updated {new Date(gallery.updatedAt).toLocaleDateString()}
          </span>
        </div>
      </div>

      <div className="p-6">
        {gallery.images?.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <i className="fas fa-images text-gray-400 text-xl"></i>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No photos yet</h3>
            <p className="text-gray-600 mb-4">
              {isOwner 
                ? 'Add photos to showcase your work in this gallery.'
                : 'This gallery doesn\'t have any photos yet.'
              }
            </p>
            {isOwner && (
              <ObjectUploader
                maxNumberOfFiles={10}
                onGetUploadParameters={handleGetUploadParameters}
                onComplete={handleUploadComplete}
              >
                <i className="fas fa-plus mr-2"></i>
                Add First Photo
              </ObjectUploader>
            )}
          </div>
        ) : (
          <>
            {/* Images Grid/List */}
            {viewMode === 'grid' ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {gallery.images?.map((image: PortfolioImage) => (
                  <div
                    key={image.id}
                    className="relative group cursor-pointer bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                    onClick={() => setSelectedImage(image)}
                  >
                    <div className="aspect-square bg-gray-100">
                      <img
                        src={image.imageUrl}
                        alt={image.title || 'Portfolio image'}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    
                    {/* Image Overlay */}
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-opacity flex items-center justify-center">
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button size="sm" variant="secondary" className="text-xs">
                          <i className="fas fa-eye mr-2"></i>
                          View
                        </Button>
                      </div>
                    </div>

                    {/* Primary Badge */}
                    {image.isPrimary && (
                      <div className="absolute top-2 left-2">
                        <span className="bg-yellow-500 text-white px-2 py-1 text-xs rounded-full font-medium">
                          <i className="fas fa-star mr-1"></i>
                          Primary
                        </span>
                      </div>
                    )}

                    {/* Owner Actions */}
                    {isOwner && (
                      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="flex gap-1">
                          {!image.isPrimary && (
                            <Button
                              size="sm"
                              variant="secondary"
                              className="h-6 w-6 p-0"
                              onClick={(e) => {
                                e.stopPropagation();
                                setPrimaryImageMutation.mutate({ 
                                  imageId: image.id, 
                                  galleryId: gallery.id 
                                });
                              }}
                            >
                              <i className="fas fa-star text-xs"></i>
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="destructive"
                            className="h-6 w-6 p-0"
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteImageMutation.mutate(image.id);
                            }}
                          >
                            <i className="fas fa-trash text-xs"></i>
                          </Button>
                        </div>
                      </div>
                    )}

                    {/* Image Info */}
                    {image.title && (
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black via-black/70 to-transparent p-3 pt-6">
                        <h4 className="text-white text-sm font-medium truncate">
                          {image.title}
                        </h4>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              /* List View */
              <div className="space-y-4">
                {gallery.images?.map((image: PortfolioImage) => (
                  <Card 
                    key={image.id} 
                    className="hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => setSelectedImage(image)}
                  >
                    <CardContent className="p-4">
                      <div className="flex gap-4">
                        <div className="w-24 h-24 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                          <img
                            src={image.imageUrl}
                            alt={image.title || 'Portfolio image'}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between">
                            <div>
                              <h4 className="font-medium text-gray-900 truncate">
                                {image.title || 'Untitled'}
                              </h4>
                              {image.description && (
                                <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                                  {image.description}
                                </p>
                              )}
                              <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                                <span>
                                  Uploaded {new Date(image.uploadedAt).toLocaleDateString()}
                                </span>
                                {image.isPrimary && (
                                  <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">
                                    <i className="fas fa-star mr-1"></i>
                                    Primary
                                  </span>
                                )}
                              </div>
                            </div>
                            {isOwner && (
                              <div className="flex gap-1 ml-4">
                                {!image.isPrimary && (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setPrimaryImageMutation.mutate({ 
                                        imageId: image.id, 
                                        galleryId: gallery.id 
                                      });
                                    }}
                                  >
                                    <i className="fas fa-star mr-1"></i>
                                    Set Primary
                                  </Button>
                                )}
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    deleteImageMutation.mutate(image.id);
                                  }}
                                >
                                  <i className="fas fa-trash"></i>
                                </Button>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* Image Detail Modal */}
      {selectedImage && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div className="max-w-4xl w-full max-h-full flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between text-white mb-4">
              <h3 className="text-lg font-medium">
                {selectedImage.title || 'Portfolio Image'}
              </h3>
              <div className="flex items-center gap-2">
                {isOwner && (
                  <>
                    {!selectedImage.isPrimary && (
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={(e) => {
                          e.stopPropagation();
                          setPrimaryImageMutation.mutate({ 
                            imageId: selectedImage.id, 
                            galleryId: gallery.id 
                          });
                        }}
                      >
                        <i className="fas fa-star mr-2"></i>
                        Set as Primary
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteImageMutation.mutate(selectedImage.id);
                      }}
                    >
                      <i className="fas fa-trash mr-2"></i>
                      Delete
                    </Button>
                  </>
                )}
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-white"
                  onClick={() => setSelectedImage(null)}
                >
                  <i className="fas fa-times"></i>
                </Button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="flex-1 flex items-center justify-center">
              <img
                src={selectedImage.imageUrl}
                alt={selectedImage.title || 'Portfolio image'}
                className="max-w-full max-h-full object-contain"
                onClick={(e) => e.stopPropagation()}
              />
            </div>

            {/* Modal Footer */}
            {selectedImage.description && (
              <div className="text-center text-white mt-4">
                <p className="text-sm opacity-80">{selectedImage.description}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}