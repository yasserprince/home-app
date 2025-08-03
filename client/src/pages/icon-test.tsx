import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ServiceIcon } from "@/components/service-icon";
import { IconifyServiceIcon } from "@/components/iconify-service-icon";

export default function IconTest() {
  const testIcons = [
    { name: 'wrench', label: 'Plumbing' },
    { name: 'zap', label: 'Electrical' },
    { name: 'thermometer', label: 'HVAC' },
    { name: 'hammer', label: 'Handyman' },
    { name: 'paintbrush', label: 'Painting' },
    { name: 'sparkles', label: 'Cleaning' },
    { name: 'home', label: 'Roofing' },
    { name: 'car', label: 'Automotive' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 relative overflow-hidden">
      {/* Animated background orbs */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute top-40 left-40 w-80 h-80 bg-indigo-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-white via-blue-100 to-purple-100 bg-clip-text text-transparent mb-4">
            Icon Test Page
          </h1>
          <p className="text-blue-100 text-lg">
            Testing Different Icon Libraries
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Lucide Icons (Current) */}
          <Card className="backdrop-blur-md bg-white/10 border-white/20 shadow-2xl">
            <CardHeader>
              <CardTitle className="text-white text-xl">
                Lucide Icons (Current)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-4 gap-4">
                {testIcons.map((icon) => (
                  <div key={icon.name} className="text-center">
                    <div className="bg-white/10 rounded-lg p-4 mb-2">
                      <ServiceIcon 
                        iconName={icon.name} 
                        className="w-8 h-8 text-white mx-auto" 
                      />
                    </div>
                    <p className="text-blue-100 text-xs">{icon.label}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Iconify Icons (New) */}
          <Card className="backdrop-blur-md bg-white/10 border-white/20 shadow-2xl">
            <CardHeader>
              <CardTitle className="text-white text-xl">
                Iconify Icons (New - Better Mobile)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-4 gap-4">
                {testIcons.map((icon) => (
                  <div key={icon.name} className="text-center">
                    <div className="bg-white/10 rounded-lg p-4 mb-2">
                      <IconifyServiceIcon 
                        iconName={icon.name} 
                        className="mx-auto" 
                        size={32}
                        color="white"
                      />
                    </div>
                    <p className="text-blue-100 text-xs">{icon.label}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="text-center mt-8">
          <p className="text-blue-100">
            Compare the two icon libraries above. Iconify should render more reliably on mobile browsers.
          </p>
        </div>
      </div>
    </div>
  );
}