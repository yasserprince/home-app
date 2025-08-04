import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Home, Calendar, User } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";

interface BottomNavigationProps {
  activeTab: 'home' | 'bookings' | 'profile';
}

export default function BottomNavigation({ activeTab }: BottomNavigationProps) {
  const { t } = useTranslation();
  
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-gray-900/95 backdrop-blur-lg border-t border-white/10 shadow-2xl">
      <div className="max-w-md mx-auto">
        <div className="flex">
          <Link href="/" className="flex-1">
            <Button
              variant="ghost"
              className={`w-full py-4 px-4 flex flex-col items-center justify-center space-y-1 transition-all duration-200 ${
                activeTab === 'home' 
                  ? 'text-blue-400 bg-blue-400/20' 
                  : 'text-white/70 hover:text-white hover:bg-white/10'
              }`}
            >
              <Home className={`w-6 h-6 ${activeTab === 'home' ? 'text-blue-400' : 'text-white/70'}`} strokeWidth={2} />
              <span className={`text-xs font-medium ${activeTab === 'home' ? 'text-blue-400' : 'text-white/70'}`}>
                {t('home')}
              </span>
            </Button>
          </Link>
          
          <Link href="/bookings" className="flex-1">
            <Button
              variant="ghost"
              className={`w-full py-4 px-4 flex flex-col items-center justify-center space-y-1 transition-all duration-200 ${
                activeTab === 'bookings' 
                  ? 'text-blue-400 bg-blue-400/20' 
                  : 'text-white/70 hover:text-white hover:bg-white/10'
              }`}
            >
              <Calendar className={`w-6 h-6 ${activeTab === 'bookings' ? 'text-blue-400' : 'text-white/70'}`} strokeWidth={2} />
              <span className={`text-xs font-medium ${activeTab === 'bookings' ? 'text-blue-400' : 'text-white/70'}`}>
                {t('bookings')}
              </span>
            </Button>
          </Link>
          
          <Link href="/profile" className="flex-1">
            <Button
              variant="ghost"
              className={`w-full py-4 px-4 flex flex-col items-center justify-center space-y-1 transition-all duration-200 ${
                activeTab === 'profile' 
                  ? 'text-blue-400 bg-blue-400/20' 
                  : 'text-white/70 hover:text-white hover:bg-white/10'
              }`}
            >
              <User className={`w-6 h-6 ${activeTab === 'profile' ? 'text-blue-400' : 'text-white/70'}`} strokeWidth={2} />
              <span className={`text-xs font-medium ${activeTab === 'profile' ? 'text-blue-400' : 'text-white/70'}`}>
                {t('profile')}
              </span>
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
