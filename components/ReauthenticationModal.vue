<template>
  <div v-if="isVisible" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50" @click="closeModal">
    <div class="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white" @click.stop>
      <div class="mt-3">
        <!-- Header -->
        <div class="flex items-center justify-between mb-4">
          <div class="flex items-center">
            <div class="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
              <svg class="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <div class="ml-3">
              <h3 class="text-lg font-medium text-gray-900">Security Verification Required</h3>
              <p class="text-sm text-gray-500">{{ message || 'Please confirm your identity to continue' }}</p>
            </div>
          </div>
          <button 
            @click="closeModal"
            class="text-gray-400 hover:text-gray-600"
          >
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>

        <!-- Form -->
        <form @submit.prevent="handleReauthentication" class="space-y-4">
          <!-- Current Password -->
          <div>
            <label for="current-password" class="block text-sm font-medium text-gray-700">
              Current Password
            </label>
            <div class="mt-1 relative">
              <input
                id="current-password"
                ref="passwordInput"
                v-model="currentPassword"
                :type="showPassword ? 'text' : 'password'"
                class="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                :class="{ 'border-red-300': error }"
                placeholder="Enter your current password"
                required
                :disabled="loading"
              />
              <button
                type="button"
                @click="showPassword = !showPassword"
                class="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                <svg v-if="!showPassword" class="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                <svg v-else class="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                </svg>
              </button>
            </div>
          </div>

          <!-- Error Message -->
          <div v-if="error" class="text-sm text-red-600 bg-red-50 p-3 rounded-md">
            <div class="flex items-start">
              <svg class="w-5 h-5 text-red-400 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/>
              </svg>
              <span>{{ error }}</span>
            </div>
          </div>

          <!-- Action Buttons -->
          <div class="flex items-center justify-between space-x-3 pt-4">
            <button
              type="button"
              @click="closeModal"
              class="w-full inline-flex justify-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              :disabled="loading"
            >
              Cancel
            </button>
            <button
              type="submit"
              class="w-full inline-flex justify-center items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              :disabled="loading || !currentPassword.trim()"
            >
              <svg v-if="loading" class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              {{ loading ? 'Verifying...' : 'Verify Identity' }}
            </button>
          </div>
        </form>

        <!-- Additional Security Info -->
        <div class="mt-4 p-3 bg-blue-50 rounded-md">
          <div class="flex">
            <svg class="w-5 h-5 text-blue-400 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"/>
            </svg>
            <div class="text-sm text-blue-700">
              <p class="font-medium">Why do we need this?</p>
              <p class="mt-1">For your security, we require password confirmation before performing sensitive operations like changing passwords or modifying account settings.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, nextTick, watch } from 'vue';

// Props
const props = defineProps({
  isVisible: {
    type: Boolean,
    default: false
  },
  message: {
    type: String,
    default: 'Please confirm your identity to continue with this action'
  },
  operation: {
    type: String,
    default: 'critical_operation'
  }
});

// Emits
const emit = defineEmits(['confirmed', 'cancelled', 'close']);

// Reactive data
const currentPassword = ref('');
const showPassword = ref(false);
const loading = ref(false);
const error = ref('');
const passwordInput = ref(null);

// Supabase
const supabase = useSupabaseClient();
const user = useSupabaseUser();

// Methods
async function handleReauthentication() {
  if (!currentPassword.value.trim()) {
    error.value = 'Password is required';
    return;
  }

  loading.value = true;
  error.value = '';

  try {
    // Attempt to sign in with current credentials to verify password
    const { data, error: authError } = await supabase.auth.signInWithPassword({
      email: user.value.email,
      password: currentPassword.value.trim()
    });

    if (authError) {
      if (authError.message.includes('Invalid login credentials')) {
        error.value = 'Invalid password. Please try again.';
      } else {
        error.value = 'Authentication failed. Please try again.';
      }
      
      // Log failed re-authentication attempt
      await logSecurityEvent(
        user.value.id,
        'reauthentication_failed',
        `Failed re-authentication attempt for operation: ${props.operation}`,
        'medium'
      );
      
      return;
    }

    // Success - log the successful re-authentication
    await logSecurityEvent(
      user.value.id,
      'reauthentication_success',
      `Successful re-authentication for operation: ${props.operation}`,
      'low'
    );

    // Clear password and emit success
    currentPassword.value = '';
    emit('confirmed', {
      userId: user.value.id,
      timestamp: new Date().toISOString(),
      operation: props.operation
    });

    closeModal();

  } catch (err) {
    console.error('Re-authentication error:', err);
    error.value = 'An unexpected error occurred. Please try again.';
    
    // Log the error
    await logSecurityEvent(
      user.value?.id,
      'reauthentication_error',
      `Re-authentication system error: ${err.message}`,
      'high'
    );
  } finally {
    loading.value = false;
  }
}

function closeModal() {
  currentPassword.value = '';
  showPassword.value = false;
  error.value = '';
  loading.value = false;
  emit('close');
  emit('cancelled');
}

// Security event logging
async function logSecurityEvent(userId, eventType, description, severity) {
  try {
    await fetch('/api/security/log-event', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        userId,
        eventType,
        description,
        severity,
        timestamp: new Date().toISOString()
      })
    });
  } catch (error) {
    console.error('Error logging security event:', error);
  }
}

// Focus password input when modal opens
watch(() => props.isVisible, async (newValue) => {
  if (newValue) {
    await nextTick();
    passwordInput.value?.focus();
  }
});

// Handle escape key
function handleKeydown(event) {
  if (event.key === 'Escape' && props.isVisible) {
    closeModal();
  }
}

// Add/remove event listener for escape key
watch(() => props.isVisible, (newValue) => {
  if (newValue) {
    document.addEventListener('keydown', handleKeydown);
  } else {
    document.removeEventListener('keydown', handleKeydown);
  }
});

// Clean up on unmount
onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown);
});
</script>

<style scoped>
.animate-spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
</style>