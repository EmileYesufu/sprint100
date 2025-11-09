/**
 * Email Validation Utility
 * Validates email format
 * 
 * Returns: { valid: boolean, message?: string }
 */

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

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
  if (!emailPattern.test(trimmedEmail)) {
    return { valid: false, message: 'Please enter a valid email format.' };
  }

  return { valid: true };
}

