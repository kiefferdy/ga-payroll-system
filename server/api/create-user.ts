import { defineEventHandler } from 'h3';
import { createClient } from '@supabase/supabase-js';
import { checkUserAuthorization, logSecurityEvent, validatePasswordComplexity } from '../../utils/security';

// Env variables for Supabase
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_BYPASS_KEY;

// Verify that the required environment variables are set
if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing environment variables required for server API');
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function createUser(email: string, password: string) {
    try {
        // Validate password complexity before creating user
        const passwordValidation = validatePasswordComplexity(password);
        if (!passwordValidation.valid) {
            return { 
                data: null, 
                error: { 
                    message: `Password does not meet complexity requirements: ${passwordValidation.errors.join(', ')}` 
                } 
            };
        }

        const { data, error } = await supabase.auth.admin.createUser({
            email: email,
            password: password,
            email_confirm: true
        });

        return { data, error };
    } catch (error) {
        console.error('Error in createUser:', error);
        throw error;
    }
}

export default defineEventHandler(async (event) => {
    try {
        // Parsing the incoming request to get the new user's email and password
        const body = await readBody(event);
        const { email, password, userId } = body;

        // Helper function to get client IP
        function getClientIP(event: any): string {
            try {
                const headers = getHeaders(event);
                const ip = headers['x-forwarded-for']?.toString().split(',')[0]?.trim() ||
                          headers['x-real-ip']?.toString() ||
                          headers['cf-connecting-ip']?.toString() ||
                          '127.0.0.1';
                return isValidIP(ip) ? ip : '127.0.0.1';
            } catch {
                return '127.0.0.1';
            }
        }

        // Helper function to validate IP address format
        function isValidIP(ip: string): boolean {
            if (!ip || ip === 'unknown') return false;
            const ipv4Regex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
            return ipv4Regex.test(ip);
        }

        // Get IP address for logging
        const clientIP = getClientIP(event);

        if (!userId) {
            await logSecurityEvent({
                eventType: 'API_ACCESS_DENIED',
                resourceAccessed: '/api/create-user',
                ipAddress: clientIP,
                details: { reason: 'Missing user ID' },
                severity: 'HIGH'
            });
            return { status: 403, body: 'User ID not found' };
        }

        // Use centralized authorization check
        const authCheck = await checkUserAuthorization(userId, ['Admin', 'Developer']);
        if (!authCheck.authorized) {
            return { status: 403, body: authCheck.error || 'You do not have permission to perform this request' };
        }

        if (!email || !password) {
            await logSecurityEvent({
                eventType: 'INPUT_VALIDATION_FAILED',
                userId,
                ipAddress: clientIP,
                resourceAccessed: '/api/create-user',
                details: { reason: 'Missing email or password' },
                severity: 'MEDIUM'
            });
            return { status: 400, body: 'Missing email or password' };
        }

        // Log user creation attempt
        await logSecurityEvent({
            eventType: 'USER_CREATION_ATTEMPT',
            userId,
            ipAddress: clientIP,
            resourceAccessed: '/api/create-user',
            details: { targetEmail: email },
            severity: 'MEDIUM'
        });

        const response = await createUser(email, password);

        if (response.error) {
            await logSecurityEvent({
                eventType: 'USER_CREATION_FAILED',
                userId,
                ipAddress: clientIP,
                details: { 
                    targetEmail: email,
                    error: response.error.message
                },
                severity: 'HIGH'
            });
            return { status: 500, body: response };
        }

        // Log successful user creation
        await logSecurityEvent({
            eventType: 'USER_CREATED',
            userId,
            ipAddress: clientIP,
            details: { 
                targetEmail: email,
                newUserId: response.data?.user?.id
            },
            severity: 'LOW'
        });

        return { status: 200, body: response };
    } catch (error) {
        await logSecurityEvent({
            eventType: 'API_ERROR',
            resourceAccessed: '/api/create-user',
            details: { error: error instanceof Error ? error.message : 'Unknown error' },
            severity: 'CRITICAL'
        });
        return { status: 500, body: 'Internal Server Error' };
    }
});