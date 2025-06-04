
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
      return { success: false, error: signUpError };
    }

    if (signUpData.user) {
      console.log('User created, setting up admin profile...');
      
      // Wait a moment for the user to be fully created
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Create/update user profile with admin role
      const { error: profileError } = await supabase
        .from('user_profiles')
        .upsert({
          id: signUpData.user.id,
          email: signUpData.user.email,
          full_name: fullName,
          role: 'admin',
          organization: 'RefugeeAid Platform',
          verified: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });

      if (profileError) {
        console.error('Profile creation error:', profileError);
        return { success: false, error: profileError };
      }

      console.log('Admin user created successfully!');
      return { success: true, user: signUpData.user };
    } else {
      return { success: false, error: { message: 'No user data returned' } };
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
        organization: 'RefugeeAid Platform',
        updated_at: new Date().toISOString(),
      })
      .eq('email', userEmail);

    if (error) {
      console.error('Error promoting user:', error);
      return { success: false, error };
    }
    
    console.log(`User ${userEmail} promoted to admin`);
    return { success: true };
  } catch (error) {
    console.error('Error promoting user to admin:', error);
    return { success: false, error };
  }
};

// Create all test users with rate limiting protection
export const createTestUsers = async () => {
  const testUsers = [
    {
      email: 'admin@refugeeai.com',
      password: 'RefugeeAdmin123!',
      name: 'System Administrator',
      role: 'admin',
      organization: 'RefugeeAid Platform'
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
      
      // Add delay between requests to avoid rate limiting
      if (results.length > 0) {
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
      
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: user.email,
        password: user.password,
      });

      if (signUpError) {
        console.error(`Error creating ${user.email}:`, signUpError);
        results.push({ 
          email: user.email, 
          success: false, 
          error: signUpError.message || 'Unknown signup error'
        });
        continue;
      }

      if (signUpData.user) {
        // Wait for user to be fully created
        await new Promise(resolve => setTimeout(resolve, 1000));
        
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
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          });

        if (profileError) {
          console.error(`Error creating profile for ${user.email}:`, profileError);
          results.push({ 
            email: user.email, 
            success: false, 
            error: `Profile creation failed: ${profileError.message || 'Unknown error'}`
          });
        } else {
          console.log(`Successfully created ${user.email}`);
          results.push({ email: user.email, success: true });
        }
      } else {
        results.push({ 
          email: user.email, 
          success: false, 
          error: 'No user data returned from signup'
        });
      }
    } catch (error: any) {
      console.error(`Unexpected error creating ${user.email}:`, error);
      results.push({ 
        email: user.email, 
        success: false, 
        error: error.message || 'Unexpected error occurred'
      });
    }
  }

  return results;
};
