import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ObjectUploader } from "./ObjectUploader";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Camera } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { UploadResult } from "@uppy/core";
import imageCompression from "browser-image-compression";

interface ProfileImageUploaderProps {
  currentImageUrl?: string;
  userName?: string;
  className?: string;
}

export function ProfileImageUploader({ currentImageUrl, userName, className }: ProfileImageUploaderProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [uploading, setUploading] = useState(false);

  const uploadImageMutation = useMutation({
    mutationFn: async (imageURL: string) => {
      const response = await apiRequest("PUT", "/api/profile/image", { imageURL });
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      toast({
        title: "Success",
        description: "Profile image updated successfully",
      });
      setUploading(false);
    },
    onError: (error: any) => {
      console.error("Error updating profile image:", error);
      toast({
        title: "Error",
        description: "Failed to update profile image",
        variant: "destructive",
      });
      setUploading(false);
    },
  });

  const handleGetUploadParameters = async () => {
    try {
      const response = await apiRequest("POST", "/api/objects/upload") as { uploadURL: string };
      return {
        method: "PUT" as const,
        url: response.uploadURL,
      };
    } catch (error) {
      console.error("Failed to get upload URL:", error);
      toast({
        title: "Upload Error",
        description: "Failed to prepare image upload. Please try again.",
        variant: "destructive",
      });
      throw error;
    }
  };

  const handleUploadComplete = (result: UploadResult<Record<string, unknown>, Record<string, unknown>>) => {
    if (result.successful && result.successful.length > 0) {
      const uploadedFile = result.successful[0];
      if (uploadedFile.uploadURL) {
        setUploading(true);
        uploadImageMutation.mutate(uploadedFile.uploadURL as string);
      }
    }
  };

  const initials = userName
    ? userName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : 'U';

  return (
    <div className={`relative ${className}`}>
      <Avatar className="w-24 h-24">
        <AvatarImage src={currentImageUrl} alt="Profile" />
        <AvatarFallback className="text-lg">{initials}</AvatarFallback>
      </Avatar>
      
      <ObjectUploader
        maxNumberOfFiles={1}
        maxFileSize={2097152} // 2MB limit
        onGetUploadParameters={handleGetUploadParameters}
        onComplete={handleUploadComplete}
        buttonClassName="absolute -bottom-2 -right-2 rounded-full w-8 h-8 p-0 bg-blue-600 hover:bg-blue-700"
        compressionOptions={{
          maxSizeMB: 1,
          maxWidthOrHeight: 800,
          useWebWorker: true,
        }}
      >
        <Camera className="w-4 h-4 text-white" />
      </ObjectUploader>

      {uploading && (
        <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
          <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
        </div>
      )}
    </div>
  );
}