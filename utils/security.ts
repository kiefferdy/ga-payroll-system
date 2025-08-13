// Client-side security utilities - server-side Supabase operations are handled elsewhere

export interface SecurityEvent {
  eventType: string
  userId?: string
  userEmail?: string
  ipAddress?: string
  userAgent?: string
  resourceAccessed?: string
  details?: Record<string, any>
  severity?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
}

/**
 * Log security events to the SecurityLogs table
 * This function should be called from client-side components
 */
export async function logSecurityEvent(event: SecurityEvent) {
  try {
    // Send to API endpoint for server-side logging
    await $fetch('/api/log-security-event', {
      method: 'POST',
      body: {
        eventType: event.eventType,
        userId: event.userId,
        userEmail: event.userEmail,
        ipAddress: event.ipAddress,
        userAgent: event.userAgent,
        resourceAccessed: event.resourceAccessed,
        details: event.details,
        severity: event.severity || 'MEDIUM'
      }
    })
  } catch (error) {
    console.error('Error logging security event:', error)
  }
}

/**
 * Centralized authorization check - replaces duplicate authenticateUser functions
 * @deprecated Use hasPermission() with specific permissions instead of role-based checks
 * This function should be used from client-side components
 */
export async function checkUserAuthorization(
  userId: string,
  requiredRoles: Array<'Admin' | 'Developer' | 'Employee'> = ['Admin', 'Developer']
): Promise<{ authorized: boolean; userRole?: string; error?: string }> {
  try {
    const response = await $fetch('/api/check-authorization', {
      method: 'POST',
      body: {
        userId,
        requiredRoles
      }
    })
    
    return response as { authorized: boolean; userRole?: string; error?: string }
  } catch (error: any) {
    console.error('Authorization check failed:', error)
    
    // Handle authentication errors specifically
    if (error?.status === 401 || error?.statusMessage?.includes('Authentication')) {
      return { 
        authorized: false, 
        error: 'Authentication required. Please log in again.' 
      }
    }
    
    return { authorized: false, error: 'Authorization check failed' }
  }
}

/**
 * Enhanced authentication logging
 */
export async function logAuthenticationAttempt(
  eventType: 'LOGIN_SUCCESS' | 'LOGIN_FAILED' | 'LOGOUT' | 'SESSION_EXPIRED',
  email: string,
  userId?: string,
  ipAddress?: string,
  userAgent?: string,
  details?: Record<string, any>
) {
  await logSecurityEvent({
    eventType,
    userId,
    userEmail: email,
    ipAddress,
    userAgent,
    details,
    severity: eventType === 'LOGIN_FAILED' ? 'HIGH' : 'LOW'
  })
}

/**
 * Log input validation failures
 */
export async function logValidationFailure(
  field: string,
  value: string,
  validationType: string,
  userId?: string,
  ipAddress?: string
) {
  await logSecurityEvent({
    eventType: 'INPUT_VALIDATION_FAILED',
    userId,
    ipAddress,
    details: {
      field,
      value: value.substring(0, 50), // Truncate sensitive data
      validationType
    },
    severity: 'MEDIUM'
  })
}

/**
 * Fetch password policy settings from database
 */
export async function getPasswordPolicySettings(): Promise<{
  minLength: number
  requireUppercase: boolean
  requireLowercase: boolean
  requireNumbers: boolean
  requireSpecialChars: boolean
  enableComplexity: boolean
}> {
  try {
    const response = await $fetch('/api/get-password-policy-settings')
    return response as {
      minLength: number
      requireUppercase: boolean
      requireLowercase: boolean
      requireNumbers: boolean
      requireSpecialChars: boolean
      enableComplexity: boolean
    }
  } catch (error) {
    console.error('Error fetching password policy settings:', error)
    // Return defaults if API fails
    return {
      minLength: 8,
      requireUppercase: true,
      requireLowercase: true,
      requireNumbers: true,
      requireSpecialChars: true,
      enableComplexity: true
    }
  }
}

/**
 * Password complexity validation with configurable settings
 */
export async function validatePasswordComplexity(password: string): Promise<{
  valid: boolean
  errors: string[]
  strength: 'WEAK' | 'MEDIUM' | 'STRONG'
}> {
  const settings = await getPasswordPolicySettings()
  const errors: string[] = []
  let score = 0

  // If password complexity is disabled, only check minimum length
  if (!settings.enableComplexity) {
    if (password.length < settings.minLength) {
      errors.push(`Password must be at least ${settings.minLength} characters long`)
    } else {
      score = 3 // Consider it medium strength if it meets minimum length
    }
    return {
      valid: errors.length === 0,
      errors,
      strength: score >= 3 ? 'MEDIUM' : 'WEAK'
    }
  }

  // Minimum length check
  if (password.length < settings.minLength) {
    errors.push(`Password must be at least ${settings.minLength} characters long`)
  } else {
    score += 1
  }

  // Uppercase letter check
  if (settings.requireUppercase && !/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter')
  } else if (settings.requireUppercase) {
    score += 1
  }

  // Lowercase letter check
  if (settings.requireLowercase && !/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter')
  } else if (settings.requireLowercase) {
    score += 1
  }

  // Number check
  if (settings.requireNumbers && !/\d/.test(password)) {
    errors.push('Password must contain at least one number')
  } else if (settings.requireNumbers) {
    score += 1
  }

  // Special character check
  if (settings.requireSpecialChars && !/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\?]/.test(password)) {
    errors.push('Password must contain at least one special character (!@#$%^&*)')
  } else if (settings.requireSpecialChars) {
    score += 1
  }

  // Common passwords check (basic)
  const commonPasswords = ['password', '123456', 'qwerty', 'admin', 'welcome']
  if (commonPasswords.some(common => password.toLowerCase().includes(common))) {
    errors.push('Password contains common words and is not secure')
    score -= 1
  }

  const maxScore = 1 + // length
    (settings.requireUppercase ? 1 : 0) +
    (settings.requireLowercase ? 1 : 0) +
    (settings.requireNumbers ? 1 : 0) +
    (settings.requireSpecialChars ? 1 : 0)
  
  const strength = score >= maxScore - 1 ? 'STRONG' : score >= Math.floor(maxScore / 2) ? 'MEDIUM' : 'WEAK'

  return {
    valid: errors.length === 0,
    errors,
    strength
  }
}


/**
 * Input validation utilities
 */
export function validateEmail(email: string): boolean {
  const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
  return regex.test(email)
}

export function sanitizeInput(input: string, maxLength: number = 255): string {
  return input.trim().substring(0, maxLength)
}

export function validateStringLength(value: string, min: number, max: number): boolean {
  return value.length >= min && value.length <= max
}

export function validateNumericRange(value: number, min: number, max: number): boolean {
  return value >= min && value <= max
}

/**
 * Account lockout management
 */
export async function checkAccountLockout(email: string): Promise<{
  isLocked: boolean
  lockedUntil?: Date
  failedAttempts?: number
}> {
  try {
    const response = await $fetch('/api/check-account-lockout', {
      method: 'POST',
      body: { email }
    })
    return response as { isLocked: boolean; lockedUntil?: Date; failedAttempts?: number }
  } catch (error) {
    console.error('Error checking account lockout:', error)
    return { isLocked: false }
  }
}

/**
 * Password history management
 */
export async function checkPasswordHistory(userId: string, newPassword: string): Promise<{
  isReused: boolean
  error?: string
}> {
  try {
    const response = await $fetch('/api/check-password-history', {
      method: 'POST',
      body: { userId, newPassword }
    })
    return response as { isReused: boolean; error?: string }
  } catch (error) {
    console.error('Error checking password history:', error)
    return { isReused: false, error: 'Password history check failed' }
  }
}

/**
 * Password age validation
 */
export async function validatePasswordAge(userId: string): Promise<{
  canChange: boolean
  hoursRemaining?: number
  error?: string
}> {
  try {
    const response = await $fetch('/api/validate-password-age', {
      method: 'POST',
      body: { userId }
    })
    return response as { canChange: boolean; hoursRemaining?: number; error?: string }
  } catch (error) {
    console.error('Error validating password age:', error)
    return { canChange: true, error: 'Password age validation failed' }
  }
}