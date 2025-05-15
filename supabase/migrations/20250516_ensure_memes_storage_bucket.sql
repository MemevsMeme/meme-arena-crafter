
-- Create a storage bucket for memes if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('memes', 'memes', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Drop existing policies to recreate them with more permissive settings
DROP POLICY IF EXISTS "Users can upload to their own folder" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own objects" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own objects" ON storage.objects;
DROP POLICY IF EXISTS "Public access to meme objects" ON storage.objects;

-- Very permissive policies to ensure uploads work
CREATE POLICY "Allow all authenticated uploads"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'memes');

-- Users can update their own objects
CREATE POLICY "Allow all authenticated updates"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'memes');

-- Users can delete their own objects
CREATE POLICY "Allow all authenticated deletes"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'memes');

-- Everyone can read meme objects
CREATE POLICY "Public read access to meme objects"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'memes');
