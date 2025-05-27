
import { supabase } from '@/lib/superbaseClient';

export const createAdminUser = async (email: string, password: string, fullName: string) => {
  try {
    console.log('Creating admin user...');
    
    // First, sign up the user
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (signUpError) {
      console.error('Sign up error:', signUpError);
      throw signUpError;
    }

    if (signUpData.user) {
      console.log('User created, setting up admin profile...');
      
      // Create/update user profile with admin role
      const { error: profileError } = await supabase
        .from('user_profiles')
        .upsert({
          id: signUpData.user.id,
          email: signUpData.user.email,
          full_name: fullName,
          role: 'admin',
          organization: 'RefugeeAI Platform',
          verified: true,
        });

      if (profileError) {
        console.error('Profile creation error:', profileError);
        throw profileError;
      }

      console.log('Admin user created successfully!');
      return { success: true, user: signUpData.user };
    }
  } catch (error) {
    console.error('Error creating admin user:', error);
    return { success: false, error };
  }
};

// Helper to promote existing user to admin
export const promoteToAdmin = async (userEmail: string) => {
  try {
    const { error } = await supabase
      .from('user_profiles')
      .update({ 
        role: 'admin', 
        verified: true,
        organization: 'RefugeeAI Platform'
      })
      .eq('email', userEmail);

    if (error) throw error;
    
    console.log(`User ${userEmail} promoted to admin`);
    return { success: true };
  } catch (error) {
    console.error('Error promoting user to admin:', error);
    return { success: false, error };
  }
};
