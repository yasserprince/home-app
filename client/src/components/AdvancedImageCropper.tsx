import { useState, useRef, useCallback } from 'react';
import ReactCrop, { type Crop, centerCrop, makeAspectCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { RotateCw, RotateCcw, Crop as CropIcon, Download, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface AdvancedImageCropperProps {
  isOpen: boolean;
  onClose: () => void;
  imageSrc: string;
  onCropComplete: (croppedImageBlob: Blob) => void;
  aspectRatio?: number;
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
        width: 90,
      },
      aspect,
      mediaWidth,
      mediaHeight,
    ),
    mediaWidth,
    mediaHeight,
  )
}

export function AdvancedImageCropper({
  isOpen,
  onClose,
  imageSrc,
  onCropComplete,
  aspectRatio = 1, // Square by default for profile images
}: AdvancedImageCropperProps) {
  const { toast } = useToast();
  const imgRef = useRef<HTMLImageElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<Crop>();
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [saturation, setSaturation] = useState(100);
  const [rotation, setRotation] = useState(0);
  const [scale, setScale] = useState(1);

  const onImageLoad = useCallback((e: React.SyntheticEvent<HTMLImageElement>) => {
    const { width, height } = e.currentTarget;
    setCrop(centerAspectCrop(width, height, aspectRatio));
  }, [aspectRatio]);

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

    // Set canvas size to match crop
    canvas.width = cropWidth;
    canvas.height = cropHeight;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Apply transformations
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

  const handleCropComplete = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      toast({
        title: "Error",
        description: "Unable to process image. Please try again.",
        variant: "destructive",
      });
      return;
    }

    applyFilters();

    canvas.toBlob(
      (blob) => {
        if (!blob) {
          toast({
            title: "Error",
            description: "Failed to process image. Please try again.",
            variant: "destructive",
          });
          return;
        }
        onCropComplete(blob);
        onClose();
      },
      'image/jpeg',
      0.9
    );
  }, [applyFilters, onCropComplete, onClose, toast]);

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
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-auto bg-gray-900 border-gray-700">
        <DialogHeader>
          <DialogTitle className="text-white flex items-center gap-2">
            <CropIcon className="w-5 h-5" />
            Crop & Edit Your Profile Picture
          </DialogTitle>
          <div className="text-gray-400 text-sm">
            Adjust your image with professional editing tools
          </div>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Image Area */}
          <div className="lg:col-span-2 space-y-4">
            <div className="relative bg-black rounded-lg overflow-hidden flex justify-center items-center min-h-[400px]">
              <ReactCrop
                crop={crop}
                onChange={(_, percentCrop) => setCrop(percentCrop)}
                onComplete={(c) => setCompletedCrop(c)}
                aspect={aspectRatio}
                circularCrop={aspectRatio === 1}
                className="w-full h-full flex justify-center items-center"
              >
                <img
                  ref={imgRef}
                  alt="Crop preview"
                  src={imageSrc}
                  onLoad={onImageLoad}
                  className="max-w-full max-h-[400px] object-contain"
                  style={{
                    transform: `scale(${scale}) rotate(${rotation}deg)`,
                    filter: `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%)`,
                  }}
                />
              </ReactCrop>
            </div>

            {/* Preview Canvas (hidden) */}
            <canvas
              ref={canvasRef}
              className="hidden"
            />

            {/* Action Buttons */}
            <div className="flex gap-2 justify-center">
              <Button
                variant="outline"
                size="sm"
                onClick={rotateLeft}
                className="bg-gray-800 border-gray-600 text-white hover:bg-gray-700 hover:border-gray-500"
              >
                <RotateCcw className="w-4 h-4 mr-1" />
                Rotate Left
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={rotateRight}
                className="bg-gray-800 border-gray-600 text-white hover:bg-gray-700 hover:border-gray-500"
              >
                <RotateCw className="w-4 h-4 mr-1" />
                Rotate Right
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={resetFilters}
                className="bg-gray-800 border-gray-600 text-white hover:bg-gray-700 hover:border-gray-500"
              >
                Reset
              </Button>
            </div>
          </div>

          {/* Controls Panel */}
          <div className="space-y-6">
            <Card className="bg-gray-800 border-gray-700">
              <CardContent className="p-4 space-y-4">
                <h3 className="text-white font-semibold mb-4">Adjustments</h3>
                
                {/* Brightness */}
                <div className="space-y-2">
                  <Label className="text-white text-sm">Brightness</Label>
                  <Slider
                    value={[brightness]}
                    onValueChange={(value) => setBrightness(value[0])}
                    max={200}
                    min={0}
                    step={1}
                    className="w-full"
                  />
                  <div className="text-white/70 text-xs text-center">{brightness}%</div>
                </div>

                {/* Contrast */}
                <div className="space-y-2">
                  <Label className="text-white text-sm">Contrast</Label>
                  <Slider
                    value={[contrast]}
                    onValueChange={(value) => setContrast(value[0])}
                    max={200}
                    min={0}
                    step={1}
                    className="w-full"
                  />
                  <div className="text-white/70 text-xs text-center">{contrast}%</div>
                </div>

                {/* Saturation */}
                <div className="space-y-2">
                  <Label className="text-white text-sm">Saturation</Label>
                  <Slider
                    value={[saturation]}
                    onValueChange={(value) => setSaturation(value[0])}
                    max={200}
                    min={0}
                    step={1}
                    className="w-full"
                  />
                  <div className="text-white/70 text-xs text-center">{saturation}%</div>
                </div>

                {/* Scale */}
                <div className="space-y-2">
                  <Label className="text-white text-sm">Zoom</Label>
                  <Slider
                    value={[scale]}
                    onValueChange={(value) => setScale(value[0])}
                    max={3}
                    min={0.1}
                    step={0.1}
                    className="w-full"
                  />
                  <div className="text-white/70 text-xs text-center">{Math.round(scale * 100)}%</div>
                </div>
              </CardContent>
            </Card>

            {/* Final Actions */}
            <div className="space-y-3">
              <Button
                onClick={handleCropComplete}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white border-0"
                size="lg"
              >
                <Download className="w-4 h-4 mr-2" />
                Apply Changes
              </Button>
              <Button
                onClick={onClose}
                variant="outline"
                className="w-full bg-gray-800 border-gray-600 text-white hover:bg-gray-700 hover:border-gray-500"
              >
                <X className="w-4 h-4 mr-2" />
                Cancel
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}