import { requirePermission, getServiceRoleClient } from '~/server/utils/supabase-clients'
import { PERMISSIONS } from '~/utils/permissions'

export default defineEventHandler(async (event) => {
  try {
    // Require roles.read permission to access this endpoint
    await requirePermission(event, PERMISSIONS.ROLES_READ)

    // Get service role client to access auth admin API
    const supabase = getServiceRoleClient(event)

    // Get all employees from database
    const { data: employees, error: employeesError } = await supabase
      .from('Employees')
      .select('id, first_name, last_name')

    if (employeesError) {
      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to load employees'
      })
    }

    // Get auth users (with service role client, this is allowed)
    const { data: authUsersResponse, error: authError } = await supabase.auth.admin.listUsers()
    
    if (authError) {
      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to load auth users'
      })
    }

    // Get user role assignments
    const { data: userRoles, error: rolesError } = await supabase
      .from('UserRoles')
      .select(`
        user_id,
        role_id,
        Roles!inner (
          id,
          name,
          description,
          is_system_role
        )
      `)
      .eq('is_active', true) as {
        data: Array<{
          user_id: string
          role_id: number
          Roles: {
            id: number
            name: string
            description: string
            is_system_role: boolean
          }
        }> | null
        error: any
      }

    if (rolesError) {
      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to load user roles'
      })
    }

    // Combine all data
    const usersWithRoles = employees?.map(employee => {
      const authUser = authUsersResponse.users.find(au => au.id === employee.id)
      const userRoleAssignments = userRoles?.filter(ur => ur.user_id === employee.id) || []
      
      return {
        id: employee.id,
        first_name: employee.first_name,
        last_name: employee.last_name,
        email: authUser?.email || '',
        roles: userRoleAssignments.map(ur => ur.Roles)
      }
    }).filter(user => user.email) // Only include users with valid auth records

    return usersWithRoles || []

  } catch (error) {
    console.error('Error fetching users with roles:', error)
    
    if (error && typeof error === 'object' && 'statusCode' in error) {
      throw error
    }
    
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal server error'
    })
  }
})