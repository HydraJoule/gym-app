-- Temporarily disable RLS to fix authentication issues
-- We'll re-enable with proper policies later

-- Drop all existing policies that are causing infinite recursion
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON profiles;

-- Drop any functions that might be causing issues
DROP FUNCTION IF EXISTS is_admin() CASCADE;

-- Temporarily disable RLS on profiles table
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;

-- Ensure test users exist in auth.users (these should already exist from previous scripts)
-- But let's make sure the profiles exist too

-- Delete existing profiles to avoid conflicts
DELETE FROM profiles WHERE id IN ('11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222');

-- Insert test profiles directly
INSERT INTO profiles (id, full_name, role, created_at, updated_at) VALUES
('11111111-1111-1111-1111-111111111111', 'Admin User', 'admin', NOW(), NOW()),
('22222222-2222-2222-2222-222222222222', 'Customer User', 'customer', NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET
  full_name = EXCLUDED.full_name,
  role = EXCLUDED.role,
  updated_at = NOW();

-- Verify the data
SELECT 'Profiles created:' as status;
SELECT id, full_name, role FROM profiles WHERE id IN ('11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222');
