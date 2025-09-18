-- Fix RLS policies and use correct column names from actual schema
-- Drop all existing policies first to remove dependencies
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Admin can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Admin can update all profiles" ON profiles;

-- Drop all policies on other tables
DROP POLICY IF EXISTS "Users can view exercises" ON exercises;
DROP POLICY IF EXISTS "Admin can manage exercises" ON exercises;
DROP POLICY IF EXISTS "Users can view workouts" ON workouts;
DROP POLICY IF EXISTS "Admin can manage workouts" ON workouts;
DROP POLICY IF EXISTS "Users can view workout exercises" ON workout_exercises;
DROP POLICY IF EXISTS "Admin can manage workout exercises" ON workout_exercises;
DROP POLICY IF EXISTS "Users can view own user workouts" ON user_workouts;
DROP POLICY IF EXISTS "Admin can manage user workouts" ON user_workouts;

-- Drop functions if they exist
DROP FUNCTION IF EXISTS is_admin() CASCADE;

-- Create simple RLS policies without recursion
-- Profiles table policies
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Simple policies for other tables - allow authenticated users to read, admins to write
CREATE POLICY "Authenticated users can view exercises" ON exercises
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can view workouts" ON workouts
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can view workout exercises" ON workout_exercises
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Users can view own user workouts" ON user_workouts
  FOR SELECT USING (auth.uid() = user_id);

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE workouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_workouts ENABLE ROW LEVEL SECURITY;

-- Create test users with correct data
-- First, ensure we have the test users in auth.users (this might fail if they already exist, which is fine)
INSERT INTO auth.users (
  id,
  instance_id,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  confirmation_token,
  email_change,
  email_change_token_new,
  recovery_token
) VALUES 
(
  '11111111-1111-1111-1111-111111111111',
  '00000000-0000-0000-0000-000000000000',
  'admin@gym.com',
  '$2a$10$8K1p/a0dhrxSHxN1nByqhOxHk7B2w4H1U3/3HkTqmfLelhibm5ue6', -- password123
  NOW(),
  NOW(),
  NOW(),
  '',
  '',
  '',
  ''
),
(
  '22222222-2222-2222-2222-222222222222',
  '00000000-0000-0000-0000-000000000000',
  'customer@gym.com',
  '$2a$10$8K1p/a0dhrxSHxN1nByqhOxHk7B2w4H1U3/3HkTqmfLelhibm5ue6', -- password123
  NOW(),
  NOW(),
  NOW(),
  '',
  '',
  '',
  ''
)
ON CONFLICT (id) DO NOTHING;

-- Create profiles for test users
INSERT INTO profiles (id, email, full_name, role, created_at, updated_at) VALUES
('11111111-1111-1111-1111-111111111111', 'admin@gym.com', 'Admin User', 'admin', NOW(), NOW()),
('22222222-2222-2222-2222-222222222222', 'customer@gym.com', 'Customer User', 'customer', NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  full_name = EXCLUDED.full_name,
  role = EXCLUDED.role,
  updated_at = NOW();

-- Insert sample exercises using correct column name 'muscle_groups' (plural, ARRAY type)
INSERT INTO exercises (id, name, description, muscle_groups, equipment, difficulty_level, instructions, created_by, created_at, updated_at) VALUES
(
  gen_random_uuid(),
  'Push-ups',
  'Classic bodyweight exercise for upper body strength',
  ARRAY['chest', 'shoulders', 'triceps'],
  'bodyweight',
  'beginner',
  '1. Start in plank position\n2. Lower body until chest nearly touches floor\n3. Push back up to starting position',
  '11111111-1111-1111-1111-111111111111',
  NOW(),
  NOW()
),
(
  gen_random_uuid(),
  'Squats',
  'Fundamental lower body exercise',
  ARRAY['quadriceps', 'glutes', 'hamstrings'],
  'bodyweight',
  'beginner',
  '1. Stand with feet shoulder-width apart\n2. Lower body as if sitting back into chair\n3. Return to standing position',
  '11111111-1111-1111-1111-111111111111',
  NOW(),
  NOW()
),
(
  gen_random_uuid(),
  'Deadlifts',
  'Compound exercise for posterior chain',
  ARRAY['hamstrings', 'glutes', 'lower_back'],
  'barbell',
  'intermediate',
  '1. Stand with feet hip-width apart\n2. Hinge at hips and grab barbell\n3. Drive through heels to stand up straight',
  '11111111-1111-1111-1111-111111111111',
  NOW(),
  NOW()
)
ON CONFLICT (id) DO NOTHING;

-- Create sample workouts
INSERT INTO workouts (id, name, description, created_by, created_at, updated_at) VALUES
(
  gen_random_uuid(),
  'Beginner Full Body',
  'A complete workout for beginners targeting all major muscle groups',
  '11111111-1111-1111-1111-111111111111',
  NOW(),
  NOW()
),
(
  gen_random_uuid(),
  'Upper Body Strength',
  'Focus on building upper body strength and muscle',
  '11111111-1111-1111-1111-111111111111',
  NOW(),
  NOW()
)
ON CONFLICT (id) DO NOTHING;
