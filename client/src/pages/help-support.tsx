import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { ArrowLeft, HelpCircle, MessageCircle, Phone, Mail, Search } from "lucide-react";

export default function HelpSupport() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [contactForm, setContactForm] = useState({
    subject: "",
    message: "",
    category: "general",
  });

  const handleSubmitContact = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!contactForm.subject || !contactForm.message) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    // In a real app, this would submit to backend
    toast({
      title: "Message Sent",
      description: "We'll get back to you within 24 hours",
    });
    
    setContactForm({
      subject: "",
      message: "",
      category: "general",
    });
  };

  const faqItems = [
    {
      question: "How do I book a service?",
      answer: "To book a service, go to the home page, select a service category, choose a provider, and fill out the booking form with your preferred date and time. You'll receive a confirmation once the booking is submitted.",
    },
    {
      question: "How can I cancel or reschedule my booking?",
      answer: "You can cancel or reschedule your booking up to 2 hours before the scheduled time. Go to 'My Bookings', find your booking, and select 'Cancel' or 'Reschedule'. Some providers may charge a cancellation fee.",
    },
    {
      question: "What payment methods do you accept?",
      answer: "We accept all major credit cards (Visa, Mastercard, American Express), debit cards, and digital wallets. You can manage your payment methods in your profile settings.",
    },
    {
      question: "How do I add a review for a service provider?",
      answer: "After your service is completed, you'll receive a notification to rate and review the provider. You can also leave reviews by going to your booking history and selecting 'Leave Review'.",
    },
    {
      question: "What if I'm not satisfied with the service?",
      answer: "If you're not satisfied with a service, please contact our support team within 24 hours. We'll work with you and the provider to resolve the issue and ensure your satisfaction.",
    },
    {
      question: "How do I update my profile information?",
      answer: "Go to your Profile page and tap 'Edit Profile'. You can update your personal information, add addresses, and change your notification preferences.",
    },
    {
      question: "Are the service providers insured?",
      answer: "Yes, all service providers on our platform are required to have proper insurance and licenses. We verify their credentials before they can offer services through our app.",
    },
    {
      question: "How do I get a refund?",
      answer: "Refund eligibility depends on the specific circumstances and timing of your request. Contact our support team with your booking details, and we'll review your case according to our refund policy.",
    },
  ];

  const filteredFAQs = faqItems.filter(item =>
    item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const contactOptions = [
    {
      title: "Live Chat",
      description: "Chat with our support team",
      icon: <MessageCircle className="w-6 h-6" />,
      color: "bg-blue-100 text-blue-600",
      action: () => toast({ title: "Live Chat", description: "Live chat feature coming soon!" }),
    },
    {
      title: "Call Us",
      description: "1-800-SERVICES (24/7)",
      icon: <Phone className="w-6 h-6" />,
      color: "bg-green-100 text-green-600",
      action: () => window.open("tel:+1-800-737-8423"),
    },
    {
      title: "Email Support",
      description: "support@homeservices.com",
      icon: <Mail className="w-6 h-6" />,
      color: "bg-purple-100 text-purple-600",
      action: () => window.open("mailto:support@homeservices.com"),
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
          <h1 className="text-xl font-semibold">Help & Support</h1>
        </div>
      </div>

      <div className="p-4 -mt-6 bg-gray-50 rounded-t-3xl relative z-10">
        {/* Quick Contact Options */}
        <div className="grid grid-cols-1 gap-4 mb-6">
          {contactOptions.map((option) => (
            <Card key={option.title} className="cursor-pointer hover:shadow-md transition-shadow">
              <CardContent className="p-4" onClick={option.action}>
                <div className="flex items-center space-x-4">
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${option.color}`}>
                    {option.icon}
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">{option.title}</h3>
                    <p className="text-sm text-gray-600">{option.description}</p>
                  </div>
                  <i className="fas fa-chevron-right text-gray-400 ml-auto"></i>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* FAQ Section */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <HelpCircle className="w-5 h-5" />
              <span>Frequently Asked Questions</span>
            </CardTitle>
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Search FAQs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible className="w-full">
              {filteredFAQs.map((faq, index) => (
                <AccordionItem key={index} value={`item-${index}`}>
                  <AccordionTrigger className="text-left">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-gray-600">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
            
            {filteredFAQs.length === 0 && searchQuery && (
              <p className="text-center text-gray-500 py-8">
                No FAQs found matching "{searchQuery}". Try a different search term or contact support.
              </p>
            )}
          </CardContent>
        </Card>

        {/* Contact Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <MessageCircle className="w-5 h-5" />
              <span>Send us a Message</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmitContact} className="space-y-4">
              <div>
                <Label htmlFor="category">Category</Label>
                <select
                  id="category"
                  value={contactForm.category}
                  onChange={(e) => setContactForm(prev => ({ ...prev, category: e.target.value }))}
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="general">General Question</option>
                  <option value="booking">Booking Issue</option>
                  <option value="payment">Payment Issue</option>
                  <option value="provider">Provider Issue</option>
                  <option value="technical">Technical Problem</option>
                  <option value="feedback">Feedback</option>
                </select>
              </div>
              
              <div>
                <Label htmlFor="subject">Subject *</Label>
                <Input
                  id="subject"
                  value={contactForm.subject}
                  onChange={(e) => setContactForm(prev => ({ ...prev, subject: e.target.value }))}
                  placeholder="Brief description of your issue"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="message">Message *</Label>
                <Textarea
                  id="message"
                  value={contactForm.message}
                  onChange={(e) => setContactForm(prev => ({ ...prev, message: e.target.value }))}
                  placeholder="Please provide as much detail as possible..."
                  rows={4}
                  required
                />
              </div>
              
              <Button type="submit" className="w-full">
                <MessageCircle className="w-4 h-4 mr-2" />
                Send Message
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Additional Resources */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <div className="flex items-start space-x-3">
            <i className="fas fa-lightbulb text-blue-600 mt-1"></i>
            <div>
              <h4 className="font-medium text-blue-900">Need immediate help?</h4>
              <p className="text-sm text-blue-700 mt-1">
                For urgent issues or emergencies, please call our 24/7 support line at 1-800-SERVICES.
                Our team is always ready to help!
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}