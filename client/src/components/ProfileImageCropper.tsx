import { useState, useRef, useCallback, useEffect } from 'react';
import ReactCrop, { type Crop, centerCrop, makeAspectCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { RotateCw, RotateCcw, Upload, Check, X, Crop as CropIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import Compressor from 'compressorjs';

interface ProfileImageCropperProps {
  children: React.ReactNode;
  onSuccess?: (imageUrl: string) => void;
}

function centerAspectCrop(
  mediaWidth: number,
  mediaHeight: number,
  aspect: number,
) {
  return centerCrop(
    makeAspectCrop(
      {
        unit: '%',
        width: 80,
      },
      aspect,
      mediaWidth,
      mediaHeight,
    ),
    mediaWidth,
    mediaHeight,
  )
}

export function ProfileImageCropper({ children, onSuccess }: ProfileImageCropperProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const imgRef = useRef<HTMLImageElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [isOpen, setIsOpen] = useState(false);
  const [src, setSrc] = useState<string>('');
  const [step, setStep] = useState<'select' | 'crop' | 'upload'>('select');
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<Crop>();
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [saturation, setSaturation] = useState(100);
  const [rotation, setRotation] = useState(0);
  const [scale, setScale] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);

  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      setStep('upload');
      
      // Get upload URL
      const uploadResponse = await apiRequest("POST", "/api/objects/upload");
      const uploadData = await uploadResponse.json();
      const { uploadURL } = uploadData;
      
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
        const errorText = await uploadResult.text();
        throw new Error(`Upload failed with status: ${uploadResult.status} - ${errorText}`);
      }

      // Set ACL policy and update profile
      const response = await apiRequest("PUT", "/api/profile/image", { 
        imageURL: uploadURL.split('?')[0] // Remove query params for ACL setting
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update profile image');
      }
      
      const result = await response.json();
      return result;
    },
    onSuccess: (data) => {
      toast({
        title: "Success!",
        description: "Your profile picture has been updated successfully.",
        variant: "default",
      });
      
      // Invalidate user query to refetch updated data
      queryClient.invalidateQueries({ queryKey: ['/api/auth/user'] });
      
      onSuccess?.(data.objectPath);
      resetState();
      setIsOpen(false);
    },
    onError: (error: any) => {
      let errorMessage = "Failed to upload image. Please try again.";
      const errorMsg = error?.message || String(error);
      
      if (errorMsg.includes("413")) {
        errorMessage = "Image is too large. Please choose a smaller image.";
      } else if (errorMsg.includes("401")) {
        errorMessage = "Authentication expired. Please refresh and try again.";
      }
      
      toast({
        title: "Upload Failed",
        description: errorMessage,
        variant: "destructive",
      });
      setStep('crop');
    },
  });

  const onImageLoad = useCallback((e: React.SyntheticEvent<HTMLImageElement>) => {
    const { width, height } = e.currentTarget;
    setCrop(centerAspectCrop(width, height, 1));
  }, []);

  const resetState = () => {
    setSrc('');
    setCrop(undefined);
    setCompletedCrop(undefined);
    setBrightness(100);
    setContrast(100);
    setSaturation(100);
    setRotation(0);
    setScale(1);
    setStep('select');
    setIsProcessing(false);
  };

  const onSelectFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      
      if (!file.type.startsWith('image/')) {
        toast({
          title: "Invalid File",
          description: "Please select a valid image file.",
          variant: "destructive",
        });
        return;
      }
      
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

  const applyFilters = useCallback(() => {
    const canvas = canvasRef.current;
    const image = imgRef.current;
    
    if (!canvas || !image || !completedCrop) {
      return;
    }

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      return;
    }

    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;

    const cropX = completedCrop.x * scaleX;
    const cropY = completedCrop.y * scaleY;
    const cropWidth = completedCrop.width * scaleX;
    const cropHeight = completedCrop.height * scaleY;

    canvas.width = cropWidth;
    canvas.height = cropHeight;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();
    
    // Apply filters
    ctx.filter = `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%)`;
    
    // Apply rotation if any
    if (rotation !== 0) {
      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.rotate((rotation * Math.PI) / 180);
      ctx.translate(-canvas.width / 2, -canvas.height / 2);
    }

    // Draw the cropped image
    ctx.drawImage(
      image,
      cropX,
      cropY,
      cropWidth,
      cropHeight,
      0,
      0,
      canvas.width,
      canvas.height
    );

    ctx.restore();
  }, [completedCrop, brightness, contrast, saturation, rotation]);

  const handleCropComplete = useCallback(async () => {
    const canvas = canvasRef.current;
    if (!canvas) {
      toast({
        title: "Error",
        description: "Unable to process image. Please try again.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    applyFilters();

    canvas.toBlob(
      (blob) => {
        if (!blob) {
          toast({
            title: "Error",
            description: "Failed to process image. Please try again.",
            variant: "destructive",
          });
          setIsProcessing(false);
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
            uploadMutation.mutate(file);
          },
          error: (err) => {
            console.error("Compression failed:", err);
            toast({
              title: "Error",
              description: "Failed to compress image. Please try again.",
              variant: "destructive",
            });
            setIsProcessing(false);
          },
        });
      },
      'image/jpeg',
      0.9
    );
  }, [applyFilters, uploadMutation, toast]);

  const resetFilters = () => {
    setBrightness(100);
    setContrast(100);
    setSaturation(100);
    setRotation(0);
    setScale(1);
  };

  const rotateLeft = () => setRotation(prev => prev - 90);
  const rotateRight = () => setRotation(prev => prev + 90);

  return (
    <>
      <div onClick={() => setIsOpen(true)} className="cursor-pointer">
        {children}
      </div>
      
      <Dialog open={isOpen} onOpenChange={(open) => {
        setIsOpen(open);
        if (!open) resetState();
      }}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-auto bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 border border-white/10">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-3 text-xl">
              <div className="p-2 bg-white/10 rounded-lg backdrop-blur-sm">
                <CropIcon className="w-5 h-5" />
              </div>
              Crop Your Profile Picture
            </DialogTitle>
            <div className="text-gray-300 text-sm">
              Adjust and enhance your profile image with professional editing tools
            </div>
          </DialogHeader>

          <div className="space-y-6">
            {step === 'select' && (
              <div className="text-center py-8">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={onSelectFile}
                  className="hidden"
                />
                <Button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full max-w-md h-40 border-2 border-dashed border-white/20 hover:border-white/30 bg-white/5 hover:bg-white/10 backdrop-blur-sm transition-all duration-300"
                >
                  <div className="flex flex-col items-center gap-4">
                    <div className="p-4 bg-white/10 rounded-full">
                      <Upload className="w-8 h-8 text-white" />
                    </div>
                    <div className="space-y-1">
                      <span className="text-white font-medium">Choose an image</span>
                      <div className="text-gray-300 text-sm">JPG, PNG, or GIF (max 10MB)</div>
                    </div>
                  </div>
                </Button>
              </div>
            )}

            {step === 'crop' && src && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Image Area */}
                <div className="lg:col-span-2 space-y-4">
                  <div className="relative bg-black/50 rounded-xl overflow-hidden backdrop-blur-sm border border-white/10 flex justify-center items-center min-h-[400px]">
                    <ReactCrop
                      crop={crop}
                      onChange={(_, percentCrop) => setCrop(percentCrop)}
                      onComplete={(c) => setCompletedCrop(c)}
                      aspect={1}
                      circularCrop={true}
                      className="w-full h-full flex justify-center items-center"
                    >
                      <img
                        ref={imgRef}
                        alt="Crop preview"
                        src={src}
                        onLoad={onImageLoad}
                        className="max-w-full max-h-[400px] object-contain"
                        style={{
                          transform: `scale(${scale}) rotate(${rotation}deg)`,
                          filter: `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%)`,
                        }}
                      />
                    </ReactCrop>
                  </div>

                  <canvas ref={canvasRef} className="hidden" />

                  {/* Action Buttons */}
                  <div className="flex gap-3 justify-center">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={rotateLeft}
                      className="bg-white/10 border-white/20 text-white hover:bg-white/20 hover:border-white/30 backdrop-blur-sm"
                    >
                      <RotateCcw className="w-4 h-4 mr-2" />
                      Rotate Left
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={rotateRight}
                      className="bg-white/10 border-white/20 text-white hover:bg-white/20 hover:border-white/30 backdrop-blur-sm"
                    >
                      <RotateCw className="w-4 h-4 mr-2" />
                      Rotate Right
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={resetFilters}
                      className="bg-white/10 border-white/20 text-white hover:bg-white/20 hover:border-white/30 backdrop-blur-sm"
                    >
                      Reset Filters
                    </Button>
                  </div>
                </div>

                {/* Controls Panel */}
                <div className="space-y-4">
                  <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
                    <CardContent className="p-6 space-y-6">
                      <h3 className="text-white font-semibold text-lg mb-4">Adjustments</h3>
                      
                      {/* Brightness */}
                      <div className="space-y-3">
                        <Label className="text-white text-sm font-medium">Brightness</Label>
                        <Slider
                          value={[brightness]}
                          onValueChange={(value) => setBrightness(value[0])}
                          max={200}
                          min={0}
                          step={1}
                          className="w-full"
                        />
                        <div className="text-white/70 text-xs text-center bg-white/5 rounded px-2 py-1">{brightness}%</div>
                      </div>

                      {/* Contrast */}
                      <div className="space-y-3">
                        <Label className="text-white text-sm font-medium">Contrast</Label>
                        <Slider
                          value={[contrast]}
                          onValueChange={(value) => setContrast(value[0])}
                          max={200}
                          min={0}
                          step={1}
                          className="w-full"
                        />
                        <div className="text-white/70 text-xs text-center bg-white/5 rounded px-2 py-1">{contrast}%</div>
                      </div>

                      {/* Saturation */}
                      <div className="space-y-3">
                        <Label className="text-white text-sm font-medium">Saturation</Label>
                        <Slider
                          value={[saturation]}
                          onValueChange={(value) => setSaturation(value[0])}
                          max={200}
                          min={0}
                          step={1}
                          className="w-full"
                        />
                        <div className="text-white/70 text-xs text-center bg-white/5 rounded px-2 py-1">{saturation}%</div>
                      </div>

                      {/* Scale */}
                      <div className="space-y-3">
                        <Label className="text-white text-sm font-medium">Zoom</Label>
                        <Slider
                          value={[scale]}
                          onValueChange={(value) => setScale(value[0])}
                          max={3}
                          min={0.1}
                          step={0.1}
                          className="w-full"
                        />
                        <div className="text-white/70 text-xs text-center bg-white/5 rounded px-2 py-1">{Math.round(scale * 100)}%</div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Final Actions */}
                  <div className="space-y-3">
                    <Button
                      onClick={() => setStep('select')}
                      variant="outline"
                      className="w-full bg-white/10 border-white/20 text-white hover:bg-white/20 hover:border-white/30 backdrop-blur-sm"
                    >
                      Choose Different Image
                    </Button>
                    <Button
                      onClick={handleCropComplete}
                      disabled={!completedCrop || isProcessing || uploadMutation.isPending}
                      className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-0 shadow-lg"
                      size="lg"
                    >
                      {isProcessing || uploadMutation.isPending ? (
                        <>
                          <div className="w-4 h-4 mr-2 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <Check className="w-4 h-4 mr-2" />
                          Apply & Save
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {step === 'upload' && (
              <div className="text-center py-12">
                <div className="w-16 h-16 mx-auto mb-6 border-4 border-white/20 border-t-white rounded-full animate-spin" />
                <h3 className="text-white text-lg font-medium mb-2">Uploading your image...</h3>
                <p className="text-gray-300">This may take a moment</p>
              </div>
            )}

            {/* Cancel Button */}
            <div className="flex justify-center pt-4">
              <Button
                onClick={() => {
                  setIsOpen(false);
                  resetState();
                }}
                variant="ghost"
                className="text-white/70 hover:text-white hover:bg-white/10"
              >
                <X className="w-4 h-4 mr-2" />
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}