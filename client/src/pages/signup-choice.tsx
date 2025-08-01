import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Search, Wrench, Building2 } from "lucide-react";

export default function SignupChoice() {
  const handleSignup = (role: string) => {
    // Store the chosen role in sessionStorage to use after auth
    sessionStorage.setItem('selectedRole', role);
    // Redirect to Replit Auth with the role parameter
    window.location.href = `/api/login?role=${role}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Join ServiceNow
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Choose how you'd like to use our platform. You can always change this later.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Service Seeker */}
          <Card className="relative overflow-hidden border-2 hover:border-blue-300 transition-all duration-300 hover:shadow-lg">
            <CardHeader className="text-center pb-4">
              <div className="mx-auto mb-4 p-4 bg-blue-100 rounded-full w-20 h-20 flex items-center justify-center">
                <Search className="w-10 h-10 text-blue-600" />
              </div>
              <CardTitle className="text-2xl">I Need Services</CardTitle>
              <p className="text-gray-600">
                Find trusted professionals for your home and business needs
              </p>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="space-y-3 mb-6">
                <div className="flex items-center text-sm text-gray-600">
                  <div className="w-2 h-2 bg-blue-600 rounded-full mr-3"></div>
                  Browse local service providers
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <div className="w-2 h-2 bg-blue-600 rounded-full mr-3"></div>
                  Book appointments instantly
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <div className="w-2 h-2 bg-blue-600 rounded-full mr-3"></div>
                  Read reviews and ratings
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <div className="w-2 h-2 bg-blue-600 rounded-full mr-3"></div>
                  Secure payment processing
                </div>
              </div>
              <Button 
                className="w-full bg-blue-600 hover:bg-blue-700"
                onClick={() => handleSignup('service_seeker')}
              >
                Get Started as Customer
              </Button>
            </CardContent>
          </Card>

          {/* Service Provider */}
          <Card className="relative overflow-hidden border-2 hover:border-green-300 transition-all duration-300 hover:shadow-lg">
            <CardHeader className="text-center pb-4">
              <div className="mx-auto mb-4 p-4 bg-green-100 rounded-full w-20 h-20 flex items-center justify-center">
                <Wrench className="w-10 h-10 text-green-600" />
              </div>
              <CardTitle className="text-2xl">I Provide Services</CardTitle>
              <p className="text-gray-600">
                Grow your business by connecting with customers who need your skills
              </p>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="space-y-3 mb-6">
                <div className="flex items-center text-sm text-gray-600">
                  <div className="w-2 h-2 bg-green-600 rounded-full mr-3"></div>
                  Create your professional profile
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <div className="w-2 h-2 bg-green-600 rounded-full mr-3"></div>
                  Set your own rates and schedule
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <div className="w-2 h-2 bg-green-600 rounded-full mr-3"></div>
                  Get matched with local customers
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <div className="w-2 h-2 bg-green-600 rounded-full mr-3"></div>
                  Build your reputation with reviews
                </div>
              </div>
              <Button 
                className="w-full bg-green-600 hover:bg-green-700"
                onClick={() => handleSignup('service_provider')}
              >
                Join as Service Provider
              </Button>
            </CardContent>
          </Card>

          {/* Company */}
          <Card className="relative overflow-hidden border-2 hover:border-purple-300 transition-all duration-300 hover:shadow-lg">
            <CardHeader className="text-center pb-4">
              <div className="mx-auto mb-4 p-4 bg-purple-100 rounded-full w-20 h-20 flex items-center justify-center">
                <Building2 className="w-10 h-10 text-purple-600" />
              </div>
              <CardTitle className="text-2xl">I'm a Company</CardTitle>
              <p className="text-gray-600">
                Scale your business with enterprise tools and team management
              </p>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="space-y-3 mb-6">
                <div className="flex items-center text-sm text-gray-600">
                  <div className="w-2 h-2 bg-purple-600 rounded-full mr-3"></div>
                  Manage multiple team members
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <div className="w-2 h-2 bg-purple-600 rounded-full mr-3"></div>
                  Enterprise-level analytics
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <div className="w-2 h-2 bg-purple-600 rounded-full mr-3"></div>
                  Bulk booking management
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <div className="w-2 h-2 bg-purple-600 rounded-full mr-3"></div>
                  Priority customer support
                </div>
              </div>
              <Button 
                className="w-full bg-purple-600 hover:bg-purple-700"
                onClick={() => handleSignup('company')}
              >
                Sign Up as Company
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="text-center mt-12">
          <p className="text-gray-600 mb-4">
            Already have an account?
          </p>
          <Button 
            variant="outline" 
            onClick={() => window.location.href = '/api/login'}
            className="px-8"
          >
            Sign In
          </Button>
        </div>
      </div>
    </div>
  );
}