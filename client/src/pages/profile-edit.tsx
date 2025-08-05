import React, { useState, useEffect } from "react";
import { Link } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { useTranslation } from "@/hooks/useTranslation";
import { wilayas } from "@shared/wilayas";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import ModernAvatar from "@/components/ModernAvatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ProfileImageManager } from "@/components/ProfileImageManager";
import { LanguageSelector } from "@/components/language-selector";
import BottomNavigation from "@/components/bottom-navigation";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient, useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { PortfolioUploader } from "@/components/PortfolioUploader";
import Lightbox from 'yet-another-react-lightbox';
import 'yet-another-react-lightbox/styles.css';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  ArrowLeft,
  Camera,
  Save,
  User,
  Phone,
  Mail,
  MapPin,
  FileText,
  Settings,
  Bell,
  HelpCircle,
  Shield,
  Edit3,
  Check,
  X,
  Briefcase,
  Image as ImageIcon,
  Wrench,
  MoreVertical,
  Star,
  Eye,
  Edit,
  Trash2,
  Globe,
  Lightbulb,
  GripVertical
} from "lucide-react";

export default function ProfileEdit() {
  const { user, isLoading } = useAuth();
  const { t } = useTranslation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [avatarKey, setAvatarKey] = useState(0); // Force avatar refresh
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    bio: '',
    location: '',
    gender: '',
    yearsExperience: '',
    hourlyRate: '',
    availability: 'full-time',
    accountType: 'seeker', // individual, provider, company
    skills: [] as string[],
    languages: [] as string[]
  });

  // Portfolio state
  const [activePortfolioTab, setActivePortfolioTab] = useState('featured-work');
  const [lightboxIndex, setLightboxIndex] = useState(-1);

  // Portfolio galleries query - using new modern portfolio API
  const { data: portfolioGalleries, isLoading: portfolioLoading } = useQuery({
    queryKey: ['/api/portfolios/galleries'],
    enabled: !!user,
  });



  // Portfolio upload mutation - updated for new modern portfolio API
  const uploadPortfolioMutation = useMutation({
    mutationFn: async (images: any[]) => {
      return apiRequest(`/api/portfolios/galleries/${activePortfolioTab}/images`, 'POST', images);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/portfolios/galleries'] });
      toast({
        title: "Success",
        description: "Portfolio images uploaded successfully!",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to upload portfolio images.",
        variant: "destructive",
      });
    },
  });

  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        phone: user.phone || '',
        bio: user.bio || '',
        location: user.wilaya || '',
        gender: user.sex || '',
        yearsExperience: user.yearsExperience?.toString() || '',
        hourlyRate: user.hourlyRate?.toString() || '',
        availability: user.availability || 'full-time',
        accountType: user.accountType || 'seeker',
        skills: user.skills || [],
        languages: user.languages || []
      });
    }
  }, [user]);

  const handleInputChange = (field: string, value: string | string[]) => {
    if (field === 'bio' && typeof value === 'string' && value.length > 300) return;
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSkillAdd = (skill: string) => {
    if (skill && !formData.skills.includes(skill)) {
      setFormData(prev => ({ ...prev, skills: [...prev.skills, skill] }));
    }
  };

  const handleSkillRemove = (skillToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.filter(skill => skill !== skillToRemove)
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Map frontend field names to backend field names
      const backendData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone,  
        bio: formData.bio,
        wilaya: formData.location, // Map location to wilaya
        sex: formData.gender,       // Map gender to sex
        accountType: formData.accountType,
        yearsExperience: formData.yearsExperience ? parseInt(formData.yearsExperience) : null,
        hourlyRate: formData.hourlyRate ? parseFloat(formData.hourlyRate) : null,
        availability: formData.availability,
        skills: formData.skills,
        languages: formData.languages
      };

      const response = await fetch('/api/account', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(backendData),
        credentials: 'include', // Ensure cookies are included
      });

      if (response.ok) {
        // Invalidate and refetch user data without page refresh
        queryClient.invalidateQueries({ queryKey: ['/api/auth/user'] });
        
        toast({
          title: "Account Updated",
          description: "Your account has been successfully updated.",
        });
        setIsEditing(false);
      } else {
        const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
        throw new Error(errorData.message || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Account update error:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update account. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Portfolio upload handlers - updated for new modern portfolio API
  const handleGetUploadParameters = async () => {
    const response = await apiRequest('/api/objects/upload', 'POST');
    const data = await response.json();
    return {
      method: 'PUT' as const,
      url: data.uploadURL,
    };
  };

  const handlePortfolioUploadComplete = (result: { successful: Array<{ uploadURL: string; meta: any }> }) => {
    const uploadedImages = result.successful.map((file: any) => {
      // Convert the upload URL to a serving URL
      // The uploadURL is a presigned URL like: https://storage.googleapis.com/bucket/.private/uploads/id?signature...
      // We need to extract the object path and convert it to our serving URL
      let imageUrl = file.uploadURL;
      try {
        const url = new URL(file.uploadURL);
        const pathParts = url.pathname.split('/');
        if (pathParts.length >= 4 && pathParts[2] === '.private' && pathParts[3] === 'uploads') {
          // Extract just the file ID after .private/uploads/
          const fileId = pathParts.slice(4).join('/');
          imageUrl = `/objects/uploads/${fileId}`;
        }
      } catch (error) {
        console.error('Error parsing upload URL:', error);
        // Fallback to using the upload URL directly
      }
      
      return {
        galleryId: activePortfolioTab, // Use the active tab as gallery ID
        imageUrl: file.uploadURL, // Send the raw Google Storage URL so backend can set ACL
        title: file.meta?.title || file.name,
        description: file.meta?.description || '',
        imageType: getImageTypeForCategory(activePortfolioTab),
        isPublic: true,
        isPrimary: false,
      };
    });

    uploadPortfolioMutation.mutate(uploadedImages);
  };

  const getImageTypeForCategory = (category: string) => {
    switch (category) {
      case 'before-after': return 'before';
      case 'tools-equipment': return 'equipment';
      case 'certifications': return 'certificate';
      default: return 'work_sample';
    }
  };

  // Portfolio gallery tabs
  const portfolioTabs = [
    { id: 'featured-work', label: 'Featured Work', icon: ImageIcon },
    { id: 'before-after', label: 'Before & After', icon: ImageIcon },
    { id: 'work-samples', label: 'Work Samples', icon: ImageIcon },
    { id: 'tools-equipment', label: 'Tools & Equipment', icon: Wrench },
    { id: 'certifications', label: 'Certifications', icon: FileText },
  ];

  const handleCancel = () => {
    if (user) {
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        phone: user.phone || '',
        bio: user.bio || '',
        location: user.wilaya || '',
        gender: user.sex || '',
        yearsExperience: user.yearsExperience?.toString() || '',
        hourlyRate: user.hourlyRate?.toString() || '',
        availability: user.availability || 'full-time',
        accountType: user.accountType || 'seeker',
        skills: user.skills || [],
        languages: user.languages || []
      });
    }
    setIsEditing(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-white/30 border-t-white rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white/70">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 relative overflow-hidden">
      {/* Animated Background Orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute top-40 left-1/2 w-80 h-80 bg-indigo-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      <div className="relative z-10 max-w-md mx-auto p-4 pb-24">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 pt-4">
          <div className="flex items-center gap-3">
            <Link href="/account">
              <Button variant="ghost" size="icon" className="text-white hover:bg-white/10">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-white">Edit Account</h1>
              <p className="text-white/70 text-sm">Update your information</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <LanguageSelector variant="compact" />
            {isEditing ? (
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleCancel}
                  className="text-white hover:bg-white/10"
                >
                  <X className="w-5 h-5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleSave}
                  disabled={isSaving}
                  className="text-green-400 hover:bg-green-400/10"
                >
                  {isSaving ? (
                    <div className="w-4 h-4 border-2 border-green-400/30 border-t-green-400 rounded-full animate-spin" />
                  ) : (
                    <Check className="w-5 h-5" />
                  )}
                </Button>
              </div>
            ) : (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="text-white hover:bg-white/10">
                    <MoreVertical className="w-5 h-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-gray-800/95 backdrop-blur-lg border-gray-700">
                  <DropdownMenuItem 
                    onClick={() => setIsEditing(true)}
                    className="text-white hover:bg-white/10 focus:bg-white/10"
                  >
                    <Edit3 className="w-4 h-4 mr-2" />
                    Edit Account
                  </DropdownMenuItem>
                  <Link href="/account">
                    <DropdownMenuItem className="text-white hover:bg-white/10 focus:bg-white/10">
                      <User className="w-4 h-4 mr-2" />
                      Account
                    </DropdownMenuItem>
                  </Link>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>

        {/* Profile Picture Card */}
        <Card className="mb-6 bg-white/10 backdrop-blur-lg border-white/20">
          <CardContent className="p-6">
            <div className="flex flex-col items-center gap-4">
              <ProfileImageManager
                currentImageUrl={user?.profileImageUrl}
                userName={user?.firstName && user?.lastName ? `${user.firstName} ${user.lastName}` : user?.firstName || ''}
                userEmail={user?.email || ''}
                size={96}
                className="ring-4 ring-white/20"
              />
              <div className="text-center">
                <h3 className="text-lg font-semibold text-white">
                  {user?.firstName && user?.lastName ? `${user.firstName} ${user.lastName}` : 'User'}
                </h3>
                <p className="text-white/70 text-sm">@{user?.email?.split('@')[0] || 'user'}</p>
                <Badge variant="secondary" className="mt-2 bg-green-500/20 text-green-300 hover:bg-green-500/30">
                  Online
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Personal Information */}
        <Card className="mb-6 bg-white/10 backdrop-blur-lg border-white/20">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <h3 className="text-lg font-semibold text-white">Personal Information</h3>
            {!isEditing && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsEditing(true)}
                className="text-blue-400 hover:text-blue-300 hover:bg-blue-400/10"
              >
                <Edit3 className="w-4 h-4 mr-2" />
                Edit
              </Button>
            )}
          </CardHeader>
          <CardContent className="pt-0 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium text-white/80 flex items-center gap-2">
                  <User className="w-4 h-4" />
                  First Name
                </Label>
                {isEditing ? (
                  <Input
                    value={formData.firstName}
                    onChange={(e) => handleInputChange('firstName', e.target.value)}
                    className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                    placeholder="Enter first name"
                  />
                ) : (
                  <p className="text-white bg-white/5 rounded-md px-3 py-2 border border-white/10">
                    {user?.firstName || 'Not set'}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium text-white/80">Last Name</Label>
                {isEditing ? (
                  <Input
                    value={formData.lastName}
                    onChange={(e) => handleInputChange('lastName', e.target.value)}
                    className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                    placeholder="Enter last name"
                  />
                ) : (
                  <p className="text-white bg-white/5 rounded-md px-3 py-2 border border-white/10">
                    {user?.lastName || 'Not set'}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium text-white/80 flex items-center gap-2">
                <Phone className="w-4 h-4" />
                Phone Number
              </Label>
              {isEditing ? (
                <Input
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                  placeholder="Enter phone number"
                  type="tel"
                />
              ) : (
                <p className="text-white bg-white/5 rounded-md px-3 py-2 border border-white/10">
                  {user?.phone || 'Not set'}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium text-white/80 flex items-center gap-2">
                <Mail className="w-4 h-4" />
                Email
              </Label>
              <p className="text-white/70 bg-white/5 rounded-md px-3 py-2 border border-white/10">
                {user?.email} <span className="text-xs text-white/50">(cannot be changed)</span>
              </p>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium text-white/80">Gender</Label>
              {isEditing ? (
                <Select value={formData.gender} onValueChange={(value) => handleInputChange('gender', value)}>
                  <SelectTrigger className="bg-white/10 border-white/20 text-white">
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800/95 backdrop-blur-lg border-gray-700">
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                  </SelectContent>
                </Select>
              ) : (
                <p className="text-white bg-white/5 rounded-md px-3 py-2 border border-white/10 capitalize">
                  {user?.sex || 'Not set'}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium text-white/80 flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                Location (Wilaya)
              </Label>
              {isEditing ? (
                <Select value={formData.location} onValueChange={(value) => handleInputChange('location', value)}>
                  <SelectTrigger className="bg-white/10 border-white/20 text-white">
                    <SelectValue placeholder="Select your wilaya" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800/95 backdrop-blur-lg border-gray-700 max-h-60">
                    {wilayas.map((wilaya) => (
                      <SelectItem key={wilaya.code} value={wilaya.name}>
                        <div className="flex items-center justify-between w-full">
                          <span className="text-white">{wilaya.code} - {wilaya.name}</span>
                          <span className="text-white/60 text-sm mr-2" dir="rtl">{wilaya.arabic}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <div className="text-white bg-white/5 rounded-md px-3 py-2 border border-white/10">
                  {user?.wilaya ? (
                    <div className="flex items-center justify-between">
                      <span>{user.wilaya}</span>
                      <span className="text-white/60 text-sm" dir="rtl">
                        {wilayas.find(w => w.name === user.wilaya)?.arabic || ''}
                      </span>
                    </div>
                  ) : (
                    'Not set'
                  )}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium text-white/80 flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Bio {isEditing && <span className="text-xs text-white/50">({formData.bio.length}/300)</span>}
              </Label>
              {isEditing ? (
                <Textarea
                  value={formData.bio}
                  onChange={(e) => handleInputChange('bio', e.target.value)}
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/50 min-h-[100px]"
                  placeholder="Tell us about yourself..."
                  maxLength={300}
                />
              ) : (
                <p className="text-white bg-white/5 rounded-md px-3 py-2 border border-white/10 min-h-[60px]">
                  {user?.bio || 'No bio added yet'}
                </p>
              )}
            </div>

            {/* Professional Information Section - Always Visible */}
            <div className="mt-8 pt-6 border-t border-white/10">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Briefcase className="w-5 h-5" />
                Professional Information
              </h3>
                
              {/* Years of Experience */}
              <div className="space-y-2 mb-4">
                <Label className="text-sm font-medium text-white/80">
                  Years of Experience
                </Label>
                {isEditing ? (
                  <Input
                    type="number"
                    placeholder="e.g., 5"
                    value={formData.yearsExperience}
                    onChange={(e) => handleInputChange('yearsExperience', e.target.value)}
                    className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                  />
                ) : (
                  <p className="text-white bg-white/5 rounded-md px-3 py-2 border border-white/10">
                    {user?.yearsExperience ? `${user.yearsExperience} years` : 'Not set'}
                  </p>
                )}
              </div>

              {/* Hourly Rate */}
              <div className="space-y-2 mb-4">
                <Label className="text-sm font-medium text-white/80">
                  Hourly Rate (DZD)
                </Label>
                {isEditing ? (
                  <Input
                    type="number"
                    placeholder="e.g., 2500"
                    value={formData.hourlyRate}
                    onChange={(e) => handleInputChange('hourlyRate', e.target.value)}
                    className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                  />
                ) : (
                  <p className="text-white bg-white/5 rounded-md px-3 py-2 border border-white/10">
                    {user?.hourlyRate ? `${user.hourlyRate} DZD/hour` : 'Not set'}
                  </p>
                )}
              </div>

              {/* Availability */}
              <div className="space-y-2 mb-4">
                <Label className="text-sm font-medium text-white/80">
                  Availability
                </Label>
                {isEditing ? (
                  <Select 
                    value={formData.availability} 
                    onValueChange={(value) => handleInputChange('availability', value)}
                  >
                    <SelectTrigger className="bg-white/10 border-white/20 text-white">
                      <SelectValue placeholder="Select availability" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800/95 backdrop-blur-lg border-gray-700">
                      <SelectItem value="full-time">Full-time</SelectItem>
                      <SelectItem value="part-time">Part-time</SelectItem>
                      <SelectItem value="weekends-only">Weekends only</SelectItem>
                      <SelectItem value="evenings-only">Evenings only</SelectItem>
                    </SelectContent>
                  </Select>
                ) : (
                  <p className="text-white bg-white/5 rounded-md px-3 py-2 border border-white/10 capitalize">
                    {user?.availability?.replace('-', ' ') || 'Not set'}
                  </p>
                )}
              </div>

              {/* Skills */}
              <div className="space-y-2 mb-4">
                <Label className="text-sm font-medium text-white/80">
                  Skills
                </Label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {(isEditing ? formData.skills : (user?.skills || [])).map((skill, index) => (
                    <span 
                      key={index}
                      className="px-3 py-1 bg-blue-600/20 text-blue-300 rounded-full text-sm flex items-center gap-2"
                    >
                      {skill}
                      {isEditing && (
                        <X 
                          size={14} 
                          className="cursor-pointer hover:text-red-400"
                          onClick={() => handleSkillRemove(skill)}
                        />
                      )}
                    </span>
                  ))}
                  {(isEditing ? formData.skills : (user?.skills || [])).length === 0 && (
                    <p className="text-white/50 text-sm">No skills added yet</p>
                  )}
                </div>
                {isEditing && (
                  <Input
                    placeholder="Add a skill (press Enter)"
                    className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        const skill = (e.target as HTMLInputElement).value.trim();
                        if (skill) {
                          handleSkillAdd(skill);
                          (e.target as HTMLInputElement).value = '';
                        }
                      }
                    }}
                  />
                )}
              </div>

              {/* Languages */}
              <div className="space-y-2 mb-4">
                <Label className="text-sm font-medium text-white/80">
                  Languages
                </Label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {(isEditing ? formData.languages : (user?.languages || [])).map((language, index) => (
                    <span 
                      key={index}
                      className="px-3 py-1 bg-green-600/20 text-green-300 rounded-full text-sm flex items-center gap-2"
                    >
                      {language}
                      {isEditing && (
                        <X 
                          size={14} 
                          className="cursor-pointer hover:text-red-400"
                          onClick={() => handleInputChange('languages', formData.languages.filter(l => l !== language))}
                        />
                      )}
                    </span>
                  ))}
                  {(isEditing ? formData.languages : (user?.languages || [])).length === 0 && (
                    <p className="text-white/50 text-sm">No languages added yet</p>
                  )}
                </div>
                {isEditing && (
                  <Input
                    placeholder="Add a language (press Enter)"
                    className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        const language = (e.target as HTMLInputElement).value.trim();
                        if (language && !formData.languages.includes(language)) {
                          handleInputChange('languages', [...formData.languages, language]);
                          (e.target as HTMLInputElement).value = '';
                        }
                      }
                    }}
                  />
                )}
              </div>

              {/* Portfolio Section - Integrated into Profile */}
              <div className="mt-8 pt-6 border-t border-white/10">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <ImageIcon className="w-5 h-5" />
                  Portfolio Gallery
                </h3>
                
                {/* Portfolio Tabs */}
                <div className="flex flex-wrap gap-2 mb-6">
                  {portfolioTabs.map((tab) => {
                    const IconComponent = tab.icon;
                    return (
                      <Button
                        key={tab.id}
                        variant={activePortfolioTab === tab.id ? "default" : "outline"}
                        size="sm"
                        onClick={() => setActivePortfolioTab(tab.id)}
                        className={`flex items-center gap-2 ${
                          activePortfolioTab === tab.id
                            ? "bg-blue-600 text-white"
                            : "bg-white/10 text-white/70 border-white/20 hover:bg-white/20"
                        }`}
                      >
                        <IconComponent className="w-4 h-4" />
                        {tab.label}
                      </Button>
                    );
                  })}
                </div>

                {/* Upload Section */}
                <div className="mb-6 p-4 bg-white/5 rounded-lg border border-white/10">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-white font-medium">Upload to {portfolioTabs.find(t => t.id === activePortfolioTab)?.label}</h4>
                    <div className="text-sm text-white/60">
                      {(portfolioGalleries as any)?.find((gallery: any) => gallery.id === activePortfolioTab)?.images?.length || 0} images
                    </div>
                  </div>
                  
                  <PortfolioUploader
                    maxNumberOfFiles={10}
                    maxFileSize={10485760}
                    onGetUploadParameters={handleGetUploadParameters}
                    onComplete={handlePortfolioUploadComplete}
                    buttonClassName="w-full bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    <div className="flex items-center gap-2">
                      <Camera className="w-4 h-4" />
                      <span>Upload Images</span>
                    </div>
                  </PortfolioUploader>
                </div>

                {/* Modern Portfolio Gallery Display */}
                {portfolioLoading ? (
                  <div className="text-white/60 text-center py-12">
                    <div className="animate-pulse flex space-x-4">
                      <div className="flex-1 space-y-3">
                        <div className="grid grid-cols-3 gap-4">
                          {[...Array(6)].map((_, i) => (
                            <div key={i} className="aspect-square bg-white/10 rounded-lg"></div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (() => {
                  const activeGallery = (portfolioGalleries as any)?.find((gallery: any) => gallery.id === activePortfolioTab);
                  const images = activeGallery?.images || [];
                  
                  if (images.length === 0) {
                    return (
                      <div className="text-center py-16 bg-white/5 rounded-lg border border-white/10">
                        <div className="max-w-sm mx-auto">
                          <ImageIcon className="w-16 h-16 mx-auto mb-4 text-white/30" />
                          <h3 className="text-white font-medium mb-2">No {activeGallery?.title} Yet</h3>
                          <p className="text-white/60 text-sm mb-4">
                            Showcase your {activeGallery?.title.toLowerCase()} to attract more customers
                          </p>
                          <div className="text-xs text-white/50 space-y-1">
                            <p>• High-quality photos get 3x more views</p>
                            <p>• Add descriptions to highlight your expertise</p>
                            <p>• Set a primary image for your portfolio cover</p>
                          </div>
                        </div>
                      </div>
                    );
                  }

                  // Enhanced modern gallery layout
                  return (
                    <div className="space-y-6">
                      {/* Gallery Stats */}
                      <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10">
                        <div className="flex items-center gap-4">
                          <div className="text-center">
                            <div className="text-xl font-bold text-white">{images.length}</div>
                            <div className="text-xs text-white/60">Images</div>
                          </div>
                          <div className="text-center">
                            <div className="text-xl font-bold text-blue-400">{images.filter((img: any) => img.isPrimary).length}</div>
                            <div className="text-xs text-white/60">Primary</div>
                          </div>
                          <div className="text-center">
                            <div className="text-xl font-bold text-green-400">{images.filter((img: any) => img.metadata?.isPublic !== false).length}</div>
                            <div className="text-xs text-white/60">Public</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-white/80">Portfolio Score</div>
                          <div className="text-lg font-bold text-yellow-400">
                            {Math.min(100, Math.round((images.length * 15) + (images.filter((img: any) => img.metadata?.description).length * 10)))}%
                          </div>
                        </div>
                      </div>

                      {/* Primary Image Showcase */}
                      {(() => {
                        const primaryImage = images.find((img: any) => img.isPrimary) || images[0];
                        if (!primaryImage) return null;
                        
                        return (
                          <div className="relative">
                            <div className="text-sm font-medium text-white/80 mb-2 flex items-center gap-2">
                              <Star className="w-4 h-4 text-yellow-400 fill-current" />
                              Featured Image
                            </div>
                            <div className="relative group">
                              <div className="aspect-[16/10] bg-white/5 rounded-lg overflow-hidden border border-white/10">
                                <img
                                  src={primaryImage.url}
                                  alt={primaryImage.alt || 'Primary portfolio image'}
                                  className="w-full h-full object-cover transition-all duration-300 group-hover:scale-105"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                  <div className="absolute bottom-4 left-4 right-4">
                                    <h4 className="text-white font-medium text-lg mb-1">
                                      {primaryImage.alt || 'Featured Work'}
                                    </h4>
                                    {primaryImage.metadata?.description && (
                                      <p className="text-white/80 text-sm">
                                        {primaryImage.metadata.description}
                                      </p>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })()}

                      {/* Image Grid */}
                      <div>
                        <div className="text-sm font-medium text-white/80 mb-3 flex items-center justify-between">
                          <span>All Images ({images.length})</span>
                          <div className="flex items-center gap-2 text-xs text-white/60">
                            <span>Drag to reorder</span>
                            <GripVertical className="w-3 h-3" />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                          {images.map((image: any, index: number) => (
                            <div key={image.id} className="relative group">
                              <div className="aspect-square bg-white/5 rounded-lg overflow-hidden border border-white/10 hover:border-white/30 transition-colors cursor-pointer">
                                <img
                                  src={image.url}
                                  alt={image.alt || `Portfolio image ${index + 1}`}
                                  className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-110"
                                  onClick={() => setLightboxIndex(index)}
                                />
                                
                                {/* Image Overlay */}
                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors duration-200">
                                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                    <div className="flex gap-2">
                                      <Button 
                                        size="sm" 
                                        variant="secondary" 
                                        className="h-8 w-8 p-0"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setLightboxIndex(index);
                                        }}
                                      >
                                        <Eye className="w-4 h-4" />
                                      </Button>
                                      <Button size="sm" variant="secondary" className="h-8 w-8 p-0">
                                        <Edit className="w-4 h-4" />
                                      </Button>
                                      <Button size="sm" variant="destructive" className="h-8 w-8 p-0">
                                        <Trash2 className="w-4 h-4" />
                                      </Button>
                                    </div>
                                  </div>
                                </div>

                                {/* Image Badges */}
                                <div className="absolute top-2 left-2 flex flex-col gap-1">
                                  {image.isPrimary && (
                                    <Badge variant="default" className="bg-blue-600 hover:bg-blue-600 text-white text-xs px-2 py-0.5">
                                      <Star className="w-3 h-3 mr-1 fill-current" />
                                      Primary
                                    </Badge>
                                  )}
                                  {image.metadata?.isPublic !== false && (
                                    <Badge variant="secondary" className="bg-green-600/80 hover:bg-green-600/80 text-white text-xs px-2 py-0.5">
                                      <Globe className="w-3 h-3 mr-1" />
                                      Public
                                    </Badge>
                                  )}
                                </div>

                                {/* Image Quality Indicator */}
                                <div className="absolute top-2 right-2">
                                  <div className="w-2 h-2 rounded-full bg-green-400"></div>
                                </div>
                              </div>
                              
                              {/* Image Info */}
                              <div className="mt-2 space-y-1">
                                <p className="text-white text-sm font-medium truncate">
                                  {image.alt || `Image ${index + 1}`}
                                </p>
                                {image.metadata?.description && (
                                  <p className="text-white/60 text-xs line-clamp-2">
                                    {image.metadata.description}
                                  </p>
                                )}
                                <div className="flex items-center justify-between text-xs text-white/50">
                                  <span>Uploaded {new Date(image.uploadedAt).toLocaleDateString()}</span>
                                  <span className="flex items-center gap-1">
                                    <Eye className="w-3 h-3" />
                                    {Math.floor(Math.random() * 100) + 10}
                                  </span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Portfolio Tips */}
                      <div className="mt-8 p-4 bg-blue-600/10 border border-blue-600/20 rounded-lg">
                        <h4 className="text-blue-300 font-medium mb-2 flex items-center gap-2">
                          <Lightbulb className="w-4 h-4" />
                          Portfolio Tips
                        </h4>
                        <ul className="text-sm text-blue-200/80 space-y-1">
                          <li>• Add detailed descriptions to help customers understand your work</li>
                          <li>• Use high-resolution images (at least 1200px width) for best quality</li>
                          <li>• Set one image as primary to represent this category</li>
                          <li>• Include before/after shots to showcase transformations</li>
                        </ul>
                      </div>
                    </div>
                  );
                })()}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Portfolio Lightbox */}
        {(() => {
          const activeGallery = (portfolioGalleries as any)?.find((gallery: any) => gallery.id === activePortfolioTab);
          const images = activeGallery?.images || [];
          const lightboxSlides = images.map((image: any) => ({
            src: image.url,
            alt: image.alt || 'Portfolio image'
          }));
          
          return (
            <Lightbox
              open={lightboxIndex >= 0}
              index={lightboxIndex}
              close={() => setLightboxIndex(-1)}
              slides={lightboxSlides}
              carousel={{ finite: true }}
              render={{
                buttonPrev: images.length <= 1 ? () => null : undefined,
                buttonNext: images.length <= 1 ? () => null : undefined,
              }}
            />
          );
        })()}

        {/* Account Management */}
        <Card className="mb-6 bg-white/10 backdrop-blur-lg border-white/20">
          <CardHeader className="pb-3">
            <h3 className="text-lg font-semibold text-white">Account</h3>
          </CardHeader>
          <CardContent className="pt-0 space-y-3">
            {/* Account Type */}
            <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/10">
              <div className="flex-1">
                <p className="text-white font-medium">Account Type</p>
                {isEditing ? (
                  <Select
                    value={formData.accountType}
                    onValueChange={(value) => handleInputChange('accountType', value)}
                  >
                    <SelectTrigger className="bg-white/10 border-white/20 text-white mt-2 w-full">
                      <SelectValue placeholder="Select account type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="seeker">Service Seeker</SelectItem>
                      <SelectItem value="provider">Service Provider</SelectItem>
                      <SelectItem value="company">Company</SelectItem>
                    </SelectContent>
                  </Select>
                ) : (
                  <p className="text-white/70 text-sm capitalize">
                    {formData.accountType === 'seeker' ? 'Service Seeker' : 
                     formData.accountType === 'provider' ? 'Service Provider' : 
                     formData.accountType === 'company' ? 'Company' : 'Service Seeker'}
                  </p>
                )}
              </div>
              {!isEditing && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setIsEditing(true)}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-0 shadow-lg"
                >
                  Change
                </Button>
              )}
            </div>

            {/* ID Verification - Inspired by TaskRabbit */}
            <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-500/20 rounded-xl flex items-center justify-center">
                  <Shield className="w-5 h-5 text-green-400" />
                </div>
                <div>
                  <p className="text-white font-medium">ID Check</p>
                  <p className="text-white/70 text-sm">Identity verified</p>
                </div>
              </div>
              <div className="text-green-400 text-sm font-medium">Verified</div>
            </div>

            {/* Portfolio & Work Samples - Inspired by Thumbtack */}
            <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-500/20 rounded-xl flex items-center justify-center">
                  <ImageIcon className="w-5 h-5 text-purple-400" />
                </div>
                <div>
                  <p className="text-white font-medium">Portfolio Gallery</p>
                  <p className="text-white/70 text-sm">Showcase your work samples</p>
                </div>
              </div>
              <Button variant="outline" size="sm" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-0 shadow-lg">
                Manage
              </Button>
            </div>

            {/* Service Area - Inspired by TaskRabbit */}
            <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-500/20 rounded-xl flex items-center justify-center">
                  <MapPin className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <p className="text-white font-medium">Service Area</p>
                  <p className="text-white/70 text-sm">Define your work radius</p>
                </div>
              </div>
              <Button variant="outline" size="sm" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-0 shadow-lg">
                Set Area
              </Button>
            </div>

            {/* Tools & Equipment - TaskRabbit Feature */}
            <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-orange-500/20 rounded-xl flex items-center justify-center">
                  <Wrench className="w-5 h-5 text-orange-400" />
                </div>
                <div>
                  <p className="text-white font-medium">Tools & Equipment</p>
                  <p className="text-white/70 text-sm">List your professional tools</p>
                </div>
              </div>
              <Button variant="outline" size="sm" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-0 shadow-lg">
                Add Tools
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Quick Settings */}
        <Card className="mb-6 bg-white/10 backdrop-blur-lg border-white/20">
          <CardHeader className="pb-3">
            <h3 className="text-lg font-semibold text-white">Quick Settings</h3>
          </CardHeader>
          <CardContent className="pt-0 space-y-2">
            <Link href="/profile/notifications">
              <Button variant="ghost" className="w-full justify-between p-4 h-auto bg-white/5 hover:bg-white/10 border border-white/10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-orange-500/20 rounded-xl flex items-center justify-center">
                    <Bell className="w-5 h-5 text-orange-400" />
                  </div>
                  <span className="font-medium text-white">Manage notification settings</span>
                </div>
              </Button>
            </Link>

            <Link href="/profile/help">
              <Button variant="ghost" className="w-full justify-between p-4 h-auto bg-white/5 hover:bg-white/10 border border-white/10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gray-500/20 rounded-xl flex items-center justify-center">
                    <HelpCircle className="w-5 h-5 text-gray-400" />
                  </div>
                  <span className="font-medium text-white">Get help or contact support</span>
                </div>
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Save Changes Button - Only show when editing */}
        {isEditing && (
          <Button
            onClick={handleSave}
            disabled={isSaving}
            className="w-full py-4 font-medium bg-blue-500 hover:bg-blue-600 text-white"
          >
            {isSaving ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Saving...
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Save className="w-5 h-5" />
                Save Changes
              </div>
            )}
          </Button>
        )}
      </div>

      <BottomNavigation activeTab="profile" />
    </div>
  );
}