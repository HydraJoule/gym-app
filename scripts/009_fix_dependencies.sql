-- Drop all policies first to remove dependencies on functions
-- Drop ALL existing policies on profiles table
DROP POLICY IF EXISTS "profiles_select_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_insert_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_delete_own" ON public.profiles;
DROP POLICY IF EXISTS "admin_can_view_all_profiles" ON public.profiles;
DROP POLICY IF EXISTS "admin_can_update_all_profiles" ON public.profiles;
DROP POLICY IF EXISTS "admin_view_all_profiles" ON public.profiles;
DROP POLICY IF EXISTS "admin_update_all_profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON public.profiles;

-- Now drop functions after policies are removed
DROP FUNCTION IF EXISTS is_admin() CASCADE;
DROP FUNCTION IF EXISTS public.is_admin() CASCADE;

-- Disable RLS temporarily to ensure clean state
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;

-- Re-enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create simple policies without any functions or recursion
-- Users can only see their own profile
CREATE POLICY "users_own_profile_select" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

-- Users can only insert their own profile
CREATE POLICY "users_own_profile_insert" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Users can only update their own profile
CREATE POLICY "users_own_profile_update" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- Clean up existing test data
DELETE FROM public.profiles WHERE email IN ('admin@gym.com', 'customer@gym.com');

-- Create test profiles directly (bypassing auth.users complexity for now)
INSERT INTO public.profiles (id, email, full_name, role, created_at, updated_at)
VALUES 
  ('11111111-1111-1111-1111-111111111111', 'admin@gym.com', 'Admin User', 'admin', NOW(), NOW()),
  ('22222222-2222-2222-2222-222222222222', 'customer@gym.com', 'Customer User', 'customer', NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  full_name = EXCLUDED.full_name,
  role = EXCLUDED.role,
  updated_at = NOW();

-- Add some sample data for testing
INSERT INTO public.exercises (name, description, muscle_group, created_at, updated_at)
VALUES 
  ('Push-ups', 'Basic bodyweight exercise for chest and arms', 'chest', NOW(), NOW()),
  ('Squats', 'Lower body exercise targeting quads and glutes', 'legs', NOW(), NOW()),
  ('Pull-ups', 'Upper body exercise for back and biceps', 'back', NOW(), NOW())
ON CONFLICT (name) DO NOTHING;
