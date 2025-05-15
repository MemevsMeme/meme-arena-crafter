
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Configure CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Max-Age': '86400',
};

// Create Supabase client for database operations
const supabaseAdmin = createClient(
  Deno.env.get('SUPABASE_URL') || '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
);

serve(async (req) => {
  console.log("Pinata upload function called");

  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { 
      headers: corsHeaders,
      status: 204
    });
  }

  try {
    // Get the API key and JWT from environment variables
    const pinataApiKey = Deno.env.get('PIN_API');
    const pinataSecretApiKey = Deno.env.get('PIN_SECRET');
    const pinataJWT = Deno.env.get('PIN_JWT');

    if (!pinataJWT && (!pinataApiKey || !pinataSecretApiKey)) {
      console.error("Missing Pinata credentials");
      return new Response(JSON.stringify({ 
        success: false,
        error: 'Pinata credentials not configured'
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
    
    const authHeader = pinataJWT 
      ? { 'Authorization': `Bearer ${pinataJWT}` }
      : {
          'pinata_api_key': pinataApiKey,
          'pinata_secret_api_key': pinataSecretApiKey
        };

    // Check if this is a file upload
    const contentType = req.headers.get('content-type') || '';
    console.log("Content-Type:", contentType);
    
    let requestData;
    let isPinByJson = false;

    // Return a dummy success response if IPFS is having issues
    // This prevents blocking the meme creation process
    if (Deno.env.get('BYPASS_IPFS') === 'true') {
      console.log("BYPASS_IPFS is enabled, returning dummy success response");
      return new Response(JSON.stringify({
        success: true,
        ipfsHash: "dummy-ipfs-hash-" + Date.now(),
        pinataUrl: "https://gateway.pinata.cloud/ipfs/dummy",
        gatewayUrl: "https://purple-accessible-wolverine-380.mypinata.cloud/ipfs/dummy"
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (contentType.includes('multipart/form-data')) {
      // Handle multipart form data (direct file upload)
      try {
        const formData = await req.formData();
        const file = formData.get('file');
        
        if (!file || !(file instanceof File)) {
          console.error("No file uploaded or invalid file object");
          return new Response(JSON.stringify({ 
            success: false,
            error: 'No file uploaded or invalid file object'
          }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }

        console.log(`Uploading file: ${file.name}, size: ${file.size}, type: ${file.type}`);
        
        // Create a new FormData object for the Pinata API
        const pinataData = new FormData();
        pinataData.append('file', file);
        
        // Add metadata to the upload if provided
        const name = formData.get('name')?.toString() || 'Unnamed';
        const pinataMetadata = {
          name: name,
        };
        
        pinataData.append('pinataMetadata', JSON.stringify(pinataMetadata));
        
        // Upload to Pinata
        console.log("Sending file to Pinata API...");
        const pinataUrl = 'https://api.pinata.cloud/pinning/pinFileToIPFS';
        console.log("Using Pinata URL:", pinataUrl);
        
        try {
          const pinataResponse = await fetch(pinataUrl, {
            method: 'POST',
            headers: authHeader,
            body: pinataData,
          });

          if (!pinataResponse.ok) {
            const errorText = await pinataResponse.text();
            console.error('Pinata API error:', pinataResponse.status, errorText);
            
            // Return a response that can be handled gracefully
            return new Response(JSON.stringify({
              success: false,
              error: `Pinata API error: ${pinataResponse.status}`,
              details: errorText
            }), {
              status: 200, // Still return 200 to prevent breaking the meme creation flow
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
          }

          const data = await pinataResponse.json();
          console.log('Successfully pinned file to IPFS:', data);

          return new Response(JSON.stringify({
            success: true,
            ipfsHash: data.IpfsHash,
            pinataUrl: `https://gateway.pinata.cloud/ipfs/${data.IpfsHash}`,
            gatewayUrl: `https://purple-accessible-wolverine-380.mypinata.cloud/ipfs/${data.IpfsHash}`
          }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        } catch (err) {
          console.error("Error during Pinata upload:", err);
          
          // Return a response that can be handled gracefully
          return new Response(JSON.stringify({
            success: false,
            error: `Error during Pinata upload: ${err.message || 'Unknown error'}`
          }), {
            status: 200, // Still return 200 to prevent breaking the meme creation flow
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }
      } catch (formError) {
        console.error("Form data processing error:", formError);
        
        // Return a response that can be handled gracefully
        return new Response(JSON.stringify({
          success: false,
          error: `Form data processing error: ${formError.message || 'Unknown error'}`
        }), {
          status: 200, // Still return 200 to prevent breaking the meme creation flow
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    } else {
      // Handle JSON payload (could be pinning by URL or JSON)
      try {
        requestData = await req.json();
        isPinByJson = requestData.type === 'json';
        console.log("JSON request data:", JSON.stringify(requestData).substring(0, 200) + "...");
        
        let pinataResponse;
        
        if (isPinByJson) {
          console.log("Pinning JSON data to IPFS");
          // Pin JSON data
          pinataResponse = await fetch('https://api.pinata.cloud/pinning/pinJSONToIPFS', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              ...authHeader
            },
            body: JSON.stringify({
              pinataContent: requestData.content,
              pinataMetadata: {
                name: requestData.name || 'JSON Data',
              },
            }),
          });
        } else if (requestData.sourceUrl) {
          console.log(`Pinning URL to IPFS: ${requestData.sourceUrl}`);
          // Pin by URL
          pinataResponse = await fetch('https://api.pinata.cloud/pinning/pinByURL', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              ...authHeader
            },
            body: JSON.stringify({
              url: requestData.sourceUrl,
              pinataMetadata: {
                name: requestData.name || 'URL Pin',
              },
            }),
          });
        } else {
          console.error("Invalid request format");
          
          // Return a response that can be handled gracefully
          return new Response(JSON.stringify({
            success: false,
            error: 'Invalid request format, missing sourceUrl or content'
          }), {
            status: 200, // Still return 200 to prevent breaking the meme creation flow
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        if (!pinataResponse.ok) {
          const errorText = await pinataResponse.text();
          console.error('Pinata API error:', pinataResponse.status, errorText);
          
          // Return a response that can be handled gracefully
          return new Response(JSON.stringify({
            success: false,
            error: `Pinata API error: ${pinataResponse.status}`,
            details: errorText
          }), {
            status: 200, // Still return 200 to prevent breaking the meme creation flow
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        const data = await pinataResponse.json();
        console.log('Successfully pinned to IPFS:', data);

        return new Response(JSON.stringify({
          success: true,
          ipfsHash: data.IpfsHash,
          pinataUrl: `https://gateway.pinata.cloud/ipfs/${data.IpfsHash}`,
          gatewayUrl: `https://purple-accessible-wolverine-380.mypinata.cloud/ipfs/${data.IpfsHash}`
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      } catch (jsonError) {
        console.error("JSON processing error:", jsonError);
        
        // Return a response that can be handled gracefully
        return new Response(JSON.stringify({
          success: false,
          error: `JSON processing error: ${jsonError.message || 'Unknown error'}`
        }), {
          status: 200, // Still return 200 to prevent breaking the meme creation flow
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    }
  } catch (error) {
    console.error('Error in pinata-upload function:', error);
    
    // Return a response that can be handled gracefully
    return new Response(JSON.stringify({ 
      success: false,
      error: error.message || 'Unknown error in pinata-upload function'
    }), {
      status: 200, // Still return 200 to prevent breaking the meme creation flow
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
