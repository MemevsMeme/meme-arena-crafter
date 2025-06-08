import { GoogleGenerativeAI } from '@google/generative-ai';
import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';

/**
 * This is a specialized utility for generating images with Gemini 2.0 flash preview
 * It uses a simplified approach focused on getting the image generation working correctly
 */
export async function generateImage(prompt: string): Promise<string> {
  // Early return if no API key
  if (!process.env.GEMINI_API_KEY) {
    console.log("No Gemini API key available, cannot generate image");
    return "";
  }

  try {
    // Initialize the API
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    
    // Get specific model for image generation
    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash-preview-image-generation"
    });
    
    // Simple prompt focused purely on the content
    const imagePrompt = `Create a funny meme about: ${prompt}`;
    
    console.log("Sending image generation request for prompt:", prompt);
    
    // Generate the content with the specific model
    // Using simplified approach that lets the model determine how to respond
    const result = await model.generateContent(imagePrompt);
    
    // Process the response
    const response = await result.response;
    console.log("Got response from API");
    
    // Check if we have a proper response with content
    if (!response.candidates || 
        !response.candidates[0] || 
        !response.candidates[0].content || 
        !response.candidates[0].content.parts) {
      console.log("No valid content in response");
      return "";
    }
    
    // Look through all parts to find image data
    const parts = response.candidates[0].content.parts;
    for (const part of parts) {
      // Check if this part contains image data
      if (part.inlineData && 
          part.inlineData.mimeType && 
          part.inlineData.mimeType.startsWith('image/') &&
          part.inlineData.data) {
        
        // We found image data, save it
        const imageData = Buffer.from(part.inlineData.data, 'base64');
        const fileExt = part.inlineData.mimeType.split('/')[1] || 'jpeg';
        const fileName = `gemini-${crypto.randomBytes(8).toString('hex')}.${fileExt}`;
        
        // Ensure the directory exists
        const generatedDir = path.join(process.cwd(), 'client', 'public', 'generated');
        if (!fs.existsSync(generatedDir)) {
          fs.mkdirSync(generatedDir, { recursive: true });
        }
        
        // Save the file
        const filePath = path.join(generatedDir, fileName);
        fs.writeFileSync(filePath, imageData);
        
        console.log("Successfully saved generated image:", fileName);
        return `/generated/${fileName}`;
      }
    }
    
    // If we got here, we didn't find any image data
    console.log("No image data found in the response");
    return "";
    
  } catch (error) {
    console.error("Error generating image with Gemini:", error);
    return "";
  }
}