import { logSecurityEvent } from '~/utils/security'

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

  // For admin-only pages, check user role
  const adminOnlyPages = ['/settings', '/create-account', '/employees', '/edit-account']
  
  if (adminOnlyPages.some(page => to.path.startsWith(page))) {
    try {
      const { data, error } = await supabase
        .from('Employees')
        .select('rank, first_name, last_name')
        .eq('id', user.value.id)
        .single()

      if (error || !data) {
        await logSecurityEvent({
          eventType: 'AUTHORIZATION_ERROR',
          userId: user.value.id,
          userEmail: user.value.email,
          resourceAccessed: to.path,
          details: { error: error?.message || 'User not found' },
          severity: 'HIGH'
        })
        throw createError({ statusCode: 403, statusMessage: 'Access Denied' })
      }

      if (!['Admin', 'Developer'].includes(data.rank)) {
        await logSecurityEvent({
          eventType: 'ACCESS_DENIED',
          userId: user.value.id,
          userEmail: user.value.email,
          resourceAccessed: to.path,
          details: { 
            userRole: data.rank,
            userName: `${data.first_name} ${data.last_name}`,
            requiredRoles: ['Admin', 'Developer']
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