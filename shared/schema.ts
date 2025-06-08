import { pgTable, text, serial, integer, boolean, timestamp, varchar, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table for Replit Auth
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  }
);

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: text("email").unique(),
  username: text("username").unique().notNull(),
  password: text("password").notNull(),
  firstName: text("first_name"),
  lastName: text("last_name"),
  profileImageUrl: text("profile_image_url"),
  avatarSeed: text("avatar_seed"),
  avatarStyle: text("avatar_style").default("avataaars"),
  avatarBackgroundColor: text("avatar_background_color"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const memes = pgTable("memes", {
  id: serial("id").primaryKey(),
  promptText: text("prompt_text").notNull(),
  imageUrl: text("image_url").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  userId: integer("user_id"),
  views: integer("views").default(0).notNull(),
  likes: integer("likes").default(0).notNull(),
  rank: integer("rank").default(0),
  dailyChallengeId: integer("daily_challenge_id"),
  soundEffects: text("sound_effects").array(),
});

export const battles = pgTable("battles", {
  id: serial("id").primaryKey(),
  memeOneId: integer("meme_one_id").notNull(),
  memeTwoId: integer("meme_two_id").notNull(),
  winnerId: integer("winner_id"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const votes = pgTable("votes", {
  id: serial("id").primaryKey(),
  memeId: integer("meme_id").notNull(),
  battleId: integer("battle_id").notNull(),
  userId: integer("user_id"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const templates = pgTable("templates", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  imageUrl: text("image_url").notNull(),
  type: text("type").notNull(), // 'template' or 'reaction'
});

// Daily challenge prompts for meme battles
export const dailyChallenges = pgTable("daily_challenges", {
  id: serial("id").primaryKey(),
  promptId: text("prompt_id").notNull(), // e.g. P001, P002, etc.
  title: text("title"), // Optional title for the challenge
  promptText: text("prompt_text").notNull(),
  description: text("description"), // Optional description for additional context
  category: text("category").notNull(),
  date: timestamp("date").notNull(),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  endDate: timestamp("end_date").notNull(), // When the challenge ends
  maxSubmissions: integer("max_submissions").default(50), // Maximum submissions allowed
  style: text("style"), // Optional style preference for meme generation
  visibility: text("visibility").default("public"), // public or private
  userId: integer("user_id").references(() => users.id), // Creator of the challenge (if user-created)
  isUserCreated: boolean("is_user_created").default(false),
});

// Battle Royale events based on daily challenges
export const battleRoyales = pgTable("battle_royales", {
  id: serial("id").primaryKey(),
  challengeId: integer("challenge_id").notNull(),
  winnerId: integer("winner_id"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Comments on memes
export const comments = pgTable("comments", {
  id: serial("id").primaryKey(),
  memeId: integer("meme_id").references(() => memes.id).notNull(),
  userId: integer("user_id").references(() => users.id),
  text: text("text").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).pick({
  email: true,
  username: true,
  password: true,
  firstName: true,
  lastName: true,
  profileImageUrl: true,
  avatarSeed: true,
  avatarStyle: true,
  avatarBackgroundColor: true,
});

export const loginSchema = z.object({
  username: z.string().min(3).max(50),
  password: z.string().min(6),
});

export const registerSchema = insertUserSchema.extend({
  password: z.string().min(6),
  confirmPassword: z.string().min(6),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

export const upsertUserSchema = insertUserSchema.partial();

export const insertMemeSchema = createInsertSchema(memes).pick({
  promptText: true,
  imageUrl: true,
  userId: true,
  dailyChallengeId: true,
  soundEffects: true,
});

export const insertBattleSchema = createInsertSchema(battles).pick({
  memeOneId: true,
  memeTwoId: true,
});

export const insertVoteSchema = createInsertSchema(votes).pick({
  memeId: true,
  battleId: true,
  userId: true,
});

export const insertTemplateSchema = createInsertSchema(templates).pick({
  name: true,
  imageUrl: true,
  type: true,
});

export const insertDailyChallengeSchema = createInsertSchema(dailyChallenges).pick({
  promptId: true,
  title: true,
  promptText: true,
  description: true,
  category: true,
  date: true,
  endDate: true,
  maxSubmissions: true,
  style: true,
  visibility: true,
  isActive: true,
  userId: true,
  isUserCreated: true,
});

export const insertBattleRoyaleSchema = createInsertSchema(battleRoyales).pick({
  challengeId: true,
});

export const insertCommentSchema = createInsertSchema(comments).pick({
  memeId: true,
  userId: true,
  text: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type UpsertUser = z.infer<typeof upsertUserSchema>;

export type Meme = typeof memes.$inferSelect & {
  // User properties in camelCase for front-end use
  username?: string;
  profileImageUrl?: string;
  avatarSeed?: string;
  avatarStyle?: string;
  
  // Raw DB properties in snake_case for when we fetch directly from database
  profile_image_url?: string;
  avatar_seed?: string;
  avatar_style?: string; 
  user_id?: number;
} & {
  // TypeScript type assertion to allow both property naming conventions
  [key: string]: any;
};
export type InsertMeme = z.infer<typeof insertMemeSchema>;

export type Battle = typeof battles.$inferSelect;
export type InsertBattle = z.infer<typeof insertBattleSchema>;

export type Vote = typeof votes.$inferSelect;
export type InsertVote = z.infer<typeof insertVoteSchema>;

export type Template = typeof templates.$inferSelect;
export type InsertTemplate = z.infer<typeof insertTemplateSchema>;

export type DailyChallenge = typeof dailyChallenges.$inferSelect & {
  participantCount?: number;
};
export type InsertDailyChallenge = z.infer<typeof insertDailyChallengeSchema>;

export type BattleRoyale = typeof battleRoyales.$inferSelect;
export type InsertBattleRoyale = z.infer<typeof insertBattleRoyaleSchema>;

export type Comment = typeof comments.$inferSelect & {
  // User properties in camelCase for front-end use
  username?: string;
  profileImageUrl?: string;
  avatarSeed?: string;
  avatarStyle?: string;
  
  // Raw DB properties in snake_case for database query results
  profile_image_url?: string;
  avatar_seed?: string;
  avatar_style?: string;
  user_id?: number;
} & {
  // TypeScript type assertion to allow both property naming conventions
  [key: string]: any;
};
export type InsertComment = z.infer<typeof insertCommentSchema>;

// Extended types for frontend
export type MemeWithStats = Meme & {
  winRate?: number;
  battlesWon?: number;
  battlesTotal?: number;
};

export type BattleWithMemes = Battle & {
  memeOne: Meme;
  memeTwo: Meme;
};

export type DailyChallengeWithMemes = DailyChallenge & {
  memes: Meme[];
  participantCount: number;
  timeRemaining?: string;
};
