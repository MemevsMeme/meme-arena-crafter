import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';
import * as https from 'https';
import { URL } from 'url';

/**
 * Utility for generating images via Gemini REST API
 * This allows more control over the specific API parameters
 */
export async function generateImageViaRest(prompt: string): Promise<string> {
  // Make sure we have an API key
  if (!process.env.GEMINI_API_KEY) {
    console.error("Missing Gemini API key");
    return "";
  }

  // Create directory for saving generated images if it doesn't exist
  const generatedDir = path.join(process.cwd(), 'client', 'public', 'generated');
  if (!fs.existsSync(generatedDir)) {
    fs.mkdirSync(generatedDir, { recursive: true });
  }

  try {
    // Create a filename for the generated image
    const fileName = `gemini-${crypto.randomBytes(4).toString('hex')}.jpg`;
    const filePath = path.join(generatedDir, fileName);
    
    // Prepare the request payload
    const payload = {
      contents: [{
        role: "user",
        parts: [{ text: `Create a funny meme about: ${prompt}` }]
      }],
      generation_config: {
        temperature: 0.8,
        top_p: 0.9,
        top_k: 32
      }
    };
    
    // Specify API endpoint for the correct model
    const apiUrl = new URL('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-preview-image-generation:generateContent');
    
    // Add API key as query parameter
    apiUrl.searchParams.append('key', process.env.GEMINI_API_KEY);
    
    console.log(`Sending image generation request to Gemini API for prompt: "${prompt}"`);
    
    // Make the request to the Gemini API
    const response = await makeHttpRequest(apiUrl, payload);
    
    // Process the response
    if (response && 
        response.candidates && 
        response.candidates[0] && 
        response.candidates[0].content && 
        response.candidates[0].content.parts) {
      
      // Find the image part
      const parts = response.candidates[0].content.parts;
      
      for (const part of parts) {
        if (part.inlineData && part.inlineData.mimeType && part.inlineData.mimeType.startsWith('image/')) {
          // We found an image, save it
          const imageData = Buffer.from(part.inlineData.data, 'base64');
          fs.writeFileSync(filePath, imageData);
          console.log("Successfully saved generated image:", fileName);
          return `/generated/${fileName}`;
        }
      }
      
      console.log("Response did not contain image data");
    } else {
      console.log("Invalid response structure");
    }
    
    return "";
  } catch (error) {
    console.error("Error generating image with Gemini REST API:", error);
    return "";
  }
}

/**
 * Helper function to make HTTP requests
 */
function makeHttpRequest(url: URL, data: any): Promise<any> {
  return new Promise((resolve, reject) => {
    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      }
    };
    
    const req = https.request(url, options, (res) => {
      let responseData = '';
      
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) {
          try {
            const parsedData = JSON.parse(responseData);
            resolve(parsedData);
          } catch (error) {
            reject(new Error(`Failed to parse response: ${error.message}`));
          }
        } else {
          console.error(`API Error - Status: ${res.statusCode}, Response: ${responseData}`);
          reject(new Error(`API error: ${res.statusCode} - ${responseData}`));
        }
      });
    });
    
    req.on('error', (error) => {
      reject(error);
    });
    
    req.write(JSON.stringify(data));
    req.end();
  });
}