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

    // Log the security event using the database function
    const { error } = await supabase.rpc('log_security_event', {
      p_user_id: userId,
      p_event_type: eventType,
      p_description: description,
      p_ip_address: clientIP,
      p_user_agent: userAgent,
      p_severity: severity,
      p_metadata: null
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