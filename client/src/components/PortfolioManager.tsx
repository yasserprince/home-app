import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ObjectUploader } from "./ObjectUploader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { 
  Camera, 
  Plus, 
  Trash2, 
  Edit, 
  Save, 
  X, 
  Image as ImageIcon,
  Award,
  Briefcase,
  Star 
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { UploadResult } from "@uppy/core";

interface PortfolioManagerProps {
  userId: string;
  isProvider: boolean;
}

export function PortfolioManager({ userId, isProvider }: PortfolioManagerProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [uploading, setUploading] = useState(false);
  const [editingAchievements, setEditingAchievements] = useState(false);
  const [achievements, setAchievements] = useState("");

  // Fetch service provider data if user is a provider
  const { data: serviceProvider } = useQuery<any>({
    queryKey: [`/api/service-providers/user/${userId}`],
    enabled: isProvider,
  });

  const uploadPortfolioMutation = useMutation({
    mutationFn: async (imageURLs: string[]) => {
      const response = await apiRequest("PUT", "/api/profile/portfolio", { imageURLs });
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/service-providers/user/${userId}`] });
      toast({
        title: "Success",
        description: "Portfolio images uploaded successfully",
      });
      setUploading(false);
    },
    onError: (error: any) => {
      console.error("Error uploading portfolio images:", error);
      toast({
        title: "Error",
        description: "Failed to upload portfolio images",
        variant: "destructive",
      });
      setUploading(false);
    },
  });

  const updateAchievementsMutation = useMutation({
    mutationFn: async (achievementsData: string) => {
      const response = await apiRequest("PUT", `/api/service-providers/${serviceProvider?.id}`, { 
        achievements: achievementsData 
      });
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/service-providers/user/${userId}`] });
      toast({
        title: "Success",
        description: "Professional achievements updated successfully",
      });
      setEditingAchievements(false);
    },
    onError: (error: any) => {
      console.error("Error updating achievements:", error);
      toast({
        title: "Error",
        description: "Failed to update achievements",
        variant: "destructive",
      });
    },
  });

  const handleGetUploadParameters = async () => {
    const response = await apiRequest("POST", "/api/objects/upload");
    return {
      method: "PUT" as const,
      url: response.uploadURL,
    };
  };

  const handleUploadComplete = (result: UploadResult<Record<string, unknown>, Record<string, unknown>>) => {
    if (result.successful && result.successful.length > 0) {
      const uploadedURLs = result.successful
        .map(file => file.uploadURL)
        .filter((url): url is string => typeof url === 'string');
      if (uploadedURLs.length > 0) {
        setUploading(true);
        uploadPortfolioMutation.mutate(uploadedURLs);
      }
    }
  };

  const handleSaveAchievements = () => {
    updateAchievementsMutation.mutate(achievements);
  };

  const startEditingAchievements = () => {
    setAchievements(serviceProvider?.achievements || "");
    setEditingAchievements(true);
  };

  if (!isProvider) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Portfolio Images */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ImageIcon className="h-5 w-5" />
              <CardTitle>Portfolio Images</CardTitle>
            </div>
            <ObjectUploader
              maxNumberOfFiles={5}
              maxFileSize={10485760} // 10MB
              onGetUploadParameters={handleGetUploadParameters}
              onComplete={handleUploadComplete}
              buttonClassName="flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Images
            </ObjectUploader>
          </div>
        </CardHeader>
        <CardContent>
          {serviceProvider?.portfolioImages && serviceProvider.portfolioImages.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {serviceProvider.portfolioImages.map((imageUrl: string, index: number) => (
                <div key={index} className="relative">
                  <img
                    src={imageUrl}
                    alt={`Portfolio ${index + 1}`}
                    className="w-full h-32 object-cover rounded-lg border"
                  />
                  <Button
                    variant="destructive"
                    size="sm"
                    className="absolute top-2 right-2 p-1 h-7 w-7"
                    onClick={async () => {
                      try {
                        const updatedImages = serviceProvider.portfolioImages?.filter((_: any, i: number) => i !== index) || [];
                        await apiRequest("PUT", `/api/service-providers/${serviceProvider.id}`, { 
                          portfolioImages: updatedImages 
                        });
                        queryClient.invalidateQueries({ queryKey: [`/api/service-providers/user/${userId}`] });
                        toast({
                          title: "Success",
                          description: "Image removed from portfolio",
                        });
                      } catch (error) {
                        toast({
                          title: "Error",
                          description: "Failed to remove image",
                          variant: "destructive",
                        });
                      }
                    }}
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <ImageIcon className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No portfolio images yet. Upload some images to showcase your work!</p>
            </div>
          )}

          {uploading && (
            <div className="flex items-center justify-center py-4">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                <span className="text-sm text-muted-foreground">Uploading images...</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Professional Achievements */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Award className="h-5 w-5" />
              <CardTitle>Professional Achievements</CardTitle>
            </div>
            {!editingAchievements && (
              <Button
                variant="outline"
                size="sm"
                onClick={startEditingAchievements}
                className="flex items-center gap-2"
              >
                <Edit className="w-4 h-4" />
                Edit
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {editingAchievements ? (
            <div className="space-y-4">
              <div>
                <Label htmlFor="achievements">
                  Achievements & Qualifications
                </Label>
                <Textarea
                  id="achievements"
                  value={achievements}
                  onChange={(e) => setAchievements(e.target.value)}
                  placeholder="Describe your professional achievements, certifications, awards, and qualifications..."
                  rows={6}
                  className="resize-none"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Share your credentials, certifications, awards, and professional accomplishments
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={handleSaveAchievements}
                  disabled={updateAchievementsMutation.isPending}
                  className="flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  {updateAchievementsMutation.isPending ? "Saving..." : "Save"}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setEditingAchievements(false)}
                >
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <div>
              {serviceProvider?.achievements ? (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="whitespace-pre-wrap">{serviceProvider.achievements}</p>
                </div>
              ) : (
                <div className="text-center py-6 text-muted-foreground">
                  <Award className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No achievements listed yet. Add your professional credentials and accomplishments!</p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Professional Stats */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Briefcase className="h-5 w-5" />
            <CardTitle>Professional Summary</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {serviceProvider?.experienceYears || 0}
              </div>
              <div className="text-sm text-muted-foreground">Years Experience</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600 flex items-center justify-center gap-1">
                <Star className="w-5 h-5 fill-current" />
                {serviceProvider?.rating || "0.0"}
              </div>
              <div className="text-sm text-muted-foreground">Average Rating</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">
                {serviceProvider?.reviewCount || 0}
              </div>
              <div className="text-sm text-muted-foreground">Reviews</div>
            </div>
            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <div className="text-2xl font-bold text-orange-600">
                {serviceProvider?.portfolioImages?.length || 0}
              </div>
              <div className="text-sm text-muted-foreground">Portfolio Images</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}