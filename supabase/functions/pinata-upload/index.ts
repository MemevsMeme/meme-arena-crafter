
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

// Configure CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get the API key and JWT from environment variables
    const pinataApiKey = Deno.env.get('PIN_API');
    const pinataSecretApiKey = Deno.env.get('PIN_SECRET');
    const pinataJWT = Deno.env.get('PIN_JWT');

    if (!pinataJWT) {
      throw new Error('Pinata JWT not configured');
    }

    // Check if this is a file upload
    const contentType = req.headers.get('content-type') || '';
    let requestData;
    let isPinByJson = false;

    if (contentType.includes('multipart/form-data')) {
      // Handle multipart form data (direct file upload)
      const formData = await req.formData();
      const file = formData.get('file');
      
      if (!file || !(file instanceof File)) {
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
      const pinataResponse = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${pinataJWT}`,
        },
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
    } else {
      // Handle JSON payload (could be pinning by URL or JSON)
      try {
        requestData = await req.json();
      } catch (jsonError) {
        console.error('Error parsing JSON request:', jsonError);
        throw new Error('Invalid JSON request format');
      }
      
      isPinByJson = requestData.type === 'json';
      
      let pinataResponse;
      
      if (isPinByJson) {
        console.log("Pinning JSON data to IPFS");
        // Pin JSON data
        pinataResponse = await fetch('https://api.pinata.cloud/pinning/pinJSONToIPFS', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${pinataJWT}`,
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
            'Authorization': `Bearer ${pinataJWT}`,
          },
          body: JSON.stringify({
            url: requestData.sourceUrl,
            pinataMetadata: {
              name: requestData.name || 'URL Pin',
            },
          }),
        });
      } else {
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
