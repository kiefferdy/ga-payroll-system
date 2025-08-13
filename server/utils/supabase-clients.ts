/**
 * Supabase client utilities using @nuxtjs/supabase built-in server composables
 * This implements the principle of least privilege with proper session handling
 */

import type { H3Event, EventHandlerRequest } from 'h3'
import { createError } from 'h3'
import { serverSupabaseUser, serverSupabaseClient, serverSupabaseServiceRole } from '#supabase/server'
import { hasPermission, isUserAdmin } from '~/utils/permissions'

/**
 * Get authenticated user from server request using @nuxtjs/supabase
 * This properly handles session cookies and authentication
 */
export async function getUserFromRequest(event: H3Event<EventHandlerRequest>) {
  try {
    const user = await serverSupabaseUser(event)
    return { user, error: user ? null : 'No authenticated user' }
  } catch (error: any) {
    console.error('Error getting user from request:', error?.message || error)
    return { user: null, error: 'Authentication failed' }
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
 * Middleware to enforce authentication on API endpoints
 */
export async function requireAuth(event: H3Event<EventHandlerRequest>) {
  try {
    const user = await serverSupabaseUser(event)
    
    if (!user) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Authentication required'
      })
    }
    
    return user
  } catch (error: any) {
    // Handle JWT parsing errors
    console.error('Authentication error:', error)
    throw createError({
      statusCode: 401,
      statusMessage: 'Invalid authentication token'
    })
  }
}

/**
 * Middleware to enforce admin role on API endpoints
 * @deprecated Use requirePermission() for granular access control
 */
export async function requireAdmin(event: H3Event<EventHandlerRequest>) {
  const user = await requireAuth(event)
  
  // Get authenticated client that respects RLS policies
  const supabase = await serverSupabaseClient(event)
  
  // Check using permission system
  const hasAdminAccess = await isUserAdmin(supabase, user.id)
  
  if (!hasAdminAccess) {
    throw createError({
      statusCode: 403,
      statusMessage: 'Admin access required'
    })
  }
  
  return { user }
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