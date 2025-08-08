/**
 * Admin Authorization Middleware
 * Implements CSSECDV requirement 2.2: Access controls should fail securely
 * Only allows access to users with Admin, Developer, or Website Administrator roles
 */

export default defineNuxtRouteMiddleware(async (to) => {
  const supabase = useSupabaseClient();
  const user = useSupabaseUser();

  // Ensure user is authenticated first
  if (!user.value) {
    await logSecurityEvent(null, 'unauthorized_admin_access', `Unauthorized access attempt to ${to.path}`, 'high');
    throw createError({
      statusCode: 401,
      statusMessage: 'Authentication required'
    });
  }

  try {
    // Check user's role from database
    const { data, error } = await supabase
      .from('Employees')
      .select('rank, account_type')
      .eq('id', user.value.id)
      .single();

    if (error) {
      await logSecurityEvent(user.value.id, 'admin_access_error', `Database error during admin check: ${error.message}`, 'high');
      throw createError({
        statusCode: 500,
        statusMessage: 'Access verification failed'
      });
    }

    // Check if user has admin privileges
    const adminRoles = ['Admin', 'Developer', 'Website Administrator'];
    const hasAdminAccess = adminRoles.includes(data?.rank) || adminRoles.includes(data?.account_type);

    if (!hasAdminAccess) {
      // Log unauthorized access attempt
      await logSecurityEvent(
        user.value.id, 
        'unauthorized_admin_access', 
        `User with role ${data?.rank}/${data?.account_type} attempted to access admin route: ${to.path}`,
        'high'
      );
      
      throw createError({
        statusCode: 403,
        statusMessage: 'Insufficient privileges'
      });
    }

    // Log successful admin access
    await logSecurityEvent(
      user.value.id, 
      'admin_access_granted', 
      `Admin access granted to ${to.path}`,
      'low'
    );

  } catch (error) {
    // If it's already a createError, re-throw it
    if (error.statusCode) {
      throw error;
    }

    // Log unexpected error
    await logSecurityEvent(user.value.id, 'admin_middleware_error', `Unexpected error in admin middleware: ${error.message}`, 'critical');
    
    throw createError({
      statusCode: 500,
      statusMessage: 'Access verification failed'
    });
  }
});

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
    await fetch('/api/security/log-event', {
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