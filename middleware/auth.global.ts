import { logSecurityEvent } from '~/utils/security'
import { hasPermission, PERMISSIONS } from '~/utils/permissions'

export default defineNuxtRouteMiddleware(async (to) => {
  // Skip processing for Chrome DevTools and other system requests
  if (to.path.startsWith('/.well-known/') || 
      to.path.startsWith('/favicon') || 
      to.path.startsWith('/robots') ||
      to.path.includes('chrome-extension')) {
    return
  }

  // Pages that don't require authentication
  const publicPages = ['/login', '/reset-password', '/update-password']
  
  // Skip authentication check for public pages
  if (publicPages.includes(to.path)) {
    return
  }

  const supabase = useSupabaseClient()
  const user = useSupabaseUser()

  // Check if user is authenticated
  if (!user.value) {
    // Log unauthorized access attempt
    await logSecurityEvent({
      eventType: 'UNAUTHORIZED_ACCESS_ATTEMPT',
      resourceAccessed: to.path,
      details: {
        attemptedPath: to.path,
        query: to.query
      },
      severity: 'MEDIUM'
    })

    // Redirect to login page
    return navigateTo('/login')
  }

  // For permission-protected pages, check user permissions
  const pagePermissions = {
    '/settings': PERMISSIONS.SETTINGS_READ,
    '/create-account': PERMISSIONS.USERS_CREATE,
    '/employees': PERMISSIONS.USERS_READ,
    '/edit-account': PERMISSIONS.USERS_UPDATE,
    '/roles': PERMISSIONS.ROLES_READ,
    '/security-logs': PERMISSIONS.SECURITY_AUDIT,
    '/records': PERMISSIONS.PAYROLL_READ
  }
  
  const requiredPermission = pagePermissions[to.path as keyof typeof pagePermissions] || 
                            Object.entries(pagePermissions).find(([path]) => to.path.startsWith(path))?.[1]
  
  if (requiredPermission) {
    try {
      // Get user information for logging
      const { data: userData, error: userError } = await supabase
        .from('Employees')
        .select('first_name, last_name')
        .eq('id', user.value.id)
        .single()

      const userName = userData ? `${userData.first_name} ${userData.last_name}` : 'Unknown User'

      // Check if user has the required permission
      const hasRequiredPermission = await hasPermission(supabase, user.value.id, requiredPermission)

      if (!hasRequiredPermission) {
        await logSecurityEvent({
          eventType: 'ACCESS_DENIED',
          userId: user.value.id,
          userEmail: user.value.email,
          resourceAccessed: to.path,
          details: { 
            userName: userName,
            requiredPermission: requiredPermission,
            reason: 'Insufficient permissions'
          },
          severity: 'MEDIUM'
        })
        
        throw createError({ 
          statusCode: 403, 
          statusMessage: 'You do not have permission to access this page' 
        })
      }
    } catch (dbError) {
      console.error('Database error in auth middleware:', dbError)
      
      await logSecurityEvent({
        eventType: 'AUTHORIZATION_ERROR',
        userId: user.value.id,
        userEmail: user.value.email,
        resourceAccessed: to.path,
        details: { error: dbError instanceof Error ? dbError.message : 'Database error' },
        severity: 'HIGH'
      })
      
      throw createError({ statusCode: 500, statusMessage: 'Internal Server Error' })
    }
  }

  // Log successful access for audit trail
  await logSecurityEvent({
    eventType: 'PAGE_ACCESS',
    userId: user.value.id,
    userEmail: user.value.email,
    resourceAccessed: to.path,
    details: { path: to.path, query: to.query },
    severity: 'LOW'
  })
})