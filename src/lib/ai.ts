
import { Caption } from './types';

// This is a mock implementation for caption generation
// In a real application, this would call an AI service API
export const generateCaption = async (prompt: string, style: string): Promise<string[]> => {
  console.log(`Generating captions for prompt: "${prompt}" with style: ${style}`);
  
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Mock captions based on style
  const captions = {
    funny: [
      `When ${prompt.toLowerCase()} but it actually works`,
      `Nobody:\nAbsolutely nobody:\nMe: ${prompt}`,
      `${prompt}? Story of my life.`
    ],
    dark: [
      `That moment when ${prompt.toLowerCase()} and you lose all hope`,
      `${prompt}? I've seen worse.\nAnd by worse I mean my life choices`,
      `They said ${prompt.toLowerCase()} would be fun. They lied.`
    ],
    wholesome: [
      `${prompt} is what brings us together ❤️`,
      `Finding joy in ${prompt.toLowerCase()} is what life's all about`,
      `When ${prompt.toLowerCase()}, just smile and keep going!`
    ],
    sarcastic: [
      `Oh sure, ${prompt.toLowerCase()}, because THAT always ends well`,
      `${prompt}? Wow, how original...`,
      `"${prompt}" - said no rational person ever`
    ]
  };
  
  // Return captions for the selected style
  return captions[style as keyof typeof captions] || captions.funny;
};

// In a real app, this could call an AI service to enhance or analyze the image
export const analyzeMemeImage = async (imageUrl: string): Promise<string[]> => {
  console.log(`Analyzing image: ${imageUrl}`);
  
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 800));
  
  // Return mock tags
  return ['funny', 'viral', 'trending'];
};

// Rate the quality of a meme based on caption and image
export const rateMeme = async (imageUrl: string, caption: string): Promise<number> => {
  console.log(`Rating meme with caption: "${caption}"`);
  
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Return a random score between 60 and 95
  return 60 + Math.floor(Math.random() * 35);
};
