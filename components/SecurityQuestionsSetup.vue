<template>
  <div class="security-questions-setup">
    <div class="max-w-2xl mx-auto">
      <!-- Header -->
      <div class="text-center mb-8">
        <h2 class="text-2xl font-bold text-gray-900">Security Questions Setup</h2>
        <p class="mt-2 text-gray-600">
          Set up security questions to help verify your identity for password recovery.
          Choose questions with answers that are memorable but not easily guessable by others.
        </p>
      </div>

      <!-- Warning about answer security -->
      <div class="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
        <div class="flex">
          <svg class="w-5 h-5 text-amber-400 mr-3 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/>
          </svg>
          <div class="text-sm text-amber-800">
            <p class="font-medium">Security Guidelines:</p>
            <ul class="mt-1 list-disc list-inside space-y-1">
              <li>Avoid common answers like "password", "123", or "blue"</li>
              <li>Use specific answers that only you would know</li>
              <li>Don't use information that's publicly available on social media</li>
              <li>Your answers are case-insensitive</li>
            </ul>
          </div>
        </div>
      </div>

      <!-- Form -->
      <form @submit.prevent="handleSaveQuestions" class="space-y-6">
        <!-- Question 1 -->
        <div>
          <label class="block text-sm font-medium text-white">
            Security Question 1 *
          </label>
          <select
            v-model="questions[0].question"
            class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-black bg-white"
            required
          >
            <option value="">Select a question...</option>
            <option v-for="q in availableQuestions" :key="q" :value="q">{{ q }}</option>
          </select>
          
          <div class="mt-2">
            <label class="block text-sm font-medium text-white">
              Your Answer *
            </label>
            <input
              v-model="questions[0].answer"
              type="text"
              class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-black bg-white"
              :class="{ 'border-red-300': questions[0].error }"
              placeholder="Enter your answer"
              required
            />
            <p v-if="questions[0].error" class="mt-1 text-sm text-red-600">{{ questions[0].error }}</p>
          </div>
        </div>

        <!-- Question 2 -->
        <div>
          <label class="block text-sm font-medium text-white">
            Security Question 2 *
          </label>
          <select
            v-model="questions[1].question"
            class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-black bg-white"
            required
          >
            <option value="">Select a question...</option>
            <option 
              v-for="q in availableQuestions" 
              :key="q" 
              :value="q"
              :disabled="q === questions[0].question"
            >
              {{ q }}
            </option>
          </select>
          
          <div class="mt-2">
            <label class="block text-sm font-medium text-white">
              Your Answer *
            </label>
            <input
              v-model="questions[1].answer"
              type="text"
              class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-black bg-white"
              :class="{ 'border-red-300': questions[1].error }"
              placeholder="Enter your answer"
              required
            />
            <p v-if="questions[1].error" class="mt-1 text-sm text-red-600">{{ questions[1].error }}</p>
          </div>
        </div>

        <!-- Question 3 -->
        <div>
          <label class="block text-sm font-medium text-white">
            Security Question 3 *
          </label>
          <select
            v-model="questions[2].question"
            class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-black bg-white"
            required
          >
            <option value="">Select a question...</option>
            <option 
              v-for="q in availableQuestions" 
              :key="q" 
              :value="q"
              :disabled="q === questions[0].question || q === questions[1].question"
            >
              {{ q }}
            </option>
          </select>
          
          <div class="mt-2">
            <label class="block text-sm font-medium text-white">
              Your Answer *
            </label>
            <input
              v-model="questions[2].answer"
              type="text"
              class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-black bg-white"
              :class="{ 'border-red-300': questions[2].error }"
              placeholder="Enter your answer"
              required
            />
            <p v-if="questions[2].error" class="mt-1 text-sm text-red-600">{{ questions[2].error }}</p>
          </div>
        </div>

        <!-- Error Display -->
        <div v-if="error" class="p-4 bg-red-50 border border-red-200 rounded-lg">
          <div class="flex">
            <svg class="w-5 h-5 text-red-400 mr-3 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/>
            </svg>
            <p class="text-sm text-red-800">{{ error }}</p>
          </div>
        </div>

        <!-- Success Display -->
        <div v-if="success" class="p-4 bg-green-50 border border-green-200 rounded-lg">
          <div class="flex">
            <svg class="w-5 h-5 text-green-400 mr-3 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
            </svg>
            <p class="text-sm text-green-800">{{ success }}</p>
          </div>
        </div>

        <!-- Submit Button -->
        <div class="flex justify-end space-x-4">
          <button
            v-if="allowSkip"
            type="button"
            @click="$emit('skip')"
            class="px-4 py-2 text-sm font-medium text-black bg-gray-200 border border-gray-300 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
          >
            Skip for Now
          </button>
          <button
            type="submit"
            :disabled="loading"
            class="px-6 py-2 text-sm font-medium text-white bg-button_green hover:bg-green-700 border border-transparent rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span v-if="loading" class="flex items-center">
              <svg class="animate-spin -ml-1 mr-3 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Saving...
            </span>
            <span v-else>Save Security Questions</span>
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';

// Props
const props = defineProps({
  allowSkip: {
    type: Boolean,
    default: false
  }
});

// Emits
const emit = defineEmits(['saved', 'skip']);

// Supabase
const supabase = useSupabaseClient();
const user = useSupabaseUser();

// Input validation
const { validateInput } = useInputValidation();

// Reactive data
const loading = ref(false);
const error = ref('');
const success = ref('');

// Security questions with good entropy (CSSECDV 2.1.9)
const availableQuestions = ref([
  "What is the name of the hospital where you were born?",
  "What is the first and last name of your first boss?",
  "What is the name of the street you lived on in third grade?",
  "What is your oldest sibling's middle name?",
  "What is the middle name of your oldest child?",
  "What is your oldest sibling's birth month and year (e.g., January 1970)?",
  "What is the name of your first pet and the year you got it (e.g., Fluffy 1995)?",
  "In what city did your parents meet?",
  "What is the name of the company where you had your first job?",
  "What is your maternal grandmother's maiden name and birth year?",
  "What was the last name of your third-grade teacher?",
  "What is the name of the first school you attended and the year?",
  "What is the license plate number of your first car?",
  "What is the first and last name of your maid of honor or best man?",
  "What is the name of the town where your father was born and the decade?",
]);

const questions = ref([
  { question: '', answer: '', error: '' },
  { question: '', answer: '', error: '' },
  { question: '', answer: '', error: '' }
]);

// Computed
const isFormValid = computed(() => {
  return questions.value.every(q => 
    q.question.trim() !== '' && 
    q.answer.trim() !== '' && 
    q.error === ''
  );
});

// Methods
function validateAnswers() {
  let isValid = true;
  
  questions.value.forEach((q, index) => {
    q.error = '';
    
    // Validate answer
    const validation = validateInput(q.answer, {
      required: true,
      length: { min: 2, max: 100 },
      fieldName: `Security Answer ${index + 1}`
    });
    
    if (!validation.isValid) {
      q.error = validation.errors[0];
      isValid = false;
      return;
    }
    
    // Check for common weak answers
    const weakAnswers = [
      'password', '123', '123456', 'abc', 'test', 'none', 'n/a', 'na', 
      'unknown', 'idk', 'forgot', 'blue', 'red', 'green', 'black', 'white',
      'yes', 'no', 'maybe', 'dunno', 'secret'
    ];
    
    if (weakAnswers.includes(q.answer.toLowerCase().trim())) {
      q.error = 'Please choose a more specific answer that only you would know';
      isValid = false;
      return;
    }
    
    // Check answer length
    if (q.answer.trim().length < 3) {
      q.error = 'Answer must be at least 3 characters long';
      isValid = false;
      return;
    }
  });
  
  // Check for duplicate questions
  const selectedQuestions = questions.value.map(q => q.question).filter(q => q !== '');
  const uniqueQuestions = [...new Set(selectedQuestions)];
  
  if (selectedQuestions.length !== uniqueQuestions.length) {
    error.value = 'Please select different questions for each slot';
    isValid = false;
  }
  
  return isValid;
}

async function handleSaveQuestions() {
  error.value = '';
  success.value = '';
  
  // Validate answers
  if (!validateAnswers()) {
    return;
  }
  
  loading.value = true;
  
  try {
    // Save security questions
    const response = await fetch('/api/auth/save-security-questions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId: user.value.id,
        questions: questions.value.map(q => ({
          question: q.question,
          answer: q.answer.trim()
        }))
      })
    });
    
    const result = await response.json();
    
    if (!result.success) {
      error.value = result.error || 'Failed to save security questions';
      return;
    }
    
    success.value = 'Security questions saved successfully!';
    
    // Clear form after short delay
    setTimeout(() => {
      emit('saved', {
        questionsSet: true,
        timestamp: new Date().toISOString()
      });
    }, 1500);
    
  } catch (err) {
    console.error('Error saving security questions:', err);
    error.value = 'An error occurred while saving your security questions. Please try again.';
  } finally {
    loading.value = false;
  }
}

// Clear error when user starts typing
function clearError(index) {
  questions.value[index].error = '';
  error.value = '';
}

// Watch for answer changes to clear errors
watch(() => questions.value, (newQuestions) => {
  newQuestions.forEach((q, index) => {
    if (q.answer !== '') {
      clearError(index);
    }
  });
}, { deep: true });
</script>

<style scoped>
.security-questions-setup {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif;
}

.animate-spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
</style>