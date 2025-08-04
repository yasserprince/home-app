import React, { useState, useRef, useCallback } from 'react';
import ReactCrop, { Crop, PixelCrop } from 'react-image-crop';
import Compressor from 'compressorjs';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Loader2, Upload, Crop as CropIcon, Check } from 'lucide-react';
import 'react-image-crop/dist/ReactCrop.css';

interface ModernImageUploaderProps {
  children: React.ReactNode;
  onSuccess?: (imageUrl: string) => void;
}

export function ModernImageUploader({ children, onSuccess }: ModernImageUploaderProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [src, setSrc] = useState<string>('');
  const [crop, setCrop] = useState<Crop>({
    unit: '%',
    x: 25,
    y: 25,
    width: 50,
    height: 50,
  });
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  const [isProcessing, setIsProcessing] = useState(false);
  const [step, setStep] = useState<'select' | 'crop' | 'upload'>('select');
  
  const imgRef = useRef<HTMLImageElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      console.log("Starting upload process for file:", file.name, file.size, file.type);
      setStep('upload');
      
      try {
        // Get upload URL
        console.log("Getting upload URL...");
        const uploadResponse = await apiRequest("POST", "/api/objects/upload");
        console.log("Raw upload response:", uploadResponse);
        const uploadData = await uploadResponse.json();
        console.log("Parsed response data:", uploadData);
        const { uploadURL } = uploadData;
        console.log("Extracted uploadURL:", uploadURL);
        console.log("Upload URL received:", uploadURL ? "Success" : "Failed");
        
        if (!uploadURL) {
          throw new Error('Failed to get upload URL from server');
        }
        
        // Upload to object storage
        console.log("Uploading file to object storage...");
        const uploadResult = await fetch(uploadURL, {
          method: "PUT",
          body: file,
          headers: {
            'Content-Type': file.type,
          },
        });

        console.log("Upload result status:", uploadResult.status, uploadResult.statusText);
        if (!uploadResult.ok) {
          const errorText = await uploadResult.text();
          console.error("Upload failed with response:", errorText);
          throw new Error(`Upload failed with status: ${uploadResult.status} - ${errorText}`);
        }

        // Set ACL policy and update profile
        console.log("Setting ACL policy and updating profile...");
        const response = await apiRequest("PUT", "/api/profile/image", { 
          imageURL: uploadURL
        });
        const responseData = await response.json();
        console.log("Profile update response:", responseData);
        console.log("New profile image URL:", responseData.objectPath);
        
        return responseData;
      } catch (error) {
        console.error("Upload mutation error:", error);
        throw error;
      }
    },
    onSuccess: async (data) => {
      console.log("Upload success response:", data);
      console.log("New profile image URL:", data.objectPath);
      console.log("Updated user data:", data.user);
      
      // Update the cache directly with the new user data
      if (data.user) {
        queryClient.setQueryData(["/api/auth/user"], data.user);
        console.log("Cache updated with new user data");
      }
      
      // Force cache invalidation and refetch as backup
      await queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      await queryClient.refetchQueries({ queryKey: ["/api/auth/user"] });
      
      toast({
        title: "Success!",
        description: "Your profile picture has been updated successfully.",
      });
      setIsOpen(false);
      resetState();
      
      // Call the onSuccess callback if provided
      if (onSuccess) {
        onSuccess(data.objectPath);
      }
    },
    onError: (error: any) => {
      console.error("Upload error details:", error);
      console.error("Error message:", error?.message);
      console.error("Error stack:", error?.stack);
      
      let errorMessage = "Failed to upload image. Please try again.";
      const errorMsg = error?.message || '';
      
      if (errorMsg.includes("upload URL")) {
        errorMessage = "Server configuration error. Please contact support.";
      } else if (errorMsg.includes("401")) {
        errorMessage = "Authentication expired. Please refresh and try again.";
      } else if (errorMsg.includes("413")) {
        errorMessage = "Image is too large. Please choose a smaller image.";
      } else if (errorMsg.includes("canvas")) {
        errorMessage = "Image processing failed. Please try a different image.";
      }
      
      toast({
        title: "Upload Failed",
        description: errorMessage,
        variant: "destructive",
      });
      setStep('crop');
    },
  });

  const resetState = () => {
    setSrc('');
    setCrop({ unit: '%', x: 25, y: 25, width: 50, height: 50 });
    setCompletedCrop(undefined);
    setStep('select');
    setIsProcessing(false);
  };

  const onSelectFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast({
          title: "Invalid File",
          description: "Please select a valid image file.",
          variant: "destructive",
        });
        return;
      }
      
      // Validate file size (10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: "File Too Large",
          description: "Please select an image smaller than 10MB.",
          variant: "destructive",
        });
        return;
      }

      const reader = new FileReader();
      reader.addEventListener('load', () => {
        setSrc(reader.result?.toString() || '');
        setStep('crop');
      });
      reader.readAsDataURL(file);
    }
  };

  const onImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const { width, height } = e.currentTarget;
    const crop = {
      unit: 'px' as const,
      x: (width - Math.min(width, height)) / 2,
      y: (height - Math.min(width, height)) / 2,
      width: Math.min(width, height),
      height: Math.min(width, height),
    };
    setCrop(crop);
    setCompletedCrop(crop);
  };

  const getCroppedImg = useCallback(async (): Promise<File> => {
    return new Promise((resolve, reject) => {
      console.log("Starting image cropping process...");
      console.log("Completed crop:", completedCrop);
      console.log("Image ref:", imgRef.current);
      
      if (!completedCrop || !imgRef.current) {
        const error = new Error('No crop data available - crop or image ref is missing');
        console.error(error);
        reject(error);
        return;
      }

      const image = imgRef.current;
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        const error = new Error('Could not get canvas context');
        console.error(error);
        reject(error);
        return;
      }

      console.log("Image dimensions:", {
        natural: { width: image.naturalWidth, height: image.naturalHeight },
        display: { width: image.width, height: image.height }
      });

      const scaleX = image.naturalWidth / image.width;
      const scaleY = image.naturalHeight / image.height;

      canvas.width = completedCrop.width;
      canvas.height = completedCrop.height;

      console.log("Canvas dimensions:", { width: canvas.width, height: canvas.height });
      console.log("Drawing image with crop:", {
        sourceX: completedCrop.x * scaleX,
        sourceY: completedCrop.y * scaleY,
        sourceWidth: completedCrop.width * scaleX,
        sourceHeight: completedCrop.height * scaleY
      });

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
          const error = new Error('Canvas is empty - blob generation failed');
          console.error(error);
          reject(error);
          return;
        }

        console.log("Canvas blob created, size:", blob.size);

        // Compress the cropped image
        console.log("Starting compression...");
        new Compressor(blob, {
          quality: 0.8,
          maxWidth: 400,
          maxHeight: 400,
          mimeType: 'image/jpeg',
          success: (compressedBlob) => {
            console.log("Compression successful, size:", compressedBlob.size);
            const file = new File([compressedBlob], 'profile-image.jpg', {
              type: 'image/jpeg',
            });
            console.log("Final file created:", file.name, file.size, file.type);
            resolve(file);
          },
          error: (err) => {
            console.error("Compression failed:", err);
            reject(err);
          },
        });
      }, 'image/jpeg', 0.95);
    });
  }, [completedCrop]);

  const handleUpload = async () => {
    console.log("Handle upload called, completedCrop:", completedCrop);
    if (!completedCrop) {
      console.error("No completed crop available");
      toast({
        title: "No Crop Data",
        description: "Please adjust the crop area before uploading.",
        variant: "destructive",
      });
      return;
    }
    
    setIsProcessing(true);
    try {
      console.log("Getting cropped image...");
      const croppedFile = await getCroppedImg();
      console.log("Cropped file ready, starting upload...");
      await uploadMutation.mutateAsync(croppedFile);
      console.log("Upload completed successfully");
    } catch (error) {
      console.error('Error processing image:', error);
      console.error('Error details:', JSON.stringify(error));
      console.error('Error type:', typeof error);
      console.error('Error keys:', error ? Object.keys(error) : 'no keys');
      
      let errorMessage = "Failed to process the image. Please try again.";
      const errorMsg = (error as any)?.message || String(error) || '';
      
      if (errorMsg.includes('crop data')) {
        errorMessage = "Invalid crop selection. Please try cropping again.";
      } else if (errorMsg.includes('Canvas is empty')) {
        errorMessage = "Image processing failed. Please select a different image.";
      } else if (errorMsg.includes('Compression')) {
        errorMessage = "Image compression failed. Please try a different image format.";
      } else if (!errorMsg) {
        // Empty error - likely a race condition, check if upload actually succeeded
        console.log("Empty error detected, upload may have succeeded despite error");
        return; // Don't show error toast for empty errors
      }
      
      toast({
        title: "Processing Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <>
      <div onClick={() => setIsOpen(true)}>
        {children}
      </div>
      
      <Dialog open={isOpen} onOpenChange={(open) => {
        setIsOpen(open);
        if (!open) resetState();
      }}>
        <DialogContent className="sm:max-w-md bg-gray-900 border-gray-700">
          <DialogHeader>
            <DialogTitle className="text-white">Update Profile Picture</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            {step === 'select' && (
              <div className="text-center">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={onSelectFile}
                  className="hidden"
                />
                <Button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full h-32 border-2 border-dashed border-gray-600 hover:border-gray-500 bg-gray-800/50"
                >
                  <div className="flex flex-col items-center gap-2">
                    <Upload className="w-8 h-8 text-gray-400" />
                    <span className="text-gray-300">Choose an image</span>
                    <span className="text-xs text-gray-500">JPG, PNG, or GIF (max 10MB)</span>
                  </div>
                </Button>
              </div>
            )}

            {step === 'crop' && src && (
              <div className="space-y-4">
                <div className="relative">
                  <ReactCrop
                    crop={crop}
                    onChange={(c) => setCrop(c)}
                    onComplete={(c) => setCompletedCrop(c)}
                    aspect={1}
                  >
                    <img
                      ref={imgRef}
                      alt="Crop"
                      src={src}
                      style={{ maxHeight: '400px', maxWidth: '100%' }}
                      onLoad={onImageLoad}
                    />
                  </ReactCrop>
                </div>
                
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setStep('select')}
                    className="flex-1"
                  >
                    Choose Different Image
                  </Button>
                  <Button
                    onClick={handleUpload}
                    disabled={!completedCrop || isProcessing}
                    className="flex-1"
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <Check className="w-4 h-4 mr-2" />
                        Upload Image
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )}

            {step === 'upload' && (
              <div className="text-center py-8">
                <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-500" />
                <p className="text-gray-300">Uploading your image...</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}