import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Plus, FolderOpen, Settings, Star } from 'lucide-react';
import { ModernPortfolioGallery } from '@/components/ModernPortfolioGallery';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { apiRequest, queryClient } from '@/lib/queryClient';

interface Gallery {
  id: string;
  title: string;
  description: string;
  category: string;
  serviceType: string;
  images: any[];
  providerId: string;
}

const GALLERY_CATEGORIES = [
  { value: 'featured', label: 'Featured Work' },
  { value: 'before-after', label: 'Before & After' },
  { value: 'work-samples', label: 'Work Samples' },
  { value: 'tools-equipment', label: 'Tools & Equipment' },
  { value: 'certifications', label: 'Certifications' },
];

export default function ModernPortfolio() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedGallery, setSelectedGallery] = useState<string | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newGalleryData, setNewGalleryData] = useState({
    title: '',
    description: '',
    category: 'featured',
    serviceType: ''
  });

  // Fetch galleries for the current user
  const { data: galleries = [], isLoading, error } = useQuery<Gallery[]>({
    queryKey: ['/api/portfolios/galleries'],
    enabled: !!user?.id,
  });

  // Create gallery mutation
  const createGalleryMutation = useMutation({
    mutationFn: async (galleryData: typeof newGalleryData) => {
      return apiRequest('/api/portfolios/galleries', 'POST', galleryData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        queryKey: ['/api/portfolios/galleries', user?.id] 
      });
      setShowCreateDialog(false);
      setNewGalleryData({
        title: '',
        description: '',
        category: 'featured',
        serviceType: ''
      });
      toast({
        title: "Gallery created",
        description: "Your new gallery has been created successfully",
      });
    },
    onError: (error) => {
      console.error('Create gallery error:', error);
      toast({
        title: "Failed to create gallery",
        description: "Please try again",
        variant: "destructive",
      });
    },
  });

  // Upload images mutation
  const uploadImagesMutation = useMutation({
    mutationFn: async ({ galleryId, files }: { galleryId: string; files: File[] }) => {
      // First get upload URLs
      const uploadPromises = files.map(async (file) => {
        const uploadResponse = await apiRequest('/api/objects/upload', 'POST');
        const { uploadURL } = await uploadResponse.json();
        
        // Upload file to storage
        await fetch(uploadURL, {
          method: 'PUT',
          body: file,
          headers: {
            'Content-Type': file.type,
          },
        });

        return {
          galleryId,
          imageUrl: uploadURL,
          title: file.name,
          description: '',
        };
      });

      const uploadedImages = await Promise.all(uploadPromises);
      
      // Save image metadata to database
      return apiRequest('/api/portfolios/images', 'POST', uploadedImages);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        queryKey: ['/api/portfolios/galleries', user?.id] 
      });
      toast({
        title: "Images uploaded",
        description: "Your images have been uploaded successfully",
      });
    },
    onError: (error) => {
      console.error('Upload error:', error);
      toast({
        title: "Upload failed",
        description: "Please try again",
        variant: "destructive",
      });
    },
  });

  const handleCreateGallery = () => {
    if (!newGalleryData.title.trim()) {
      toast({
        title: "Title required",
        description: "Please enter a title for your gallery",
        variant: "destructive",
      });
      return;
    }
    createGalleryMutation.mutate(newGalleryData);
  };

  const handleUploadImages = async (galleryId: string, files: File[]): Promise<void> => {
    await uploadImagesMutation.mutateAsync({ galleryId, files });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-500">Failed to load portfolio galleries</p>
        <Button 
          variant="outline" 
          onClick={() => queryClient.invalidateQueries({ queryKey: ['/api/portfolios/galleries', user?.id] })}
          className="mt-2"
        >
          Retry
        </Button>
      </div>
    );
  }

  const selectedGalleryData = galleries.find((g: Gallery) => g.id === selectedGallery);

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Portfolio Management</h1>
          <p className="text-muted-foreground mt-1">
            Organize and showcase your work with professional galleries
          </p>
        </div>
        
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              New Gallery
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Gallery</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">Gallery Title</Label>
                <Input
                  id="title"
                  value={newGalleryData.title}
                  onChange={(e) => setNewGalleryData({ ...newGalleryData, title: e.target.value })}
                  placeholder="e.g., Kitchen Renovations"
                />
              </div>
              
              <div>
                <Label htmlFor="category">Category</Label>
                <Select
                  value={newGalleryData.category}
                  onValueChange={(value) => setNewGalleryData({ ...newGalleryData, category: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {GALLERY_CATEGORIES.map((cat) => (
                      <SelectItem key={cat.value} value={cat.value}>
                        {cat.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="service-type">Service Type</Label>
                <Input
                  id="service-type"
                  value={newGalleryData.serviceType}
                  onChange={(e) => setNewGalleryData({ ...newGalleryData, serviceType: e.target.value })}
                  placeholder="e.g., Plumbing, Electrical, Carpentry"
                />
              </div>
              
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={newGalleryData.description}
                  onChange={(e) => setNewGalleryData({ ...newGalleryData, description: e.target.value })}
                  placeholder="Describe what this gallery showcases..."
                  rows={3}
                />
              </div>
              
              <div className="flex justify-end gap-2">
                <Button 
                  variant="outline" 
                  onClick={() => setShowCreateDialog(false)}
                  disabled={createGalleryMutation.isPending}
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleCreateGallery}
                  disabled={createGalleryMutation.isPending}
                >
                  {createGalleryMutation.isPending ? 'Creating...' : 'Create Gallery'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Gallery List */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FolderOpen className="w-5 h-5" />
                Galleries ({galleries.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {galleries.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <FolderOpen className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No galleries yet</p>
                  <p className="text-sm">Create your first gallery to get started</p>
                </div>
              ) : (
                galleries.map((gallery: Gallery) => (
                  <div
                    key={gallery.id}
                    className={`
                      p-3 rounded-lg border cursor-pointer transition-all duration-200
                      ${selectedGallery === gallery.id 
                        ? 'border-primary bg-primary/5' 
                        : 'border-border hover:border-primary/50 hover:bg-accent/50'
                      }
                    `}
                    onClick={() => setSelectedGallery(gallery.id)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium truncate">{gallery.title}</h4>
                        <p className="text-sm text-muted-foreground capitalize">
                          {gallery.category.replace('-', ' ')}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {gallery.images?.length || 0} images
                        </p>
                      </div>
                      {gallery.category === 'featured' && (
                        <Star className="w-4 h-4 text-yellow-500" />
                      )}
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>

        {/* Gallery Content */}
        <div className="lg:col-span-3">
          {selectedGalleryData ? (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle>{selectedGalleryData.title}</CardTitle>
                      <p className="text-muted-foreground mt-1">
                        {selectedGalleryData.description}
                      </p>
                      <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                        <span className="capitalize">
                          {selectedGalleryData.category.replace('-', ' ')}
                        </span>
                        {selectedGalleryData.serviceType && (
                          <span>• {selectedGalleryData.serviceType}</span>
                        )}
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      <Settings className="w-4 h-4 mr-2" />
                      Settings
                    </Button>
                  </div>
                </CardHeader>
              </Card>

              <ModernPortfolioGallery
                initialImages={selectedGalleryData.images || []}
                onUpload={(files) => handleUploadImages(selectedGalleryData.id, files)}
                galleryId={selectedGalleryData.id}
                title={`${selectedGalleryData.title} Images`}
                isUploading={uploadImagesMutation.isPending}
                maxImages={50}
              />
            </div>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-16">
                <FolderOpen className="w-16 h-16 text-muted-foreground/50 mb-4" />
                <h3 className="text-lg font-medium mb-2">Select a Gallery</h3>
                <p className="text-muted-foreground text-center max-w-md">
                  Choose a gallery from the sidebar to view and manage its images, 
                  or create a new gallery to get started.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}