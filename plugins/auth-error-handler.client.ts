/**
 * Client-side authentication error handler
 * Automatically handles persistent JWT token issues
 */
export default defineNuxtPlugin(() => {
  const { emergencyAuthReset } = useAuthCleanup()
  
  let authErrorCount = 0
  const maxAuthErrors = 3
  const errorTimeWindow = 60000 // 1 minute
  let lastErrorTime = 0

  // Global error handler for authentication issues
  const handleAuthError = (error: any) => {
    const now = Date.now()
    
    // Reset counter if enough time has passed
    if (now - lastErrorTime > errorTimeWindow) {
      authErrorCount = 0
    }
    
    lastErrorTime = now
    
    // Check if this is an auth-related error
    const isAuthError = error?.message?.includes('missing sub claim') ||
                       error?.message?.includes('Invalid JWT token') ||
                       error?.statusCode === 401 ||
                       error?.data?.statusCode === 401

    if (isAuthError) {
      authErrorCount++
      
      console.warn(`Authentication error detected (${authErrorCount}/${maxAuthErrors}):`, error?.message || error)
      
      // If we've hit too many auth errors in a short time, trigger emergency reset
      if (authErrorCount >= maxAuthErrors) {
        console.error('Multiple authentication failures detected, triggering emergency auth reset')
        authErrorCount = 0 // Reset counter
        emergencyAuthReset()
      }
    }
  }

  // Listen for unhandled promise rejections (API errors)
  if (typeof window !== 'undefined') {
    window.addEventListener('unhandledrejection', (event) => {
      handleAuthError(event.reason)
    })
    
    // Also handle regular errors
    window.addEventListener('error', (event) => {
      handleAuthError(event.error)
    })
  }
  
  // Provide global error handler for manual use
  return {
    provide: {
      handleAuthError
    }
  }
})