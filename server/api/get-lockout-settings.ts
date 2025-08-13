import { defineEventHandler } from 'h3';
import { getServiceRoleClient } from '../utils/supabase-clients';

export default defineEventHandler(async (event) => {
    try {
        // Fetch lockout settings from Settings table using service role client
        const supabase = getServiceRoleClient(event);
        const { data: settings, error } = await supabase
            .from('Settings')
            .select(`
                max_failed_login_attempts,
                lockout_duration_minutes,
                auto_unlock_accounts
            `)
            .single();

        if (error) {
            console.error('Error fetching lockout settings:', error);
            // Return defaults if error occurs
            return {
                maxFailedAttempts: 5,
                lockoutDurationMinutes: 30,
                autoUnlock: true
            };
        }

        // Return settings with defaults for any null values
        return {
            maxFailedAttempts: settings?.max_failed_login_attempts || 5,
            lockoutDurationMinutes: settings?.lockout_duration_minutes || 30,
            autoUnlock: settings?.auto_unlock_accounts ?? true
        };

    } catch (error) {
        console.error('Error in get-lockout-settings API:', error);
        // Return defaults if any error occurs
        return {
            maxFailedAttempts: 5,
            lockoutDurationMinutes: 30,
            autoUnlock: true
        };
    }
});