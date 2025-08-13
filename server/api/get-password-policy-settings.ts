import { defineEventHandler } from 'h3';
import { getServiceRoleClient } from '../utils/supabase-clients';

export default defineEventHandler(async (event) => {
    try {
        // Password policy settings are not sensitive and are needed during user registration
        // so we don't require authentication here
        
        // Fetch password policy settings from Settings table using service role client
        const supabase = getServiceRoleClient(event);
        const { data: settings, error } = await supabase
            .from('Settings')
            .select(`
                password_min_length,
                password_require_uppercase,
                password_require_lowercase,
                password_require_numbers,
                password_require_special_chars,
                enable_password_complexity
            `)
            .single();

        if (error) {
            console.error('Error fetching password policy settings:', error);
            // Return defaults if error occurs
            return {
                minLength: 8,
                requireUppercase: true,
                requireLowercase: true,
                requireNumbers: true,
                requireSpecialChars: true,
                enableComplexity: true
            };
        }

        // Return settings with defaults for any null values
        return {
            minLength: settings?.password_min_length || 8,
            requireUppercase: settings?.password_require_uppercase ?? true,
            requireLowercase: settings?.password_require_lowercase ?? true,
            requireNumbers: settings?.password_require_numbers ?? true,
            requireSpecialChars: settings?.password_require_special_chars ?? true,
            enableComplexity: settings?.enable_password_complexity ?? true
        };

    } catch (error) {
        console.error('Error in get-password-policy-settings API:', error);
        // Return defaults if any error occurs
        return {
            minLength: 8,
            requireUppercase: true,
            requireLowercase: true,
            requireNumbers: true,
            requireSpecialChars: true,
            enableComplexity: true
        };
    }
});