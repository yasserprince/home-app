import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { ServiceIcon } from "@/components/service-icon";
import { Link } from "wouter";
import { CheckCircle, Star, Shield, Clock } from "lucide-react";

export default function Login() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 relative overflow-hidden">
      {/* Animated background orbs */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute top-40 left-40 w-80 h-80 bg-indigo-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8 min-h-screen flex flex-col">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-white via-blue-100 to-purple-100 bg-clip-text text-transparent mb-4">
            ServiceNow
          </h1>
          <p className="text-blue-100 text-lg">
            Professional Home Services at Your Fingertips
          </p>
        </div>

        <div className="flex-1 flex items-center justify-center">
          <div className="w-full max-w-lg">
            {/* Main Login Card */}
            <Card className="backdrop-blur-md bg-white/10 border-white/20 shadow-2xl">
              <CardHeader className="text-center pb-6">
                <CardTitle className="text-2xl font-bold text-white mb-2">
                  Welcome Back
                </CardTitle>
                <CardDescription className="text-blue-100">
                  Sign in to access professional home services
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Google OAuth Login */}
                <Button 
                  onClick={() => window.location.href = '/api/login'}
                  className="w-full bg-white hover:bg-gray-50 text-gray-900 font-medium py-3 h-auto border-2 border-transparent hover:border-white/20 transition-all duration-200"
                >
                  <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  Continue with Google
                </Button>

                <div className="flex items-center gap-4">
                  <Separator className="flex-1 bg-white/20" />
                  <span className="text-blue-100 text-sm">or</span>
                  <Separator className="flex-1 bg-white/20" />
                </div>

                {/* Email/Password Login */}
                <Link href="/email-signin">
                  <Button variant="outline" className="w-full bg-transparent border-white/30 text-white hover:bg-white/10 font-medium py-3 h-auto">
                    Sign in with Email
                  </Button>
                </Link>

                <div className="text-center pt-4">
                  <p className="text-blue-100 text-sm">
                    Don't have an account?{" "}
                    <Link href="/signup" className="text-white hover:text-blue-200 font-medium underline">
                      Sign up here
                    </Link>
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Trust Indicators */}
            <div className="mt-8 grid md:grid-cols-3 gap-4">
              <Card className="backdrop-blur-md bg-white/5 border-white/10 text-center p-4">
                <Shield className="w-8 h-8 text-green-400 mx-auto mb-2" />
                <p className="text-white text-sm font-medium">Verified Providers</p>
                <p className="text-blue-100 text-xs">Background checked</p>
              </Card>
              <Card className="backdrop-blur-md bg-white/5 border-white/10 text-center p-4">
                <Star className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
                <p className="text-white text-sm font-medium">Top Rated</p>
                <p className="text-blue-100 text-xs">4.8+ average rating</p>
              </Card>
              <Card className="backdrop-blur-md bg-white/5 border-white/10 text-center p-4">
                <Clock className="w-8 h-8 text-blue-400 mx-auto mb-2" />
                <p className="text-white text-sm font-medium">Fast Booking</p>
                <p className="text-blue-100 text-xs">Same day service</p>
              </Card>
            </div>
          </div>
        </div>

        {/* Popular Services Preview */}
        <div className="mt-12">
          <h3 className="text-white text-xl font-semibold text-center mb-6">
            Popular Services
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { name: 'Plumbing', icon: 'wrench', color: 'bg-blue-500/20' },
              { name: 'Electrical', icon: 'zap', color: 'bg-yellow-500/20' },
              { name: 'Cleaning', icon: 'sparkles', color: 'bg-green-500/20' },
              { name: 'HVAC', icon: 'thermometer', color: 'bg-red-500/20' }
            ].map((service) => (
              <Card key={service.name} className="backdrop-blur-md bg-white/5 border-white/10 p-4 text-center hover:bg-white/10 transition-all duration-200">
                <div className={`${service.color} w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-2`}>
                  <ServiceIcon iconName={service.icon} className="w-6 h-6 text-white" />
                </div>
                <p className="text-white text-sm font-medium">{service.name}</p>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}