<template>
  <Title>Password Reset - Green Atwork</Title>
  <div class="default-bg min-h-screen flex items-center justify-center px-4 py-8">
    <div class="card card-side min-h-[30rem] w-full max-w-5xl relative bg-white">
      <div class="card-body relative p-8">
        <div class="login-form space-y-4">
          <h1 class="card-title text-black text-2xl mb-6">Reset Your Password</h1>
          <p class="text-black mb-6">
            We'll help you reset your password using your security questions
          </p>
        
          <!-- Step 1: Enter Email -->
          <div v-if="step === 1">
            <form @submit.prevent="handleEmailSubmit" class="space-y-4">
              <div class="form-control">
                <label class="label-text text-black mb-2 block">Email Address</label>
                <input 
                  id="email"
                  v-model="email" 
                  type="email" 
                  class="input-s border-2 border-primary_green bg-primary_white rounded w-full max-w-sm p-3 text-black" 
                  :class="{ 'border-red-300': emailError }"
                  placeholder="Enter your email address"
                  required
                />
                <p v-if="emailError" class="mt-1 text-sm text-red-600">{{ emailError }}</p>
              </div>
               
              <div class="card-actions mt-6">
                <button 
                  type="submit"
                  :disabled="loading || !email.trim()"
                  class="btn btn-sm rounded-full text-white bg-button_green hover:bg-green-700 px-8 py-2 disabled:opacity-50"
                >
                  <span v-if="loading">Verifying...</span>
                  <span v-else>Continue</span>
                </button>
              </div>
            </form>
          </div>

          <!-- Step 2: Answer Security Questions -->
          <div v-else-if="step === 2">
            <div class="mb-6">
              <h3 class="text-lg font-medium text-black">Answer Security Questions</h3>
              <p class="mt-1 text-sm text-black">
                Please answer the security questions to verify your identity
              </p>
            </div>

            <form @submit.prevent="handleSecurityAnswers" class="space-y-4">
              <div v-for="(question, index) in securityQuestions" :key="index" class="form-control">
                <label class="label-text text-black mb-2 block">
                  {{ question.text }}
                </label>
                <input
                  :id="`answer-${index}`"
                  v-model="securityAnswers[index]"
                  type="text"
                  class="input-s border-2 border-primary_green bg-primary_white rounded w-full max-w-sm p-3 text-black"
                  :class="{ 'border-red-300': answerErrors[index] }"
                  placeholder="Enter your answer"
                  required
                />
                <p v-if="answerErrors[index]" class="mt-1 text-sm text-red-600">{{ answerErrors[index] }}</p>
              </div>

              <div class="card-actions mt-6">
                <button
                  type="submit"
                  :disabled="loading || !allAnswersFilled"
                  class="btn btn-sm rounded-full text-white bg-button_green hover:bg-green-700 px-8 py-2 disabled:opacity-50"
                >
                  <span v-if="loading">Verifying...</span>
                  <span v-else>Verify Answers</span>
                </button>
              </div>
            </form>
          </div>

          <!-- Step 3: Set New Password -->
          <div v-else-if="step === 3">
            <div class="mb-6">
              <h3 class="text-lg font-medium text-black">Set New Password</h3>
              <p class="mt-1 text-sm text-black">
                Create a strong new password for your account
              </p>
            </div>

            <form @submit.prevent="handlePasswordReset" class="space-y-4">
              <div class="form-control">
                <label class="label-text text-black mb-2 block">New Password</label>
                <input
                  id="new-password"
                  v-model="newPassword"
                  type="password"
                  autocomplete="new-password"
                  class="input-s border-2 border-primary_green bg-primary_white rounded w-full max-w-sm p-3 text-black"
                  placeholder="Enter your new password"
                  required
                />
              </div>

              <!-- Password Strength Indicator -->
              <PasswordStrengthIndicator 
                :password="newPassword" 
                :user-id="userId"
                :show-requirements="true"
                @validation-result="onPasswordValidation"
              />

              <div class="form-control">
                <label class="label-text text-black mb-2 block">Confirm New Password</label>
                <input
                  id="confirm-password"
                  v-model="confirmPassword"
                  type="password"
                  autocomplete="new-password"
                  class="input-s border-2 border-primary_green bg-primary_white rounded w-full max-w-sm p-3 text-black"
                  :class="{ 'border-red-300': passwordMismatch }"
                  placeholder="Confirm your new password"
                  required
                />
                <p v-if="passwordMismatch" class="mt-1 text-sm text-red-600">Passwords do not match</p>
              </div>

              <div class="card-actions mt-6">
                <button
                  type="submit"
                  :disabled="loading || !canResetPassword"
                  class="btn btn-sm rounded-full text-white bg-button_green hover:bg-green-700 px-8 py-2 disabled:opacity-50"
                >
                  <span v-if="loading">Updating Password...</span>
                  <span v-else>Reset Password</span>
                </button>
              </div>
            </form>
          </div>

          <!-- Step 4: Success -->
          <div v-else-if="step === 4">
            <div class="text-center">
              <div class="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
                <svg class="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                </svg>
              </div>
              <h3 class="text-lg font-medium text-black mb-2">Password Reset Successfully</h3>
              <p class="text-sm text-black mb-6">
                Your password has been updated. You can now sign in with your new password.
              </p>
              <div class="card-actions">
                <button
                  @click="$router.push('/login')"
                  class="btn btn-sm rounded-full text-white bg-button_green hover:bg-green-700 px-8 py-2"
                >
                  Sign In
                </button>
              </div>
            </div>
          </div>

          <!-- Error Display -->
          <div v-if="error" class="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div class="flex">
              <svg class="w-5 h-5 text-red-400 mr-3 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/>
              </svg>
              <p class="text-sm text-red-800">{{ error }}</p>
            </div>
          </div>

          <!-- Back to Login -->
          <div class="mt-6 text-center">
            <NuxtLink 
              to="/login" 
              class="text-sm text-blue-600 hover:text-blue-500"
            >
              ← Back to Sign In
            </NuxtLink>
          </div>
        </div>
      </div>
      
      <!-- Logo Section -->
      <div class="divider divider-horizontal"></div>
      <figure class="flex-shrink-0 p-8">
        <img src="~assets/images/logo.png" class="w-80 max-w-full h-auto">
      </figure>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';

// Define this as a public page (no authentication required)
definePageMeta({
  layout: false
});

// Reactive data
const step = ref(1);
const loading = ref(false);
const error = ref('');

// Step 1 - Email
const email = ref('');
const emailError = ref('');

// Step 2 - Security Questions
const securityQuestions = ref([]);
const securityAnswers = ref(['', '', '']);
const answerErrors = ref(['', '', '']);
const userId = ref(null);

// Step 3 - New Password
const newPassword = ref('');
const confirmPassword = ref('');
const passwordValidation = ref({ isValid: false });

// Computed properties
const allAnswersFilled = computed(() => {
  return securityAnswers.value.every(answer => answer.trim() !== '');
});

const passwordMismatch = computed(() => {
  return confirmPassword.value !== '' && newPassword.value !== confirmPassword.value;
});

const canResetPassword = computed(() => {
  return passwordValidation.value.isValid && 
         !passwordMismatch.value && 
         newPassword.value !== '' && 
         confirmPassword.value !== '';
});

// Methods
async function handleEmailSubmit() {
  emailError.value = '';
  error.value = '';
  
  if (!email.value.trim()) {
    emailError.value = 'Email is required';
    return;
  }

  loading.value = true;

  try {
    const response = await fetch('/api/auth/verify-email-for-reset', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email: email.value.trim() })
    });

    const result = await response.json();

    if (!result.success) {
      // Use generic message to prevent email enumeration
      error.value = 'If an account with this email exists and has security questions set up, you can proceed with password reset.';
      return;
    }

    if (!result.hasSecurityQuestions) {
      error.value = 'This account does not have security questions set up. Please contact your administrator for password reset assistance.';
      return;
    }

    securityQuestions.value = result.questions;
    userId.value = result.userId;
    step.value = 2;

  } catch (err) {
    console.error('Email verification error:', err);
    error.value = 'An error occurred. Please try again.';
  } finally {
    loading.value = false;
  }
}

async function handleSecurityAnswers() {
  answerErrors.value = ['', '', ''];
  error.value = '';
  loading.value = true;

  try {
    const response = await fetch('/api/auth/verify-security-answers', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId: userId.value,
        answers: securityAnswers.value.map(a => a.trim())
      })
    });

    const result = await response.json();

    if (!result.success) {
      if (result.specificErrors) {
        answerErrors.value = result.specificErrors;
      } else {
        error.value = 'One or more security answers are incorrect. Please try again.';
      }
      return;
    }

    step.value = 3;

  } catch (err) {
    console.error('Security answers verification error:', err);
    error.value = 'An error occurred while verifying your answers. Please try again.';
  } finally {
    loading.value = false;
  }
}

async function handlePasswordReset() {
  error.value = '';
  
  if (!passwordValidation.value.isValid) {
    error.value = 'Please choose a stronger password that meets all requirements.';
    return;
  }

  if (passwordMismatch.value) {
    error.value = 'Passwords do not match.';
    return;
  }

  loading.value = true;

  try {
    const response = await fetch('/api/auth/complete-password-reset', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId: userId.value,
        newPassword: newPassword.value
      })
    });

    const result = await response.json();

    if (!result.success) {
      error.value = result.error || 'Failed to reset password. Please try again.';
      return;
    }

    // Clear sensitive data
    newPassword.value = '';
    confirmPassword.value = '';
    securityAnswers.value = ['', '', ''];
    
    step.value = 4;

  } catch (err) {
    console.error('Password reset error:', err);
    error.value = 'An error occurred while resetting your password. Please try again.';
  } finally {
    loading.value = false;
  }
}

function onPasswordValidation(result) {
  passwordValidation.value = result;
}

// Clear errors when user starts typing
watch(email, () => {
  emailError.value = '';
  error.value = '';
});

watch(securityAnswers, () => {
  answerErrors.value = ['', '', ''];
  error.value = '';
}, { deep: true });

watch([newPassword, confirmPassword], () => {
  error.value = '';
});
</script>

<style scoped>
.default-bg {
   background-image: url("~/assets/images/background.jpg");
   background-size: cover;
   position: relative;
   background-position: center;
}
</style>