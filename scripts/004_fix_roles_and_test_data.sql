-- Create test admin and customer users with proper roles
-- First, let's make sure we have proper test data with roles

-- Update any existing profiles to have proper roles
UPDATE profiles SET role = 'customer' WHERE role IS NULL OR role = '';

-- Insert test admin user (you can use this to test admin functionality)
-- Note: You'll need to sign up with this email first, then this will update the role
INSERT INTO profiles (id, email, full_name, role) 
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'admin@gym.com',
  'Admin User',
  'admin'
) ON CONFLICT (id) DO UPDATE SET 
  role = 'admin',
  full_name = 'Admin User';

-- Insert test customer user
INSERT INTO profiles (id, email, full_name, role) 
VALUES (
  '00000000-0000-0000-0000-000000000002', 
  'customer@gym.com',
  'Customer User',
  'customer'
) ON CONFLICT (id) DO UPDATE SET 
  role = 'customer',
  full_name = 'Customer User';

-- Make sure all existing users have a role assigned
UPDATE profiles SET role = 'customer' WHERE role IS NULL;
