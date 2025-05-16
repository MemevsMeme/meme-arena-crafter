
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * Combines multiple class names using clsx and tailwind-merge
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Safe JSON parse with fallback
 */
export function safeJsonParse<T>(jsonString: string, fallback: T): T {
  try {
    return JSON.parse(jsonString) as T;
  } catch (e) {
    console.error('Error parsing JSON:', e);
    return fallback;
  }
}

/**
 * Upload an image to storage
 */
export async function uploadImage(dataUrl: string, userId: string): Promise<{ imageUrl: string }> {
  try {
    // Convert data URL to file
    const blob = await fetch(dataUrl).then(res => res.blob());
    const file = new File([blob], `meme-${Date.now()}.png`, { type: 'image/png' });
    
    // Create form data
    const formData = new FormData();
    formData.append('file', file);
    formData.append('userId', userId);
    
    // Mock successful upload for now
    console.log('Image would be uploaded to storage');
    
    // Return a mock URL for development
    return { imageUrl: dataUrl };
  } catch (error) {
    console.error('Error uploading image:', error);
    throw new Error('Failed to upload image');
  }
}

/**
 * Pin content to IPFS
 */
export async function pinToIpfs(dataUrl: string, caption: string): Promise<string> {
  try {
    console.log('Content would be pinned to IPFS');
    // Return a mock CID for development
    return `ipfs-mock-cid-${Date.now()}`;
  } catch (error) {
    console.error('Error pinning to IPFS:', error);
    throw new Error('Failed to pin to IPFS');
  }
}
