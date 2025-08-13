import { defineEventHandler } from 'h3';
import { requirePermission, getServiceRoleClient } from '../utils/supabase-clients';
import { PERMISSIONS } from '~/utils/permissions';

async function getUser(id: string, event: any) {
    try {
        const supabase = getServiceRoleClient(event);
        
        // Get auth user data (includes email)
        const { data: authUser, error: authError } = await supabase.auth.admin.getUserById(id);
        if (authError || !authUser.user) {
            return { 
                data: null, 
                error: { message: 'User not found' }
            };
        }
        
        // Get employee data (includes name, etc.)
        const { data: employeeData, error: empError } = await (supabase as any)
            .from('Employees')
            .select('first_name, last_name')
            .eq('id', id)
            .single();
        
        // Combine auth and employee data
        return { 
            data: { 
                user: {
                    id: authUser.user.id,
                    email: authUser.user.email,
                    user_metadata: {
                        first_name: employeeData?.first_name || '',
                        last_name: employeeData?.last_name || ''
                    }
                }
            }, 
            error: null 
        };
    } catch (error) {
        console.error('Error in getUser:', error);
        return { 
            data: null, 
            error: { message: 'User retrieval failed' }
        };
    }
}

export default defineEventHandler(async (event) => {
    try {
        const body = await readBody(event);
        const { targetId } = body;

        // Require users.read permission to access user data
        await requirePermission(event, PERMISSIONS.USERS_READ);

        if (!targetId) {
            return { status: 400, body: 'Missing UUID of user to be retrieved' };
        }

        const response = await getUser(targetId, event);

        // Log user data access
        await $fetch('/api/log-security-event', {
            method: 'POST',
            body: {
                eventType: 'USER_DATA_ACCESSED',
                details: { 
                    targetUserId: targetId,
                    adminAction: 'get_user',
                    success: !response.error
                },
                severity: 'LOW'
            }
        });

        if (response.error) {
            return { status: 500, body: response };
        }
        return { status: 200, body: response };
    } catch (error) {
        await $fetch('/api/log-security-event', {
            method: 'POST',
            body: {
                eventType: 'API_ERROR',
                resourceAccessed: '/api/get-user',
                details: { error: error instanceof Error ? error.message : 'Unknown error' },
                severity: 'CRITICAL'
            }
        });
        return { status: 500, body: 'Internal Server Error' };
    }
});