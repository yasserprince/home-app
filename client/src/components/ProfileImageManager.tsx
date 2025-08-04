import React, { useState, useRef } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Camera, Loader2, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

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
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [showDialog, setShowDialog] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
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

  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
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
        imageURL: uploadURL
      });
      
      return await response.json();
    },
    onSuccess: (data) => {
      // Update cache with new user data
      if (data.user) {
        queryClient.setQueryData(["/api/auth/user"], data.user);
      }
      
      // Clear preview and close dialog
      setPreviewUrl(null);
      setShowDialog(false);
      
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
    },
    onSettled: () => {
      setIsUploading(false);
    }
  });

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

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreviewUrl(e.target?.result as string);
      setShowDialog(true);
    };
    reader.readAsDataURL(file);
  };

  const handleUpload = () => {
    const file = fileInputRef.current?.files?.[0];
    if (!file) return;

    setIsUploading(true);
    uploadMutation.mutate(file);
  };

  const handleCancel = () => {
    setPreviewUrl(null);
    setShowDialog(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
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

      {/* Preview Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="sm:max-w-md bg-gray-900 border-gray-700">
          <DialogHeader>
            <DialogTitle className="text-white">Update Profile Picture</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            {previewUrl && (
              <div className="flex justify-center">
                <div className="relative">
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="w-32 h-32 rounded-full object-cover border-4 border-white/20"
                  />
                </div>
              </div>
            )}
            
            <div className="flex gap-2 justify-end">
              <Button
                variant="outline"
                onClick={handleCancel}
                disabled={isUploading}
                className="border-gray-600 text-white hover:bg-gray-800"
              >
                Cancel
              </Button>
              <Button
                onClick={handleUpload}
                disabled={isUploading || !previewUrl}
                className="bg-blue-500 hover:bg-blue-600 text-white"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  'Update Picture'
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}