
-- Ensure memes storage bucket exists
INSERT INTO storage.buckets (id, name, public)
VALUES ('memes', 'memes', true)
ON CONFLICT (id) DO UPDATE SET public = true;
