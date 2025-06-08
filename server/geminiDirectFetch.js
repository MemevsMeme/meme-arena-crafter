const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const fetch = require('node-fetch');

/**
 * Generate an image using Gemini 2.0 Flash Preview Image Generation model
 * This implementation uses fetch directly to ensure compatibility
 */
async function generateImage(prompt) {
  if (!process.env.GEMINI_API_KEY) {
    console.error("Missing Gemini API key");
    return "";
  }

  // Create the directory for generated images if needed
  const generatedDir = path.join(process.cwd(), 'client', 'public', 'generated');
  if (!fs.existsSync(generatedDir)) {
    fs.mkdirSync(generatedDir, { recursive: true });
  }

  try {
    console.log(`Generating image with prompt: "${prompt}"`);
    
    // Build the API URL with the API key
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-preview-image-generation:generateContent?key=${process.env.GEMINI_API_KEY}`;
    
    // Prepare the request payload
    const payload = {
      contents: [
        {
          role: "user",
          parts: [
            {
              text: `Create a meme image about: ${prompt}`
            }
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
      body: JSON.stringify(payload)
    });
    
    // Check if the request was successful
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`API error (${response.status}): ${errorText}`);
      return "";
    }
    
    // Parse the response
    const data = await response.json();
    console.log("Got response from Gemini API");
    
    // Check if the response has the expected structure
    if (!data.candidates || 
        !data.candidates[0] || 
        !data.candidates[0].content || 
        !data.candidates[0].content.parts) {
      console.log("Response missing expected structure");
      console.log("Response data:", JSON.stringify(data, null, 2));
      return "";
    }
    
    // Loop through the parts to find image data
    const parts = data.candidates[0].content.parts;
    for (const part of parts) {
      if (part.inlineData && 
          part.inlineData.mimeType && 
          part.inlineData.mimeType.startsWith('image/') &&
          part.inlineData.data) {
        
        // We found an image, save it
        const imageData = Buffer.from(part.inlineData.data, 'base64');
        const fileExt = part.inlineData.mimeType.split('/')[1] || 'jpeg';
        const fileName = `gemini-${crypto.randomBytes(8).toString('hex')}.${fileExt}`;
        const filePath = path.join(generatedDir, fileName);
        
        // Write the file
        fs.writeFileSync(filePath, imageData);
        console.log("Successfully saved generated image:", fileName);
        
        // Return the URL
        return `/generated/${fileName}`;
      }
    }
    
    console.log("No image data found in response");
    return "";
  } catch (error) {
    console.error("Error generating image:", error);
    return "";
  }
}

module.exports = { generateImage };