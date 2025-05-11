
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface TextRequest {
  type: 'text';
  prompt: string;
  style?: string;
}

interface ImageRequest {
  type: 'image';
  imageUrl: string;
}

interface GenerateImageRequest {
  type: 'generate-image';
  prompt: string;
  style?: string;
}

type GeminiRequest = TextRequest | ImageRequest | GenerateImageRequest;

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const GEMINI_API_KEY = Deno.env.get('GEM_API');
    if (!GEMINI_API_KEY) {
      console.error('Gemini API key is not configured');
      throw new Error('Gemini API key not configured');
    }

    console.log('Starting Gemini AI request processing...');
    
    // Log the request body for debugging
    const requestText = await req.text();
    console.log('Request body:', requestText);
    
    let requestData;
    try {
      requestData = JSON.parse(requestText) as GeminiRequest;
    } catch (e) {
      console.error('Error parsing JSON request:', e);
      throw new Error('Invalid JSON request');
    }
    
    if (requestData.type === 'text') {
      // Handle text generation (captions)
      const { prompt, style = 'funny' } = requestData;
      
      console.log(`Generating captions for prompt: "${prompt}" with style: ${style}`);
      
      // Format the prompt based on style
      let formattedPrompt = prompt;
      switch (style) {
        case 'funny':
          formattedPrompt = `Generate 3 funny and humorous caption ideas for a meme with the concept: "${prompt}". Make them short, witty and internet culture relevant. Format as a JSON array of strings.`;
          break;
        case 'dark':
          formattedPrompt = `Generate 3 dark humor caption ideas for a meme with the concept: "${prompt}". Make them slightly edgy but not offensive. Format as a JSON array of strings.`;
          break;
        case 'wholesome':
          formattedPrompt = `Generate 3 wholesome and positive caption ideas for a meme with the concept: "${prompt}". Make them uplifting and heartwarming. Format as a JSON array of strings.`;
          break;
        case 'sarcastic':
          formattedPrompt = `Generate 3 sarcastic caption ideas for a meme with the concept: "${prompt}". Make them dry, witty and ironic. Format as a JSON array of strings.`;
          break;
        default:
          formattedPrompt = `Generate 3 caption ideas for a meme with the concept: "${prompt}". Format as a JSON array of strings.`;
      }

      console.log(`Sending to Gemini API with formatted prompt: "${formattedPrompt}"`);
      
      // Updated to use Gemini 2.0 model
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                { text: formattedPrompt }
              ]
            }
          ],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 200,
          }
        })
      });

      if (!response.ok) {
        const errorData = await response.text();
        console.error('Gemini API error:', errorData);
        throw new Error(`Gemini API error: ${response.status}`);
      }

      const data = await response.json();
      console.log('Gemini API response:', JSON.stringify(data));
      
      let captions: string[] = [];
      try {
        // Try to extract captions from the response
        const textContent = data.candidates[0].content.parts[0].text;
        console.log('Raw text content:', textContent);
        
        // First try to parse as JSON if the model returned JSON
        try {
          if (textContent.includes('[') && textContent.includes(']')) {
            const jsonMatch = textContent.match(/\[.*?\]/s);
            if (jsonMatch) {
              captions = JSON.parse(jsonMatch[0]);
              console.log('Successfully parsed JSON:', captions);
            }
          }
        } catch (e) {
          console.log('Could not parse as JSON, falling back to text processing');
        }
        
        // If JSON parsing failed, try line-by-line extraction
        if (!captions.length) {
          captions = textContent
            .split('\n')
            .filter(line => line.trim() && !line.includes('```'))
            .map(line => {
              // Remove numbering like "1.", "2.", etc.
              return line.replace(/^\d+[\.\)\-]\s*/, '').trim();
            })
            .filter(line => line)
            .slice(0, 3);
          console.log('Extracted captions from text:', captions);
        }
        
        // If we still don't have captions, use the whole text
        if (!captions.length) {
          captions = [textContent.trim()];
          console.log('Using full text as caption');
        }
      } catch (e) {
        console.error('Error parsing Gemini response:', e);
        captions = ['Funny caption about ' + prompt, 
                   'Another hilarious take on ' + prompt, 
                   'When ' + prompt + ' but it actually works'];
      }

      return new Response(JSON.stringify({ captions }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    } 
    else if (requestData.type === 'image') {
      // Handle image analysis
      const { imageUrl } = requestData;

      console.log('Analyzing image:', imageUrl);
      
      // Fetch the image and convert to base64
      const imageResponse = await fetch(imageUrl);
      if (!imageResponse.ok) {
        console.error(`Failed to fetch image: ${imageResponse.status}`);
        throw new Error(`Failed to fetch image: ${imageResponse.status}`);
      }
      
      const imageBlob = await imageResponse.blob();
      const imageArrayBuffer = await imageBlob.arrayBuffer();
      const base64Image = btoa(
        String.fromCharCode(...new Uint8Array(imageArrayBuffer))
      );
      
      console.log('Image converted to base64 for processing');
      
      // Updated to use Gemini 2.0 model
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-pro-vision:generateContent?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                { 
                  text: "Analyze this image and suggest 3-5 relevant tags that could be used for this meme. Return just the tags as a JSON array of strings, nothing else." 
                },
                {
                  inline_data: {
                    mime_type: imageResponse.headers.get('content-type') || 'image/jpeg',
                    data: base64Image
                  }
                }
              ]
            }
          ],
          generationConfig: {
            temperature: 0.2,
            maxOutputTokens: 100,
          }
        })
      });

      if (!response.ok) {
        const errorData = await response.text();
        console.error('Gemini API error:', errorData);
        throw new Error(`Gemini API error: ${response.status}`);
      }

      const data = await response.json();
      console.log('Gemini API response for image analysis:', JSON.stringify(data));
      
      let tags: string[] = [];
      try {
        // Try to extract tags from the response
        const textContent = data.candidates[0].content.parts[0].text;
        console.log('Raw text content for image analysis:', textContent);
        
        // Try to parse as JSON if the model returned JSON
        try {
          if (textContent.includes('[') && textContent.includes(']')) {
            const jsonMatch = textContent.match(/\[.*?\]/s);
            if (jsonMatch) {
              tags = JSON.parse(jsonMatch[0]);
              console.log('Successfully parsed JSON tags:', tags);
            }
          }
        } catch (e) {
          console.log('Could not parse tags as JSON, falling back to text processing');
        }
        
        // If JSON parsing failed, try line-by-line extraction
        if (!tags.length) {
          tags = textContent
            .split(/[\n,]/)
            .filter(line => line.trim() && !line.includes('```'))
            .map(line => line.trim().replace(/^["'\-•]|["']$/g, ''))
            .filter(Boolean)
            .slice(0, 5);
          console.log('Extracted tags from text:', tags);
        }
        
        // If we still don't have tags, use default
        if (!tags.length) {
          tags = ['funny', 'meme', 'viral'];
          console.log('Using default tags');
        }
      } catch (e) {
        console.error('Error parsing Gemini response for image analysis:', e);
        tags = ['funny', 'meme', 'viral'];
      }

      return new Response(JSON.stringify({ tags }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
    else if (requestData.type === 'generate-image') {
      // Handle image generation
      const { prompt, style = 'meme' } = requestData;
      
      console.log(`Generating image for prompt: "${prompt}" with style: ${style}`);
      
      // Format the prompt based on style
      let formattedPrompt = `Create a meme image for the concept: "${prompt}"`;
      if (style === 'funny') {
        formattedPrompt += ". Make it humorous and funny.";
      } else if (style === 'dark') {
        formattedPrompt += ". Use dark humor style.";
      } else if (style === 'wholesome') {
        formattedPrompt += ". Make it wholesome and positive.";
      } else if (style === 'sarcastic') {
        formattedPrompt += ". Use sarcastic and ironic style.";
      }
      
      console.log(`Sending to Gemini for image generation with prompt: "${formattedPrompt}"`);
      
      // Updated to use correct model and format for Gemini 2.0 image generation
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-preview-image-generation:generateContent?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              role: "user",
              parts: [
                { text: formattedPrompt }
              ]
            }
          ],
          generationConfig: {
            temperature: 0.9,
          },
          safetySettings: [
            {
              category: "HARM_CATEGORY_HATE_SPEECH",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            },
            {
              category: "HARM_CATEGORY_DANGEROUS_CONTENT",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            },
            {
              category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            },
            {
              category: "HARM_CATEGORY_HARASSMENT",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            }
          ]
        })
      });

      if (!response.ok) {
        const errorData = await response.text();
        console.error('Gemini API error for image generation:', errorData);
        throw new Error(`Gemini API error: ${response.status}`);
      }

      const data = await response.json();
      console.log('Gemini API response for image generation:', JSON.stringify(data));
      
      // Extract the generated image data
      try {
        const candidates = data.candidates;
        if (!candidates || candidates.length === 0) {
          throw new Error('No candidates returned in the response');
        }
        
        const content = candidates[0].content;
        if (!content || !content.parts || content.parts.length === 0) {
          throw new Error('No content parts found in the response');
        }
        
        // Look for the image part in the response (format is different in Gemini 2.0)
        const imagePart = content.parts.find(part => part.inlineData && part.inlineData.mimeType && part.inlineData.mimeType.startsWith('image/'));
        
        if (!imagePart || !imagePart.inlineData) {
          console.error('No image data found in the response');
          console.log('Response structure:', JSON.stringify(content.parts));
          throw new Error('No image data found in the response');
        }
        
        console.log('Successfully extracted image data');
        
        return new Response(JSON.stringify({ 
          imageData: `data:${imagePart.inlineData.mimeType};base64,${imagePart.inlineData.data}` 
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      } catch (e) {
        console.error('Error extracting image data from Gemini response:', e);
        throw new Error('Failed to extract image data from response');
      }
    }
    
    return new Response(JSON.stringify({ error: 'Invalid request type' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error in gemini-ai function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
