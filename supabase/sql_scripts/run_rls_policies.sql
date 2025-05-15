
-- Run the RLS policies
\i supabase/migrations/20250510_enable_rls.sql
-- Update the storage bucket configuration
\i supabase/migrations/20250510_update_storage_bucket.sql
-- Set up additional RLS policies for daily_challenges
\i supabase/migrations/20250514_update_daily_challenges_rls.sql
-- Ensure memes storage bucket exists and has proper permissions
\i supabase/migrations/20250516_ensure_memes_storage_bucket.sql
