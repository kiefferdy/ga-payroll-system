/**
 * Enhanced authentication cleanup utility
 * Handles robust logout and token cleanup for authentication issues
 */
export const useAuthCleanup = () => {
  const supabase = useSupabaseClient()
  const router = useRouter()

  /**
   * Clear all authentication artifacts from browser storage
   */
  const clearAuthStorage = () => {
    if (typeof window === 'undefined') return

    // Clear localStorage
    const localStorageKeys = Object.keys(localStorage)
    localStorageKeys.forEach(key => {
      if (key.includes('supabase') || key.includes('auth') || key.includes('sb-')) {
        localStorage.removeItem(key)
      }
    })

    // Clear sessionStorage
    const sessionStorageKeys = Object.keys(sessionStorage)
    sessionStorageKeys.forEach(key => {
      if (key.includes('supabase') || key.includes('auth') || key.includes('sb-')) {
        sessionStorage.removeItem(key)
      }
    })

    // Clear potential auth cookies
    const cookieNames = [
      'sb-access-token',
      'sb-refresh-token',
      'supabase-auth-token',
      'sb-auth-token',
      'supabase.auth.token',
      'sb-api-auth-token'
    ]

    cookieNames.forEach(cookieName => {
      // Clear cookie by setting it to expire in the past
      document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${window.location.hostname}`
      document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/`
    })
  }

  /**
   * Enhanced logout that clears all authentication state
   */
  const enhancedLogout = async () => {
    try {
      console.log('Starting enhanced logout process...')
      
      // First try normal Supabase logout
      const { error } = await supabase.auth.signOut()
      if (error) {
        console.warn('Supabase signOut error:', error.message)
      }

      // Clear all authentication storage regardless of signOut result
      clearAuthStorage()

      // Small delay to ensure cleanup completes
      await new Promise(resolve => setTimeout(resolve, 100))

      console.log('Enhanced logout completed, redirecting to login')
      
      // Force navigation to login page
      await router.push('/login')
      
      // Additional cleanup after navigation
      if (typeof window !== 'undefined') {
        setTimeout(() => {
          clearAuthStorage()
          window.location.reload()
        }, 500)
      }

    } catch (error) {
      console.error('Enhanced logout error:', error)
      
      // Fallback: clear storage and redirect anyway
      clearAuthStorage()
      window.location.href = '/login'
    }
  }

  /**
   * Emergency auth reset for persistent token issues
   */
  const emergencyAuthReset = async () => {
    try {
      console.log('Starting emergency auth reset...')
      
      // Clear all storage immediately
      clearAuthStorage()
      
      // Try to sign out
      try {
        await supabase.auth.signOut()
      } catch (signOutError) {
        console.warn('SignOut failed during emergency reset:', signOutError)
      }

      // Force page reload to clear any in-memory state
      if (typeof window !== 'undefined') {
        window.location.href = '/login?reset=true'
      }
    } catch (error) {
      console.error('Emergency auth reset error:', error)
      // Last resort: force reload
      if (typeof window !== 'undefined') {
        window.location.reload()
      }
    }
  }

  return {
    clearAuthStorage,
    enhancedLogout,
    emergencyAuthReset
  }
}