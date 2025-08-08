/**
 * Developer Authorization Middleware
 * Implements CSSECDV requirement 2.2: Access controls should fail securely
 * Only allows access to users with Developer role (highest privilege level)
 * Used for system configuration, database management, security settings, etc.
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
    await logSecurityEvent(null, 'unauthorized_developer_access', `Unauthorized access attempt to ${to.path}`, 'critical');
    throw createError({
      statusCode: 401,
      statusMessage: 'Authentication required'
    });
  }

  try {
    // Only developers have access to developer-level features (check both rank and account_type)
    const hasDeveloperAccess = verifiedEmployee.rank === 'Developer' || 
                               verifiedEmployee.account_type === 'Developer';

    if (!hasDeveloperAccess) {
      // Log unauthorized access attempt - this is critical as someone is trying to access dev features
      await logSecurityEvent(
        verifiedUser.id, 
        'unauthorized_developer_access', 
        `User with rank ${verifiedEmployee.rank}/${verifiedEmployee.account_type} attempted to access developer route: ${to.path}`,
        'critical'
      );
      
      throw createError({
        statusCode: 403,
        statusMessage: 'Insufficient privileges. Developer access required.'
      });
    }

    // Log successful developer access
    await logSecurityEvent(
      verifiedUser.id, 
      'developer_access_granted', 
      `Developer access granted for route: ${to.path}`,
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
      'developer_middleware_error', 
      `Unexpected error in developer middleware: ${error.message}`, 
      'critical'
    );
    
    throw createError({
      statusCode: 500,
      statusMessage: 'Access verification failed'
    });
  }
});