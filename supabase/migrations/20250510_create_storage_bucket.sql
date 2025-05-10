
-- Create a storage bucket for memes if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('memes', 'memes', true)
ON CONFLICT (id) DO NOTHING;

-- Create RLS policy to allow authenticated users to upload to their folder
CREATE POLICY "Users can upload to their own folder"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'memes' AND (storage.foldername(name))[1] = 'public' AND (storage.foldername(name))[2] = auth.uid()::text);

-- Users can update/delete their own objects
CREATE POLICY "Users can update their own objects"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'memes' AND (storage.foldername(name))[1] = 'public' AND (storage.foldername(name))[2] = auth.uid()::text);

CREATE POLICY "Users can delete their own objects"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'memes' AND (storage.foldername(name))[1] = 'public' AND (storage.foldername(name))[2] = auth.uid()::text);

-- Everyone can read public objects
CREATE POLICY "Public access to meme objects"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'memes' AND (storage.foldername(name))[1] = 'public');
