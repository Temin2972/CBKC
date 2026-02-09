-- =====================================================
-- HOTFIX: Fix RLS Policies for Appointments & Notifications
-- Run this in Supabase SQL Editor to fix both issues
-- =====================================================

-- =====================================================
-- 1. FIX APPOINTMENT_REQUESTS TABLE
-- =====================================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "appointments_insert_anyone" ON appointment_requests;
DROP POLICY IF EXISTS "appointments_select_own" ON appointment_requests;
DROP POLICY IF EXISTS "appointments_select_staff" ON appointment_requests;
DROP POLICY IF EXISTS "appointments_update_staff" ON appointment_requests;

-- Recreate with correct policies
-- Anyone can create (guest booking allowed - uses anon key)
CREATE POLICY "appointments_insert_anyone" ON appointment_requests
    FOR INSERT WITH CHECK (true);

-- Students can view their own requests
CREATE POLICY "appointments_select_own" ON appointment_requests
    FOR SELECT USING (student_id = auth.uid());

-- Staff (counselor/admin) can view ALL appointments
CREATE POLICY "appointments_select_staff" ON appointment_requests
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.role IN ('counselor', 'admin')
        )
    );

-- Staff can update any appointment
CREATE POLICY "appointments_update_staff" ON appointment_requests
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.role IN ('counselor', 'admin')
        )
    );

-- =====================================================
-- 2. FIX NOTIFICATIONS TABLE
-- =====================================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "notifications_select_own" ON notifications;
DROP POLICY IF EXISTS "notifications_update_own" ON notifications;
DROP POLICY IF EXISTS "notifications_insert" ON notifications;
DROP POLICY IF EXISTS "notifications_delete_own" ON notifications;
DROP POLICY IF EXISTS "Users can view own notifications" ON notifications;
DROP POLICY IF EXISTS "Users can update own notifications" ON notifications;
DROP POLICY IF EXISTS "Create notifications" ON notifications;

-- Users can view their own notifications
CREATE POLICY "notifications_select_own" ON notifications
    FOR SELECT USING (user_id = auth.uid());

-- Users can update their own notifications (mark as read)
CREATE POLICY "notifications_update_own" ON notifications
    FOR UPDATE USING (user_id = auth.uid());

-- Any authenticated user can create notifications for ANY user
-- (needed for counselors to notify students and vice versa)
CREATE POLICY "notifications_insert" ON notifications
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Users can delete their own notifications
CREATE POLICY "notifications_delete_own" ON notifications
    FOR DELETE USING (user_id = auth.uid());

-- =====================================================
-- 3. VERIFY THE SETUP
-- =====================================================

-- Check if policies were created successfully
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies 
WHERE tablename IN ('appointment_requests', 'notifications')
ORDER BY tablename, policyname;
