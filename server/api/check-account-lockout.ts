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
        const { email } = body;

        if (!email) {
            return { error: 'Email is required' };
        }

        // First get user ID from auth.users
        const { data: authUser, error: authError } = await supabase
            .from('auth.users')
            .select('id')
            .eq('email', email)
            .single();

        if (authError || !authUser) {
            // Don't reveal if email exists - return unlocked status
            return { isLocked: false };
        }

        // Check lockout status in Employees table
        const { data, error } = await supabase
            .from('Employees')
            .select('failed_login_attempts, locked_until')
            .eq('id', authUser.id)
            .single();

        if (error || !data) {
            return { isLocked: false };
        }

        const now = new Date();
        const lockedUntil = data.locked_until ? new Date(data.locked_until) : null;

        // Check if account is currently locked
        const isLocked = lockedUntil && lockedUntil > now;

        // If lock period has expired, clear the lock
        if (lockedUntil && lockedUntil <= now) {
            await supabase
                .from('Employees')
                .update({
                    locked_until: null,
                    failed_login_attempts: 0
                })
                .eq('id', authUser.id);

            return {
                isLocked: false,
                failedAttempts: 0
            };
        }

        return {
            isLocked,
            lockedUntil,
            failedAttempts: data.failed_login_attempts || 0
        };

    } catch (error) {
        console.error('Error checking account lockout:', error);
        return { isLocked: false, error: 'Failed to check account status' };
    }
});