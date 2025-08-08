/**
 * Global Authentication Middleware
 * Implements CSSECDV requirement 2.1.1: Require authentication for all pages and resources, 
 * except those specifically intended to be public
 */

export default defineNuxtRouteMiddleware((to) => {
  // Public routes that don't require authentication
  const publicRoutes = ['/login'];
  
  // Check if current route is public
  if (publicRoutes.includes(to.path)) {
    return;
  }

  // Check if user is authenticated
  const supabase = useSupabaseClient();
  const user = useSupabaseUser();

  // If no user is logged in, redirect to login
  if (!user.value) {
    return navigateTo('/login');
  }

  // Log the route access for security monitoring
  logRouteAccess(to.path, user.value.id);
});

/**
 * Log route access for security monitoring
 */
async function logRouteAccess(path: string, userId: string) {
  try {
    // Only log if not a static asset or API call
    if (!path.includes('.') && !path.startsWith('/api/')) {
      await fetch('/api/security/log-access', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userId,
          path,
          timestamp: new Date().toISOString()
        })
      });
    }
  } catch (error) {
    console.error('Error logging route access:', error);
  }
}