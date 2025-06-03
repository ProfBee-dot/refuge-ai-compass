
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LoginModal } from './LoginModal';
import {  Users, Globe, Shield, MessageCircle, DollarSign } from 'lucide-react';
import Footer from './Footer';

export const LandingPage = () => {
  const [isLoginOpen, setIsLoginOpen] = useState(false);

  const features = [
    {
      icon: MessageCircle,
      title: "AI Assistant",
      description: "Get instant help and guidance from our intelligent chatbot"
    },
    {
      icon: DollarSign,
      title: "Fundraising",
      description: "Create and manage fundraising campaigns for refugee support"
    },
    {
      icon: Users,
      title: "Community Support",
      description: "Connect with volunteers and organizations worldwide"
    },
    {
      icon: Shield,
      title: "Secure Platform",
      description: "Your data is protected with enterprise-grade security"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50">

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-6 py-16">
        <div className="text-center mb-16">
          <h2 className="text-5xl font-bold text-gray-900 mb-6">
            Empowering Refugee Support Through{' '}
            <span className="bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
              AI Technology
            </span>
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Connect refugees with resources, volunteers with opportunities, and donors with meaningful impact. 
            Our AI-powered platform streamlines humanitarian aid delivery worldwide.
          </p>
          <div className="flex items-center justify-center space-x-4">
            <Button 
              size="lg" 
              onClick={() => setIsLoginOpen(true)}
              className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 px-8 py-3"
            >
              Join Our Mission
            </Button>
            <Button variant="outline" size="lg" className="px-8 py-3">
              Learn More
            </Button>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Card key={index} className="hover:shadow-lg transition-all duration-300 hover:scale-105">
                <CardHeader className="text-center">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <Icon className="w-6 h-6 text-blue-600" />
                  </div>
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 text-center">{feature.description}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Statistics */}
        <div className="bg-white rounded-2xl border border-blue-100 p-8 mb-16">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-blue-600 mb-2">2,847</div>
              <div className="text-gray-600">Active Cases</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-green-600 mb-2">$1.2M</div>
              <div className="text-gray-600">Funds Raised</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-purple-600 mb-2">15,234</div>
              <div className="text-gray-600">Resources Delivered</div>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center">
          <Card className="border-blue-200 bg-gradient-to-r from-blue-50 to-cyan-50">
            <CardContent className="p-8">
              <Globe className="w-16 h-16 text-blue-600 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Ready to Make a Difference?
              </h3>
              <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
                Join thousands of volunteers, donors, and organizations using RefugeeAI 
                to create meaningful impact in refugee communities worldwide.
              </p>
              <Button 
                size="lg" 
                onClick={() => setIsLoginOpen(true)}
                className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600"
              >
                Start Your Journey
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />

      <LoginModal isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} />
    </div>
  );
};
