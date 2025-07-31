import { Link } from "wouter";
import { Button } from "@/components/ui/button";

interface BottomNavigationProps {
  activeTab: 'home' | 'bookings' | 'profile';
}

export default function BottomNavigation({ activeTab }: BottomNavigationProps) {
  return (
    <div className="fixed bottom-0 left-1/2 transform -translate-x-1/2 w-full max-w-md bg-white border-t border-gray-200">
      <div className="flex">
        <Link href="/" className="flex-1">
          <Button
            variant="ghost"
            className={`w-full py-3 px-4 flex flex-col items-center justify-center space-y-1 ${
              activeTab === 'home' ? 'text-primary' : 'text-gray-400'
            }`}
          >
            <i className={`fas fa-home text-xl ${activeTab === 'home' ? 'text-primary' : 'text-gray-400'}`}></i>
            <span className={`text-xs font-medium ${activeTab === 'home' ? 'text-primary' : 'text-gray-400'}`}>
              Home
            </span>
          </Button>
        </Link>
        
        <Link href="/bookings" className="flex-1">
          <Button
            variant="ghost"
            className={`w-full py-3 px-4 flex flex-col items-center justify-center space-y-1 ${
              activeTab === 'bookings' ? 'text-primary' : 'text-gray-400'
            }`}
          >
            <i className={`fas fa-calendar text-xl ${activeTab === 'bookings' ? 'text-primary' : 'text-gray-400'}`}></i>
            <span className={`text-xs font-medium ${activeTab === 'bookings' ? 'text-primary' : 'text-gray-400'}`}>
              Bookings
            </span>
          </Button>
        </Link>
        
        <Link href="/profile" className="flex-1">
          <Button
            variant="ghost"
            className={`w-full py-3 px-4 flex flex-col items-center justify-center space-y-1 ${
              activeTab === 'profile' ? 'text-primary' : 'text-gray-400'
            }`}
          >
            <i className={`fas fa-user text-xl ${activeTab === 'profile' ? 'text-primary' : 'text-gray-400'}`}></i>
            <span className={`text-xs font-medium ${activeTab === 'profile' ? 'text-primary' : 'text-gray-400'}`}>
              Profile
            </span>
          </Button>
        </Link>
      </div>
    </div>
  );
}
