/**
 * Secure Authentication Login Endpoint
 * Implements CSSECDV security requirements:
 * - Account lockout after failed attempts
 * - Generic error messages
 * - Authentication attempt logging
 * - Rate limiting protection
 */

import { createClient } from '@supabase/supabase-js';

// Rate limiting cache (in production, use Redis or similar)
const loginAttempts = new Map();
const rateLimitWindow = 15 * 60 * 1000; // 15 minutes
const maxAttemptsPerWindow = 5;

export default defineEventHandler(async (event) => {
  // Only allow POST requests
  if (getMethod(event) !== 'POST') {
    throw createError({
      statusCode: 405,
      statusMessage: 'Method not allowed'
    });
  }

  const body = await readBody(event);
  const { email, password, userAgent } = body;

  // Get client IP address for logging and rate limiting  
  const clientIP = getHeader(event, 'x-forwarded-for') || getHeader(event, 'x-real-ip') || 'unknown';
  
  // Input validation
  if (!email || !password) {
    await logAuthAttempt(null, email, clientIP, userAgent, false, 'missing_credentials');
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid username and/or password'
    });
  }

  // Rate limiting check
  const rateLimitKey = `login_${clientIP}`;
  if (isRateLimited(rateLimitKey)) {
    await logSecurityEvent(null, 'rate_limit_exceeded', `Rate limit exceeded for IP: ${clientIP}`, clientIP, userAgent, 'medium');
    throw createError({
      statusCode: 429,
      statusMessage: 'Too many login attempts. Please try again later.'
    });
  }

  // Initialize Supabase client
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_BYPASS_KEY; // Using SUPABASE_BYPASS_KEY from your env
  
  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing Supabase config:', { supabaseUrl: !!supabaseUrl, supabaseServiceKey: !!supabaseServiceKey });
    throw createError({
      statusCode: 500,
      statusMessage: 'Server configuration error'
    });
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  try {
    // Check if account is locked before attempting authentication
    // First get the user ID
    const { data: authUser } = await supabase.auth.admin.listUsers();
    const existingUser = authUser?.users?.find(u => u.email === email);
    
    if (existingUser) {
      // Check if user is locked in Employees table
      const { data: employeeData } = await supabase
        .from('Employees')
        .select('account_locked_until')
        .eq('id', existingUser.id)
        .single();
        
      if (employeeData?.account_locked_until) {
        const lockoutTime = new Date(employeeData.account_locked_until);
        const now = new Date();
        
        if (now < lockoutTime) {
          await logAuthAttempt(null, email, clientIP, userAgent, false, 'account_locked');
          throw createError({
            statusCode: 423,
            statusMessage: 'Account temporarily locked due to multiple failed login attempts. Please try again later.',
            data: { locked: true }
          });
        }
      }
    }

    // Attempt authentication with Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (authError || !authData.user) {
      // Increment failed login attempts
      await incrementFailedAttempts(email, supabase);
      
      // Log failed attempt
      await logAuthAttempt(null, email, clientIP, userAgent, false, 'invalid_credentials');
      
      // Increment rate limiting counter
      incrementRateLimit(rateLimitKey);
      
      throw createError({
        statusCode: 401,
        statusMessage: 'Invalid username and/or password'
      });
    }

    // Authentication successful
    const user = authData.user;
    
    // Reset failed login attempts on successful login
    await resetFailedAttempts(user.id, supabase);
    
    // Update last login information
    await updateLastLogin(user.id, clientIP, supabase);
    
    // Log successful authentication
    await logAuthAttempt(user.id, email, clientIP, userAgent, true, null);
    
    // Log security event
    await logSecurityEvent(user.id, 'login_success', 'User logged in successfully', clientIP, userAgent, 'low');

    // Return success response
    return {
      success: true,
      message: 'Login successful',
      user: {
        id: user.id,
        email: user.email
      }
    };

  } catch (error) {
    // If it's already a createError, re-throw it
    if (error.statusCode) {
      throw error;
    }

    console.error('Login error:', error);
    
    // Log the error but don't expose details to client
    await logSecurityEvent(null, 'login_error', `Login system error: ${error.message}`, clientIP, userAgent, 'high');
    
    throw createError({
      statusCode: 500,
      statusMessage: 'An error occurred during login. Please try again.'
    });
  }
});

/**
 * Check if IP address is rate limited
 */
function isRateLimited(key: string): boolean {
  const now = Date.now();
  const attempts = loginAttempts.get(key) || [];
  
  // Clean old attempts
  const recentAttempts = attempts.filter((time: number) => now - time < rateLimitWindow);
  loginAttempts.set(key, recentAttempts);
  
  return recentAttempts.length >= maxAttemptsPerWindow;
}

/**
 * Increment rate limiting counter
 */
function incrementRateLimit(key: string): void {
  const now = Date.now();
  const attempts = loginAttempts.get(key) || [];
  attempts.push(now);
  loginAttempts.set(key, attempts);
}

/**
 * Increment failed login attempts for a user
 */
async function incrementFailedAttempts(email: string, supabase: any): Promise<void> {
  try {
    // First, get user ID from auth.users table
    const { data: authUser } = await supabase.auth.admin.listUsers();
    const user = authUser?.users?.find(u => u.email === email);
    
    if (!user) {
      return;
    }

    // Get current employee data using the user ID
    const { data: userData } = await supabase
      .from('Employees')
      .select('id, failed_login_attempts')
      .eq('id', user.id)
      .single();

    if (userData) {
      const newFailedAttempts = (userData.failed_login_attempts || 0) + 1;
      const maxFailedAttempts = 5;
      
      // Update failed attempts count
      const updateData: any = { 
        failed_login_attempts: newFailedAttempts 
      };
      
      // Lock account if max attempts reached
      if (newFailedAttempts >= maxFailedAttempts) {
        const lockoutDuration = 15 * 60 * 1000; // 15 minutes
        updateData.account_locked_until = new Date(Date.now() + lockoutDuration).toISOString();
        
        // Log the lockout in account_lockouts table
        await supabase
          .from('account_lockouts')
          .insert([{
            user_id: userData.id,
            email: email,
            locked_until: updateData.account_locked_until,
            attempt_count: newFailedAttempts,
            reason: 'failed_login_attempts'
          }]);
      }
      
      const { error: updateError } = await supabase
        .from('Employees')
        .update(updateData)
        .eq('id', userData.id);
        
      if (updateError) {
        console.error('Error updating employee failed attempts:', updateError);
      }
    }
  } catch (error) {
    console.error('Error incrementing failed attempts:', error);
  }
}

/**
 * Reset failed login attempts for a user
 */
async function resetFailedAttempts(userId: string, supabase: any): Promise<void> {
  try {
    await supabase
      .from('Employees')
      .update({ 
        failed_login_attempts: 0,
        account_locked_until: null
      })
      .eq('id', userId);
  } catch (error) {
    console.error('Error resetting failed attempts:', error);
  }
}

/**
 * Update last login information
 */
async function updateLastLogin(userId: string, ipAddress: string, supabase: any): Promise<void> {
  try {
    await supabase
      .from('Employees')
      .update({ 
        last_login_at: new Date().toISOString(),
        last_login_ip: ipAddress
      })
      .eq('id', userId);
  } catch (error) {
    console.error('Error updating last login:', error);
  }
}

/**
 * Log authentication attempts
 */
async function logAuthAttempt(
  userId: string | null, 
  email: string, 
  ipAddress: string, 
  userAgent: string, 
  success: boolean, 
  failureReason: string | null
): Promise<void> {
  try {
    const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_BYPASS_KEY!);
    
    await supabase
      .from('auth_attempts')
      .insert([{
        user_id: userId,
        email: email,
        ip_address: ipAddress,
        user_agent: userAgent,
        attempt_type: 'login',
        success: success,
        failure_reason: failureReason
      }]);
  } catch (error) {
    console.error('Error logging auth attempt:', error);
  }
}

/**
 * Log security events
 */
async function logSecurityEvent(
  userId: string | null,
  eventType: string,
  description: string,
  ipAddress: string,
  userAgent: string,
  severity: string,
  metadata?: any
): Promise<void> {
  try {
    const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_BYPASS_KEY!);
    
    await supabase.rpc('log_security_event', {
      p_user_id: userId,
      p_event_type: eventType,
      p_description: description,
      p_ip_address: ipAddress,
      p_user_agent: userAgent,
      p_severity: severity,
      p_metadata: metadata ? JSON.stringify(metadata) : null
    });
  } catch (error) {
    console.error('Error logging security event:', error);
  }
}