
-- Enable Row Level Security on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.memes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.battles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prompts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.votes ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Public profiles are viewable by everyone" 
  ON profiles FOR SELECT USING (true);

CREATE POLICY "Users can update their own profile" 
  ON profiles FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" 
  ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

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
