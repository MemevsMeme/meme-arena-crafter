const { GoogleGenerativeAI } = require('@google/generative-ai');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// Initialize the Google Generative AI client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * Generate a meme image using Gemini
 * 
 * @param {string} prompt - The prompt to generate the image from
 * @returns {Promise<string>} - The URL of the generated image or empty string if failed
 */
async function generateMemeImage(prompt) {
  console.log(`Attempting to generate meme image with Gemini for prompt: "${prompt}"`);
  
  if (!process.env.GEMINI_API_KEY) {
    console.error("No Gemini API key available");
    return "";
  }
  
  // Create the directory for generated images if it doesn't exist
  const generatedDir = path.join(process.cwd(), 'client', 'public', 'generated');
  if (!fs.existsSync(generatedDir)) {
    fs.mkdirSync(generatedDir, { recursive: true });
  }
  
  try {
    // Get the model for image generation
    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash-preview-image-generation",
    });
    
    console.log("Using model:", "gemini-2.0-flash-preview-image-generation");
    
    // Create a simple prompt for image generation
    const result = await model.generateContent(prompt);
    const response = await result.response;
    
    console.log("Response received from Gemini API");
    
    // Log the structure of the response for debugging
    console.log("Response structure:", JSON.stringify({
      hasCandidates: !!response.candidates,
      candidatesLength: response.candidates?.length || 0,
      firstCandidateHasContent: !!response.candidates?.[0]?.content,
      partsLength: response.candidates?.[0]?.content?.parts?.length || 0
    }));
    
    // Extract image from response if present
    const candidates = response.candidates || [];
    if (candidates.length > 0 && candidates[0].content && candidates[0].content.parts) {
      const parts = candidates[0].content.parts;
      
      for (const part of parts) {
        if (part.inlineData && part.inlineData.mimeType && 
            part.inlineData.mimeType.startsWith('image/') && 
            part.inlineData.data) {
          
          // We found image data, save it
          const imageBuffer = Buffer.from(part.inlineData.data, 'base64');
          const fileExt = part.inlineData.mimeType.split('/')[1] || 'jpeg';
          const fileName = `gemini-${crypto.randomBytes(8).toString('hex')}.${fileExt}`;
          const filePath = path.join(generatedDir, fileName);
          
          fs.writeFileSync(filePath, imageBuffer);
          console.log("Successfully saved generated image:", fileName);
          
          return `/generated/${fileName}`;
        }
      }
    }
    
    console.error("No image data found in the response");
    return "";
  } catch (error) {
    console.error("Error generating image with Gemini:", error);
    return "";
  }
}

module.exports = { generateMemeImage };