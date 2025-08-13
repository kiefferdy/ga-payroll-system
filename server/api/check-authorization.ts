import { defineEventHandler } from 'h3';
import { requireAuth, getAuthenticatedClient } from '../utils/supabase-clients';
import { hasAnyPermission, getUserRoles } from '~/utils/permissions';

export default defineEventHandler(async (event) => {
    const body = await readBody(event);
    try {
        const { userId, requiredPermissions = ['settings.update', 'users.create'] } = body;

        if (!userId) {
            return { authorized: false, error: 'User ID is required' };
        }

        // Verify the requesting user is authenticated
        await requireAuth(event);

        // Get authenticated client that respects RLS policies
        const supabase = await getAuthenticatedClient(event);

        // Get user info - RLS policies will enforce access control
        const { data, error } = await (supabase as any)
            .from('Employees')
            .select('first_name, last_name')
            .eq('id', userId)
            .single();

        if (error) {
            // RLS policy denied access or user doesn't exist
            return { authorized: false, error: 'Access denied or user not found' };
        }

        if (!data) {
            return { authorized: false, error: 'User not found' };
        }

        // Check if user has any of the required permissions using new permission system
        const isAuthorized = await hasAnyPermission(supabase, userId, requiredPermissions);
        
        // Get user roles for display
        const userRoles = await getUserRoles(supabase, userId);
        const primaryRole = userRoles.length > 0 ? userRoles[0].name : 'Employee';

        // Log authorization attempt (will be logged with proper user context)
        await $fetch('/api/log-security-event', {
            method: 'POST',
            body: {
                eventType: isAuthorized ? 'AUTHORIZATION_SUCCESS' : 'ACCESS_DENIED',
                userId,
                details: { 
                    userRole: primaryRole, 
                    requiredPermissions,
                    userName: `${data.first_name} ${data.last_name}`,
                    userRoles: userRoles.map(role => role.name)
                },
                severity: isAuthorized ? 'LOW' : 'MEDIUM'
            }
        });

        return {
            authorized: isAuthorized,
            userRole: primaryRole,
            userName: `${data.first_name} ${data.last_name}`,
            userRoles: userRoles.map(role => role.name)
        };

    } catch (error: any) {
        console.error('Error in check-authorization API:', error);
        
        // Handle authentication errors specifically  
        if (error?.statusMessage?.includes('claim') || error?.statusMessage?.includes('auth')) {
            return { 
                authorized: false, 
                error: 'Authentication required. Please log in again.' 
            };
        }
        
        // Log the error (only if logging service is available)
        try {
            await $fetch('/api/log-security-event', {
                method: 'POST',
                body: {
                    eventType: 'AUTHORIZATION_ERROR',
                    userId: body?.userId,
                    details: { error: error instanceof Error ? error.message : 'Unknown error' },
                    severity: 'CRITICAL'
                }
            });
        } catch (logError) {
            console.error('Failed to log security event:', logError);
        }

        return { authorized: false, error: 'Authorization check failed' };
    }
});