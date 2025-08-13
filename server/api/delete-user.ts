import { defineEventHandler } from 'h3';
import { requirePermission, getServiceRoleClient } from '../utils/supabase-clients';
import { PERMISSIONS } from '../../utils/permissions';

async function deleteUser(userId: string, event: any) {
    try {
        const supabase = getServiceRoleClient(event);
        
        // Delete related records in correct order to avoid foreign key constraints
        
        // 1. Delete SecurityLogs records
        const { error: securityLogsError } = await (supabase as any)
            .from('SecurityLogs')
            .delete()
            .eq('user_id', userId);
        
        if (securityLogsError) {
            console.warn('Error deleting SecurityLogs records:', securityLogsError);
            // Continue with deletion process
        }
        
        // 2. Delete PasswordHistory records
        const { error: passwordHistoryError } = await (supabase as any)
            .from('PasswordHistory')
            .delete()
            .eq('user_id', userId);
        
        if (passwordHistoryError) {
            console.warn('Error deleting PasswordHistory records:', passwordHistoryError);
            // Continue with deletion process
        }
        
        // 3. Delete UserRoles records where the user is assigned a role
        const { error: userRolesError } = await (supabase as any)
            .from('UserRoles')
            .delete()
            .eq('user_id', userId);
        
        if (userRolesError) {
            console.warn('Error deleting UserRoles records:', userRolesError);
            // Continue with deletion process
        }
        
        // 4. Update UserRoles records where this user assigned roles to others (set assigned_by to NULL)
        const { error: assignedByError } = await (supabase as any)
            .from('UserRoles')
            .update({ assigned_by: null })
            .eq('assigned_by', userId);
        
        if (assignedByError) {
            console.warn('Error updating UserRoles assigned_by references:', assignedByError);
            // Continue with deletion process
        }
        
        // 5. Delete the Employee record
        const { error: employeeError } = await (supabase as any)
            .from('Employees')
            .delete()
            .eq('id', userId);
        
        if (employeeError) {
            console.warn('Error deleting Employee record:', employeeError);
            // Continue with auth deletion even if Employee deletion fails
        }
        
        // 6. Finally, delete the auth user
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
            // Log failed user deletion - use try/catch to prevent logging errors from affecting the main operation
            try {
                await $fetch('/api/log-security-event', {
                    method: 'POST',
                    body: {
                        eventType: 'USER_DELETE_FAILED',
                        userId: user.id,
                        userEmail: user.email,
                        details: { 
                            targetUserId: targetId,
                            error: response.error.message,
                            permission: permission
                        },
                        severity: 'HIGH'
                    }
                });
            } catch (logError) {
                console.error('Failed to log user deletion failure:', logError);
            }
            return { status: 500, body: response };
        }

        // Log successful user deletion - use try/catch to prevent logging errors from affecting the main operation
        try {
            await $fetch('/api/log-security-event', {
                method: 'POST',
                body: {
                    eventType: 'USER_DELETED',
                    userId: user.id,
                    userEmail: user.email,
                    details: { 
                        targetUserId: targetId,
                        permission: permission
                    },
                    severity: 'HIGH'
                }
            });
        } catch (logError) {
            console.error('Failed to log successful user deletion:', logError);
        }

        return { status: 200, body: response };
    } catch (error) {
        // Log API error - use try/catch to prevent logging errors from affecting the response
        try {
            await $fetch('/api/log-security-event', {
                method: 'POST',
                body: {
                    eventType: 'API_ERROR',
                    resourceAccessed: '/api/delete-user',
                    details: { error: error instanceof Error ? error.message : 'Unknown error' },
                    severity: 'CRITICAL'
                }
            });
        } catch (logError) {
            console.error('Failed to log API error:', logError);
        }
        
        return { status: 500, body: 'Internal Server Error' };
    }
});