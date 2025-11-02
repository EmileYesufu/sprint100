/**
 * Email Validation Utility
 * Validates email format and enforces domain whitelist for security
 * 
 * Returns: { valid: boolean, message?: string }
 */

export function validateEmail(email: string): { valid: boolean; message?: string } {
  // Check if email is provided and is a string
  if (!email || typeof email !== 'string') {
    return { valid: false, message: 'Please enter an email address.' };
  }

  // Trim whitespace
  const trimmedEmail = email.trim();
  
  if (!trimmedEmail) {
    return { valid: false, message: 'Please enter an email address.' };
  }

  // Basic email format validation
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailPattern.test(trimmedEmail)) {
    return { valid: false, message: 'Please enter a valid email format.' };
  }

  // Extract domain from email
  const domain = trimmedEmail.split('@')[1]?.toLowerCase();
  
  if (!domain) {
    return { valid: false, message: 'Please enter a valid email format.' };
  }

  // ✅ Whitelist of acceptable email domains
  const allowedDomains = [
    'hotmail.com',
    'gmail.com',
    'outlook.com',
    'icloud.com',
    'yahoo.com',
    'protonmail.com',
    'proton.me', // ProtonMail also uses this domain
    'live.com', // Microsoft Live/Hotmail
    'msn.com', // Microsoft
  ];

  // Check if domain is in whitelist
  if (!allowedDomains.includes(domain)) {
    return {
      valid: false,
      message: `Only popular email providers allowed (e.g., ${allowedDomains.slice(0, 5).join(', ')}, etc.)`,
    };
  }

  return { valid: true };
}

