import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { ArrowLeft, Plus, MapPin, Home, Briefcase, Trash2, Edit } from "lucide-react";

export default function SavedAddresses() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [showAddAddress, setShowAddAddress] = useState(false);
  const [editingAddress, setEditingAddress] = useState<string | null>(null);
  
  const [addresses, setAddresses] = useState([
    {
      id: "1",
      label: "Home",
      type: "home",
      address: "123 Main Street",
      city: "New York",
      state: "NY",
      zipCode: "10001",
      isDefault: true,
    },
    {
      id: "2",
      label: "Office",
      type: "work",
      address: "456 Business Ave, Suite 200",
      city: "New York",
      state: "NY", 
      zipCode: "10002",
      isDefault: false,
    }
  ]);

  const [newAddress, setNewAddress] = useState({
    label: "",
    type: "home",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    isDefault: false,
  });

  const handleAddAddress = () => {
    if (!newAddress.label || !newAddress.address || !newAddress.city || !newAddress.state || !newAddress.zipCode) {
      toast({
        title: "Error",
        description: "Please fill in all address fields",
        variant: "destructive",
      });
      return;
    }

    const addressToAdd = {
      ...newAddress,
      id: Date.now().toString(),
    };

    // If this is set as default, update others
    if (newAddress.isDefault) {
      setAddresses(prev => prev.map(addr => ({ ...addr, isDefault: false })));
    }

    setAddresses(prev => [...prev, addressToAdd]);
    setNewAddress({
      label: "",
      type: "home",
      address: "",
      city: "",
      state: "",
      zipCode: "",
      isDefault: false,
    });
    setShowAddAddress(false);
    
    toast({
      title: "Success",
      description: "Address saved successfully",
    });
  };

  const handleDeleteAddress = (id: string) => {
    setAddresses(prev => {
      const updated = prev.filter(addr => addr.id !== id);
      // If we deleted the default address and there are others, make the first one default
      if (updated.length > 0 && !updated.some(addr => addr.isDefault)) {
        updated[0].isDefault = true;
      }
      return updated;
    });
    
    toast({
      title: "Success", 
      description: "Address deleted",
    });
  };

  const handleSetDefault = (id: string) => {
    setAddresses(prev =>
      prev.map(addr => ({
        ...addr,
        isDefault: addr.id === id,
      }))
    );
    
    toast({
      title: "Success",
      description: "Default address updated",
    });
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'home':
        return <Home className="w-5 h-5" />;
      case 'work':
        return <Briefcase className="w-5 h-5" />;
      default:
        return <MapPin className="w-5 h-5" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'home':
        return 'bg-blue-100 text-blue-600';
      case 'work':
        return 'bg-green-100 text-green-600';
      default:
        return 'bg-gray-100 text-gray-600';  
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
          <h1 className="text-xl font-semibold">Saved Addresses</h1>
        </div>
      </div>

      <div className="p-4 -mt-6 bg-gray-50 rounded-t-3xl relative z-10">
        {/* Existing Addresses */}
        <div className="space-y-4 mb-6">
          {addresses.map((address) => (
            <Card key={address.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3 flex-1">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${getTypeColor(address.type)}`}>
                      {getTypeIcon(address.type)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <h3 className="font-medium">{address.label}</h3>
                        {address.isDefault && (
                          <span className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full">
                            Default
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600">{address.address}</p>
                      <p className="text-sm text-gray-600">
                        {address.city}, {address.state} {address.zipCode}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 ml-4">
                    {!address.isDefault && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleSetDefault(address.id)}
                      >
                        Set Default
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-gray-500 hover:bg-gray-100"
                      onClick={() => setEditingAddress(address.id)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"  
                      size="icon"
                      className="text-red-500 hover:bg-red-50"
                      onClick={() => handleDeleteAddress(address.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Add New Address */}
        {!showAddAddress ? (
          <Button
            onClick={() => setShowAddAddress(true)}
            className="w-full py-3 border-2 border-dashed border-gray-300 text-gray-600 hover:border-primary hover:text-primary"
            variant="ghost"
          >
            <Plus className="w-5 h-5 mr-2" />
            Add New Address
          </Button>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <MapPin className="w-5 h-5" />
                <span>Add New Address</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="label">Address Label</Label>
                  <Input
                    id="label"
                    value={newAddress.label}
                    onChange={(e) => setNewAddress(prev => ({ ...prev, label: e.target.value }))}
                    placeholder="Home, Office, etc."
                  />
                </div>
                <div>
                  <Label htmlFor="type">Type</Label>
                  <select
                    id="type"
                    value={newAddress.type}
                    onChange={(e) => setNewAddress(prev => ({ ...prev, type: e.target.value }))}
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="home">Home</option>
                    <option value="work">Work</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>
              
              <div>
                <Label htmlFor="address">Street Address</Label>
                <Textarea
                  id="address"
                  value={newAddress.address}
                  onChange={(e) => setNewAddress(prev => ({ ...prev, address: e.target.value }))}
                  placeholder="123 Main Street, Apt 4B"
                  rows={2}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    value={newAddress.city}
                    onChange={(e) => setNewAddress(prev => ({ ...prev, city: e.target.value }))}
                    placeholder="New York"
                  />
                </div>
                <div>
                  <Label htmlFor="state">State</Label>
                  <Input
                    id="state"
                    value={newAddress.state}
                    onChange={(e) => setNewAddress(prev => ({ ...prev, state: e.target.value }))}
                    placeholder="NY"
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="zipCode">ZIP Code</Label>
                <Input
                  id="zipCode"
                  value={newAddress.zipCode}
                  onChange={(e) => setNewAddress(prev => ({ ...prev, zipCode: e.target.value }))}
                  placeholder="10001"
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="isDefault" className="text-base font-medium">
                    Set as Default Address
                  </Label>
                  <p className="text-sm text-gray-600">
                    Use this as your primary service address
                  </p>
                </div>
                <Switch
                  id="isDefault"
                  checked={newAddress.isDefault}
                  onCheckedChange={(checked) => setNewAddress(prev => ({ ...prev, isDefault: checked }))}
                />
              </div>
              
              <div className="flex space-x-3 pt-4">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setShowAddAddress(false)}
                >
                  Cancel
                </Button>
                <Button
                  className="flex-1"
                  onClick={handleAddAddress}
                >
                  Save Address
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="mt-6 p-4 bg-yellow-50 rounded-lg">
          <div className="flex items-start space-x-3">
            <i className="fas fa-map-marker-alt text-yellow-600 mt-1"></i>
            <div>
              <h4 className="font-medium text-yellow-900">Location Services</h4>
              <p className="text-sm text-yellow-700 mt-1">
                Saved addresses help service providers reach you quickly and ensure accurate service delivery.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}