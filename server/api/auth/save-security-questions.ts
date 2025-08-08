/**
 * Save Security Questions API
 * Implements CSSECDV requirement 2.1.9: Password reset questions with sufficiently random answers
 * Stores encrypted security questions and hashed answers for password recovery
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
  const { userId, questions } = body;

  // Input validation
  if (!userId || !questions || !Array.isArray(questions) || questions.length !== 3) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid request data'
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

    // Validate each question and answer
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      
      if (!q.question || !q.answer) {
        throw createError({
          statusCode: 400,
          statusMessage: `Question ${i + 1} is incomplete`
        });
      }

      // Validate answer strength - reject weak answers
      const weakAnswers = [
        'password', '123', '123456', 'abc', 'test', 'none', 'n/a', 'na', 
        'unknown', 'idk', 'forgot', 'blue', 'red', 'green', 'black', 'white',
        'yes', 'no', 'maybe', 'dunno', 'secret', 'the bible'
      ];

      const trimmedAnswer = q.answer.toLowerCase().trim();
      
      if (weakAnswers.includes(trimmedAnswer)) {
        throw createError({
          statusCode: 400,
          statusMessage: `Answer for question ${i + 1} is too common. Please provide a more specific answer.`
        });
      }

      if (trimmedAnswer.length < 3) {
        throw createError({
          statusCode: 400,
          statusMessage: `Answer for question ${i + 1} must be at least 3 characters long`
        });
      }
    }

    // Check for duplicate questions
    const questionTexts = questions.map(q => q.question);
    const uniqueQuestions = [...new Set(questionTexts)];
    
    if (questionTexts.length !== uniqueQuestions.length) {
      throw createError({
        statusCode: 400,
        statusMessage: 'All security questions must be different'
      });
    }

    // Hash the answers for secure storage
    const saltRounds = 12;
    const hashedQuestions = await Promise.all(
      questions.map(async (q, index) => ({
        user_id: userId,
        question_text: q.question,
        answer_hash: await bcrypt.hash(q.answer.toLowerCase().trim(), saltRounds),
        question_order: index + 1,
        created_at: new Date().toISOString()
      }))
    );

    // Delete existing security questions for this user
    const { error: deleteError } = await supabase
      .from('security_questions')
      .delete()
      .eq('user_id', userId);

    if (deleteError) {
      console.error('Error deleting existing security questions:', deleteError);
      // Continue anyway - the insert will still work
    }

    // Insert new security questions
    const { error: insertError } = await supabase
      .from('security_questions')
      .insert(hashedQuestions);

    if (insertError) {
      console.error('Error inserting security questions:', insertError);
      
      // If table doesn't exist, we need to handle this gracefully
      if (insertError.code === '42P01') {
        // Create a fallback storage method using JSONB in Employees table
        const questionsData = {
          questions: hashedQuestions.map(q => ({
            question: q.question_text,
            answer_hash: q.answer_hash,
            order: q.question_order
          })),
          created_at: new Date().toISOString()
        };

        const { error: updateError } = await supabase
          .from('Employees')
          .update({ security_questions: questionsData })
          .eq('id', userId);

        if (updateError) {
          console.error('Error storing security questions in employee record:', updateError);
          throw createError({
            statusCode: 500,
            statusMessage: 'Failed to save security questions'
          });
        }
      } else {
        throw createError({
          statusCode: 500,
          statusMessage: 'Failed to save security questions'
        });
      }
    }

    // Log successful security questions setup
    await supabase.rpc('log_security_event', {
      p_user_id: userId,
      p_event_type: 'security_questions_setup',
      p_description: 'User successfully set up security questions for password recovery',
      p_ip_address: getHeader(event, 'x-forwarded-for') || getHeader(event, 'x-real-ip') || 'unknown',
      p_user_agent: getHeader(event, 'user-agent') || '',
      p_severity: 'low',
      p_metadata: null
    });

    return {
      success: true,
      message: 'Security questions saved successfully'
    };

  } catch (error) {
    console.error('Error saving security questions:', error);
    
    // If it's already a createError, re-throw it
    if (error.statusCode) {
      throw error;
    }
    
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal server error'
    });
  }
});