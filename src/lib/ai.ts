
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
      // Return fallback captions if there's an error
      return [
        `When ${prompt ? prompt.toLowerCase() : 'trying'} but it actually works`,
        `Nobody:\nAbsolutely nobody:\nMe: ${prompt || 'doing meme stuff'}`,
        `${prompt || 'This meme'}? Story of my life.`
      ];
    }

    if (data && data.captions && Array.isArray(data.captions)) {
      return data.captions;
    }
    
    // Fallback captions if we don't get expected data format
    return [
      `When ${prompt ? prompt.toLowerCase() : 'trying'} but it actually works`,
      `Nobody:\nAbsolutely nobody:\nMe: ${prompt || 'doing meme stuff'}`,
      `${prompt || 'This meme'}? Story of my life.`
    ];
  } catch (error) {
    console.error('Error in generateCaption:', error);
    
    // Fallback captions in case of error
    return [
      `When ${prompt ? prompt.toLowerCase() : 'trying'} but it actually works`,
      `Nobody:\nAbsolutely nobody:\nMe: ${prompt || 'doing meme stuff'}`,
      `${prompt || 'This meme'}? Story of my life.`
    ];
  }
};

export const generateMemeImage = async (prompt: string, style: string = 'meme'): Promise<string | null> => {
  console.log(`Generating AI image for prompt: "${prompt}" with style: ${style}`);
  
  try {
    // Call the Supabase function for image generation
    const { data, error } = await supabase.functions.invoke('gemini-ai', {
      body: {
        type: 'generate-image',
        prompt,
        style
      }
    });

    if (error) {
      console.error('Supabase function error:', error);
      throw error;
    }

    if (data && data.imageData) {
      console.log('Image data received successfully. Data starts with:', 
        data.imageData.substring(0, 50) + '...');
      return data.imageData; // This will be a base64 data URL
    } else {
      console.error('No image data received from API');
      // Generate a placeholder image
      return generatePlaceholderImage(prompt);
    }
  } catch (error) {
    console.error('Error in generateMemeImage:', error);
    // Return a placeholder image on error
    return generatePlaceholderImage(prompt);
  }
};

// Function to generate a placeholder image with text
const generatePlaceholderImage = (text: string): string => {
  const svg = `
  <svg xmlns="http://www.w3.org/2000/svg" width="500" height="500">
    <rect width="500" height="500" fill="#f0f0f0"/>
    <text x="50%" y="50%" font-family="Arial, sans-serif" font-size="20px" text-anchor="middle" dominant-baseline="middle" fill="#666">
      Placeholder for: ${text || 'Meme'}
    </text>
    <text x="50%" y="60%" font-family="Arial, sans-serif" font-size="16px" text-anchor="middle" dominant-baseline="middle" fill="#666">
      (Image generation unavailable)
    </text>
  </svg>
  `;
  
  return `data:image/svg+xml;base64,${btoa(svg)}`;
};

// Function to analyze meme images using Gemini 2.0 Pro Vision
export const analyzeMemeImage = async (imageUrl: string): Promise<string[]> => {
  if (!imageUrl) {
    console.error('No image URL provided');
    return ['funny', 'viral', 'trending']; // Default tags
  }
  
  console.log(`Analyzing image: ${imageUrl}`);
  
  try {
    // First attempt with real API
    try {
      const { data, error } = await supabase.functions.invoke('gemini-ai', {
        body: {
          type: 'image',
          imageUrl
        }
      });
  
      if (!error && data && data.tags && Array.isArray(data.tags)) {
        return data.tags;
      }
    } catch (functionError) {
      console.error('Function error in analyzeMemeImage:', functionError);
      // Continue to fallback
    }
    
    // Fallback tags if we don't get expected data format
    const fallbackTags = ['funny', 'viral', 'trending'];
    return fallbackTags;
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
