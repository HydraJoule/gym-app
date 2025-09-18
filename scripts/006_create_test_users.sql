-- This script creates test users directly in the auth schema
-- Note: This is for development/testing only. In production, users should sign up through the app.

-- First, let's ensure we have the proper auth schema setup
-- Insert test users into auth.users (this simulates what Supabase auth does)
INSERT INTO auth.users (
  id,
  instance_id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  invited_at,
  confirmation_token,
  confirmation_sent_at,
  recovery_token,
  recovery_sent_at,
  email_change_token_new,
  email_change,
  email_change_sent_at,
  last_sign_in_at,
  raw_app_meta_data,
  raw_user_meta_data,
  is_super_admin,
  created_at,
  updated_at,
  phone,
  phone_confirmed_at,
  phone_change,
  phone_change_token,
  phone_change_sent_at,
  email_change_token_current,
  email_change_confirm_status,
  banned_until,
  reauthentication_token,
  reauthentication_sent_at,
  is_sso_user,
  deleted_at
) VALUES 
-- Admin user
(
  '11111111-1111-1111-1111-111111111111'::uuid,
  '00000000-0000-0000-0000-000000000000'::uuid,
  'authenticated',
  'authenticated',
  'admin@gym.com',
  crypt('password123', gen_salt('bf')), -- This creates a bcrypt hash
  now(),
  null,
  '',
  null,
  '',
  null,
  '',
  '',
  null,
  now(),
  '{"provider": "email", "providers": ["email"]}',
  '{"full_name": "Gym Admin", "role": "admin"}',
  false,
  now(),
  now(),
  null,
  null,
  '',
  '',
  null,
  '',
  0,
  null,
  '',
  null,
  false,
  null
),
-- Customer user
(
  '22222222-2222-2222-2222-222222222222'::uuid,
  '00000000-0000-0000-0000-000000000000'::uuid,
  'authenticated',
  'authenticated',
  'customer@gym.com',
  crypt('password123', gen_salt('bf')), -- This creates a bcrypt hash
  now(),
  null,
  '',
  null,
  '',
  null,
  '',
  '',
  null,
  now(),
  '{"provider": "email", "providers": ["email"]}',
  '{"full_name": "John Customer", "role": "customer"}',
  false,
  now(),
  now(),
  null,
  null,
  '',
  '',
  null,
  '',
  0,
  null,
  '',
  null,
  false,
  null
)
ON CONFLICT (id) DO NOTHING;

-- Now insert corresponding profiles (the trigger should handle this, but let's be explicit)
INSERT INTO public.profiles (id, email, full_name, role) VALUES 
('11111111-1111-1111-1111-111111111111'::uuid, 'admin@gym.com', 'Gym Admin', 'admin'),
('22222222-2222-2222-2222-222222222222'::uuid, 'customer@gym.com', 'John Customer', 'customer')
ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  full_name = EXCLUDED.full_name,
  role = EXCLUDED.role,
  updated_at = now();

-- Add some sample data for testing
-- Insert sample exercises
INSERT INTO public.exercises (id, name, description, muscle_groups, difficulty_level, equipment, instructions, created_by) VALUES 
(gen_random_uuid(), 'Push-ups', 'Classic bodyweight chest exercise', ARRAY['chest', 'shoulders', 'triceps'], 'beginner', 'none', 'Start in plank position, lower body to ground, push back up', '11111111-1111-1111-1111-111111111111'::uuid),
(gen_random_uuid(), 'Squats', 'Fundamental leg exercise', ARRAY['quadriceps', 'glutes', 'hamstrings'], 'beginner', 'none', 'Stand with feet shoulder-width apart, lower hips back and down, return to standing', '11111111-1111-1111-1111-111111111111'::uuid),
(gen_random_uuid(), 'Deadlifts', 'Compound pulling exercise', ARRAY['hamstrings', 'glutes', 'back'], 'intermediate', 'barbell', 'Stand with feet hip-width apart, bend at hips and knees to grab bar, lift by extending hips and knees', '11111111-1111-1111-1111-111111111111'::uuid)
ON CONFLICT DO NOTHING;

-- Insert a sample workout
INSERT INTO public.workouts (id, name, description, created_by) VALUES 
(gen_random_uuid(), 'Beginner Full Body', 'A complete workout for beginners targeting all major muscle groups', '11111111-1111-1111-1111-111111111111'::uuid)
ON CONFLICT DO NOTHING;
