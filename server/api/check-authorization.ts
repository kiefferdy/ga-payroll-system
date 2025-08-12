import { defineEventHandler } from 'h3';
import { requireAuth, getAuthenticatedClient } from '../utils/supabase-clients';

export default defineEventHandler(async (event) => {
    const body = await readBody(event);
    try {
        const { userId, requiredRoles = ['Admin', 'Developer'] } = body;

        if (!userId) {
            return { authorized: false, error: 'User ID is required' };
        }

        // Verify the requesting user is authenticated
        await requireAuth(event);

        // Get authenticated client that respects RLS policies
        const supabase = await getAuthenticatedClient(event);

        // Use authenticated client - RLS policies will enforce access control
        // Only admins can read other users' data, users can read their own
        const { data, error } = await supabase
            .from('Employees')
            .select('rank, first_name, last_name')
            .eq('id', userId)
            .single();

        if (error) {
            // RLS policy denied access or user doesn't exist
            return { authorized: false, error: 'Access denied or user not found' };
        }

        if (!data) {
            return { authorized: false, error: 'User not found' };
        }

        const isAuthorized = requiredRoles.includes(data.rank);

        // Log authorization attempt (will be logged with proper user context)
        await $fetch('/api/log-security-event', {
            method: 'POST',
            body: {
                eventType: isAuthorized ? 'AUTHORIZATION_SUCCESS' : 'ACCESS_DENIED',
                userId,
                details: { 
                    userRole: data.rank, 
                    requiredRoles,
                    userName: `${data.first_name} ${data.last_name}`
                },
                severity: isAuthorized ? 'LOW' : 'MEDIUM'
            }
        });

        return {
            authorized: isAuthorized,
            userRole: data.rank
        };

    } catch (error) {
        console.error('Error in check-authorization API:', error);
        
        // Log the error
        await $fetch('/api/log-security-event', {
            method: 'POST',
            body: {
                eventType: 'AUTHORIZATION_ERROR',
                userId: body?.userId,
                details: { error: error instanceof Error ? error.message : 'Unknown error' },
                severity: 'CRITICAL'
            }
        });

        return { authorized: false, error: 'Authorization check failed' };
    }
});