import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useLocation } from "wouter";
import { ArrowLeft, Shield, CheckCircle, Clock, AlertCircle, Upload, Phone, Mail, FileText, Star } from "lucide-react";

export default function Verification() {
  const { user, isLoading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();
  const [verificationStep, setVerificationStep] = useState<'overview' | 'id' | 'phone' | 'email' | 'background'>('overview');

  // Calculate verification progress
  const getVerificationProgress = () => {
    if (!user) return 0;
    let completed = 0;
    let total = 4;
    
    if (user.emailVerificationStatus === 'verified') completed++;
    if (user.phoneVerificationStatus === 'verified') completed++;
    if (user.idVerificationStatus === 'verified') completed++;
    if (user.backgroundCheckStatus === 'verified') completed++;
    
    return Math.round((completed / total) * 100);
  };

  const getTrustLevel = () => {
    const score = user?.trustScore || 0;
    if (score >= 90) return { level: 'Excellent', color: 'bg-green-500', icon: '🛡️' };
    if (score >= 70) return { level: 'Good', color: 'bg-blue-500', icon: '✅' };
    if (score >= 50) return { level: 'Fair', color: 'bg-yellow-500', icon: '⚠️' };
    return { level: 'Needs Improvement', color: 'bg-red-500', icon: '❌' };
  };

  // Mutations for verification
  const emailVerificationMutation = useMutation({
    mutationFn: () => apiRequest('/api/verification/email', 'POST'),
    onSuccess: () => {
      toast({
        title: "Verification Email Sent",
        description: "Check your inbox and click the verification link",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to send verification email",
        variant: "destructive",
      });
    },
  });

  const phoneVerificationMutation = useMutation({
    mutationFn: () => apiRequest('/api/verification/phone', 'POST'),
    onSuccess: () => {
      toast({
        title: "Verification Code Sent", 
        description: "Check your SMS for the verification code",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to send verification code", 
        variant: "destructive",
      });
    },
  });

  const startEmailVerification = () => emailVerificationMutation.mutate();
  const startPhoneVerification = () => phoneVerificationMutation.mutate();

  const startIdVerification = () => {
    // Integrate with Didit free KYC service
    toast({
      title: "ID Verification",
      description: "Redirecting to secure verification portal...",
    });
    
    // In production, redirect to Didit API endpoint
    window.open('https://didit.me/business/solutions/identity-verification', '_blank');
  };

  const VerificationStatusBadge = ({ status }: { status: string }) => {
    const getStatusConfig = (status: string) => {
      switch (status) {
        case 'verified':
          return { variant: 'default' as const, icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-100' };
        case 'pending':
          return { variant: 'secondary' as const, icon: Clock, color: 'text-yellow-600', bg: 'bg-yellow-100' };
        case 'rejected':
          return { variant: 'destructive' as const, icon: AlertCircle, color: 'text-red-600', bg: 'bg-red-100' };
        default:
          return { variant: 'outline' as const, icon: AlertCircle, color: 'text-gray-600', bg: 'bg-gray-100' };
      }
    };

    const config = getStatusConfig(status);
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className={`${config.bg} ${config.color}`}>
        <Icon className="w-3 h-3 mr-1" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading verification status...</p>
        </div>
      </div>
    );
  }

  const trustLevel = getTrustLevel();
  const progress = getVerificationProgress();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-primary text-white p-4 pt-12">
        <div className="flex items-center space-x-4 mb-4">
          <Button
            variant="ghost"
            size="icon"
            className="text-white hover:bg-white/20"
            onClick={() => setLocation("/profile")}
          >
            <ArrowLeft className="w-6 h-6" />
          </Button>
          <h1 className="text-xl font-semibold">Identity & Verification</h1>
        </div>
        
        {/* Trust Score Display */}
        <div className="bg-white/10 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm opacity-90">Trust Score</span>
            <span className="text-lg font-bold">{user?.trustScore || 0}/100</span>
          </div>
          <Progress value={user?.trustScore || 0} className="h-2 bg-white/20" />
          <div className="flex items-center mt-2">
            <span className="text-lg mr-2">{trustLevel.icon}</span>
            <span className="text-sm">{trustLevel.level}</span>
          </div>
        </div>
      </div>

      <div className="p-4 -mt-6 bg-gray-50 rounded-t-3xl relative z-10">
        {/* Verification Progress */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Shield className="w-5 h-5" />
              <span>Verification Progress</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <div className="flex justify-between text-sm mb-2">
                <span>Progress</span>
                <span>{progress}% Complete</span>
              </div>
              <Progress value={progress} className="h-3" />
            </div>
            <p className="text-sm text-gray-600">
              Complete all verifications to unlock premium features and increase your trust score.
            </p>
          </CardContent>
        </Card>

        {/* Verification Methods */}
        <div className="space-y-4">
          {/* Email Verification */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Mail className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-medium">Email Verification</h3>
                    <p className="text-sm text-gray-600">Verify your email address</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <VerificationStatusBadge status={user?.emailVerificationStatus || 'unverified'} />
                  {user?.emailVerificationStatus !== 'verified' && (
                    <Button size="sm" onClick={startEmailVerification}>
                      Verify
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Phone Verification */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <Phone className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-medium">Phone Verification</h3>
                    <p className="text-sm text-gray-600">Verify via SMS code</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <VerificationStatusBadge status={user?.phoneVerificationStatus || 'unverified'} />
                  {user?.phoneVerificationStatus !== 'verified' && (
                    <Button size="sm" onClick={startPhoneVerification}>
                      Verify
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* ID Verification */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                    <FileText className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-medium">ID Document Verification</h3>
                    <p className="text-sm text-gray-600">Upload government-issued ID</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <VerificationStatusBadge status={user?.idVerificationStatus || 'unverified'} />
                  {user?.idVerificationStatus !== 'verified' && (
                    <Button size="sm" onClick={startIdVerification}>
                      Upload ID
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Background Check */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                    <Shield className="w-5 h-5 text-red-600" />
                  </div>
                  <div>
                    <h3 className="font-medium">Background Check</h3>
                    <p className="text-sm text-gray-600">Criminal history verification</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <VerificationStatusBadge status={user?.backgroundCheckStatus || 'not_required'} />
                  {user?.backgroundCheckStatus === 'not_required' && (
                    <Button size="sm" variant="outline" disabled>
                      Optional
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Benefits */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Star className="w-5 h-5 text-yellow-500" />
              <span>Verification Benefits</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm">
              <div className="flex items-start space-x-2">
                <CheckCircle className="w-4 h-4 text-green-600 mt-0.5" />
                <p>Build trust with service providers</p>
              </div>
              <div className="flex items-start space-x-2">
                <CheckCircle className="w-4 h-4 text-green-600 mt-0.5" />
                <p>Access to premium services and providers</p>
              </div>
              <div className="flex items-start space-x-2">
                <CheckCircle className="w-4 h-4 text-green-600 mt-0.5" />
                <p>Priority booking and faster response times</p>
              </div>
              <div className="flex items-start space-x-2">
                <CheckCircle className="w-4 h-4 text-green-600 mt-0.5" />
                <p>Enhanced security and fraud protection</p>
              </div>
              <div className="flex items-start space-x-2">
                <CheckCircle className="w-4 h-4 text-green-600 mt-0.5" />
                <p>Potential discounts and special offers</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Security Notice */}
        <Card className="mt-6 bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-start space-x-3">
              <Shield className="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-blue-900 mb-1">Your Privacy is Protected</h4>
                <p className="text-sm text-blue-700">
                  We use industry-leading encryption and partner with trusted verification services. 
                  Your documents are securely processed and never stored permanently on our servers.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}