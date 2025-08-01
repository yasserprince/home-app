import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import BottomNavigation from "@/components/bottom-navigation";
import { Shield, ShieldCheck, ArrowLeft } from "lucide-react";
import { Link } from "wouter";

export default function Profile() {
  const { user, isLoading } = useAuth();

  const handleLogout = () => {
    window.location.href = '/api/logout';
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 pb-20">
        <div className="bg-primary text-white p-6 pt-12">
          <div className="flex items-center space-x-4">
            <Skeleton className="w-16 h-16 rounded-full" />
            <div>
              <Skeleton className="h-6 w-32 mb-2" />
              <Skeleton className="h-4 w-48 mb-1" />
              <Skeleton className="h-4 w-36" />
            </div>
          </div>
        </div>
        <div className="p-6 bg-white -mt-6 rounded-t-3xl relative z-10">
          <div className="grid grid-cols-3 gap-4 mb-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="text-center">
                <Skeleton className="h-8 w-12 mx-auto mb-1" />
                <Skeleton className="h-4 w-20 mx-auto" />
              </div>
            ))}
          </div>
          <div className="space-y-1">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-16" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-primary text-white p-6 pt-12">
        <div className="flex items-center justify-between mb-4">
          <Link href="/">
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-white hover:bg-blue-600 border border-white/20 hover:border-white/40 px-3 py-2"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </Link>
          <h1 className="text-xl font-semibold">Profile</h1>
          <div></div> {/* Spacer for center alignment */}
        </div>
        <div className="flex items-center space-x-4">
          {user?.profileImageUrl ? (
            <img
              src={user.profileImageUrl}
              alt="Profile"
              className="w-16 h-16 rounded-full object-cover border-3 border-blue-300"
            />
          ) : (
            <div className="w-16 h-16 bg-blue-300 rounded-full flex items-center justify-center">
              <i className="fas fa-user text-primary text-xl"></i>
            </div>
          )}
          <div>
            <h1 className="text-xl font-semibold">
              {user?.firstName} {user?.lastName}
            </h1>
            <p className="text-blue-200">{user?.email}</p>
            <p className="text-blue-200 text-sm">
              Member since {new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
            </p>
          </div>
        </div>
      </div>

      {/* Profile Stats */}
      <div className="p-6 bg-white -mt-6 rounded-t-3xl relative z-10">
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900">0</p>
            <p className="text-sm text-gray-600">Services Booked</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900">$0</p>
            <p className="text-sm text-gray-600">Total Spent</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center space-x-1">
              <p className="text-2xl font-bold text-gray-900">5.0</p>
              <i className="fas fa-star text-yellow-400 text-sm"></i>
            </div>
            <p className="text-sm text-gray-600">Your Rating</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <Button
            variant="outline"
            className="p-4 h-auto flex flex-col items-center space-y-2"
            onClick={() => window.location.href = '/bookings'}
          >
            <i className="fas fa-calendar-check text-primary text-lg"></i>
            <span className="text-sm font-medium">My Bookings</span>
          </Button>
          <Button
            variant="outline"
            className="p-4 h-auto flex flex-col items-center space-y-2"
            onClick={() => window.location.href = '/providers?favorites=true'}
          >
            <i className="fas fa-heart text-red-500 text-lg"></i>
            <span className="text-sm font-medium">Favorites</span>
          </Button>
        </div>

        {/* Menu Items */}
        <div className="space-y-1">
          <Button
            variant="ghost"
            className="w-full justify-between p-4 h-auto"
            onClick={() => window.location.href = '/profile/edit'}
          >
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <i className="fas fa-user text-primary"></i>
              </div>
              <span className="font-medium text-gray-900">Edit Profile</span>
            </div>
            <i className="fas fa-chevron-right text-gray-400"></i>
          </Button>

          <Button
            variant="ghost"
            className="w-full justify-between p-4 h-auto"
            onClick={() => window.location.href = '/profile/payment-methods'}
          >
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <i className="fas fa-credit-card text-green-600"></i>
              </div>
              <span className="font-medium text-gray-900">Payment Methods</span>
            </div>
            <i className="fas fa-chevron-right text-gray-400"></i>
          </Button>

          <Button
            variant="ghost"
            className="w-full justify-between p-4 h-auto"
            onClick={() => window.location.href = '/profile/addresses'}
          >
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                <i className="fas fa-map-marker-alt text-yellow-600"></i>
              </div>
              <span className="font-medium text-gray-900">Saved Addresses</span>
            </div>
            <i className="fas fa-chevron-right text-gray-400"></i>
          </Button>

          <Button
            variant="ghost"
            className="w-full justify-between p-4 h-auto"
            onClick={() => window.location.href = '/profile/location'}
          >
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                <i className="fas fa-map-pin text-orange-600"></i>
              </div>
              <span className="font-medium text-gray-900">Location Settings</span>
            </div>
            <i className="fas fa-chevron-right text-gray-400"></i>
          </Button>

          <Button
            variant="ghost"
            className="w-full justify-between p-4 h-auto"
            onClick={() => window.location.href = '/profile/earnings'}
          >
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <i className="fas fa-chart-line text-green-600"></i>
              </div>
              <span className="font-medium text-gray-900">Earnings & Analytics</span>
            </div>
            <i className="fas fa-chevron-right text-gray-400"></i>
          </Button>

          <Button
            variant="ghost"
            className="w-full justify-between p-4 h-auto"
            onClick={() => window.location.href = '/profile/reviews'}
          >
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                <i className="fas fa-star text-yellow-600"></i>
              </div>
              <span className="font-medium text-gray-900">Reviews & Ratings</span>
            </div>
            <i className="fas fa-chevron-right text-gray-400"></i>
          </Button>

          <Button
            variant="ghost"
            className="w-full justify-between p-4 h-auto"
            onClick={() => window.location.href = '/profile/verification'}
          >
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <ShieldCheck className="w-5 h-5 text-blue-600" />
              </div>
              <span className="font-medium text-gray-900">Identity & Verification</span>
            </div>
            <i className="fas fa-chevron-right text-gray-400"></i>
          </Button>

          <Button
            variant="ghost"
            className="w-full justify-between p-4 h-auto"
            onClick={() => window.location.href = '/profile/preferences'}
          >
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                <i className="fas fa-sliders-h text-indigo-600"></i>
              </div>
              <span className="font-medium text-gray-900">Preferences & Privacy</span>
            </div>
            <i className="fas fa-chevron-right text-gray-400"></i>
          </Button>

          <Button
            variant="ghost"
            className="w-full justify-between p-4 h-auto"
            onClick={() => window.location.href = '/profile/notifications'}
          >
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <i className="fas fa-bell text-purple-600"></i>
              </div>
              <span className="font-medium text-gray-900">Notifications</span>
            </div>
            <i className="fas fa-chevron-right text-gray-400"></i>
          </Button>

          <Button
            variant="ghost"
            className="w-full justify-between p-4 h-auto"
            onClick={() => window.location.href = '/profile/help'}
          >
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                <i className="fas fa-headset text-gray-600"></i>
              </div>
              <span className="font-medium text-gray-900">Help & Support</span>
            </div>
            <i className="fas fa-chevron-right text-gray-400"></i>
          </Button>

          <Button
            variant="ghost"
            className="w-full justify-between p-4 h-auto"
            disabled
          >
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                <i className="fas fa-cog text-gray-600"></i>
              </div>
              <span className="font-medium text-gray-900">Settings</span>
            </div>
            <i className="fas fa-chevron-right text-gray-400"></i>
          </Button>
        </div>

        {/* Logout Button */}
        <Button
          variant="destructive"
          className="w-full mt-8 py-3 font-medium"
          onClick={handleLogout}
        >
          <i className="fas fa-sign-out-alt mr-2"></i>
          Logout
        </Button>
      </div>

      <BottomNavigation activeTab="profile" />
    </div>
  );
}
