-- Add is_anonymous column to pending_content table for anonymous posting
-- This column stores the user's anonymous preference when content goes to pending review

ALTER TABLE public.pending_content 
ADD COLUMN IF NOT EXISTS is_anonymous boolean DEFAULT false;

-- Add comment
COMMENT ON COLUMN public.pending_content.is_anonymous IS 'Stores if user chose to post anonymously when content was submitted for review';
