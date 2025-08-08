<template>
  <div class="password-strength-indicator">
    <div v-if="showStrength" class="mt-2 space-y-2">
      <!-- Strength Bar -->
      <div class="relative">
        <div class="h-2 bg-gray-200 rounded-full overflow-hidden">
          <div 
            class="h-full transition-all duration-300 ease-out rounded-full"
            :class="strengthInfo.bgColor"
            :style="{ width: `${Math.max(score, 10)}%` }"
          ></div>
        </div>
        <div class="flex justify-between mt-1">
          <span class="text-xs text-gray-500">Password Strength</span>
          <span class="text-xs font-medium capitalize" :class="strengthInfo.color">
            {{ strengthInfo.level }}
          </span>
        </div>
      </div>

      <!-- Validation Errors -->
      <div v-if="errors.length > 0" class="space-y-1">
        <div 
          v-for="error in errors" 
          :key="error"
          class="flex items-start text-sm text-red-600"
        >
          <svg class="w-4 h-4 mt-0.5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/>
          </svg>
          <span>{{ error }}</span>
        </div>
      </div>

      <!-- Positive Feedback -->
      <div v-if="feedback.length > 0 && errors.length === 0" class="space-y-1">
        <div 
          v-for="item in feedback.slice(0, 3)" 
          :key="item"
          class="flex items-start text-sm text-green-600"
        >
          <svg class="w-4 h-4 mt-0.5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
          </svg>
          <span>{{ item }}</span>
        </div>
        <div v-if="feedback.length > 3" class="text-sm text-gray-500 ml-6">
          +{{ feedback.length - 3 }} more requirements met
        </div>
      </div>

      <!-- Password Requirements Checklist -->
      <div v-if="showRequirements" class="mt-3 p-3 bg-gray-50 rounded-lg">
        <h4 class="text-sm font-medium text-gray-700 mb-2">Password Requirements:</h4>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-1 text-sm">
          <div class="flex items-center">
            <span :class="password.length >= 12 ? 'text-green-600' : 'text-gray-400'">
              {{ password.length >= 12 ? '✓' : '○' }}
            </span>
            <span class="ml-2">At least 12 characters</span>
          </div>
          <div class="flex items-center">
            <span :class="/[A-Z]/.test(password) ? 'text-green-600' : 'text-gray-400'">
              {{ /[A-Z]/.test(password) ? '✓' : '○' }}
            </span>
            <span class="ml-2">Uppercase letter</span>
          </div>
          <div class="flex items-center">
            <span :class="/[a-z]/.test(password) ? 'text-green-600' : 'text-gray-400'">
              {{ /[a-z]/.test(password) ? '✓' : '○' }}
            </span>
            <span class="ml-2">Lowercase letter</span>
          </div>
          <div class="flex items-center">
            <span :class="/[0-9]/.test(password) ? 'text-green-600' : 'text-gray-400'">
              {{ /[0-9]/.test(password) ? '✓' : '○' }}
            </span>
            <span class="ml-2">Number</span>
          </div>
          <div class="flex items-center">
            <span :class="/[!@#$%^&*()_+\-=\[\]{}|;:,.<>?]/.test(password) ? 'text-green-600' : 'text-gray-400'">
              {{ /[!@#$%^&*()_+\-=\[\]{}|;:,.<>?]/.test(password) ? '✓' : '○' }}
            </span>
            <span class="ml-2">Special character</span>
          </div>
          <div class="flex items-center">
            <span :class="!/(.)\\1{2,}/.test(password) ? 'text-green-600' : 'text-gray-400'">
              {{ !/(.)\\1{2,}/.test(password) ? '✓' : '○' }}
            </span>
            <span class="ml-2">No repetitive chars</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, watch } from 'vue';

// Props
const props = defineProps({
  password: {
    type: String,
    default: ''
  },
  userId: {
    type: String,
    default: null
  },
  showStrength: {
    type: Boolean,
    default: true
  },
  showRequirements: {
    type: Boolean,
    default: false
  },
  realTimeValidation: {
    type: Boolean,
    default: true
  }
});

// Use the password validation composable
const { 
  validatePassword, 
  strengthInfo, 
  isValid, 
  errors, 
  feedback, 
  score 
} = usePasswordValidation();

// Emits
const emit = defineEmits(['validation-result']);

// Debounced validation
let validationTimeout = null;

// Watch password changes and validate
watch(() => props.password, (newPassword) => {
  if (!props.realTimeValidation || !newPassword) {
    return;
  }

  // Clear existing timeout
  if (validationTimeout) {
    clearTimeout(validationTimeout);
  }

  // Debounce validation to avoid excessive API calls
  validationTimeout = setTimeout(async () => {
    if (newPassword.length > 0) {
      const result = await validatePassword(newPassword, props.userId);
      emit('validation-result', result);
    }
  }, 500);
}, { immediate: false });

// Validate immediately when password is provided initially
watch(() => props.password, async (newPassword) => {
  if (newPassword && !props.realTimeValidation) {
    const result = await validatePassword(newPassword, props.userId);
    emit('validation-result', result);
  }
}, { immediate: true });

// Expose validation method for manual triggering
defineExpose({
  validate: () => validatePassword(props.password, props.userId)
});
</script>

<style scoped>
.password-strength-indicator {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif;
}

.transition-all {
  transition: all 0.3s ease-out;
}
</style>