
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
import { Heart, Shield, Users, DollarSign } from 'lucide-react';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LoginModal = ({ isOpen, onClose }: LoginModalProps) => {
  const [selectedRole, setSelectedRole] = useState<UserRole>('user');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    organization: '',
  });
  const { login } = useUser();

  const roles = [
    { id: 'user' as UserRole, label: 'Refugee/Beneficiary', icon: Heart, color: 'bg-blue-100 text-blue-700' },
    { id: 'volunteer' as UserRole, label: 'Volunteer', icon: Users, color: 'bg-green-100 text-green-700' },
    { id: 'donor' as UserRole, label: 'Donor/Sponsor', icon: DollarSign, color: 'bg-purple-100 text-purple-700' },
    { id: 'admin' as UserRole, label: 'Administrator', icon: Shield, color: 'bg-red-100 text-red-700' },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const userData: User = {
      id: Math.random().toString(36).substr(2, 9),
      name: formData.name,
      email: formData.email,
      role: selectedRole,
      organization: formData.organization || undefined,
      verified: selectedRole === 'admin' || Math.random() > 0.5,
    };

    login(userData);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md animate-scale-in">
        <DialogHeader>
          <DialogTitle className="text-center text-xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
            Welcome to RefugeeAI
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
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
              <Label htmlFor="organization">Organization (Optional)</Label>
              <Input
                id="organization"
                value={formData.organization}
                onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
                className="mt-1"
                placeholder="NGO, Company, etc."
              />
            </div>
          </div>
          
          <div>
            <Label className="text-sm font-medium">Select Your Role</Label>
            <div className="grid grid-cols-2 gap-3 mt-2">
              {roles.map((role) => {
                const Icon = role.icon;
                return (
                  <button
                    key={role.id}
                    type="button"
                    onClick={() => setSelectedRole(role.id)}
                    className={`p-3 rounded-lg border-2 transition-all duration-300 hover:scale-105 ${
                      selectedRole === role.id
                        ? 'border-blue-500 bg-blue-50 shadow-md'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <Icon className="w-6 h-6 mx-auto mb-2 text-gray-600" />
                    <Badge variant="outline" className={`${role.color} text-xs`}>
                      {role.label}
                    </Badge>
                  </button>
                );
              })}
            </div>
          </div>
          
          <Button type="submit" className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 transition-all duration-300 hover:scale-105">
            Join RefugeeAI
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};
