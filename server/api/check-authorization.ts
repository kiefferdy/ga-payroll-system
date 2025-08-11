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

export default defineEventHandler(async (event) => {
    try {
        const body = await readBody(event);
        const { userId, requiredRoles = ['Admin', 'Developer'] } = body;

        if (!userId) {
            return { authorized: false, error: 'User ID is required' };
        }

        // Get user role from Employees table
        const { data, error } = await supabase
            .from('Employees')
            .select('rank, first_name, last_name')
            .eq('id', userId)
            .single();

        if (error) {
            // Log authorization error
            await logSecurityEvent({
                eventType: 'AUTHORIZATION_ERROR',
                userId,
                details: { error: error.message },
                severity: 'HIGH'
            });
            return { authorized: false, error: 'Database error during authorization' };
        }

        if (!data) {
            // Log authorization failure
            await logSecurityEvent({
                eventType: 'AUTHORIZATION_FAILED',
                userId,
                details: { reason: 'User not found in employees table' },
                severity: 'HIGH'
            });
            return { authorized: false, error: 'User not found' };
        }

        const isAuthorized = requiredRoles.includes(data.rank);

        if (!isAuthorized) {
            // Log access denied
            await logSecurityEvent({
                eventType: 'ACCESS_DENIED',
                userId,
                details: { 
                    userRole: data.rank, 
                    requiredRoles,
                    userName: `${data.first_name} ${data.last_name}`
                },
                severity: 'MEDIUM'
            });
        }

        return {
            authorized: isAuthorized,
            userRole: data.rank
        };

    } catch (error) {
        console.error('Error in check-authorization API:', error);
        
        // Log unexpected error
        await logSecurityEvent({
            eventType: 'AUTHORIZATION_ERROR',
            userId: body?.userId,
            details: { error: error instanceof Error ? error.message : 'Unknown error' },
            severity: 'CRITICAL'
        });

        return { authorized: false, error: 'Authorization check failed' };
    }
});

// Helper function to log security events directly
async function logSecurityEvent(eventData: any) {
    try {
        await supabase
            .from('SecurityLogs')
            .insert({
                event_type: eventData.eventType,
                user_id: eventData.userId,
                details: eventData.details,
                severity: eventData.severity || 'MEDIUM'
            });
    } catch (error) {
        console.error('Failed to log security event:', error);
    }
}