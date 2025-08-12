/**
 * Admin-Only Authorization Middleware
 * Implements CSSECDV requirement 2.2: Access controls should fail securely
 * Only allows access to users with Admin or Website Administrator roles
 * Explicitly excludes Developer role for certain admin functions
 */

/**
 * Log security events
 */
async function logSecurityEvent(
  userId: string | null,
  eventType: string,
  description: string,
  severity: string
) {
  try {
    await $fetch('/api/security/log-event', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        userId,
        eventType,
        description,
        severity,
        timestamp: new Date().toISOString()
      })
    });
  } catch (error) {
    console.error('Error logging security event:', error);
  }
}

export default defineNuxtRouteMiddleware(async (to) => {
  const nuxtApp = useNuxtApp();
  
  // Get verified user data from global auth middleware
  const verifiedUser = nuxtApp.ssrContext?.verifiedUser;
  const verifiedEmployee = nuxtApp.ssrContext?.verifiedEmployee;

  // Ensure user is authenticated first (should be handled by global auth middleware)
  if (!verifiedUser || !verifiedEmployee) {
    await logSecurityEvent(null, 'unauthorized_admin_only_access', `Unauthorized access attempt to ${to.path}`, 'high');
    throw createError({
      statusCode: 401,
      statusMessage: 'Authentication required'
    });
  }

  try {
    // Check if user has admin privileges (Admin or Website Administrator only, NOT Developer)
    const adminOnlyRoles = ['Admin', 'Website Administrator'];
    const hasAdminOnlyAccess = adminOnlyRoles.includes(verifiedEmployee.rank) || 
                              adminOnlyRoles.includes(verifiedEmployee.account_type);

    if (!hasAdminOnlyAccess) {
      // Log unauthorized access attempt (including developers)
      await logSecurityEvent(
        verifiedUser.id, 
        'unauthorized_admin_only_access', 
        `User with rank ${verifiedEmployee.rank}/${verifiedEmployee.account_type} attempted to access admin-only route: ${to.path}`,
        'high'
      );
      
      throw createError({
        statusCode: 403,
        statusMessage: 'Insufficient privileges. Admin access required.'
      });
    }

    // Log successful admin-only access
    await logSecurityEvent(
      verifiedUser.id, 
      'admin_only_access_granted', 
      `Admin-only access granted to ${verifiedEmployee.rank}/${verifiedEmployee.account_type} for route: ${to.path}`,
      'low'
    );

  } catch (error) {
    // If it's already a createError, re-throw it
    if (error.statusCode) {
      throw error;
    }

    // Log unexpected error
    await logSecurityEvent(
      verifiedUser?.id, 
      'admin_only_middleware_error', 
      `Unexpected error in admin-only middleware: ${error.message}`, 
      'critical'
    );
    
    throw createError({
      statusCode: 500,
      statusMessage: 'Access verification failed'
    });
  }
});
