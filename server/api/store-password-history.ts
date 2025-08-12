import { defineEventHandler } from 'h3';
import { getAuthenticatedClient } from '../utils/supabase-clients';
import bcrypt from 'bcryptjs';

// Keep only the last 5 passwords in history
const MAX_PASSWORD_HISTORY = 5;

export default defineEventHandler(async (event) => {
    try {
        const body = await readBody(event);
        const { userId, newPassword } = body;

        if (!userId || !newPassword) {
            return { success: false, error: 'User ID and password are required' };
        }

        // Hash the new password for storage
        const saltRounds = 12;
        const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

        // Start a transaction-like operation
        const supabase = await getAuthenticatedClient(event);
        // 1. Store the new password hash in history using authenticated client
        const { error: insertError } = await (supabase as any)
            .from('PasswordHistory')
            .insert({
                user_id: userId,
                password_hash: hashedPassword
            });

        if (insertError) {
            console.error('Error storing password history:', insertError);
            return { success: false, error: 'Failed to store password history' };
        }

        // 2. Update password_changed_at timestamp in Employees table using authenticated client
        const { error: updateError } = await (supabase as any)
            .from('Employees')
            .update({
                password_changed_at: new Date().toISOString()
            })
            .eq('id', userId);

        if (updateError) {
            console.error('Error updating password timestamp:', updateError);
            // Don't return error here as the history was stored successfully
        }

        // 3. Clean up old password history (keep only last 5) using authenticated client
        const { data: oldPasswords, error: selectError } = await supabase
            .from('PasswordHistory')
            .select('id')
            .eq('user_id', userId)
            .order('created_at', { ascending: false })
            .limit(50); // Get more than needed to be safe

        if (!selectError && oldPasswords && oldPasswords.length > MAX_PASSWORD_HISTORY) {
            // Get IDs of passwords to delete (keep only the latest 5)
            const idsToDelete = oldPasswords
                .slice(MAX_PASSWORD_HISTORY)
                .map(p => p.id);

            if (idsToDelete.length > 0) {
                await supabase
                    .from('PasswordHistory')
                    .delete()
                    .in('id', idsToDelete);
            }
        }

        // Log password history update using RLS logging
        await $fetch('/api/log-security-event', {
            method: 'POST',
            body: {
                eventType: 'PASSWORD_HISTORY_UPDATED',
                userId,
                details: {
                    action: 'password_stored_in_history',
                    history_count: Math.min(MAX_PASSWORD_HISTORY, (oldPasswords?.length || 0) + 1)
                },
                severity: 'LOW'
            }
        });

        return { success: true };

    } catch (error) {
        console.error('Error in store-password-history:', error);
        return { success: false, error: 'Internal server error' };
    }
});