import { supabase } from './supabase';
import { User, Meme, Prompt, Battle, Vote, Database } from './types';

// User profiles
export async function getProfile(userId: string): Promise<User | null> {
  console.log('Getting profile for user ID:', userId);
  
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();
  
  if (error) {
    console.error('Error fetching profile:', error);
    return null;
  }
  
  if (!data) {
    console.error('No profile found for user ID:', userId);
    return null;
  }
  
  return {
    id: data.id,
    username: data.username,
    avatarUrl: data.avatar_url || '',
    memeStreak: data.meme_streak,
    wins: data.wins,
    losses: data.losses,
    level: data.level,
    xp: data.xp,
    createdAt: new Date(data.created_at)
  };
}

export async function updateProfile(userId: string, updates: Partial<User>): Promise<User | null> {
  // Convert from our app model to database model
  const dbUpdates: any = {};
  if (updates.username !== undefined) dbUpdates.username = updates.username;
  if (updates.avatarUrl !== undefined) dbUpdates.avatar_url = updates.avatarUrl;
  if (updates.memeStreak !== undefined) dbUpdates.meme_streak = updates.memeStreak;
  if (updates.wins !== undefined) dbUpdates.wins = updates.wins;
  if (updates.losses !== undefined) dbUpdates.losses = updates.losses;
  if (updates.level !== undefined) dbUpdates.level = updates.level;
  if (updates.xp !== undefined) dbUpdates.xp = updates.xp;
  
  const { data, error } = await supabase
    .from('profiles')
    .update(dbUpdates)
    .eq('id', userId)
    .select()
    .single();
  
  if (error) {
    console.error('Error updating profile:', error);
    return null;
  }
  
  return {
    id: data.id,
    username: data.username,
    avatarUrl: data.avatar_url || '',
    memeStreak: data.meme_streak,
    wins: data.wins,
    losses: data.losses,
    level: data.level,
    xp: data.xp,
    createdAt: new Date(data.created_at)
  };
}

export async function createProfile(profile: Partial<User>): Promise<User | null> {
  const dbProfile: any = {
    id: profile.id,
    username: profile.username,
    avatar_url: profile.avatarUrl,
    meme_streak: profile.memeStreak || 0,
    wins: profile.wins || 0,
    losses: profile.losses || 0,
    level: profile.level || 1,
    xp: profile.xp || 0
  };
  
  const { data, error } = await supabase
    .from('profiles')
    .insert([dbProfile])
    .select()
    .single();
  
  if (error) {
    console.error('Error creating profile:', error);
    return null;
  }
  
  return {
    id: data.id,
    username: data.username,
    avatarUrl: data.avatar_url || '',
    memeStreak: data.meme_streak,
    wins: data.wins,
    losses: data.losses,
    level: data.level,
    xp: data.xp,
    createdAt: new Date(data.created_at)
  };
}

// Memes
export async function getMemes(limit = 10, offset = 0): Promise<Meme[]> {
  console.log(`Fetching memes with limit ${limit} and offset ${offset}`);
  
  // First fetch memes
  const { data: memesData, error: memesError } = await supabase
    .from('memes')
    .select('*')
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);
  
  if (memesError) {
    console.error('Error fetching memes:', memesError);
    return [];
  }

  console.log(`Found ${memesData?.length || 0} memes`);
  
  // Then fetch profiles for creators in a single batch
  const creatorIds = [...new Set(memesData.map(meme => meme.creator_id))];
  let creatorProfiles: Record<string, User> = {};
  
  if (creatorIds.length > 0) {
    console.log('Fetching profiles for creator IDs:', creatorIds);
    
    const { data: profilesData, error: profilesError } = await supabase
      .from('profiles')
      .select('*')
      .in('id', creatorIds);
      
    if (!profilesError && profilesData) {
      console.log(`Found ${profilesData.length} creator profiles`);
      
      creatorProfiles = profilesData.reduce((acc: Record<string, User>, profile) => {
        acc[profile.id] = {
          id: profile.id,
          username: profile.username,
          avatarUrl: profile.avatar_url || '',
          memeStreak: profile.meme_streak,
          wins: profile.wins,
          losses: profile.losses,
          level: profile.level,
          xp: profile.xp,
          createdAt: new Date(profile.created_at)
        };
        return acc;
      }, {});
    } else if (profilesError) {
      console.error('Error fetching profiles:', profilesError);
    }
  }
  
  // Map the memes data with their creators
  return memesData.map(meme => ({
    id: meme.id,
    prompt: meme.prompt || '',
    prompt_id: meme.prompt_id,
    imageUrl: meme.image_url,
    ipfsCid: meme.ipfs_cid || '',
    caption: meme.caption,
    creatorId: meme.creator_id,
    creator: creatorProfiles[meme.creator_id],
    votes: meme.votes,
    createdAt: new Date(meme.created_at),
    tags: meme.tags || [],
    isBattleSubmission: meme.is_battle_submission || false,
    battleId: meme.battle_id || undefined
  }));
}

export async function getMemesByUser(userId: string, limit = 10, offset = 0): Promise<Meme[]> {
  console.log(`Fetching memes by user ${userId} with limit ${limit} and offset ${offset}`);
  
  // First fetch memes by user
  const { data: memesData, error: memesError } = await supabase
    .from('memes')
    .select('*')
    .eq('creator_id', userId)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);
  
  if (memesError) {
    console.error('Error fetching memes by user:', memesError);
    return [];
  }
  
  console.log(`Found ${memesData?.length || 0} memes for user ${userId}`);
  
  // Then fetch the user profile once
  let creator: User | undefined = undefined;
  
  const { data: profileData, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();
  
  if (profileError) {
    console.error('Error fetching profile for memes:', profileError);
  } else if (profileData) {
    console.log('Found profile for creator:', profileData.username);
    
    creator = {
      id: profileData.id,
      username: profileData.username,
      avatarUrl: profileData.avatar_url || '',
      memeStreak: profileData.meme_streak,
      wins: profileData.wins,
      losses: profileData.losses,
      level: profileData.level,
      xp: profileData.xp,
      createdAt: new Date(profileData.created_at)
    };
  }
  
  // Map the memes data with their creator
  return memesData.map(meme => ({
    id: meme.id,
    prompt: meme.prompt || '',
    prompt_id: meme.prompt_id,
    imageUrl: meme.image_url,
    ipfsCid: meme.ipfs_cid || '',
    caption: meme.caption,
    creatorId: meme.creator_id,
    creator: creator,
    votes: meme.votes,
    createdAt: new Date(meme.created_at),
    tags: meme.tags || [],
    isBattleSubmission: meme.is_battle_submission || false,
    battleId: meme.battle_id || undefined
  }));
}

export async function createMeme(meme: Partial<Meme>): Promise<Meme | null> {
  console.log('Creating meme with data:', meme);
  
  // Validate required fields
  if (!meme.imageUrl) {
    console.error('Error creating meme: imageUrl is required');
    return null;
  }
  
  if (!meme.caption) {
    console.error('Error creating meme: caption is required');
    return null;
  }
  
  if (!meme.creatorId) {
    console.error('Error creating meme: creatorId is required');
    return null;
  }
  
  const dbMeme = {
    prompt: meme.prompt,
    prompt_id: meme.prompt_id,
    image_url: meme.imageUrl,
    ipfs_cid: meme.ipfsCid,
    caption: meme.caption,
    creator_id: meme.creatorId,
    votes: meme.votes || 0,
    created_at: meme.createdAt ? meme.createdAt.toISOString() : new Date().toISOString(),
    tags: meme.tags || [],
    is_battle_submission: meme.isBattleSubmission || false,
    battle_id: meme.battleId || null
  };
  
  console.log('Sending to database:', dbMeme);
  
  const { data, error } = await supabase
    .from('memes')
    .insert([dbMeme])
    .select()
    .single();
  
  if (error) {
    console.error('Error creating meme:', error);
    return null;
  }
  
  if (!data) {
    console.error('No data returned when creating meme');
    return null;
  }
  
  console.log('Meme created successfully:', data);
  
  return {
    id: data.id,
    prompt: data.prompt || '',
    prompt_id: data.prompt_id,
    imageUrl: data.image_url,
    ipfsCid: data.ipfs_cid || '',
    caption: data.caption,
    creatorId: data.creator_id,
    votes: data.votes,
    createdAt: new Date(data.created_at),
    tags: data.tags || [],
    isBattleSubmission: data.is_battle_submission || false,
    battleId: data.battle_id || undefined
  };
}

// Prompts
export async function getActivePrompt(): Promise<Prompt | null> {
  try {
    const { data, error } = await supabase
      .from('prompts')
      .select('*')
      .eq('active', true)
      .order('start_date', { ascending: false })
      .limit(1)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') {
        console.log('No active prompt found');
        return null;
      }
      console.error('Error fetching active prompt:', error);
      return null;
    }
    
    return {
      id: data.id,
      text: data.text,
      theme: data.theme || '',
      tags: data.tags || [],
      active: data.active,
      startDate: new Date(data.start_date),
      endDate: new Date(data.end_date),
      description: data.description || undefined,
      creator_id: data.creator_id || undefined,
      is_community: data.is_community || false
    };
  } catch (error) {
    console.error('Exception in getActivePrompt:', error);
    return null;
  }
}

export async function getPrompts(limit = 10, offset = 0, communityOnly = false): Promise<Prompt[]> {
  let query = supabase
    .from('prompts')
    .select('*')
    .order('start_date', { ascending: false });
    
  if (communityOnly) {
    query = query.eq('is_community', true);
  }
  
  const { data, error } = await query.range(offset, offset + limit - 1);
  
  if (error) {
    console.error('Error fetching prompts:', error);
    return [];
  }
  
  return data.map(prompt => ({
    id: prompt.id,
    text: prompt.text,
    theme: prompt.theme || '',
    tags: prompt.tags || [],
    active: prompt.active,
    startDate: new Date(prompt.start_date),
    endDate: new Date(prompt.end_date),
    description: prompt.description || undefined,
    creator_id: prompt.creator_id || undefined,
    is_community: prompt.is_community || false
  }));
}

// Create a prompt (for community battles)
export async function createPrompt(prompt: Partial<Prompt>): Promise<Prompt | null> {
  if (!prompt.text) {
    console.error('Error creating prompt: text is required');
    return null;
  }
  
  const dbPrompt = {
    text: prompt.text,
    theme: prompt.theme || '',
    tags: prompt.tags || [],
    active: prompt.active !== undefined ? prompt.active : true,
    start_date: prompt.startDate ? prompt.startDate.toISOString() : new Date().toISOString(),
    end_date: prompt.endDate ? prompt.endDate.toISOString() : new Date(new Date().setDate(new Date().getDate() + 7)).toISOString(),
    description: prompt.description || '',
    creator_id: prompt.creator_id || null,
    is_community: prompt.is_community !== undefined ? prompt.is_community : true
  };
  
  const { data, error } = await supabase
    .from('prompts')
    .insert([dbPrompt])
    .select()
    .single();
  
  if (error) {
    console.error('Error creating prompt:', error);
    return null;
  }
  
  return {
    id: data.id,
    text: data.text,
    theme: data.theme || '',
    tags: data.tags || [],
    active: data.active,
    startDate: new Date(data.start_date),
    endDate: new Date(data.end_date),
    description: data.description || undefined,
    creator_id: data.creator_id || undefined,
    is_community: data.is_community || false
  };
}

// Battles
export async function getActiveBattles(limit = 10, offset = 0, filter: 'all' | 'official' | 'community' = 'all'): Promise<Battle[]> {
  let query = supabase.from('battles').select(`
    *,
    meme_one:memes!meme_one_id(*),
    meme_two:memes!meme_two_id(*),
    prompt:prompts(*)
  `).eq('status', 'active');
  
  if (filter === 'official') {
    query = query.eq('is_community', false);
  } else if (filter === 'community') {
    query = query.eq('is_community', true);
  }
  
  const { data, error } = await query
    .order('start_time', { ascending: false })
    .range(offset, offset + limit - 1);
  
  if (error) {
    console.error('Error fetching active battles:', error);
    return [];
  }
  
  return data.map(battle => mapBattleFromDb(battle));
}

export async function getBattle(battleId: string): Promise<Battle | null> {
  const { data, error } = await supabase
    .from('battles')
    .select(`
      *,
      meme_one:memes!meme_one_id(*),
      meme_two:memes!meme_two_id(*),
      prompt:prompts(*)
    `)
    .eq('id', battleId)
    .single();
  
  if (error) {
    console.error('Error fetching battle:', error);
    return null;
  }
  
  return mapBattleFromDb(data);
}

// Get battle submissions (all memes submitted for a battle)
export async function getBattleSubmissions(battleId: string): Promise<Meme[]> {
  const { data, error } = await supabase
    .from('memes')
    .select('*, creator:profiles(*)')
    .eq('battle_id', battleId)
    .eq('is_battle_submission', true)
    .order('votes', { ascending: false });
  
  if (error) {
    console.error('Error fetching battle submissions:', error);
    return [];
  }
  
  return data.map(submission => ({
    id: submission.id,
    prompt: submission.prompt || '',
    prompt_id: submission.prompt_id,
    imageUrl: submission.image_url,
    ipfsCid: submission.ipfs_cid || '',
    caption: submission.caption,
    creatorId: submission.creator_id,
    creator: submission.creator ? {
      id: submission.creator.id,
      username: submission.creator.username,
      avatarUrl: submission.creator.avatar_url || '',
      memeStreak: submission.creator.meme_streak,
      wins: submission.creator.wins,
      losses: submission.creator.losses,
      level: submission.creator.level,
      xp: submission.creator.xp,
      createdAt: new Date(submission.creator.created_at)
    } : undefined,
    votes: submission.votes,
    createdAt: new Date(submission.created_at),
    tags: submission.tags || [],
    isBattleSubmission: true,
    battleId: submission.battle_id
  }));
}

// Create a battle
export async function createBattle(battle: Partial<Battle>): Promise<Battle | null> {
  if (!battle.promptId) {
    console.error('Error creating battle: promptId is required');
    return null;
  }
  
  // For initial creation, we need a prompt but may not have memes yet
  const dbBattle = {
    prompt_id: battle.promptId,
    meme_one_id: battle.memeOneId || '00000000-0000-0000-0000-000000000000', // Temporary placeholder
    meme_two_id: battle.memeTwoId || '00000000-0000-0000-0000-000000000000', // Temporary placeholder
    start_time: battle.startTime ? battle.startTime.toISOString() : new Date().toISOString(),
    end_time: battle.endTime ? battle.endTime.toISOString() : new Date(new Date().setDate(new Date().getDate() + 7)).toISOString(),
    status: battle.status || 'active',
    creator_id: battle.creator_id || null,
    is_community: battle.is_community !== undefined ? battle.is_community : true
  };
  
  const { data, error } = await supabase
    .from('battles')
    .insert([dbBattle])
    .select()
    .single();
  
  if (error) {
    console.error('Error creating battle:', error);
    return null;
  }
  
  return {
    id: data.id,
    promptId: data.prompt_id || '',
    memeOneId: data.meme_one_id,
    memeTwoId: data.meme_two_id,
    winnerId: data.winner_id || undefined,
    voteCount: data.vote_count,
    startTime: new Date(data.start_time),
    endTime: new Date(data.end_time),
    status: data.status as 'active' | 'completed' | 'cancelled',
    creator_id: data.creator_id || undefined,
    is_community: data.is_community || false
  };
}

// Update battle with top memes
export async function updateBattleTopMemes(battleId: string): Promise<Battle | null> {
  // First get all submissions for this battle
  const { data: submissions, error: submissionsError } = await supabase
    .from('memes')
    .select('*')
    .eq('battle_id', battleId)
    .eq('is_battle_submission', true)
    .order('votes', { ascending: false })
    .limit(2);
  
  if (submissionsError || !submissions || submissions.length < 2) {
    console.error('Error fetching top submissions:', submissionsError || 'Not enough submissions');
    return null;
  }
  
  // Update the battle with the top two memes
  const { data, error } = await supabase
    .from('battles')
    .update({
      meme_one_id: submissions[0].id,
      meme_two_id: submissions[1].id
    })
    .eq('id', battleId)
    .select(`
      *,
      meme_one:memes!meme_one_id(*),
      meme_two:memes!meme_two_id(*),
      prompt:prompts(*)
    `)
    .single();
  
  if (error) {
    console.error('Error updating battle with top memes:', error);
    return null;
  }
  
  return mapBattleFromDb(data);
}

// Votes
export async function createVote(vote: Partial<Vote>): Promise<Vote | null> {
  const { data, error } = await supabase
    .from('votes')
    .insert([vote])
    .select()
    .single();
  
  if (error) {
    console.error('Error creating vote:', error);
    return null;
  }
  
  return data as Vote;
}

export async function getUserVoteForBattle(userId: string, battleId: string): Promise<Vote | null> {
  const { data, error } = await supabase
    .from('votes')
    .select('*')
    .eq('user_id', userId)
    .eq('battle_id', battleId)
    .single();
  
  if (error) {
    if (error.code === 'PGRST116') {
      // No vote found
      return null;
    }
    console.error('Error fetching user vote:', error);
    return null;
  }
  
  return data as Vote;
}

export async function getVoteCountForBattle(battleId: string): Promise<number> {
  const { count, error } = await supabase
    .from('votes')
    .select('*', { count: 'exact', head: true })
    .eq('battle_id', battleId);
  
  if (error) {
    console.error('Error fetching vote count:', error);
    return 0;
  }
  
  return count || 0;
}

// Convert database battle to app model
function mapBattleFromDb(battle: any): Battle {
  return {
    id: battle.id,
    promptId: battle.prompt_id || '',
    prompt: battle.prompt ? {
      id: battle.prompt.id,
      text: battle.prompt.text,
      theme: battle.prompt.theme || '',
      tags: battle.prompt.tags || [],
      active: battle.prompt.active,
      startDate: new Date(battle.prompt.start_date),
      endDate: new Date(battle.prompt.end_date),
      description: battle.prompt.description || undefined,
      creator_id: battle.prompt.creator_id || undefined,
      is_community: battle.prompt.is_community || false
    } : undefined,
    memeOneId: battle.meme_one_id,
    memeTwoId: battle.meme_two_id,
    memeOne: battle.meme_one ? mapMemeFromDb(battle.meme_one) : undefined,
    memeTwo: battle.meme_two ? mapMemeFromDb(battle.meme_two) : undefined,
    winnerId: battle.winner_id || undefined,
    voteCount: battle.vote_count,
    startTime: new Date(battle.start_time),
    endTime: new Date(battle.end_time),
    status: battle.status as 'active' | 'completed' | 'cancelled',
    is_community: battle.is_community || false,
    creator_id: battle.creator_id || undefined
  };
}

// Convert database meme to app model
function mapMemeFromDb(meme: any): Meme {
  return {
    id: meme.id,
    prompt: meme.prompt || '',
    prompt_id: meme.prompt_id,
    imageUrl: meme.image_url,
    ipfsCid: meme.ipfs_cid || '',
    caption: meme.caption,
    creatorId: meme.creator_id,
    votes: meme.votes,
    createdAt: new Date(meme.created_at),
    tags: meme.tags || [],
    isBattleSubmission: meme.is_battle_submission || false,
    battleId: meme.battle_id || undefined
  };
}
