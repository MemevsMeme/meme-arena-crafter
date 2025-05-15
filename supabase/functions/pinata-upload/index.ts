
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

// Configure CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Max-Age': '86400',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { 
      headers: corsHeaders,
      status: 204
    });
  }

  try {
    console.log("Pinata upload function called");
    
    // Get the API key and JWT from environment variables
    const pinataApiKey = Deno.env.get('PIN_API');
    const pinataSecretApiKey = Deno.env.get('PIN_SECRET');
    const pinataJWT = Deno.env.get('PIN_JWT');

    if (!pinataJWT && (!pinataApiKey || !pinataSecretApiKey)) {
      console.error("Missing Pinata credentials");
      throw new Error('Pinata credentials not configured');
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

    if (contentType.includes('multipart/form-data')) {
      // Handle multipart form data (direct file upload)
      try {
        const formData = await req.formData();
        const file = formData.get('file');
        
        if (!file || !(file instanceof File)) {
          console.error("No file uploaded or invalid file object");
          throw new Error('No file uploaded or invalid file object');
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
        
        const pinataResponse = await fetch(pinataUrl, {
          method: 'POST',
          headers: authHeader,
          body: pinataData,
        });

        if (!pinataResponse.ok) {
          const errorText = await pinataResponse.text();
          console.error('Pinata API error:', pinataResponse.status, errorText);
          throw new Error(`Pinata API error: ${pinataResponse.status} - ${errorText}`);
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
      } catch (formError) {
        console.error("Form data processing error:", formError);
        throw formError;
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
          throw new Error('Invalid request format, missing sourceUrl or content');
        }

        if (!pinataResponse.ok) {
          const errorText = await pinataResponse.text();
          console.error('Pinata API error:', pinataResponse.status, errorText);
          throw new Error(`Pinata API error: ${pinataResponse.status} - ${errorText}`);
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
        throw jsonError;
      }
    }
  } catch (error) {
    console.error('Error in pinata-upload function:', error);
    return new Response(JSON.stringify({ 
      success: false,
      error: error.message || 'Unknown error in pinata-upload function'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
