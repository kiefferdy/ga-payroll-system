/**
 * Password Validation Composable
 * Implements CSSECDV requirements:
 * - 2.1.5: Password complexity requirements
 * - 2.1.6: Password length requirements  
 * - 2.1.10: Password reuse prevention
 * - 2.1.11: Password age requirements (1-day minimum)
 */

import { ref, computed } from 'vue';
import { createClient } from '@supabase/supabase-js';

export const usePasswordValidation = () => {
  const supabase = useSupabaseClient();
  
  // Password policy configuration
  const passwordPolicy = {
    minLength: 12,
    maxLength: 128,
    requireUppercase: true,
    requireLowercase: true,
    requireNumbers: true,
    requireSpecialChars: true,
    preventReuse: true,
    reuseHistoryLimit: 12, // Remember last 12 passwords
    minPasswordAge: 86400000, // 1 day in milliseconds
    specialChars: '!@#$%^&*()_+-=[]{}|;:,.<>?'
  };

  const validationResult = ref({
    isValid: false,
    errors: [],
    score: 0,
    feedback: []
  });

  /**
   * Validate password against all policy requirements
   * @param {string} password - Password to validate
   * @param {string} userId - Optional user ID for checking reuse/age
   * @returns {Promise<Object>} Validation result
   */
  async function validatePassword(password, userId = null) {
    const errors = [];
    const feedback = [];
    let score = 0;

    // Reset validation result
    validationResult.value = {
      isValid: false,
      errors: [],
      score: 0,
      feedback: []
    };

    if (!password) {
      errors.push('Password is required');
      return updateValidationResult(false, errors, 0, feedback);
    }

    // Length validation (CSSECDV 2.1.6)
    if (password.length < passwordPolicy.minLength) {
      errors.push(`Password must be at least ${passwordPolicy.minLength} characters long`);
    } else if (password.length >= passwordPolicy.minLength) {
      score += 10;
      feedback.push('✓ Minimum length requirement met');
    }

    if (password.length > passwordPolicy.maxLength) {
      errors.push(`Password must not exceed ${passwordPolicy.maxLength} characters`);
    }

    // Complexity validation (CSSECDV 2.1.5)
    const hasUppercase = /[A-Z]/.test(password);
    const hasLowercase = /[a-z]/.test(password);
    const hasNumbers = /[0-9]/.test(password);
    const hasSpecialChars = new RegExp(`[${passwordPolicy.specialChars.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}]`).test(password);

    if (passwordPolicy.requireUppercase && !hasUppercase) {
      errors.push('Password must contain at least one uppercase letter');
    } else if (hasUppercase) {
      score += 15;
      feedback.push('✓ Contains uppercase letters');
    }

    if (passwordPolicy.requireLowercase && !hasLowercase) {
      errors.push('Password must contain at least one lowercase letter');
    } else if (hasLowercase) {
      score += 15;
      feedback.push('✓ Contains lowercase letters');
    }

    if (passwordPolicy.requireNumbers && !hasNumbers) {
      errors.push('Password must contain at least one number');
    } else if (hasNumbers) {
      score += 15;
      feedback.push('✓ Contains numbers');
    }

    if (passwordPolicy.requireSpecialChars && !hasSpecialChars) {
      errors.push(`Password must contain at least one special character (${passwordPolicy.specialChars})`);
    } else if (hasSpecialChars) {
      score += 15;
      feedback.push('✓ Contains special characters');
    }

    // Additional security checks
    if (password.length >= 16) {
      score += 5;
      feedback.push('✓ Extra length bonus');
    }

    // Check for common patterns
    if (!/(.)\1{2,}/.test(password)) {
      score += 10;
      feedback.push('✓ No repetitive characters');
    } else {
      errors.push('Password should not contain repetitive characters');
    }

    // Check for sequential patterns
    if (!hasSequentialChars(password)) {
      score += 10;
      feedback.push('✓ No sequential patterns detected');
    } else {
      errors.push('Password should not contain sequential patterns (abc, 123, etc.)');
    }

    // User-specific validations (if userId provided)
    if (userId) {
      try {
        // Check password reuse (CSSECDV 2.1.10)
        if (passwordPolicy.preventReuse) {
          const isReused = await checkPasswordReuse(password, userId);
          if (isReused) {
            errors.push(`Password has been used recently. Choose a different password.`);
          } else {
            score += 10;
            feedback.push('✓ Not previously used');
          }
        }

        // Check password age requirements (CSSECDV 2.1.11)
        const canChangePassword = await checkPasswordAge(userId);
        if (!canChangePassword) {
          errors.push('Password must be at least 1 day old before it can be changed');
        }
      } catch (error) {
        console.error('Error validating user-specific password requirements:', error);
        // Don't block validation for database errors, but log them
      }
    }

    const isValid = errors.length === 0;
    return updateValidationResult(isValid, errors, score, feedback);
  }

  /**
   * Check for sequential characters in password
   * @param {string} password 
   * @returns {boolean} True if sequential patterns found
   */
  function hasSequentialChars(password) {
    const sequences = [
      'abcdefghijklmnopqrstuvwxyz',
      'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
      '0123456789',
      'qwertyuiopasdfghjklzxcvbnm'
    ];

    for (const sequence of sequences) {
      for (let i = 0; i <= sequence.length - 3; i++) {
        const seq = sequence.substring(i, i + 3);
        if (password.includes(seq) || password.includes(seq.split('').reverse().join(''))) {
          return true;
        }
      }
    }
    return false;
  }

  /**
   * Check if password was recently used (CSSECDV 2.1.10)
   * @param {string} password 
   * @param {string} userId 
   * @returns {Promise<boolean>}
   */
  async function checkPasswordReuse(password, userId) {
    try {
      // Get recent password hashes for this user
      const { data, error } = await supabase
        .from('password_history')
        .select('password_hash')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(passwordPolicy.reuseHistoryLimit);

      if (error) throw error;

      // Since we can't hash the password client-side for comparison,
      // we'll need to send this to a server endpoint for secure comparison
      const response = await fetch('/api/auth/check-password-reuse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          password,
          userId,
          previousHashes: data?.map(h => h.password_hash) || []
        })
      });

      const result = await response.json();
      return result.isReused || false;
    } catch (error) {
      console.error('Error checking password reuse:', error);
      return false; // Don't block on error
    }
  }

  /**
   * Check password age requirements (CSSECDV 2.1.11)
   * @param {string} userId 
   * @returns {Promise<boolean>}
   */
  async function checkPasswordAge(userId) {
    try {
      const { data, error } = await supabase
        .from('Employees')
        .select('password_changed_at')
        .eq('id', userId)
        .single();

      if (error) throw error;

      let referenceDate;
      
      if (!data.password_changed_at) {
        // For fresh accounts, get the account creation date from current session
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          console.error('No authenticated user found');
          return false; // Block on error to be safe
        }
        
        // Use account creation date as reference
        referenceDate = new Date(user.created_at);
      } else {
        // Use last password change date
        referenceDate = new Date(data.password_changed_at);
      }

      const now = new Date();
      const timeDiff = now.getTime() - referenceDate.getTime();

      return timeDiff >= passwordPolicy.minPasswordAge;
    } catch (error) {
      console.error('Error checking password age:', error);
      return false; // Block on error to be safe
    }
  }

  /**
   * Update validation result
   * @param {boolean} isValid 
   * @param {string[]} errors 
   * @param {number} score 
   * @param {string[]} feedback 
   * @returns {Object}
   */
  function updateValidationResult(isValid, errors, score, feedback) {
    validationResult.value = {
      isValid,
      errors: [...errors],
      score: Math.min(score, 100),
      feedback: [...feedback]
    };
    return validationResult.value;
  }

  /**
   * Get password strength description based on score
   * @param {number} score 
   * @returns {Object}
   */
  function getStrengthInfo(score) {
    if (score >= 90) {
      return { level: 'excellent', color: 'text-green-600', bgColor: 'bg-green-500' };
    } else if (score >= 70) {
      return { level: 'strong', color: 'text-green-500', bgColor: 'bg-green-400' };
    } else if (score >= 50) {
      return { level: 'moderate', color: 'text-yellow-500', bgColor: 'bg-yellow-400' };
    } else if (score >= 30) {
      return { level: 'weak', color: 'text-orange-500', bgColor: 'bg-orange-400' };
    } else {
      return { level: 'very weak', color: 'text-red-500', bgColor: 'bg-red-400' };
    }
  }

  /**
   * Store password in history after successful change
   * @param {string} userId 
   * @param {string} passwordHash 
   */
  async function storePasswordHistory(userId, passwordHash) {
    try {
      await fetch('/api/auth/store-password-history', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          passwordHash
        })
      });
    } catch (error) {
      console.error('Error storing password history:', error);
    }
  }

  // Computed properties
  const strengthInfo = computed(() => getStrengthInfo(validationResult.value.score));
  const isValid = computed(() => validationResult.value.isValid);
  const errors = computed(() => validationResult.value.errors);
  const feedback = computed(() => validationResult.value.feedback);
  const score = computed(() => validationResult.value.score);

  return {
    // State
    validationResult: readonly(validationResult),
    passwordPolicy: readonly(ref(passwordPolicy)),

    // Computed
    strengthInfo,
    isValid,
    errors,
    feedback,
    score,

    // Methods
    validatePassword,
    checkPasswordReuse,
    checkPasswordAge,
    storePasswordHistory,
    getStrengthInfo
  };
};