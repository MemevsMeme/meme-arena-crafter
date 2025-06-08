// Simple implementation for Gemini API to generate images
const fetch = require('node-fetch');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

/**
 * Generate a meme image using the Gemini API
 */
async function generateImage(prompt) {
  console.log(`Attempting to generate image with prompt: "${prompt}"`);
  
  if (!process.env.GEMINI_API_KEY) {
    return { success: false, error: 'Missing API key' };
  }
  
  try {
    // Make sure the generated images directory exists
    const generatedDir = path.join(process.cwd(), 'client', 'public', 'generated');
    if (!fs.existsSync(generatedDir)) {
      fs.mkdirSync(generatedDir, { recursive: true });
    }
    
    // API endpoint for image generation with the specific Gemini model
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-preview-image-generation:generateContent?key=${process.env.GEMINI_API_KEY}`;
    
    // Create the request payload
    const requestBody = {
      contents: [
        {
          role: "user",
          parts: [
            {
              text: `Generate a fun and visual meme image based on this concept: ${prompt}`
            }
          ]
        }
      ]
    };
    
    // Make the request to the Gemini API
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });
    
    // Handle API errors
    if (!response.ok) {
      const errorData = await response.text();
      console.error(`API Error ${response.status}: ${errorData}`);
      return { 
        success: false, 
        error: `API returned status ${response.status}` 
      };
    }
    
    // Parse the response
    const data = await response.json();
    
    // Debug log for response structure
    console.log("Response structure:", {
      hasCandidates: !!data.candidates,
      candidatesCount: data.candidates?.length || 0,
      hasContent: !!data.candidates?.[0]?.content,
      partsCount: data.candidates?.[0]?.content?.parts?.length || 0
    });
    
    // Find the image part in the response
    if (data.candidates && 
        data.candidates[0] && 
        data.candidates[0].content && 
        data.candidates[0].content.parts) {
      
      const parts = data.candidates[0].content.parts;
      
      for (const part of parts) {
        if (part.inlineData && 
            part.inlineData.mimeType && 
            part.inlineData.mimeType.startsWith('image/') && 
            part.inlineData.data) {
          
          // Image found, save it
          const imageData = Buffer.from(part.inlineData.data, 'base64');
          const fileExtension = part.inlineData.mimeType.split('/')[1] || 'jpg';
          const fileName = `gemini-${crypto.randomBytes(6).toString('hex')}.${fileExtension}`;
          const filePath = path.join(generatedDir, fileName);
          
          fs.writeFileSync(filePath, imageData);
          console.log("Successfully saved generated image:", fileName);
          
          return {
            success: true,
            imageUrl: `/generated/${fileName}`
          };
        }
      }
      
      // If we get here, no image was found in the response
      console.log("No image data found in the response");
      return { 
        success: false, 
        error: 'No image data in response' 
      };
    } else {
      console.log("Invalid response structure");
      return { 
        success: false, 
        error: 'Invalid response structure' 
      };
    }
  } catch (error) {
    console.error("Error generating image:", error);
    return { 
      success: false, 
      error: error.message || 'Unknown error'
    };
  }
}

module.exports = { generateImage };