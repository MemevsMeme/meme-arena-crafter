
-- Make sure the memes storage bucket exists
INSERT INTO storage.buckets (id, name, public)
VALUES ('memes', 'memes', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Ensure public access to objects in the memes bucket
CREATE POLICY IF NOT EXISTS "Public access to meme objects"
ON storage.objects FOR SELECT
USING (bucket_id = 'memes');

-- Ensure authenticated users can upload to memes
CREATE POLICY IF NOT EXISTS "Allow authenticated uploads to memes"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'memes');

-- Ensure authenticated users can update their own objects
CREATE POLICY IF NOT EXISTS "Allow authenticated updates in memes"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'memes');

-- Ensure authenticated users can delete their own objects
CREATE POLICY IF NOT EXISTS "Allow authenticated deletes in memes"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'memes');
