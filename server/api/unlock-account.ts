import { defineEventHandler } from 'h3';
import { requireAdmin, getAuthenticatedClient } from '../utils/supabase-clients';

export default defineEventHandler(async (event) => {
    const body = await readBody(event);
    try {
        const { targetEmail } = body;

        if (!targetEmail) {
            return { success: false, error: 'Target email is required' };
        }

        // Enforce admin authentication using RLS
        const { role } = await requireAdmin(event);

        // Get authenticated client - RLS allows admins to modify users
        const supabase = await getAuthenticatedClient(event);

        // Find target user by email in Employees table using RLS-enabled client
        const { data: employeeData, error: employeeError } = await supabase
            .from('Employees')
            .select('id')
            .eq('email', targetEmail)
            .single();
        
        if (employeeError || !employeeData) {
            await $fetch('/api/log-security-event', {
                method: 'POST',
                body: {
                    eventType: 'ACCOUNT_UNLOCK_FAILED',
                    details: { targetEmail, reason: 'User not found' },
                    severity: 'MEDIUM'
                }
            });
            return { success: false, error: 'User not found' };
        }

        const targetUserId = employeeData.id;

        // Get current lockout status using RLS-enabled client
        const { data: currentStatus, error: statusError } = await supabase
            .from('Employees')
            .select('failed_login_attempts, locked_until, first_name, last_name')
            .eq('id', targetUserId)
            .single();

        if (statusError || !currentStatus) {
            return { success: false, error: 'Failed to get user status' };
        }

        // Unlock the account by clearing lockout fields using authenticated client
        const { error: unlockError } = await (supabase as any)
            .from('Employees')
            .update({
                failed_login_attempts: 0,
                locked_until: null
            })
            .eq('id', targetUserId);

        if (unlockError) {
            await $fetch('/api/log-security-event', {
                method: 'POST',
                body: {
                    eventType: 'ACCOUNT_UNLOCK_FAILED',
                    details: { 
                        targetEmail, 
                        targetUserId,
                        error: unlockError.message 
                    },
                    severity: 'HIGH'
                }
            });
            return { success: false, error: 'Failed to unlock account' };
        }

        // Log successful account unlock
        await $fetch('/api/log-security-event', {
            method: 'POST',
            body: {
                eventType: 'ACCOUNT_UNLOCKED',
                details: {
                    targetEmail,
                    targetUserId,
                    targetName: `${currentStatus.first_name} ${currentStatus.last_name}`,
                    previousFailedAttempts: currentStatus.failed_login_attempts,
                    wasLocked: !!currentStatus.locked_until,
                    adminRole: role
                },
                severity: 'MEDIUM'
            }
        });

        return {
            success: true,
            message: `Account for ${targetEmail} has been unlocked successfully`
        };

    } catch (error) {
        console.error('Error unlocking account:', error);
        
        await $fetch('/api/log-security-event', {
            method: 'POST',
            body: {
                eventType: 'ACCOUNT_UNLOCK_ERROR',
                details: { 
                    error: error instanceof Error ? error.message : 'Unknown error',
                    targetEmail: body?.targetEmail
                },
                severity: 'CRITICAL'
            }
        });

        return { success: false, error: 'Internal server error' };
    }
});