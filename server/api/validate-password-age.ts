import { defineEventHandler } from 'h3';
import { getAuthenticatedClient } from '../utils/supabase-clients';

// Minimum age before password can be changed (24 hours)
const MIN_PASSWORD_AGE_HOURS = 24;

export default defineEventHandler(async (event) => {
    try {
        const body = await readBody(event);
        const { userId } = body;

        if (!userId) {
            return { canChange: true, error: 'User ID is required' };
        }

        // Get password change timestamp from Employees table using authenticated client
        const supabase = await getAuthenticatedClient(event);
        const { data, error } = await supabase
            .from('Employees')
            .select('password_changed_at')
            .eq('id', userId)
            .single();

        if (error || !data) {
            // If no record or error, allow password change
            return { canChange: true };
        }

        // If no password change timestamp, allow change (first time)
        if (!data.password_changed_at) {
            return { canChange: true };
        }

        const passwordChangedAt = new Date(data.password_changed_at);
        const now = new Date();
        const hoursSinceChange = (now.getTime() - passwordChangedAt.getTime()) / (1000 * 60 * 60);

        const canChange = hoursSinceChange >= MIN_PASSWORD_AGE_HOURS;
        const hoursRemaining = canChange ? 0 : Math.ceil(MIN_PASSWORD_AGE_HOURS - hoursSinceChange);

        return {
            canChange,
            hoursRemaining: canChange ? undefined : hoursRemaining,
            error: canChange ? undefined : `Password must be at least ${MIN_PASSWORD_AGE_HOURS} hours old before it can be changed. ${hoursRemaining} hours remaining.`
        };

    } catch (error) {
        console.error('Error validating password age:', error);
        return { canChange: true, error: 'Failed to validate password age' };
    }
});