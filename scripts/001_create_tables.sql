-- Create profiles table for user management
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  role TEXT NOT NULL DEFAULT 'customer' CHECK (role IN ('customer', 'admin')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "profiles_select_own" ON public.profiles 
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "profiles_insert_own" ON public.profiles 
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "profiles_update_own" ON public.profiles 
  FOR UPDATE USING (auth.uid() = id);

-- Admin can view all profiles
CREATE POLICY "profiles_admin_select_all" ON public.profiles 
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Create exercises table
CREATE TABLE IF NOT EXISTS public.exercises (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  muscle_groups TEXT[],
  equipment TEXT,
  difficulty_level TEXT CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced')),
  instructions TEXT,
  media_url TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on exercises
ALTER TABLE public.exercises ENABLE ROW LEVEL SECURITY;

-- Everyone can view exercises
CREATE POLICY "exercises_select_all" ON public.exercises 
  FOR SELECT USING (true);

-- Only admins can create, update, delete exercises
CREATE POLICY "exercises_admin_insert" ON public.exercises 
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "exercises_admin_update" ON public.exercises 
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "exercises_admin_delete" ON public.exercises 
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Create workouts table
CREATE TABLE IF NOT EXISTS public.workouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on workouts
ALTER TABLE public.workouts ENABLE ROW LEVEL SECURITY;

-- Everyone can view workouts
CREATE POLICY "workouts_select_all" ON public.workouts 
  FOR SELECT USING (true);

-- Only admins can create, update, delete workouts
CREATE POLICY "workouts_admin_insert" ON public.workouts 
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "workouts_admin_update" ON public.workouts 
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "workouts_admin_delete" ON public.workouts 
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Create workout_exercises junction table
CREATE TABLE IF NOT EXISTS public.workout_exercises (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workout_id UUID REFERENCES public.workouts(id) ON DELETE CASCADE,
  exercise_id UUID REFERENCES public.exercises(id) ON DELETE CASCADE,
  sets INTEGER,
  reps INTEGER,
  weight DECIMAL,
  rest_seconds INTEGER,
  notes TEXT,
  order_index INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on workout_exercises
ALTER TABLE public.workout_exercises ENABLE ROW LEVEL SECURITY;

-- Everyone can view workout exercises
CREATE POLICY "workout_exercises_select_all" ON public.workout_exercises 
  FOR SELECT USING (true);

-- Only admins can manage workout exercises
CREATE POLICY "workout_exercises_admin_insert" ON public.workout_exercises 
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "workout_exercises_admin_update" ON public.workout_exercises 
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "workout_exercises_admin_delete" ON public.workout_exercises 
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Create user_workouts table for assignments
CREATE TABLE IF NOT EXISTS public.user_workouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  workout_id UUID REFERENCES public.workouts(id) ON DELETE CASCADE,
  assigned_by UUID REFERENCES auth.users(id),
  assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  UNIQUE(user_id, workout_id)
);

-- Enable RLS on user_workouts
ALTER TABLE public.user_workouts ENABLE ROW LEVEL SECURITY;

-- Users can view their own assigned workouts
CREATE POLICY "user_workouts_select_own" ON public.user_workouts 
  FOR SELECT USING (auth.uid() = user_id);

-- Admins can view all user workouts
CREATE POLICY "user_workouts_admin_select_all" ON public.user_workouts 
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Only admins can assign workouts
CREATE POLICY "user_workouts_admin_insert" ON public.user_workouts 
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Users can update their own workout completion
CREATE POLICY "user_workouts_update_own" ON public.user_workouts 
  FOR UPDATE USING (auth.uid() = user_id);

-- Admins can update any user workout
CREATE POLICY "user_workouts_admin_update" ON public.user_workouts 
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Only admins can delete user workout assignments
CREATE POLICY "user_workouts_admin_delete" ON public.user_workouts 
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );
