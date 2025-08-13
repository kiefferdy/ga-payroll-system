import { requirePermission, getServiceRoleClient } from '~/server/utils/supabase-clients'
import { PERMISSIONS } from '~/utils/permissions'
import { logSecurityEvent } from '~/utils/security'

export default defineEventHandler(async (event) => {
  try {
    // Require roles.assign permission to manage user roles
    const { user: currentUser } = await requirePermission(event, PERMISSIONS.ROLES_ASSIGN)
    
    if (event.node.req.method !== 'POST') {
      throw createError({
        statusCode: 405,
        statusMessage: 'Method not allowed'
      })
    }

    const { userId, roleIds } = await readBody(event)

    if (!userId || !Array.isArray(roleIds)) {
      throw createError({
        statusCode: 400,
        statusMessage: 'userId and roleIds array are required'
      })
    }

    // Get service role client for user role management
    const supabase = getServiceRoleClient(event)

    // Get user info for logging
    const { data: userData, error: userError } = await supabase
      .from('Employees')
      .select('first_name, last_name')
      .eq('id', userId)
      .single()

    if (userError || !userData) {
      throw createError({
        statusCode: 404,
        statusMessage: 'User not found'
      })
    }

    const userName = `${userData.first_name} ${userData.last_name}`

    // Get current user roles to compare changes
    const { data: currentRoles, error: currentRolesError } = await supabase
      .from('UserRoles')
      .select('role_id, Roles!inner(name)')
      .eq('user_id', userId)
      .eq('is_active', true)

    if (currentRolesError) {
      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to load current user roles'
      })
    }

    const currentRoleIds: number[] = currentRoles?.map(ur => ur.role_id) || []
    const addedRoles: number[] = roleIds.filter((id: number) => !currentRoleIds.includes(id))
    const removedRoles: number[] = currentRoleIds.filter((id: number) => !roleIds.includes(id))

    // Start transaction by deactivating all current roles
    const { error: deactivateError } = await (supabase as any)
      .from('UserRoles')
      .update({ is_active: false })
      .eq('user_id', userId)

    if (deactivateError) {
      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to update user roles'
      })
    }

    // Add new role assignments
    if (roleIds.length > 0) {
      const roleAssignments = roleIds.map((roleId: number) => ({
        user_id: userId,
        role_id: roleId,
        assigned_by: currentUser.id,
        is_active: true
      }))

      const { error: insertError } = await (supabase as any)
        .from('UserRoles')
        .insert(roleAssignments)

      if (insertError) {
        // Try to rollback by reactivating previous roles
        await (supabase as any)
          .from('UserRoles')
          .update({ is_active: true })
          .eq('user_id', userId)
          .in('role_id', currentRoleIds)

        throw createError({
          statusCode: 500,
          statusMessage: 'Failed to assign new roles'
        })
      }
    }

    // Get role names for logging
    const { data: roleData } = await supabase
      .from('Roles')
      .select('name')
      .in('id', [...addedRoles, ...removedRoles])

    const roleNames = roleData?.reduce((acc, role, index) => {
      const roleId = [...addedRoles, ...removedRoles][index]
      acc[roleId] = role.name
      return acc
    }, {} as Record<number, string>) || {}

    // Log the role changes
    if (addedRoles.length > 0 || removedRoles.length > 0) {
      await logSecurityEvent({
        eventType: 'USER_ROLES_CHANGED',
        userId: currentUser.id,
        userEmail: currentUser.email,
        resourceAccessed: `/api/user-roles`,
        details: {
          targetUser: userName,
          targetUserId: userId,
          addedRoles: addedRoles.map(id => roleNames[id] || `Role ${id}`),
          removedRoles: removedRoles.map(id => roleNames[id] || `Role ${id}`),
          totalRoles: roleIds.length
        },
        severity: 'MEDIUM'
      })
    }

    return { success: true }

  } catch (error) {
    console.error('Error managing user roles:', error)
    
    if (error && typeof error === 'object' && 'statusCode' in error) {
      throw error
    }
    
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal server error'
    })
  }
})