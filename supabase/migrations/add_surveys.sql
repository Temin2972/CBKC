-- =====================================================
-- SURVEY SYSTEM
-- Run this in Supabase SQL Editor
-- =====================================================

-- =====================================================
-- 1. SURVEYS TABLE (Created by counselors/admins)
-- =====================================================

CREATE TABLE IF NOT EXISTS surveys (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Survey info
    title TEXT NOT NULL,
    description TEXT,
    
    -- Questions stored as JSONB array
    -- Format: [{ id, type, question, options?, scale? }]
    -- Types: 'scale', 'multiple_choice', 'text'
    questions JSONB NOT NULL DEFAULT '[]'::jsonb,
    
    -- Settings
    is_active BOOLEAN DEFAULT true,
    is_anonymous BOOLEAN DEFAULT true, -- Allow anonymous responses
    deadline TIMESTAMPTZ, -- Optional deadline
    
    -- Stats
    responses_count INT DEFAULT 0,
    
    -- Creator info
    created_by UUID REFERENCES auth.users(id),
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 2. SURVEY RESPONSES TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS survey_responses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Reference to survey
    survey_id UUID REFERENCES surveys(id) ON DELETE CASCADE NOT NULL,
    
    -- Respondent (nullable if anonymous)
    user_id UUID REFERENCES auth.users(id),
    
    -- Responses stored as JSONB object
    -- Format: { "question_id": value, ... }
    responses JSONB NOT NULL DEFAULT '{}'::jsonb,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Unique constraint: one response per user per survey (if not anonymous)
CREATE UNIQUE INDEX IF NOT EXISTS idx_survey_response_unique 
    ON survey_responses(survey_id, user_id) 
    WHERE user_id IS NOT NULL;

-- =====================================================
-- ENABLE RLS
-- =====================================================

ALTER TABLE surveys ENABLE ROW LEVEL SECURITY;
ALTER TABLE survey_responses ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- SURVEYS RLS POLICIES
-- =====================================================

-- Everyone can view active surveys
CREATE POLICY "surveys_select_active" ON surveys
    FOR SELECT USING (is_active = true);

-- Staff can view all surveys (including inactive)
CREATE POLICY "surveys_select_all_staff" ON surveys
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.role IN ('counselor', 'admin')
        )
    );

-- Staff can create surveys
CREATE POLICY "surveys_insert_staff" ON surveys
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.role IN ('counselor', 'admin')
        )
    );

-- Staff can update their own surveys (or admin can update any)
CREATE POLICY "surveys_update_staff" ON surveys
    FOR UPDATE USING (
        created_by = auth.uid() OR
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.role = 'admin'
        )
    );

-- Only admin can delete surveys
CREATE POLICY "surveys_delete_admin" ON surveys
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.role = 'admin'
        )
    );

-- =====================================================
-- SURVEY RESPONSES RLS POLICIES
-- =====================================================

-- Users can view their own responses
CREATE POLICY "responses_select_own" ON survey_responses
    FOR SELECT USING (user_id = auth.uid());

-- Staff can view all responses (for analytics)
CREATE POLICY "responses_select_staff" ON survey_responses
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.role IN ('counselor', 'admin')
        )
    );

-- Authenticated users can submit responses
CREATE POLICY "responses_insert" ON survey_responses
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Users can update their own responses (before deadline)
CREATE POLICY "responses_update_own" ON survey_responses
    FOR UPDATE USING (user_id = auth.uid());

-- =====================================================
-- INDEXES
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_surveys_active ON surveys(is_active);
CREATE INDEX IF NOT EXISTS idx_surveys_created_by ON surveys(created_by);
CREATE INDEX IF NOT EXISTS idx_surveys_deadline ON surveys(deadline);
CREATE INDEX IF NOT EXISTS idx_responses_survey ON survey_responses(survey_id);
CREATE INDEX IF NOT EXISTS idx_responses_user ON survey_responses(user_id);

-- =====================================================
-- TRIGGERS
-- =====================================================

-- Update timestamp trigger for surveys
CREATE OR REPLACE FUNCTION update_survey_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_survey_updated_at
    BEFORE UPDATE ON surveys
    FOR EACH ROW
    EXECUTE FUNCTION update_survey_timestamp();

-- Auto-increment responses_count when a response is added
CREATE OR REPLACE FUNCTION increment_survey_responses()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE surveys 
    SET responses_count = responses_count + 1 
    WHERE id = NEW.survey_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER after_response_insert
    AFTER INSERT ON survey_responses
    FOR EACH ROW
    EXECUTE FUNCTION increment_survey_responses();

-- =====================================================
-- SAMPLE SURVEY (Optional - comment out if not needed)
-- =====================================================

/*
INSERT INTO surveys (title, description, questions, is_active, deadline)
VALUES (
    'Khảo sát Sức khỏe Tâm lý Học kỳ 1',
    'Khảo sát định kỳ về tình trạng sức khỏe tâm lý của học sinh',
    '[
        {
            "id": "q1",
            "type": "scale",
            "question": "Trong tuần qua, bạn cảm thấy áp lực học tập ở mức độ nào?",
            "scale": {"min": 1, "max": 5, "labels": ["Rất nhẹ", "Nhẹ", "Trung bình", "Cao", "Rất cao"]}
        },
        {
            "id": "q2",
            "type": "multiple_choice",
            "question": "Bạn thường xử lý stress bằng cách nào?",
            "options": ["Nghe nhạc", "Tập thể dục", "Nói chuyện với bạn bè", "Chơi game", "Ngủ", "Khác"]
        },
        {
            "id": "q3",
            "type": "text",
            "question": "Bạn mong muốn nhà trường hỗ trợ gì thêm về mặt tâm lý?"
        }
    ]'::jsonb,
    true,
    NOW() + INTERVAL '30 days'
);
*/

-- =====================================================
-- VERIFY SETUP
-- =====================================================

SELECT schemaname, tablename, policyname, permissive, roles, cmd
FROM pg_policies 
WHERE tablename IN ('surveys', 'survey_responses')
ORDER BY tablename, policyname;
