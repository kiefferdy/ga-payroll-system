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
        const { 
            eventType, 
            userId, 
            userEmail, 
            ipAddress, 
            userAgent, 
            resourceAccessed, 
            details, 
            severity 
        } = body;

        // Get client IP if not provided
        const rawIP = ipAddress || getClientIP(event);
        // Only set IP if it's a valid format, otherwise leave as null
        const clientIP = isValidIP(rawIP) ? rawIP : null;

        // Insert security event log
        const { error } = await supabase
            .from('SecurityLogs')
            .insert({
                event_type: eventType,
                user_id: userId,
                user_email: userEmail,
                ip_address: clientIP,
                user_agent: userAgent || getHeaders(event)['user-agent'],
                resource_accessed: resourceAccessed,
                details: details,
                severity: severity || 'MEDIUM'
            });

        if (error) {
            console.error('Failed to log security event:', error);
            return { success: false, error: error.message };
        }

        return { success: true };
    } catch (error) {
        console.error('Error in log-security-event API:', error);
        return { success: false, error: 'Internal server error' };
    }
});

// Helper function to get client IP
function getClientIP(event: any): string {
    try {
        const headers = getHeaders(event);
        return headers['x-forwarded-for']?.toString().split(',')[0]?.trim() ||
               headers['x-real-ip']?.toString() ||
               headers['cf-connecting-ip']?.toString() ||
               '127.0.0.1'; // Use localhost instead of 'unknown'
    } catch {
        return '127.0.0.1';
    }
}

// Helper function to validate IP address format
function isValidIP(ip: string): boolean {
    if (!ip || ip === 'unknown') return false;
    
    // IPv4 validation
    const ipv4Regex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
    if (ipv4Regex.test(ip)) return true;
    
    // IPv6 validation (simplified)
    const ipv6Regex = /^(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$|^::1$|^::$/;
    if (ipv6Regex.test(ip)) return true;
    
    return false;
}