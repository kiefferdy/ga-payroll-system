/**
 * Simplified Login Endpoint for Testing
 * This version works without the new security database tables
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
  const { email, password } = body;

  // Input validation
  if (!email || !password) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid username and/or password'
    });
  }

  // Initialize Supabase client
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_BYPASS_KEY;
  
  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing Supabase config');
    throw createError({
      statusCode: 500,
      statusMessage: 'Server configuration error'
    });
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  try {
    // Attempt authentication with Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (authError || !authData.user) {
      console.log('Login failed:', authError?.message);
      throw createError({
        statusCode: 401,
        statusMessage: 'Invalid username and/or password'
      });
    }

    // Return success response
    return {
      success: true,
      message: 'Login successful',
      user: {
        id: authData.user.id,
        email: authData.user.email
      }
    };

  } catch (error) {
    // If it's already a createError, re-throw it
    if (error.statusCode) {
      throw error;
    }

    console.error('Login error:', error);
    
    throw createError({
      statusCode: 500,
      statusMessage: 'An error occurred during login. Please try again.'
    });
  }
});