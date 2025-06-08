// TypeScript implementation for Gemini image generation
import fetch from 'node-fetch';
import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';

/**
 * Generate a meme image using Gemini 2.0
 */
export async function generateMemeImage(prompt: string): Promise<{
  success: boolean;
  imageUrl?: string;
  error?: string;
}> {
  console.log(`Generating meme image with prompt: "${prompt}"`);
  
  if (!process.env.GEMINI_API_KEY) {
    console.error('Missing Gemini API key');
    return { success: false, error: 'API key is required' };
  }
  
  // Set up directory for saving generated images
  const generatedDir = path.join(process.cwd(), 'client', 'public', 'generated');
  if (!fs.existsSync(generatedDir)) {
    fs.mkdirSync(generatedDir, { recursive: true });
  }
  
  try {
    // Set up API URL with key
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-preview-image-generation:generateContent?key=${process.env.GEMINI_API_KEY}`;
    
    // Create the request payload
    const requestData = {
      contents: [
        {
          role: 'user',
          parts: [
            { text: `Generate a meme image about: ${prompt}` }
          ]
        }
      ]
    };
    
    // Make the API request
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestData)
    });
    
    // Handle API errors
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`API Error (${response.status}): ${errorText}`);
      return { 
        success: false, 
        error: `API returned status ${response.status}`
      };
    }
    
    // Parse the response
    const data = await response.json() as any;
    
    // Log response structure for debugging
    console.log('Response structure:', {
      hasCandidates: !!data.candidates,
      candidatesCount: data.candidates?.length || 0,
      hasContent: !!data.candidates?.[0]?.content,
      partsCount: data.candidates?.[0]?.content?.parts?.length || 0
    });
    
    // Extract image data if present
    if (data.candidates?.[0]?.content?.parts) {
      const parts = data.candidates[0].content.parts;
      
      // Debug log the parts structure
      console.log('Response parts:', parts.map((p: any) => ({
        type: p.text ? 'text' : (p.inlineData ? 'image' : 'unknown'),
        hasInlineData: !!p.inlineData,
        mimeType: p.inlineData?.mimeType || null
      })));
      
      // Find an image part in the response
      for (const part of parts) {
        if (part.inlineData?.mimeType?.startsWith('image/') && part.inlineData?.data) {
          // Found an image, save it
          const imageData = Buffer.from(part.inlineData.data, 'base64');
          const fileExt = part.inlineData.mimeType.split('/')[1] || 'jpeg';
          const fileName = `gemini-${crypto.randomBytes(6).toString('hex')}.${fileExt}`;
          const filePath = path.join(generatedDir, fileName);
          
          fs.writeFileSync(filePath, imageData);
          console.log('Successfully saved generated image:', fileName);
          
          return {
            success: true, 
            imageUrl: `/generated/${fileName}`
          };
        }
      }
      
      console.log('No image data found in the response');
    }
    
    return { 
      success: false, 
      error: 'Could not generate image'
    };
  } catch (error: any) {
    console.error('Error generating image:', error);
    return { 
      success: false, 
      error: error.message || 'Unknown error'
    };
  }
}