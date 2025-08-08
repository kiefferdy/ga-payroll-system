/**
 * Route Access Logging API
 * Logs user route access for security monitoring
 */

import { createClient } from '@supabase/supabase-js';

export default defineEventHandler(async (event) => {
  // Only allow POST requests
  if (getMethod(event) !== 'POST') {
    throw createError({
      statusCode: 405,
      statusMessage: 'Method not allowed'
    });
  }

  const body = await readBody(event);
  const { userId, path, timestamp } = body;

  // Input validation
  if (!userId || !path) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Missing required fields'
    });
  }

  // Initialize Supabase client
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_BYPASS_KEY;
  
  if (!supabaseUrl || !supabaseServiceKey) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Server configuration error'
    });
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  try {
    // Get client IP and user agent for logging
    const clientIP = getHeader(event, 'x-forwarded-for') || getHeader(event, 'x-real-ip') || 'unknown';
    const userAgent = getHeader(event, 'user-agent') || '';

    // Log the route access
    const { error } = await supabase
      .from('security_events')
      .insert([{
        user_id: userId,
        event_type: 'route_access',
        event_description: `User accessed route: ${path}`,
        ip_address: clientIP,
        user_agent: userAgent,
        severity: 'low',
        metadata: JSON.stringify({ path })
      }]);

    if (error) {
      console.error('Error logging route access:', error);
      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to log access'
      });
    }

    return { success: true };

  } catch (error) {
    console.error('Route access logging error:', error);
    throw createError({
      statusCode: 500,
      statusMessage: 'Logging failed'
    });
  }
});