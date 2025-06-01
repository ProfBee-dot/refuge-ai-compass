import { supabase, isSupabaseConfigured } from '@/lib/supabaseClient';
import { User, UserRole } from '../types/user';

export const fetchUserProfile = async (userId: string): Promise<User | null> => {
  if (!isSupabaseConfigured) return null;
  
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, email, full_name, role, organization, verified')
      .eq('id', userId)
      .single();

    if (error) {
      if (error.message?.includes('not found')) {
        console.warn('User profile not found:', userId);
        return null;
      }
      throw error;
    }

    if (data) {
      return {
        id: data.id,
        name: data.full_name || data.email,
        email: data.email,
        role: data.role as UserRole,
        organization: data.organization,
        verified: data.verified,
      };
    }
    
    return null;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    throw error;
  }
};

export const signInUser = async (email: string, password: string) => {
  if (!isSupabaseConfigured) {
    throw new Error('Supabase not configured');
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) throw error;
  return data;
};

export const signUpUser = async (
  email: string,
  password: string,
  name: string,
  organization?: string,
  role: UserRole = 'user'
) => {
  if (!isSupabaseConfigured) {
    throw new Error('Supabase not configured');
  }

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });

  if (error) throw error;

  if (data.user) {
    const { error } = await supabase
      .from('profiles')
      .insert({
        id: data.user.id,
        email: data.user.email,
        full_name: name,
        role: role,
        organization: organization,
        verified: role === 'admin',
      });

    if (error) throw error;
  }

  return data;
};

export const signOutUser = async () => {
  if (isSupabaseConfigured) {
    await supabase.auth.signOut();
  }
};

export const updateUserProfile = async (userId: string, userData: Partial<User>) => {
  if (!isSupabaseConfigured) {
    throw new Error('Supabase not configured');
  }

  const updates = {
    full_name: userData.name,
    organization: userData.organization,
    avatar_url: userData.avatar,
    updated_at: new Date(),
  };

  const { error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId);

  if (error) throw error;
};