/**
 * Password History Storage API
 * Implements CSSECDV requirement 2.1.10: Prevent password re-use
 * Stores password hashes in history for reuse prevention
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
  const { userId, passwordHash } = body;

  // Input validation
  if (!userId || !passwordHash) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Missing required fields'
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

    // Store the new password hash
    const { error: insertError } = await supabase
      .from('password_history')
      .insert({
        user_id: userId,
        password_hash: passwordHash,
        created_at: new Date().toISOString()
      });

    if (insertError) {
      console.error('Error inserting password history:', insertError);
      throw insertError;
    }

    // Clean up old password history (keep only last 12)
    const { data: oldPasswords, error: selectError } = await supabase
      .from('password_history')
      .select('id')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .range(12, 1000); // Get records beyond the first 12

    if (selectError) {
      console.error('Error selecting old passwords:', selectError);
    } else if (oldPasswords && oldPasswords.length > 0) {
      const idsToDelete = oldPasswords.map(p => p.id);
      
      const { error: deleteError } = await supabase
        .from('password_history')
        .delete()
        .in('id', idsToDelete);

      if (deleteError) {
        console.error('Error cleaning up old passwords:', deleteError);
      }
    }

    // Update the password_changed_at timestamp for age validation
    const { error: updateError } = await supabase
      .from('Employees')
      .update({ 
        password_changed_at: new Date().toISOString()
      })
      .eq('id', userId);

    if (updateError) {
      console.error('Error updating password timestamp:', updateError);
    }

    // Log successful password change
    await supabase.rpc('log_security_event', {
      p_user_id: userId,
      p_event_type: 'password_changed',
      p_description: 'User successfully changed password',
      p_ip_address: getHeader(event, 'x-forwarded-for') || getHeader(event, 'x-real-ip') || 'unknown',
      p_user_agent: getHeader(event, 'user-agent') || '',
      p_severity: 'low',
      p_metadata: null
    });

    return {
      success: true,
      message: 'Password history updated successfully'
    };

  } catch (error) {
    console.error('Password history storage error:', error);
    
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to store password history'
    });
  }
});