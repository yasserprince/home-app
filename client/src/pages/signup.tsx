import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useTranslation } from "@/lib/i18n";
import { ArrowLeft, Users, UserCheck, Briefcase } from "lucide-react";
import { Link } from "wouter";

export default function Signup() {
  const { t } = useTranslation();
  const [step, setStep] = useState<'role' | 'method'>('role');
  const [selectedRole, setSelectedRole] = useState<'seeker' | 'provider' | 'company' | null>(null);

  const handleRoleSelection = (role: 'seeker' | 'provider' | 'company') => {
    setSelectedRole(role);
    setStep('method');
  };

  const handleGoogleSignup = () => {
    // Pass the selected role as state parameter to OAuth
    const authUrl = '/api/auth/google';
    if (selectedRole) {
      window.location.href = `${authUrl}?state=${selectedRole}`;
    } else {
      window.location.href = authUrl;
    }
  };

  const roles = [
    {
      id: 'seeker' as const,
      title: t('roleSeeker'),
      description: t('roleSeekerDesc'),
      icon: Users,
      color: 'bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800'
    },
    {
      id: 'provider' as const,
      title: t('roleProvider'),
      description: t('roleProviderDesc'),
      icon: UserCheck,
      color: 'bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800'
    },
    {
      id: 'company' as const,
      title: t('roleCompany'),
      description: t('roleCompanyDesc'),
      icon: Briefcase,
      color: 'bg-purple-50 dark:bg-purple-950 border-purple-200 dark:border-purple-800'
    }
  ];

  if (step === 'role') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
        <div className="w-full max-w-4xl">
          <div className="text-center mb-8">
            <Link href="/">
              <Button variant="ghost" className="mb-4">
                <ArrowLeft className="w-4 h-4 mr-2" />
                {t('back')}
              </Button>
            </Link>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              {t('chooseYourRole')}
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              {t('selectAccountType')}
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {roles.map((role) => {
              const Icon = role.icon;
              return (
                <Card 
                  key={role.id}
                  className={`cursor-pointer transition-all hover:shadow-lg ${role.color}`}
                  onClick={() => handleRoleSelection(role.id)}
                >
                  <CardHeader className="text-center">
                    <div className="mx-auto w-16 h-16 rounded-full bg-white dark:bg-gray-800 flex items-center justify-center mb-4">
                      <Icon className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                    </div>
                    <CardTitle className="text-xl">{role.title}</CardTitle>
                    <CardDescription className="text-sm text-gray-600 dark:text-gray-400">
                      {role.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button className="w-full" variant="outline">
                      {t('selectRole')}
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  if (step === 'method') {
    const selectedRoleData = roles.find(r => r.id === selectedRole);
    const Icon = selectedRoleData?.icon || Users;

    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <Button 
              variant="ghost" 
              className="self-start mb-2"
              onClick={() => setStep('role')}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              {t('back')}
            </Button>
            
            <div className="mx-auto w-16 h-16 rounded-full bg-blue-50 dark:bg-blue-950 flex items-center justify-center mb-4">
              <Icon className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            </div>
            
            <CardTitle className="text-2xl">{t('createAccount')}</CardTitle>
            <CardDescription>
              {t('signupAs')} {selectedRoleData?.title.toLowerCase()}
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-4">
            <Button 
              onClick={handleGoogleSignup}
              className="w-full bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              {t('continueWithGoogle')}
            </Button>
            
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-gray-300 dark:border-gray-600" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white dark:bg-gray-900 px-2 text-gray-500 dark:text-gray-400">
                  {t('or')}
                </span>
              </div>
            </div>
            
            <Link href={`/email-signup?role=${selectedRole}`} className="w-full">
              <Button variant="outline" className="w-full">
                {t('continueWithEmail')}
              </Button>
            </Link>
            
            <p className="text-xs text-center text-gray-500 dark:text-gray-400 mt-4">
              {t('signupTerms')}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return null;
}