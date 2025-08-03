import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Home, Calendar, User } from "lucide-react";

interface BottomNavigationProps {
  activeTab: 'home' | 'bookings' | 'profile';
}

export default function BottomNavigation({ activeTab }: BottomNavigationProps) {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-lg border-t border-white/20 shadow-lg">
      <div className="max-w-md mx-auto">
        <div className="flex">
          <Link href="/" className="flex-1">
            <Button
              variant="ghost"
              className={`w-full py-4 px-4 flex flex-col items-center justify-center space-y-1 transition-all duration-200 ${
                activeTab === 'home' 
                  ? 'text-blue-600 bg-blue-50/50' 
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50/50'
              }`}
            >
              <Home className={`w-6 h-6 ${activeTab === 'home' ? 'text-blue-600' : 'text-gray-500'}`} strokeWidth={2} />
              <span className={`text-xs font-medium ${activeTab === 'home' ? 'text-blue-600' : 'text-gray-500'}`}>
                Home
              </span>
            </Button>
          </Link>
          
          <Link href="/bookings" className="flex-1">
            <Button
              variant="ghost"
              className={`w-full py-4 px-4 flex flex-col items-center justify-center space-y-1 transition-all duration-200 ${
                activeTab === 'bookings' 
                  ? 'text-blue-600 bg-blue-50/50' 
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50/50'
              }`}
            >
              <Calendar className={`w-6 h-6 ${activeTab === 'bookings' ? 'text-blue-600' : 'text-gray-500'}`} strokeWidth={2} />
              <span className={`text-xs font-medium ${activeTab === 'bookings' ? 'text-blue-600' : 'text-gray-500'}`}>
                Bookings
              </span>
            </Button>
          </Link>
          
          <Link href="/profile" className="flex-1">
            <Button
              variant="ghost"
              className={`w-full py-4 px-4 flex flex-col items-center justify-center space-y-1 transition-all duration-200 ${
                activeTab === 'profile' 
                  ? 'text-blue-600 bg-blue-50/50' 
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50/50'
              }`}
            >
              <User className={`w-6 h-6 ${activeTab === 'profile' ? 'text-blue-600' : 'text-gray-500'}`} strokeWidth={2} />
              <span className={`text-xs font-medium ${activeTab === 'profile' ? 'text-blue-600' : 'text-gray-500'}`}>
                Profile
              </span>
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
