-- Fix the infinite recursion in RLS policies
-- The issue is that policies on profiles table are trying to query profiles table

-- Drop all existing policies that cause recursion
DROP POLICY IF EXISTS "profiles_select_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_insert_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_delete_own" ON public.profiles;

DROP POLICY IF EXISTS "exercises_admin_all" ON public.exercises;
DROP POLICY IF EXISTS "workouts_admin_all" ON public.workouts;
DROP POLICY IF EXISTS "user_workouts_select_own" ON public.user_workouts;
DROP POLICY IF EXISTS "user_workouts_admin_all" ON public.user_workouts;
DROP POLICY IF EXISTS "workout_exercises_admin_all" ON public.workout_exercises;

-- Create simple, non-recursive policies for profiles
-- Users can only see and modify their own profile
CREATE POLICY "profiles_select_own" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "profiles_insert_own" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "profiles_update_own" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "profiles_delete_own" ON public.profiles
  FOR DELETE USING (auth.uid() = id);

-- For other tables, we'll use a function to check admin role to avoid recursion
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
  );
$$;

-- Now create policies using the function
CREATE POLICY "exercises_admin_all" ON public.exercises
  FOR ALL USING (public.is_admin());

CREATE POLICY "workouts_admin_all" ON public.workouts
  FOR ALL USING (public.is_admin());

CREATE POLICY "user_workouts_select_own" ON public.user_workouts
  FOR SELECT USING (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "user_workouts_admin_all" ON public.user_workouts
  FOR ALL USING (public.is_admin());

CREATE POLICY "workout_exercises_admin_all" ON public.workout_exercises
  FOR ALL USING (public.is_admin());

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.is_admin() TO anon, authenticated;
