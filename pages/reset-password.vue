<template>
  <Title>Green Atwork - Reset Password</Title>
  <div class="card card-side h-[30rem] w-[60rem]">
     <div class="card-body">
        <h1 class="card-title text-black">Reset Password</h1>
        <p class="text-gray-600 mb-4">Enter your email address to receive a password reset link.</p>

        <label class="label-text text-black mt-4">Email Address</label>
        <input 
          v-model="email" 
          type="email" 
          class="input-s border-2 border-primary_green bg-primary_white rounded w-72 text-black" 
          placeholder="Enter your email"
          required
          :disabled="isLoading"
        >
        
        <div class="card-actions">
           <button 
             @click="sendResetLink" 
             :disabled="isLoading || !email.trim()"
             class="btn btn-xs mt-3 rounded-full text-white bg-button_green btn-ghost w-40"
           >
             <span v-if="isLoading" class="loading loading-spinner loading-xs"></span>
             <span v-else>Send Reset Link</span>
           </button>
        </div>

        <!-- Success/Error Messages -->
        <div v-if="successMessage" class="success mt-4">{{ successMessage }}</div>
        <div v-if="errorMessage" class="error mt-4">{{ errorMessage }}</div>

        <!-- Back to Login -->
        <div class="mt-6">
          <NuxtLink to="/login" class="text-sm text-primary_green hover:underline">
            Back to Login
          </NuxtLink>
        </div>
     </div>
     <div class="divider divider-horizontal"></div>
     <figure><img src="~assets/images/logo.png" class="w-80"></figure>
  </div>
</template>

<style scoped>
  .error {
    color: red;
    font-size: 0.9rem;
  }

  .success {
    color: green;
    font-size: 0.9rem;
  }
</style>

<script setup>
import { ref } from 'vue';
import { validateEmail, logSecurityEvent } from '~/utils/security';

const supabase = useSupabaseClient();

const email = ref('');
const isLoading = ref(false);
const successMessage = ref('');
const errorMessage = ref('');

async function sendResetLink() {
  // Clear previous messages
  successMessage.value = '';
  errorMessage.value = '';

  // Validate email
  if (!email.value.trim()) {
    errorMessage.value = 'Please enter your email address.';
    return;
  }

  if (!validateEmail(email.value)) {
    errorMessage.value = 'Please enter a valid email address.';
    
    // Log invalid email attempt
    await logSecurityEvent({
      eventType: 'PASSWORD_RESET_INVALID_EMAIL',
      details: { 
        email: email.value.substring(0, 30),
        reason: 'Invalid email format'
      },
      severity: 'LOW'
    });
    
    return;
  }

  isLoading.value = true;

  try {
    // Send password reset email
    const { error } = await supabase.auth.resetPasswordForEmail(email.value, {
      redirectTo: `${window.location.origin}/update-password`
    });

    if (error) {
      console.error('Password reset error:', error);
      
      // Log password reset failure
      await logSecurityEvent({
        eventType: 'PASSWORD_RESET_FAILED',
        details: { 
          email: email.value,
          error: error.message
        },
        severity: 'MEDIUM'
      });

      errorMessage.value = 'Unable to send reset email. Please try again later.';
    } else {
      // Log password reset request
      await logSecurityEvent({
        eventType: 'PASSWORD_RESET_REQUESTED',
        details: { email: email.value },
        severity: 'LOW'
      });

      successMessage.value = 'Password reset email sent! Please check your inbox and spam folder.';
      email.value = ''; // Clear email field
    }
  } catch (error) {
    console.error('Unexpected error:', error);
    
    // Log unexpected error
    await logSecurityEvent({
      eventType: 'PASSWORD_RESET_ERROR',
      details: { 
        email: email.value,
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      severity: 'HIGH'
    });

    errorMessage.value = 'An unexpected error occurred. Please try again later.';
  } finally {
    isLoading.value = false;
  }
}
</script>