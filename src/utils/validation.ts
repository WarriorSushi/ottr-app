/**
 * Validation Utilities
 * 
 * Validation functions for user input in the Ottr app.
 */

/**
 * Validate username format
 * - Must start with @
 * - 3-20 characters (including @)
 * - Only letters, numbers, and underscores
 * @param username Username to validate
 * @returns Object with isValid and error message
 */
export const validateUsername = (username: string): { isValid: boolean; error: string } => {
  // Check if username starts with @
  if (!username.startsWith('@')) {
    return { isValid: false, error: 'Username must start with @' };
  }

  // Remove @ for length check (username should be 2-19 chars without @)
  const usernameWithoutAt = username.substring(1);
  
  // Check length (2-19 chars without @, 3-20 with @)
  if (usernameWithoutAt.length < 2 || usernameWithoutAt.length > 19) {
    return { isValid: false, error: 'Username must be 3-20 characters (including @)' };
  }

  // Check for valid characters (letters, numbers, underscores)
  const validUsernameRegex = /^[a-zA-Z0-9_]+$/;
  if (!validUsernameRegex.test(usernameWithoutAt)) {
    return { isValid: false, error: 'Username can only contain letters, numbers, and underscores' };
  }

  return { isValid: true, error: '' };
};

/**
 * Validate display name
 * - 2-50 characters
 * - Not empty
 * @param displayName Display name to validate
 * @returns Object with isValid and error message
 */
export const validateDisplayName = (displayName: string): { isValid: boolean; error: string } => {
  // Check if display name is empty
  if (!displayName || displayName.trim() === '') {
    return { isValid: false, error: 'Display name cannot be empty' };
  }

  // Check length
  if (displayName.length < 2 || displayName.length > 50) {
    return { isValid: false, error: 'Display name must be 2-50 characters' };
  }

  return { isValid: true, error: '' };
};

/**
 * Validate email format
 * @param email Email to validate
 * @returns Object with isValid and error message
 */
export const validateEmail = (email: string): { isValid: boolean; error: string } => {
  // Simple email regex
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
  if (!email || email.trim() === '') {
    return { isValid: false, error: 'Email cannot be empty' };
  }

  if (!emailRegex.test(email)) {
    return { isValid: false, error: 'Please enter a valid email address' };
  }

  return { isValid: true, error: '' };
};

export default {
  validateUsername,
  validateDisplayName,
  validateEmail,
};
