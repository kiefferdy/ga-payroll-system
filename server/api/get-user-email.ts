import { defineEventHandler } from 'h3';
import { requireAdmin, getServiceRoleClient } from '../utils/supabase-clients';

export default defineEventHandler(async (event) => {
    try {
        const body = await readBody(event);
        const { userId } = body;

        if (!userId) {
            return { success: false, error: 'User ID is required' };
        }

        // Enforce admin authentication
        await requireAdmin(event);

        // Get service role client to query auth.users
        const supabase = getServiceRoleClient(event);
        
        // Get user email from auth.users table
        const { data: userData, error: userError } = await supabase.auth.admin.listUsers();
        
        if (userError) {
            console.error('Error fetching users:', userError);
            return { success: false, error: 'Failed to fetch user data' };
        }
        
        const user = userData.users.find(u => u.id === userId);
        if (!user || !user.email) {
            return { success: false, error: 'User email not found' };
        }

        return {
            success: true,
            email: user.email
        };

    } catch (error) {
        console.error('Error getting user email:', error);
        return { success: false, error: 'Internal server error' };
    }
});