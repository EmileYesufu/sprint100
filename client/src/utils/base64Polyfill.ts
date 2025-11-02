/**
 * Base64 polyfill for React Native
 * Provides atob and btoa functions that don't exist in React Native
 */

// Simple base64 decode implementation for React Native
// Handles both standard base64 and URL-safe base64 (JWT uses URL-safe)
function atobImpl(input: string): string {
  // Convert URL-safe base64 to standard base64 (JWT tokens use URL-safe encoding)
  let str = input.replace(/-/g, '+').replace(/_/g, '/');
  
  // Add padding if needed
  while (str.length % 4) {
    str += '=';
  }
  
  // Fallback implementation
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
  str = str.replace(/=+$/, '');
  let output = '';
  
  if (str.length % 4 === 1) {
    throw new Error("'atob' failed: The string to be decoded is not correctly encoded.");
  }
  
  for (let bc = 0, bs = 0, buffer, i = 0; buffer = str.charAt(i++); ) {
    if (buffer && (buffer = chars.indexOf(buffer)) >= 0) {
      bs = bc % 4 ? bs * 64 + buffer : buffer;
      if (bc++ % 4) {
        output += String.fromCharCode(255 & bs >> (-2 * bc & 6));
      }
    }
  }
  
  return output;
}

// Simple base64 encode implementation for React Native
function btoaImpl(input: string): string {
  // Fallback implementation
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
  let str = input;
  let output = '';
  
  for (let block = 0, charCode, i = 0, map = chars; str.charAt(i | 0) || (map = '=', i % 1); output += map.charAt(63 & block >> 8 - i % 1 * 8)) {
    charCode = str.charCodeAt(i |= 0);
    if (charCode > 0xFF) {
      throw new Error("'btoa' failed: The string to be encoded contains characters outside of the Latin1 range.");
    }
    block = block << 8 | charCode;
  }
  
  return output;
}

// Install polyfill globally only if they don't exist
// Use a flag to prevent recursive calls
if (typeof (global as any).atob === 'undefined') {
  (global as any).atob = function(input: string): string {
    return atobImpl(input);
  };
}

if (typeof (global as any).btoa === 'undefined') {
  (global as any).btoa = function(input: string): string {
    return btoaImpl(input);
  };
}

