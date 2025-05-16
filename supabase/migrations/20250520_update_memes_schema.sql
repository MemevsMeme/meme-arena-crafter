
-- Update the memes table to add battle_id if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'memes' 
                   AND column_name = 'battle_id') THEN
        ALTER TABLE memes ADD COLUMN battle_id uuid NULL;
    END IF;
END $$;
