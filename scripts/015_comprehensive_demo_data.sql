-- Comprehensive demo data for all tables
-- This script creates extensive sample data to populate the gym workout app

-- Clear existing sample data to avoid conflicts
DELETE FROM workout_exercises WHERE workout_id IN (
  SELECT id FROM workouts WHERE name LIKE 'Sample%' OR name LIKE 'Demo%'
);
DELETE FROM user_workouts WHERE workout_id IN (
  SELECT id FROM workouts WHERE name LIKE 'Sample%' OR name LIKE 'Demo%'
);
DELETE FROM workouts WHERE name LIKE 'Sample%' OR name LIKE 'Demo%';
DELETE FROM exercises WHERE name LIKE 'Sample%' OR name LIKE 'Demo%';

-- Create demo auth users only if they don't already exist
-- Note: In production, users would be created through Supabase Auth signup
INSERT INTO auth.users (
  id,
  instance_id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  confirmation_token,
  email_change,
  email_change_token_new,
  recovery_token
) 
SELECT 
  gen_random_uuid(),
  '00000000-0000-0000-0000-000000000000',
  'authenticated',
  'authenticated',
  email_val,
  crypt('password123', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW(),
  '',
  '',
  '',
  ''
FROM (VALUES 
  ('sarah.johnson@example.com'),
  ('mike.chen@example.com'),
  ('emma.davis@example.com'),
  ('alex.rodriguez@example.com'),
  ('jessica.kim@example.com'),
  ('david.wilson@example.com'),
  ('maria.garcia@example.com'),
  ('james.taylor@example.com'),
  ('lisa.anderson@example.com'),
  ('ryan.thompson@example.com')
) AS demo_emails(email_val)
WHERE NOT EXISTS (
  SELECT 1 FROM auth.users WHERE email = demo_emails.email_val
);

-- Create profiles only for users that don't already have profiles
-- Create demo user profiles with diverse backgrounds and fitness levels
INSERT INTO profiles (id, email, full_name, role, created_at)
SELECT 
  u.id,
  u.email,
  CASE u.email
    WHEN 'sarah.johnson@example.com' THEN 'Sarah Johnson'
    WHEN 'mike.chen@example.com' THEN 'Mike Chen'
    WHEN 'emma.davis@example.com' THEN 'Emma Davis'
    WHEN 'alex.rodriguez@example.com' THEN 'Alex Rodriguez'
    WHEN 'jessica.kim@example.com' THEN 'Jessica Kim'
    WHEN 'david.wilson@example.com' THEN 'David Wilson'
    WHEN 'maria.garcia@example.com' THEN 'Maria Garcia'
    WHEN 'james.taylor@example.com' THEN 'James Taylor'
    WHEN 'lisa.anderson@example.com' THEN 'Lisa Anderson'
    WHEN 'ryan.thompson@example.com' THEN 'Ryan Thompson'
  END,
  CASE u.email
    WHEN 'mike.chen@example.com' THEN 'admin'
    WHEN 'jessica.kim@example.com' THEN 'admin'
    WHEN 'lisa.anderson@example.com' THEN 'admin'
    ELSE 'customer'
  END,
  CASE u.email
    WHEN 'sarah.johnson@example.com' THEN NOW() - INTERVAL '3 months'
    WHEN 'mike.chen@example.com' THEN NOW() - INTERVAL '2 months'
    WHEN 'emma.davis@example.com' THEN NOW() - INTERVAL '6 weeks'
    WHEN 'alex.rodriguez@example.com' THEN NOW() - INTERVAL '1 month'
    WHEN 'jessica.kim@example.com' THEN NOW() - INTERVAL '4 months'
    WHEN 'david.wilson@example.com' THEN NOW() - INTERVAL '2 weeks'
    WHEN 'maria.garcia@example.com' THEN NOW() - INTERVAL '5 weeks'
    WHEN 'james.taylor@example.com' THEN NOW() - INTERVAL '3 weeks'
    WHEN 'lisa.anderson@example.com' THEN NOW() - INTERVAL '1 month'
    WHEN 'ryan.thompson@example.com' THEN NOW() - INTERVAL '1 week'
  END
FROM auth.users u
WHERE u.email IN (
  'sarah.johnson@example.com', 'mike.chen@example.com', 'emma.davis@example.com',
  'alex.rodriguez@example.com', 'jessica.kim@example.com', 'david.wilson@example.com',
  'maria.garcia@example.com', 'james.taylor@example.com', 'lisa.anderson@example.com',
  'ryan.thompson@example.com'
)
AND NOT EXISTS (
  SELECT 1 FROM profiles WHERE profiles.id = u.id
);

-- Adding comprehensive exercise library
-- Using gen_random_uuid() instead of string IDs for UUID fields
INSERT INTO exercises (name, description, muscle_groups, equipment, difficulty_level, instructions, created_by) VALUES
-- Bodyweight exercises
('Push-ups', 'Classic bodyweight chest exercise targeting chest, shoulders, and triceps', ARRAY['chest', 'shoulders', 'triceps'], 'bodyweight', 'beginner', 'Start in plank position with hands shoulder-width apart. Lower body until chest nearly touches floor, then push back up to starting position.', (SELECT id FROM profiles WHERE email = 'admin@example.com')),
('Bodyweight Squats', 'Fundamental lower body exercise for legs and glutes', ARRAY['quadriceps', 'glutes', 'hamstrings'], 'bodyweight', 'beginner', 'Stand with feet shoulder-width apart. Lower hips back and down as if sitting in a chair, then return to standing position.', (SELECT id FROM profiles WHERE email = 'admin@example.com')),
('Plank', 'Core strengthening isometric exercise', ARRAY['core', 'shoulders'], 'bodyweight', 'beginner', 'Hold push-up position with forearms on ground. Maintain straight line from head to heels, engaging core muscles.', (SELECT id FROM profiles WHERE email = 'admin@example.com')),
('Lunges', 'Single-leg strengthening exercise', ARRAY['quadriceps', 'glutes', 'hamstrings'], 'bodyweight', 'intermediate', 'Step forward into lunge position, lowering back knee toward ground. Push through front heel to return to standing, then alternate legs.', (SELECT id FROM profiles WHERE email = 'admin@example.com')),
('Burpees', 'Full-body high-intensity cardio exercise', ARRAY['full_body'], 'bodyweight', 'advanced', 'Squat down, place hands on floor, jump back to plank, perform push-up, jump feet forward, then jump up with arms overhead.', (SELECT id FROM profiles WHERE email = 'admin@example.com')),
('Mountain Climbers', 'Dynamic core and cardio exercise', ARRAY['core', 'shoulders'], 'bodyweight', 'intermediate', 'Start in plank position. Alternate bringing knees toward chest in a running motion while maintaining plank position.', (SELECT id FROM profiles WHERE email = 'admin@example.com')),
('Jump Squats', 'Explosive lower body plyometric exercise', ARRAY['quadriceps', 'glutes', 'hamstrings'], 'bodyweight', 'intermediate', 'Perform regular squat, then explode upward into a jump. Land softly and immediately go into next squat.', (SELECT id FROM profiles WHERE email = 'admin@example.com')),
('Pike Push-ups', 'Bodyweight shoulder exercise', ARRAY['shoulders', 'triceps'], 'bodyweight', 'intermediate', 'Start in downward dog position. Lower head toward ground by bending arms, then push back up.', (SELECT id FROM profiles WHERE email = 'admin@example.com')),

-- Dumbbell exercises
('Dumbbell Bench Press', 'Chest pressing movement with dumbbells', ARRAY['chest', 'shoulders', 'triceps'], 'dumbbells', 'intermediate', 'Lie on bench holding dumbbells at chest level. Press weights up until arms are extended, then lower with control.', (SELECT id FROM profiles WHERE email = 'admin@example.com')),
('Dumbbell Rows', 'Back strengthening pulling exercise', ARRAY['back', 'biceps'], 'dumbbells', 'intermediate', 'Hinge at hips with dumbbell in each hand. Pull weights to ribcage, squeezing shoulder blades together.', (SELECT id FROM profiles WHERE email = 'admin@example.com')),
('Dumbbell Shoulder Press', 'Overhead pressing for shoulders', ARRAY['shoulders', 'triceps'], 'dumbbells', 'intermediate', 'Hold dumbbell at shoulder height. Press weights overhead until arms are extended, then lower with control.', (SELECT id FROM profiles WHERE email = 'admin@example.com')),
('Dumbbell Goblet Squats', 'Squat variation holding weight at chest', ARRAY['quadriceps', 'glutes', 'hamstrings'], 'dumbbells', 'beginner', 'Hold dumbbell at chest with both hands. Perform squat while keeping weight close to body.', (SELECT id FROM profiles WHERE email = 'admin@example.com')),
('Dumbbell Deadlifts', 'Hip hinge movement with dumbbells', ARRAY['hamstrings', 'glutes', 'back'], 'dumbbells', 'intermediate', 'Hold dumbbells in front of thighs. Hinge at hips to lower weights, then drive hips forward to return to standing.', (SELECT id FROM profiles WHERE email = 'admin@example.com')),

-- Barbell exercises
('Barbell Back Squats', 'King of leg exercises with barbell', ARRAY['quadriceps', 'glutes', 'hamstrings'], 'barbell', 'advanced', 'Position barbell on upper back. Squat down until thighs are parallel to floor, then drive through heels to stand.', (SELECT id FROM profiles WHERE email = 'admin@example.com')),
('Barbell Deadlifts', 'Compound posterior chain exercise', ARRAY['hamstrings', 'glutes', 'back'], 'barbell', 'advanced', 'Stand with feet hip-width apart, bar over mid-foot. Hinge at hips to grip bar, then drive hips forward to lift.', (SELECT id FROM profiles WHERE email = 'admin@example.com')),
('Barbell Bench Press', 'Classic chest pressing exercise', ARRAY['chest', 'shoulders', 'triceps'], 'barbell', 'intermediate', 'Lie on bench, grip bar slightly wider than shoulders. Lower bar to chest, then press up to full arm extension.', (SELECT id FROM profiles WHERE email = 'admin@example.com')),
('Barbell Rows', 'Bent-over rowing for back development', ARRAY['back', 'biceps'], 'barbell', 'intermediate', 'Hinge at hips holding barbell. Pull bar to lower chest/upper abdomen, squeezing shoulder blades together.', (SELECT id FROM profiles WHERE email = 'admin@example.com')),

-- Machine/Equipment exercises
('Pull-ups', 'Upper body pulling exercise', ARRAY['back', 'biceps'], 'pull-up bar', 'intermediate', 'Hang from bar with arms extended. Pull body up until chin clears bar, then lower with control.', (SELECT id FROM profiles WHERE email = 'admin@example.com')),
('Dips', 'Tricep and chest exercise on parallel bars', ARRAY['triceps', 'chest', 'shoulders'], 'dip bars', 'intermediate', 'Support body on parallel bars. Lower body by bending arms, then push back up to starting position.', (SELECT id FROM profiles WHERE email = 'admin@example.com')),
('Kettlebell Swings', 'Dynamic hip hinge exercise', ARRAY['hamstrings', 'glutes', 'core'], 'kettlebell', 'intermediate', 'Hinge at hips with kettlebell between legs. Drive hips forward to swing weight to shoulder height.', (SELECT id FROM profiles WHERE email = 'admin@example.com'));

-- Store exercise IDs for workout creation
-- Creating temporary variables to store exercise IDs for later use
DO $$
DECLARE
    pushup_id UUID;
    squat_id UUID;
    plank_id UUID;
    lunge_id UUID;
    burpee_id UUID;
    mountain_climber_id UUID;
    jump_squat_id UUID;
    pike_pushup_id UUID;
    db_bench_id UUID;
    db_row_id UUID;
    db_shoulder_id UUID;
    goblet_squat_id UUID;
    db_deadlift_id UUID;
    bb_squat_id UUID;
    bb_deadlift_id UUID;
    bb_bench_id UUID;
    bb_row_id UUID;
    pullup_id UUID;
    dip_id UUID;
    kb_swing_id UUID;
    admin_id UUID;
    customer_id UUID;
    
    -- Adding variables for new demo users
    sarah_id UUID;
    mike_id UUID;
    emma_id UUID;
    alex_id UUID;
    jessica_id UUID;
    david_id UUID;
    maria_id UUID;
    james_id UUID;
    lisa_id UUID;
    ryan_id UUID;
    
    -- Workout IDs
    beginner_fb_id UUID;
    upper_strength_id UUID;
    lower_power_id UUID;
    hiit_cardio_id UUID;
    core_stability_id UUID;
    push_day_id UUID;
    pull_day_id UUID;
    leg_day_id UUID;
    fb_strength_id UUID;
    bw_circuit_id UUID;
BEGIN
    -- Get exercise IDs
    SELECT id INTO pushup_id FROM exercises WHERE name = 'Push-ups';
    SELECT id INTO squat_id FROM exercises WHERE name = 'Bodyweight Squats';
    SELECT id INTO plank_id FROM exercises WHERE name = 'Plank';
    SELECT id INTO lunge_id FROM exercises WHERE name = 'Lunges';
    SELECT id INTO burpee_id FROM exercises WHERE name = 'Burpees';
    SELECT id INTO mountain_climber_id FROM exercises WHERE name = 'Mountain Climbers';
    SELECT id INTO jump_squat_id FROM exercises WHERE name = 'Jump Squats';
    SELECT id INTO pike_pushup_id FROM exercises WHERE name = 'Pike Push-ups';
    SELECT id INTO db_bench_id FROM exercises WHERE name = 'Dumbbell Bench Press';
    SELECT id INTO db_row_id FROM exercises WHERE name = 'Dumbbell Rows';
    SELECT id INTO db_shoulder_id FROM exercises WHERE name = 'Dumbbell Shoulder Press';
    SELECT id INTO goblet_squat_id FROM exercises WHERE name = 'Dumbbell Goblet Squats';
    SELECT id INTO db_deadlift_id FROM exercises WHERE name = 'Dumbbell Deadlifts';
    SELECT id INTO bb_squat_id FROM exercises WHERE name = 'Barbell Back Squats';
    SELECT id INTO bb_deadlift_id FROM exercises WHERE name = 'Barbell Deadlifts';
    SELECT id INTO bb_bench_id FROM exercises WHERE name = 'Barbell Bench Press';
    SELECT id INTO bb_row_id FROM exercises WHERE name = 'Barbell Rows';
    SELECT id INTO pullup_id FROM exercises WHERE name = 'Pull-ups';
    SELECT id INTO dip_id FROM exercises WHERE name = 'Dips';
    SELECT id INTO kb_swing_id FROM exercises WHERE name = 'Kettlebell Swings';
    
    -- Get user IDs
    SELECT id INTO admin_id FROM profiles WHERE email = 'admin@example.com';
    SELECT id INTO customer_id FROM profiles WHERE email = 'customer@example.com';
    
    -- Get new demo user IDs
    SELECT id INTO sarah_id FROM profiles WHERE email = 'sarah.johnson@example.com';
    SELECT id INTO mike_id FROM profiles WHERE email = 'mike.chen@example.com';
    SELECT id INTO emma_id FROM profiles WHERE email = 'emma.davis@example.com';
    SELECT id INTO alex_id FROM profiles WHERE email = 'alex.rodriguez@example.com';
    SELECT id INTO jessica_id FROM profiles WHERE email = 'jessica.kim@example.com';
    SELECT id INTO david_id FROM profiles WHERE email = 'david.wilson@example.com';
    SELECT id INTO maria_id FROM profiles WHERE email = 'maria.garcia@example.com';
    SELECT id INTO james_id FROM profiles WHERE email = 'james.taylor@example.com';
    SELECT id INTO lisa_id FROM profiles WHERE email = 'lisa.anderson@example.com';
    SELECT id INTO ryan_id FROM profiles WHERE email = 'ryan.thompson@example.com';

    -- Create diverse workout programs
    INSERT INTO workouts (name, description, created_by) VALUES
    ('Beginner Full Body', 'Complete beginner-friendly workout targeting all major muscle groups with bodyweight exercises', admin_id),
    ('Upper Body Strength', 'Focused upper body workout for building strength in chest, back, shoulders, and arms', admin_id),
    ('Lower Body Power', 'Explosive lower body workout emphasizing strength and power in legs and glutes', admin_id),
    ('HIIT Cardio Blast', 'High-intensity interval training for cardiovascular fitness and fat burning', admin_id),
    ('Core & Stability', 'Comprehensive core workout focusing on stability and functional strength', admin_id),
    ('Push Day', 'Upper body pushing movements for chest, shoulders, and triceps', admin_id),
    ('Pull Day', 'Upper body pulling movements for back and biceps development', admin_id),
    ('Leg Day', 'Comprehensive lower body workout for maximum leg development', admin_id),
    ('Full Body Strength', 'Advanced full body workout combining compound movements', admin_id),
    ('Bodyweight Circuit', 'No-equipment circuit training for anywhere, anytime fitness', admin_id);

    -- Get workout IDs
    SELECT id INTO beginner_fb_id FROM workouts WHERE name = 'Beginner Full Body';
    SELECT id INTO upper_strength_id FROM workouts WHERE name = 'Upper Body Strength';
    SELECT id INTO lower_power_id FROM workouts WHERE name = 'Lower Body Power';
    SELECT id INTO hiit_cardio_id FROM workouts WHERE name = 'HIIT Cardio Blast';
    SELECT id INTO core_stability_id FROM workouts WHERE name = 'Core & Stability';
    SELECT id INTO push_day_id FROM workouts WHERE name = 'Push Day';
    SELECT id INTO pull_day_id FROM workouts WHERE name = 'Pull Day';
    SELECT id INTO leg_day_id FROM workouts WHERE name = 'Leg Day';
    SELECT id INTO fb_strength_id FROM workouts WHERE name = 'Full Body Strength';
    SELECT id INTO bw_circuit_id FROM workouts WHERE name = 'Bodyweight Circuit';

    -- Create workout-exercise relationships with detailed programming
    INSERT INTO workout_exercises (workout_id, exercise_id, sets, reps, weight, rest_seconds, order_index, notes) VALUES
    -- Beginner Full Body
    (beginner_fb_id, pushup_id, 3, 8, NULL, 60, 1, 'Start with knee push-ups if needed'),
    (beginner_fb_id, squat_id, 3, 12, NULL, 60, 2, 'Focus on proper form over speed'),
    (beginner_fb_id, plank_id, 3, 30, NULL, 60, 3, 'Hold for 30 seconds, build up gradually'),
    (beginner_fb_id, lunge_id, 3, 10, NULL, 60, 4, '10 reps each leg, alternate'),

    -- Upper Body Strength
    (upper_strength_id, db_bench_id, 4, 8, 25.0, 90, 1, 'Use challenging but manageable weight'),
    (upper_strength_id, db_row_id, 4, 10, 20.0, 90, 2, 'Focus on squeezing shoulder blades'),
    (upper_strength_id, db_shoulder_id, 3, 8, 15.0, 75, 3, 'Press straight up, avoid arching back'),
    (upper_strength_id, pullup_id, 3, 6, NULL, 90, 4, 'Use assistance if needed'),

    -- Lower Body Power
    (lower_power_id, bb_squat_id, 4, 6, 135.0, 120, 1, 'Focus on explosive upward movement'),
    (lower_power_id, bb_deadlift_id, 4, 5, 155.0, 120, 2, 'Maintain neutral spine throughout'),
    (lower_power_id, jump_squat_id, 3, 12, NULL, 60, 3, 'Land softly, absorb impact'),
    (lower_power_id, kb_swing_id, 3, 15, 35.0, 75, 4, 'Drive through hips, not arms'),

    -- HIIT Cardio Blast
    (hiit_cardio_id, burpee_id, 4, 10, NULL, 30, 1, '10 burpees, 30 seconds rest'),
    (hiit_cardio_id, mountain_climber_id, 4, 20, NULL, 30, 2, '20 mountain climbers, 30 seconds rest'),
    (hiit_cardio_id, jump_squat_id, 4, 15, NULL, 30, 3, '15 jump squats, 30 seconds rest'),
    (hiit_cardio_id, pushup_id, 4, 12, NULL, 30, 4, '12 push-ups, 30 seconds rest'),

    -- Core & Stability
    (core_stability_id, plank_id, 4, 45, NULL, 45, 1, 'Hold plank for 45 seconds'),
    (core_stability_id, mountain_climber_id, 3, 30, NULL, 45, 2, '30 mountain climbers'),
    (core_stability_id, pike_pushup_id, 3, 8, NULL, 60, 3, 'Pike push-ups for core and shoulders'),

    -- Push Day
    (push_day_id, bb_bench_id, 4, 8, 155.0, 120, 1, 'Barbell bench press - compound movement'),
    (push_day_id, db_shoulder_id, 3, 10, 20.0, 90, 2, 'Dumbbell shoulder press'),
    (push_day_id, dip_id, 3, 8, NULL, 90, 3, 'Dips for triceps'),
    (push_day_id, pushup_id, 3, 15, NULL, 60, 4, 'Push-ups to finish'),

    -- Pull Day
    (pull_day_id, pullup_id, 4, 6, NULL, 120, 1, 'Pull-ups - king of back exercises'),
    (pull_day_id, bb_row_id, 4, 8, 95.0, 90, 2, 'Barbell rows'),
    (pull_day_id, db_row_id, 3, 12, 25.0, 75, 3, 'Dumbbell rows'),

    -- Leg Day
    (leg_day_id, bb_squat_id, 5, 8, 185.0, 150, 1, 'Heavy back squats'),
    (leg_day_id, bb_deadlift_id, 4, 6, 205.0, 150, 2, 'Heavy deadlifts'),
    (leg_day_id, lunge_id, 3, 12, NULL, 60, 3, 'Bodyweight lunges'),
    (leg_day_id, goblet_squat_id, 3, 15, 40.0, 60, 4, 'Goblet squats for volume'),

    -- Full Body Strength
    (fb_strength_id, bb_squat_id, 4, 6, 165.0, 120, 1, 'Back squats'),
    (fb_strength_id, bb_bench_id, 4, 6, 145.0, 120, 2, 'Bench press'),
    (fb_strength_id, bb_deadlift_id, 3, 5, 185.0, 120, 3, 'Deadlifts'),
    (fb_strength_id, pullup_id, 3, 8, NULL, 90, 4, 'Pull-ups'),

    -- Bodyweight Circuit
    (bw_circuit_id, pushup_id, 3, 12, NULL, 45, 1, 'Push-ups'),
    (bw_circuit_id, squat_id, 3, 15, NULL, 45, 2, 'Bodyweight squats'),
    (bw_circuit_id, lunge_id, 3, 10, NULL, 45, 3, '10 each leg'),
    (bw_circuit_id, plank_id, 3, 30, NULL, 45, 4, '30-second plank'),
    (bw_circuit_id, mountain_climber_id, 3, 20, NULL, 45, 5, 'Mountain climbers');

    -- Create comprehensive user workout assignments for all demo users
    INSERT INTO user_workouts (user_id, workout_id, assigned_by, assigned_at, completed_at, notes)
    SELECT user_id, workout_id, assigned_by, assigned_at, completed_at, notes
    FROM (VALUES
        -- Customer user assignments - Completed workouts from past weeks
        (customer_id, beginner_fb_id, admin_id, NOW() - INTERVAL '14 days', NOW() - INTERVAL '13 days', 'Great first workout! Excellent form on squats.'),
        (customer_id, bw_circuit_id, admin_id, NOW() - INTERVAL '12 days', NOW() - INTERVAL '11 days', 'Loved the bodyweight circuit! Felt challenging but doable.'),
        (customer_id, core_stability_id, admin_id, NOW() - INTERVAL '10 days', NOW() - INTERVAL '9 days', 'Core workout was tough but really effective. Plank time improved!'),
        (customer_id, upper_strength_id, admin_id, NOW() - INTERVAL '8 days', NOW() - INTERVAL '7 days', 'Upper body strength session went well. Ready for heavier weights next time.'),
        (customer_id, hiit_cardio_id, admin_id, NOW() - INTERVAL '6 days', NOW() - INTERVAL '5 days', 'HIIT was intense! Great cardio workout, felt energized after.'),
        (customer_id, lower_power_id, admin_id, NOW() - INTERVAL '4 days', NOW() - INTERVAL '3 days', 'Lower body power day - legs were shaking! Good progression.'),
        (customer_id, push_day_id, admin_id, NOW() - INTERVAL '2 days', NOW() - INTERVAL '1 day', 'Push day completed! Bench press felt strong today.'),
        (customer_id, pull_day_id, admin_id, NOW() - INTERVAL '1 day', NULL, 'Pull day scheduled for today - excited for back work!'),
        (customer_id, leg_day_id, admin_id, NOW(), NULL, 'Leg day coming up - time to test that squat progress!'),
        (customer_id, fb_strength_id, admin_id, NOW() + INTERVAL '2 days', NULL, 'Full body strength - bringing it all together'),

        -- Sarah Johnson - Beginner member, consistent with bodyweight exercises
        (sarah_id, beginner_fb_id, mike_id, NOW() - INTERVAL '10 days', NOW() - INTERVAL '9 days', 'First workout completed! Great effort on form.'),
        (sarah_id, bw_circuit_id, mike_id, NOW() - INTERVAL '7 days', NOW() - INTERVAL '6 days', 'Bodyweight circuit went well. Building confidence!'),
        (sarah_id, core_stability_id, mike_id, NOW() - INTERVAL '4 days', NOW() - INTERVAL '3 days', 'Core strength improving. Plank held for full 45 seconds!'),
        (sarah_id, upper_strength_id, mike_id, NOW() + INTERVAL '2 days', NULL, 'Time to try some light weights!'),

        -- Emma Davis - Intermediate member, loves HIIT and cardio
        (emma_id, hiit_cardio_id, jessica_id, NOW() - INTERVAL '8 days', NOW() - INTERVAL '7 days', 'HIIT session crushed! Love the intensity.'),
        (emma_id, bw_circuit_id, jessica_id, NOW() - INTERVAL '5 days', NOW() - INTERVAL '4 days', 'Circuit training is my favorite! Great variety.'),
        (emma_id, core_stability_id, jessica_id, NOW() - INTERVAL '2 days', NOW() - INTERVAL '1 day', 'Core work is paying off. Feeling stronger!'),
        (emma_id, upper_strength_id, jessica_id, NOW() + INTERVAL '4 days', NULL, 'Ready to add some upper body strength work'),

        -- Alex Rodriguez - Strength focused member
        (alex_id, upper_strength_id, lisa_id, NOW() - INTERVAL '6 days', NOW() - INTERVAL '5 days', 'Upper body strength felt great. Ready for heavier weights.'),
        (alex_id, lower_power_id, lisa_id, NOW() - INTERVAL '3 days', NOW() - INTERVAL '2 days', 'Lower body power session was intense! Squats felt strong.'),
        (alex_id, push_day_id, lisa_id, NOW(), NULL, 'Push day today - excited for bench press!'),
        (alex_id, pull_day_id, lisa_id, NOW() + INTERVAL '2 days', NULL, 'Pull day coming up - time for back work'),
        (alex_id, leg_day_id, lisa_id, NOW() + INTERVAL '5 days', NULL, 'Leg day scheduled - ready to test limits'),

        -- David Wilson - New member, just started
        (david_id, beginner_fb_id, mike_id, NOW() - INTERVAL '3 days', NOW() - INTERVAL '2 days', 'First ever workout! Challenging but felt great.'),
        (david_id, bw_circuit_id, mike_id, NOW(), NULL, 'Second workout - bodyweight circuit today'),
        (david_id, core_stability_id, mike_id, NOW() + INTERVAL '3 days', NULL, 'Core workout coming up - need to build that foundation'),

        -- Maria Garcia - Consistent member, balanced approach
        (maria_id, upper_strength_id, jessica_id, NOW() - INTERVAL '9 days', NOW() - INTERVAL '8 days', 'Upper body workout completed. Form is improving!'),
        (maria_id, core_stability_id, jessica_id, NOW() - INTERVAL '6 days', NOW() - INTERVAL '5 days', 'Core stability session done. Feeling more balanced.'),
        (maria_id, lower_power_id, jessica_id, NOW() - INTERVAL '3 days', NOW() - INTERVAL '2 days', 'Lower body power was challenging but rewarding.'),
        (maria_id, fb_strength_id, jessica_id, NOW() + INTERVAL '1 day', NULL, 'Full body strength - ready for the challenge!'),

        -- James Taylor - Advanced member, heavy lifting focus
        (james_id, leg_day_id, lisa_id, NOW() - INTERVAL '5 days', NOW() - INTERVAL '4 days', 'Leg day crushed! Hit new PR on squats.'),
        (james_id, push_day_id, lisa_id, NOW() - INTERVAL '2 days', NOW() - INTERVAL '1 day', 'Push day completed. Bench press felt strong.'),
        (james_id, pull_day_id, lisa_id, NOW() + INTERVAL '1 day', NULL, 'Pull day tomorrow - ready for back work'),
        (james_id, fb_strength_id, lisa_id, NOW() + INTERVAL '4 days', NULL, 'Full body strength session coming up'),

        -- Ryan Thompson - Very new member, first week
        (ryan_id, beginner_fb_id, mike_id, NOW() - INTERVAL '2 days', NOW() - INTERVAL '1 day', 'First workout ever! Nervous but excited to continue.'),
        (ryan_id, bw_circuit_id, mike_id, NOW() + INTERVAL '2 days', NULL, 'Second workout scheduled - bodyweight circuit')
    ) AS new_assignments(user_id, workout_id, assigned_by, assigned_at, completed_at, notes)
    WHERE NOT EXISTS (
        SELECT 1 FROM user_workouts uw 
        WHERE uw.user_id = new_assignments.user_id 
        AND uw.workout_id = new_assignments.workout_id
    );

END $$;
