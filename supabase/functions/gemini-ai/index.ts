
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

type GeminiRequest = TextRequest | ImageRequest;

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const GEMINI_API_KEY = Deno.env.get('GEM_API');
    if (!GEMINI_API_KEY) {
      throw new Error('Gemini API key not configured');
    }

    const requestData = await req.json() as GeminiRequest;
    
    if (requestData.type === 'text') {
      // Handle text generation (captions)
      const { prompt, style = 'funny' } = requestData;
      
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

      console.log(`Generating captions for prompt: "${prompt}" with style: ${style}`);
      
      const response = await fetch(`https://generativelanguage.googleapis.com/v1/models/gemini-1.5-pro:generateContent?key=${GEMINI_API_KEY}`, {
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
        
        // First try to parse as JSON if the model returned JSON
        try {
          if (textContent.includes('[') && textContent.includes(']')) {
            const jsonMatch = textContent.match(/\[.*?\]/s);
            if (jsonMatch) {
              captions = JSON.parse(jsonMatch[0]);
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
        }
        
        // If we still don't have captions, use the whole text
        if (!captions.length) {
          captions = [textContent.trim()];
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
        throw new Error(`Failed to fetch image: ${imageResponse.status}`);
      }
      
      const imageBlob = await imageResponse.blob();
      const imageArrayBuffer = await imageBlob.arrayBuffer();
      const base64Image = btoa(
        String.fromCharCode(...new Uint8Array(imageArrayBuffer))
      );
      
      const response = await fetch(`https://generativelanguage.googleapis.com/v1/models/gemini-1.5-pro-vision:generateContent?key=${GEMINI_API_KEY}`, {
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
      console.log('Gemini API response:', JSON.stringify(data));
      
      let tags: string[] = [];
      try {
        // Try to extract tags from the response
        const textContent = data.candidates[0].content.parts[0].text;
        
        // Try to parse as JSON if the model returned JSON
        try {
          if (textContent.includes('[') && textContent.includes(']')) {
            const jsonMatch = textContent.match(/\[.*?\]/s);
            if (jsonMatch) {
              tags = JSON.parse(jsonMatch[0]);
            }
          }
        } catch (e) {
          console.log('Could not parse as JSON, falling back to text processing');
        }
        
        // If JSON parsing failed, try line-by-line extraction
        if (!tags.length) {
          tags = textContent
            .split(/[\n,]/)
            .filter(line => line.trim() && !line.includes('```'))
            .map(line => line.trim().replace(/^["'\-•]|["']$/g, ''))
            .filter(Boolean)
            .slice(0, 5);
        }
        
        // If we still don't have tags, use default
        if (!tags.length) {
          tags = ['funny', 'meme', 'viral'];
        }
      } catch (e) {
        console.error('Error parsing Gemini response:', e);
        tags = ['funny', 'meme', 'viral'];
      }

      return new Response(JSON.stringify({ tags }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
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
