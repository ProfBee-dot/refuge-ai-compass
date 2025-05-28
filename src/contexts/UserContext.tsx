import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase, isSupabaseConfigured } from '@/lib/supabaseClient';

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
    const initializeAuth = async () => {
      try {
        if (!isSupabaseConfigured) {
          console.warn('Supabase not configured - running in mock mode');
          setLoading(false);
          return;
        }

        // Get initial session
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user) {
          await fetchUserProfile(session.user.id);
        } else {
          setLoading(false);
        }
        
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
      } catch (error) {
        console.error('Auth initialization error:', error);
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const fetchUserProfile = async (userId: string) => {
    if (!isSupabaseConfigured) return;
    
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('id, email, full_name, role, organization, verified')
        .eq('id', userId)
        .single();

      // Handle not found separately
      if (error?.code === 'PGRST116') {
        console.warn('User profile not found:', userId);
        setLoading(false);
        return;
      }

      if (error) {
        throw error;
      }

      if (data) {
        setUser({
          id: data.id,
          name: data.full_name || data.email,
          email: data.email,
          role: data.role as UserRole,
          organization: data.organization,
          verified: data.verified,
        });
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
      toast({
        title: "Profile Error",
        description: "Failed to load user profile",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    if (!isSupabaseConfigured) {
      toast({
        title: "Authentication Disabled",
        description: "Supabase is not configured. Running in demo mode.",
        variant: "destructive",
      });
      return false;
    }

    try {
      setLoading(true);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw error;
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
    } catch (error: any) {
      console.error('Login error:', error);
      
      let errorMessage = "An unexpected error occurred";
      if (error?.message) {
        errorMessage = error.message;
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      toast({
        title: "Login Failed",
        description: errorMessage,
        variant: "destructive",
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (
    email: string,
    password: string,
    name: string,
    organization?: string,
    role: UserRole = 'user'
  ): Promise<boolean> => {
    if (!isSupabaseConfigured) {
      toast({
        title: "Registration Disabled",
        description: "Supabase is not configured. Running in demo mode.",
        variant: "destructive",
      });
      return false;
    }

    try {
      setLoading(true);
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) {
        throw error;
      }

      if (data.user) {
        // Create user profile with selected role
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: data.user.id,
            email: data.user.email,
            full_name: name,
            role: role,
            organization: organization,
            verified: role === 'admin', // Auto-verify admin accounts
          });

        if (profileError) {
          throw profileError;
        }

        // Immediately set user in context
        setUser({
          id: data.user.id,
          name,
          email: data.user.email,
          role,
          organization,
          verified: role === 'admin',
        });

        toast({
          title: "Registration successful!",
          description: `Account created with ${role} role. ${role === 'admin' ? 'Admin access granted.' : 'Please check your email to verify your account.'}`,
        });
        return true;
      }
      
      return false;
    } catch (error: any) {
      console.error('Sign up error:', error);
      
      let errorMessage = "An unexpected error occurred";
      if (error?.message) {
        errorMessage = error.message;
      }
      
      toast({
        title: "Registration Failed",
        description: errorMessage,
        variant: "destructive",
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    if (!isSupabaseConfigured) {
      setUser(null);
      toast({
        title: "Signed out",
        description: "You have been successfully signed out.",
      });
      return;
    }

    try {
      setLoading(true);
      await supabase.auth.signOut();
      setUser(null);
      toast({
        title: "Signed out",
        description: "You have been successfully signed out.",
      });
    } catch (error) {
      console.error('Logout error:', error);
      toast({
        title: "Logout Error",
        description: "Failed to sign out",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateUser = async (userData: Partial<User>) => {
    if (!user || !isSupabaseConfigured) return;

    try {
      setLoading(true);
      const updates = {
        full_name: userData.name,
        organization: userData.organization,
        avatar_url: userData.avatar,
        updated_at: new Date(),
      };

      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id);

      if (error) {
        throw error;
      }

      setUser({ ...user, ...userData });
      toast({
        title: "Profile Updated",
        description: "Your profile has been successfully updated.",
      });
    } catch (error: any) {
      console.error('Update user error:', error);
      
      toast({
        title: "Update Failed",
        description: error?.message || "Failed to update profile",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const hasPermission = (requiredRole: UserRole | UserRole[]): boolean => {
    // Always return true - everyone has full access
    return true;
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
