
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/superbaseClient';
import { testUsers } from '@/lib/testData';


export type UserRole = 'admin' | 'user' | 'volunteer' | 'donor';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  organization?: string;
  verified: boolean;
}

interface UserContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  signUp: (email: string, password: string, name: string, organization?: string, role?: UserRole) => Promise<boolean>;
  updateUser: (userData: Partial<User>) => Promise<void>;
  isAdmin: boolean;
  isDonor: boolean;
  isVolunteer: boolean;
  isLoggedIn: boolean;
  hasPermission: (requiredRole: UserRole | UserRole[]) => boolean;
  loading: boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};

interface UserProviderProps {
  children: ReactNode;
}

export const UserProvider = ({ children }: UserProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        fetchUserProfile(session.user.id);
      } else {
        setLoading(false);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        await fetchUserProfile(session.user.id);
      } else {
        setUser(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserProfile = async (userId: string) => {
    try {
      // const { data, error } = await supabase
      //   .from('user_profiles')
      //   .select('*')
      //   .eq('id', userId)
      //   .single();
      const data = testUsers.find( testUser => (userId === testUser.user.id))?.user;
      const error = data ? null : { message: 'Invalid email or password', code: "errcode" };

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching user profile:', error);
        setLoading(false);
        return;
      }

      if (data) {
        setUser({
          id: data.id,
          name: data.full_name || data.email,
          email: data.email,
          role: data.role as UserRole,
          // avatar: data?.avatar_url,
          organization: data?.organization,
          verified: data.verified,
        });
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching user profile:', error);
      setLoading(false);
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setLoading(true);
      // const { data, error } = await supabase.auth.signInWithPassword({
      //   email,
      //   password,
      // });

      const data = testUsers.find( testUser => (email === testUser.user.email && password === testUser.user.password))
      const error = data ? null : { message: 'Invalid email or password' };

      if (error) {
        toast({
          title: "Authentication Failed",
          description: error.message,
          variant: "destructive",
        });
        return false;
      }

      if (data.user) {
        await fetchUserProfile(data.user.id);
        toast({
          title: "Welcome back!",
          description: "Successfully logged in.",
        });
        return true;
      }
      return false;
    } catch (error) {
      console.error('Login error:', error);
      toast({
        title: "Login Error",
        description: "An unexpected error occurred.",
        variant: "destructive",
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, name: string, organization?: string, role: UserRole = 'user'): Promise<boolean> => {
    try {
      setLoading(true);
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) {
        toast({
          title: "Registration Failed",
          description: error.message,
          variant: "destructive",
        });
        return false;
      }

      if (data.user) {
        // Create user profile with selected role
        const { error: profileError } = await supabase
          .from('user_profiles')
          .insert({
            id: data.user.id,
            email: data.user.email,
            full_name: name,
            role: role,
            organization: organization,
            verified: role === 'admin', // Auto-verify admin accounts
          });

        if (profileError) {
          console.error('Error creating user profile:', profileError);
          toast({
            title: "Profile Creation Failed",
            description: "Account created but profile setup failed. Please contact support.",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Registration successful!",
            description: `Account created with ${role} role. ${role === 'admin' ? 'Admin access granted.' : 'Please check your email to verify your account.'}`,
          });
        }
        return true;
      }
      return false;
    } catch (error) {
      console.error('Sign up error:', error);
      toast({
        title: "Registration Error",
        description: "An unexpected error occurred.",
        variant: "destructive",
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      toast({
        title: "Signed out",
        description: "You have been successfully signed out.",
      });
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const updateUser = async (userData: Partial<User>) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('user_profiles')
        .update({
          full_name: userData.name,
          organization: userData.organization,
          avatar_url: userData.avatar,
        })
        .eq('id', user.id);

      if (error) {
        toast({
          title: "Update Failed",
          description: error.message,
          variant: "destructive",
        });
        return;
      }

      setUser({ ...user, ...userData });
      toast({
        title: "Profile Updated",
        description: "Your profile has been successfully updated.",
      });
    } catch (error) {
      console.error('Update user error:', error);
    }
  };

  const hasPermission = (requiredRole: UserRole | UserRole[]): boolean => {
    if (!user) return false;
    
    const roles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
    
    // Admin has access to everything
    if (user.role === 'admin') return true;
    
    return roles.includes(user.role);
  };

  const isAdmin = user?.role === 'admin';
  const isDonor = user?.role === 'donor';
  const isVolunteer = user?.role === 'volunteer';
  const isLoggedIn = !!user;

  return (
    <UserContext.Provider
      value={{
        user,
        login,
        logout,
        signUp,
        updateUser,
        isAdmin,
        isDonor,
        isVolunteer,
        isLoggedIn,
        hasPermission,
        loading,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};
