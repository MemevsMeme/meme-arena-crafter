
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const GEMINI_API_KEY = Deno.env.get('GEM_API'); // Using the GEM_API environment variable

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS pre-flight request
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const body = await req.json();

    switch (body.type) {
      case 'text':
        try {
          const { prompt, style } = body;
          if (!prompt) {
            throw new Error('Prompt is required');
          }

          let formattedPrompt = prompt;
          if (style === 'funny') {
            formattedPrompt = `Create three funny meme captions based on: ${prompt}. Make them short, humorous, and suitable for meme formats.`;
          } else if (style === 'serious') {
            formattedPrompt = `Create three serious, thought-provoking meme captions based on: ${prompt}. Make them impactful and concise.`;
          } else {
            formattedPrompt = `Create three meme captions based on: ${prompt}. Make them creative, engaging, and suitable for a wide audience.`;
          }

          console.log(`Sending to Gemini with prompt: "${formattedPrompt}"`);
          
          // Check if API key is available
          if (!GEMINI_API_KEY) {
            console.error("GEM_API key is not set");
            // Return mock data for development if API key is not available
            return new Response(
              JSON.stringify({ 
                captions: [
                  `When ${prompt} but it actually works`,
                  `Nobody:\nAbsolutely nobody:\nMe: ${prompt}`,
                  `${prompt}? Story of my life.`
                ] 
              }),
              { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
            );
          }

          // Using gemini-2.0-flash model for text generation as specified
          const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              contents: [{
                parts: [{ text: formattedPrompt }]
              }],
              generationConfig: {
                maxOutputTokens: 2048,
                temperature: 0.7,
                topK: 32,
                topP: 1,
              },
            }),
          });

          if (!response.ok) {
            console.error(`API Error: ${response.status} ${response.statusText}`);
            const errorText = await response.text();
            console.error(`Error response: ${errorText}`);
            
            // Return mock data if the API call fails
            return new Response(
              JSON.stringify({ 
                captions: [
                  `When ${prompt} but it actually works`,
                  `Nobody:\nAbsolutely nobody:\nMe: ${prompt}`,
                  `${prompt}? Story of my life.`
                ] 
              }),
              { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
            );
          }

          const data = await response.json();
          console.log('Response received');

          if (!data.candidates || data.candidates.length === 0) {
            console.error('No candidates in response');
            throw new Error('No candidates in response');
          }

          const captions = data.candidates[0].content.parts.map(part => part.text).join('\n').split('\n').filter(Boolean);

          return new Response(
            JSON.stringify({ captions }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
          );
        } catch (error) {
          console.error('Error generating captions:', error.message);
          // Return mock data on error
          return new Response(
            JSON.stringify({ 
              captions: [
                `When ${body.prompt || 'trying'} but it actually works`,
                `Nobody:\nAbsolutely nobody:\nMe: ${body.prompt || 'doing meme stuff'}`,
                `${body.prompt || 'This meme'}? Story of my life.`
              ] 
            }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
          );
        }
        break;

      case 'generate-image':
        try {
          const { prompt, style } = body;
          if (!prompt) {
            throw new Error('Prompt is required for image generation');
          }
          
          let formattedPrompt = prompt;
          if (style === 'funny') {
            formattedPrompt = `Create a funny meme image based on: ${prompt}. Make it humorous and suitable for a meme.`;
          } else if (style === 'serious') {
            formattedPrompt = `Create a serious, thought-provoking image based on: ${prompt}. Make it suitable for a meme with impact.`;
          } else {
            formattedPrompt = `Create a meme image based on: ${prompt}. Make it visually appealing and suitable for adding text captions.`;
          }
          
          console.log(`Sending to Gemini for image generation with prompt: "${formattedPrompt}"`);
          
          // Check if API key is available
          if (!GEMINI_API_KEY) {
            console.error("GEM_API is not set");
            
            // Return a placeholder image data URL if API key is not available
            const placeholderImageData = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI1MDAiIGhlaWdodD0iNTAwIj48cmVjdCB3aWR0aD0iNTAwIiBoZWlnaHQ9IjUwMCIgZmlsbD0iI2YwZjBmMCIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMjBweCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZG9taW5hbnQtYmFzZWxpbmU9Im1pZGRsZSIgZmlsbD0iIzY2NiI+UGxhY2Vob2xkZXIgSW1hZ2U8L3RleHQ+PHRleHQgeD0iNTAlIiB5PSI2MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNnB4IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkb21pbmFudC1iYXNlbGluZT0ibWlkZGxlIiBmaWxsPSIjNjY2Ij5BUEkga2V5IG5vdCBjb25maWd1cmVkPC90ZXh0Pjwvc3ZnPg==";
            
            return new Response(
              JSON.stringify({
                imageData: placeholderImageData
              }),
              { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
            );
          }
          
          // Use Gemini 2.0 Flash Preview Image Generation model
          const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-preview-image-generation:generateContent?key=${GEMINI_API_KEY}`;
          console.log(`Using API URL: ${apiUrl}`);
          
          // Using the correct format for Gemini 2.0 Flash Preview Image Generation with required responseModalities
          const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              contents: [
                {
                  role: "user",
                  parts: [
                    {
                      text: formattedPrompt
                    }
                  ]
                }
              ],
              generationConfig: {
                maxOutputTokens: 2048,
                temperature: 0.7,
                topK: 32,
                topP: 1,
                responseModalities: ["TEXT", "IMAGE"]  // Required to ensure image output
              }
            })
          });
          
          if (!response.ok) {
            console.error(`API Error: ${response.status} ${response.statusText}`);
            const errorText = await response.text();
            console.error(`Error response: ${errorText}`);
            
            // Return a placeholder image data URL if the API call fails
            const placeholderImageData = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI1MDAiIGhlaWdodD0iNTAwIj48cmVjdCB3aWR0aD0iNTAwIiBoZWlnaHQ9IjUwMCIgZmlsbD0iI2YwZjBmMCIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMjBweCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZG9taW5hbnQtYmFzZWxpbmU9Im1pZGRsZSIgZmlsbD0iIzY2NiI+QUkgR2VuZXJhdGlvbiBGYWlsZWQ8L3RleHQ+PHRleHQgeD0iNTAlIiB5PSI2MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNnB4IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkb21pbmFudC1iYXNlbGluZT0ibWlkZGxlIiBmaWxsPSIjNjY2Ij5QbGVhc2UgdHJ5IGFnYWluPC90ZXh0Pjwvc3ZnPg==";
            
            return new Response(
              JSON.stringify({
                imageData: placeholderImageData
              }),
              { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
            );
          }
          
          const responseData = await response.json();
          console.log('Image generation response received');
          
          // Debug the full response structure
          console.log('Full response structure:', JSON.stringify(responseData, null, 2));
          
          if (!responseData.candidates || responseData.candidates.length === 0) {
            console.error('No candidates in response');
            throw new Error('No candidates in response');
          }
          
          const candidate = responseData.candidates[0];
          if (!candidate.content) {
            console.error('No content in candidate');
            throw new Error('No content in candidate');
          }
          
          const content = candidate.content;
          
          if (!content.parts || content.parts.length === 0) {
            console.error('No parts in content');
            throw new Error('No parts in content');
          }
          
          // Debug the parts to see their structure
          console.log('Parts structure:', JSON.stringify(content.parts.map(p => Object.keys(p))));
          
          // Look for the image part in the response
          const imagePart = content.parts.find(part => part.inlineData && part.inlineData.mimeType && part.inlineData.mimeType.startsWith('image/'));
          
          if (!imagePart || !imagePart.inlineData) {
            console.error('No image data found in the response');
            throw new Error('No image data found in response');
          }
          
          console.log('Found image data in response');
          const imageData = `data:${imagePart.inlineData.mimeType};base64,${imagePart.inlineData.data}`;
          
          return new Response(
            JSON.stringify({
              imageData
            }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
          );
          
        } catch (error) {
          console.error('Error in image generation:', error.message);
          // Return placeholder image on error
          const placeholderImageData = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI1MDAiIGhlaWdodD0iNTAwIj48cmVjdCB3aWR0aD0iNTAwIiBoZWlnaHQ9IjUwMCIgZmlsbD0iI2YwZjBmMCIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMjBweCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZG9taW5hbnQtYmFzZWxpbmU9Im1pZGRsZSIgZmlsbD0iIzY2NiI+RXJyb3IgR2VuZXJhdGluZyBJbWFnZTwvdGV4dD48dGV4dCB4PSI1MCUiIHk9IjYwJSIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjE2cHgiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGRvbWluYW50LWJhc2VsaW5lPSJtaWRkbGUiIGZpbGw9IiM2NjYiPlBsZWFzZSB0cnkgYWdhaW48L3RleHQ+PC9zdmc+";
          
          return new Response(
            JSON.stringify({ imageData: placeholderImageData }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
          );
        }
        break;

      case 'image':
        try {
          const { imageUrl } = body;
          if (!imageUrl) {
            throw new Error('Image URL is required');
          }

          console.log(`Analyzing image: ${imageUrl}`);

          // Check if API key is available
          if (!GEMINI_API_KEY) {
            console.error("GEM_API is not set");
            // Return default tags if API key is not available
            return new Response(
              JSON.stringify({ 
                tags: ['funny', 'viral', 'trending', 'meme']
              }),
              { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
            );
          }

          // Using gemini-2.0-pro-vision model for image analysis
          const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-pro-vision:generateContent?key=${GEMINI_API_KEY}`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              contents: [{
                parts: [
                  { text: "Describe the image with a focus on identifying objects, scenes, and meme-related context. Extract keywords suitable for tagging the image as a meme." },
                  {
                    inlineData: {
                      mimeType: "image/*",
                      data: imageUrl.split(',')[1]
                    }
                  }
                ]
              }],
              generationConfig: {
                maxOutputTokens: 2048,
                temperature: 0.4,
                topK: 32,
                topP: 1,
              },
            }),
          });

          if (!response.ok) {
            console.error(`API Error: ${response.status} ${response.statusText}`);
            const errorText = await response.text();
            console.error(`Error response: ${errorText}`);
            // Return default tags if the API call fails
            return new Response(
              JSON.stringify({ 
                tags: ['funny', 'viral', 'trending', 'meme'] 
              }),
              { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
            );
          }

          const data = await response.json();
          console.log('Image analysis response received');

          if (!data.candidates || data.candidates.length === 0) {
            console.error('No candidates in response');
            throw new Error('No candidates in response');
          }

          const analysis = data.candidates[0].content.parts[0].text;
          console.log('Image analysis:', analysis);

          // Extract tags from the analysis (example: split by commas and trim)
          const tags = analysis.split(',').map(tag => tag.trim());

          return new Response(
            JSON.stringify({ tags }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
          );
        } catch (error) {
          console.error('Error analyzing image:', error.message);
          // Return default tags on error
          return new Response(
            JSON.stringify({ tags: ['funny', 'viral', 'trending', 'meme'] }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
          );
        }
        break;

      default:
        console.log(`Unknown type: ${body.type}`);
        return new Response(
          JSON.stringify({ error: 'Unknown type' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
        );
    }
  } catch (error) {
    console.error('Unexpected error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
