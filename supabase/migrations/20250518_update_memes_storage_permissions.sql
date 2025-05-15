
-- Update storage bucket policies for the memes bucket to ensure proper access

-- First ensure the memes bucket exists
INSERT INTO storage.buckets (id, name, public)
VALUES ('memes', 'memes', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Remove any old restricted policies for clean slate
DROP POLICY IF EXISTS "Allow authenticated uploads to memes" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated updates in memes" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated deletes in memes" ON storage.objects;
DROP POLICY IF EXISTS "Public access to meme objects" ON storage.objects;

-- Create very permissive policies to ensure uploads work
CREATE POLICY "Allow authenticated uploads to memes"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'memes');

-- Allow updates to objects
CREATE POLICY "Allow authenticated updates in memes"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'memes');

-- Allow deletes
CREATE POLICY "Allow authenticated deletes in memes"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'memes');

-- Make memes publicly viewable
CREATE POLICY "Public access to meme objects"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'memes');

-- Ensure storage.objects has RLS enabled
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;
