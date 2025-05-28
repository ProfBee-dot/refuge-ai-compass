import { Button } from "@/components/ui/button";
import { Globe, Heart, Users, Shield, Home, LogOut } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useUser } from "@/hooks/useUserContext";
import { UserProfileDropdown } from "./UserProfileDropdown";
import { LoginModal } from "./LoginModal";
import { useState } from "react";

export const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useUser();
  const [isLoginOpen, setIsLoginOpen] = useState(false);

  const navItems = [
    { 
      id: 'home', 
      label: 'Home', 
      path: '/', 
      icon: Home 
    },
    { 
      id: 'world', 
      label: 'Volunteer Portal', 
      path: '/world', 
      icon: Globe 
    },
    { 
      id: 'refugee', 
      label: 'Refugee Portal', 
      path: '/refugee-portal', 
      icon: Users 
    },
    { 
      id: 'donor', 
      label: 'Donor Portal', 
      path: '/donor-portal', 
      icon: Heart 
    },
    { 
      id: 'admin', 
      label: 'Admin Panel', 
      path: '/admin-portal', 
      icon: Shield 
    }
  ];

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur-sm">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div 
            className="flex items-center space-x-2 cursor-pointer"
            onClick={() => navigate('/')}
          >
            <Globe className="h-8 w-8 text-blue-600" />
            <span className="text-xl font-bold text-gray-900">RefugeeAid</span>
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);
              
              return (
                <Button
                  key={item.id}
                  variant={active ? "default" : "ghost"}
                  size="sm"
                  onClick={() => navigate(item.path)}
                  className={`flex items-center space-x-2 transition-all duration-200 ${
                    active 
                      ? "bg-blue-600 text-white shadow-md" 
                      : "text-gray-600 hover:text-blue-600 hover:bg-blue-50"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span className="hidden lg:inline">{item.label}</span>
                </Button>
              );
            })}
          </nav>

          {/* User Actions */}
          <div className="flex items-center space-x-3">
            {user ? (
              <div className="flex items-center space-x-2">
                <UserProfileDropdown />
                <Button 
                  onClick={logout}
                  variant="outline"
                  size="sm"
                  className="flex items-center space-x-2 text-red-600 hover:bg-red-50 hover:text-red-700"
                >
                  <LogOut className="h-4 w-4" />
                  <span className="hidden sm:inline">Sign Out</span>
                </Button>
              </div>
            ) : (
              <Button 
                onClick={() => setIsLoginOpen(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                Sign In
              </Button>
            )}
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden pb-3">
          <div className="flex flex-wrap gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);
              
              return (
                <Button
                  key={item.id}
                  variant={active ? "default" : "ghost"}
                  size="sm"
                  onClick={() => navigate(item.path)}
                  className={`flex items-center space-x-1 text-xs ${
                    active 
                      ? "bg-blue-600 text-white" 
                      : "text-gray-600 hover:text-blue-600"
                  }`}
                >
                  <Icon className="h-3 w-3" />
                  <span>{item.label}</span>
                </Button>
              );
            })}
          </div>
        </div>
      </div>

      <LoginModal isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} />
    </header>
  );
};
