
-- Create profiles table
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  username TEXT NOT NULL UNIQUE,
  avatar_url TEXT,
  meme_streak INTEGER DEFAULT 0,
  wins INTEGER DEFAULT 0,
  losses INTEGER DEFAULT 0,
  level INTEGER DEFAULT 1,
  xp INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create prompts table
CREATE TABLE prompts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  text TEXT NOT NULL,
  theme TEXT,
  tags TEXT[] DEFAULT '{}',
  active BOOLEAN DEFAULT FALSE,
  start_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  end_date TIMESTAMP WITH TIME ZONE DEFAULT NOW() + INTERVAL '1 day'
);

-- Create memes table
CREATE TABLE memes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  prompt TEXT,
  prompt_id UUID REFERENCES prompts(id),
  image_url TEXT NOT NULL,
  ipfs_cid TEXT,
  caption TEXT NOT NULL,
  creator_id UUID NOT NULL REFERENCES profiles(id),
  votes INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  tags TEXT[] DEFAULT '{}'
);

-- Create battles table
CREATE TABLE battles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  prompt_id UUID REFERENCES prompts(id),
  meme_one_id UUID NOT NULL REFERENCES memes(id),
  meme_two_id UUID NOT NULL REFERENCES memes(id),
  winner_id UUID REFERENCES memes(id),
  vote_count INTEGER DEFAULT 0,
  start_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  end_time TIMESTAMP WITH TIME ZONE DEFAULT NOW() + INTERVAL '1 day',
  status TEXT CHECK (status IN ('active', 'completed', 'cancelled')) DEFAULT 'active'
);

-- Create votes table
CREATE TABLE votes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id),
  battle_id UUID NOT NULL REFERENCES battles(id),
  meme_id UUID NOT NULL REFERENCES memes(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, battle_id)
);

-- Set up storage
INSERT INTO storage.buckets (id, name) VALUES ('memes', 'memes');

-- Set up RLS policies
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE memes ENABLE ROW LEVEL SECURITY;
ALTER TABLE battles ENABLE ROW LEVEL SECURITY;
ALTER TABLE prompts ENABLE ROW LEVEL SECURITY;
ALTER TABLE votes ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Public profiles are viewable by everyone" 
  ON profiles FOR SELECT USING (true);

CREATE POLICY "Users can update their own profile" 
  ON profiles FOR UPDATE USING (auth.uid() = id);

-- Memes policies
CREATE POLICY "Memes are viewable by everyone" 
  ON memes FOR SELECT USING (true);

CREATE POLICY "Users can create their own memes" 
  ON memes FOR INSERT WITH CHECK (auth.uid() = creator_id);

CREATE POLICY "Users can update their own memes" 
  ON memes FOR UPDATE USING (auth.uid() = creator_id);

-- Prompts policies
CREATE POLICY "Prompts are viewable by everyone" 
  ON prompts FOR SELECT USING (true);

-- Battles policies
CREATE POLICY "Battles are viewable by everyone" 
  ON battles FOR SELECT USING (true);

-- Votes policies
CREATE POLICY "Votes are viewable by everyone" 
  ON votes FOR SELECT USING (true);

CREATE POLICY "Users can create their own votes" 
  ON votes FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can only vote once per battle" 
  ON votes FOR INSERT WITH CHECK (
    NOT EXISTS (
      SELECT 1 FROM votes 
      WHERE user_id = auth.uid() AND battle_id = new.battle_id
    )
  );
