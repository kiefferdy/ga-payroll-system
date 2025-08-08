/**
 * Delete User API
 * Implements secure user deletion with proper foreign key constraint handling
 * Requires admin permissions and handles cascading deletions
 */

import { createClient } from '@supabase/supabase-js';

export default defineEventHandler(async (event) => {
    // Only allow POST requests
    if (getMethod(event) !== 'POST') {
        throw createError({
            statusCode: 405,
            statusMessage: 'Method not allowed'
        });
    }

    try {
        const config = useRuntimeConfig();
        const supabaseUrl = config.public.supabase.url;
        const supabaseKey = config.supabaseBypassKey;

        if (!supabaseUrl || !supabaseKey) {
            throw createError({
                statusCode: 500,
                statusMessage: 'Server configuration error'
            });
        }

        const supabase = createClient(supabaseUrl, supabaseKey);

        // Parse request body
        const body = await readBody(event);
        const { targetId, userId } = body;

        // Validate input
        if (!targetId || !userId) {
            throw createError({
                statusCode: 400,
                statusMessage: 'Missing required fields'
            });
        }

        // Authenticate the requesting user
        const { data: adminUser, error: authError } = await supabase
            .from('Employees')
            .select('rank, account_type')
            .eq('id', userId)
            .single();

        if (authError || !adminUser) {
            throw createError({
                statusCode: 403,
                statusMessage: 'Authentication failed'
            });
        }

        // Check if user has admin permissions
        const adminRoles = ['Admin', 'Developer', 'Website Administrator'];
        const hasAdminAccess = adminRoles.includes(adminUser.rank) || 
                              adminRoles.includes(adminUser.account_type);

        if (!hasAdminAccess) {
            throw createError({
                statusCode: 403,
                statusMessage: 'Insufficient privileges'
            });
        }

        // Prevent self-deletion
        if (targetId === userId) {
            throw createError({
                statusCode: 409,
                statusMessage: 'Cannot delete your own account'
            });
        }

        // Get target user info
        const { data: targetUser, error: targetError } = await supabase
            .from('Employees')
            .select('first_name, last_name, rank')
            .eq('id', targetId)
            .single();

        if (targetError || !targetUser) {
            throw createError({
                statusCode: 404,
                statusMessage: 'User not found'
            });
        }

        // Begin transaction-like deletions (delete in reverse dependency order)
        
        // 1. Delete from related tables first (foreign key dependents)
        await Promise.all([
            supabase.from('TimeSheet').delete().eq('user_id', targetId),
            supabase.from('Pay').delete().eq('id', targetId),
            supabase.from('password_history').delete().eq('user_id', targetId),
            supabase.from('security_questions').delete().eq('user_id', targetId),
            supabase.from('security_events').delete().eq('user_id', targetId),
            supabase.from('auth_attempts').delete().eq('user_id', targetId),
            supabase.from('account_lockouts').delete().eq('user_id', targetId),
        ]);

        // 2. Update audit logs to set target_user_id to null (preserve logs but remove FK constraint)
        await supabase
            .from('Audit Log')
            .update({ target_user_id: null })
            .eq('target_user_id', targetId);

        // Update audit logs where this user was the actor
        await supabase
            .from('Audit Log')
            .update({ user_id: null })
            .eq('user_id', targetId);

        // 3. Delete from Employees table
        const { error: employeeDeleteError } = await supabase
            .from('Employees')
            .delete()
            .eq('id', targetId);

        if (employeeDeleteError) {
            console.error('Error deleting from Employees table:', employeeDeleteError);
            throw createError({
                statusCode: 409,
                statusMessage: 'Database constraint error - unable to delete user'
            });
        }

        // 4. Delete from Supabase Auth (this should be last)
        const { error: authDeleteError } = await supabase.auth.admin.deleteUser(targetId);

        if (authDeleteError) {
            console.error('Error deleting from auth:', authDeleteError);
            // Don't throw error here - the main deletion succeeded
        }

        // Log the deletion for security monitoring
        await supabase.rpc('log_security_event', {
            p_user_id: userId,
            p_event_type: 'user_deleted',
            p_description: `Admin ${adminUser.rank} deleted user: ${targetUser.first_name} ${targetUser.last_name} (${targetUser.rank})`,
            p_ip_address: getHeader(event, 'x-forwarded-for') || getHeader(event, 'x-real-ip') || 'unknown',
            p_user_agent: getHeader(event, 'user-agent') || '',
            p_severity: 'high',
            p_metadata: null
        });

        return {
            success: true,
            message: `User ${targetUser.first_name} ${targetUser.last_name} has been successfully deleted`
        };

    } catch (error) {
        console.error('Delete user error:', error);
        
        // If it's already a createError, re-throw it
        if (error.statusCode) {
            throw error;
        }
        
        throw createError({
            statusCode: 500,
            statusMessage: 'Internal server error'
        });
    }
});