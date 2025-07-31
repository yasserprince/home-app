import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { ArrowLeft, Bell, Mail, MessageSquare, Calendar } from "lucide-react";

export default function Notifications() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  
  const [settings, setSettings] = useState({
    pushNotifications: true,
    emailNotifications: true,
    bookingUpdates: true,
    bookingReminders: true,
    providerMessages: true,
    promotions: false,
    weeklyDigest: true,
    serviceRecommendations: true,
  });

  const handleToggle = (key: string) => {
    setSettings(prev => ({
      ...prev,
      [key]: !prev[key as keyof typeof prev],
    }));
    
    // In a real app, this would save to the backend
    toast({
      title: "Settings Updated",
      description: "Your notification preferences have been saved",
    });
  };

  const notificationGroups = [
    {
      title: "Booking Notifications",
      icon: <Calendar className="w-5 h-5" />,
      color: "bg-blue-100 text-blue-600",
      settings: [
        {
          key: "bookingUpdates",
          label: "Booking Updates",
          description: "Get notified when your booking status changes",
          value: settings.bookingUpdates,
        },
        {
          key: "bookingReminders",
          label: "Booking Reminders",
          description: "Receive reminders before your scheduled service",
          value: settings.bookingReminders,
        },
      ],
    },
    {
      title: "Communication",
      icon: <MessageSquare className="w-5 h-5" />,
      color: "bg-green-100 text-green-600",
      settings: [
        {
          key: "providerMessages",
          label: "Provider Messages",
          description: "Get notified when service providers message you",
          value: settings.providerMessages,
        },
      ],
    },
    {
      title: "Marketing & Recommendations",
      icon: <Bell className="w-5 h-5" />,
      color: "bg-purple-100 text-purple-600",
      settings: [
        {
          key: "promotions",
          label: "Promotions & Offers",
          description: "Receive special offers and promotional updates",
          value: settings.promotions,
        },
        {
          key: "serviceRecommendations",
          label: "Service Recommendations",
          description: "Get personalized service suggestions",
          value: settings.serviceRecommendations,
        },
        {
          key: "weeklyDigest",
          label: "Weekly Digest",
          description: "Receive a summary of available services and tips",
          value: settings.weeklyDigest,
        },
      ],
    },
  ];

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
          <h1 className="text-xl font-semibold">Notifications</h1>
        </div>
      </div>

      <div className="p-4 -mt-6 bg-gray-50 rounded-t-3xl relative z-10">
        {/* Primary Notification Methods */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Bell className="w-5 h-5" />
              <span>Notification Methods</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                  <Bell className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <Label htmlFor="pushNotifications" className="text-base font-medium">
                    Push Notifications
                  </Label>
                  <p className="text-sm text-gray-600">
                    Receive instant notifications on your device
                  </p>
                </div>
              </div>
              <Switch
                id="pushNotifications"
                checked={settings.pushNotifications}
                onCheckedChange={() => handleToggle("pushNotifications")}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Mail className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <Label htmlFor="emailNotifications" className="text-base font-medium">
                    Email Notifications
                  </Label>
                  <p className="text-sm text-gray-600">
                    Receive notifications via email
                  </p>
                </div>
              </div>
              <Switch
                id="emailNotifications"
                checked={settings.emailNotifications}
                onCheckedChange={() => handleToggle("emailNotifications")}
              />
            </div>
          </CardContent>
        </Card>

        {/* Notification Categories */}
        <div className="space-y-4">
          {notificationGroups.map((group) => (
            <Card key={group.title}>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${group.color}`}>
                    {group.icon}
                  </div>
                  <span>{group.title}</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {group.settings.map((setting) => (
                  <div key={setting.key} className="flex items-center justify-between">
                    <div className="flex-1">
                      <Label htmlFor={setting.key} className="text-base font-medium">
                        {setting.label}
                      </Label>
                      <p className="text-sm text-gray-600 mt-1">
                        {setting.description}
                      </p>
                    </div>
                    <Switch
                      id={setting.key}
                      checked={setting.value}
                      onCheckedChange={() => handleToggle(setting.key)}
                    />
                  </div>
                ))}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Information Card */}
        <div className="mt-6 p-4 bg-amber-50 rounded-lg">
          <div className="flex items-start space-x-3">
            <i className="fas fa-info-circle text-amber-600 mt-1"></i>
            <div>
              <h4 className="font-medium text-amber-900">Managing Notifications</h4>
              <p className="text-sm text-amber-700 mt-1">
                You can also manage notification permissions in your device settings. 
                Some notifications may be disabled if you've turned off permissions for this app.
              </p>
            </div>
          </div>
        </div>

        {/* Test Notification Button */}
        <Button
          variant="outline"
          className="w-full mt-4"
          onClick={() => toast({
            title: "Test Notification",
            description: "This is how your notifications will look!",
          })}
        >
          <Bell className="w-4 h-4 mr-2" />
          Send Test Notification
        </Button>
      </div>
    </div>
  );
}