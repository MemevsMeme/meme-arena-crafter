
import { supabase } from './supabase';

/**
 * Upload a file to IPFS via Pinata
 * @param file File to upload
 * @param name Optional name for the file
 */
export async function uploadFileToIPFS(file: File, name?: string): Promise<{
  success: boolean;
  ipfsHash?: string;
  pinataUrl?: string;
  gatewayUrl?: string;
  error?: string;
}> {
  try {
    const formData = new FormData();
    formData.append('file', file);
    if (name) {
      formData.append('name', name);
    }

    const { data, error } = await supabase.functions.invoke('pinata-upload', {
      body: formData,
      headers: {
        'Accept': 'application/json',
      }
    });

    if (error) {
      console.error('Error uploading to IPFS:', error);
      return { success: false, error: error.message };
    }

    return { success: true, ...data };
  } catch (error: any) {
    console.error('Exception uploading to IPFS:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Upload JSON data to IPFS via Pinata
 * @param content JSON content to upload
 * @param name Optional name for the content
 */
export async function uploadJsonToIPFS(content: any, name?: string): Promise<{
  success: boolean;
  ipfsHash?: string;
  pinataUrl?: string;
  gatewayUrl?: string;
  error?: string;
}> {
  try {
    const { data, error } = await supabase.functions.invoke('pinata-upload', {
      body: {
        type: 'json',
        content,
        name
      }
    });

    if (error) {
      console.error('Error uploading JSON to IPFS:', error);
      return { success: false, error: error.message };
    }

    return { success: true, ...data };
  } catch (error: any) {
    console.error('Exception uploading JSON to IPFS:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Pin content from a URL to IPFS via Pinata
 * @param sourceUrl URL to pin
 * @param name Optional name for the content
 */
export async function pinUrlToIPFS(sourceUrl: string, name?: string): Promise<{
  success: boolean;
  ipfsHash?: string;
  pinataUrl?: string;
  gatewayUrl?: string;
  error?: string;
}> {
  try {
    const { data, error } = await supabase.functions.invoke('pinata-upload', {
      body: {
        sourceUrl,
        name
      }
    });

    if (error) {
      console.error('Error pinning URL to IPFS:', error);
      return { success: false, error: error.message };
    }

    return { success: true, ...data };
  } catch (error: any) {
    console.error('Exception pinning URL to IPFS:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Get the IPFS URL for a hash using your custom gateway
 * @param ipfsHash IPFS hash (CID)
 * @returns URL to the content on your Pinata gateway
 */
export function getIpfsUrl(ipfsHash: string): string {
  if (!ipfsHash) return '';
  
  // Clean the CID if it has a protocol prefix or trailing path
  let cleanedCid = ipfsHash;
  
  // Remove ipfs:// protocol prefix if present
  if (cleanedCid.startsWith('ipfs://')) {
    cleanedCid = cleanedCid.substring(7);
  }
  
  // Remove any trailing paths or query parameters
  if (cleanedCid.includes('/') || cleanedCid.includes('?')) {
    cleanedCid = cleanedCid.split('/')[0].split('?')[0];
  }
  
  return `https://purple-accessible-wolverine-380.mypinata.cloud/ipfs/${cleanedCid}`;
}
