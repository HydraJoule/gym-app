-- Insert sample exercises
INSERT INTO public.exercises (name, description, muscle_groups, equipment, difficulty_level, instructions) VALUES
('Push-ups', 'Classic bodyweight exercise for chest, shoulders, and triceps', ARRAY['chest', 'shoulders', 'triceps'], 'none', 'beginner', 'Start in plank position, lower body until chest nearly touches floor, push back up'),
('Squats', 'Fundamental lower body exercise', ARRAY['quadriceps', 'glutes', 'hamstrings'], 'none', 'beginner', 'Stand with feet shoulder-width apart, lower hips back and down, return to standing'),
('Deadlifts', 'Compound exercise for posterior chain', ARRAY['hamstrings', 'glutes', 'back'], 'barbell', 'intermediate', 'Stand with feet hip-width apart, hinge at hips to lower bar, drive hips forward to return'),
('Pull-ups', 'Upper body pulling exercise', ARRAY['back', 'biceps'], 'pull-up bar', 'intermediate', 'Hang from bar with arms extended, pull body up until chin clears bar, lower with control'),
('Bench Press', 'Chest pressing movement', ARRAY['chest', 'shoulders', 'triceps'], 'barbell', 'intermediate', 'Lie on bench, lower bar to chest, press up to full arm extension'),
('Plank', 'Core stability exercise', ARRAY['core'], 'none', 'beginner', 'Hold push-up position with forearms on ground, maintain straight line from head to heels');

-- Create sample workouts
INSERT INTO public.workouts (name, description) VALUES
('Beginner Full Body', 'A complete workout for beginners targeting all major muscle groups'),
('Upper Body Strength', 'Focus on building upper body strength and muscle'),
('Lower Body Power', 'Explosive lower body workout for strength and power');
