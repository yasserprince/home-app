import React, { useState, useRef, useCallback } from 'react';
import ReactCrop, { Crop, PixelCrop } from 'react-image-crop';
import Compressor from 'compressorjs';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Camera, Loader2, X, RotateCcw, Check } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import 'react-image-crop/dist/ReactCrop.css';

interface ProfileImageManagerProps {
  currentImageUrl?: string | null;
  userName?: string;
  userEmail?: string;
  size?: number;
  className?: string;
}

export function ProfileImageManager({ 
  currentImageUrl, 
  userName = '', 
  userEmail = '', 
  size = 96, 
  className = '' 
}: ProfileImageManagerProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [originalImageUrl, setOriginalImageUrl] = useState<string | null>(null);
  const [showDialog, setShowDialog] = useState(false);
  const [step, setStep] = useState<'select' | 'crop' | 'uploading'>('select');
  const [crop, setCrop] = useState<Crop>({
    unit: '%',
    x: 25,
    y: 25,
    width: 50,
    height: 50,
  });
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Generate user initials for fallback
  const initials = (() => {
    if (userName) {
      return userName
        .split(' ')
        .map(chunk => chunk.charAt(0).toUpperCase())
        .slice(0, 2)
        .join('');
    }
    if (userEmail) {
      return userEmail.charAt(0).toUpperCase();
    }
    return 'U';
  })();

  // Generate consistent background color
  const getBackgroundColor = (str: string = '') => {
    const colors = [
      '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', 
      '#FECA57', '#FF9FF3', '#A8E6CF', '#FFD93D',
      '#6C5CE7', '#FD79A8', '#E17055', '#00B894'
    ];
    const hash = str.split('').reduce((acc, char) => char.charCodeAt(0) + acc, str.length);
    return colors[hash % colors.length];
  };

  // Function to process the cropped image
  const getCroppedImg = useCallback(async (): Promise<File> => {
    return new Promise((resolve, reject) => {
      if (!completedCrop || !imgRef.current) {
        reject(new Error('No crop data or image reference'));
        return;
      }

      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const image = imgRef.current;

      if (!ctx) {
        reject(new Error('Failed to get canvas context'));
        return;
      }

      const scaleX = image.naturalWidth / image.width;
      const scaleY = image.naturalHeight / image.height;

      canvas.width = completedCrop.width;
      canvas.height = completedCrop.height;

      ctx.drawImage(
        image,
        completedCrop.x * scaleX,
        completedCrop.y * scaleY,
        completedCrop.width * scaleX,
        completedCrop.height * scaleY,
        0,
        0,
        completedCrop.width,
        completedCrop.height
      );

      canvas.toBlob((blob) => {
        if (!blob) {
          reject(new Error('Canvas is empty'));
          return;
        }

        // Compress the cropped image
        new Compressor(blob, {
          quality: 0.8,
          maxWidth: 400,
          maxHeight: 400,
          mimeType: 'image/jpeg',
          success: (compressedBlob) => {
            const file = new File([compressedBlob], 'profile-image.jpg', {
              type: 'image/jpeg',
            });
            resolve(file);
          },
          error: (err) => {
            reject(err);
          },
        });
      }, 'image/jpeg', 0.95);
    });
  }, [completedCrop]);

  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      setStep('uploading');
      
      // Get upload URL
      const uploadResponse = await apiRequest("POST", "/api/objects/upload");
      const { uploadURL } = await uploadResponse.json();
      
      if (!uploadURL) {
        throw new Error('Failed to get upload URL');
      }
      
      // Upload to storage
      const uploadResult = await fetch(uploadURL, {
        method: "PUT",
        body: file,
        headers: {
          'Content-Type': file.type,
        },
      });
      
      if (!uploadResult.ok) {
        throw new Error(`Upload failed: ${uploadResult.status}`);
      }
      
      // Update profile with new image
      const response = await apiRequest("PUT", "/api/profile/image", {
        imageURL: uploadURL.split('?')[0] // Remove query params for storage URL
      });
      
      return await response.json();
    },
    onSuccess: (data) => {
      // Update cache with new user data
      if (data.user) {
        queryClient.setQueryData(["/api/auth/user"], data.user);
      }
      
      // Reset state and close dialog
      resetState();
      
      toast({
        title: "Success!",
        description: "Profile picture updated successfully.",
      });
    },
    onError: (error: any) => {
      console.error('Upload failed:', error);
      toast({
        title: "Upload Failed",
        description: error?.message || "Failed to update profile picture. Please try again.",
        variant: "destructive",
      });
      setStep('crop');
    },
    onSettled: () => {
      setIsUploading(false);
    }
  });

  const resetState = () => {
    setOriginalImageUrl(null);
    setCrop({ unit: '%', x: 25, y: 25, width: 50, height: 50 });
    setCompletedCrop(undefined);
    setStep('select');
    setShowDialog(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid File",
        description: "Please select an image file.",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "File Too Large",
        description: "Please select an image smaller than 10MB.",
        variant: "destructive",
      });
      return;
    }

    // Create preview and show crop dialog
    const reader = new FileReader();
    reader.onload = (e) => {
      setOriginalImageUrl(e.target?.result as string);
      setStep('crop');
      setShowDialog(true);
    };
    reader.readAsDataURL(file);
  };

  const handleCropConfirm = async () => {
    if (!completedCrop) {
      toast({
        title: "No Crop Selected",
        description: "Please adjust the crop area before uploading.",
        variant: "destructive",
      });
      return;
    }
    
    setIsUploading(true);
    try {
      const croppedFile = await getCroppedImg();
      await uploadMutation.mutateAsync(croppedFile);
    } catch (error) {
      console.error('Error processing image:', error);
      toast({
        title: "Processing Failed",
        description: "Failed to process the image. Please try again.",
        variant: "destructive",
      });
      setIsUploading(false);
    }
  };

  // Display current image or fallback
  const displayImageUrl = currentImageUrl;
  const shouldShowImage = displayImageUrl && !isUploading;

  return (
    <>
      <div className={`relative ${className}`}>
        {/* Avatar Display */}
        <div 
          className="rounded-full overflow-hidden border-4 border-white/20 cursor-pointer hover:opacity-80 transition-opacity"
          style={{ width: size, height: size }}
          onClick={() => fileInputRef.current?.click()}
        >
          {shouldShowImage ? (
            <img
              src={displayImageUrl}
              alt={userName || userEmail || 'Profile'}
              className="w-full h-full object-cover"
              onError={(e) => {
                // If image fails to load, hide it to show fallback
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
          ) : (
            <div
              className="w-full h-full flex items-center justify-center text-white font-semibold select-none"
              style={{
                backgroundColor: initials !== 'U' ? getBackgroundColor(userName || userEmail) : '#6B7280',
                fontSize: size * 0.35,
              }}
            >
              {isUploading ? (
                <Loader2 className="animate-spin" size={size * 0.4} />
              ) : (
                initials
              )}
            </div>
          )}
        </div>

        {/* Camera Button */}
        <Button
          size="icon"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-blue-500 hover:bg-blue-600 text-white border-2 border-white shadow-lg"
          title="Update profile picture"
        >
          {isUploading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Camera className="w-4 h-4" />
          )}
        </Button>

        {/* Hidden File Input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>

      {/* Crop and Upload Dialog */}
      <Dialog open={showDialog} onOpenChange={(open) => {
        if (!open && !isUploading) {
          resetState();
        }
      }}>
        <DialogContent className="sm:max-w-lg bg-gray-900 border-gray-700">
          <DialogHeader>
            <DialogTitle className="text-white">
              {step === 'crop' ? 'Crop Your Photo' : step === 'uploading' ? 'Uploading...' : 'Select Photo'}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            {step === 'crop' && originalImageUrl && (
              <div className="flex flex-col items-center space-y-4">
                <div className="max-w-full max-h-80 overflow-hidden rounded-lg border border-gray-600">
                  <ReactCrop
                    crop={crop}
                    onChange={(_, percentCrop) => setCrop(percentCrop)}
                    onComplete={(c) => setCompletedCrop(c)}
                    aspect={1}
                    circularCrop
                  >
                    <img
                      ref={imgRef}
                      src={originalImageUrl}
                      alt="Crop preview"
                      className="max-w-full h-auto"
                      onLoad={(e) => {
                        const { width, height } = e.currentTarget;
                        const cropSize = Math.min(width, height) * 0.8;
                        const x = (width - cropSize) / 2;
                        const y = (height - cropSize) / 2;
                        
                        setCrop({
                          unit: 'px',
                          x,
                          y,
                          width: cropSize,
                          height: cropSize,
                        });
                      }}
                    />
                  </ReactCrop>
                </div>
                
                <p className="text-gray-400 text-sm text-center">
                  Drag to reposition • Resize handles to adjust
                </p>
              </div>
            )}

            {step === 'uploading' && (
              <div className="flex flex-col items-center space-y-4 py-8">
                <Loader2 className="w-12 h-12 animate-spin text-blue-500" />
                <p className="text-white">Uploading your new profile picture...</p>
              </div>
            )}
            
            <div className="flex gap-2 justify-end">
              <Button
                variant="outline"
                onClick={resetState}
                disabled={isUploading}
                className="border-gray-600 text-white hover:bg-gray-800"
              >
                <X className="w-4 h-4 mr-2" />
                Cancel
              </Button>
              
              {step === 'crop' && (
                <>
                  <Button
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                    className="border-gray-600 text-white hover:bg-gray-800"
                  >
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Choose Different
                  </Button>
                  <Button
                    onClick={handleCropConfirm}
                    disabled={isUploading || !completedCrop}
                    className="bg-blue-500 hover:bg-blue-600 text-white"
                  >
                    <Check className="w-4 h-4 mr-2" />
                    Use This Photo
                  </Button>
                </>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}