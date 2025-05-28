
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Globe, Heart, Shield, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useUser } from "@/hooks/useUserContext";
import { LoginModal } from './LoginModal';
import { useState } from "react";

export const PortalSelector = () => {
  const navigate = useNavigate();
  const { user } = useUser();
  const [isLoginOpen, setIsLoginOpen] = useState(false);

  const portals = [
    {
      id: "world",
      title: "Volunteer Portal",
      description: "Public dashboard with global refugee support data",
      icon: Globe,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      borderColor: "border-blue-200",
      route: "/world",
      public: true
    },
    {
      id: "refugee",
      title: "Refugee Portal",
      description: "Assistance dashboard for refugees",
      icon: Users,
      color: "text-green-600",
      bgColor: "bg-green-50",
      borderColor: "border-green-200",
      route: "/refugee-portal",
      roles: ['user', 'admin']
    },
    {
      id: "donor",
      title: "Donor Portal",
      description: "Campaign management and donation tracking",
      icon: Heart,
      color: "text-red-600",
      bgColor: "bg-red-50",
      borderColor: "border-red-200",
      route: "/donor-portal",
      roles: ['donor', 'admin']
    },
    {
      id: "admin",
      title: "Admin Panel",
      description: "Super-admin controls and approvals",
      icon: Shield,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      borderColor: "border-purple-200",
      route: "/admin-portal",
      roles: ['admin']
    }
  ];

  const canAccessPortal = (portal: any) => {
    // Everyone can access all portals now
    return true;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br start-anime from-blue-50 via-white to-cyan-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Refugee Support Platform</h1>
          <p className="text-xl text-gray-600">Choose your portal to access platform features</p>
          {user && (
            <div className="mt-4">
              <Badge variant="outline" className="text-sm">
                Logged in as: {user.name} ({user.role})
              </Badge>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {portals.map((portal) => {
            const Icon = portal.icon;
            const hasAccess = canAccessPortal(portal);
            
            return (
              <Card 
                key={portal.id} 
                className={`hover:shadow-lg transition-all duration-200 cursor-pointer ${portal.borderColor}`}
              >
                <CardContent className="p-6">
                  <div className={`w-12 h-12 rounded-lg ${portal.bgColor} flex items-center justify-center mb-4`}>
                    <Icon className={`w-6 h-6 ${portal.color}`} />
                  </div>
                  
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{portal.title}</h3>
                  <p className="text-gray-600 mb-4">{portal.description}</p>
                  
                  <div className="flex items-center justify-between">
                    <Button onClick={() => navigate(portal.route)}>
                      Enter Portal
                    </Button>
                    
                    <Badge variant="outline" className="text-xs">
                      Open Access
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {!user && (
          <>
            <div className="mt-8 text-center sticky bottom-5">
              <Card className="max-w-md mx-auto">
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold mb-2">Need an Account?</h3>
                  <p className="text-gray-600 mb-4">
                    Sign in to access personalized portals based on your role
                  </p>
                  <Button
                    onClick={() => setIsLoginOpen(true)}
                    className="w-full transition-all duration-300 hover:scale-105 hover:shadow-lg">
                    Sign In / Register
                  </Button>
                </CardContent>
              </Card>
            </div>
            
            <LoginModal isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} />
          </>
        )}
      </div>
    </div>
  );
};
