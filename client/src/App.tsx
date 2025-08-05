import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import NotFound from "@/pages/not-found";
import Login from "@/pages/login";
import LoginRedesigned from "@/pages/login-redesigned";
import Home from "@/pages/home";
import HomeRedesigned from "@/pages/home-redesigned";
import Categories from "@/pages/categories";
import CategoriesRedesigned from "@/pages/categories-redesigned";
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
import AdminLogin from "@/pages/admin-login";
import Signup from "@/pages/signup";
import Signin from "@/pages/signin";
import EmailSignup from "@/pages/email-signup";
import EmailSignin from "@/pages/email-signin";

import IconTest from "@/pages/icon-test";
import { AdminNav } from "@/components/admin-nav";

function Router() {
  const { isAuthenticated, isLoading, user } = useAuth();

  return (
    <Switch>
      <Route path="/signup" component={Signup} />
      <Route path="/signin" component={Signin} />
      <Route path="/email-signup" component={EmailSignup} />
      <Route path="/email-signin" component={EmailSignin} />
      <Route path="/admin-login" component={AdminLogin} />
      <Route path="/adminspecial" component={AdminSpecial} />
      <Route path="/icon-test" component={IconTest} />
      {isLoading || !isAuthenticated ? (
        <Route path="/" component={LoginRedesigned} />
      ) : (
        <>
          <Route path="/" component={HomeRedesigned} />
          <Route path="/home-old" component={Home} />
          <Route path="/categories" component={CategoriesRedesigned} />
          <Route path="/categories-old" component={Categories} />
          <Route path="/providers" component={Providers} />
          <Route path="/provider/:id" component={ProviderDetail} />
          <Route path="/booking" component={Booking} />
          <Route path="/bookings" component={Bookings} />
          <Route path="/account" component={Profile} />
          <Route path="/account/edit" component={ProfileEdit} />
          <Route path="/account/payment-methods" component={PaymentMethods} />
          <Route path="/account/addresses" component={SavedAddresses} />
          <Route path="/account/location" component={LocationSettings} />
          <Route path="/account/verification" component={Verification} />
          <Route path="/account/notifications" component={Notifications} />
          <Route path="/account/help" component={HelpSupport} />
          {/* Legacy profile routes - redirect to account */}
          <Route path="/profile" component={Profile} />
          <Route path="/profile/edit" component={ProfileEdit} />
          <Route path="/settings" component={ProfileEdit} />
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
