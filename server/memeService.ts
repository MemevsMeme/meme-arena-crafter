import { storage } from "./storage";
import { GoogleGenerativeAI } from "@google/generative-ai";
import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';

class MemeService {
  private genAI: GoogleGenerativeAI | null = null;
  private placeholders = [
    "https://i.imgflip.com/65tesb.jpg",
    "https://i.imgflip.com/56q38k.jpg",
    "https://i.imgflip.com/4fh0ct.jpg",
    "https://i.imgflip.com/29v4rt.jpg",
    "https://i.imgflip.com/30b1gx.jpg",
    "https://i.imgflip.com/24y43o.jpg",
    "https://i.imgflip.com/1jwhww.jpg",
    "https://i.imgflip.com/2kbn1e.jpg"
  ];
  
  constructor() {
    if (process.env.GEMINI_API_KEY) {
      this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
      console.log("Gemini API initialized");
    }
  }
  
  /**
   * Generate an AI image based on the given prompt
   * Uses gemini-2.0-flash-preview-image-generation model specifically designed for image generation
   * @param prompt User prompt text for generating an image
   * @returns URL of the generated image
   */
  async generateMemeImage(prompt: string): Promise<string> {
    console.log("Generating AI image for prompt:", prompt);
    
    if (!process.env.GEMINI_API_KEY || !this.genAI) {
      console.log("No Gemini API key available, using fallback");
      return this.getRandomPlaceholderImage();
    }
    
    try {
      // Use the correct model for image generation
      const model = this.genAI.getGenerativeModel({ 
        model: "gemini-2.0-flash-preview-image-generation"
      });
      
      // Format the prompt for image generation - emphasize we want an IMAGE output
      const imagePrompt = `Generate a fun meme IMAGE based on this concept: "${prompt}"
      I need you to create a VISUAL IMAGE, not just text.
      The image should be humorous, visually engaging and suitable for general audiences.
      This needs to be an actual generated IMAGE, not text describing an image.
      Output an image that would make a great meme.`;
      
      // For this specific model, we need to handle it differently
      // The model requires a specific structure for the request
      const result = await model.generateContent({
        contents: [{
          role: "user",
          parts: [{ text: imagePrompt }]
        }]
      });
      const response = await result.response;
      
      // Check if we got parts in the response
      if (!response.candidates || 
          !response.candidates[0] || 
          !response.candidates[0].content || 
          !response.candidates[0].content.parts) {
        console.log("No parts in response, using fallback");
        return this.getRandomPlaceholderImage();
      }
      
      // Find the image part in the response
      const parts = response.candidates[0].content.parts;
      let imagePart = null;
      
      for (const part of parts) {
        if (part.inlineData && part.inlineData.mimeType && 
            part.inlineData.mimeType.startsWith('image/')) {
          imagePart = part;
          break;
        }
      }
      
      // If we found an image part, save it
      if (imagePart && imagePart.inlineData && imagePart.inlineData.data) {
        // Save the image
        const imageData = Buffer.from(imagePart.inlineData.data, 'base64');
        const fileExt = imagePart.inlineData.mimeType.split('/')[1] || 'jpeg';
        const fileName = `meme-${crypto.randomBytes(8).toString('hex')}.${fileExt}`;
        const filePath = path.join(process.cwd(), 'client', 'public', 'generated', fileName);
        
        // Ensure directory exists
        const dir = path.dirname(filePath);
        if (!fs.existsSync(dir)) {
          fs.mkdirSync(dir, { recursive: true });
        }
        
        // Write file
        fs.writeFileSync(filePath, imageData);
        console.log("Successfully generated and saved image:", fileName);
        return `/generated/${fileName}`;
      } else {
        console.log("No image data found in response, using fallback");
        return this.getRandomPlaceholderImage();
      }
    } catch (error) {
      console.error("Error generating image with Gemini:", error);
      return this.getRandomPlaceholderImage();
    }
  }
  
  /**
   * Generate AI text suggestions for a meme
   * This method only generates text suggestions, not images
   * @param prompt User prompt text for the meme
   * @returns AI-generated text suggestion
   */
  async generateAIText(prompt: string): Promise<string> {
    console.log("Generating AI text for prompt:", prompt);
    
    // Check if we can generate AI text
    if (!process.env.GEMINI_API_KEY || !this.genAI) {
      console.log("No Gemini API key available, cannot generate AI text");
      return "";
    }
    
    try {
      // Use gemini-1.5-flash for text generation (more reliable for this purpose)
      const model = this.genAI.getGenerativeModel({ 
        model: "gemini-1.5-flash",
      });
      
      // Create the prompt for text generation
      const memePrompt = `
      Create a funny meme based on this prompt: "${prompt}"
      
      Give me:
      1. A short top text (1-5 words)
      2. A punchy bottom text (1-7 words)
      
      Format your response as two lines of text only, separated by a newline.
      Don't add any explanations or formatting.
      `;
      
      // Generate content
      const result = await model.generateContent({
        contents: [{
          role: "user",
          parts: [{text: memePrompt}]
        }],
        generationConfig: {
          temperature: 0.9,
          topP: 0.95,
          topK: 32,
          responseMimeType: "text/plain",
        }
      });
      
      const response = await result.response;
      const aiText = response.text();
      
      console.log("AI text response:", aiText);
      return aiText;
    } catch (error) {
      console.error("Error generating AI text:", error);
      return "";
    }
  }
  
  /**
   * Get a random placeholder image for a meme
   * @returns URL to a random meme template
   */
  getRandomPlaceholderImage(): string {
    const randomIndex = Math.floor(Math.random() * this.placeholders.length);
    return this.placeholders[randomIndex];
  }
  
  /**
   * Seed demo memes for initial app state
   */
  async seedDemoMemes() {
    const demoMemes = [
      {
        promptText: "When the boss says we need to work this weekend",
        imageUrl: "https://i.imgflip.com/65tesb.jpg",
        userId: "1",
        views: 1200,
        likes: 342
      },
      {
        promptText: "When they ask if you know how to fix the printer",
        imageUrl: "https://i.imgflip.com/56q38k.jpg",
        userId: "1",
        views: 987,
        likes: 256
      },
      {
        promptText: "When someone actually uses your code in production",
        imageUrl: "https://i.imgflip.com/4fh0ct.jpg",
        userId: "1",
        views: 854,
        likes: 128
      },
      {
        promptText: "Me looking at new frameworks while my current project isn't finished",
        imageUrl: "https://i.imgflip.com/29v4rt.jpg",
        userId: "1",
        views: 562,
        likes: 98
      }
    ];
    
    // Check if we already have memes in the system
    const existingMemes = await storage.getAllMemes();
    if (existingMemes.length > 0) {
      return;
    }
    
    // Create the memes
    for (const meme of demoMemes) {
      // Create the meme
      const createdMeme = await storage.createMeme({
        promptText: meme.promptText,
        imageUrl: meme.imageUrl,
        userId: meme.userId
      });
      
      // Update views and likes
      await storage.updateMemeViews(createdMeme.id, meme.views);
      await storage.updateMemeLikes(createdMeme.id, meme.likes);
    }
    
    console.log("Demo memes seeded successfully");
  }
}

export const memeService = new MemeService();