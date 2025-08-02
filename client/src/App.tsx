import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import NotFound from "@/pages/not-found";
import Landing from "@/pages/landing";
import Home from "@/pages/home-new";
import Categories from "@/pages/categories-new";
import Providers from "@/pages/providers";
import ProviderDetail from "@/pages/provider-detail";
import Booking from "@/pages/booking";
import Bookings from "@/pages/bookings";
import Profile from "@/pages/profile";
import ProfileEdit from "@/pages/profile-edit";
import PaymentMethods from "@/pages/payment-methods";
import SavedAddresses from "@/pages/saved-addresses";
import LocationSettings from "@/pages/location-settings";
import Verification from "@/pages/verification";
import Notifications from "@/pages/notifications";
import HelpSupport from "@/pages/help-support";
import AdminPanel from "@/pages/admin";
import AdminSpecial from "@/pages/admin-special";
import Signup from "@/pages/signup";
import Signin from "@/pages/signin";
import EmailSignup from "@/pages/email-signup";
import EmailSignin from "@/pages/email-signin";
import Settings from "@/pages/settings";
import { AdminNav } from "@/components/admin-nav";

function Router() {
  const { isAuthenticated, isLoading, user } = useAuth();

  return (
    <Switch>
      <Route path="/signup" component={Signup} />
      <Route path="/signin" component={Signin} />
      <Route path="/email-signup" component={EmailSignup} />
      <Route path="/email-signin" component={EmailSignin} />
      <Route path="/adminspecial" component={AdminSpecial} />
      {isLoading || !isAuthenticated ? (
        <Route path="/" component={Landing} />
      ) : (
        <>
          <Route path="/" component={Home} />
          <Route path="/categories" component={Categories} />
          <Route path="/providers" component={Providers} />
          <Route path="/provider/:id" component={ProviderDetail} />
          <Route path="/booking" component={Booking} />
          <Route path="/bookings" component={Bookings} />
          <Route path="/profile" component={Profile} />
          <Route path="/profile/edit" component={ProfileEdit} />
          <Route path="/profile/payment-methods" component={PaymentMethods} />
          <Route path="/profile/addresses" component={SavedAddresses} />
          <Route path="/profile/location" component={LocationSettings} />
          <Route path="/profile/verification" component={Verification} />
          <Route path="/profile/notifications" component={Notifications} />
          <Route path="/profile/help" component={HelpSupport} />
          <Route path="/settings" component={Settings} />
          {user?.role === 'admin' && (
            <Route path="/admin" component={AdminPanel} />
          )}
        </>
      )}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
        <AdminNav />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
