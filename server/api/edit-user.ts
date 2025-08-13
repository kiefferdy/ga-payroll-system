import { defineEventHandler } from 'h3';
import { requireAdmin, getServiceRoleClient } from '../utils/supabase-clients';

async function editUser(email: string, password: string, userId: string, event: any) {
    try {
        const supabase = getServiceRoleClient(event);
        let data, error;
        if (password !== '') {
            ({ data, error } = await supabase.auth.admin.updateUserById(
                userId,
                { email: email, password: password }
            ));
        } else {
            ({ data, error } = await supabase.auth.admin.updateUserById(
                userId,
                { email: email }
            ));
        }
        return { data, error };
    } catch (error) {
        console.error('Error in editUser:', error);
        return { 
            data: null, 
            error: { message: 'User update failed - admin privileges may not be configured properly' }
        };
    }
}

export default defineEventHandler(async (event) => {
    try {
        const body = await readBody(event);
        const { email, password, targetId } = body; // targetId is the UUID of the to-be-edited user

        // Enforce admin authentication using RLS
        await requireAdmin(event);

        if (!email || !targetId) {
            return { status: 400, body: 'Missing email or target user ID' };
        }

        const response = await editUser(email, password, targetId, event);

        if (response.error) {
            // Log failed user edit
            await $fetch('/api/log-security-event', {
                method: 'POST',
                body: {
                    eventType: 'USER_EDIT_FAILED',
                    details: { 
                        targetUserId: targetId,
                        error: response.error.message,
                        adminAction: 'edit_user'
                    },
                    severity: 'HIGH'
                }
            });
            return { status: 500, body: response };
        }

        // Log successful user edit
        await $fetch('/api/log-security-event', {
            method: 'POST',
            body: {
                eventType: 'USER_EDITED',
                details: { 
                    targetUserId: targetId,
                    targetEmail: email,
                    adminAction: 'edit_user',
                    passwordChanged: password !== ''
                },
                severity: 'MEDIUM'
            }
        });

        return { status: 200, body: response };
    } catch (error) {
        await $fetch('/api/log-security-event', {
            method: 'POST',
            body: {
                eventType: 'API_ERROR',
                resourceAccessed: '/api/edit-user',
                details: { error: error instanceof Error ? error.message : 'Unknown error' },
                severity: 'CRITICAL'
            }
        });
        return { status: 500, body: 'Internal Server Error' };
    }
});