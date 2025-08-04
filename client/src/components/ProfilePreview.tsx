import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Star, MapPin, Phone, Mail, Eye, Calendar, User as UserIcon } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";
import { ALGERIA_WILAYAS } from "@shared/wilayas";
import type { User } from "@shared/schema";

interface ProfilePreviewProps {
  user: User;
}

export function ProfilePreview({ user }: ProfilePreviewProps) {
  const { t, language } = useTranslation();

  const getWilayaName = (code: string) => {
    const wilaya = ALGERIA_WILAYAS.find(w => w.code === code);
    if (!wilaya) return code;
    return language === 'ar' ? wilaya.arabic : wilaya.latin;
  };

  const getInitials = (firstName?: string, lastName?: string) => {
    return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase();
  };

  const getRoleDisplay = (role: string) => {
    switch (role) {
      case 'service_seeker':
        return t('roleSeeker');
      case 'service_provider':
        return t('roleProvider');
      case 'company':
        return t('roleCompany');
      default:
        return role;
    }
  };

  const getSexDisplay = (sex?: string) => {
    if (!sex) return '';
    return sex === 'male' ? t('male') : t('female');
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="flex items-center gap-2">
          <Eye className="h-4 w-4" />
          {t('previewProfile')}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            {t('previewProfile')}
          </DialogTitle>
          <p className="text-sm text-muted-foreground">
            {t('viewAsOthers')}
          </p>
        </DialogHeader>

        <div className="space-y-6">
          {/* Profile Header */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={user.profileImageUrl || ''} />
                  <AvatarFallback className="text-lg">
                    {getInitials(user.firstName, user.lastName)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h2 className="text-xl font-semibold">
                      {user.firstName && user.lastName 
                        ? `${user.firstName} ${user.lastName}`
                        : user.email
                      }
                    </h2>
                    <Badge variant={user.role === 'service_provider' ? 'default' : 'secondary'}>
                      {getRoleDisplay(user.role)}
                    </Badge>
                  </div>
                  
                  {user.bio && (
                    <p className="text-muted-foreground mb-3">{user.bio}</p>
                  )}

                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    {user.city && (
                      <div className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        <span>
                          {user.city}
                          {user.wilaya && `, ${getWilayaName(user.wilaya)}`}
                        </span>
                      </div>
                    )}
                    <div className="flex items-center gap-1">
                      <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                      <span>4.9 (247 reviews)</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Personal Information */}
          <Card>
            <CardContent className="pt-6">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <UserIcon className="h-4 w-4" />
                {t('profileInformation')}
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                {user.email && (
                  <div className="flex items-center gap-2">
                    <Mail className="h-3 w-3 text-muted-foreground" />
                    <span className="text-muted-foreground">{t('email')}:</span>
                    <span>{user.email}</span>
                  </div>
                )}
                
                {user.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="h-3 w-3 text-muted-foreground" />
                    <span className="text-muted-foreground">{t('phone')}:</span>
                    <span>{user.phone}</span>
                  </div>
                )}

                {user.sex && (
                  <div className="flex items-center gap-2">
                    <UserIcon className="h-3 w-3 text-muted-foreground" />
                    <span className="text-muted-foreground">{t('sex')}:</span>
                    <span>{getSexDisplay(user.sex)}</span>
                  </div>
                )}

                <div className="flex items-center gap-2">
                  <Calendar className="h-3 w-3 text-muted-foreground" />
                  <span className="text-muted-foreground">{t('joinedIn')}:</span>
                  <span>{new Date(user.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Address Information */}
          {(user.address || user.city || user.wilaya) && (
            <Card>
              <CardContent className="pt-6">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  {t('addressInformation')}
                </h3>
                
                <div className="text-sm space-y-2">
                  {user.address && (
                    <div>
                      <span className="text-muted-foreground">{t('streetAddress')}:</span>
                      <p>{user.address}</p>
                    </div>
                  )}
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {user.city && (
                      <div>
                        <span className="text-muted-foreground">{t('city')}:</span>
                        <p>{user.city}</p>
                      </div>
                    )}
                    
                    {user.wilaya && (
                      <div>
                        <span className="text-muted-foreground">{t('wilaya')}:</span>
                        <p>{getWilayaName(user.wilaya)}</p>
                      </div>
                    )}
                    
                    {user.zipCode && (
                      <div>
                        <span className="text-muted-foreground">{t('zipCode')}:</span>
                        <p>{user.zipCode}</p>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Verification Status */}
          <Card>
            <CardContent className="pt-6">
              <h3 className="font-semibold mb-4">{t('verificationStatus')}</h3>
              
              <div className="flex flex-wrap gap-2">
                <Badge variant={user.isVerified ? 'default' : 'outline'}>
                  {user.isVerified ? t('verified') : t('notVerified')}
                </Badge>
                <Badge variant={user.emailVerificationStatus === 'verified' ? 'default' : 'outline'}>
                  Email {user.emailVerificationStatus === 'verified' ? t('verified') : t('notVerified')}
                </Badge>
                {user.phoneVerificationStatus === 'verified' && (
                  <Badge variant="default">
                    Phone {t('verified')}
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}