import { 
  users, type User, type InsertUser, type UpsertUser,
  memes, type Meme, type InsertMeme,
  battles, type Battle, type InsertBattle,
  votes, type Vote, type InsertVote,
  templates, type Template, type InsertTemplate,
  dailyChallenges, type DailyChallenge, type InsertDailyChallenge, type DailyChallengeWithMemes,
  battleRoyales, type BattleRoyale, type InsertBattleRoyale,
  comments, type Comment, type InsertComment
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, gte, sql, inArray } from "drizzle-orm";

// Storage interface
export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, user: UpsertUser): Promise<User>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Meme methods
  getMeme(id: number): Promise<Meme | undefined>;
  getAllMemes(): Promise<Meme[]>;
  getMemesByUser(userId: number): Promise<Meme[]>;
  getMemesByDailyChallenge(challengeId: number): Promise<Meme[]>;
  createMeme(meme: InsertMeme): Promise<Meme>;
  updateMemeLikes(id: number, likes: number): Promise<Meme | undefined>;
  updateMemeViews(id: number, views: number): Promise<Meme | undefined>;
  
  // Battle methods
  getBattle(id: number): Promise<Battle | undefined>;
  getAllBattles(): Promise<Battle[]>;
  getLatestBattle(): Promise<Battle | undefined>;
  createBattle(battle: InsertBattle): Promise<Battle>;
  updateBattleWinner(id: number, winnerId: number): Promise<Battle | undefined>;
  
  // Vote methods
  getVote(id: number): Promise<Vote | undefined>;
  getAllVotes(): Promise<Vote[]>;
  getVotesByBattle(battleId: number): Promise<Vote[]>;
  createVote(vote: InsertVote): Promise<Vote>;
  
  // Template methods
  getTemplate(id: number): Promise<Template | undefined>;
  getAllTemplates(): Promise<Template[]>;
  createTemplate(template: InsertTemplate): Promise<Template>;
  
  // Daily Challenge methods
  getDailyChallenge(id: number): Promise<DailyChallenge | undefined>;
  getCurrentDailyChallenge(): Promise<DailyChallenge | undefined>;
  getDailyChallengeWithMemes(id: number): Promise<DailyChallengeWithMemes | undefined>;
  getAllDailyChallenges(): Promise<DailyChallenge[]>;
  createDailyChallenge(challenge: InsertDailyChallenge): Promise<DailyChallenge>;
  updateDailyChallenge(id: number, challenge: Partial<InsertDailyChallenge>): Promise<DailyChallenge | undefined>;
  getCompletedChallengesWithWinners(): Promise<DailyChallenge[]>;
  
  // Battle Royale methods
  getBattleRoyale(id: number): Promise<BattleRoyale | undefined>;
  createBattleRoyale(battleRoyale: InsertBattleRoyale): Promise<BattleRoyale>;
  updateBattleRoyaleWinner(id: number, winnerId: number): Promise<BattleRoyale | undefined>;
  
  // Comment methods
  getComment(id: number): Promise<Comment | undefined>;
  getCommentsByMeme(memeId: number): Promise<Comment[]>;
  createComment(comment: InsertComment): Promise<Comment>;
  
  // Seed methods
  seedTemplates(): Promise<void>;
  seedDailyChallenges(): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  // Daily Challenge methods
  async getDailyChallenge(id: number): Promise<DailyChallenge | undefined> {
    const [challenge] = await db.select().from(dailyChallenges).where(eq(dailyChallenges.id, id));
    return challenge;
  }

  async getCurrentDailyChallenge(): Promise<DailyChallenge | undefined> {
    try {
      const today = new Date();
      // First check if we already have an active challenge
      const [existingChallenge] = await db.select()
        .from(dailyChallenges)
        .where(
          and(
            eq(dailyChallenges.isActive, true),
            gte(dailyChallenges.endDate, today),
            eq(dailyChallenges.isUserCreated, false)
          )
        )
        .orderBy(desc(dailyChallenges.date))
        .limit(1);
      
      if (existingChallenge) {
        return existingChallenge;
      }
      
      // If no active challenge exists, create a new one from the daily prompts file
      return await this.createDailyPromptChallenge();
      
    } catch (error) {
      console.error("Error getting current daily challenge:", error);
      // If there's an error, try to create a new challenge
      return await this.createDailyPromptChallenge();
    }
  }
  
  // Create a new daily challenge from our 365 daily prompts
  async createDailyPromptChallenge(): Promise<DailyChallenge | undefined> {
    try {
      // Import the daily prompts
      const { dailyPrompts } = await import('./dailyPrompts');
      
      // Get today's date in the format YYYY-MM-DD
      const today = new Date();
      const formattedDate = today.toISOString().split('T')[0];
      
      // Find the prompt for today's date
      let todayPrompt = dailyPrompts.find(prompt => prompt.date === formattedDate);
      
      // If we don't have a prompt for today's date, use May 18th, 2025 prompt as default
      if (!todayPrompt) {
        console.log("No prompt found for today, using default May 18th prompt");
        todayPrompt = dailyPrompts.find(prompt => prompt.date === "2025-05-18") || {
          date: "2025-05-18",
          promptId: "P002",
          promptText: "Me trying to explain 'vibe check' to my robot coworker in 2025",
          category: "Work Life"
        };
      }
      
      console.log(`Creating daily challenge with prompt: ${todayPrompt.promptText}`);
      
      // Set end date to be 24 hours from now
      const now = new Date();
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      // Create a new challenge
      const newChallenge = await this.createDailyChallenge({
        promptId: todayPrompt.promptId,
        promptText: todayPrompt.promptText,
        title: todayPrompt.promptText,
        description: `Today's challenge: ${todayPrompt.promptText}`,
        category: todayPrompt.category,
        date: now,
        endDate: tomorrow,
        isActive: true,
        isUserCreated: false,
        maxSubmissions: 50,
        visibility: "public"
      });
      
      console.log("Created new daily challenge:", newChallenge);
      return newChallenge;
    } catch (error) {
      console.error("Error creating daily prompt challenge:", error);
      return undefined;
    }
  }

  async getDailyChallengeWithMemes(id: number): Promise<DailyChallengeWithMemes | undefined> {
    const challenge = await this.getDailyChallenge(id);
    if (!challenge) return undefined;

    const challengeMemes = await this.getMemesByDailyChallenge(id);
    
    // Calculate time remaining
    const now = new Date();
    const endDate = new Date(challenge.endDate);
    let timeRemaining = "";
    
    if (endDate > now) {
      const diff = Math.floor((endDate.getTime() - now.getTime()) / 1000);
      const hours = Math.floor(diff / 3600);
      const minutes = Math.floor((diff % 3600) / 60);
      timeRemaining = `${hours}h ${minutes}m`;
    } else {
      timeRemaining = "Ended";
    }

    return {
      ...challenge,
      memes: challengeMemes,
      participantCount: challengeMemes.length,
      timeRemaining
    };
  }

  async getAllDailyChallenges(): Promise<DailyChallenge[]> {
    return await db.select().from(dailyChallenges).orderBy(desc(dailyChallenges.date));
  }
  
  // Get only official daily challenges (not user-created)
  async getOfficialDailyChallenges(): Promise<DailyChallenge[]> {
    return await db.select()
      .from(dailyChallenges)
      .where(eq(dailyChallenges.isUserCreated, false))
      .orderBy(desc(dailyChallenges.date));
  }
  
  // Get user-created battles/challenges
  async getUserBattles(): Promise<DailyChallenge[]> {
    try {
      console.log("Fetching user-created battles");
      const challenges = await db.select()
        .from(dailyChallenges)
        .where(eq(dailyChallenges.isUserCreated, true))
        .orderBy(desc(dailyChallenges.date));
      
      console.log(`Found ${challenges.length} user-created battles`);
      
      if (challenges.length === 0) {
        // Let's ensure we have at least one user battle for demonstration
        console.log("No user battles found, creating a sample user battle");
        const sampleBattle = await this.seedSampleUserBattle();
        if (sampleBattle) {
          return [sampleBattle];
        }
      }
      
      // Count participants for each challenge
      const challengesWithParticipants = await Promise.all(
        challenges.map(async (challenge) => {
          const memes = await this.getMemesByDailyChallenge(challenge.id);
          return {
            ...challenge,
            participantCount: memes.length
          };
        })
      );
      
      return challengesWithParticipants;
    } catch (error) {
      console.error("Error getting user-created battles:", error);
      return [];
    }
  }
  
  // Create a sample user battle if none exist
  async seedSampleUserBattle(): Promise<DailyChallenge | undefined> {
    try {
      const now = new Date();
      const oneWeekLater = new Date(now);
      oneWeekLater.setDate(oneWeekLater.getDate() + 7);
      
      const battle = await this.createDailyChallenge({
        promptId: "UB-SAMPLE",
        promptText: "When AI starts finishing your sentences before you do",
        title: "When AI starts finishing your sentences before you do",
        description: "Share your funniest AI interaction memes!",
        category: "Technology",
        date: now,
        endDate: oneWeekLater,
        isActive: true,
        isUserCreated: true,
        userId: 1, // Assuming a default user ID
        maxSubmissions: 50,
        visibility: "public"
      });
      
      console.log("Created sample user battle:", battle);
      return battle;
    } catch (error) {
      console.error("Error creating sample user battle:", error);
      return undefined;
    }
  }

  async createDailyChallenge(challenge: InsertDailyChallenge): Promise<DailyChallenge> {
    const [newChallenge] = await db
      .insert(dailyChallenges)
      .values(challenge)
      .returning();
    return newChallenge;
  }

  async updateDailyChallenge(id: number, challengeUpdate: Partial<InsertDailyChallenge>): Promise<DailyChallenge | undefined> {
    const [updatedChallenge] = await db
      .update(dailyChallenges)
      .set(challengeUpdate)
      .where(eq(dailyChallenges.id, id))
      .returning();
    return updatedChallenge;
  }

  // Battle Royale methods
  async getBattleRoyale(id: number): Promise<BattleRoyale | undefined> {
    const [battleRoyale] = await db.select().from(battleRoyales).where(eq(battleRoyales.id, id));
    return battleRoyale;
  }

  async createBattleRoyale(battleRoyale: InsertBattleRoyale): Promise<BattleRoyale> {
    const [newBattleRoyale] = await db
      .insert(battleRoyales)
      .values(battleRoyale)
      .returning();
    return newBattleRoyale;
  }

  async updateBattleRoyaleWinner(id: number, winnerId: number): Promise<BattleRoyale | undefined> {
    const [updatedBattleRoyale] = await db
      .update(battleRoyales)
      .set({ winnerId })
      .where(eq(battleRoyales.id, id))
      .returning();
    return updatedBattleRoyale;
  }

  // Seed daily challenges
  async seedDailyChallenges(): Promise<void> {
    const existingChallenges = await this.getAllDailyChallenges();
    if (existingChallenges.length > 0) {
      return; // Challenges already seeded
    }

    // Initial set of daily challenges
    const challenges = [
      {
        promptId: "P001",
        promptText: "When your AI therapist starts overanalyzing your binary emotions",
        category: "Tech/AI",
        date: new Date("2025-05-17"),
        endDate: new Date("2025-05-18"),
        isActive: true
      },
      {
        promptId: "P002",
        promptText: "Me trying to explain 'vibe check' to my robot coworker in 2025",
        category: "Work Life",
        date: new Date("2025-05-18"),
        endDate: new Date("2025-05-19"),
        isActive: true
      },
      {
        promptId: "P003",
        promptText: "When you finally get revenge and the group chat is hyping you up",
        category: "Relatable Humor",
        date: new Date("2025-05-19"),
        endDate: new Date("2025-05-20"),
        isActive: true
      },
      {
        promptId: "P004",
        promptText: "POV: You're waiting for the Nintendo Switch 2 to drop but it's sold out",
        category: "Gaming",
        date: new Date("2025-05-20"),
        endDate: new Date("2025-05-21"),
        isActive: true
      },
      {
        promptId: "P005",
        promptText: "When your boss schedules a 7 AM Zoom but you're still in pajama mode",
        category: "Work Life",
        date: new Date("2025-05-21"),
        endDate: new Date("2025-05-22"),
        isActive: true
      }
    ];

    // Create a challenge for today (for testing)
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const todayChallenge = {
      promptId: "CURRENT",
      promptText: "When you say skibidi too much and the internet memes take over",
      category: "Internet Trends",
      date: today,
      endDate: tomorrow,
      isActive: true
    };

    // Add challenges
    for (const challenge of [...challenges, todayChallenge]) {
      await this.createDailyChallenge(challenge);
    }
    
    console.log("Daily challenges seeded successfully to database");
  }
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    if (!email) return undefined;
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }
  
  async updateUser(id: number, userData: UpsertUser): Promise<User> {
    const [user] = await db
      .update(users)
      .set({
        ...userData,
        updatedAt: new Date()
      })
      .where(eq(users.id, id))
      .returning();
    return user;
  }
  
  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData as InsertUser)
      .onConflictDoUpdate({
        target: users.username!,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }
  
  async getMeme(id: number): Promise<Meme | undefined> {
    const [meme] = await db.select().from(memes).where(eq(memes.id, id));
    return meme || undefined;
  }
  
  async getAllMemes(): Promise<Meme[]> {
    return await db.select().from(memes);
  }
  
  async getMemesByUser(userId: number): Promise<Meme[]> {
    return await db.select()
      .from(memes)
      .where(eq(memes.userId, userId))
      .orderBy(desc(memes.createdAt));
  }
  
  async getMemesByDailyChallenge(challengeId: number): Promise<Meme[]> {
    // Join with users table to get username and profile information
    const result = await db.select({
      id: memes.id,
      promptText: memes.promptText,
      imageUrl: memes.imageUrl,
      createdAt: memes.createdAt,
      userId: memes.userId,
      views: memes.views,
      likes: memes.likes,
      rank: memes.rank,
      dailyChallengeId: memes.dailyChallengeId,
      username: users.username,
      profileImageUrl: users.profileImageUrl,
      avatarSeed: users.avatarSeed,
      avatarStyle: users.avatarStyle
    })
    .from(memes)
    .leftJoin(users, eq(memes.userId, users.id))
    .where(eq(memes.dailyChallengeId, challengeId))
    .orderBy(desc(memes.likes));
    
    console.log(`Found ${result.length} memes for challenge ${challengeId}`);
    
    // Convert to proper Meme type with username and profile info as string | undefined
    return result.map(meme => ({
      ...meme,
      username: meme.username || undefined,
      profileImageUrl: meme.profileImageUrl || undefined,
      avatarSeed: meme.avatarSeed || undefined,
      avatarStyle: meme.avatarStyle || undefined
    }));
  }
  
  async createMeme(insertMeme: InsertMeme): Promise<Meme> {
    const [meme] = await db
      .insert(memes)
      .values({
        ...insertMeme,
        userId: insertMeme.userId || null
      })
      .returning();
    return meme;
  }
  
  async updateMemeLikes(id: number, likes: number): Promise<Meme | undefined> {
    const [updatedMeme] = await db
      .update(memes)
      .set({ likes })
      .where(eq(memes.id, id))
      .returning();
    return updatedMeme;
  }
  
  async updateMemeViews(id: number, views: number): Promise<Meme | undefined> {
    const [updatedMeme] = await db
      .update(memes)
      .set({ views })
      .where(eq(memes.id, id))
      .returning();
    return updatedMeme;
  }
  
  async getBattle(id: number): Promise<Battle | undefined> {
    const [battle] = await db.select().from(battles).where(eq(battles.id, id));
    return battle || undefined;
  }
  
  async getAllBattles(): Promise<Battle[]> {
    return await db.select().from(battles);
  }
  
  async getLatestBattle(): Promise<Battle | undefined> {
    const [latestBattle] = await db
      .select()
      .from(battles)
      .orderBy(desc(battles.createdAt))
      .limit(1);
    return latestBattle;
  }
  
  async createBattle(insertBattle: InsertBattle): Promise<Battle> {
    const [battle] = await db
      .insert(battles)
      .values(insertBattle)
      .returning();
    return battle;
  }
  
  async updateBattleWinner(id: number, winnerId: number): Promise<Battle | undefined> {
    const [updatedBattle] = await db
      .update(battles)
      .set({ winnerId })
      .where(eq(battles.id, id))
      .returning();
    return updatedBattle;
  }
  
  async getVote(id: number): Promise<Vote | undefined> {
    const [vote] = await db.select().from(votes).where(eq(votes.id, id));
    return vote || undefined;
  }
  
  async getAllVotes(): Promise<Vote[]> {
    return await db.select().from(votes);
  }
  
  async getVotesByBattle(battleId: number): Promise<Vote[]> {
    return await db.select().from(votes).where(eq(votes.battleId, battleId));
  }
  
  async createVote(insertVote: InsertVote): Promise<Vote> {
    const [vote] = await db
      .insert(votes)
      .values({
        ...insertVote,
        userId: insertVote.userId || null
      })
      .returning();
    return vote;
  }
  
  async getTemplate(id: number): Promise<Template | undefined> {
    const [template] = await db.select().from(templates).where(eq(templates.id, id));
    return template || undefined;
  }
  
  async getAllTemplates(): Promise<Template[]> {
    return await db.select().from(templates);
  }
  
  async createTemplate(insertTemplate: InsertTemplate): Promise<Template> {
    const [template] = await db
      .insert(templates)
      .values(insertTemplate)
      .returning();
    return template;
  }
  
  // Seed initial templates
  async seedTemplates(): Promise<void> {
    // Check if templates already exist
    const existingTemplates = await this.getAllTemplates();
    if (existingTemplates.length > 0) {
      return;
    }
    
    // Meme templates
    const memeTemplates = [
      { 
        name: "Distracted Boyfriend", 
        imageUrl: "https://i.imgflip.com/1ur9b0.jpg", 
        type: "template" 
      },
      { 
        name: "Two Buttons", 
        imageUrl: "https://i.imgflip.com/1g8my4.jpg", 
        type: "template" 
      },
      { 
        name: "Drake Hotline Bling", 
        imageUrl: "https://i.imgflip.com/30b1gx.jpg", 
        type: "template" 
      },
      { 
        name: "Change My Mind", 
        imageUrl: "https://i.imgflip.com/24y43o.jpg", 
        type: "template" 
      },
      { 
        name: "Expanding Brain", 
        imageUrl: "https://i.imgflip.com/1jwhww.jpg", 
        type: "template" 
      },
      { 
        name: "Surprised Pikachu", 
        imageUrl: "https://i.imgflip.com/2kbn1e.jpg", 
        type: "template" 
      }
    ];
    
    // Reaction images
    const reactionImages = [
      { 
        name: "Shocked Face", 
        imageUrl: "https://i.imgflip.com/65tesb.jpg", 
        type: "reaction" 
      },
      { 
        name: "Confused Math Lady", 
        imageUrl: "https://i.imgflip.com/56q38k.jpg", 
        type: "reaction" 
      },
      { 
        name: "Thinking Face", 
        imageUrl: "https://i.imgflip.com/4fh0ct.jpg", 
        type: "reaction" 
      },
      { 
        name: "Confused Nick Young", 
        imageUrl: "https://i.imgflip.com/29v4rt.jpg", 
        type: "reaction" 
      }
    ];
    
    // Add all templates to storage
    for (const template of [...memeTemplates, ...reactionImages]) {
      await this.createTemplate(template);
    }
    
    console.log("Templates seeded successfully to database");
  }
  
  // Comment methods
  async getComment(id: number): Promise<Comment | undefined> {
    try {
      const [comment] = await db.select().from(comments).where(eq(comments.id, id));
        
      if (!comment) return undefined;
      
      // Get user info for the comment
      if (comment.userId) {
        const [user] = await db
          .select()
          .from(users)
          .where(eq(users.id, comment.userId));
          
        if (user) {
          return {
            ...comment,
            username: user.username,
            profileImageUrl: user.profileImageUrl,
            avatarSeed: user.avatarSeed,
            avatarStyle: user.avatarStyle
          };
        }
      }
      
      return comment;
    } catch (error) {
      console.error("Error getting comment:", error);
      return undefined;
    }
  }
  
  async getCommentsByMeme(memeId: number): Promise<Comment[]> {
    try {
      const commentsList = await db
        .select()
        .from(comments)
        .where(eq(comments.memeId, memeId))
        .orderBy(desc(comments.createdAt));
      
      // Batch fetch all user IDs from the comments
      const userIds = commentsList
        .filter(comment => comment.userId !== null)
        .map(comment => comment.userId!);
        
      if (userIds.length === 0) return commentsList;
      
      // Get all users in one query
      const usersList = await db
        .select()
        .from(users)
        .where(inArray(users.id, userIds));
        
      // Create a map for faster lookup
      const userMap = new Map();
      usersList.forEach(user => {
        userMap.set(user.id, user);
      });
      
      // Enrich comments with user data
      return commentsList.map(comment => {
        if (comment.userId && userMap.has(comment.userId)) {
          const user = userMap.get(comment.userId);
          return {
            ...comment,
            username: user.username,
            profileImageUrl: user.profileImageUrl,
            avatarSeed: user.avatarSeed,
            avatarStyle: user.avatarStyle
          };
        }
        return comment;
      });
    } catch (error) {
      console.error("Error getting comments by meme:", error);
      return [];
    }
  }
  
  async createComment(insertComment: InsertComment): Promise<Comment> {
    try {
      const [comment] = await db
        .insert(comments)
        .values(insertComment)
        .returning();
        
      // If we have a user ID, get the user info
      if (comment.userId) {
        const [user] = await db
          .select()
          .from(users)
          .where(eq(users.id, comment.userId));
          
        if (user) {
          return {
            ...comment,
            username: user.username,
            profileImageUrl: user.profileImageUrl,
            avatarSeed: user.avatarSeed,
            avatarStyle: user.avatarStyle
          };
        }
      }
      
      return comment;
    } catch (error) {
      console.error("Error creating comment:", error);
      throw error;
    }
  }
}

export const storage = new DatabaseStorage();
