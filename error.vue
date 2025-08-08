<template>
  <div class="min-h-screen bg-gray-50 flex flex-col justify-center items-center px-4">
    <div class="max-w-md w-full text-center">
      <!-- Error Icon -->
      <div class="mx-auto mb-6">
        <div class="inline-flex items-center justify-center w-20 h-20 rounded-full" :class="errorIconColor">
          <svg class="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 20 20">
            <path v-if="isServerError" fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/>
            <path v-else-if="isForbidden" fill-rule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clip-rule="evenodd"/>
            <path v-else fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/>
          </svg>
        </div>
      </div>

      <!-- Error Code -->
      <h1 class="text-6xl font-bold text-gray-900 mb-4">
        {{ error.statusCode }}
      </h1>

      <!-- Generic Error Message (CSSECDV 2.4.2) -->
      <h2 class="text-2xl font-semibold text-gray-700 mb-4">
        {{ errorTitle }}
      </h2>

      <!-- Generic Description (No debugging info - CSSECDV 2.4.1) -->
      <p class="text-gray-600 mb-8 leading-relaxed">
        {{ errorDescription }}
      </p>

      <!-- Action Buttons -->
      <div class="space-y-3 sm:space-y-0 sm:space-x-4 sm:flex sm:justify-center">
        <button 
          @click="goBack" 
          class="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
          </svg>
          Go Back
        </button>
        
        <button 
          @click="goHome" 
          class="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3 border border-transparent rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path>
          </svg>
          Return Home
        </button>
      </div>

      <!-- Support Information -->
      <div v-if="showSupportInfo" class="mt-8 p-4 bg-blue-50 rounded-lg">
        <div class="flex items-start">
          <svg class="w-5 h-5 text-blue-400 mr-3 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"/>
          </svg>
          <div class="text-sm text-blue-800">
            <p class="font-medium mb-1">Need assistance?</p>
            <p>If this problem persists, please contact your system administrator with the error code above.</p>
            <p class="mt-2 text-xs text-blue-600">
              Error ID: {{ errorId }}
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';

// Props from Nuxt error handling
const props = defineProps(['error']);

const router = useRouter();

// Generate unique error ID for tracking
const errorId = ref(`ERR-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`);

// Computed properties for error categorization
const isServerError = computed(() => props.error.statusCode >= 500);
const isForbidden = computed(() => props.error.statusCode === 403);
const isNotFound = computed(() => props.error.statusCode === 404);
const isUnauthorized = computed(() => props.error.statusCode === 401);

// Generic error titles (CSSECDV 2.4.2 - no specific error details)
const errorTitle = computed(() => {
  const statusCode = props.error.statusCode;
  
  switch (statusCode) {
    case 400:
      return 'Invalid Request';
    case 401:
      return 'Authentication Required';
    case 403:
      return 'Access Denied';
    case 404:
      return 'Page Not Found';
    case 429:
      return 'Too Many Requests';
    case 500:
      return 'Service Temporarily Unavailable';
    case 502:
      return 'Service Temporarily Unavailable';
    case 503:
      return 'Service Temporarily Unavailable';
    case 504:
      return 'Service Timeout';
    default:
      return statusCode >= 500 ? 'Service Temporarily Unavailable' : 'Request Error';
  }
});

// Generic error descriptions (CSSECDV 2.4.1 - no debugging information)
const errorDescription = computed(() => {
  const statusCode = props.error.statusCode;
  
  switch (statusCode) {
    case 400:
      return 'The request could not be processed. Please check your input and try again.';
    case 401:
      return 'You need to sign in to access this resource. Please log in and try again.';
    case 403:
      return 'You do not have permission to access this resource. If you believe this is an error, please contact your administrator.';
    case 404:
      return 'The page you are looking for could not be found. It may have been moved, deleted, or you may have entered an incorrect URL.';
    case 429:
      return 'Too many requests have been made. Please wait a moment before trying again.';
    case 500:
      return 'We are experiencing technical difficulties. Our team has been notified and is working to resolve the issue.';
    case 502:
      return 'We are experiencing connectivity issues. Please try again in a few moments.';
    case 503:
      return 'The service is temporarily unavailable for maintenance. Please try again later.';
    case 504:
      return 'The request took too long to process. Please try again.';
    default:
      if (statusCode >= 500) {
        return 'We are experiencing technical difficulties. Our team has been notified and is working to resolve the issue.';
      } else {
        return 'There was a problem processing your request. Please try again or contact support if the issue persists.';
      }
  }
});

// Error icon colors based on severity
const errorIconColor = computed(() => {
  if (isServerError.value) {
    return 'bg-red-500'; // Server errors - red
  } else if (isForbidden.value) {
    return 'bg-orange-500'; // Forbidden - orange
  } else if (isNotFound.value) {
    return 'bg-yellow-500'; // Not found - yellow
  } else {
    return 'bg-blue-500'; // Other errors - blue
  }
});

// Show support info for server errors or persistent issues
const showSupportInfo = computed(() => {
  return isServerError.value || isForbidden.value;
});

// Navigation methods
function goBack() {
  if (window.history.length > 1) {
    router.go(-1);
  } else {
    goHome();
  }
}

function goHome() {
  router.push('/');
}

// Log error for monitoring (CSSECDV 2.4.3)
onMounted(async () => {
  try {
    // Log the error occurrence for security monitoring
    await fetch('/api/security/log-event', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        userId: null, // May not have user context in error scenarios
        eventType: 'application_error',
        description: `Application error occurred: ${props.error.statusCode} - ${errorId.value}`,
        severity: isServerError.value ? 'high' : 'medium',
        timestamp: new Date().toISOString()
      })
    });
  } catch (logError) {
    // Don't let logging errors break the error page
    console.error('Failed to log error event:', logError);
  }
});

// Set page title
useHead({
  title: `Error ${props.error.statusCode} - ${errorTitle.value}`
});
</script>

<style scoped>
/* Ensure consistent styling across different screen sizes */
.min-h-screen {
  min-height: 100vh;
  min-height: 100dvh; /* Dynamic viewport height for mobile */
}

/* Smooth transitions for interactive elements */
button {
  transition: all 0.2s ease-in-out;
}

button:focus {
  transform: translateY(-1px);
}

/* Responsive text sizing */
@media (max-width: 640px) {
  h1 {
    font-size: 4rem;
  }
  
  h2 {
    font-size: 1.5rem;
  }
}
</style>