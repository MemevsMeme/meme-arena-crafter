import { GoogleGenerativeAI } from '@google/generative-ai';
import fetch from 'node-fetch';
import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';

// Initialize the API client 
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

/**
 * Generate an optimized prompt for better meme image creation
 */
export async function generateOptimizedPrompt(userPrompt: string, style: string = 'photo'): Promise<string> {
  if (!process.env.GEMINI_API_KEY) {
    console.error('Missing Gemini API key');
    return userPrompt;
  }
  
  try {
    // Use Gemini model for text generation to enhance the prompt
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    
    // Tell Gemini specifically what we need
    const promptEnhancementRequest = `
    I need to create a visually engaging and funny meme image, and I need your help crafting the perfect image prompt.
    
    Here's the user's original idea: "${userPrompt}"
    
    Please create an enhanced, detailed image generation prompt that will produce a high-quality, amusing meme image in ${style} style.
    
    Your prompt should:
    - Include detailed visual elements and specific objects
    - Describe expressions, poses, and emotions if people are involved
    - Mention composition, lighting, and visual style
    - Keep the spirit of the original concept
    - Be suitable for a meme (humorous content)
    - Not include text overlay (that will be added separately)
    
    Write ONLY the improved prompt text with no other explanations.
    `;
    
    const result = await model.generateContent(promptEnhancementRequest);
    const response = await result.response;
    const enhancedPrompt = response.text().trim();
    
    console.log('Original prompt:', userPrompt);
    console.log('Enhanced prompt:', enhancedPrompt);
    
    return enhancedPrompt || userPrompt; // Fallback to original if empty
  } catch (error) {
    console.error('Error generating optimized prompt:', error);
    return userPrompt; // Return original prompt if there's an error
  }
}

/**
 * Generate a meme image using Gemini 2.0 Flash Preview Image Generation model
 * This version uses a two-step process: optimize prompt then generate image
 */
export async function generateMemeImage(prompt: string): Promise<{
  success: boolean;
  imageUrl?: string;
  error?: string;
}> {
  if (!process.env.GEMINI_API_KEY) {
    console.error('Missing Gemini API key');
    return { success: false, error: 'Gemini API key is required' };
  }

  // Create directory for saving generated images
  const generatedDir = path.join(process.cwd(), 'client', 'public', 'generated');
  if (!fs.existsSync(generatedDir)) {
    fs.mkdirSync(generatedDir, { recursive: true });
  }

  try {
    // Step 1: Get an optimized prompt from Gemini
    // Extract style from prompt if it contains "in X style" or use default photo style
    let style = 'photo';
    const styleMatch = prompt.match(/in\s+(\w+)\s+style/i);
    if (styleMatch && styleMatch[1]) {
      style = styleMatch[1].toLowerCase();
    }
    
    // Generate an optimized prompt
    console.log(`Generating optimized prompt for: "${prompt}"`);
    const optimizedPrompt = await generateOptimizedPrompt(prompt, style);
    
    // Step 2: Use the optimized prompt to generate the image
    // Direct API call using fetch for maximum control
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-preview-image-generation:generateContent?key=${process.env.GEMINI_API_KEY}`;
    
    // Format the request exactly as required by API documentation
    // Include the specific responseModalities setting as TEXT and IMAGE
    const requestData = {
      contents: [{
        role: 'user',
        parts: [{
          text: optimizedPrompt
        }]
      }],
      generationConfig: {
        responseModalities: ["TEXT", "IMAGE"]
      }
    };
    
    console.log(`Sending image generation request using optimized prompt`);
    console.log(`Original: "${prompt}"`);
    console.log(`Optimized: "${optimizedPrompt}"`);
    
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestData)
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`API Error (${response.status}): ${errorText}`);
      return { 
        success: false, 
        error: `Gemini API returned status ${response.status}`
      };
    }
    
    const data = await response.json() as any;
    console.log('Received response from Gemini API');
    
    // Debug log the response structure
    console.log('Response structure:', {
      hasCandidates: !!data.candidates,
      candidateCount: data.candidates?.length,
      hasContent: !!data.candidates?.[0]?.content,
      partCount: data.candidates?.[0]?.content?.parts?.length
    });
    
    // Check if we have parts with image data
    const parts = data.candidates?.[0]?.content?.parts || [];
    console.log('Part types:', parts.map((p: any) => ({ 
      type: p.inlineData ? 'image' : (p.text ? 'text' : 'unknown'),
      hasMimeType: !!p.inlineData?.mimeType
    })));
    
    // Find image part
    for (const part of parts) {
      if (part.inlineData && 
          part.inlineData.mimeType && 
          part.inlineData.mimeType.startsWith('image/') && 
          part.inlineData.data) {
        
        // Found image data, save it
        const imageData = Buffer.from(part.inlineData.data, 'base64');
        const fileExtension = part.inlineData.mimeType.split('/')[1] || 'jpeg';
        const fileName = `meme-${crypto.randomBytes(6).toString('hex')}.${fileExtension}`;
        const filePath = path.join(generatedDir, fileName);
        
        fs.writeFileSync(filePath, imageData);
        console.log('Successfully saved image:', fileName);
        
        return {
          success: true,
          imageUrl: `/generated/${fileName}`
        };
      }
    }
    
    // If we get here, no image was found
    console.log('No image data found in response');
    return {
      success: false,
      error: 'No image data returned from Gemini API'
    };
  } catch (error: any) {
    console.error('Error generating image:', error);
    return {
      success: false,
      error: error.message || 'Unknown error occurred'
    };
  }
}

/**
 * Generate text for a meme using Gemini
 */
export async function generateMemeText(prompt: string): Promise<string> {
  if (!process.env.GEMINI_API_KEY) {
    console.error('Missing Gemini API key');
    return '';
  }
  
  try {
    // Use Gemini 1.5 Flash for text generation
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    
    const textPrompt = `
    Create a funny meme caption based on this prompt: "${prompt}"
    
    Give me:
    1. A short top text (1-5 words)
    2. A punchy bottom text (1-7 words)
    
    Format your response as two lines of text only, separated by a newline.
    Don't add any explanations or formatting.
    `;
    
    const result = await model.generateContent(textPrompt);
    const response = await result.response;
    const text = response.text();
    
    console.log('Generated meme text:', text);
    return text;
  } catch (error) {
    console.error('Error generating meme text:', error);
    return '';
  }
}