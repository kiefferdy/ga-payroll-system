import { defineEventHandler } from 'h3';
import { getServiceRoleClient } from '../utils/supabase-clients';

export default defineEventHandler(async (event) => {
    try {
        const body = await readBody(event);
        const { userId } = body;

        if (!userId) {
            return { success: false, error: 'User ID is required' };
        }

        // Use service role client for post-login system updates
        const supabase = getServiceRoleClient(event);
        const { error } = await (supabase as any)
            .from('Employees')
            .update({
                last_login_at: new Date().toISOString(),
                failed_login_attempts: 0,
                locked_until: null
            })
            .eq('id', userId);

        if (error) {
            console.error('Error updating login success data:', error);
            return { success: false, error: 'Failed to update login data' };
        }

        // Log successful login processing using RLS logging
        await $fetch('/api/log-security-event', {
            method: 'POST',
            body: {
                eventType: 'LOGIN_SUCCESS_PROCESSED',
                userId,
                details: {
                    last_login_updated: new Date().toISOString(),
                    failed_attempts_reset: true,
                    lockout_cleared: true
                },
                severity: 'LOW'
            }
        });

        return { success: true };

    } catch (error) {
        console.error('Error in update-login-success:', error);
        return { success: false, error: 'Internal server error' };
    }
});