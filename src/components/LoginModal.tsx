
import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useUser } from '@/contexts/UserContext';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { testCredentials } from '@/lib/testData';
import { useNavigate } from 'react-router-dom';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}


const postLoginDestination: {[key: string]: string} = {
  'admin': '/admin-portal',
  'volunteer': '/world',
  'donor': '/donor-portal',
  'user': '/refugee-portal'
}


export const LoginModal = ({ isOpen, onClose }: LoginModalProps) => {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    organization: '',
    role: 'user' as 'admin' | 'user' | 'volunteer' | 'donor',
  });
  const { login, signUp, loading, user } = useUser();
  const navigateTo = useNavigate();

  useEffect(() => {
    if (!isOpen && user){
      navigateTo( postLoginDestination[user.role] );
    }
  }, [isOpen, user])


  const resetForm = () => {
    setFormData({ name: '', email: '', password: '', organization: '', role: 'user' });
    setShowPassword(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    let success = false;
    if (isLogin) {
      success = await login(formData.email, formData.password);
    } else {
      success = await signUp(formData.email, formData.password, formData.name, formData.organization, formData.role);
    }

    if (success) {
      resetForm();
      onClose();
    }
  };

  // Updated test account credentials
  const fillTestCredentials = (role: string) => {
    const cred = testCredentials[role as keyof typeof testCredentials];
    if (cred) {
      setFormData({
        ...formData,
        email: cred.email,
        password: cred.password
      });
    }
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
            <>
              <div>
                <Label htmlFor="role">Account Type</Label>
                <Select value={formData.role} onValueChange={(value: 'admin' | 'user' | 'volunteer' | 'donor') => setFormData({ ...formData, role: value })}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select your role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="user">Regular User</SelectItem>
                    <SelectItem value="volunteer">Volunteer</SelectItem>
                    <SelectItem value="donor">Donor</SelectItem>
                    <SelectItem value="admin">Administrator</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
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
            </>
          )}
          
          {isLogin && (
            <div>
              <Label className="text-sm font-medium">Test Accounts</Label>
              <div className="grid grid-cols-2 gap-2 mt-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => fillTestCredentials('user')}
                  className="text-xs"
                >
                  User Test
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => fillTestCredentials('volunteer')}
                  className="text-xs"
                >
                  Volunteer Test
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => fillTestCredentials('donor')}
                  className="text-xs"
                >
                  Donor Test
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => fillTestCredentials('admin')}
                  className="text-xs border-red-200 text-red-600 hover:bg-red-50"
                >
                  Admin Test
                </Button>
              </div>
            </div>
          )}
          
          <Button 
            type="submit" 
            className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 transition-all duration-300 hover:scale-105"
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                {isLogin ? 'Signing In...' : 'Creating Account...'}
              </>
            ) : (
              isLogin ? 'Sign In' : 'Create Account'
            )}
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
