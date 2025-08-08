/**
 * Input Validation Composable
 * Implements CSSECDV requirements:
 * - 2.3.1: All validation failures should result in input rejection (no sanitization)
 * - 2.3.2: Validate data range 
 * - 2.3.3: Validate data length
 * - 2.4.5: Log all input validation failures
 */

import { ref, reactive } from 'vue';

export const useInputValidation = () => {
  // Validation state
  const validationErrors = ref([]);
  const isValid = ref(true);

  // Validation rules configuration
  const validationRules = {
    // Common patterns for rejection
    patterns: {
      // SQL injection patterns
      sqlInjection: /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION|SCRIPT)\b)|['"`;\\]/i,
      
      // XSS patterns  
      xss: /<\s*script|javascript:|vbscript:|onload|onerror|onclick|onmouseover/i,
      
      // Path traversal patterns
      pathTraversal: /(\.\.[\/\\])|(\.\.\%2f)|(\.\.\%5c)/i,
      
      // Command injection patterns
      commandInjection: /[\|\&\;\`\$\(\)\{\}\[\]]/,
      
      // LDAP injection patterns
      ldapInjection: /[\(\)\*\\\|\&]/,
      
      // Email format
      email: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
      
      // Phone number format (basic)
      phone: /^[\+]?[\d\s\-\(\)]{10,15}$/,
      
      // Alphanumeric with common safe characters
      alphanumericSafe: /^[a-zA-Z0-9\s\-_\.@]+$/,
      
      // Name format (letters, spaces, hyphens, apostrophes)
      name: /^[a-zA-Z\s\-'\.]+$/,
      
      // Numeric only
      numeric: /^\d+$/,
      
      // Decimal numbers
      decimal: /^\d+(\.\d+)?$/,
      
      // Safe text (no special chars that could be malicious)
      safeText: /^[a-zA-Z0-9\s\.\,\!\?\-_@#$%&*()\[\]{}+=:;"'<>\/\\|`~]+$/
    },

    // Length limits by field type
    lengths: {
      shortText: { min: 1, max: 50 },
      mediumText: { min: 1, max: 255 },
      longText: { min: 1, max: 1000 },
      email: { min: 5, max: 100 },
      phone: { min: 10, max: 15 },
      name: { min: 1, max: 100 },
      password: { min: 12, max: 128 },
      description: { min: 1, max: 2000 },
      address: { min: 10, max: 500 }
    },

    // Numeric ranges by field type
    ranges: {
      age: { min: 16, max: 100 },
      salary: { min: 0, max: 10000000 },
      hourlyRate: { min: 0, max: 1000 },
      percentage: { min: 0, max: 100 },
      month: { min: 1, max: 12 },
      day: { min: 1, max: 31 },
      year: { min: 1900, max: 2100 },
      hours: { min: 0, max: 24 },
      minutes: { min: 0, max: 59 }
    }
  };

  /**
   * Main validation function - rejects input on any failure
   * @param {string|number} value - Value to validate
   * @param {Object} rules - Validation rules
   * @returns {Object} Validation result
   */
  function validateInput(value, rules = {}) {
    const errors = [];
    let validValue = value;

    // Convert to string for pattern matching
    const stringValue = String(value).trim();

    try {
      // 1. Required field validation
      if (rules.required && (!value || stringValue === '')) {
        errors.push(`This field is required`);
      }

      if (stringValue === '' && !rules.required) {
        // Empty optional field is valid
        return createValidationResult(true, [], validValue);
      }

      // 2. Length validation (CSSECDV 2.3.3)
      if (rules.length) {
        const lengthConfig = rules.length;
        
        if (lengthConfig.min && stringValue.length < lengthConfig.min) {
          errors.push(`Must be at least ${lengthConfig.min} characters long`);
        }
        
        if (lengthConfig.max && stringValue.length > lengthConfig.max) {
          errors.push(`Must not exceed ${lengthConfig.max} characters`);
        }
        
        if (lengthConfig.exact && stringValue.length !== lengthConfig.exact) {
          errors.push(`Must be exactly ${lengthConfig.exact} characters long`);
        }
      }

      // 3. Security pattern rejection (CSSECDV 2.3.1 - NO SANITIZATION)
      if (rules.rejectMalicious !== false) {
        if (validationRules.patterns.sqlInjection.test(stringValue)) {
          errors.push('Input contains potentially malicious content and has been rejected');
          logValidationFailure('sql_injection_attempt', stringValue, rules.fieldName);
        }
        
        if (validationRules.patterns.xss.test(stringValue)) {
          errors.push('Input contains potentially malicious content and has been rejected');
          logValidationFailure('xss_attempt', stringValue, rules.fieldName);
        }
        
        if (validationRules.patterns.pathTraversal.test(stringValue)) {
          errors.push('Input contains potentially malicious content and has been rejected');
          logValidationFailure('path_traversal_attempt', stringValue, rules.fieldName);
        }
        
        if (validationRules.patterns.commandInjection.test(stringValue)) {
          errors.push('Input contains potentially malicious content and has been rejected');
          logValidationFailure('command_injection_attempt', stringValue, rules.fieldName);
        }
      }

      // 4. Pattern validation
      if (rules.pattern) {
        if (typeof rules.pattern === 'string') {
          const pattern = validationRules.patterns[rules.pattern];
          if (pattern && !pattern.test(stringValue)) {
            errors.push(`Invalid format for ${rules.fieldName || 'this field'}`);
          }
        } else if (rules.pattern instanceof RegExp) {
          if (!rules.pattern.test(stringValue)) {
            errors.push(`Invalid format for ${rules.fieldName || 'this field'}`);
          }
        }
      }

      // 5. Range validation for numeric values (CSSECDV 2.3.2)
      if (rules.range && !isNaN(value)) {
        const numericValue = Number(value);
        const rangeConfig = rules.range;
        
        if (rangeConfig.min !== undefined && numericValue < rangeConfig.min) {
          errors.push(`Value must be at least ${rangeConfig.min}`);
        }
        
        if (rangeConfig.max !== undefined && numericValue > rangeConfig.max) {
          errors.push(`Value must not exceed ${rangeConfig.max}`);
        }
      }

      // 6. Custom validation function
      if (rules.custom && typeof rules.custom === 'function') {
        const customResult = rules.custom(value);
        if (customResult !== true && customResult) {
          errors.push(customResult);
        }
      }

      // 7. Type-specific validation
      if (rules.type) {
        switch (rules.type) {
          case 'email':
            if (!validationRules.patterns.email.test(stringValue)) {
              errors.push('Please enter a valid email address');
            }
            break;
            
          case 'phone':
            if (!validationRules.patterns.phone.test(stringValue.replace(/\s/g, ''))) {
              errors.push('Please enter a valid phone number');
            }
            break;
            
          case 'numeric':
            if (!validationRules.patterns.numeric.test(stringValue)) {
              errors.push('This field must contain only numbers');
            }
            break;
            
          case 'decimal':
            if (!validationRules.patterns.decimal.test(stringValue)) {
              errors.push('Please enter a valid number');
            }
            break;
            
          case 'name':
            if (!validationRules.patterns.name.test(stringValue)) {
              errors.push('Names can only contain letters, spaces, hyphens, and apostrophes');
            }
            break;
        }
      }

      // Log validation failures (CSSECDV 2.4.5)
      if (errors.length > 0) {
        logValidationFailure('input_validation_failed', stringValue, rules.fieldName, errors);
      }

      return createValidationResult(errors.length === 0, errors, validValue);

    } catch (error) {
      console.error('Validation error:', error);
      logValidationFailure('validation_system_error', stringValue, rules.fieldName, [error.message]);
      return createValidationResult(false, ['Validation error occurred'], validValue);
    }
  }

  /**
   * Validate multiple fields at once
   * @param {Object} data - Data object to validate
   * @param {Object} schema - Validation schema
   * @returns {Object} Validation results
   */
  function validateForm(data, schema) {
    const results = {};
    const allErrors = [];
    let isFormValid = true;

    for (const [fieldName, rules] in Object.entries(schema)) {
      const fieldRules = { ...rules, fieldName };
      const result = validateInput(data[fieldName], fieldRules);
      
      results[fieldName] = result;
      
      if (!result.isValid) {
        isFormValid = false;
        allErrors.push(...result.errors.map(error => `${fieldName}: ${error}`));
      }
    }

    return {
      isValid: isFormValid,
      errors: allErrors,
      fieldResults: results
    };
  }

  /**
   * Quick validation presets for common field types
   */
  const presetValidators = {
    email: (value, required = true) => validateInput(value, {
      required,
      type: 'email',
      length: validationRules.lengths.email,
      fieldName: 'email'
    }),

    name: (value, required = true) => validateInput(value, {
      required,
      type: 'name',
      length: validationRules.lengths.name,
      fieldName: 'name'
    }),

    phone: (value, required = true) => validateInput(value, {
      required,
      type: 'phone',
      length: validationRules.lengths.phone,
      fieldName: 'phone'
    }),

    password: (value, required = true) => validateInput(value, {
      required,
      length: validationRules.lengths.password,
      fieldName: 'password'
    }),

    salary: (value, required = true) => validateInput(value, {
      required,
      type: 'decimal',
      range: validationRules.ranges.salary,
      fieldName: 'salary'
    }),

    safeText: (value, required = true, maxLength = 255) => validateInput(value, {
      required,
      pattern: 'safeText',
      length: { min: required ? 1 : 0, max: maxLength },
      fieldName: 'text'
    })
  };

  /**
   * Create validation result object
   * @param {boolean} isValid 
   * @param {Array} errors 
   * @param {*} value 
   * @returns {Object}
   */
  function createValidationResult(isValid, errors, value) {
    return {
      isValid,
      errors: [...errors],
      value,
      hasErrors: errors.length > 0
    };
  }

  /**
   * Log validation failures for security monitoring (CSSECDV 2.4.5)
   * @param {string} type 
   * @param {string} value 
   * @param {string} fieldName 
   * @param {Array} errors 
   */
  async function logValidationFailure(type, value, fieldName = 'unknown', errors = []) {
    try {
      const user = useSupabaseUser();
      
      // Determine severity based on failure type
      let severity = 'low';
      if (type.includes('injection') || type.includes('xss') || type.includes('traversal')) {
        severity = 'high';
      } else if (type === 'validation_system_error') {
        severity = 'critical';
      }

      await fetch('/api/security/log-event', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userId: user.value?.id || null,
          eventType: type,
          description: `Input validation failure for field '${fieldName}': ${errors.join(', ')}`,
          severity,
          timestamp: new Date().toISOString()
        })
      });
    } catch (error) {
      console.error('Error logging validation failure:', error);
    }
  }

  /**
   * Check if a value is safe (passes security checks)
   * @param {string} value 
   * @returns {boolean}
   */
  function isSafe(value) {
    const stringValue = String(value);
    return !validationRules.patterns.sqlInjection.test(stringValue) &&
           !validationRules.patterns.xss.test(stringValue) &&
           !validationRules.patterns.pathTraversal.test(stringValue) &&
           !validationRules.patterns.commandInjection.test(stringValue);
  }

  return {
    // Main validation functions
    validateInput,
    validateForm,
    
    // Preset validators
    presetValidators,
    
    // Security utilities
    isSafe,
    logValidationFailure,
    
    // Configuration
    validationRules: readonly(ref(validationRules)),
    
    // State
    validationErrors: readonly(validationErrors),
    isValid: readonly(isValid)
  };
};