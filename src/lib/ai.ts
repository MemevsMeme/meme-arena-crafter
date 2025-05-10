
import { supabase } from '@/integrations/supabase/client';
import { Caption } from './types';

export const generateCaption = async (prompt: string, style: string): Promise<string[]> => {
  console.log(`Generating captions for prompt: "${prompt}" with style: ${style}`);
  
  try {
    const { data, error } = await supabase.functions.invoke('gemini-ai', {
      body: {
        type: 'text',
        prompt,
        style
      }
    });

    if (error) {
      console.error('Error generating captions:', error);
      throw error;
    }

    if (data && data.captions && Array.isArray(data.captions)) {
      return data.captions;
    }
    
    // Fallback captions if we don't get expected data format
    return [
      `When ${prompt.toLowerCase()} but it actually works`,
      `Nobody:\nAbsolutely nobody:\nMe: ${prompt}`,
      `${prompt}? Story of my life.`
    ];
  } catch (error) {
    console.error('Error in generateCaption:', error);
    
    // Fallback captions in case of error
    return [
      `When ${prompt.toLowerCase()} but it actually works`,
      `Nobody:\nAbsolutely nobody:\nMe: ${prompt}`,
      `${prompt}? Story of my life.`
    ];
  }
};

// Added new function to generate AI images
export const generateMemeImage = async (prompt: string, style: string = 'meme'): Promise<string | null> => {
  console.log(`Generating AI image for prompt: "${prompt}" with style: ${style}`);
  
  try {
    const { data, error } = await supabase.functions.invoke('gemini-ai', {
      body: {
        type: 'generate-image',
        prompt,
        style
      }
    });

    if (error) {
      console.error('Error generating image:', error);
      throw error;
    }

    if (data && data.imageData) {
      return data.imageData; // This will be a base64 data URL
    }
    
    return null;
  } catch (error) {
    console.error('Error in generateMemeImage:', error);
    return null;
  }
};

// Updated to use Gemini Vision API
export const analyzeMemeImage = async (imageUrl: string): Promise<string[]> => {
  console.log(`Analyzing image: ${imageUrl}`);
  
  try {
    const { data, error } = await supabase.functions.invoke('gemini-ai', {
      body: {
        type: 'image',
        imageUrl
      }
    });

    if (error) {
      console.error('Error analyzing image:', error);
      throw error;
    }

    if (data && data.tags && Array.isArray(data.tags)) {
      return data.tags;
    }
    
    // Fallback tags if we don't get expected data format
    return ['funny', 'viral', 'trending'];
  } catch (error) {
    console.error('Error in analyzeMemeImage:', error);
    
    // Fallback tags in case of error
    return ['funny', 'viral', 'trending'];
  }
};

// Add support for checking if a file is an animated GIF
export const isAnimatedGif = (file: File): Promise<boolean> => {
  return new Promise((resolve) => {
    // Create a new FileReader
    const reader = new FileReader();
    
    reader.onload = (event) => {
      // Convert to array buffer
      const buffer = event.target?.result;
      if (buffer && buffer instanceof ArrayBuffer) {
        // Check for GIF header (GIF89a or GIF87a)
        const header = new Uint8Array(buffer, 0, 6);
        const isGif = header[0] === 0x47 && header[1] === 0x49 && header[2] === 0x46; // "GIF"
        
        if (!isGif) {
          resolve(false);
          return;
        }
        
        // Check for animation by looking for Graphics Control Extension
        // An animated GIF contains multiple frames and usually has this extension
        try {
          const view = new Uint8Array(buffer);
          // Look for Graphics Control Extension (0x21, 0xF9)
          for (let i = 0; i < view.length - 1; i++) {
            if (view[i] === 0x21 && view[i + 1] === 0xF9) {
              resolve(true);
              return;
            }
          }
          resolve(false);
        } catch (e) {
          console.error('Error analyzing GIF:', e);
          resolve(false);
        }
      } else {
        resolve(false);
      }
    };
    
    reader.onerror = () => {
      console.error('Error reading file');
      resolve(false);
    };
    
    // Read the first few kilobytes - enough to detect animation
    reader.readAsArrayBuffer(file.slice(0, 30000));
  });
};

// Rate the quality of a meme based on caption and image
export const rateMeme = async (imageUrl: string, caption: string): Promise<number> => {
  console.log(`Rating meme with caption: "${caption}"`);
  
  // For now, we'll keep the mock implementation as rating is less critical
  // and helps preserve API usage
  
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Return a random score between 60 and 95
  return 60 + Math.floor(Math.random() * 35);
};
