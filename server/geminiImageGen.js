const fetch = require('node-fetch');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

/**
 * Generate an image using Gemini 2.0 Flash Preview Image Generation
 * Based on the GitHub example provided
 */
async function generateMemeImage(prompt) {
  if (!process.env.GEMINI_API_KEY) {
    console.error('Missing Gemini API key');
    return { success: false, message: 'Missing API key' };
  }
  
  try {
    // Prepare directory for saving generated images
    const generatedDir = path.join(process.cwd(), 'client', 'public', 'generated');
    if (!fs.existsSync(generatedDir)) {
      fs.mkdirSync(generatedDir, { recursive: true });
    }
    
    console.log(`Sending request to generate image for: "${prompt}"`);
    
    // Use the specific model for image generation
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-preview-image-generation:generateContent?key=${process.env.GEMINI_API_KEY}`;
    
    // Format payload exactly as required by the API
    const payload = {
      contents: [
        {
          role: "user",
          parts: [
            {
              text: prompt
            }
          ]
        }
      ]
    };
    
    // Make the API request
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Gemini API error: ${response.status} ${response.statusText} - ${errorText}`);
      return { 
        success: false, 
        message: `API error: ${response.status} ${response.statusText}` 
      };
    }
    
    // Parse the response
    const data = await response.json();
    
    // Debug log the response structure
    console.log('Response structure:', JSON.stringify({
      hasCandidates: !!data.candidates,
      candidatesLength: data.candidates?.length || 0,
      firstCandidateHasContent: !!data.candidates?.[0]?.content,
      partsCount: data.candidates?.[0]?.content?.parts?.length || 0
    }));
    
    // Extract and save image data if present
    if (data.candidates?.[0]?.content?.parts) {
      const parts = data.candidates[0].content.parts;
      
      for (const part of parts) {
        if (part.inlineData?.mimeType?.startsWith('image/') && part.inlineData?.data) {
          // Found an image, save it
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
    }
    
    console.log('No image data found in the response');
    return { 
      success: false, 
      message: 'No image data received from API' 
    };
    
  } catch (error) {
    console.error('Error generating image:', error);
    return { 
      success: false, 
      message: `Error generating image: ${error.message}` 
    };
  }
}

module.exports = { generateMemeImage };