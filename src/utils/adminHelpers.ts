
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

// Create all test users
export const createTestUsers = async () => {
  const testUsers = [
    {
      email: 'admin@refugeeai.com',
      password: 'RefugeeAdmin123!',
      name: 'System Administrator',
      role: 'admin',
      organization: 'RefugeeAI Platform'
    },
    {
      email: 'volunteer@refugeeai.com',
      password: 'Volunteer123!',
      name: 'Jane Volunteer',
      role: 'volunteer',
      organization: 'Local Aid Society'
    },
    {
      email: 'donor@refugeeai.com',
      password: 'Donor123!',
      name: 'John Donor',
      role: 'donor',
      organization: 'Charity Foundation'
    },
    {
      email: 'user@refugeeai.com',
      password: 'User123!',
      name: 'Sarah User',
      role: 'user',
      organization: null
    }
  ];

  const results = [];

  for (const user of testUsers) {
    try {
      console.log(`Creating user: ${user.email}`);
      
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: user.email,
        password: user.password,
      });

      if (signUpError) {
        console.error(`Error creating ${user.email}:`, signUpError);
        results.push({ email: user.email, success: false, error: signUpError.message });
        continue;
      }

      if (signUpData.user) {
        // Create user profile
        const { error: profileError } = await supabase
          .from('user_profiles')
          .upsert({
            id: signUpData.user.id,
            email: signUpData.user.email,
            full_name: user.name,
            role: user.role,
            organization: user.organization,
            verified: true,
          });

        if (profileError) {
          console.error(`Error creating profile for ${user.email}:`, profileError);
          results.push({ email: user.email, success: false, error: profileError.message });
        } else {
          console.log(`Successfully created ${user.email}`);
          results.push({ email: user.email, success: true });
        }
      }
    } catch (error) {
      console.error(`Unexpected error creating ${user.email}:`, error);
      results.push({ email: user.email, success: false, error: error.message });
    }
  }

  return results;
};
