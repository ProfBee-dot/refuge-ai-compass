
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { useUser, User, UserRole } from '@/contexts/UserContext';
import { Heart, Shield, Users, DollarSign, Eye, EyeOff } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LoginModal = ({ isOpen, onClose }: LoginModalProps) => {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    organization: '',
  });
  const { login } = useUser();
  const { toast } = useToast();

  // Demo credentials for different roles
  const demoCredentials = {
    admin: { email: 'admin@refugeeai.org', password: 'admin123' },
    volunteer: { email: 'volunteer@refugeeai.org', password: 'volunteer123' },
    donor: { email: 'donor@refugeeai.org', password: 'donor123' },
    user: { email: 'refugee@refugeeai.org', password: 'user123' }
  };

  const resetForm = () => {
    setFormData({ name: '', email: '', password: '', organization: '' });
    setShowPassword(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isLogin) {
      // Authenticate user
      let authenticatedRole: UserRole | null = null;
      let userName = '';
      
      // Check credentials against demo accounts
      for (const [role, credentials] of Object.entries(demoCredentials)) {
        if (formData.email === credentials.email && formData.password === credentials.password) {
          authenticatedRole = role as UserRole;
          userName = role === 'admin' ? 'Admin User' : 
                   role === 'volunteer' ? 'Volunteer User' :
                   role === 'donor' ? 'Donor User' : 'Refugee User';
          break;
        }
      }
      
      if (!authenticatedRole) {
        toast({
          title: "Authentication Failed",
          description: "Invalid email or password. Please try again.",
          variant: "destructive",
        });
        return;
      }

      const userData: User = {
        id: Math.random().toString(36).substr(2, 9),
        name: userName,
        email: formData.email,
        role: authenticatedRole,
        organization: authenticatedRole === 'admin' ? 'RefugeeAI' : formData.organization || undefined,
        verified: true,
      };

      login(userData);
      toast({
        title: "Welcome back!",
        description: `Successfully logged in as ${authenticatedRole}.`,
      });
      resetForm();
      onClose();
    } else {
      // Registration (simplified for demo)
      const userData: User = {
        id: Math.random().toString(36).substr(2, 9),
        name: formData.name,
        email: formData.email,
        role: 'user', // New registrations default to user role
        organization: formData.organization || undefined,
        verified: false,
      };

      login(userData);
      toast({
        title: "Registration successful!",
        description: "Your account has been created. Verification may be required for certain features.",
      });
      resetForm();
      onClose();
    }
  };

  const fillDemoCredentials = (role: UserRole) => {
    const credentials = demoCredentials[role];
    setFormData({
      ...formData,
      email: credentials.email,
      password: credentials.password
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md animate-scale-in">
        <DialogHeader>
          <DialogTitle className="text-center text-xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
            {isLogin ? 'Sign In' : 'Create Account'}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {!isLogin && (
            <div>
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                className="mt-1"
              />
            </div>
          )}
          
          <div>
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
              className="mt-1"
            />
          </div>
          
          <div>
            <Label htmlFor="password">Password</Label>
            <div className="relative mt-1">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
                className="pr-10"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4 text-gray-500" />
                ) : (
                  <Eye className="h-4 w-4 text-gray-500" />
                )}
              </Button>
            </div>
          </div>
          
          {!isLogin && (
            <div>
              <Label htmlFor="organization">Organization (Optional)</Label>
              <Input
                id="organization"
                value={formData.organization}
                onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
                className="mt-1"
                placeholder="NGO, Company, etc."
              />
            </div>
          )}
          
          {isLogin && (
            <div>
              <Label className="text-sm font-medium">Demo Accounts</Label>
              <div className="grid grid-cols-2 gap-2 mt-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => fillDemoCredentials('user')}
                  className="flex items-center space-x-1"
                >
                  <Heart className="w-3 h-3" />
                  <span className="text-xs">User</span>
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => fillDemoCredentials('volunteer')}
                  className="flex items-center space-x-1"
                >
                  <Users className="w-3 h-3" />
                  <span className="text-xs">Volunteer</span>
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => fillDemoCredentials('donor')}
                  className="flex items-center space-x-1"
                >
                  <DollarSign className="w-3 h-3" />
                  <span className="text-xs">Donor</span>
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => fillDemoCredentials('admin')}
                  className="flex items-center space-x-1 border-red-200 text-red-600 hover:bg-red-50"
                >
                  <Shield className="w-3 h-3" />
                  <span className="text-xs">Admin</span>
                </Button>
              </div>
            </div>
          )}
          
          <Button type="submit" className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 transition-all duration-300 hover:scale-105">
            {isLogin ? 'Sign In' : 'Create Account'}
          </Button>
          
          <div className="text-center">
            <button
              type="button"
              onClick={() => {
                setIsLogin(!isLogin);
                resetForm();
              }}
              className="text-sm text-blue-600 hover:text-blue-700 transition-colors"
            >
              {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
