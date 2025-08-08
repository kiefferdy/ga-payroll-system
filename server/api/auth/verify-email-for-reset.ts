/**
 * Verify Email for Password Reset API
 * Implements CSSECDV requirement 2.1.9: Password reset questions support sufficiently random answers
 * Checks if email exists and has security questions set up
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
  const { email } = body;

  // Input validation
  if (!email || typeof email !== 'string' || email.trim() === '') {
    throw createError({
      statusCode: 400,
      statusMessage: 'Email is required'
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

    // Look up user by email in auth.users
    const { data: authUser, error: authError } = await supabase.auth.admin.listUsers();
    
    if (authError) {
      console.error('Error listing users:', authError);
      // Return generic success to prevent email enumeration
      return {
        success: false,
        hasSecurityQuestions: false
      };
    }

    const user = authUser.users.find(u => u.email?.toLowerCase() === email.toLowerCase().trim());
    
    if (!user) {
      // Don't reveal if email exists or not (prevent enumeration)
      return {
        success: false,
        hasSecurityQuestions: false
      };
    }

    // Check if user has security questions set up
    let hasQuestions = false;
    let questions = [];

    // Try to get from dedicated security_questions table first
    const { data: securityData, error: securityError } = await supabase
      .from('security_questions')
      .select('question_text, question_order')
      .eq('user_id', user.id)
      .order('question_order');

    if (!securityError && securityData && securityData.length >= 3) {
      hasQuestions = true;
      questions = securityData.map(q => ({
        text: q.question_text,
        order: q.question_order
      }));
    } else {
      // Fallback: check if stored in employee record
      const { data: employeeData, error: employeeError } = await supabase
        .from('Employees')
        .select('security_questions')
        .eq('id', user.id)
        .single();

      if (!employeeError && employeeData?.security_questions?.questions) {
        const storedQuestions = employeeData.security_questions.questions;
        if (Array.isArray(storedQuestions) && storedQuestions.length >= 3) {
          hasQuestions = true;
          questions = storedQuestions.map(q => ({
            text: q.question,
            order: q.order
          })).sort((a, b) => a.order - b.order);
        }
      }
    }

    // Log password reset attempt (for monitoring)
    await supabase.rpc('log_security_event', {
      p_user_id: user.id,
      p_event_type: 'password_reset_initiated',
      p_description: `Password reset process initiated for email: ${email}`,
      p_ip_address: getHeader(event, 'x-forwarded-for') || getHeader(event, 'x-real-ip') || 'unknown',
      p_user_agent: getHeader(event, 'user-agent') || '',
      p_severity: 'medium',
      p_metadata: null
    });

    if (!hasQuestions) {
      // Log that user doesn't have security questions
      await supabase.rpc('log_security_event', {
        p_user_id: user.id,
        p_event_type: 'password_reset_no_questions',
        p_description: 'Password reset attempted but no security questions found',
        p_ip_address: getHeader(event, 'x-forwarded-for') || getHeader(event, 'x-real-ip') || 'unknown',
        p_user_agent: getHeader(event, 'user-agent') || '',
        p_severity: 'low',
        p_metadata: null
      });

      return {
        success: false,
        hasSecurityQuestions: false
      };
    }

    return {
      success: true,
      hasSecurityQuestions: true,
      userId: user.id,
      questions: questions.map(q => ({ text: q.text })) // Don't include order in response
    };

  } catch (error) {
    console.error('Email verification error:', error);
    
    // Generic response to prevent information leakage
    return {
      success: false,
      hasSecurityQuestions: false
    };
  }
});