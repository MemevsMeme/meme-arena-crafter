import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import express from "express";
import session from "express-session";
import { storage as dbStorage } from "./storage";
import { memeService } from "./memeService";
import { db, pool } from "./db";
import multer from "multer";
import path from "path";
import fs from "fs";
import { z } from "zod";
import { 
  insertMemeSchema, 
  insertBattleSchema, 
  insertVoteSchema, 
  insertTemplateSchema,
  insertUserSchema,
  insertCommentSchema
} from "@shared/schema";
// Import the isAuthenticated middleware
import { isAuthenticated } from './auth';
import authRoutes from "./authRoutes";

// Import the Gemini AI implementation
import { generateMemeImage, generateMemeText } from './ai';

// Import sound handling
import { upload as soundUpload, uploadSound, getAllSounds, deleteSound } from './sounds';

export async function registerRoutes(app: Express): Promise<Server> {
  // Set up session middleware
  app.use(session({
    secret: "meme-arena-secret",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      maxAge: 1000 * 60 * 60 * 24 * 7, // 1 week
    }
  }));
  
  // Mount auth routes
  app.use('/api/auth', authRoutes);
  
  // Configure multer for file uploads
  const uploadsDir = path.join(process.cwd(), 'uploads');
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }
  
  const multerStorage = multer.diskStorage({
    destination: (_req, _file, cb) => {
      cb(null, uploadsDir);
    },
    filename: (_req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, 'meme-' + uniqueSuffix + path.extname(file.originalname));
    }
  });
  
  const upload = multer({ 
    storage: multerStorage,
    limits: {
      fileSize: 5 * 1024 * 1024, // 5MB limit
    },
    fileFilter: (_req, file, cb) => {
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
      if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
      } else {
        cb(new Error('Invalid file type, only JPEG, PNG and GIF is allowed!'));
      }
    }
  });
  
  // Serve static files from the uploads directory
  app.use('/uploads', express.static(uploadsDir));
  
  // Serve static files from the generated images directory
  const generatedDir = path.join(process.cwd(), 'client', 'public', 'generated');
  if (!fs.existsSync(generatedDir)) {
    fs.mkdirSync(generatedDir, { recursive: true });
  }
  app.use('/generated', express.static(generatedDir));
  
  // Generate a Dicebear avatar - Kept outside of auth routes for legacy compatibility
  app.post('/api/auth/generate-avatar', async (req, res) => {
    try {
      const { seed = Math.random().toString(36).substring(2, 15) } = req.body;
      
      // Use Dicebear API URL directly instead of generating SVG locally
      // This is more reliable and doesn't require complex library setup
      const avatarUrl = `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(seed)}`;
      
      res.json({ 
        avatarUrl,
        seed 
      });
    } catch (error) {
      console.error("Error generating avatar:", error);
      res.status(500).json({ message: "Failed to generate avatar" });
    }
  });
  
  // Get all memes
  app.get("/api/memes", async (req, res) => {
    try {
      const memes = await dbStorage.getAllMemes();
      res.json(memes);
    } catch (error) {
      res.status(500).json({ message: "Failed to get memes" });
    }
  });
  
  // Get memes by user ID
  app.get("/api/memes/user/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      if (isNaN(userId)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }
      
      const memes = await dbStorage.getMemesByUser(userId);
      res.json(memes);
    } catch (error) {
      console.error("Error getting user memes:", error);
      res.status(500).json({ message: "Failed to get user memes" });
    }
  });

  // Get memes by challenge ID
  app.get("/api/memes/challenge/:challengeId", async (req, res) => {
    try {
      const challengeId = parseInt(req.params.challengeId);
      if (isNaN(challengeId)) {
        return res.status(400).json({ message: "Invalid challenge ID" });
      }

      const challengeMemes = await dbStorage.getMemesByDailyChallenge(challengeId);
      console.log(`API: Found ${challengeMemes.length} memes for challenge ${challengeId}`);
      res.json(challengeMemes);
    } catch (error) {
      console.error("Error getting challenge memes:", error);
      res.status(500).json({ message: "Failed to get challenge memes" });
    }
  });

  // Get meme by ID
  app.get("/api/memes/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid meme ID" });
      }

      // Get the meme with full user information attached
      const result = await pool.query(`
        SELECT m.*, u.username, u.email, u.profile_image_url, u.avatar_seed, u.avatar_style 
        FROM memes m
        LEFT JOIN users u ON m.user_id = u.id
        WHERE m.id = $1
      `, [id]);

      const meme = result.rows[0];
      if (!meme) {
        return res.status(404).json({ message: "Meme not found" });
      }

      // Increment view count
      await dbStorage.updateMemeViews(id, meme.views + 1);

      res.json(meme);
    } catch (error) {
      console.error("Error fetching meme:", error);
      res.status(500).json({ message: "Failed to get meme" });
    }
  });
  
  // Vote for a meme
  app.post("/api/memes/:id/vote", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid meme ID" });
      }

      const meme = await dbStorage.getMeme(id);
      if (!meme) {
        return res.status(404).json({ message: "Meme not found" });
      }

      // Increment likes count
      const updatedMeme = await dbStorage.updateMemeLikes(id, meme.likes + 1);

      res.json({ success: true, meme: updatedMeme });
    } catch (error) {
      console.error("Error voting for meme:", error);
      res.status(500).json({ message: "Failed to vote for meme" });
    }
  });
  
  // Like a meme (alias for vote endpoint)
  app.post("/api/memes/:id/like", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid meme ID" });
      }

      const meme = await dbStorage.getMeme(id);
      if (!meme) {
        return res.status(404).json({ message: "Meme not found" });
      }

      // Increment likes count
      const updatedMeme = await dbStorage.updateMemeLikes(id, meme.likes + 1);

      res.json({ success: true, meme: updatedMeme });
    } catch (error) {
      console.error("Error liking meme:", error);
      res.status(500).json({ message: "Failed to like meme" });
    }
  });
  
  // Comments API
  // Get comments for a meme
  app.get("/api/memes/:id/comments", async (req, res) => {
    try {
      const memeId = parseInt(req.params.id);
      if (isNaN(memeId)) {
        return res.status(400).json({ message: "Invalid meme ID" });
      }
      
      // Query comments from database with all user info
      const result = await pool.query(`
        SELECT 
          c.*,
          u.id as user_id, 
          u.username, 
          u.email,
          u.profile_image_url, 
          u.avatar_seed, 
          u.avatar_style 
        FROM 
          comments c 
        LEFT JOIN 
          users u ON c.user_id = u.id 
        WHERE 
          c.meme_id = $1 
        ORDER BY 
          c.created_at DESC
      `, [memeId]);
      
      res.json(result.rows || []);
    } catch (error) {
      console.error("Error getting comments:", error);
      res.status(500).json({ message: "Failed to get comments" });
    }
  });
  
  // Add a comment to a meme
  app.post("/api/memes/:id/comments", async (req, res) => {
    try {
      const memeId = parseInt(req.params.id);
      if (isNaN(memeId)) {
        return res.status(400).json({ message: "Invalid meme ID" });
      }
      
      // Get the meme to make sure it exists
      const meme = await dbStorage.getMeme(memeId);
      if (!meme) {
        return res.status(404).json({ message: "Meme not found" });
      }
      
      // Get user ID from session if present
      const userId = req.session.userId || null;
      
      // Validate and extract text from request
      const { text } = req.body;
      if (!text || typeof text !== 'string' || text.trim() === '') {
        return res.status(400).json({ message: "Comment text is required" });
      }
      
      // Insert comment into database
      const result = await pool.query(
        "INSERT INTO comments (meme_id, user_id, text) VALUES ($1, $2, $3) RETURNING *",
        [memeId, userId, text]
      );
      
      // Get user info if available for response
      if (userId) {
        const userResult = await pool.query(
          "SELECT username, profile_image_url, avatar_seed, avatar_style FROM users WHERE id = $1",
          [userId]
        );
        if (userResult.rows.length > 0) {
          const user = userResult.rows[0];
          result.rows[0] = {
            ...result.rows[0],
            username: user.username,
            profile_image_url: user.profile_image_url,
            avatar_seed: user.avatar_seed,
            avatar_style: user.avatar_style
          };
        }
      }
      
      res.status(201).json(result.rows[0]);
    } catch (error) {
      console.error("Error adding comment:", error);
      res.status(500).json({ message: "Failed to add comment" });
    }
  });
  
  // Get trending memes (most liked in the last 24 hours)
  app.get("/api/memes/trending", async (req, res) => {
    try {
      const twentyFourHoursAgo = new Date();
      twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24);
      
      // Query trending memes
      const result = await pool.query(
        `SELECT m.*, u.username, u.profile_image_url, u.avatar_seed, u.avatar_style 
         FROM memes m
         LEFT JOIN users u ON m.user_id = u.id
         WHERE m.created_at > $1
         ORDER BY m.likes DESC
         LIMIT 10`,
        [twentyFourHoursAgo]
      );
      
      res.json(result.rows || []);
    } catch (error) {
      console.error("Error getting trending memes:", error);
      res.status(500).json({ message: "Failed to get trending memes" });
    }
  });

  // Generate a new meme - with user authentication and session info for proper user association
  app.post("/api/memes/generate", isAuthenticated, async (req, res) => {
    // Log the session and user ID for debugging
    console.log("Session user ID:", req.session.userId);
    try {
      const { promptText, templateId, generationType, dailyChallengeId, style } = insertMemeSchema
        .pick({ promptText: true, dailyChallengeId: true })
        .extend({
          templateId: z.number().nullable().optional(),
          generationType: z.enum(["ai", "template", "upload"]).optional().default("ai"),
          style: z.string().optional().default("photo")
        })
        .parse(req.body);

      let template = null;
      if (templateId) {
        template = await dbStorage.getTemplate(templateId);
      }

      let imageUrl = "";
      
      // Handle different generation types
      if (generationType === "template" && template) {
        // Just use the template image directly with the caption
        imageUrl = template.imageUrl;
      } else if (generationType === "ai") {
        // For AI-generated memes using Gemini with our new two-step generation
        console.log("Generating AI meme with Gemini for prompt:", promptText, "style:", style);
        
        // Create style-enhanced prompt for better image generation
        const styleEnhancedPrompt = `${promptText} in ${style} style`;
        
        // Use our improved two-step implementation:
        // 1. First optimize the prompt using AI
        // 2. Then generate the image with the optimized prompt
        const result = await generateMemeImage(styleEnhancedPrompt);
        
        if (result.success) {
          // Image generation was successful
          imageUrl = result.imageUrl || "";
          console.log("Successfully generated image:", imageUrl);
          
          // Generate AI text suggestions using our custom implementation
          const aiText = await generateMemeText(promptText);
          console.log("Generated AI text:", aiText);
        } else {
          // Image generation failed - return an error response instead of using fallback
          return res.status(400).json({ 
            message: "Failed to generate AI image", 
            error: result.error
          });
        }
      } else {
        // Fallback for any other case
        imageUrl = memeService.getRandomPlaceholderImage();
      }
      
      // Get user ID from authentication if present
      const userId = req.user ? (req.user as any).claims?.sub : null;
      
      // Save meme to storage, including challenge ID if present
      const meme = await dbStorage.createMeme({
        promptText,
        imageUrl,
        userId: userId || null,
        ...(dailyChallengeId ? { dailyChallengeId } : {})
      });

      res.json(meme);
    } catch (error) {
      console.error("Meme generation error:", error);
      res.status(500).json({ message: "Failed to generate meme" });
    }
  });
  
  // Upload a meme image
  app.post("/api/memes/upload", upload.single('image'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }
      
      const promptText = req.body.promptText || "User uploaded meme";
      
      // Create URL for the uploaded file
      const baseUrl = `${req.protocol}://${req.get('host')}`;
      const relativePath = `/uploads/${path.basename(req.file.path)}`;
      const imageUrl = `${baseUrl}${relativePath}`;
      
      // Get user ID from authentication if present
      const userId = req.user ? (req.user as any).claims?.sub : null;
      
      // Check if this is for a daily challenge
      const dailyChallengeId = req.body.dailyChallengeId ? parseInt(req.body.dailyChallengeId) : null;
      
      // Save meme to storage with optional challenge association
      const meme = await dbStorage.createMeme({
        promptText,
        imageUrl,
        userId: userId || null,
        ...(dailyChallengeId ? { dailyChallengeId } : {})
      });
      
      res.json(meme);
    } catch (error) {
      console.error("Meme upload error:", error);
      res.status(500).json({ message: "Failed to upload meme" });
    }
  });

  // Get all templates
  app.get("/api/templates", async (req, res) => {
    try {
      const templates = await dbStorage.getAllTemplates();
      res.json(templates);
    } catch (error) {
      res.status(500).json({ message: "Failed to get templates" });
    }
  });

  // Get current battle
  app.get("/api/battles/current", async (req, res) => {
    try {
      const latestBattle = await dbStorage.getLatestBattle();
      
      if (!latestBattle) {
        return res.status(404).json({ message: "No active battle found" });
      }

      const memeOne = await dbStorage.getMeme(latestBattle.memeOneId);
      const memeTwo = await dbStorage.getMeme(latestBattle.memeTwoId);

      if (!memeOne || !memeTwo) {
        return res.status(404).json({ message: "Battle memes not found" });
      }

      res.json({
        battle: latestBattle,
        memeOne,
        memeTwo
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to get current battle" });
    }
  });

  // Create a new battle
  app.post("/api/battles/new", async (req, res) => {
    try {
      // Get two random memes for the battle
      let allMemes = await dbStorage.getAllMemes();
      
      if (allMemes.length < 2) {
        // If we don't have enough memes, generate some dummy memes
        await memeService.seedDemoMemes();
        allMemes = await dbStorage.getAllMemes();
        if (allMemes.length < 2) {
          return res.status(500).json({ message: "Not enough memes to create a battle" });
        }
      }

      // Get two random memes
      const shuffled = [...allMemes].sort(() => 0.5 - Math.random());
      const [memeOne, memeTwo] = shuffled.slice(0, 2);

      // Create a new battle
      const battle = await dbStorage.createBattle({
        memeOneId: memeOne.id,
        memeTwoId: memeTwo.id,
      });

      res.json({
        battle,
        memeOne,
        memeTwo
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to create new battle" });
    }
  });

  // Vote in a battle
  app.post("/api/battles/vote", async (req, res) => {
    try {
      const { memeId, battleId } = insertVoteSchema
        .pick({ memeId: true, battleId: true })
        .parse(req.body);

      // Verify battle exists
      const battle = await dbStorage.getBattle(battleId);
      if (!battle) {
        return res.status(404).json({ message: "Battle not found" });
      }

      // Verify meme is part of this battle
      if (memeId !== battle.memeOneId && memeId !== battle.memeTwoId) {
        return res.status(400).json({ message: "Meme is not part of this battle" });
      }
      
      // Get user ID from authentication if present
      const userId = req.user ? (req.user as any).claims?.sub : null;

      // Register vote
      const vote = await dbStorage.createVote({
        memeId,
        battleId,
        userId: userId || null,
      });

      // Update battle winner if not already set
      if (!battle.winnerId) {
        await dbStorage.updateBattleWinner(battleId, memeId);
      }

      // Increment meme likes
      const meme = await dbStorage.getMeme(memeId);
      if (meme) {
        await dbStorage.updateMemeLikes(memeId, meme.likes + 1);
      }

      res.json({ success: true, vote });
    } catch (error) {
      res.status(500).json({ message: "Failed to register vote" });
    }
  });

  // Get leaderboard
  app.get("/api/leaderboard", async (req, res) => {
    try {
      const memes = await dbStorage.getAllMemes();
      const battles = await dbStorage.getAllBattles();
      
      // Calculate win rates and additional stats for each meme
      const memesWithStats = memes.map((meme: any) => {
        const battlesWon = battles.filter((b: any) => b.winnerId === meme.id).length;
        const battlesParticipated = battles.filter(
          (b: any) => b.memeOneId === meme.id || b.memeTwoId === meme.id
        ).length;
        
        const winRate = battlesParticipated > 0 
          ? Math.round((battlesWon / battlesParticipated) * 100) 
          : 0;
        
        return {
          ...meme,
          winRate,
          battlesWon,
          battlesTotal: battlesParticipated
        };
      });
      
      // Sort by win rate and then by likes
      const sortedLeaderboard = memesWithStats.sort((a: any, b: any) => {
        if (a.winRate !== b.winRate) {
          return b.winRate - a.winRate;
        }
        return b.likes - a.likes;
      });
      
      res.json(sortedLeaderboard);
    } catch (error) {
      res.status(500).json({ message: "Failed to get leaderboard" });
    }
  });
  
  // Get user profile data
  app.get("/api/auth/user", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.session.userId;
      if (!userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const user = await dbStorage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Remove password from the response
      const { password, ...userWithoutPassword } = user;
      
      res.json(userWithoutPassword);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Seed initial templates if none exist
  app.get("/api/seed/templates", async (req, res) => {
    try {
      await dbStorage.seedTemplates();
      const templates = await dbStorage.getAllTemplates();
      res.json({ success: true, count: templates.length, templates });
    } catch (error) {
      console.error("Error seeding templates:", error);
      res.status(500).json({ message: "Failed to seed templates" });
    }
  });
  
  // Seed initial daily challenges if none exist
  app.get("/api/seed/daily-challenges", async (req, res) => {
    try {
      await dbStorage.seedDailyChallenges();
      const challenges = await dbStorage.getAllDailyChallenges();
      res.json({ success: true, count: challenges.length, challenges });
    } catch (error) {
      console.error("Error seeding daily challenges:", error);
      res.status(500).json({ message: "Failed to seed daily challenges" });
    }
  });
  
  // Get current daily challenge with memes
  app.get("/api/daily-challenges/current", async (req, res) => {
    try {
      const challenge = await dbStorage.getCurrentDailyChallenge();
      
      if (!challenge) {
        return res.status(404).json({ message: "No active daily challenge found" });
      }
      
      const challengeWithMemes = await dbStorage.getDailyChallengeWithMemes(challenge.id);
      res.json(challengeWithMemes);
    } catch (error) {
      console.error("Error getting current daily challenge:", error);
      res.status(500).json({ message: "Failed to get current daily challenge" });
    }
  });
  
  // Get specific daily challenge with memes
  app.get("/api/daily-challenges/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid challenge ID" });
      }
      
      console.log(`Request for challenge ID: ${id}`);
      
      const challengeWithMemes = await dbStorage.getDailyChallengeWithMemes(id);
      
      if (!challengeWithMemes) {
        return res.status(404).json({ message: "Daily challenge not found" });
      }
      
      console.log(`Returning challenge with ${challengeWithMemes.memes.length} memes`);
      res.json(challengeWithMemes);
    } catch (error) {
      console.error("Error getting daily challenge:", error);
      res.status(500).json({ message: "Failed to get daily challenge" });
    }
  });
  
  // Get all daily challenges
  app.get("/api/daily-challenges", async (req, res) => {
    try {
      // Only return official daily challenges (not user-created)
      const challenges = await dbStorage.getOfficialDailyChallenges();
      res.json(challenges);
    } catch (error) {
      console.error("Error getting daily challenges:", error);
      res.status(500).json({ message: "Failed to get daily challenges" });
    }
  });
  
  // Get user-created battles
  app.get("/api/user-battles", async (req, res) => {
    try {
      const battles = await dbStorage.getUserBattles();
      res.json(battles);
    } catch (error) {
      console.error("Error getting user battles:", error);
      res.status(500).json({ message: "Failed to get user battles" });
    }
  });
  
  // Get specific battle by ID
  app.get("/api/battles/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid battle ID" });
      }
      
      console.log(`Request for battle ID: ${id}`);
      
      const battle = await dbStorage.getDailyChallengeWithMemes(id);
      
      if (!battle) {
        return res.status(404).json({ message: "Battle not found" });
      }
      
      res.json(battle);
    } catch (error) {
      console.error("Error getting battle:", error);
      res.status(500).json({ message: "Failed to get battle" });
    }
  });
  
  // Get memes for a specific battle
  app.get("/api/battles/:id/memes", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid battle ID" });
      }
      
      console.log(`Request for memes for battle ID: ${id}`);
      
      const memes = await dbStorage.getMemesByDailyChallenge(id);
      
      console.log(`Found ${memes.length} memes for challenge ${id}`);
      res.json(memes);
    } catch (error) {
      console.error("Error getting battle memes:", error);
      res.status(500).json({ message: "Failed to get battle memes" });
    }
  });
  
  // User Achievements API
  app.get("/api/achievements/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      if (isNaN(userId)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }
      
      // Get user stats
      const userMemes = await dbStorage.getMemesByUser(userId);
      const totalMemes = userMemes.length;
      const totalLikes = userMemes.reduce((sum, meme) => sum + (meme.likes || 0), 0);
      const totalViews = userMemes.reduce((sum, meme) => sum + (meme.views || 0), 0);
      
      // Get battle wins
      const battlesWon = userMemes.filter(meme => meme.rank === 1).length;
      
      // Get daily challenges participated in
      const dailyChallenges = userMemes.filter(meme => meme.dailyChallengeId).length;
      
      // Define achievements and their earned status
      const achievements = [
        // Creation achievements
        {
          id: 'create_first_meme',
          name: 'Meme Apprentice',
          description: 'Create your first meme',
          icon: 'Laugh',
          earned: totalMemes >= 1,
          date: totalMemes >= 1 ? new Date().toISOString() : undefined,
          tier: 'bronze',
          category: 'creation'
        },
        {
          id: 'create_10_memes',
          name: 'Meme Artisan',
          description: 'Create 10 memes',
          icon: 'Laugh',
          earned: totalMemes >= 10,
          progress: Math.min(totalMemes, 10),
          maxProgress: 10,
          tier: 'silver',
          category: 'creation'
        },
        {
          id: 'create_50_memes',
          name: 'Meme Master',
          description: 'Create 50 memes',
          icon: 'Laugh',
          earned: totalMemes >= 50,
          progress: Math.min(totalMemes, 50),
          maxProgress: 50,
          tier: 'gold',
          category: 'creation'
        },
        
        // Battle achievements
        {
          id: 'win_battle',
          name: 'First Victory',
          description: 'Win your first meme battle',
          icon: 'Trophy',
          earned: battlesWon >= 1,
          date: battlesWon >= 1 ? new Date().toISOString() : undefined,
          tier: 'bronze',
          category: 'battle'
        },
        {
          id: 'win_5_battles',
          name: 'Battle Veteran',
          description: 'Win 5 meme battles',
          icon: 'Trophy',
          earned: battlesWon >= 5,
          progress: Math.min(battlesWon, 5),
          maxProgress: 5,
          tier: 'silver',
          category: 'battle'
        },
        
        // Social achievements
        {
          id: 'get_10_likes',
          name: 'Liked!',
          description: 'Get 10 likes on your memes',
          icon: 'ThumbsUp',
          earned: totalLikes >= 10,
          date: totalLikes >= 10 ? new Date().toISOString() : undefined,
          tier: 'bronze',
          category: 'social'
        },
        {
          id: 'get_100_likes',
          name: 'Crowd Pleaser',
          description: 'Get 100 likes on your memes',
          icon: 'ThumbsUp',
          earned: totalLikes >= 100,
          progress: Math.min(totalLikes, 100),
          maxProgress: 100,
          tier: 'silver',
          category: 'social'
        },
        
        // Special achievements
        {
          id: 'daily_challenge_participation',
          name: 'Challenge Accepted',
          description: 'Participate in a daily challenge',
          icon: 'Award',
          earned: dailyChallenges >= 1,
          date: dailyChallenges >= 1 ? new Date().toISOString() : undefined,
          tier: 'bronze',
          category: 'special'
        },
        {
          id: 'win_daily_challenge',
          name: 'Daily Champion',
          description: 'Win a daily challenge',
          icon: 'Award',
          earned: battlesWon >= 1,
          date: battlesWon >= 1 ? new Date().toISOString() : undefined,
          tier: 'silver',
          category: 'special'
        }
      ];
      
      return res.json(achievements);
    } catch (error) {
      console.error("Error fetching user achievements:", error);
      return res.status(500).json({ message: "Error fetching achievements" });
    }
  });

  // Create a new user battle (separate from daily challenges)
  app.post("/api/user-battles/create", isAuthenticated, async (req, res) => {
    try {
      console.log("Battle creation request body:", JSON.stringify(req.body, null, 2));
      
      const {
        promptId,
        title,
        promptText,
        description,
        category,
        date,
        endDate,
        maxSubmissions,
        style,
        visibility,
        isActive,
        isUserCreated
      } = req.body;
      
      // Validation - check for the actual required fields
      if (!promptText || !title || !date || !endDate) {
        console.log("Validation failed. Missing fields:", {
          promptText: !!promptText,
          title: !!title,
          date: !!date,
          endDate: !!endDate
        });
        return res.status(400).json({ message: "Missing required fields for battle creation" });
      }
      
      // Make sure we have a valid user
      const userData = req.user as any;
      const userId = userData && userData.id ? userData.id : 
                    (req.session && req.session.userId ? req.session.userId : 1);
      
      console.log("Creating user battle with ID:", userId);
      
      // Create the battle challenge
      const battle = await dbStorage.createDailyChallenge({
        promptId,
        title: title || promptText.substring(0, 50),
        promptText,
        description: description || "",
        category: category || "community",
        date: new Date(date),
        endDate: new Date(endDate),
        maxSubmissions: maxSubmissions || 50,
        style: style || "",
        visibility: visibility || "public",
        isActive: true,
        userId: userId,
        isUserCreated: true
      });
      
      res.status(201).json(battle);
    } catch (error) {
      console.error("Error creating battle:", error);
      res.status(500).json({ message: "Failed to create battle" });
    }
  });
  
  // Create a new user challenge
  app.post("/api/daily-challenges", isAuthenticated, async (req, res) => {
    try {
      const {
        title,
        promptText,
        description,
        category,
        date,
        endDate,
        maxSubmissions,
        style,
        visibility
      } = req.body;
      
      // Validation
      if (!promptText || !date || !endDate) {
        return res.status(400).json({ message: "Missing required fields for challenge creation" });
      }
      
      // Generate a unique ID for the challenge
      const timestamp = new Date().getTime();
      const promptId = `UC${timestamp.toString().slice(-6)}`;  // UC = User Challenge
      
      // Make sure we have a valid user
      // TypeScript won't know req.user is our custom User type with id property
      const userData = req.user as any;
      const userId = userData && userData.id ? userData.id : 
                    (req.session && req.session.userId ? req.session.userId : 1);
      
      console.log("Creating challenge with user ID:", userId);
      
      // Create the challenge
      const challenge = await dbStorage.createDailyChallenge({
        promptId,
        title: title || promptText.substring(0, 50),
        promptText,
        description: description || "",
        category: category || "community",
        date: new Date(date),
        endDate: new Date(endDate),
        maxSubmissions: maxSubmissions || 50,
        style: style || "",
        visibility: visibility || "public",
        isActive: true,
        userId: userId,
        isUserCreated: true
      });
      
      res.status(201).json(challenge);
    } catch (error) {
      console.error("Error creating challenge:", error);
      res.status(500).json({ message: "Failed to create challenge" });
    }
  });
  
  // Submit a meme to a daily challenge
  app.post("/api/daily-challenges/:id/submit", isAuthenticated, async (req, res) => {
    try {
      const challengeId = parseInt(req.params.id);
      if (isNaN(challengeId)) {
        return res.status(400).json({ message: "Invalid challenge ID" });
      }
      
      const challenge = await dbStorage.getDailyChallenge(challengeId);
      if (!challenge) {
        return res.status(404).json({ message: "Daily challenge not found" });
      }
      
      // Check if challenge is still active
      if (!challenge.isActive || new Date(challenge.endDate) < new Date()) {
        return res.status(400).json({ message: "This daily challenge has ended" });
      }
      
      const { promptText, imageUrl } = req.body;
      
      if (!promptText || !imageUrl) {
        return res.status(400).json({ message: "Prompt text and image URL are required" });
      }
      
      console.log("Challenge submission - User ID:", req.session.userId);
      
      // Create the meme with association to the daily challenge
      const meme = await dbStorage.createMeme({
        promptText,
        imageUrl,
        userId: req.session.userId,
        dailyChallengeId: challengeId
      });
      
      console.log("Challenge meme created:", {
        id: meme.id,
        userId: meme.userId,
        dailyChallengeId: meme.dailyChallengeId
      });
      
      res.status(201).json(meme);
    } catch (error) {
      console.error("Error submitting to daily challenge:", error);
      res.status(500).json({ message: "Failed to submit to daily challenge" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
