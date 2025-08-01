import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Users, Shield, UserCheck, UserX, Trash2, ArrowLeft } from "lucide-react";
import { Link } from "wouter";
import type { User } from "@shared/schema";
import { useTranslation, getLanguageDirection, translations } from "@/lib/i18n";
import { LanguageSelector } from "@/components/language-selector";

export default function AdminPanel() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { t, language } = useTranslation();
  
  const { data: users = [], isLoading } = useQuery<User[]>({
    queryKey: ['/api/admin/users'],
  });

  const updateRoleMutation = useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: string }) => {
      const response = await fetch(`/api/admin/users/${userId}/role`, {
        method: 'PUT',
        body: JSON.stringify({ role }),
        headers: { 'Content-Type': 'application/json' },
      });
      if (!response.ok) throw new Error('Failed to update role');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
      toast({
        title: t('success'),
        description: t('userRoleUpdated'),
      });
    },
    onError: () => {
      toast({
        title: t('error'),
        description: "Failed to update user role",
        variant: "destructive",
      });
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ userId, isActive }: { userId: string; isActive: boolean }) => {
      const response = await fetch(`/api/admin/users/${userId}/status`, {
        method: 'PUT',
        body: JSON.stringify({ isActive }),
        headers: { 'Content-Type': 'application/json' },
      });
      if (!response.ok) throw new Error('Failed to update status');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
      toast({
        title: t('success'),
        description: t('userStatusUpdated'),
      });
    },
    onError: () => {
      toast({
        title: t('error'),
        description: "Failed to update user status",
        variant: "destructive",
      });
    },
  });

  const deleteUserMutation = useMutation({
    mutationFn: async (userId: string) => {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete user');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
      toast({
        title: t('success'),
        description: t('userDeleted'),
      });
    },
    onError: () => {
      toast({
        title: t('error'),
        description: "Failed to delete user",
        variant: "destructive",
      });
    },
  });

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'admin': return 'destructive';
      case 'support': return 'default';
      case 'service_provider': return 'default';
      case 'company': return 'secondary';
      default: return 'outline';
    }
  };

  const getStatusBadgeVariant = (isActive: boolean) => {
    return isActive ? 'default' : 'secondary';
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen" dir={getLanguageDirection(language)}>
        <div className="text-center">
          <Shield className="mx-auto h-12 w-12 text-muted-foreground animate-pulse mb-4" />
          <p className="text-muted-foreground">{t('loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8" dir={getLanguageDirection(language)}>
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Link href="/">
            <Button variant="ghost" size="sm" className="mr-3">
              <ArrowLeft className="h-4 w-4 mr-2" />
              {t('back')}
            </Button>
          </Link>
          <Shield className="h-8 w-8 text-red-600" />
          <h1 className="text-3xl font-bold">{t('adminPanel')}</h1>
          <div className="ml-auto">
            <LanguageSelector variant="compact" />
          </div>
        </div>
        <p className="text-muted-foreground">
          {t('manageUsers')}
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">{t('totalUsers')}</p>
                <p className="text-2xl font-bold">{users.length}</p>
              </div>
              <Users className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">{t('serviceSeekers')}</p>
                <p className="text-2xl font-bold">
                  {users.filter(u => u.role === 'service_seeker').length}
                </p>
              </div>
              <UserCheck className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">{t('serviceProviders')}</p>
                <p className="text-2xl font-bold">
                  {users.filter(u => u.role === 'service_provider').length}
                </p>
              </div>
              <UserCheck className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">{t('companies')}</p>
                <p className="text-2xl font-bold">
                  {users.filter(u => u.role === 'company').length}
                </p>
              </div>
              <UserCheck className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>{t('allUsers')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {users.map((user) => (
              <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                    {user.profileImageUrl ? (
                      <img 
                        src={user.profileImageUrl} 
                        alt={user.firstName || 'User'} 
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    ) : (
                      <span className="text-sm font-medium">
                        {(user.firstName?.[0] || user.email?.[0] || 'U').toUpperCase()}
                      </span>
                    )}
                  </div>
                  
                  <div>
                    <p className="font-medium">
                      {user.firstName && user.lastName 
                        ? `${user.firstName} ${user.lastName}`
                        : user.email
                      }
                    </p>
                    <p className="text-sm text-muted-foreground">{user.email}</p>
                    {user.companyName && (
                      <p className="text-sm text-blue-600">{user.companyName}</p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Badge variant={getRoleBadgeVariant(user.role!)}>
                    {t(user.role?.replace('_', '') as keyof typeof translations.en) || user.role?.replace('_', ' ')}
                  </Badge>
                  
                  <Badge variant={getStatusBadgeVariant(user.isActive!)}>
                    {user.isActive ? t('active') : t('inactive')}
                  </Badge>

                  <Select
                    value={user.role || 'service_seeker'}
                    onValueChange={(role) => 
                      updateRoleMutation.mutate({ userId: user.id, role })
                    }
                  >
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="service_seeker">{t('serviceSeeker')}</SelectItem>
                      <SelectItem value="service_provider">{t('serviceProvider')}</SelectItem>
                      <SelectItem value="company">{t('company')}</SelectItem>
                      <SelectItem value="support">{t('support')}</SelectItem>
                      <SelectItem value="admin">{t('administrator')}</SelectItem>
                    </SelectContent>
                  </Select>

                  <Button
                    variant={user.isActive ? "outline" : "default"}
                    size="sm"
                    onClick={() => 
                      updateStatusMutation.mutate({ 
                        userId: user.id, 
                        isActive: !user.isActive 
                      })
                    }
                  >
                    {user.isActive ? <UserX className="h-4 w-4" /> : <UserCheck className="h-4 w-4" />}
                  </Button>

                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>{t('deleteUser')}</AlertDialogTitle>
                        <AlertDialogDescription>
                          {t('deleteUserConfirm')}
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>{t('cancel')}</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => deleteUserMutation.mutate(user.id)}
                          className="bg-red-600 hover:bg-red-700"
                        >
                          {t('delete')}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}