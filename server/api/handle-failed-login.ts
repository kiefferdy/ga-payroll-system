import { defineEventHandler } from 'h3';
import { getServiceRoleClient } from '../utils/supabase-clients';

// Configuration
const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_DURATION_MINUTES = 30;

export default defineEventHandler(async (event) => {
    try {
        const body = await readBody(event);
        const { email } = body;

        if (!email) {
            return { success: false, error: 'Email is required' };
        }

        // Get user ID from Employees table using email (service role - pre-auth)
        const supabase = getServiceRoleClient(event);
        const { data: employeeData, error: employeeError } = await supabase
            .from('Employees')
            .select('id, email')
            .eq('email', email)
            .single();
        
        if (employeeError || !employeeData) {
            // Don't reveal if email exists - silently succeed
            return { success: true };
        }

        const userId = employeeData.id;

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

        const currentFailedAttempts = currentData?.failed_login_attempts || 0;
        const newFailedAttempts = currentFailedAttempts + 1;

        let updateData: any = {
            failed_login_attempts: newFailedAttempts
        };

        // Lock account if max attempts reached
        if (newFailedAttempts >= MAX_FAILED_ATTEMPTS) {
            const lockUntil = new Date();
            lockUntil.setMinutes(lockUntil.getMinutes() + LOCKOUT_DURATION_MINUTES);
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
                        lockout_duration_minutes: LOCKOUT_DURATION_MINUTES
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
                    max_attempts: MAX_FAILED_ATTEMPTS,
                    will_lock: newFailedAttempts >= MAX_FAILED_ATTEMPTS
                },
                severity: newFailedAttempts >= MAX_FAILED_ATTEMPTS ? 'HIGH' : 'MEDIUM'
            }
        });

        return { 
            success: true, 
            failed_attempts: newFailedAttempts,
            is_locked: newFailedAttempts >= MAX_FAILED_ATTEMPTS
        };

    } catch (error) {
        console.error('Error handling failed login:', error);
        return { success: false, error: 'Internal server error' };
    }
});