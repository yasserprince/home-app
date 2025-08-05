import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { RowsPhotoAlbum } from 'react-photo-album';
import Lightbox from 'yet-another-react-lightbox';
import { Trash2, Upload, ImageIcon } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import 'react-photo-album/rows.css';
import 'yet-another-react-lightbox/styles.css';

interface GalleryImage {
  id: string;
  url: string;
  file?: File;
  title?: string;
  description?: string;
  width: number;
  height: number;
  isPrimary?: boolean;
}

interface ModernPortfolioGalleryProps {
  initialImages?: GalleryImage[];
  onImagesChange?: (images: GalleryImage[]) => void;
  onUpload?: (files: File[]) => Promise<void>;
  maxImages?: number;
  acceptedTypes?: string[];
  galleryId?: string;
  title?: string;
  isUploading?: boolean;
}

export const ModernPortfolioGallery: React.FC<ModernPortfolioGalleryProps> = ({
  initialImages = [],
  onImagesChange,
  onUpload,
  maxImages = 20,
  acceptedTypes = ['image/jpeg', 'image/png', 'image/webp'],
  galleryId,
  title,
  isUploading = false
}) => {
  const [images, setImages] = useState<GalleryImage[]>(initialImages);
  const [lightboxIndex, setLightboxIndex] = useState(-1);
  const { toast } = useToast();

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;

    // Create preview images immediately
    const newImages: GalleryImage[] = acceptedFiles.map((file, index) => ({
      id: `temp-${Date.now()}-${index}`,
      url: URL.createObjectURL(file),
      file,
      width: 800,
      height: 600,
      title: file.name,
    }));

    const updatedImages = [...images, ...newImages].slice(0, maxImages);
    setImages(updatedImages);
    onImagesChange?.(updatedImages);

    // Upload files if handler provided
    if (onUpload) {
      try {
        await onUpload(acceptedFiles);
        toast({
          title: "Success",
          description: `${acceptedFiles.length} image(s) uploaded successfully`,
        });
      } catch (error) {
        console.error('Upload failed:', error);
        toast({
          title: "Upload failed",
          description: "Please try again",
          variant: "destructive",
        });
        // Revert on failure
        setImages(images);
        onImagesChange?.(images);
      }
    }
  }, [images, maxImages, onImagesChange, onUpload, toast]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: acceptedTypes.reduce((acc, type) => ({ ...acc, [type]: [] }), {}),
    maxFiles: maxImages - images.length,
    disabled: isUploading || images.length >= maxImages,
  });

  const handleDragEnd = (result: any) => {
    if (!result.destination) return;

    const reorderedImages = Array.from(images);
    const [removed] = reorderedImages.splice(result.source.index, 1);
    reorderedImages.splice(result.destination.index, 0, removed);

    setImages(reorderedImages);
    onImagesChange?.(reorderedImages);
  };

  const deleteImage = useCallback((imageId: string) => {
    const imageToDelete = images.find(img => img.id === imageId);
    if (imageToDelete?.url.startsWith('blob:')) {
      URL.revokeObjectURL(imageToDelete.url);
    }
    
    const updatedImages = images.filter(img => img.id !== imageId);
    setImages(updatedImages);
    onImagesChange?.(updatedImages);
    
    toast({
      title: "Image removed",
      description: "Image has been deleted from the gallery",
    });
  }, [images, onImagesChange, toast]);

  const setPrimaryImage = useCallback((imageId: string) => {
    const updatedImages = images.map(img => ({
      ...img,
      isPrimary: img.id === imageId
    }));
    setImages(updatedImages);
    onImagesChange?.(updatedImages);
    
    toast({
      title: "Primary image set",
      description: "This image will be displayed as the main gallery image",
    });
  }, [images, onImagesChange, toast]);

  // Prepare images for photo album display
  const photoAlbumImages = images.map(img => ({
    src: img.url,
    width: img.width || 800,
    height: img.height || 600,
    alt: img.title || 'Portfolio image'
  }));

  return (
    <div className="modern-portfolio-gallery space-y-6">
      {title && (
        <div className="flex items-center gap-2">
          <ImageIcon className="w-5 h-5" />
          <h3 className="text-lg font-semibold">{title}</h3>
          <span className="text-sm text-muted-foreground">
            ({images.length}/{maxImages})
          </span>
        </div>
      )}

      {/* Upload Zone */}
      {images.length < maxImages && (
        <Card>
          <CardContent className="p-6">
            <div
              {...getRootProps()}
              className={`
                border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all duration-300
                ${isDragActive 
                  ? 'border-primary bg-primary/5 scale-[1.02]' 
                  : 'border-muted-foreground/25 hover:border-primary/50 hover:bg-accent/50'
                }
                ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}
              `}
            >
              <input {...getInputProps()} />
              <div className="flex flex-col items-center gap-4">
                <div className="p-4 bg-accent rounded-full">
                  <Upload className="w-8 h-8 text-primary" />
                </div>
                <div>
                  <p className="text-lg font-medium">
                    {isDragActive 
                      ? 'Drop images here' 
                      : isUploading
                      ? 'Uploading...'
                      : 'Drag & drop images or click to select'
                    }
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Supports JPG, PNG, WebP • Max {maxImages - images.length} more images
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Gallery Management */}
      {images.length > 0 && (
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-medium">Gallery Images</h4>
              <p className="text-sm text-muted-foreground">
                Drag to reorder • Click to view full size
              </p>
            </div>

            <DragDropContext onDragEnd={handleDragEnd}>
              <Droppable droppableId="gallery" direction="horizontal">
                {(provided) => (
                  <div
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    className="flex gap-4 overflow-x-auto pb-2"
                  >
                    {images.map((image, index) => (
                      <Draggable key={image.id} draggableId={image.id} index={index}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className={`
                              relative flex-shrink-0 w-32 h-32 rounded-lg overflow-hidden border-2 
                              ${snapshot.isDragging ? 'rotate-3 shadow-xl z-50' : 'shadow-sm'}
                              ${image.isPrimary ? 'border-primary' : 'border-border'}
                              transition-all duration-200 hover:shadow-lg cursor-pointer
                            `}
                          >
                            <img
                              src={image.url}
                              alt={image.title || `Gallery image ${index + 1}`}
                              className="w-full h-full object-cover"
                              loading="lazy"
                              onClick={() => setLightboxIndex(index)}
                              onLoad={(e) => {
                                const img = e.target as HTMLImageElement;
                                if (img.naturalWidth && img.naturalHeight) {
                                  const updatedImages = images.map(i => 
                                    i.id === image.id 
                                      ? { ...i, width: img.naturalWidth, height: img.naturalHeight }
                                      : i
                                  );
                                  setImages(updatedImages);
                                  onImagesChange?.(updatedImages);
                                }
                              }}
                            />
                            
                            {/* Overlay Controls */}
                            <div className="absolute inset-0 bg-black/0 hover:bg-black/20 transition-colors duration-200 group">
                              <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  className="w-6 h-6 p-0"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    deleteImage(image.id);
                                  }}
                                >
                                  <Trash2 className="w-3 h-3" />
                                </Button>
                              </div>
                              
                              {!image.isPrimary && (
                                <div className="absolute bottom-1 left-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                  <Button
                                    size="sm"
                                    variant="secondary"
                                    className="text-xs h-5 px-2"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setPrimaryImage(image.id);
                                    }}
                                  >
                                    Primary
                                  </Button>
                                </div>
                              )}
                              
                              {image.isPrimary && (
                                <div className="absolute bottom-1 left-1 bg-primary/90 text-primary-foreground text-xs px-2 py-1 rounded">
                                  Primary
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>
          </CardContent>
        </Card>
      )}

      {/* Photo Album Display */}
      {images.length > 0 && (
        <Card>
          <CardContent className="p-6">
            <h4 className="font-medium mb-4">Gallery View</h4>
            <RowsPhotoAlbum
              photos={photoAlbumImages}
              onClick={({ index }) => setLightboxIndex(index)}
              targetRowHeight={200}
              sizes={{
                size: '1200px',
                sizes: [
                  { viewport: '(max-width: 768px)', size: 'calc(100vw - 32px)' },
                  { viewport: '(max-width: 1200px)', size: 'calc(100vw - 64px)' },
                ],
              }}
            />
          </CardContent>
        </Card>
      )}

      {/* Lightbox */}
      <Lightbox
        open={lightboxIndex >= 0}
        index={lightboxIndex}
        close={() => setLightboxIndex(-1)}
        slides={photoAlbumImages}
        carousel={{ finite: true }}
        render={{
          buttonPrev: images.length <= 1 ? () => null : undefined,
          buttonNext: images.length <= 1 ? () => null : undefined,
        }}
      />
    </div>
  );
};