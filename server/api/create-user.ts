import { defineEventHandler } from 'h3';
import { requireAdmin, getServiceRoleClient } from '../utils/supabase-clients';
import { validatePasswordComplexity } from '../../utils/security';

async function createUser(email: string, password: string, event: any) {
    try {
        // Validate password complexity before creating user
        const passwordValidation = await validatePasswordComplexity(password);
        if (!passwordValidation.valid) {
            return { 
                data: null, 
                error: { 
                    message: `Password does not meet complexity requirements: ${passwordValidation.errors.join(', ')}` 
                } 
            };
        }

        // Use service role client for auth user creation
        const supabase = getServiceRoleClient(event);
        const { data, error } = await supabase.auth.admin.createUser({
            email: email,
            password: password,
            email_confirm: true
        });

        return { data, error };
    } catch (error) {
        console.error('Error in createUser:', error);
        return { 
            data: null, 
            error: { message: 'User creation failed - admin privileges may not be configured properly' }
        };
    }
}

export default defineEventHandler(async (event) => {
    try {
        const body = await readBody(event);
        const { email, password } = body;

        // Enforce admin authentication using RLS
        const { role } = await requireAdmin(event);

        if (!email || !password) {
            // Log validation failure using RLS logging
            await $fetch('/api/log-security-event', {
                method: 'POST',
                body: {
                    eventType: 'INPUT_VALIDATION_FAILED',
                    details: { reason: 'Missing email or password' },
                    severity: 'MEDIUM'
                }
            });
            return { status: 400, body: 'Missing email or password' };
        }

        // Log user creation attempt
        await $fetch('/api/log-security-event', {
            method: 'POST',
            body: {
                eventType: 'USER_CREATION_ATTEMPT',
                details: { targetEmail: email, adminRole: role },
                severity: 'MEDIUM'
            }
        });

        const response = await createUser(email, password, event);

        if (response.error) {
            await $fetch('/api/log-security-event', {
                method: 'POST',
                body: {
                    eventType: 'USER_CREATION_FAILED',
                    details: { 
                        targetEmail: email,
                        error: response.error.message
                    },
                    severity: 'HIGH'
                }
            });
            return { status: 500, body: response };
        }

        // Log successful user creation
        await $fetch('/api/log-security-event', {
            method: 'POST',
            body: {
                eventType: 'USER_CREATED',
                details: { 
                    targetEmail: email,
                    newUserId: response.data?.user?.id,
                    adminRole: role
                },
                severity: 'LOW'
            }
        });

        return { status: 200, body: response };

    } catch (error) {
        await $fetch('/api/log-security-event', {
            method: 'POST',
            body: {
                eventType: 'API_ERROR',
                resourceAccessed: '/api/create-user',
                details: { error: error instanceof Error ? error.message : 'Unknown error' },
                severity: 'CRITICAL'
            }
        });
        
        return { status: 500, body: 'Internal Server Error' };
    }
});