
// Import required dependencies for Deno
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

// CORS headers for cross-origin requests
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Function to generate text responses using Gemini AI
async function generateText(prompt: string, style: string) {
  try {
    const apiKey = Deno.env.get('GEM_API');
    if (!apiKey) {
      throw new Error('API key not found');
    }

    // Adjust the prompt based on style
    let systemPrompt = `Generate 3 funny and creative captions for a meme about: "${prompt}". `;
    
    if (style === 'funny') {
      systemPrompt += "Make them humorous and light-hearted.";
    } else if (style === 'dark') {
      systemPrompt += "Make them sarcastically dark but still appropriate.";
    } else if (style === 'wholesome') {
      systemPrompt += "Make them positive and uplifting.";
    } else if (style === 'sarcastic') {
      systemPrompt += "Make them witty and sarcastic.";
    }

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            role: "user",
            parts: [{ text: systemPrompt }]
          }
        ],
        generationConfig: {
          temperature: 1.0,
          maxOutputTokens: 200,
        },
      }),
    });

    const data = await response.json();
    
    if (!data.candidates || !data.candidates[0]?.content?.parts?.[0]?.text) {
      throw new Error('Invalid response format');
    }

    const generatedText = data.candidates[0].content.parts[0].text;
    
    // Parse the text to get individual captions
    const captions = generatedText.split('\n')
      .filter(line => line.trim().length > 0)
      .map(line => line.replace(/^\d+\.\s*/, '').trim())
      .filter(caption => caption.length > 0)
      .slice(0, 3);
    
    return captions;
  } catch (error) {
    console.error('Error generating text:', error);
    throw error;
  }
}

// Function to analyze images using Gemini AI
async function analyzeImage(imageUrl: string) {
  try {
    const apiKey = Deno.env.get('GEM_API');
    if (!apiKey) {
      throw new Error('API key not found');
    }

    // Fetch image data as blob
    const imageResponse = await fetch(imageUrl);
    const imageBlob = await imageResponse.blob();
    const imageBase64 = await blobToBase64(imageBlob);

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro-vision:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            role: "user",
            parts: [
              { text: "Analyze this meme image and generate 3-5 relevant hashtags or tags that describe it. Just return the tags as a comma separated list without any additional text." },
              {
                inlineData: {
                  mimeType: imageBlob.type,
                  data: imageBase64.split(',')[1]
                }
              }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.4,
          maxOutputTokens: 100,
        },
      }),
    });

    const data = await response.json();
    
    if (!data.candidates || !data.candidates[0]?.content?.parts?.[0]?.text) {
      throw new Error('Invalid response format');
    }

    const tagsText = data.candidates[0].content.parts[0].text;
    
    // Parse tags
    const tags = tagsText.split(',')
      .map(tag => tag.trim().replace(/^#/, ''))
      .filter(tag => tag.length > 0)
      .slice(0, 5);
    
    return tags;
  } catch (error) {
    console.error('Error analyzing image:', error);
    throw error;
  }
}

// Function to generate images using Imagen 2.0
async function generateImage(prompt: string) {
  try {
    const apiKey = Deno.env.get('GEM_API');
    if (!apiKey) {
      throw new Error('API key not found');
    }

    // Create a prompt that explicitly asks for no text in the image
    const imagePrompt = `Create an image for a meme based on: ${prompt}. 
    IMPORTANT: Do NOT include any text, words, or captions in the image itself. 
    The image should be clean with no text overlays. 
    Make it humorous and suitable for a meme.`;

    // Using Imagen 2.0 for image generation
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/imagegeneration@002:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            role: "user",
            parts: [
              { text: imagePrompt }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.8
        }
      }),
    });

    const data = await response.json();
    
    // Check for error response
    if (data.error) {
      console.error('Gemini API error:', data.error);
      throw new Error(data.error.message || 'Error generating image');
    }
    
    // Check for the image data in the response - Imagen 2.0 specific format
    if (data.candidates && data.candidates[0]?.content?.parts) {
      const parts = data.candidates[0].content.parts;
      for (const part of parts) {
        if (part.inlineData && part.inlineData.data) {
          // Return the base64 image data with correct mime type
          return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
        }
      }
    }
    
    // If we can't find image data, throw an error
    throw new Error('No image data found in response');
  } catch (error) {
    console.error('Error generating image:', error);
    throw error;
  }
}

// Helper function to convert a Blob to base64
async function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

// Main request handler
serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  
  try {
    const { type, prompt, style, imageUrl } = await req.json();
    
    if (type === 'text') {
      // Generate captions
      const captions = await generateText(prompt, style || 'funny');
      
      return new Response(
        JSON.stringify({ captions }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    } else if (type === 'image') {
      // Analyze image
      const tags = await analyzeImage(imageUrl);
      
      return new Response(
        JSON.stringify({ tags }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    } else if (type === 'generate-image') {
      // Generate image
      const imageData = await generateImage(prompt);
      
      return new Response(
        JSON.stringify({ imageData }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    } else {
      throw new Error(`Unsupported operation type: ${type}`);
    }
  } catch (error) {
    console.error(error);
    
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
