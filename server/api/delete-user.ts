import { defineEventHandler } from 'h3';
import { createClient } from '@supabase/supabase-js';

// Env variables for Supabase
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_BYPASS_KEY;

// Verify that the required environment variables are set
if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing environment variables required for server API');
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function deleteUser(userId: string) {
    try {
        const { data, error } = await supabase.auth.admin.deleteUser(userId);
        return { data, error };
    } catch (error) {
        console.error('Error in createUser:', error);
        throw error;
    }
}

async function authenticateUser(userId: string) {
    try {
        const { data, error } = await supabase
            .from('Employees')
            .select('rank')
            .eq('id', userId)
            .single();

        if (error) throw error;

        if (data.rank === 'Admin' || data.rank === 'Manager') {
            return true;
        }
        return false;
    } catch (error) {
        console.error('Error checking user rank:', error);
        return false;
    }
}

export default defineEventHandler(async (event) => {
    try {
        // Parsing the incoming request to get the target user's UUID
        const body = await readBody(event);
        const { targetId, userId } = body; // targetId is the UUID of the to-be-deleted user

        if (!userId) {
            return { status: 403, body: 'User ID not found' };
        } else {
            const isAuthenticated = await authenticateUser(userId);
            if (!isAuthenticated) {
                return { status: 403, body: 'You do not have permission to perform this request' };
            }
        }

        if (!targetId) {
            return { status: 400, body: 'Missing target user ID' };
        }

        const response = await deleteUser(targetId);

        if (response.error) {
            return { status: 500, body: response };
        }
        return { status: 200, body: response };
    } catch (error) {
        return { status: 500, body: 'Internal Server Error' };
    }
});