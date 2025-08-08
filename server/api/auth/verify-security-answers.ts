/**
 * Verify Security Answers API  
 * Implements CSSECDV requirement 2.1.9: Password reset questions support sufficiently random answers
 * Verifies user's answers to security questions for password reset
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
  const { userId, answers } = body;

  // Input validation
  if (!userId || !answers || !Array.isArray(answers) || answers.length !== 3) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid request data'
    });
  }

  // Validate each answer
  for (let i = 0; i < answers.length; i++) {
    if (!answers[i] || typeof answers[i] !== 'string' || answers[i].trim() === '') {
      throw createError({
        statusCode: 400,
        statusMessage: `Answer ${i + 1} is required`
      });
    }
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

    // Get stored security questions and answers
    let storedQuestions = [];
    
    // Try dedicated security_questions table first
    const { data: securityData, error: securityError } = await supabase
      .from('security_questions')
      .select('question_text, answer_hash, question_order')
      .eq('user_id', userId)
      .order('question_order');

    if (!securityError && securityData && securityData.length >= 3) {
      storedQuestions = securityData.map(q => ({
        question: q.question_text,
        answerHash: q.answer_hash,
        order: q.question_order
      }));
    } else {
      // Fallback: get from employee record
      const { data: employeeData, error: employeeError } = await supabase
        .from('Employees')
        .select('security_questions')
        .eq('id', userId)
        .single();

      if (employeeError || !employeeData?.security_questions?.questions) {
        // Log failed attempt
        await supabase.rpc('log_security_event', {
          p_user_id: userId,
          p_event_type: 'password_reset_questions_not_found',
          p_description: 'Security questions not found during password reset verification',
          p_ip_address: getHeader(event, 'x-forwarded-for') || getHeader(event, 'x-real-ip') || 'unknown',
          p_user_agent: getHeader(event, 'user-agent') || '',
          p_severity: 'medium',
          p_metadata: null
        });

        throw createError({
          statusCode: 400,
          statusMessage: 'Security questions not found'
        });
      }

      storedQuestions = employeeData.security_questions.questions
        .map(q => ({
          question: q.question,
          answerHash: q.answer_hash,
          order: q.order
        }))
        .sort((a, b) => a.order - b.order);
    }

    if (storedQuestions.length < 3) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Insufficient security questions'
      });
    }

    // Verify each answer
    const verificationResults = await Promise.all(
      answers.map(async (answer, index) => {
        try {
          const normalizedAnswer = answer.toLowerCase().trim();
          const storedHash = storedQuestions[index].answerHash;
          
          if (!storedHash) {
            return false;
          }
          
          return await bcrypt.compare(normalizedAnswer, storedHash);
        } catch (error) {
          console.error(`Error verifying answer ${index + 1}:`, error);
          return false;
        }
      })
    );

    // Check if all answers are correct
    const allCorrect = verificationResults.every(result => result === true);
    const correctCount = verificationResults.filter(result => result === true).length;

    // Log the verification attempt
    await supabase.rpc('log_security_event', {
      p_user_id: userId,
      p_event_type: allCorrect ? 'security_answers_verified' : 'security_answers_failed',
      p_description: `Security questions verification ${allCorrect ? 'succeeded' : 'failed'} (${correctCount}/3 correct)`,
      p_ip_address: getHeader(event, 'x-forwarded-for') || getHeader(event, 'x-real-ip') || 'unknown',
      p_user_agent: getHeader(event, 'user-agent') || '',
      p_severity: allCorrect ? 'low' : 'medium',
      p_metadata: null
    });

    if (!allCorrect) {
      // Increment failed attempts counter for rate limiting
      const { error: updateError } = await supabase
        .from('Employees')
        .update({ 
          failed_login_attempts: supabase.rpc('increment_failed_attempts', { user_id: userId })
        })
        .eq('id', userId);

      if (updateError) {
        console.error('Error updating failed attempts:', updateError);
      }

      // Check if user should be locked out (5+ failed attempts in security context)
      const { data: employeeData } = await supabase
        .from('Employees')
        .select('failed_login_attempts')
        .eq('id', userId)
        .single();

      if (employeeData?.failed_login_attempts >= 5) {
        const lockoutUntil = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes

        await supabase
          .from('Employees')
          .update({ account_locked_until: lockoutUntil.toISOString() })
          .eq('id', userId);

        await supabase.rpc('log_security_event', {
          p_user_id: userId,
          p_event_type: 'account_locked_security_failures',
          p_description: 'Account locked due to repeated security question failures',
          p_ip_address: getHeader(event, 'x-forwarded-for') || getHeader(event, 'x-real-ip') || 'unknown',
          p_user_agent: getHeader(event, 'user-agent') || '',
          p_severity: 'high',
          p_metadata: null
        });

        throw createError({
          statusCode: 429,
          statusMessage: 'Account temporarily locked due to multiple failed attempts'
        });
      }

      return {
        success: false,
        message: 'One or more security answers are incorrect'
      };
    }

    // Reset failed attempts on successful verification
    await supabase
      .from('public."Employees"')
      .update({ failed_login_attempts: 0 })
      .eq('id', userId);

    return {
      success: true,
      message: 'Security answers verified successfully'
    };

  } catch (error) {
    console.error('Security answers verification error:', error);
    
    // If it's already a createError, re-throw it
    if (error.statusCode) {
      throw error;
    }
    
    throw createError({
      statusCode: 500,
      statusMessage: 'Verification failed'
    });
  }
});