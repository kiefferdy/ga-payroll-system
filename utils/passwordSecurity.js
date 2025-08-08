/**
 * Password Security Utilities for CSSECDV Compliance
 * Implements requirements from CSSECDV Case Project Checklist
 */

/**
 * Validates password complexity according to CSSECDV requirements:
 * - At least 8 characters long
 * - Contains uppercase letter
 * - Contains lowercase letter  
 * - Contains at least one number
 * - Contains at least one special character
 * @param {string} password - Password to validate
 * @returns {Object} - Validation result with isValid boolean and errors array
 */
export function validatePasswordComplexity(password) {
  const errors = [];
  
  if (!password) {
    errors.push('Password is required');
    return { isValid: false, errors };
  }

  // Length requirement (minimum 8 characters)
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }

  // Maximum length for security (prevent DoS attacks)
  if (password.length > 128) {
    errors.push('Password must be no more than 128 characters long');
  }

  // Uppercase letter requirement
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }

  // Lowercase letter requirement  
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }

  // Number requirement
  if (!/\d/.test(password)) {
    errors.push('Password must contain at least one number');
  }

  // Special character requirement
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~`]/.test(password)) {
    errors.push('Password must contain at least one special character (!@#$%^&*()_+-=[]{}|;:,.<>?)');
  }

  // Check for common weak passwords
  const commonPasswords = [
    'password', 'password123', '12345678', 'qwerty', 'abc123',
    'password1', 'admin', 'letmein', 'welcome', 'monkey',
    '123456789', 'password!', 'Password1', 'admin123'
  ];
  
  if (commonPasswords.includes(password.toLowerCase())) {
    errors.push('Password is too common. Please choose a more secure password');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Validates that passwords match
 * @param {string} password - Original password
 * @param {string} confirmPassword - Confirmation password  
 * @returns {Object} - Validation result
 */
export function validatePasswordMatch(password, confirmPassword) {
  if (!confirmPassword) {
    return { isValid: false, error: 'Password confirmation is required' };
  }
  
  if (password !== confirmPassword) {
    return { isValid: false, error: 'Passwords do not match' };
  }
  
  return { isValid: true, error: null };
}

/**
 * Generates secure password requirements message for UI
 * @returns {string} - Human readable password requirements
 */
export function getPasswordRequirements() {
  return `Password must contain:
• At least 8 characters
• At least one uppercase letter (A-Z)
• At least one lowercase letter (a-z)
• At least one number (0-9)
• At least one special character (!@#$%^&*()_+-=[]{}|;:,.<>?)`;
}

/**
 * Checks if password meets minimum age requirement (1 day)
 * @param {Date} lastPasswordChange - Date of last password change
 * @returns {Object} - Validation result
 */
export function validatePasswordAge(lastPasswordChange) {
  if (!lastPasswordChange) {
    return { isValid: true, error: null }; // First time setting password
  }
  
  const oneDayInMs = 24 * 60 * 60 * 1000;
  const now = new Date();
  const timeSinceLastChange = now - new Date(lastPasswordChange);
  
  if (timeSinceLastChange < oneDayInMs) {
    const hoursRemaining = Math.ceil((oneDayInMs - timeSinceLastChange) / (60 * 60 * 1000));
    return { 
      isValid: false, 
      error: `Password can only be changed once per day. Please wait ${hoursRemaining} more hours.`
    };
  }
  
  return { isValid: true, error: null };
}

/**
 * Generates a generic error message for authentication failures
 * This prevents information disclosure about whether username or password was incorrect
 * @returns {string} - Generic error message
 */
export function getGenericAuthError() {
  return 'Invalid username and/or password';
}

/**
 * Validates email format with improved regex
 * @param {string} email - Email to validate
 * @returns {Object} - Validation result
 */
export function validateEmail(email) {
  if (!email) {
    return { isValid: false, error: 'Email is required' };
  }
  
  // More comprehensive email validation regex
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
  
  if (!emailRegex.test(email)) {
    return { isValid: false, error: 'Please enter a valid email address' };
  }
  
  // Length validation
  if (email.length > 254) {
    return { isValid: false, error: 'Email address is too long' };
  }
  
  return { isValid: true, error: null };
}

/**
 * Validates input length to prevent buffer overflow attacks
 * @param {string} input - Input to validate
 * @param {number} maxLength - Maximum allowed length
 * @param {string} fieldName - Name of field for error message
 * @returns {Object} - Validation result
 */
export function validateInputLength(input, maxLength, fieldName) {
  if (!input) {
    return { isValid: false, error: `${fieldName} is required` };
  }
  
  if (input.length > maxLength) {
    return { isValid: false, error: `${fieldName} must be no more than ${maxLength} characters` };
  }
  
  return { isValid: true, error: null };
}