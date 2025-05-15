
-- Ensure memes storage bucket exists and is public
INSERT INTO storage.buckets (id, name, public)
VALUES ('memes', 'memes', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Public access to meme objects" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated uploads to memes" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated updates in memes" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated deletes in memes" ON storage.objects;

-- Create simple CRUD policies for memes bucket with proper type handling
CREATE POLICY "Public access to meme objects"
ON storage.objects FOR SELECT
USING (bucket_id = 'memes');

CREATE POLICY "Allow authenticated uploads to memes"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'memes');

CREATE POLICY "Allow authenticated updates in memes"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'memes' AND owner = auth.uid()::text);

CREATE POLICY "Allow authenticated deletes in memes"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'memes' AND owner = auth.uid()::text);
