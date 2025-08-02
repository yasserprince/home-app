import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/lib/i18n";
import { LanguageSelector } from "@/components/language-selector";

export default function Landing() {
  const { t } = useTranslation();
  return (
    <div className="min-h-screen bg-gradient-to-b from-primary to-primary/80 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Language Selector at the top */}
        <div className="flex justify-center mb-6">
          <LanguageSelector variant="button" />
        </div>
        
        <Card className="shadow-xl border-0">
          <CardContent className="pt-12 pb-8 px-8 text-center">
            <div className="mb-8">
              <h1 className="text-4xl font-bold text-gray-900 mb-3">ServiceNow</h1>
              <p className="text-gray-600 text-lg">Your trusted home service partner</p>
            </div>
            
            <div className="mb-8">
              <div className="grid grid-cols-2 gap-3 mb-6">
                <div className="p-3 bg-blue-50 rounded-xl">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                    <i className="fas fa-faucet text-blue-600 text-lg"></i>
                  </div>
                  <p className="text-xs font-medium text-gray-700">Plumbing</p>
                </div>
                <div className="p-3 bg-yellow-50 rounded-xl">
                  <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                    <i className="fas fa-bolt text-yellow-600 text-lg"></i>
                  </div>
                  <p className="text-xs font-medium text-gray-700">Electrical</p>
                </div>
                <div className="p-3 bg-indigo-50 rounded-xl">
                  <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                    <i className="fas fa-thermometer-half text-indigo-600 text-lg"></i>
                  </div>
                  <p className="text-xs font-medium text-gray-700">HVAC</p>
                </div>
                <div className="p-3 bg-purple-50 rounded-xl">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                    <i className="fas fa-broom text-purple-600 text-lg"></i>
                  </div>
                  <p className="text-xs font-medium text-gray-700">Cleaning</p>
                </div>
                <div className="p-3 bg-orange-50 rounded-xl">
                  <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                    <i className="fas fa-hammer text-orange-600 text-lg"></i>
                  </div>
                  <p className="text-xs font-medium text-gray-700">Handyman</p>
                </div>
                <div className="p-3 bg-green-50 rounded-xl">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                    <i className="fas fa-seedling text-green-600 text-lg"></i>
                  </div>
                  <p className="text-xs font-medium text-gray-700">Landscaping</p>
                </div>
              </div>
              <p className="text-center text-xs text-gray-500">...and 6 more services</p>
            </div>

            <div className="space-y-4">
              <Button 
                className="w-full py-6 text-lg font-semibold"
                onClick={() => window.location.href = '/signup'}
              >
                {t('getStarted')}
              </Button>
              
              <Button 
                variant="outline"
                className="w-full py-6 text-lg font-semibold"
                onClick={() => window.location.href = '/signin'}
              >
                {t('signIn')}
              </Button>
              
              <div className="flex items-center justify-center space-x-6 text-sm text-gray-600">
                <div className="flex items-center">
                  <i className="fas fa-star text-yellow-400 mr-1"></i>
                  <span>4.9 Rating</span>
                </div>
                <div className="flex items-center">
                  <i className="fas fa-users text-green-500 mr-1"></i>
                  <span>1000+ Services</span>
                </div>
                <div className="flex items-center">
                  <i className="fas fa-clock text-blue-500 mr-1"></i>
                  <span>24/7 Support</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
