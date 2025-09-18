-- Fix sample data by creating exercises first, then workouts and assignments

-- First, let's clear any existing sample data to avoid conflicts
DELETE FROM workout_exercises WHERE workout_id IN (
  SELECT id FROM workouts WHERE name LIKE 'Sample%'
);
DELETE FROM user_workouts WHERE workout_id IN (
  SELECT id FROM workouts WHERE name LIKE 'Sample%'
);
DELETE FROM workouts WHERE name LIKE 'Sample%';
DELETE FROM exercises WHERE name LIKE 'Sample%';

-- Create sample exercises first
INSERT INTO exercises (id, name, description, muscle_groups, equipment, difficulty_level, instructions, created_by) VALUES
('11111111-2222-3333-4444-555555555551', 'Sample Push-ups', 'Classic bodyweight chest exercise', ARRAY['chest', 'shoulders', 'triceps'], 'bodyweight', 'beginner', 'Start in plank position, lower body to ground, push back up', '11111111-1111-1111-1111-111111111111'),
('11111111-2222-3333-4444-555555555552', 'Sample Squats', 'Fundamental leg exercise', ARRAY['quadriceps', 'glutes', 'hamstrings'], 'bodyweight', 'beginner', 'Stand with feet shoulder-width apart, lower hips back and down, return to standing', '11111111-1111-1111-1111-111111111111'),
('11111111-2222-3333-4444-555555555553', 'Sample Plank', 'Core strengthening exercise', ARRAY['core', 'shoulders'], 'bodyweight', 'beginner', 'Hold plank position with straight body line', '11111111-1111-1111-1111-111111111111'),
('11111111-2222-3333-4444-555555555554', 'Sample Lunges', 'Single leg strengthening exercise', ARRAY['quadriceps', 'glutes', 'hamstrings'], 'bodyweight', 'intermediate', 'Step forward into lunge position, return to standing, alternate legs', '11111111-1111-1111-1111-111111111111'),
('11111111-2222-3333-4444-555555555555', 'Sample Burpees', 'Full body cardio exercise', ARRAY['full_body'], 'bodyweight', 'advanced', 'Squat down, jump back to plank, do push-up, jump feet forward, jump up', '11111111-1111-1111-1111-111111111111');

-- Create sample workouts
INSERT INTO workouts (id, name, description, created_by) VALUES
('22222222-3333-4444-5555-666666666661', 'Sample Beginner Workout', 'A basic full-body workout for beginners', '11111111-1111-1111-1111-111111111111'),
('22222222-3333-4444-5555-666666666662', 'Sample Intermediate Workout', 'Intermediate level strength training', '11111111-1111-1111-1111-111111111111'),
('22222222-3333-4444-5555-666666666663', 'Sample Advanced Workout', 'High intensity full-body workout', '11111111-1111-1111-1111-111111111111');

-- Create workout exercises (linking workouts to exercises)
INSERT INTO workout_exercises (id, workout_id, exercise_id, sets, reps, rest_seconds, order_index) VALUES
-- Beginner Workout
('33333333-4444-5555-6666-777777777771', '22222222-3333-4444-5555-666666666661', '11111111-2222-3333-4444-555555555551', 3, 10, 60, 1),
('33333333-4444-5555-6666-777777777772', '22222222-3333-4444-5555-666666666661', '11111111-2222-3333-4444-555555555552', 3, 15, 60, 2),
('33333333-4444-5555-6666-777777777773', '22222222-3333-4444-5555-666666666661', '11111111-2222-3333-4444-555555555553', 3, 30, 60, 3),

-- Intermediate Workout
('33333333-4444-5555-6666-777777777774', '22222222-3333-4444-5555-666666666662', '11111111-2222-3333-4444-555555555551', 4, 15, 45, 1),
('33333333-4444-5555-6666-777777777775', '22222222-3333-4444-5555-666666666662', '11111111-2222-3333-4444-555555555554', 3, 12, 45, 2),
('33333333-4444-5555-6666-777777777776', '22222222-3333-4444-5555-666666666662', '11111111-2222-3333-4444-555555555553', 3, 45, 45, 3),

-- Advanced Workout
('33333333-4444-5555-6666-777777777777', '22222222-3333-4444-5555-666666666663', '33333333-4444-5555-6666-777777777555', 5, 10, 30, 1),
('33333333-4444-5555-6666-777777777778', '22222222-3333-4444-5555-666666666663', '11111111-2222-3333-4444-555555555554', 4, 15, 30, 2),
('33333333-4444-5555-6666-777777777779', '22222222-3333-4444-5555-666666666663', '11111111-2222-3333-4444-555555555551', 4, 20, 30, 3);

-- Create user workout assignments
INSERT INTO user_workouts (id, user_id, workout_id, assigned_by, assigned_at, completed_at, notes) VALUES
-- Completed assignment from 3 days ago
('44444444-5555-6666-7777-888888888881', '22222222-2222-2222-2222-222222222222', '22222222-3333-4444-5555-666666666661', '11111111-1111-1111-1111-111111111111', NOW() - INTERVAL '3 days', NOW() - INTERVAL '2 days', 'Great job completing this workout!'),

-- Completed assignment from yesterday
('44444444-5555-6666-7777-888888888882', '22222222-2222-2222-2222-222222222222', '22222222-3333-4444-5555-666666666662', '11111111-1111-1111-1111-111111111111', NOW() - INTERVAL '2 days', NOW() - INTERVAL '1 day', 'Excellent form and effort'),

-- Pending assignment from today
('44444444-5555-6666-7777-888888888883', '22222222-2222-2222-2222-222222222222', '22222222-3333-4444-5555-666666666663', '11111111-1111-1111-1111-111111111111', NOW(), NULL, NULL);
