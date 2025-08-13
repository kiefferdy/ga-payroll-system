import { getUserFromRequest } from '../utils/supabase-clients'
import { serverSupabaseUser } from '#supabase/server'

/**
 * Authentication status diagnostic endpoint
 * Helps diagnose authentication issues without requiring full auth
 */
export default defineEventHandler(async (event) => {
  try {
    const headers = getHeaders(event)
    
    // Get all cookies
    const allCookies = []
    const potentialCookieNames = [
      'sb-access-token', 'sb-refresh-token', 'supabase-auth-token', 
      'sb-auth-token', 'supabase.auth.token'
    ]
    
    for (const cookieName of potentialCookieNames) {
      if (getCookie(event, cookieName)) {
        allCookies.push(cookieName)
      }
    }
    
    // Diagnostic information
    const diagnostics = {
      hasAuthHeader: !!headers.authorization,
      authHeaderType: headers.authorization?.startsWith('Bearer ') ? 'Bearer' : 'Other',
      cookiesPresent: allCookies,
      timestamp: new Date().toISOString(),
      userAgent: headers['user-agent']
    }

    // Try custom auth extraction
    let customAuthResult = { user: null, error: 'Not attempted' }
    try {
      customAuthResult = await getUserFromRequest(event)
    } catch (customError: any) {
      customAuthResult.error = customError?.message || 'Custom auth failed'
    }

    // Try built-in auth (this might fail)
    let builtinAuthResult = { user: null, error: 'Not attempted' }
    try {
      const builtinUser = await serverSupabaseUser(event)
      builtinAuthResult = { user: !!builtinUser, error: builtinUser ? null : 'No user' }
    } catch (builtinError: any) {
      builtinAuthResult.error = builtinError?.message || 'Built-in auth failed'
    }

    return {
      status: 'diagnostic',
      diagnostics,
      customAuth: {
        success: !!customAuthResult.user,
        error: customAuthResult.error,
        userId: customAuthResult.user?.id || null
      },
      builtinAuth: {
        success: !!builtinAuthResult.user,
        error: builtinAuthResult.error
      },
      recommendation: customAuthResult.user ? 'Authentication working' : 
                     builtinAuthResult.error?.includes('claim') ? 'JWT token corruption - clear cookies and re-login' :
                     'No valid authentication found'
    }

  } catch (error: any) {
    return {
      status: 'error',
      error: error?.message || 'Diagnostic failed',
      recommendation: 'Clear browser data and try logging in again'
    }
  }
})