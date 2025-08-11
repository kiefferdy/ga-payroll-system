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
  } catch (error) {
    console.error('Authorization check failed:', error)
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
 * Password complexity validation
 */
export function validatePasswordComplexity(password: string): {
  valid: boolean
  errors: string[]
  strength: 'WEAK' | 'MEDIUM' | 'STRONG'
} {
  const errors: string[] = []
  let score = 0

  // Minimum length check
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long')
  } else {
    score += 1
  }

  // Uppercase letter check
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter')
  } else {
    score += 1
  }

  // Lowercase letter check
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter')
  } else {
    score += 1
  }

  // Number check
  if (!/\d/.test(password)) {
    errors.push('Password must contain at least one number')
  } else {
    score += 1
  }

  // Special character check
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\?]/.test(password)) {
    errors.push('Password must contain at least one special character (!@#$%^&*)')
  } else {
    score += 1
  }

  // Common passwords check (basic)
  const commonPasswords = ['password', '123456', 'qwerty', 'admin', 'welcome']
  if (commonPasswords.some(common => password.toLowerCase().includes(common))) {
    errors.push('Password contains common words and is not secure')
    score -= 1
  }

  const strength = score >= 4 ? 'STRONG' : score >= 2 ? 'MEDIUM' : 'WEAK'

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