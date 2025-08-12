import { defineEventHandler } from 'h3';
import { getServiceRoleClient } from '../utils/supabase-clients';

export default defineEventHandler(async (event) => {
    try {
        const body = await readBody(event);
        const { email } = body;

        if (!email) {
            return { error: 'Email is required' };
        }

        // Get user ID from auth.users table using email (service role - pre-auth check)
        const supabase = getServiceRoleClient(event);
        const { data: userData, error: userError } = await supabase.auth.admin.listUsers();
        
        if (userError) {
            console.error('Error fetching users:', userError);
            return { isLocked: false };
        }
        
        const user = userData.users.find(u => u.email === email);
        if (!user) {
            // Don't reveal if email exists - return unlocked status
            return { isLocked: false };
        }
        
        // Check if user exists in Employees table
        const { data: employeeData, error: employeeError } = await supabase
            .from('Employees')
            .select('id')
            .eq('id', user.id)
            .single();

        if (employeeError || !employeeData) {
            // Don't reveal if email exists - return unlocked status
            return { isLocked: false };
        }

        // Check lockout status in Employees table using service role client
        const { data, error } = await supabase
            .from('Employees')
            .select('failed_login_attempts, locked_until')
            .eq('id', user.id)
            .single();

        if (error || !data) {
            return { isLocked: false };
        }

        const now = new Date();
        const lockedUntil = data.locked_until ? new Date(data.locked_until) : null;

        // Check if account is currently locked
        const isLocked = lockedUntil && lockedUntil > now;

        // If lock period has expired, clear the lock using service role client
        if (lockedUntil && lockedUntil <= now) {
            await (supabase as any)
                .from('Employees')
                .update({
                    locked_until: null,
                    failed_login_attempts: 0
                })
                .eq('id', user.id);

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