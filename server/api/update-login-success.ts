import { defineEventHandler } from 'h3';
import { createClient } from '@supabase/supabase-js';

// Env variables for Supabase
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_BYPASS_KEY;

if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing environment variables required for server API');
}

const supabase = createClient(supabaseUrl, supabaseKey);

export default defineEventHandler(async (event) => {
    try {
        const body = await readBody(event);
        const { userId } = body;

        if (!userId) {
            return { success: false, error: 'User ID is required' };
        }

        // Update last login timestamp and reset failed attempts
        const { error } = await supabase
            .from('Employees')
            .update({
                last_login_at: new Date().toISOString(),
                failed_login_attempts: 0,
                locked_until: null // Clear any existing lockout
            })
            .eq('id', userId);

        if (error) {
            console.error('Error updating login success data:', error);
            return { success: false, error: 'Failed to update login data' };
        }

        // Log successful login with reset information
        await supabase
            .from('SecurityLogs')
            .insert({
                event_type: 'LOGIN_SUCCESS_PROCESSED',
                user_id: userId,
                details: {
                    last_login_updated: new Date().toISOString(),
                    failed_attempts_reset: true,
                    lockout_cleared: true
                },
                severity: 'LOW'
            });

        return { success: true };

    } catch (error) {
        console.error('Error in update-login-success:', error);
        return { success: false, error: 'Internal server error' };
    }
});