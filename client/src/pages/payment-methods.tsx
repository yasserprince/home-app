import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { ArrowLeft, Plus, CreditCard, Trash2 } from "lucide-react";

export default function PaymentMethods() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [showAddCard, setShowAddCard] = useState(false);
  
  // Mock payment methods - in real app these would come from API
  const [paymentMethods, setPaymentMethods] = useState([
    {
      id: "1",
      type: "card",
      last4: "4242",
      brand: "visa",
      expiryMonth: 12,
      expiryYear: 2028,
      isDefault: true,
    },
    {
      id: "2", 
      type: "card",
      last4: "5555",
      brand: "mastercard",
      expiryMonth: 8,
      expiryYear: 2027,
      isDefault: false,
    }
  ]);

  const [newCard, setNewCard] = useState({
    cardNumber: "",
    expiryMonth: "",
    expiryYear: "",
    cvc: "",
    cardholderName: "",
  });

  const handleAddCard = () => {
    // Validate card details
    if (!newCard.cardNumber || !newCard.expiryMonth || !newCard.expiryYear || !newCard.cvc || !newCard.cardholderName) {
      toast({
        title: "Error",
        description: "Please fill in all card details",
        variant: "destructive",
      });
      return;
    }

    // In a real app, this would call Stripe or another payment processor
    const last4 = newCard.cardNumber.slice(-4);
    const brand = newCard.cardNumber.startsWith('4') ? 'visa' : 'mastercard';
    
    const newPaymentMethod = {
      id: Date.now().toString(),
      type: "card",
      last4,
      brand,
      expiryMonth: parseInt(newCard.expiryMonth),
      expiryYear: parseInt(newCard.expiryYear),
      isDefault: paymentMethods.length === 0,
    };

    setPaymentMethods(prev => [...prev, newPaymentMethod]);
    setNewCard({
      cardNumber: "",
      expiryMonth: "",
      expiryYear: "",
      cvc: "",
      cardholderName: "",
    });
    setShowAddCard(false);
    
    toast({
      title: "Success",
      description: "Payment method added successfully",
    });
  };

  const handleDeleteCard = (id: string) => {
    setPaymentMethods(prev => {
      const updated = prev.filter(method => method.id !== id);
      // If we deleted the default card and there are others, make the first one default
      if (updated.length > 0 && !updated.some(method => method.isDefault)) {
        updated[0].isDefault = true;
      }
      return updated;
    });
    
    toast({
      title: "Success",
      description: "Payment method removed",
    });
  };

  const handleSetDefault = (id: string) => {
    setPaymentMethods(prev =>
      prev.map(method => ({
        ...method,
        isDefault: method.id === id,
      }))
    );
    
    toast({
      title: "Success",
      description: "Default payment method updated",
    });
  };

  const getBrandIcon = (brand: string) => {
    switch (brand) {
      case 'visa':
        return 'fab fa-cc-visa';
      case 'mastercard':
        return 'fab fa-cc-mastercard';
      case 'amex':
        return 'fab fa-cc-amex';
      default:
        return 'fas fa-credit-card';
    }
  };

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
          <h1 className="text-xl font-semibold">Payment Methods</h1>
        </div>
      </div>

      <div className="p-4 -mt-6 bg-gray-50 rounded-t-3xl relative z-10">
        {/* Existing Payment Methods */}
        <div className="space-y-4 mb-6">
          {paymentMethods.map((method) => (
            <Card key={method.id}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-8 bg-gray-100 rounded flex items-center justify-center">
                      <i className={`${getBrandIcon(method.brand)} text-lg text-gray-600`}></i>
                    </div>
                    <div>
                      <p className="font-medium">•••• •••• •••• {method.last4}</p>
                      <p className="text-sm text-gray-600">
                        Expires {method.expiryMonth.toString().padStart(2, '0')}/{method.expiryYear}
                      </p>
                      {method.isDefault && (
                        <span className="inline-block mt-1 px-2 py-1 bg-primary/10 text-primary text-xs rounded-full">
                          Default
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {!method.isDefault && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleSetDefault(method.id)}
                      >
                        Set Default
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-red-500 hover:bg-red-50"
                      onClick={() => handleDeleteCard(method.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Add New Card */}
        {!showAddCard ? (
          <Button
            onClick={() => setShowAddCard(true)}
            className="w-full py-3 border-2 border-dashed border-gray-300 text-gray-600 hover:border-primary hover:text-primary"
            variant="ghost"
          >
            <Plus className="w-5 h-5 mr-2" />
            Add New Payment Method
          </Button>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <CreditCard className="w-5 h-5" />
                <span>Add New Card</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="cardholderName">Cardholder Name</Label>
                <Input
                  id="cardholderName"
                  value={newCard.cardholderName}
                  onChange={(e) => setNewCard(prev => ({ ...prev, cardholderName: e.target.value }))}
                  placeholder="John Doe"
                />
              </div>
              
              <div>
                <Label htmlFor="cardNumber">Card Number</Label>
                <Input
                  id="cardNumber"
                  value={newCard.cardNumber}
                  onChange={(e) => {
                    // Basic formatting for demo
                    const value = e.target.value.replace(/\s/g, '').replace(/[^0-9]/g, '');
                    const formatted = value.replace(/(.{4})/g, '$1 ').trim();
                    if (value.length <= 16) {
                      setNewCard(prev => ({ ...prev, cardNumber: value }));
                    }
                  }}
                  placeholder="1234 5678 9012 3456"
                  maxLength={19}
                />
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="expiryMonth">Month</Label>
                  <Input
                    id="expiryMonth"
                    type="number"
                    min="1"
                    max="12"
                    value={newCard.expiryMonth}
                    onChange={(e) => setNewCard(prev => ({ ...prev, expiryMonth: e.target.value }))}
                    placeholder="MM"
                  />
                </div>
                <div>
                  <Label htmlFor="expiryYear">Year</Label>
                  <Input
                    id="expiryYear"
                    type="number"
                    min={new Date().getFullYear()}
                    value={newCard.expiryYear}
                    onChange={(e) => setNewCard(prev => ({ ...prev, expiryYear: e.target.value }))}
                    placeholder="YYYY"
                  />
                </div>
                <div>
                  <Label htmlFor="cvc">CVC</Label>
                  <Input
                    id="cvc"
                    type="number"
                    value={newCard.cvc}
                    onChange={(e) => {
                      if (e.target.value.length <= 4) {
                        setNewCard(prev => ({ ...prev, cvc: e.target.value }));
                      }
                    }}
                    placeholder="123"
                    maxLength={4}
                  />
                </div>
              </div>
              
              <div className="flex space-x-3 pt-4">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setShowAddCard(false)}
                >
                  Cancel
                </Button>
                <Button
                  className="flex-1"
                  onClick={handleAddCard}
                >
                  Add Card
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <div className="flex items-start space-x-3">
            <i className="fas fa-shield-alt text-blue-600 mt-1"></i>
            <div>
              <h4 className="font-medium text-blue-900">Secure Payment Processing</h4>
              <p className="text-sm text-blue-700 mt-1">
                Your payment information is encrypted and secure. We never store your full card details.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}