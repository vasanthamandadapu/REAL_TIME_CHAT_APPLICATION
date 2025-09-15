-- =====================================================
-- CREATE ADMIN USER
-- =====================================================
-- Run this AFTER you've signed up with your email
-- Replace 'your-email@example.com' with your actual email

-- Promote your user to admin (run after signing up)
UPDATE public.profiles 
SET role = 'admin' 
WHERE email = 'your-email@example.com';

-- Verify the admin user was created
SELECT id, full_name, email, role, created_at 
FROM public.profiles 
WHERE role = 'admin';
