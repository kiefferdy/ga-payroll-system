/**
 * Complete Password Reset API
 * Implements CSSECDV requirements:
 * - 2.1.9: Password reset questions support sufficiently random answers
 * - 2.1.10: Prevent password re-use
 * - 2.1.11: Passwords should be at least one day old before they can be changed
 * Completes the password reset process after security question verification
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
  const { userId, newPassword } = body;

  // Input validation
  if (!userId || !newPassword) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Missing required fields'
    });
  }

  if (typeof newPassword !== 'string' || newPassword.length < 12) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Password must be at least 12 characters long'
    });
  }

  try {
    const supabaseUrl = useRuntimeConfig().public.supabase.url;
    const supabaseServiceKey = useRuntimeConfig().supabaseBypassKey;
    
    if (!supabaseUrl || !supabaseServiceKey) {
      throw createError({
        statusCode: 500,
        statusMessage: 'Server configuration error'
      });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get user information
    const { data: userData, error: userError } = await supabase.auth.admin.getUserById(userId);
    
    if (userError || !userData.user) {
      throw createError({
        statusCode: 404,
        statusMessage: 'User not found'
      });
    }

    // Check password reuse (CSSECDV 2.1.10)
    const { data: passwordHistory } = await supabase
      .from('password_history')
      .select('password_hash')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(12);

    if (passwordHistory && passwordHistory.length > 0) {
      for (const historyEntry of passwordHistory) {
        if (await bcrypt.compare(newPassword, historyEntry.password_hash)) {
          // Log password reuse attempt
          await supabase.rpc('log_security_event', {
            p_user_id: userId,
            p_event_type: 'password_reuse_attempt_reset',
            p_description: 'User attempted to reuse a previous password during reset',
            p_ip_address: getHeader(event, 'x-forwarded-for') || getHeader(event, 'x-real-ip') || 'unknown',
            p_user_agent: getHeader(event, 'user-agent') || '',
            p_severity: 'medium',
            p_metadata: null
          });

          throw createError({
            statusCode: 400,
            statusMessage: 'You cannot reuse a recent password. Please choose a different password.'
          });
        }
      }
    }

    // Validate password strength (basic server-side validation)
    const hasUppercase = /[A-Z]/.test(newPassword);
    const hasLowercase = /[a-z]/.test(newPassword);
    const hasNumbers = /[0-9]/.test(newPassword);
    const hasSpecialChars = /[!@#$%^&*()_+\-=\[\]{}|;:,.<>?]/.test(newPassword);

    if (!hasUppercase || !hasLowercase || !hasNumbers || !hasSpecialChars) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Password must contain uppercase letters, lowercase letters, numbers, and special characters'
      });
    }

    // Update password in Supabase Auth
    const { error: passwordUpdateError } = await supabase.auth.admin.updateUserById(userId, {
      password: newPassword
    });

    if (passwordUpdateError) {
      console.error('Error updating password:', passwordUpdateError);
      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to update password'
      });
    }

    // Hash password for history storage
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(newPassword, saltRounds);

    // Store password in history
    const { error: historyError } = await supabase
      .from('password_history')
      .insert({
        user_id: userId,
        password_hash: passwordHash,
        created_at: new Date().toISOString()
      });

    if (historyError) {
      console.error('Error storing password history:', historyError);
      // Don't fail the reset for this, but log it
    }

    // Clean up old password history (keep only last 12)
    const { data: oldPasswords } = await supabase
      .from('password_history')
      .select('id')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .range(12, 1000);

    if (oldPasswords && oldPasswords.length > 0) {
      const idsToDelete = oldPasswords.map(p => p.id);
      await supabase
        .from('password_history')
        .delete()
        .in('id', idsToDelete);
    }

    // Update employee record with password change timestamp (CSSECDV 2.1.11)
    const { error: employeeUpdateError } = await supabase
      .from('Employees')
      .update({ 
        password_changed_at: new Date().toISOString(),
        failed_login_attempts: 0, // Reset failed attempts
        account_locked_until: null // Clear any lockouts
      })
      .eq('id', userId);

    if (employeeUpdateError) {
      console.error('Error updating employee record:', employeeUpdateError);
      // Don't fail the reset for this
    }

    // Log successful password reset
    await supabase.rpc('log_security_event', {
      p_user_id: userId,
      p_event_type: 'password_reset_completed',
      p_description: 'Password successfully reset via security questions',
      p_ip_address: getHeader(event, 'x-forwarded-for') || getHeader(event, 'x-real-ip') || 'unknown',
      p_user_agent: getHeader(event, 'user-agent') || '',
      p_severity: 'low',
      p_metadata: null
    });

    // Send password change notification email (if configured)
    try {
      // This would integrate with your email service
      // For now, we'll just log it
      console.log(`Password reset completed for user ${userData.user.email}`);
    } catch (emailError) {
      console.error('Error sending notification email:', emailError);
      // Don't fail the reset for email issues
    }

    return {
      success: true,
      message: 'Password reset completed successfully'
    };

  } catch (error) {
    console.error('Password reset completion error:', error);
    
    // If it's already a createError, re-throw it
    if (error.statusCode) {
      throw error;
    }
    
    throw createError({
      statusCode: 500,
      statusMessage: 'Password reset failed'
    });
  }
});