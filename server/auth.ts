import bcrypt from 'bcryptjs';
import { Request, Response, NextFunction } from 'express';
import { storage } from './storage';
import { loginSchema, registerSchema } from '@shared/schema';
import * as avatars from '@dicebear/avatars';
import * as style from '@dicebear/avatars-avataaars-sprites';

// Session definitions
declare module 'express-session' {
  interface SessionData {
    userId: number;
    username: string;
  }
}

// Generate a Dicebear avatar using a seed
function generateAvatar(seed: string, style: string = 'avataaars', backgroundColor?: string): string {
  // Use Dicebear API URL directly instead of generating SVG locally
  let url = `https://api.dicebear.com/7.x/${style}/svg?seed=${encodeURIComponent(seed)}`;
  
  // Add background color if provided
  if (backgroundColor) {
    if (backgroundColor.startsWith('gradient-')) {
      // For gradients, we need to use the gradientColors parameter
      const gradientColors = 
        backgroundColor === 'gradient-blue' ? ['a0c4ff', '3f83f8'] :
        backgroundColor === 'gradient-pink' ? ['fda4af', 'e11d48'] : 
        backgroundColor === 'gradient-purple' ? ['c084fc', '8b5cf6'] : 
        backgroundColor === 'gradient-orange' ? ['fdba74', 'f97316'] : 
        ['a8a8a8', 'e4e4e4']; // Default fallback
        
      url += `&backgroundType=gradientLinear&backgroundColor=${encodeURIComponent(gradientColors[1])}&backgroundRotation=135&gradientColors[]=${encodeURIComponent(gradientColors[0])}&gradientColors[]=${encodeURIComponent(gradientColors[1])}`;
    } else if (backgroundColor) {
      // For solid colors
      url += `&backgroundColor=${encodeURIComponent(backgroundColor)}`;
    }
  }
  
  return url;
}

// Check if user is authenticated
export const isAuthenticated = (req: Request, res: Response, next: NextFunction) => {
  if (req.session && req.session.userId) {
    return next();
  }
  return res.status(401).json({ message: 'Unauthorized' });
};

// Register a new user
export const register = async (req: Request, res: Response) => {
  try {
    const { confirmPassword, ...userData } = registerSchema.parse(req.body);
    
    // Check if username already exists
    const existingUser = await storage.getUserByUsername(userData.username);
    if (existingUser) {
      return res.status(400).json({ message: 'Username already taken' });
    }
    
    // Check if email already exists
    if (userData.email) {
      const userWithEmail = await storage.getUserByEmail(userData.email);
      if (userWithEmail) {
        return res.status(400).json({ message: 'Email already in use' });
      }
    }
    
    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(userData.password, salt);
    
    // Generate avatar if not provided
    if (!userData.avatarSeed) {
      userData.avatarSeed = userData.username;
    }
    
    if (!userData.profileImageUrl) {
      userData.profileImageUrl = generateAvatar(userData.avatarSeed);
    }
    
    // Create the user
    const user = await storage.createUser({
      ...userData,
      password: hashedPassword
    });
    
    // Remove password from response
    const { password, ...userWithoutPassword } = user;
    
    // Set session
    req.session.userId = user.id;
    req.session.username = user.username;
    
    res.status(201).json(userWithoutPassword);
  } catch (error) {
    console.error('Register error:', error);
    res.status(400).json({ 
      message: 'Registration failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Login a user
export const login = async (req: Request, res: Response) => {
  try {
    const credentials = loginSchema.parse(req.body);
    
    // Find user
    const user = await storage.getUserByUsername(credentials.username);
    
    // If no user or password doesn't match
    if (!user) {
      return res.status(400).json({ message: 'Invalid username or password' });
    }
    
    // Check password
    const isMatch = await bcrypt.compare(credentials.password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid username or password' });
    }
    
    // Set session
    req.session.userId = user.id;
    req.session.username = user.username;
    
    // Remove password from response
    const { password, ...userWithoutPassword } = user;
    
    res.json(userWithoutPassword);
  } catch (error) {
    console.error('Login error:', error);
    res.status(400).json({ 
      message: 'Login failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Logout a user
export const logout = (req: Request, res: Response) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ message: 'Logout failed' });
    }
    res.clearCookie('connect.sid');
    res.json({ message: 'Logged out successfully' });
  });
};

// Get current user
export const getCurrentUser = async (req: Request, res: Response) => {
  try {
    if (!req.session.userId) {
      return res.status(401).json({ message: 'Not authenticated' });
    }
    
    const user = await storage.getUser(req.session.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Remove password from response
    const { password, ...userWithoutPassword } = user;
    
    res.json(userWithoutPassword);
  } catch (error) {
    console.error('Get current user error:', error);
    res.status(500).json({ message: 'Failed to get user' });
  }
};

// Generate a random avatar
export const generateRandomAvatar = async (req: Request, res: Response) => {
  try {
    const { 
      seed = Math.random().toString(36).substring(2, 15),
      style = 'avataaars', 
      backgroundColor 
    } = req.body;
    
    const avatarUrl = generateAvatar(seed, style, backgroundColor);
    
    res.json({ 
      avatarUrl,
      seed,
      style,
      backgroundColor
    });
  } catch (error) {
    console.error('Generate avatar error:', error);
    res.status(500).json({ message: 'Failed to generate avatar' });
  }
};

// Update user profile
export const updateProfile = async (req: Request, res: Response) => {
  try {
    if (!req.session.userId) {
      return res.status(401).json({ message: 'Not authenticated' });
    }
    
    const { username, firstName, lastName, avatarSeed, avatarStyle, avatarBackgroundColor } = req.body;
    
    // Generate avatar if seed is provided
    let profileImageUrl;
    if (avatarSeed) {
      profileImageUrl = generateAvatar(avatarSeed, avatarStyle || 'avataaars', avatarBackgroundColor);
    }
    
    // Update user
    const updatedUser = await storage.updateUser(req.session.userId, {
      ...(username && { username }),
      ...(firstName && { firstName }),
      ...(lastName && { lastName }),
      ...(profileImageUrl && { profileImageUrl }),
      ...(avatarSeed && { avatarSeed }),
      ...(avatarStyle && { avatarStyle }),
      ...(avatarBackgroundColor && { avatarBackgroundColor }),
    });
    
    // Remove password from response
    const { password, ...userWithoutPassword } = updatedUser;
    
    res.json(userWithoutPassword);
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Failed to update profile' });
  }
};