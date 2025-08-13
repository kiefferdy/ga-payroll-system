/**
 * Simplified authentication composable
 * Single logout function handles all auth cleanup scenarios
 */
export const useAuth = () => {
  const supabase = useSupabaseClient()
  const router = useRouter()

  /**
   * Clean logout - sign out and redirect to login
   */
  const logout = async () => {
    try {
      await supabase.auth.signOut()
    } catch (error) {
      console.warn('Logout error (proceeding anyway):', error)
    }
    
    await router.push('/login')
  }

  return { 
    logout
  }
}