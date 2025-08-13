import { requirePermission, getAuthenticatedClient } from '~/server/utils/supabase-clients'
import { PERMISSIONS } from '~/utils/permissions'

export default defineEventHandler(async (event) => {
  try {
    // Require users.read permission to access this endpoint
    await requirePermission(event, PERMISSIONS.USERS_READ)

    // Get authenticated client
    const supabase = await getAuthenticatedClient(event)

    // Get all employees
    const { data: employees, error: employeesError } = await supabase
      .from('Employees')
      .select('id, first_name, last_name, middle_name, failed_login_attempts, locked_until, requires_otp, monthly_pay, hourly_pay, last_updated, last_login_at, time_in_status')
      .order('first_name', { ascending: true })

    if (employeesError) {
      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to load employees'
      })
    }

    // Get user role assignments with role details
    const { data: userRoles, error: rolesError } = await supabase
      .from('UserRoles')
      .select(`
        user_id,
        Roles!inner (
          id,
          name,
          description,
          is_system_role
        )
      `)
      .eq('is_active', true)

    if (rolesError) {
      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to load user roles'
      })
    }

    // Combine employees with their primary role
    const employeesWithRoles = employees?.map((employee: any) => {
      const userRoleAssignments = userRoles?.filter((ur: any) => ur.user_id === employee.id) || []
      
      // Find primary role (prioritize system roles, then first role alphabetically)
      let primaryRole = 'Employee'
      if (userRoleAssignments.length > 0) {
        const systemRole = userRoleAssignments.find((ur: any) => ur.Roles.is_system_role)
        primaryRole = systemRole ? systemRole.Roles.name : userRoleAssignments[0].Roles.name
      }
      
      return {
        ...employee,
        primary_role: primaryRole,
        all_roles: userRoleAssignments.map((ur: any) => ur.Roles)
      }
    })

    return employeesWithRoles || []

  } catch (error: any) {
    console.error('Error fetching employees with roles:', error)
    
    // Handle authentication errors specifically
    if (error?.statusMessage?.includes('claim') || error?.statusMessage?.includes('auth')) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Authentication required. Please log in again.'
      })
    }
    
    if (error && typeof error === 'object' && 'statusCode' in error) {
      throw error
    }
    
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal server error'
    })
  }
})