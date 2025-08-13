type AnySupabaseClient = any

/**
 * Permission checking utilities for dynamic role-based access control
 * Replaces hardcoded role checks with flexible permission system
 */

// Cache for user permissions to avoid repeated database calls
const permissionCache = new Map<string, { permissions: string[], timestamp: number }>()
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

/**
 * Get all permissions for a user based on their assigned roles
 */
export async function getUserPermissions(supabase: AnySupabaseClient, userId: string): Promise<string[]> {
  // Check cache first
  const cached = permissionCache.get(userId)
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.permissions
  }

  try {
    const { data, error } = await supabase
      .from('UserRoles')
      .select(`
        Roles!inner (
          RolePermissions!inner (
            Permissions!inner (
              name
            )
          )
        )
      `)
      .eq('user_id', userId)
      .eq('is_active', true)

    if (error) {
      console.error('Error fetching user permissions:', error)
      return []
    }

    // Extract unique permission names from nested structure
    const permissions = new Set<string>()
    data?.forEach((userRole: any) => {
      userRole.Roles?.RolePermissions?.forEach((rolePermission: any) => {
        if (rolePermission.Permissions?.name) {
          permissions.add(rolePermission.Permissions.name)
        }
      })
    })

    const permissionArray = Array.from(permissions)

    // Cache the result
    permissionCache.set(userId, {
      permissions: permissionArray,
      timestamp: Date.now()
    })

    return permissionArray
  } catch (error) {
    console.error('Error in getUserPermissions:', error)
    return []
  }
}

/**
 * Check if a user has a specific permission
 */
export async function hasPermission(
  supabase: AnySupabaseClient, 
  userId: string, 
  permission: string
): Promise<boolean> {
  const permissions = await getUserPermissions(supabase, userId)
  return permissions.includes(permission)
}

/**
 * Check if a user has any of the specified permissions
 */
export async function hasAnyPermission(
  supabase: AnySupabaseClient, 
  userId: string, 
  permissions: string[]
): Promise<boolean> {
  const userPermissions = await getUserPermissions(supabase, userId)
  return permissions.some(permission => userPermissions.includes(permission))
}

/**
 * Check if a user has all of the specified permissions
 */
export async function hasAllPermissions(
  supabase: AnySupabaseClient, 
  userId: string, 
  permissions: string[]
): Promise<boolean> {
  const userPermissions = await getUserPermissions(supabase, userId)
  return permissions.every(permission => userPermissions.includes(permission))
}

/**
 * Get user roles (for display purposes)
 */
export async function getUserRoles(supabase: AnySupabaseClient, userId: string): Promise<Array<{ id: number, name: string, description: string }>> {
  try {
    const { data, error } = await supabase
      .from('UserRoles')
      .select(`
        Roles!inner (
          id,
          name,
          description
        )
      `)
      .eq('user_id', userId)
      .eq('is_active', true)

    if (error) {
      console.error('Error fetching user roles:', error)
      return []
    }

    return data?.map((userRole: any) => userRole.Roles) || []
  } catch (error) {
    console.error('Error in getUserRoles:', error)
    return []
  }
}

/**
 * Assign a role to a user
 */
export async function assignRoleToUser(
  supabase: AnySupabaseClient, 
  userId: string, 
  roleId: number, 
  assignedBy: string
): Promise<{ success: boolean, error?: string }> {
  try {
    const { error } = await supabase
      .from('UserRoles')
      .insert({
        user_id: userId,
        role_id: roleId,
        assigned_by: assignedBy
      })

    if (error) {
      return { success: false, error: error.message }
    }

    // Clear cache for this user
    permissionCache.delete(userId)

    return { success: true }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
  }
}

/**
 * Remove a role from a user
 */
export async function removeRoleFromUser(
  supabase: AnySupabaseClient, 
  userId: string, 
  roleId: number
): Promise<{ success: boolean, error?: string }> {
  try {
    const { error } = await supabase
      .from('UserRoles')
      .delete()
      .eq('user_id', userId)
      .eq('role_id', roleId)

    if (error) {
      return { success: false, error: error.message }
    }

    // Clear cache for this user
    permissionCache.delete(userId)

    return { success: true }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
  }
}

/**
 * Clear permission cache for a specific user or all users
 */
export function clearPermissionCache(userId?: string) {
  if (userId) {
    permissionCache.delete(userId)
  } else {
    permissionCache.clear()
  }
}

/**
 * Check if user has admin privileges using permission system
 */
export async function isUserAdmin(supabase: AnySupabaseClient, userId: string): Promise<boolean> {
  return await hasPermission(supabase, userId, 'settings.update')
}

/**
 * Permission constants for easy reference and type safety
 */
export const PERMISSIONS = {
  // User management
  USERS_CREATE: 'users.create',
  USERS_READ: 'users.read',
  USERS_UPDATE: 'users.update',
  USERS_DELETE: 'users.delete',
  USERS_UNLOCK: 'users.unlock',
  
  // Settings
  SETTINGS_READ: 'settings.read',
  SETTINGS_UPDATE: 'settings.update',
  
  // Payroll
  PAYROLL_READ: 'payroll.read',
  PAYROLL_EXPORT: 'payroll.export',
  
  // Timesheet
  TIMESHEET_READ: 'timesheet.read',
  TIMESHEET_UPDATE: 'timesheet.update',
  
  // Roles
  ROLES_READ: 'roles.read',
  ROLES_CREATE: 'roles.create',
  ROLES_UPDATE: 'roles.update',
  ROLES_DELETE: 'roles.delete',
  ROLES_ASSIGN: 'roles.assign',
  
  // Security
  SECURITY_AUDIT: 'security.audit',
  
  // Dashboard
  DASHBOARD_ACCESS: 'dashboard.access'
} as const

/**
 * Role constants for easy reference
 */
export const ROLES = {
  EMPLOYEE: 'Employee',
  ADMIN: 'Admin',
  DEVELOPER: 'Developer',
  HR_MANAGER: 'HR Manager',
  AUDITOR: 'Auditor'
} as const