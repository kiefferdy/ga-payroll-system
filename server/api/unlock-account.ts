import { defineEventHandler } from 'h3';
import { createClient } from '@supabase/supabase-js';
import { checkUserAuthorization, logSecurityEvent } from '../../utils/security';

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
        const { adminUserId, targetEmail } = body;

        if (!adminUserId || !targetEmail) {
            return { success: false, error: 'Admin user ID and target email are required' };
        }

        // Check if requesting user is admin/developer
        const authCheck = await checkUserAuthorization(adminUserId, ['Admin', 'Developer']);
        if (!authCheck.authorized) {
            await logSecurityEvent({
                eventType: 'UNAUTHORIZED_ACCOUNT_UNLOCK_ATTEMPT',
                userId: adminUserId,
                details: { targetEmail, reason: authCheck.error },
                severity: 'HIGH'
            });
            return { success: false, error: 'You do not have permission to unlock accounts' };
        }

        // Find target user by email
        const { data: authUser, error: authError } = await supabase.auth.admin.getUserByEmail(targetEmail);
        
        if (authError || !authUser.user) {
            await logSecurityEvent({
                eventType: 'ACCOUNT_UNLOCK_FAILED',
                userId: adminUserId,
                details: { targetEmail, reason: 'User not found' },
                severity: 'MEDIUM'
            });
            return { success: false, error: 'User not found' };
        }

        const targetUserId = authUser.user.id;

        // Get current lockout status
        const { data: currentStatus, error: statusError } = await supabase
            .from('Employees')
            .select('failed_login_attempts, locked_until, first_name, last_name')
            .eq('id', targetUserId)
            .single();

        if (statusError || !currentStatus) {
            return { success: false, error: 'Failed to get user status' };
        }

        // Unlock the account by clearing lockout fields
        const { error: unlockError } = await supabase
            .from('Employees')
            .update({
                failed_login_attempts: 0,
                locked_until: null
            })
            .eq('id', targetUserId);

        if (unlockError) {
            await logSecurityEvent({
                eventType: 'ACCOUNT_UNLOCK_FAILED',
                userId: adminUserId,
                details: { 
                    targetEmail, 
                    targetUserId,
                    error: unlockError.message 
                },
                severity: 'HIGH'
            });
            return { success: false, error: 'Failed to unlock account' };
        }

        // Log successful account unlock
        await logSecurityEvent({
            eventType: 'ACCOUNT_UNLOCKED',
            userId: adminUserId,
            details: {
                targetEmail,
                targetUserId,
                targetName: `${currentStatus.first_name} ${currentStatus.last_name}`,
                previousFailedAttempts: currentStatus.failed_login_attempts,
                wasLocked: !!currentStatus.locked_until
            },
            severity: 'MEDIUM'
        });

        return {
            success: true,
            message: `Account for ${targetEmail} has been unlocked successfully`
        };

    } catch (error) {
        console.error('Error unlocking account:', error);
        
        await logSecurityEvent({
            eventType: 'ACCOUNT_UNLOCK_ERROR',
            userId: body?.adminUserId,
            details: { 
                error: error instanceof Error ? error.message : 'Unknown error',
                targetEmail: body?.targetEmail
            },
            severity: 'CRITICAL'
        });

        return { success: false, error: 'Internal server error' };
    }
});