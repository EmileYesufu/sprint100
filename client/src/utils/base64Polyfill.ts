/**
 * Base64 polyfill for React Native
 * Provides atob and btoa functions that don't exist in React Native
 */

// Simple base64 decode implementation for React Native
export function atob(input: string): string {
  if (typeof global.atob !== 'undefined') {
    return global.atob(input);
  }
  
  // Fallback implementation
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
  let str = input.replace(/=+$/, '');
  let output = '';
  
  if (str.length % 4 === 1) {
    throw new Error("'atob' failed: The string to be decoded is not correctly encoded.");
  }
  
  for (let bc = 0, bs = 0, buffer, i = 0; buffer = str.charAt(i++); ) {
    if (buffer && (buffer = chars.indexOf(buffer))) {
      bs = bc % 4 ? bs * 64 + buffer : buffer;
      if (bc++ % 4) {
        output += String.fromCharCode(255 & bs >> (-2 * bc & 6));
      }
    }
  }
  
  return output;
}

// Simple base64 encode implementation for React Native
export function btoa(input: string): string {
  if (typeof global.btoa !== 'undefined') {
    return global.btoa(input);
  }
  
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

// Install polyfill globally
if (typeof global.atob === 'undefined') {
  global.atob = atob;
}

if (typeof global.btoa === 'undefined') {
  global.btoa = btoa;
}

