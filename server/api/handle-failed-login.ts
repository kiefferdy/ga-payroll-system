import { defineEventHandler } from 'h3';
import { getServiceRoleClient } from '../utils/supabase-clients';

export default defineEventHandler(async (event) => {
    try {
        const body = await readBody(event);
        const { email } = body;

        if (!email) {
            return { success: false, error: 'Email is required' };
        }

        // Get user ID from auth.users table using email (service role - pre-auth)
        const supabase = getServiceRoleClient(event);
        const { data: userData, error: userError } = await supabase.auth.admin.listUsers();
        
        if (userError) {
            console.error('Error fetching users:', userError);
            return { success: true }; // Don't reveal if email exists
        }
        
        const user = userData.users.find(u => u.email === email);
        if (!user) {
            // Don't reveal if email exists - silently succeed
            return { success: true };
        }
        
        // Check if user exists in Employees table
        const { data: employeeData, error: employeeError } = await supabase
            .from('Employees')
            .select('id')
            .eq('id', user.id)
            .single();
        
        if (employeeError || !employeeData) {
            // Don't reveal if email exists - silently succeed
            return { success: true };
        }

        const userId = user.id;

        // Get current failed attempts using service role client
        const { data: currentData, error: fetchError } = await supabase
            .from('Employees')
            .select('failed_login_attempts, locked_until')
            .eq('id', userId)
            .single();

        if (fetchError) {
            console.error('Error fetching user data:', fetchError);
            return { success: false, error: 'Failed to update login attempts' };
        }

        // Fetch current lockout settings
        const lockoutSettings = await $fetch('/api/get-lockout-settings');
        const { maxFailedAttempts, lockoutDurationMinutes } = lockoutSettings;

        const currentFailedAttempts = currentData?.failed_login_attempts || 0;
        const newFailedAttempts = currentFailedAttempts + 1;

        let updateData: any = {
            failed_login_attempts: newFailedAttempts
        };

        // Lock account if max attempts reached
        if (newFailedAttempts >= maxFailedAttempts) {
            const lockUntil = new Date();
            lockUntil.setMinutes(lockUntil.getMinutes() + lockoutDurationMinutes);
            updateData.locked_until = lockUntil.toISOString();

            // Log account lockout using RLS logging
            await $fetch('/api/log-security-event', {
                method: 'POST',
                body: {
                    eventType: 'ACCOUNT_LOCKED',
                    userId,
                    userEmail: email,
                    details: {
                        failed_attempts: newFailedAttempts,
                        locked_until: lockUntil.toISOString(),
                        lockout_duration_minutes: lockoutDurationMinutes,
                        max_attempts_threshold: maxFailedAttempts
                    },
                    severity: 'HIGH'
                }
            });
        }

        // Update failed attempts (and potentially lock account) using service role client
        const { error: updateError } = await (supabase as any)
            .from('Employees')
            .update(updateData)
            .eq('id', userId);

        if (updateError) {
            console.error('Error updating failed attempts:', updateError);
            return { success: false, error: 'Failed to update login attempts' };
        }

        // Log failed login attempt using RLS logging
        await $fetch('/api/log-security-event', {
            method: 'POST',
            body: {
                eventType: 'FAILED_LOGIN_ATTEMPT',
                userId,
                userEmail: email,
                details: {
                    failed_attempts: newFailedAttempts,
                    max_attempts: maxFailedAttempts,
                    will_lock: newFailedAttempts >= maxFailedAttempts
                },
                severity: newFailedAttempts >= maxFailedAttempts ? 'HIGH' : 'MEDIUM'
            }
        });

        return { 
            success: true, 
            failed_attempts: newFailedAttempts,
            is_locked: newFailedAttempts >= maxFailedAttempts
        };

    } catch (error) {
        console.error('Error handling failed login:', error);
        return { success: false, error: 'Internal server error' };
    }
});