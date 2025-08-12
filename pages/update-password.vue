<template>
  <Title>Green Atwork - Update Password</Title>
  <div class="card card-side h-[35rem] w-[60rem]">
     <div class="card-body">
        <h1 class="card-title text-black">Set New Password</h1>
        <p class="text-gray-600 mb-4">Please enter your new password.</p>

        <label class="label-text text-black mt-4">New Password</label>
        <input 
          v-model="password" 
          @input="validatePasswordOnChange"
          :type="hidePassword ? 'password' : 'text'"
          class="input-s border-2 border-primary_green bg-primary_white rounded w-72 text-black" 
          placeholder="Enter new password"
          required
          :disabled="isLoading"
        >

        <!-- Password strength indicator -->
        <div v-if="password" class="mt-2 mb-2">
          <div class="text-xs mb-1">Password Strength: 
            <span :class="passwordStrengthClass">{{ passwordStrength }}</span>
          </div>
          <div class="w-72 bg-gray-200 rounded-full h-1">
            <div :class="passwordProgressClass" :style="{ width: passwordProgressWidth }" class="h-1 rounded-full transition-all duration-300"></div>
          </div>
        </div>

        <!-- Password requirements -->
        <div v-if="password && passwordErrors.length > 0" class="mt-2 mb-4">
          <p class="text-xs text-gray-600 mb-1">Password must include:</p>
          <ul class="text-xs">
            <li v-for="error in passwordErrors" :key="error" class="text-red-500">• {{ error }}</li>
          </ul>
        </div>

        <label class="label-text text-black mt-4">Confirm New Password</label>
        <input 
          v-model="confirmPassword" 
          :type="hidePassword ? 'password' : 'text'"
          class="input-s border-2 border-primary_green bg-primary_white rounded w-72 text-black" 
          placeholder="Confirm new password"
          required
          :disabled="isLoading"
        >

        <div class="text-black mt-2">
          <input @click="hidePassword = !hidePassword" type="checkbox"> Show Password
        </div>
        
        <div class="card-actions">
           <button 
             @click="updatePassword" 
             :disabled="isLoading || !password.trim() || !confirmPassword.trim() || passwordErrors.length > 0"
             class="btn btn-xs mt-3 rounded-full text-white bg-button_green btn-ghost w-40"
           >
             <span v-if="isLoading" class="loading loading-spinner loading-xs"></span>
             <span v-else>Update Password</span>
           </button>
        </div>

        <!-- Success/Error Messages -->
        <div v-if="successMessage" class="success mt-4">{{ successMessage }}</div>
        <div v-if="errorMessage" class="error mt-4">{{ errorMessage }}</div>
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
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { validatePasswordComplexity, logSecurityEvent, checkPasswordHistory } from '~/utils/security';

const supabase = useSupabaseClient();
const router = useRouter();

const password = ref('');
const confirmPassword = ref('');
const hidePassword = ref(true);
const isLoading = ref(false);
const successMessage = ref('');
const errorMessage = ref('');

// Password validation
const passwordErrors = ref([]);
const passwordStrength = ref('');

// Password strength styling
const passwordStrengthClass = computed(() => {
  switch (passwordStrength.value) {
    case 'WEAK': return 'text-red-500';
    case 'MEDIUM': return 'text-yellow-500';
    case 'STRONG': return 'text-green-500';
    default: return 'text-gray-500';
  }
});

const passwordProgressClass = computed(() => {
  switch (passwordStrength.value) {
    case 'WEAK': return 'bg-red-500';
    case 'MEDIUM': return 'bg-yellow-500';
    case 'STRONG': return 'bg-green-500';
    default: return 'bg-gray-300';
  }
});

const passwordProgressWidth = computed(() => {
  switch (passwordStrength.value) {
    case 'WEAK': return '33%';
    case 'MEDIUM': return '66%';
    case 'STRONG': return '100%';
    default: return '0%';
  }
});

// Validate password as user types
function validatePasswordOnChange() {
  if (password.value) {
    const validation = validatePasswordComplexity(password.value);
    passwordErrors.value = validation.errors;
    passwordStrength.value = validation.strength;
  } else {
    passwordErrors.value = [];
    passwordStrength.value = '';
  }
}

async function updatePassword() {
  // Clear previous messages
  successMessage.value = '';
  errorMessage.value = '';

  // Validate inputs
  if (!password.value.trim() || !confirmPassword.value.trim()) {
    errorMessage.value = 'Please fill in both password fields.';
    return;
  }

  if (password.value !== confirmPassword.value) {
    errorMessage.value = 'Passwords do not match.';
    return;
  }

  // Validate password complexity
  const passwordValidation = validatePasswordComplexity(password.value);
  if (!passwordValidation.valid) {
    errorMessage.value = 'Password does not meet complexity requirements.';
    return;
  }

  // Get user info for password history check
  const { data: { user } } = await supabase.auth.getUser();
  if (user) {
    // Check password history to prevent reuse
    const historyCheck = await checkPasswordHistory(user.id, password.value);
    if (historyCheck.isReused) {
      errorMessage.value = historyCheck.error || 'This password has been used recently. Please choose a different password.';
      return;
    }
  }

  isLoading.value = true;

  try {
    // Update the user's password
    const { error } = await supabase.auth.updateUser({
      password: password.value
    });

    if (error) {
      console.error('Password update error:', error);
      
      // Log password update failure
      const { data: { user } } = await supabase.auth.getUser();
      await logSecurityEvent({
        eventType: 'PASSWORD_UPDATE_FAILED',
        userId: user?.id,
        userEmail: user?.email,
        details: { 
          error: error.message,
          strength: passwordValidation.strength
        },
        severity: 'HIGH'
      });

      errorMessage.value = 'Unable to update password. Please try again.';
    } else {
      // Store new password in history and update timestamp
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        try {
          await $fetch('/api/store-password-history', {
            method: 'POST',
            body: {
              userId: user.id,
              newPassword: password.value
            }
          });
        } catch (historyError) {
          console.error('Failed to store password history:', historyError);
          // Don't fail the entire operation, just log it
        }

        // Log successful password update
        await logSecurityEvent({
          eventType: 'PASSWORD_UPDATED',
          userId: user.id,
          userEmail: user.email,
          details: { 
            method: 'password_reset_link',
            strength: passwordValidation.strength
          },
          severity: 'LOW'
        });
      }

      successMessage.value = 'Password updated successfully! Redirecting to login...';
      
      // Redirect to login after 3 seconds
      setTimeout(() => {
        router.push('/login');
      }, 3000);
    }
  } catch (error) {
    console.error('Unexpected error:', error);
    
    // Log unexpected error
    const { data: { user } } = await supabase.auth.getUser();
    await logSecurityEvent({
      eventType: 'PASSWORD_UPDATE_ERROR',
      userId: user?.id,
      userEmail: user?.email,
      details: { 
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      severity: 'HIGH'
    });

    errorMessage.value = 'An unexpected error occurred. Please try again.';
  } finally {
    isLoading.value = false;
  }
}
</script>