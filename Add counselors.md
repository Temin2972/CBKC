-- ============================================
-- ADD COUNSELOR ACCOUNT - Complete Working Version
-- ============================================

-- METHOD 1: Simple Two-Step Process (Recommended)
-- Step 1: Go to Supabase Dashboard → Authentication → Users → Add User
-- Fill in:
--   - Email: counselor@school.com
--   - Password: your_password_here
--   - Auto Confirm User: ✅ CHECK THIS!

-- Step 2: After user is created, run this SQL to set role:
UPDATE public.users 
SET 
  role = 'counselor',
  full_name = 'Nguyễn Văn Tư Vấn',
  specialty = 'Tâm lý học đường'
WHERE email = 'counselor@school.com';


-- ============================================
-- METHOD 2: Single SQL Command (All-in-One)
-- ============================================

DO $$
DECLARE
  new_user_id uuid;
  user_email text := 'counselor1@school.com';      -- CHANGE THIS
  user_password text := 'password123';              -- CHANGE THIS
  user_name text := 'Nguyễn Văn Tư Vấn';           -- CHANGE THIS
  user_specialty text := 'Tâm lý học đường';       -- CHANGE THIS (optional)
BEGIN
  -- Create auth user
  INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    raw_user_meta_data,
    created_at,
    updated_at,
    confirmation_token,
    recovery_token,
    email_change_token_new
  )
  VALUES (
    '00000000-0000-0000-0000-000000000000',
    gen_random_uuid(),
    'authenticated',
    'authenticated',
    user_email,
    crypt(user_password, gen_salt('bf')),
    NOW(),
    jsonb_build_object('full_name', user_name, 'role', 'counselor'),
    NOW(),
    NOW(),
    '',
    '',
    ''
  )
  RETURNING id INTO new_user_id;

  -- Create user profile
  INSERT INTO public.users (id, email, full_name, role, specialty, created_at)
  VALUES (new_user_id, user_email, user_name, 'counselor', user_specialty, NOW());

  RAISE NOTICE 'Counselor created successfully: %', user_email;
END $$;


-- ============================================
-- METHOD 3: Add Multiple Counselors at Once
-- ============================================

-- Counselor 1
DO $$
DECLARE new_user_id uuid;
BEGIN
  INSERT INTO auth.users (
    instance_id, id, aud, role, email, encrypted_password,
    email_confirmed_at, raw_user_meta_data, created_at, updated_at,
    confirmation_token, recovery_token, email_change_token_new
  ) VALUES (
    '00000000-0000-0000-0000-000000000000', gen_random_uuid(),
    'authenticated', 'authenticated', 'counselor1@school.com',
    crypt('pass123', gen_salt('bf')), NOW(),
    '{"full_name": "Nguyễn Văn A", "role": "counselor"}', NOW(), NOW(), '', '', ''
  ) RETURNING id INTO new_user_id;
  
  INSERT INTO public.users (id, email, full_name, role, specialty, created_at)
  VALUES (new_user_id, 'counselor1@school.com', 'Nguyễn Văn A', 'counselor', 'Tâm lý học đường', NOW());
END $$;

-- Counselor 2
DO $$
DECLARE new_user_id uuid;
BEGIN
  INSERT INTO auth.users (
    instance_id, id, aud, role, email, encrypted_password,
    email_confirmed_at, raw_user_meta_data, created_at, updated_at,
    confirmation_token, recovery_token, email_change_token_new
  ) VALUES (
    '00000000-0000-0000-0000-000000000000', gen_random_uuid(),
    'authenticated', 'authenticated', 'counselor2@school.com',
    crypt('pass456', gen_salt('bf')), NOW(),
    '{"full_name": "Trần Thị B", "role": "counselor"}', NOW(), NOW(), '', '', ''
  ) RETURNING id INTO new_user_id;
  
  INSERT INTO public.users (id, email, full_name, role, specialty, created_at)
  VALUES (new_user_id, 'counselor2@school.com', 'Trần Thị B', 'counselor', 'Stress & Lo âu', NOW());
END $$;


-- ============================================
-- VERIFY COUNSELOR WAS CREATED
-- ============================================

-- Check auth.users table
SELECT id, email, created_at, email_confirmed_at 
FROM auth.users 
WHERE email LIKE '%counselor%';

-- Check public.users table
SELECT id, email, full_name, role, specialty, created_at 
FROM public.users 
WHERE role = 'counselor';


-- ============================================
-- TROUBLESHOOTING: If counselor can't login
-- ============================================

-- 1. Check if email is confirmed
SELECT email, email_confirmed_at 
FROM auth.users 
WHERE email = 'counselor@school.com';

-- If email_confirmed_at is NULL, fix it:
UPDATE auth.users 
SET email_confirmed_at = NOW() 
WHERE email = 'counselor@school.com';


-- 2. Check if user exists in public.users
SELECT * FROM public.users WHERE email = 'counselor@school.com';

-- If missing, create it manually:
INSERT INTO public.users (id, email, full_name, role, specialty)
SELECT id, email, 'Counselor Name', 'counselor', 'Tâm lý học đường'
FROM auth.users 
WHERE email = 'counselor@school.com';


-- ============================================
-- DELETE COUNSELOR (if needed)
-- ============================================

-- Delete from public.users first (due to foreign key)
DELETE FROM public.users WHERE email = 'counselor@school.com';

-- Then delete from auth.users
DELETE FROM auth.users WHERE email = 'counselor@school.com';


-- ============================================
-- AVAILABLE SPECIALTIES (for reference)
-- ============================================
-- 'Tâm lý học đường'
-- 'Tư vấn nghề nghiệp'
-- 'Stress & Lo âu'
-- 'Quan hệ xã hội'
-- 'Định hướng học tập'
