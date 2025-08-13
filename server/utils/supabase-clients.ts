/**
 * Supabase client utilities using @nuxtjs/supabase built-in server composables
 * This implements the principle of least privilege with proper session handling
 */

import type { H3Event, EventHandlerRequest } from 'h3'
import { createError, getCookie, getHeader } from 'h3'
import { serverSupabaseUser, serverSupabaseClient, serverSupabaseServiceRole } from '#supabase/server'
import { hasPermission, isUserAdmin } from '~/utils/permissions'

/**
 * Helper function to detect if a JWT token is a project key (anon or service role)
 * Project keys don't have a 'sub' claim, which causes the "missing sub claim" error
 */
function looksLikeProjectKey(jwt?: string): boolean {
  if (!jwt) return false
  try {
    const [, payload] = jwt.split('.')
    const json = JSON.parse(Buffer.from(payload, 'base64').toString('utf8'))
    return !json?.sub // project keys have no sub claim
  } catch { 
    return false 
  }
}

/**
 * Get authenticated user from server request with robust token validation
 * This properly handles session cookies and authentication
 */
export async function getUserFromRequest(event: H3Event<EventHandlerRequest>) {
  try {
    // Try multiple cookie names that Supabase might use
    const cookieTokens = [
      getCookie(event, 'sb-access-token'),
      getCookie(event, 'supabase-auth-token'),
      getCookie(event, 'sb-auth-token')
    ].filter(Boolean)

    for (const cookieToken of cookieTokens) {
      if (cookieToken && !looksLikeProjectKey(cookieToken)) {
        try {
          const supabase = await serverSupabaseClient(event)
          const { data: { user }, error } = await supabase.auth.getUser(cookieToken)
          if (!error && user?.id) {
            return { user, error: null }
          }
          // Log the error but continue trying other tokens
          if (error) {
            console.debug('Cookie token validation failed:', error.message)
          }
        } catch (tokenError: any) {
          console.debug('Token parsing error:', tokenError?.message)
          // Continue to next token
        }
      }
    }

    // Fallback to Authorization header only if it's a real user token
    const auth = getHeader(event, 'authorization')
    const bearer = auth?.startsWith('Bearer ') ? auth.slice(7) : undefined
    if (bearer && !looksLikeProjectKey(bearer)) {
      try {
        const supabase = await serverSupabaseClient(event)
        const { data: { user }, error } = await supabase.auth.getUser(bearer)
        if (!error && user?.id) {
          return { user, error: null }
        }
        if (error) {
          console.debug('Bearer token validation failed:', error.message)
        }
      } catch (headerError: any) {
        console.debug('Header token parsing error:', headerError?.message)
      }
    }

    return { user: null, error: 'No valid authentication token found' }
  } catch (error: any) {
    console.error('Error getting user from request:', error?.message || error)
    return { user: null, error: 'Authentication validation failed' }
  }
}

/**
 * Get authenticated Supabase client for the current user
 * This client respects RLS policies and user context
 */
export async function getAuthenticatedClient(event: H3Event<EventHandlerRequest>) {
  return await serverSupabaseClient(event)
}

/**
 * Get service role Supabase client (bypasses RLS)
 * Only use for operations that truly require bypassing security:
 * - User management (create/delete auth users)
 * - System maintenance
 * - Emergency access
 */
export function getServiceRoleClient(event: H3Event<EventHandlerRequest>) {
  return serverSupabaseServiceRole(event)
}

/**
 * Simplified authentication middleware
 * Focuses on reliability over complex error handling
 */
export async function requireAuth(event: H3Event<EventHandlerRequest>) {
  try {
    // Use the built-in Supabase auth function
    const user = await serverSupabaseUser(event)
    
    if (!user) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Authentication required - please log in'
      })
    }
    
    return user
    
  } catch (error: any) {
    console.warn('Authentication failed:', error?.message || error)
    
    // Simplified error handling
    throw createError({
      statusCode: 401,
      statusMessage: 'Authentication failed - please log in again'
    })
  }
}


/**
 * Middleware to enforce specific permission on API endpoints
 * This is the new recommended way to handle authorization
 */
export async function requirePermission(event: H3Event<EventHandlerRequest>, permission: string) {
  const user = await requireAuth(event)
  
  // Get authenticated client that respects RLS policies
  const supabase = await serverSupabaseClient(event)
  
  // Check if user has the required permission
  const hasRequiredPermission = await hasPermission(supabase, user.id, permission)
  
  if (!hasRequiredPermission) {
    throw createError({
      statusCode: 403,
      statusMessage: `Permission required: ${permission}`
    })
  }
  
  return { user, permission }
}

/**
 * Middleware to enforce any of multiple permissions on API endpoints
 */
export async function requireAnyPermission(event: H3Event<EventHandlerRequest>, permissions: string[]) {
  const user = await requireAuth(event)
  
  // Get authenticated client that respects RLS policies
  const supabase = await serverSupabaseClient(event)
  
  // Check if user has any of the required permissions
  for (const permission of permissions) {
    if (await hasPermission(supabase, user.id, permission)) {
      return { user, permission }
    }
  }
  
  throw createError({
    statusCode: 403,
    statusMessage: `One of these permissions required: ${permissions.join(', ')}`
  })
}

/**
 * Check if current user has a specific permission (non-throwing version)
 */
export async function checkUserPermission(event: H3Event<EventHandlerRequest>, permission: string): Promise<boolean> {
  try {
    const user = await serverSupabaseUser(event)
    if (!user) return false
    
    const supabase = await serverSupabaseClient(event)
    return await hasPermission(supabase, user.id, permission)
  } catch (error: any) {
    console.error('Error checking user permission:', error?.message || error)
    return false
  }
}

// Legacy exports for backward compatibility during transition
export const supabaseAnon = null // Will be replaced by getAuthenticatedClient(event)
export const supabaseAdmin = null // Will be replaced by getServiceRoleClient(event)