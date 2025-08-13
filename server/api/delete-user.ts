import { defineEventHandler } from 'h3';
import { requirePermission, getServiceRoleClient } from '../utils/supabase-clients';
import { PERMISSIONS } from '../../utils/permissions';

async function deleteUser(userId: string, event: any) {
    try {
        const supabase = getServiceRoleClient(event);
        const { data, error } = await supabase.auth.admin.deleteUser(userId);
        return { data, error };
    } catch (error) {
        console.error('Error in deleteUser:', error);
        return { 
            data: null, 
            error: { message: 'User deletion failed - admin privileges may not be configured properly' }
        };
    }
}

export default defineEventHandler(async (event) => {
    try {
        const body = await readBody(event);
        const { targetId } = body; // targetId is the UUID of the to-be-deleted user

        // Enforce user deletion permission
        const { user, permission } = await requirePermission(event, PERMISSIONS.USERS_DELETE);

        if (!targetId) {
            return { status: 400, body: 'Missing target user ID' };
        }

        const response = await deleteUser(targetId, event);

        if (response.error) {
            // Log failed user deletion
            await $fetch('/api/log-security-event', {
                method: 'POST',
                body: {
                    eventType: 'USER_DELETE_FAILED',
                    details: { 
                        targetUserId: targetId,
                        error: response.error.message,
                        permission: permission
                    },
                    severity: 'HIGH'
                }
            });
            return { status: 500, body: response };
        }

        // Log successful user deletion
        await $fetch('/api/log-security-event', {
            method: 'POST',
            body: {
                eventType: 'USER_DELETED',
                details: { 
                    targetUserId: targetId,
                    permission: permission
                },
                severity: 'HIGH'
            }
        });

        return { status: 200, body: response };
    } catch (error) {
        await $fetch('/api/log-security-event', {
            method: 'POST',
            body: {
                eventType: 'API_ERROR',
                resourceAccessed: '/api/delete-user',
                details: { error: error instanceof Error ? error.message : 'Unknown error' },
                severity: 'CRITICAL'
            }
        });
        return { status: 500, body: 'Internal Server Error' };
    }
});