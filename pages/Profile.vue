<template>
    <Title>Profile - {{ user?.email }}</Title>
    <div class="flex items-center justify-center py-32">
        <div class="card text-black bg-white shadow-lg w-[65rem] max-h-[40rem] overflow-y-auto">
            <div class="card-body p-8">
                <!-- Header -->
                <div class="flex justify-between items-center mb-6">
                    <div>
                        <h1 class="card-title text-2xl">User Profile</h1>
                        <p class="text-gray-600">Manage your account settings and security</p>
                    </div>
                    <button @click="signOut" class="btn btn-sm bg-button_green hover:bg-green-700 text-white rounded-full px-6">
                        Logout
                    </button>
                </div>

                <!-- User Info Section -->
                <div class="mb-8">
                    <h2 class="text-xl font-bold mb-4">Account Information</h2>
                    <div v-if="user" class="space-y-2 bg-gray-50 p-4 rounded">
                        <p><strong>Email:</strong> {{ user.email }}</p>
                        <p><strong>Last Sign In:</strong> {{ formatDate(user.last_sign_in_at) }}</p>
                    </div>
                </div>

                <!-- Password Change Section -->
                <div class="mb-8">
                    <h2 class="text-xl font-bold mb-4">Change Password</h2>
                    <p class="text-gray-600 mb-4">Update your account password. Password must be at least 1 day old before it can be changed.</p>
                    
                    <form @submit.prevent="handlePasswordChange" class="space-y-4">
                        <div class="form-control">
                            <label class="label-text text-black mb-2 block">Current Password</label>
                            <input 
                                v-model="currentPassword" 
                                type="password" 
                                class="input-s border-2 border-primary_green bg-primary_white rounded w-full max-w-sm p-3 text-black" 
                                placeholder="Enter current password"
                                required
                            />
                        </div>
                        
                        <div class="form-control">
                            <label class="label-text text-black mb-2 block">New Password</label>
                            <input 
                                v-model="newPassword" 
                                type="password" 
                                class="input-s border-2 border-primary_green bg-primary_white rounded w-full max-w-sm p-3 text-black" 
                                placeholder="Enter new password"
                                required
                            />
                        </div>

                        <!-- Password Strength Indicator -->
                        <PasswordStrengthIndicator 
                            v-if="newPassword"
                            :password="newPassword" 
                            :user-id="user?.id"
                            :show-requirements="true"
                            @validation-result="onPasswordValidation"
                        />
                        
                        <div class="form-control">
                            <label class="label-text text-black mb-2 block">Confirm New Password</label>
                            <input 
                                v-model="confirmPassword" 
                                type="password" 
                                class="input-s border-2 border-primary_green bg-primary_white rounded w-full max-w-sm p-3 text-black" 
                                :class="{ 'border-red-300': passwordMismatch }"
                                placeholder="Confirm new password"
                                required
                            />
                            <p v-if="passwordMismatch" class="mt-1 text-sm text-red-600">Passwords do not match</p>
                        </div>

                        <div class="card-actions">
                            <button 
                                type="submit"
                                :disabled="passwordChangeLoading || !canChangePassword"
                                class="btn btn-sm bg-button_green hover:bg-green-700 text-white rounded-full px-6 disabled:opacity-50"
                            >
                                <span v-if="passwordChangeLoading">Changing Password...</span>
                                <span v-else>Change Password</span>
                            </button>
                        </div>

                        <!-- Success/Error Messages -->
                        <div v-if="passwordChangeError" class="p-4 bg-red-50 border border-red-200 rounded-lg">
                            <p class="text-sm text-red-800">{{ passwordChangeError }}</p>
                        </div>
                        <div v-if="passwordChangeSuccess" class="p-4 bg-green-50 border border-green-200 rounded-lg">
                            <p class="text-sm text-green-800">Password changed successfully!</p>
                        </div>
                    </form>
                </div>

                <!-- Security Questions Section -->
                <div>
                    <h2 class="text-xl font-bold mb-4">Security Questions</h2>
                    <p class="text-gray-600 mb-4">Set up security questions for password recovery.</p>
                    <SecurityQuestionsSetup />
                </div>
            </div>
        </div>
    </div>
</template>
 
 <style scoped>
 .error {
   color: red;
 }
 </style>
 
 <script setup lang="ts">
import { ref, computed } from 'vue';
// Import the SecurityQuestionsSetup component
import SecurityQuestionsSetup from '~/components/SecurityQuestionsSetup.vue';
import PasswordStrengthIndicator from '~/components/PasswordStrengthIndicator.vue';

// Apply employee middleware to this page - employee profile should be accessible by employees
definePageMeta({
    middleware: 'employee'
});

const user = useSupabaseUser();
const supabase = useSupabaseClient();

// Password change functionality
const currentPassword = ref('');
const newPassword = ref('');
const confirmPassword = ref('');
const passwordChangeLoading = ref(false);
const passwordChangeError = ref('');
const passwordChangeSuccess = ref(false);
const passwordValidation = ref({ isValid: false });

// Computed properties
const passwordMismatch = computed(() => {
    return confirmPassword.value !== '' && newPassword.value !== confirmPassword.value;
});

const canChangePassword = computed(() => {
    return passwordValidation.value.isValid && 
           !passwordMismatch.value && 
           newPassword.value !== '' && 
           confirmPassword.value !== '' &&
           currentPassword.value !== '';
});

// Methods
const onPasswordValidation = (result: any) => {
    passwordValidation.value = result;
};

const handlePasswordChange = async () => {
    passwordChangeError.value = '';
    passwordChangeSuccess.value = false;
    passwordChangeLoading.value = true;

    try {
        // Verify current password first
        const { error: signInError } = await supabase.auth.signInWithPassword({
            email: user.value.email,
            password: currentPassword.value
        });

        if (signInError) {
            passwordChangeError.value = 'Current password is incorrect';
            return;
        }

        // Update password
        const { error: updateError } = await supabase.auth.updateUser({
            password: newPassword.value
        });

        if (updateError) {
            passwordChangeError.value = updateError.message;
            return;
        }

        // Update password_changed_at timestamp in database
        const { error: dbError } = await supabase
            .from('Employees')
            .update({ password_changed_at: new Date().toISOString() })
            .eq('id', user.value.id);

        if (dbError) {
            console.error('Error updating password timestamp:', dbError);
        }

        // Store password history for reuse prevention
        await $fetch('/api/auth/store-password-history', {
            method: 'POST',
            body: { 
                userId: user.value.id,
                password: newPassword.value
            }
        });

        // Success
        passwordChangeSuccess.value = true;
        currentPassword.value = '';
        newPassword.value = '';
        confirmPassword.value = '';
        
        // Hide success message after 5 seconds
        setTimeout(() => {
            passwordChangeSuccess.value = false;
        }, 5000);

    } catch (error) {
        console.error('Password change error:', error);
        passwordChangeError.value = 'An error occurred while changing your password. Please try again.';
    } finally {
        passwordChangeLoading.value = false;
    }
};

// Helper function to format dates
const formatDate = (dateString: string) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleString();
};

const signOut = async () => {
    const { error } = await supabase.auth.signOut();

    try {
        await $fetch("/api/_supabase/session", {
            method: "POST",
            body: { event: "SIGNED_OUT", session: null },
        });
        user.value = null;
        navigateTo('/login');
    } catch (error) {
        console.log(error);
    }
};
</script>
 