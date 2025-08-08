/**
 * Security Event Logging API
 * Logs security events for monitoring and compliance
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
  const { userId, eventType, description, severity, timestamp } = body;

  // Input validation
  if (!eventType || !description || !severity) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Missing required fields'
    });
  }

  // Validate severity level
  const validSeverities = ['low', 'medium', 'high', 'critical'];
  if (!validSeverities.includes(severity)) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid severity level'
    });
  }

  // Initialize Supabase client
  const supabaseUrl = useRuntimeConfig().public.supabase.url;
  const supabaseServiceKey = useRuntimeConfig().supabaseBypassKey;
  
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

    // Log the security event directly to the security_events table
    const { error } = await supabase
      .from('security_events')
      .insert({
        user_id: userId,
        event_type: eventType,
        event_description: description,
        ip_address: clientIP,
        user_agent: userAgent,
        severity: severity,
        metadata: null,
        created_at: new Date().toISOString()
      });

    if (error) {
      console.error('Error logging security event:', error);
      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to log security event'
      });
    }

    // For critical events, also log to console/external monitoring
    if (severity === 'critical') {
      console.error(`CRITICAL SECURITY EVENT: ${eventType} - ${description} - User: ${userId} - IP: ${clientIP}`);
    }

    return { success: true };

  } catch (error) {
    console.error('Security event logging error:', error);
    throw createError({
      statusCode: 500,
      statusMessage: 'Logging failed'
    });
  }
});