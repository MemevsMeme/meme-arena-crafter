// Simple Gemini image generation using direct HTTP request
const https = require('https');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

/**
 * Make a simple HTTP request
 */
function makeRequest(url, method, data) {
  return new Promise((resolve, reject) => {
    const options = {
      method: method || 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    };
    
    const req = https.request(url, options, (res) => {
      let responseData = '';
      
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          try {
            const jsonData = JSON.parse(responseData);
            resolve({ statusCode: res.statusCode, data: jsonData });
          } catch (error) {
            resolve({ statusCode: res.statusCode, data: responseData });
          }
        } else {
          reject({
            statusCode: res.statusCode,
            message: `Request failed with status ${res.statusCode}`,
            data: responseData
          });
        }
      });
    });
    
    req.on('error', (error) => {
      reject(error);
    });
    
    if (data) {
      req.write(JSON.stringify(data));
    }
    
    req.end();
  });
}

/**
 * Generate a meme image using Gemini
 */
async function generateMemeImage(prompt) {
  if (!process.env.GEMINI_API_KEY) {
    console.error('Missing Gemini API key');
    return { success: false, error: 'API key is required' };
  }
  
  // Create directory for generated images
  const generatedDir = path.join(process.cwd(), 'client', 'public', 'generated');
  if (!fs.existsSync(generatedDir)) {
    fs.mkdirSync(generatedDir, { recursive: true });
  }
  
  try {
    console.log(`Generating image for prompt: "${prompt}"`);
    
    // Set up the API URL with the API key
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-preview-image-generation:generateContent?key=${process.env.GEMINI_API_KEY}`;
    
    // Prepare the request payload
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
    const response = await makeRequest(apiUrl, 'POST', requestData);
    
    // Check response for image data
    if (response.data.candidates && 
        response.data.candidates[0] && 
        response.data.candidates[0].content && 
        response.data.candidates[0].content.parts) {
      
      const parts = response.data.candidates[0].content.parts;
      
      // Log response structure to help with debugging
      console.log('Response parts structure:', parts.map(p => ({
        type: p.text ? 'text' : (p.inlineData ? 'image' : 'unknown'),
        hasText: !!p.text,
        hasInlineData: !!p.inlineData,
        mimeType: p.inlineData ? p.inlineData.mimeType : null
      })));
      
      // Find image part
      for (const part of parts) {
        if (part.inlineData && 
            part.inlineData.mimeType && 
            part.inlineData.mimeType.startsWith('image/') &&
            part.inlineData.data) {
          
          // Save the image to disk
          const imageData = Buffer.from(part.inlineData.data, 'base64');
          const fileExtension = part.inlineData.mimeType.split('/')[1] || 'jpg';
          const fileName = `gemini-${crypto.randomBytes(4).toString('hex')}.${fileExtension}`;
          const filePath = path.join(generatedDir, fileName);
          
          fs.writeFileSync(filePath, imageData);
          console.log('Successfully saved generated image:', fileName);
          
          return { 
            success: true, 
            imageUrl: `/generated/${fileName}` 
          };
        }
      }
      
      console.log('No image data found in response');
      return { 
        success: false, 
        error: 'No image found in API response' 
      };
    } else {
      console.log('Invalid response structure');
      console.log('Response:', JSON.stringify(response.data, null, 2));
      return { 
        success: false, 
        error: 'Invalid response from API' 
      };
    }
  } catch (error) {
    console.error('Error generating image:', error);
    return { 
      success: false, 
      error: error.message || 'Unknown error occurred' 
    };
  }
}

module.exports = { generateMemeImage };