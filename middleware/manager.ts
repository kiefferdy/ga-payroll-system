/**
 * Manager Authorization Middleware
 * Implements CSSECDV requirement 2.2: Access controls should fail securely
 * Allows access to users with Manager-level roles and above (Product Manager, Admin, Developer, Website Administrator)
 * Used for management features like team oversight, reporting, product management, etc.
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
    await logSecurityEvent(null, 'unauthorized_manager_access', `Unauthorized access attempt to ${to.path}`, 'high');
    throw createError({
      statusCode: 401,
      statusMessage: 'Authentication required'
    });
  }

  try {
    // Define manager and higher roles (check both rank and account_type)
    const managerRoles = ['Product Manager', 'Admin', 'Developer', 'Website Administrator'];
    const hasManagerAccess = managerRoles.includes(verifiedEmployee.rank) || 
                             managerRoles.includes(verifiedEmployee.account_type);

    if (!hasManagerAccess) {
      // Log unauthorized access attempt
      await logSecurityEvent(
        verifiedUser.id, 
        'unauthorized_manager_access', 
        `User with rank ${verifiedEmployee.rank}/${verifiedEmployee.account_type} attempted to access manager route: ${to.path}`,
        'high'
      );
      
      throw createError({
        statusCode: 403,
        statusMessage: 'Insufficient privileges. Manager access required.'
      });
    }

    // Log successful manager access
    await logSecurityEvent(
      verifiedUser.id, 
      'manager_access_granted', 
      `Manager access granted to ${verifiedEmployee.rank}/${verifiedEmployee.account_type} for route: ${to.path}`,
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
      'manager_middleware_error', 
      `Unexpected error in manager middleware: ${error.message}`, 
      'critical'
    );
    
    throw createError({
      statusCode: 500,
      statusMessage: 'Access verification failed'
    });
  }
});