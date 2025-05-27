
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { createAdminUser, promoteToAdmin } from '@/utils/adminHelpers';

export const AdminSetup = () => {
  const [email, setEmail] = useState('admin@refugeeai.com');
  const [password, setPassword] = useState('admin123!');
  const [fullName, setFullName] = useState('System Administrator');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleCreateAdmin = async () => {
    setLoading(true);
    try {
      const result = await createAdminUser(email, password, fullName);
      
      if (result.success) {
        toast({
          title: "Admin Created!",
          description: `Admin user created with email: ${email}`,
        });
      } else {
        toast({
          title: "Error",
          description: result.error?.message || "Failed to create admin user",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    }
    setLoading(false);
  };

  const handlePromoteUser = async () => {
    setLoading(true);
    try {
      const result = await promoteToAdmin(email);
      
      if (result.success) {
        toast({
          title: "User Promoted!",
          description: `User ${email} is now an admin`,
        });
      } else {
        toast({
          title: "Error",
          description: result.error?.message || "Failed to promote user",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    }
    setLoading(false);
  };

  return (
    <Card className="max-w-md mx-auto mt-8">
      <CardHeader>
        <CardTitle>Admin Setup</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Input
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <Input
          placeholder="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <Input
          placeholder="Full Name"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
        />
        
        <div className="space-y-2">
          <Button 
            onClick={handleCreateAdmin} 
            disabled={loading}
            className="w-full"
          >
            Create New Admin User
          </Button>
          
          <Button 
            onClick={handlePromoteUser} 
            disabled={loading}
            variant="outline"
            className="w-full"
          >
            Promote Existing User to Admin
          </Button>
        </div>

        <div className="text-sm text-gray-600 mt-4">
          <p><strong>Default Admin Credentials:</strong></p>
          <p>Email: admin@refugeeai.com</p>
          <p>Password: admin123!</p>
        </div>
      </CardContent>
    </Card>
  );
};
