/**
 * Global authentication recovery middleware
 * Handles auth token corruption and automatic recovery
 */
export default defineNuxtRouteMiddleware((to) => {
  // Only run on client side
  if (process.server) return

  const { $handleAuthError } = useNuxtApp()
  
  // Global fetch interceptor for handling auth errors
  const originalFetch = window.fetch
  
  window.fetch = async (...args) => {
    try {
      const response = await originalFetch(...args)
      
      // Check for auth errors in response
      if (response.status === 401) {
        const responseText = await response.text()
        if (responseText.includes('JWT') || responseText.includes('claim') || responseText.includes('auth')) {
          console.warn('Authentication error detected in response:', responseText)
          if ($handleAuthError) {
            $handleAuthError(new Error(responseText))
          }
        }
      }
      
      return response
    } catch (error) {
      // Handle network errors that might be auth-related
      if ($handleAuthError) {
        $handleAuthError(error)
      }
      throw error
    }
  }

  // Handle route-based authentication checks
  const protectedRoutes = ['/', '/employees', '/roles', '/settings', '/records']
  
  if (protectedRoutes.includes(to.path)) {
    // Additional auth validation can be added here if needed
    console.debug('Navigating to protected route:', to.path)
  }
})