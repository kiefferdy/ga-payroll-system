/**
 * Global Authentication Middleware
 * Implements CSSECDV requirement 2.1.1: Require authentication for all pages and resources, 
 * except those specifically intended to be public
 * Enhanced with server-side session verification and role-based access control
 */

export default defineNuxtRouteMiddleware(async (to) => {
  // Public routes that don't require authentication
  const publicRoutes = ['/login', '/password-reset'];
  
  // Debug logging
  console.log('Auth middleware - Route:', to.path);
  console.log('Auth middleware - Is public?', publicRoutes.includes(to.path));
  
  // Check if current route is public
  if (publicRoutes.includes(to.path)) {
    console.log('Auth middleware - Allowing public route:', to.path);
    return;
  }

  // Get Supabase client and current user
  const supabase = useSupabaseClient();
  const user = useSupabaseUser();

  // If no user is logged in, redirect to login
  if (!user.value) {
    return navigateTo('/login');
  }

  // Server-side session verification
  try {
    const { data: session } = await supabase.auth.getSession();
    
    if (!session?.session?.access_token) {
      // Invalid session - redirect to login
      await supabase.auth.signOut();
      return navigateTo('/login');
    }

    // Verify session with our secure endpoint
    const verification = await $fetch('/api/auth/verify', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${session.session.access_token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!verification.success) {
      console.log('Session verification failed:', verification.error);
      await supabase.auth.signOut();
      return navigateTo('/login');
    }

    // Store verified user and employee data in global state for other middleware/pages
    const nuxtApp = useNuxtApp();
    nuxtApp.ssrContext = nuxtApp.ssrContext || {};
    nuxtApp.ssrContext.verifiedUser = verification.user;
    nuxtApp.ssrContext.verifiedEmployee = verification.employee;

    // Log the route access for security monitoring
    await logRouteAccess(to.path, verification.user.id, verification.employee.rank);

  } catch (error) {
    console.error('Auth middleware error:', error);
    // On verification error, sign out and redirect to login
    await supabase.auth.signOut();
    return navigateTo('/login');
  }
});

/**
 * Log route access for security monitoring
 */
async function logRouteAccess(path: string, userId: string, userRank?: string) {
  try {
    // Only log if not a static asset or API call
    if (!path.includes('.') && !path.startsWith('/api/')) {
      await $fetch('/api/security/log-access', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userId,
          userRank: userRank || 'Unknown',
          path,
          timestamp: new Date().toISOString()
        })
      });
    }
  } catch (error) {
    console.error('Error logging route access:', error);
  }
}