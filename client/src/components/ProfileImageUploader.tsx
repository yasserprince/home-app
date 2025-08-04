import { useState, useRef } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Camera } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { AdvancedImageCropper } from "./AdvancedImageCropper";
import imageCompression from "browser-image-compression";

interface ProfileImageUploaderProps {
  currentImageUrl?: string;
  userName?: string;
  className?: string;
}

export function ProfileImageUploader({ currentImageUrl, userName, className }: ProfileImageUploaderProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [showCropper, setShowCropper] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string>("");

  const uploadImageMutation = useMutation({
    mutationFn: async (imageBlob: Blob) => {
      // Compress the image before upload
      const compressedBlob = await imageCompression(imageBlob as File, {
        maxSizeMB: 1,
        maxWidthOrHeight: 400,
        useWebWorker: true,
        fileType: 'image/jpeg',
      });

      // Get upload URL
      const uploadResponse = await apiRequest("POST", "/api/objects/upload");
      const uploadURL = (uploadResponse as any).uploadURL;
      
      // Upload to object storage
      const uploadResult = await fetch(uploadURL, {
        method: "PUT",
        body: compressedBlob,
        headers: {
          'Content-Type': 'image/jpeg',
        },
      });

      if (!uploadResult.ok) {
        throw new Error('Failed to upload image');
      }

      // Set ACL policy and update profile with the presigned URL that we just uploaded to
      console.log("Upload successful, now setting ACL policy with URL:", uploadURL);
      const response = await apiRequest("PUT", "/api/profile/image", { 
        imageURL: uploadURL
      });
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      toast({
        title: "Success",
        description: "Profile image updated successfully! Your new picture looks great.",
      });
      setUploading(false);
    },
    onError: (error: any) => {
      console.error("Error updating profile image:", error);
      let errorMessage = "Unable to update your profile image. Please try again.";
      
      if (error.message?.includes("401")) {
        errorMessage = "You need to be logged in to upload images. Please refresh and try again.";
      } else if (error.message?.includes("413") || error.message?.includes("too large")) {
        errorMessage = "The image file is too large. Please choose a smaller image.";
      } else if (error.message?.includes("network") || error.message?.includes("fetch")) {
        errorMessage = "Network error. Please check your connection and try again.";
      } else if (error.message?.includes("format") || error.message?.includes("type")) {
        errorMessage = "Invalid image format. Please use JPG, PNG, or similar image files.";
      }
      
      toast({
        title: "Upload Failed",
        description: errorMessage,
        variant: "destructive",
      });
      setUploading(false);
    },
  });

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid File",
        description: "Please select an image file (JPG, PNG, etc.)",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "File Too Large",
        description: "Please select an image smaller than 10MB",
        variant: "destructive",
      });
      return;
    }

    // Create preview URL and show cropper
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        setSelectedImage(e.target.result as string);
        setShowCropper(true);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleCropComplete = (croppedBlob: Blob) => {
    setUploading(true);
    uploadImageMutation.mutate(croppedBlob);
    setShowCropper(false);
    setSelectedImage("");
  };

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  const initials = userName
    ?.split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase() || 'U';

  return (
    <div className={className}>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />
      
      <div className="relative group">
        <Avatar className="w-24 h-24 ring-4 ring-white/20 transition-all duration-200 group-hover:ring-blue-400/50">
          <AvatarImage 
            src={currentImageUrl || ''} 
            alt={userName || 'Profile'} 
            className="object-cover"
          />
          <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-2xl font-bold">
            {initials}
          </AvatarFallback>
        </Avatar>
        
        {/* Overlay button */}
        <div className="absolute inset-0 bg-black/60 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
          <Button
            onClick={triggerFileSelect}
            disabled={uploading}
            size="sm"
            className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg"
          >
            {uploading ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                <span>Uploading...</span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Camera className="w-4 h-4" />
                <span>Change</span>
              </div>
            )}
          </Button>
        </div>
      </div>

      {/* Advanced Image Cropper Modal */}
      <AdvancedImageCropper
        isOpen={showCropper}
        onClose={() => {
          setShowCropper(false);
          setSelectedImage("");
        }}
        imageSrc={selectedImage}
        onCropComplete={handleCropComplete}
        aspectRatio={1} // Square for profile pictures
      />
    </div>
  );
}