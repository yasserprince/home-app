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
}

export function ModernImageUploader({ children }: ModernImageUploaderProps) {
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
      setStep('upload');
      
      // Get upload URL
      const uploadResponse = await apiRequest("POST", "/api/objects/upload");
      const { uploadURL } = uploadResponse as any;
      
      if (!uploadURL) {
        throw new Error('Failed to get upload URL from server');
      }
      
      // Upload to object storage
      const uploadResult = await fetch(uploadURL, {
        method: "PUT",
        body: file,
        headers: {
          'Content-Type': file.type,
        },
      });

      if (!uploadResult.ok) {
        throw new Error(`Upload failed with status: ${uploadResult.status}`);
      }

      // Set ACL policy and update profile
      const response = await apiRequest("PUT", "/api/profile/image", { 
        imageURL: uploadURL
      });
      
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      toast({
        title: "Success!",
        description: "Your profile picture has been updated successfully.",
      });
      setIsOpen(false);
      resetState();
    },
    onError: (error: any) => {
      console.error("Upload error:", error);
      let errorMessage = "Failed to upload image. Please try again.";
      
      if (error.message?.includes("upload URL")) {
        errorMessage = "Server configuration error. Please contact support.";
      } else if (error.message?.includes("401")) {
        errorMessage = "Authentication expired. Please refresh and try again.";
      } else if (error.message?.includes("413")) {
        errorMessage = "Image is too large. Please choose a smaller image.";
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
      if (!completedCrop || !imgRef.current) {
        reject(new Error('No crop data available'));
        return;
      }

      const image = imgRef.current;
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        reject(new Error('Could not get canvas context'));
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

  const handleUpload = async () => {
    if (!completedCrop) return;
    
    setIsProcessing(true);
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