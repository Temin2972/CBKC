-- =====================================================
-- SUPABASE SECURITY CONFIGURATION
-- Run these SQL commands in Supabase SQL Editor
-- =====================================================

-- =====================================================
-- 1. ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE flagged_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE pending_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE surveys ENABLE ROW LEVEL SECURITY;
ALTER TABLE feedbacks ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- USERS TABLE POLICIES
-- =====================================================

-- Users can read their own profile
CREATE POLICY "Users can view own profile" ON users
    FOR SELECT USING (auth.uid() = id);

-- Counselors and admins can view all users
CREATE POLICY "Counselors can view all users" ON users
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() 
            AND role IN ('counselor', 'admin')
        )
    );

-- Users can update their own profile
CREATE POLICY "Users can update own profile" ON users
    FOR UPDATE USING (auth.uid() = id)
    WITH CHECK (
        auth.uid() = id 
        AND role = (SELECT role FROM users WHERE id = auth.uid()) -- Can't change own role
    );

-- =====================================================
-- POSTS TABLE POLICIES
-- =====================================================

-- Anyone authenticated can view approved posts
CREATE POLICY "Authenticated users can view approved posts" ON posts
    FOR SELECT USING (
        auth.uid() IS NOT NULL 
        AND status = 'approved'
    );

-- Users can create posts (will be moderated)
CREATE POLICY "Users can create posts" ON posts
    FOR INSERT WITH CHECK (auth.uid() = author_id);

-- Users can delete their own posts
CREATE POLICY "Users can delete own posts" ON posts
    FOR DELETE USING (auth.uid() = author_id);

-- Counselors/admins can moderate posts
CREATE POLICY "Counselors can moderate posts" ON posts
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() 
            AND role IN ('counselor', 'admin')
        )
    );

-- =====================================================
-- COMMENTS TABLE POLICIES
-- =====================================================

-- Authenticated users can view comments on approved posts
CREATE POLICY "Users can view comments" ON comments
    FOR SELECT USING (auth.uid() IS NOT NULL);

-- Users can create comments
CREATE POLICY "Users can create comments" ON comments
    FOR INSERT WITH CHECK (auth.uid() = author_id);

-- Users can delete their own comments
CREATE POLICY "Users can delete own comments" ON comments
    FOR DELETE USING (auth.uid() = author_id);

-- Counselors can delete any comment
CREATE POLICY "Counselors can delete comments" ON comments
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() 
            AND role IN ('counselor', 'admin')
        )
    );

-- =====================================================
-- CHAT ROOMS TABLE POLICIES
-- =====================================================

-- Students can view their own chat rooms
CREATE POLICY "Students can view own chat rooms" ON chat_rooms
    FOR SELECT USING (
        auth.uid() = student_id
        OR (
            -- Counselors can see public rooms or their private rooms
            EXISTS (
                SELECT 1 FROM users 
                WHERE id = auth.uid() 
                AND role IN ('counselor', 'admin')
            )
            AND (counselor_id IS NULL OR counselor_id = auth.uid())
        )
        OR (
            -- Admins can see all rooms
            EXISTS (
                SELECT 1 FROM users 
                WHERE id = auth.uid() 
                AND role = 'admin'
            )
        )
    );

-- Students can create chat rooms
CREATE POLICY "Students can create chat rooms" ON chat_rooms
    FOR INSERT WITH CHECK (
        auth.uid() = student_id
        AND EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() 
            AND role = 'student'
        )
    );

-- Students can delete their own chat rooms
CREATE POLICY "Students can delete own chat rooms" ON chat_rooms
    FOR DELETE USING (auth.uid() = student_id);

-- =====================================================
-- CHAT MESSAGES TABLE POLICIES
-- =====================================================

-- Users can view messages in rooms they have access to
CREATE POLICY "Users can view messages in accessible rooms" ON chat_messages
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM chat_rooms 
            WHERE id = chat_messages.chat_room_id
            AND (
                student_id = auth.uid()
                OR (
                    EXISTS (
                        SELECT 1 FROM users 
                        WHERE id = auth.uid() 
                        AND role IN ('counselor', 'admin')
                    )
                    AND (counselor_id IS NULL OR counselor_id = auth.uid())
                )
                OR (
                    EXISTS (
                        SELECT 1 FROM users 
                        WHERE id = auth.uid() 
                        AND role = 'admin'
                    )
                )
            )
        )
    );

-- Users can send messages to rooms they have access to
CREATE POLICY "Users can send messages" ON chat_messages
    FOR INSERT WITH CHECK (
        auth.uid() = sender_id
        AND EXISTS (
            SELECT 1 FROM chat_rooms 
            WHERE id = chat_messages.chat_room_id
            AND (
                student_id = auth.uid()
                OR (
                    EXISTS (
                        SELECT 1 FROM users 
                        WHERE id = auth.uid() 
                        AND role IN ('counselor', 'admin')
                    )
                    AND (counselor_id IS NULL OR counselor_id = auth.uid())
                )
            )
        )
    );

-- =====================================================
-- NOTIFICATIONS TABLE POLICIES
-- =====================================================

-- Users can only view their own notifications
CREATE POLICY "Users can view own notifications" ON notifications
    FOR SELECT USING (auth.uid() = user_id);

-- Users can update their own notifications (mark as read)
CREATE POLICY "Users can update own notifications" ON notifications
    FOR UPDATE USING (auth.uid() = user_id);

-- System/counselors can create notifications
CREATE POLICY "Create notifications" ON notifications
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- =====================================================
-- FLAGGED CONTENT TABLE POLICIES
-- =====================================================

-- Only counselors/admins can view flagged content
CREATE POLICY "Counselors can view flagged content" ON flagged_content
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() 
            AND role IN ('counselor', 'admin')
        )
    );

-- System can create flagged content entries
CREATE POLICY "System can flag content" ON flagged_content
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Counselors can update flagged content (resolve)
CREATE POLICY "Counselors can resolve flagged content" ON flagged_content
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() 
            AND role IN ('counselor', 'admin')
        )
    );

-- =====================================================
-- PENDING CONTENT TABLE POLICIES
-- =====================================================

-- Only counselors/admins can view pending content
CREATE POLICY "Counselors can view pending content" ON pending_content
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() 
            AND role IN ('counselor', 'admin')
        )
    );

-- Authenticated users can create pending content
CREATE POLICY "Users can create pending content" ON pending_content
    FOR INSERT WITH CHECK (auth.uid() = author_id);

-- Counselors can approve/reject pending content
CREATE POLICY "Counselors can moderate pending content" ON pending_content
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() 
            AND role IN ('counselor', 'admin')
        )
    );

-- =====================================================
-- SURVEYS TABLE POLICIES
-- =====================================================

-- Users can view their own survey responses
CREATE POLICY "Users can view own surveys" ON surveys
    FOR SELECT USING (auth.uid() = user_id);

-- Counselors can view all surveys (anonymized)
CREATE POLICY "Counselors can view surveys" ON surveys
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() 
            AND role IN ('counselor', 'admin')
        )
    );

-- Users can create survey responses
CREATE POLICY "Users can create surveys" ON surveys
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- =====================================================
-- FEEDBACKS TABLE POLICIES
-- =====================================================

-- Users can view their own feedback
CREATE POLICY "Users can view own feedback" ON feedbacks
    FOR SELECT USING (auth.uid() = user_id);

-- Admins can view all feedback
CREATE POLICY "Admins can view all feedback" ON feedbacks
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() 
            AND role = 'admin'
        )
    );

-- Users can create feedback
CREATE POLICY "Users can create feedback" ON feedbacks
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- =====================================================
-- 2. DATABASE FUNCTIONS WITH SECURITY
-- =====================================================

-- Function to check if user is counselor
CREATE OR REPLACE FUNCTION is_counselor()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM users 
        WHERE id = auth.uid() 
        AND role IN ('counselor', 'admin')
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user is admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM users 
        WHERE id = auth.uid() 
        AND role = 'admin'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Secure function to get user role
CREATE OR REPLACE FUNCTION get_user_role(user_id UUID)
RETURNS TEXT AS $$
DECLARE
    user_role TEXT;
BEGIN
    SELECT role INTO user_role FROM users WHERE id = user_id;
    RETURN user_role;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 3. TRIGGERS FOR DATA INTEGRITY
-- =====================================================

-- Trigger to set created_at and updated_at
CREATE OR REPLACE FUNCTION set_timestamps()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        NEW.created_at = NOW();
    END IF;
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to all relevant tables
CREATE TRIGGER set_timestamps_users
    BEFORE INSERT OR UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION set_timestamps();

CREATE TRIGGER set_timestamps_posts
    BEFORE INSERT OR UPDATE ON posts
    FOR EACH ROW EXECUTE FUNCTION set_timestamps();

CREATE TRIGGER set_timestamps_chat_messages
    BEFORE INSERT OR UPDATE ON chat_messages
    FOR EACH ROW EXECUTE FUNCTION set_timestamps();

-- =====================================================
-- 4. RATE LIMITING FUNCTION
-- =====================================================

-- Rate limiting table
CREATE TABLE IF NOT EXISTS rate_limits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id),
    action TEXT NOT NULL,
    count INTEGER DEFAULT 1,
    window_start TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, action)
);

-- Function to check rate limit
CREATE OR REPLACE FUNCTION check_rate_limit(
    p_user_id UUID,
    p_action TEXT,
    p_max_count INTEGER DEFAULT 10,
    p_window_seconds INTEGER DEFAULT 60
)
RETURNS BOOLEAN AS $$
DECLARE
    v_count INTEGER;
    v_window_start TIMESTAMPTZ;
BEGIN
    -- Get current rate limit record
    SELECT count, window_start INTO v_count, v_window_start
    FROM rate_limits
    WHERE user_id = p_user_id AND action = p_action;
    
    -- If no record or window expired, reset
    IF v_window_start IS NULL OR v_window_start < NOW() - (p_window_seconds || ' seconds')::INTERVAL THEN
        INSERT INTO rate_limits (user_id, action, count, window_start)
        VALUES (p_user_id, p_action, 1, NOW())
        ON CONFLICT (user_id, action)
        DO UPDATE SET count = 1, window_start = NOW();
        RETURN TRUE;
    END IF;
    
    -- Check if exceeded
    IF v_count >= p_max_count THEN
        RETURN FALSE;
    END IF;
    
    -- Increment count
    UPDATE rate_limits
    SET count = count + 1
    WHERE user_id = p_user_id AND action = p_action;
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 5. AUDIT LOG TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id),
    action TEXT NOT NULL,
    table_name TEXT,
    record_id UUID,
    old_data JSONB,
    new_data JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on audit logs
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Only admins can view audit logs
CREATE POLICY "Admins can view audit logs" ON audit_logs
    FOR SELECT USING (is_admin());

-- Function to log audit events
CREATE OR REPLACE FUNCTION log_audit(
    p_action TEXT,
    p_table_name TEXT DEFAULT NULL,
    p_record_id UUID DEFAULT NULL,
    p_old_data JSONB DEFAULT NULL,
    p_new_data JSONB DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
    INSERT INTO audit_logs (user_id, action, table_name, record_id, old_data, new_data)
    VALUES (auth.uid(), p_action, p_table_name, p_record_id, p_old_data, p_new_data);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 6. SECURITY INDEXES
-- =====================================================

-- Indexes for faster security checks
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_chat_rooms_student ON chat_rooms(student_id);
CREATE INDEX IF NOT EXISTS idx_chat_rooms_counselor ON chat_rooms(counselor_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_room ON chat_messages(chat_room_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_flagged_content_status ON flagged_content(status);
CREATE INDEX IF NOT EXISTS idx_pending_content_status ON pending_content(status);
CREATE INDEX IF NOT EXISTS idx_rate_limits_user_action ON rate_limits(user_id, action);

-- =====================================================
-- 7. CLEANUP POLICIES
-- =====================================================

-- Function to cleanup old data
CREATE OR REPLACE FUNCTION cleanup_old_data()
RETURNS VOID AS $$
BEGIN
    -- Delete old rate limit records (older than 1 hour)
    DELETE FROM rate_limits WHERE window_start < NOW() - INTERVAL '1 hour';
    
    -- Delete old audit logs (older than 90 days) - adjust as needed
    DELETE FROM audit_logs WHERE created_at < NOW() - INTERVAL '90 days';
    
    -- Delete old read notifications (older than 30 days)
    DELETE FROM notifications WHERE read = TRUE AND created_at < NOW() - INTERVAL '30 days';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 8. INPUT VALIDATION FUNCTIONS
-- =====================================================

-- Function to validate content length
CREATE OR REPLACE FUNCTION validate_content_length(
    p_content TEXT,
    p_max_length INTEGER DEFAULT 10000
)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN p_content IS NOT NULL AND LENGTH(p_content) <= p_max_length;
END;
$$ LANGUAGE plpgsql;

-- Trigger to validate post content
CREATE OR REPLACE FUNCTION validate_post()
RETURNS TRIGGER AS $$
BEGIN
    IF NOT validate_content_length(NEW.content, 10000) THEN
        RAISE EXCEPTION 'Content exceeds maximum length';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER validate_post_content
    BEFORE INSERT OR UPDATE ON posts
    FOR EACH ROW EXECUTE FUNCTION validate_post();

-- =====================================================
-- NOTES FOR PRODUCTION DEPLOYMENT
-- =====================================================

/*
1. ENABLE SSL/TLS:
   - Ensure all connections use SSL
   - Configure in Supabase dashboard: Settings > Database > SSL

2. CONFIGURE AUTHENTICATION:
   - Enable email confirmation
   - Set password requirements
   - Configure in Supabase dashboard: Authentication > Policies

3. API RATE LIMITING:
   - Configure in Supabase dashboard: Settings > API > Rate Limiting
   - Recommended: 100 requests per minute for authenticated users

4. DATABASE BACKUPS:
   - Enable Point-in-Time Recovery
   - Configure in Supabase dashboard: Settings > Database > Backups

5. MONITORING:
   - Enable logging in Supabase dashboard
   - Set up alerts for failed authentication attempts
   
6. ENVIRONMENT VARIABLES:
   - Never commit API keys to git
   - Use .env files for local development
   - Use Vercel/Netlify environment variables for production

7. CORS CONFIGURATION:
   - Configure allowed origins in Supabase dashboard
   - Only allow your production domain

8. JWT EXPIRY:
   - Configure token expiry in Supabase dashboard
   - Recommended: 1 hour for access tokens

*/
