require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');
const fetch = require('node-fetch');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// Create directory for saving generated images
const generatedDir = path.join(process.cwd(), 'client', 'public', 'generated');
if (!fs.existsSync(generatedDir)) {
  fs.mkdirSync(generatedDir, { recursive: true });
}

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

async function generateOptimizedPrompt(userPrompt, style = 'photo') {
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

async function generateMemeImage(prompt) {
  try {
    // Step 1: Get an optimized prompt from Gemini
    let style = 'photo';
    const styleMatch = prompt.match(/in\s+(\w+)\s+style/i);
    if (styleMatch && styleMatch[1]) {
      style = styleMatch[1].toLowerCase();
    }
    
    // Generate an optimized prompt
    console.log(`Generating optimized prompt for: "${prompt}"`);
    const optimizedPrompt = await generateOptimizedPrompt(prompt, style);
    
    // Step 2: Use the optimized prompt to generate the image
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-preview-image-generation:generateContent?key=${process.env.GEMINI_API_KEY}`;
    
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
      return { success: false, error: `Gemini API returned status ${response.status}` };
    }
    
    const data = await response.json();
    
    // Check if we have parts with image data
    const parts = data.candidates?.[0]?.content?.parts || [];
    
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
    
    console.log('No image data found in response');
    return {
      success: false,
      error: 'No image data returned from Gemini API'
    };
  } catch (error) {
    console.error('Error generating image:', error);
    return {
      success: false,
      error: error.message || 'Unknown error occurred'
    };
  }
}

// Test the full process with a simple prompt
async function runTest() {
  console.log("TESTING TWO-STEP MEME GENERATION PROCESS");
  console.log("----------------------------------------");
  
  try {
    const testPrompt = "A programmer debugging code at 3am";
    const result = await generateMemeImage(testPrompt + " in cartoon style");
    
    if (result.success) {
      console.log("\n✅ SUCCESSFUL MEME GENERATION");
      console.log("Image saved at:", result.imageUrl);
    } else {
      console.log("\n❌ FAILED MEME GENERATION");
      console.log("Error:", result.error);
    }
  } catch (error) {
    console.error("Test failed with error:", error);
  }
}

// Run the test
runTest();
