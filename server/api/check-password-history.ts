import { defineEventHandler } from 'h3';
import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcryptjs';

// Env variables for Supabase
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_BYPASS_KEY;

if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing environment variables required for server API');
}

const supabase = createClient(supabaseUrl, supabaseKey);

export default defineEventHandler(async (event) => {
    try {
        const body = await readBody(event);
        const { userId, newPassword } = body;

        if (!userId || !newPassword) {
            return { isReused: false, error: 'User ID and password are required' };
        }

        // Get the last 5 password hashes for this user
        const { data: passwordHistory, error } = await supabase
            .from('PasswordHistory')
            .select('password_hash')
            .eq('user_id', userId)
            .order('created_at', { ascending: false })
            .limit(5);

        if (error) {
            console.error('Error fetching password history:', error);
            return { isReused: false, error: 'Failed to check password history' };
        }

        // If no history exists, password is not reused
        if (!passwordHistory || passwordHistory.length === 0) {
            return { isReused: false };
        }

        // Check if new password matches any of the recent passwords
        for (const historyEntry of passwordHistory) {
            try {
                const isMatch = await bcrypt.compare(newPassword, historyEntry.password_hash);
                if (isMatch) {
                    return { 
                        isReused: true, 
                        error: 'Password has been used recently. Please choose a different password.' 
                    };
                }
            } catch (compareError) {
                console.error('Error comparing password:', compareError);
                // Continue checking other passwords if one comparison fails
            }
        }

        return { isReused: false };

    } catch (error) {
        console.error('Error checking password history:', error);
        return { isReused: false, error: 'Failed to validate password' };
    }
});