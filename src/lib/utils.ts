import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Convert image path or Base64 string to a usable URL
 * Supports file paths from disk (stored in database) and Base64 data URIs
 */
export function getImageUrl(imagePath: string | undefined | null): string {
  if (!imagePath) {
    return '/placeholder.svg';
  }

  const path = String(imagePath).trim();
  
  // If it's already a data URL (Base64), return as-is
  if (path.startsWith('data:')) {
    return path;
  }
  
  // If it's an HTTP URL, return as-is
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }
  
  // If it's a file path (e.g., "uploads/products/..."), convert to API call
  if (path.startsWith('uploads/')) {
    return `/api/images?path=${encodeURIComponent(path)}`;
  }
  
  // If it's a local path starting with /, return as-is
  if (path.startsWith('/')) {
    return path;
  }
  
  // If it's raw Base64 without data URI prefix, add the prefix
  if (path.length > 0 && !path.startsWith('placeholder')) {
    return `data:image/jpeg;base64,${path}`;
  }
  
  return '/placeholder.svg';
}

/**
 * Get the primary image URL for a product
 * Checks new path columns first, then falls back to Base64 columns
 */
export function getProductImageUrl(product: any): string {
  const path = product.imagePath || product.image || product.imagefirst;
  if (!path || path === 'placeholder') return '/placeholder.svg';
  if (path.startsWith('data:') || path.startsWith('http')) return path;
  // For server file paths, use the API image endpoint
  return `/api/images?path=${encodeURIComponent(path)}`;
}
 