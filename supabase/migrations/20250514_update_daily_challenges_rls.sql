
-- Set up RLS policies for daily_challenges
ALTER TABLE IF EXISTS public.daily_challenges ENABLE ROW LEVEL SECURITY;

-- Daily challenges are publicly readable
CREATE POLICY IF NOT EXISTS "Daily challenges are viewable by everyone" 
  ON public.daily_challenges
  FOR SELECT 
  USING (true);

-- Only authenticated users with admin privileges can modify daily challenges
-- For now we don't have a specific admin role, so we'll just restrict insert/update/delete operations
CREATE POLICY IF NOT EXISTS "Only authenticated users can import daily challenges" 
  ON public.daily_challenges
  FOR INSERT 
  WITH CHECK (auth.role() = 'authenticated');
