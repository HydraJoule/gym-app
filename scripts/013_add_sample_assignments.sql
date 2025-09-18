-- Add sample workout assignments for testing
-- This will create some user_workouts entries so the admin dashboard shows recent assignments

-- First, let's make sure we have some workouts and the customer user
INSERT INTO workouts (id, name, description, created_by, created_at, updated_at) VALUES
  ('22222222-2222-2222-2222-222222222222', 'Full Body Beginner', 'A comprehensive full-body workout perfect for beginners', '11111111-1111-1111-1111-111111111111', NOW(), NOW()),
  ('33333333-3333-3333-3333-333333333333', 'Upper Body Strength', 'Focus on building upper body strength and muscle', '11111111-1111-1111-1111-111111111111', NOW(), NOW()),
  ('44444444-4444-4444-4444-444444444444', 'Cardio Blast', 'High-intensity cardio workout to burn calories', '11111111-1111-1111-1111-111111111111', NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  updated_at = NOW();

-- Add some workout assignments
INSERT INTO user_workouts (id, user_id, workout_id, assigned_by, assigned_at, completed_at, notes) VALUES
  ('55555555-5555-5555-5555-555555555555', '22222222-2222-2222-2222-222222222222', '22222222-2222-2222-2222-222222222222', '11111111-1111-1111-1111-111111111111', NOW() - INTERVAL '2 days', NOW() - INTERVAL '1 day', 'Great job completing this workout!'),
  ('66666666-6666-6666-6666-666666666666', '22222222-2222-2222-2222-222222222222', '33333333-3333-3333-3333-333333333333', '11111111-1111-1111-1111-111111111111', NOW() - INTERVAL '1 day', NULL, NULL),
  ('77777777-7777-7777-7777-777777777777', '22222222-2222-2222-2222-222222222222', '44444444-4444-4444-4444-444444444444', '11111111-1111-1111-1111-111111111111', NOW(), NULL, NULL)
ON CONFLICT (id) DO UPDATE SET
  assigned_at = EXCLUDED.assigned_at,
  completed_at = EXCLUDED.completed_at,
  notes = EXCLUDED.notes;

-- Add some workout exercises to make the workouts more complete
INSERT INTO workout_exercises (id, workout_id, exercise_id, order_index, sets, reps, weight, rest_seconds, notes) VALUES
  ('88888888-8888-8888-8888-888888888888', '22222222-2222-2222-2222-222222222222', '11111111-1111-1111-1111-111111111111', 1, 3, 10, 135.0, 60, 'Focus on form'),
  ('99999999-9999-9999-9999-999999999999', '22222222-2222-2222-2222-222222222222', '22222222-2222-2222-2222-222222222222', 2, 3, 12, 25.0, 45, 'Control the movement'),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '33333333-3333-3333-3333-333333333333', '33333333-3333-3333-3333-333333333333', 1, 4, 8, 45.0, 90, 'Full range of motion')
ON CONFLICT (id) DO NOTHING;
