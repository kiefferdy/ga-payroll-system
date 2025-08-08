/**
 * Password Reuse Check API
 * Implements CSSECDV requirement 2.1.10: Prevent password re-use
 * Securely compares new password against password history
 */

import bcrypt from 'bcrypt';
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
  const { password, userId, previousHashes } = body;

  // Input validation
  if (!password || !userId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Missing required fields'
    });
  }

  if (!Array.isArray(previousHashes)) {
    return { isReused: false };
  }

  try {
    // Initialize Supabase client for logging
    const supabaseUrl = useRuntimeConfig().public.supabase.url;
    const supabaseServiceKey = useRuntimeConfig().supabaseBypassKey;
    
    if (!supabaseUrl || !supabaseServiceKey) {
      throw createError({
        statusCode: 500,
        statusMessage: 'Server configuration error'
      });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Compare password against each stored hash
    let isReused = false;
    
    for (const hash of previousHashes) {
      if (hash && await bcrypt.compare(password, hash)) {
        isReused = true;
        break;
      }
    }

    // Log the password reuse check attempt
    if (isReused) {
      await supabase.rpc('log_security_event', {
        p_user_id: userId,
        p_event_type: 'password_reuse_attempt',
        p_description: 'User attempted to reuse a previous password',
        p_ip_address: getHeader(event, 'x-forwarded-for') || getHeader(event, 'x-real-ip') || 'unknown',
        p_user_agent: getHeader(event, 'user-agent') || '',
        p_severity: 'medium',
        p_metadata: null
      });
    }

    return {
      success: true,
      isReused
    };

  } catch (error) {
    console.error('Password reuse check error:', error);
    
    // Log the error but don't expose details
    throw createError({
      statusCode: 500,
      statusMessage: 'Password validation failed'
    });
  }
});