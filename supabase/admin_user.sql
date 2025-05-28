
-- Create admin user profile
-- Note: You'll need to first create this user through Supabase Auth UI or this will create the profile only

-- Insert admin user profile (replace with your actual email)
INSERT INTO public.user_profiles (
  id,
  email,
  full_name,
  role,
  organization,
  verified,
  created_at,
  updated_at
) VALUES (
  '00000000-0000-0000-0000-000000000001', -- Temporary ID - replace with actual user ID after auth signup
  'admin@refugeeai.com',
  'System Administrator',
  'admin',
  'RefugeeAI Platform',
  true,
  NOW(),
  NOW()
) ON CONFLICT (id) DO UPDATE SET
  role = 'admin',
  verified = true,
  full_name = 'System Administrator',
  organization = 'RefugeeAI Platform';

-- Create additional test users for different roles
INSERT INTO public.user_profiles (
  id,
  email,
  full_name,
  role,
  organization,
  verified,
  created_at,
  updated_at
) VALUES 
(
  '00000000-0000-0000-0000-000000000002',
  'volunteer@refugeeai.com',
  'Jane Volunteer',
  'volunteer',
  'Local Aid Society',
  true,
  NOW(),
  NOW()
),
(
  '00000000-0000-0000-0000-000000000003',
  'donor@refugeeai.com',
  'John Donor',
  'donor',
  'Charity Foundation',
  true,
  NOW(),
  NOW()
),
(
  '00000000-0000-0000-0000-000000000004',
  'user@refugeeai.com',
  'Sarah User',
  'user',
  NULL,
  true,
  NOW(),
  NOW()
) ON CONFLICT (id) DO NOTHING;

-- Update any existing user to admin if needed (replace email with yours)
UPDATE public.user_profiles 
SET role = 'admin', verified = true, full_name = 'System Administrator'
WHERE email = 'admin@refugeeai.com';
