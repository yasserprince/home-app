import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { ArrowLeft, Check, Crown, Zap, Shield, Clock } from "lucide-react";

export default function Subscription() {
  const { user, isLoading } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [billingInterval, setBillingInterval] = useState<'monthly' | 'yearly'>('monthly');
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);

  // Mock subscription plans - in real app these would come from API
  const plans = [
    {
      id: 'basic',
      name: 'Basic',
      description: 'Perfect for occasional service needs',
      monthlyPrice: 0,
      yearlyPrice: 0,
      features: [
        'Browse all service categories',
        'Book up to 3 services per month',
        'Basic customer support',
        'Standard booking fees apply',
      ],
      color: 'bg-gray-50 border-gray-200',
      buttonColor: 'bg-gray-600 hover:bg-gray-700',
      icon: <Shield className="w-6 h-6" />,
      popular: false,
    },
    {
      id: 'premium',
      name: 'Premium',
      description: 'Great for regular home maintenance',
      monthlyPrice: 19.99,
      yearlyPrice: 199.99,
      features: [
        'Unlimited service bookings',
        '15% discount on all services',
        'Priority booking and support',
        'Exclusive access to top-rated providers',
        'Free cancellation up to 1 hour before',
        'Service history and analytics',
      ],
      color: 'bg-blue-50 border-blue-200',
      buttonColor: 'bg-blue-600 hover:bg-blue-700',
      icon: <Zap className="w-6 h-6" />,
      popular: true,
    },
    {
      id: 'pro',
      name: 'Pro',
      description: 'Best for property managers and businesses',
      monthlyPrice: 49.99,
      yearlyPrice: 499.99,
      features: [
        'Everything in Premium',
        '25% discount on all services',
        'Dedicated account manager',
        'Multi-property management',
        'Advanced scheduling tools',
        'Custom service packages',
        'Priority emergency services',
        'Detailed reporting and invoicing',
      ],
      color: 'bg-purple-50 border-purple-200',
      buttonColor: 'bg-purple-600 hover:bg-purple-700',
      icon: <Crown className="w-6 h-6" />,
      popular: false,
    },
  ];

  // Mock current subscription - in real app this would come from API
  const currentSubscription = {
    planId: 'basic',
    status: 'active',
    endDate: null,
  };

  const handleSubscribe = (planId: string) => {
    if (planId === 'basic') {
      toast({
        title: "Basic Plan",
        description: "You're already on the Basic plan!",
      });
      return;
    }

    // In a real app, this would integrate with Stripe or another payment processor
    setSelectedPlan(planId);
    
    toast({
      title: "Subscription Selected",
      description: "Redirecting to payment...",
    });
    
    // Simulate payment process
    setTimeout(() => {
      toast({
        title: "Subscription Activated!",
        description: `Welcome to ${plans.find(p => p.id === planId)?.name}! Your benefits are now active.`,
      });
      setSelectedPlan(null);
    }, 2000);
  };

  const getPrice = (plan: typeof plans[0]) => {
    if (plan.monthlyPrice === 0) return 'Free';
    const price = billingInterval === 'monthly' ? plan.monthlyPrice : plan.yearlyPrice;
    const interval = billingInterval === 'monthly' ? 'month' : 'year';
    return `$${price}/${interval}`;
  };

  const getSavings = (plan: typeof plans[0]) => {
    if (plan.monthlyPrice === 0) return null;
    const monthlyCost = plan.monthlyPrice * 12;
    const yearlyCost = plan.yearlyPrice;
    const savings = monthlyCost - yearlyCost;
    return savings > 0 ? `Save $${savings}/year` : null;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading subscription options...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-primary text-white p-4 pt-12">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="icon"
            className="text-white hover:bg-white/20"
            onClick={() => setLocation("/profile")}
          >
            <ArrowLeft className="w-6 h-6" />
          </Button>
          <h1 className="text-xl font-semibold">Subscription Plans</h1>
        </div>
      </div>

      <div className="p-4 -mt-6 bg-gray-50 rounded-t-3xl relative z-10">
        {/* Current Subscription Status */}
        <Card className="mb-6 bg-gradient-to-r from-blue-500 to-purple-600 text-white border-0">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold mb-1">Current Plan</h3>
                <p className="text-blue-100">
                  {plans.find(p => p.id === currentSubscription.planId)?.name || 'Basic'} Plan
                </p>
              </div>
              <div className="text-right">
                <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                  {currentSubscription.status}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Billing Toggle */}
        <div className="flex items-center justify-center space-x-4 mb-8">
          <span className={`text-sm ${billingInterval === 'monthly' ? 'font-medium text-gray-900' : 'text-gray-600'}`}>
            Monthly
          </span>
          <Switch
            checked={billingInterval === 'yearly'}
            onCheckedChange={(checked) => setBillingInterval(checked ? 'yearly' : 'monthly')}
          />
          <span className={`text-sm ${billingInterval === 'yearly' ? 'font-medium text-gray-900' : 'text-gray-600'}`}>
            Yearly
          </span>
          {billingInterval === 'yearly' && (
            <Badge variant="secondary" className="bg-green-100 text-green-800">
              Save up to 17%
            </Badge>
          )}
        </div>

        {/* Subscription Plans */}
        <div className="space-y-4">
          {plans.map((plan) => {
            const isCurrentPlan = currentSubscription.planId === plan.id;
            const savings = getSavings(plan);
            
            return (
              <Card key={plan.id} className={`relative ${plan.color} ${plan.popular ? 'ring-2 ring-blue-500' : ''}`}>
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-blue-600 text-white px-3 py-1">
                      Most Popular
                    </Badge>
                  </div>
                )}
                
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${plan.buttonColor.replace('hover:', '').replace('bg-', 'bg-').replace('-600', '-100')} text-white`}>
                        {plan.icon}
                      </div>
                      <div>
                        <CardTitle className="text-xl">{plan.name}</CardTitle>
                        <p className="text-sm text-gray-600 mt-1">{plan.description}</p>
                      </div>
                    </div>
                    {isCurrentPlan && (
                      <Badge variant="secondary" className="bg-green-100 text-green-800">
                        Current
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                
                <CardContent className="pt-0">
                  <div className="mb-6">
                    <div className="flex items-baseline space-x-2">
                      <span className="text-3xl font-bold text-gray-900">
                        {getPrice(plan)}
                      </span>
                      {billingInterval === 'yearly' && savings && (
                        <span className="text-sm text-green-600 font-medium">
                          {savings}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <ul className="space-y-3 mb-6">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-start space-x-2">
                        <Check className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  
                  <Button
                    className={`w-full ${plan.buttonColor}`}
                    onClick={() => handleSubscribe(plan.id)}
                    disabled={isCurrentPlan || selectedPlan === plan.id}
                  >
                    {selectedPlan === plan.id ? (
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Processing...</span>
                      </div>
                    ) : isCurrentPlan ? (
                      'Current Plan'
                    ) : plan.monthlyPrice === 0 ? (
                      'Get Started'
                    ) : (
                      `Upgrade to ${plan.name}`
                    )}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Features Comparison */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Clock className="w-5 h-5" />
              <span>Why Upgrade?</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-start space-x-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <i className="fas fa-percentage text-blue-600"></i>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">Save Money</h4>
                  <p className="text-sm text-gray-600">
                    Get discounts on all services and avoid booking fees
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <i className="fas fa-clock text-green-600"></i>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">Priority Access</h4>
                  <p className="text-sm text-gray-600">
                    Get faster booking confirmations and priority support
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <i className="fas fa-star text-purple-600"></i>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">Premium Providers</h4>
                  <p className="text-sm text-gray-600">
                    Access to top-rated, verified service providers
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <i className="fas fa-shield-alt text-yellow-600"></i>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">Enhanced Protection</h4>
                  <p className="text-sm text-gray-600">
                    Extended warranties and satisfaction guarantees
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* FAQ */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <h4 className="font-medium text-blue-900 mb-2">Questions about subscriptions?</h4>
          <p className="text-sm text-blue-700 mb-3">
            You can cancel anytime, and your benefits will continue until the end of your billing period.
            No hidden fees or long-term commitments.
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setLocation("/profile/help")}
            className="border-blue-300 text-blue-700 hover:bg-blue-100"
          >
            Contact Support
          </Button>
        </div>
      </div>
    </div>
  );
}