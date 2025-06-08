import path from 'path';
import fs from 'fs';
import { Request, Response } from 'express';
import multer from 'multer';

// Configure storage for uploaded sounds
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadsDir = path.join(__dirname, '../uploads/sounds');
    
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }
    
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    // Generate unique filename - timestamp_originalname
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const extension = path.extname(file.originalname);
    cb(null, `sound-${uniqueSuffix}${extension}`);
  }
});

// Filter for audio files only
const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  if (file.mimetype.startsWith('audio/')) {
    cb(null, true);
  } else {
    cb(new Error('Only audio files are allowed'));
  }
};

// Create the multer upload instance
export const upload = multer({ 
  storage,
  fileFilter,
  limits: { 
    fileSize: 5 * 1024 * 1024 // 5MB max file size
  }
});

// Default sounds for users to select from
export const defaultSounds = [
  {
    id: 'sound-default-1',
    name: 'Drumroll',
    url: '/sounds/default/drumroll.mp3',
    category: 'effects'
  },
  {
    id: 'sound-default-2',
    name: 'Applause',
    url: '/sounds/default/applause.mp3',
    category: 'effects'
  },
  {
    id: 'sound-default-3',
    name: 'Laugh Track',
    url: '/sounds/default/laugh.mp3',
    category: 'effects'
  },
  {
    id: 'sound-default-4',
    name: 'Sad Trombone',
    url: '/sounds/default/trombone.mp3',
    category: 'effects'
  },
  {
    id: 'sound-default-5',
    name: 'Victory Fanfare',
    url: '/sounds/default/victory.mp3',
    category: 'music'
  },
  {
    id: 'sound-default-6',
    name: 'Suspense',
    url: '/sounds/default/suspense.mp3',
    category: 'music'
  }
];

// Upload a new sound
export const uploadSound = async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No audio file provided' });
    }
    
    // Create public URL for the sound
    const soundUrl = `/uploads/sounds/${req.file.filename}`;
    
    // Get the name of the sound (from request body or filename)
    const name = req.body.name || path.parse(req.file.originalname).name;
    
    // Generate a unique ID
    const id = `sound-${Date.now()}`;
    
    // Return the sound data
    res.status(201).json({
      id,
      name,
      url: soundUrl,
      category: 'custom',
      uploadedAt: new Date()
    });
  } catch (error) {
    console.error('Error uploading sound:', error);
    res.status(500).json({ message: 'Failed to upload sound' });
  }
};

// Get all available sounds (default + user uploaded)
export const getAllSounds = async (req: Request, res: Response) => {
  try {
    // This is a simplified implementation
    // In a real app, you would fetch user's custom sounds from the database
    
    // Return default sounds for now
    res.status(200).json(defaultSounds);
  } catch (error) {
    console.error('Error fetching sounds:', error);
    res.status(500).json({ message: 'Failed to fetch sounds' });
  }
};

// Delete a user's custom sound
export const deleteSound = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    // Don't allow deleting default sounds
    if (id.startsWith('sound-default')) {
      return res.status(403).json({ message: 'Cannot delete default sounds' });
    }
    
    // In a real app, you would first fetch the sound from the database
    // Then delete the file and the database record
    
    res.status(200).json({ message: 'Sound deleted successfully' });
  } catch (error) {
    console.error('Error deleting sound:', error);
    res.status(500).json({ message: 'Failed to delete sound' });
  }
};