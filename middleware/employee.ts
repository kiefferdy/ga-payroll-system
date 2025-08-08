/**
 * Employee Authorization Middleware
 * Implements CSSECDV requirement 2.2: Access controls should fail securely
 * Allows access to users with Employee rank or higher (Employee, Admin, Developer, Website Administrator)
 * Used for employee-level features like time tracking, profile management, etc.
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
    await logSecurityEvent(null, 'unauthorized_employee_access', `Unauthorized access attempt to ${to.path}`, 'medium');
    throw createError({
      statusCode: 401,
      statusMessage: 'Authentication required'
    });
  }

  try {
    // Define employee and higher roles (check both rank and account_type)
    const employeeRoles = ['Employee', 'Admin', 'Developer', 'Website Administrator', 'Product Manager'];
    const hasEmployeeAccess = employeeRoles.includes(verifiedEmployee.rank) || 
                             employeeRoles.includes(verifiedEmployee.account_type);

    if (!hasEmployeeAccess) {
      // Log unauthorized access attempt
      await logSecurityEvent(
        verifiedUser.id, 
        'unauthorized_employee_access', 
        `User with rank ${verifiedEmployee.rank}/${verifiedEmployee.account_type} attempted to access employee route: ${to.path}`,
        'medium'
      );
      
      throw createError({
        statusCode: 403,
        statusMessage: 'Insufficient privileges. Employee access required.'
      });
    }

    // Log successful employee access
    await logSecurityEvent(
      verifiedUser.id, 
      'employee_access_granted', 
      `Employee access granted to ${verifiedEmployee.rank}/${verifiedEmployee.account_type} for route: ${to.path}`,
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
      'employee_middleware_error', 
      `Unexpected error in employee middleware: ${error.message}`, 
      'critical'
    );
    
    throw createError({
      statusCode: 500,
      statusMessage: 'Access verification failed'
    });
  }
});