import { defineEventHandler } from 'h3';
import { requireAdmin, getAuthenticatedClient } from '../utils/supabase-clients';

async function getUser(id: string, event: any) {
    try {
        // Use authenticated client with RLS - admin can read other users' data
        const supabase = await getAuthenticatedClient(event);
        const { data, error } = await (supabase as any)
            .from('Employees')
            .select('id, email, first_name, last_name, rank')
            .eq('id', id)
            .single();
        
        if (error || !data) {
            return { 
                data: null, 
                error: { message: 'User not found or access denied' }
            };
        }
        
        // Format to match expected response structure
        return { 
            data: { 
                user: {
                    id: data.id,
                    email: data.email,
                    user_metadata: {
                        first_name: data.first_name,
                        last_name: data.last_name,
                        rank: data.rank
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

        // Enforce admin authentication using RLS
        const { role } = await requireAdmin(event);

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
                    adminRole: role,
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