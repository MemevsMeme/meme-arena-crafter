
/**
 * Create a new meme in the database
 */
export async function createMeme(memeData: {
  prompt: string;
  prompt_id?: string | null;
  imageUrl: string;
  ipfsCid?: string;
  caption: string;
  creatorId: string;
  votes: number;
  createdAt: Date;
  tags: string[];
  battle_id?: string | null;
}): Promise<Meme | null> {
  try {
    console.log("Creating meme with data:", memeData);
    
    // Insert into the memes table
    // We're going to make prompt_id and battle_id optional
    const dataToInsert = {
      prompt: memeData.prompt,
      image_url: memeData.imageUrl,
      ipfs_cid: memeData.ipfsCid || null,
      caption: memeData.caption,
      creator_id: memeData.creatorId,
      votes: memeData.votes || 0,
      created_at: memeData.createdAt.toISOString(),
      tags: memeData.tags || []
      // Note: battle_id is intentionally omitted here, it will be conditionally added below
    };
    
    // Only add prompt_id if it exists and is valid
    if (memeData.prompt_id) {
      // Try to find if the prompt exists
      const { data: promptExists } = await supabase
        .from('prompts')
        .select('id')
        .eq('id', memeData.prompt_id)
        .maybeSingle();
        
      // Only include prompt_id if it exists in the prompt table
      if (promptExists) {
        dataToInsert['prompt_id'] = memeData.prompt_id;
      } else {
        console.log(`Prompt with ID ${memeData.prompt_id} not found, omitting from meme data`);
      }
    }

    // Only add battle_id if it exists and is valid
    if (memeData.battle_id) {
      // Try to find if the battle exists
      const { data: battleExists } = await supabase
        .from('battles')
        .select('id')
        .eq('id', memeData.battle_id)
        .maybeSingle();
        
      // Only include battle_id if it exists in the battles table
      if (battleExists) {
        dataToInsert['battle_id'] = memeData.battle_id;
      } else {
        console.log(`Battle with ID ${memeData.battle_id} not found, omitting from meme data`);
      }
    }

    const { data, error } = await supabase
      .from('memes')
      .insert(dataToInsert)
      .select()
      .single();

    if (error) {
      console.error('Error creating meme:', error);
      return null;
    }

    if (!data) {
      console.error('No data returned after creating meme');
      return null;
    }

    console.log("Meme created successfully:", data);

    // Convert to Meme type
    return {
      id: data.id,
      prompt: data.prompt || '',
      prompt_id: data.prompt_id || '',
      imageUrl: data.image_url,
      ipfsCid: data.ipfs_cid || '',
      caption: data.caption,
      creatorId: data.creator_id,
      votes: data.votes || 0,
      createdAt: new Date(data.created_at),
      tags: data.tags || [],
      battleId: data.battle_id || ''
    };
  } catch (error) {
    console.error('Error in createMeme:', error);
    return null;
  }
}
