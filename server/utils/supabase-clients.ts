/**
 * Supabase client utilities using @nuxtjs/supabase built-in server composables
 * This implements the principle of least privilege with proper session handling
 */

import { createError } from 'h3'
import { serverSupabaseUser, serverSupabaseClient, serverSupabaseServiceRole } from '#supabase/server'

/**
 * Get authenticated user from server request using @nuxtjs/supabase
 * This properly handles session cookies and authentication
 */
export async function getUserFromRequest(event: any) {
  try {
    const user = await serverSupabaseUser(event)
    return { user, error: user ? null : 'No authenticated user' }
  } catch (error) {
    return { user: null, error: 'Authentication failed' }
  }
}

/**
 * Get authenticated Supabase client for the current user
 * This client respects RLS policies and user context
 */
export async function getAuthenticatedClient(event: any) {
  return await serverSupabaseClient(event)
}

/**
 * Get service role Supabase client (bypasses RLS)
 * Only use for operations that truly require bypassing security:
 * - User management (create/delete auth users)
 * - System maintenance
 * - Emergency access
 */
export function getServiceRoleClient(event: any) {
  return serverSupabaseServiceRole(event)
}

/**
 * Middleware to enforce authentication on API endpoints
 */
export async function requireAuth(event: any) {
  const user = await serverSupabaseUser(event)
  
  if (!user) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Authentication required'
    })
  }
  
  return user
}

/**
 * Middleware to enforce admin role on API endpoints
 */
export async function requireAdmin(event: any) {
  const user = await requireAuth(event)
  
  // Get authenticated client that respects RLS policies
  const supabase = await serverSupabaseClient(event)
  
  // Use authenticated client to check role (RLS will ensure user can only see their own data or admin can see others)
  const { data, error } = await supabase
    .from('Employees')
    .select('rank')
    .eq('id', user.id)
    .single()
  
  if (error || !data || !['Admin', 'Developer'].includes(data.rank)) {
    throw createError({
      statusCode: 403,
      statusMessage: 'Admin access required'
    })
  }
  
  return { user, role: data.rank }
}

// Legacy exports for backward compatibility during transition
export const supabaseAnon = null // Will be replaced by getAuthenticatedClient(event)
export const supabaseAdmin = null // Will be replaced by getServiceRoleClient(event)