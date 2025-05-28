// I DONT KNOW WHY THIS COMPONENT WAS CREATED CONSIDERING IT IS NOT BEING USED
// DIDNT DELETE THO

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { createAdminUser, promoteToAdmin, createTestUsers } from '@/utils/adminHelpers';

export const AdminSetup = () => {
  const [email, setEmail] = useState('admin@refugeeai.com');
  const [password, setPassword] = useState('RefugeeAdmin123!');
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

  const handleCreateAllTestUsers = async () => {
    setLoading(true);
    try {
      const results = await createTestUsers();
      
      const successful = results.filter(r => r.success);
      const failed = results.filter(r => !r.success);

      if (successful.length > 0) {
        toast({
          title: "Test Users Created!",
          description: `Successfully created ${successful.length} test accounts`,
        });
      }

      if (failed.length > 0) {
        toast({
          title: "Some Errors Occurred",
          description: `${failed.length} accounts failed to create. Check console for details.`,
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create test users",
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

          <Button 
            onClick={handleCreateAllTestUsers} 
            disabled={loading}
            variant="secondary"
            className="w-full"
          >
            Create All Test Users
          </Button>
        </div>

        <div className="text-sm text-gray-600 mt-4">
          <p><strong>Default Test Accounts:</strong></p>
          <div className="space-y-1 text-xs">
            <p><strong>Admin:</strong> admin@refugeeai.com / RefugeeAdmin123!</p>
            <p><strong>Volunteer:</strong> volunteer@refugeeai.com / Volunteer123!</p>
            <p><strong>Donor:</strong> donor@refugeeai.com / Donor123!</p>
            <p><strong>User:</strong> user@refugeeai.com / User123!</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
