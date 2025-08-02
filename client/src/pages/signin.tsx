import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useTranslation } from "@/lib/i18n";
import { ArrowLeft, LogIn } from "lucide-react";
import { Link } from "wouter";

export default function Signin() {
  const { t } = useTranslation();

  const handleGoogleSignin = () => {
    window.location.href = '/api/auth/google';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <Link href="/">
            <Button variant="ghost" className="self-start mb-2">
              <ArrowLeft className="w-4 h-4 mr-2" />
              {t('back')}
            </Button>
          </Link>
          
          <div className="mx-auto w-16 h-16 rounded-full bg-blue-50 dark:bg-blue-950 flex items-center justify-center mb-4">
            <LogIn className="w-8 h-8 text-blue-600 dark:text-blue-400" />
          </div>
          
          <CardTitle className="text-2xl">{t('welcomeBack')}</CardTitle>
          <CardDescription>
            {t('signInToAccount')}
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <Button 
            onClick={handleGoogleSignin}
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

          <Button 
            onClick={() => window.location.href = '/api/login'}
            className="w-full bg-orange-500 hover:bg-orange-600 text-white"
          >
            <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
            </svg>
            Continue with Replit
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
          
          <Link href="/email-signin" className="w-full">
            <Button variant="outline" className="w-full">
              {t('continueWithEmail')}
            </Button>
          </Link>
          
          <div className="text-center mt-6">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {t('noAccount')}{' '}
              <Link href="/signup" className="text-blue-600 dark:text-blue-400 hover:underline">
                {t('signUpHere')}
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}