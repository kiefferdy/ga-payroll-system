<template>
  <div class="error-page flex items-center justify-center min-h-screen bg-primary_white">
    <div class="card text-black flex items-center justify-center h-[30rem] w-[50rem]">
      <div class="text-center">
        <!-- Error Status -->
        <h1 class="text-6xl font-bold text-button_green mb-4">{{ error.statusCode }}</h1>
        
        <!-- Error Message -->
        <h2 class="text-2xl font-semibold mb-6">{{ getErrorTitle() }}</h2>
        
        <!-- Error Description -->
        <p class="text-gray-600 mb-8">{{ getErrorDescription() }}</p>
        
        <!-- Action Buttons -->
        <div class="space-x-4">
          <button 
            @click="goHome" 
            class="btn btn-ghost bg-button_green text-white rounded-full px-6"
          >
            Go Home
          </button>
          
          <button 
            v-if="error.statusCode === 403"
            @click="goToLogin" 
            class="btn btn-ghost bg-dark_gray text-white rounded-full px-6"
          >
            Login
          </button>
          
          <button 
            @click="retry" 
            class="btn btn-ghost bg-primary_green text-white rounded-full px-6"
          >
            Try Again
          </button>
        </div>
        
        <!-- Contact Admin for Critical Errors -->
        <p v-if="error.statusCode >= 500" class="text-sm text-gray-500 mt-6">
          If this problem persists, please contact your system administrator.
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { logSecurityEvent } from '~/utils/security'

const props = defineProps({
  error: Object
})

// Log error occurrence for security monitoring
onMounted(async () => {
  const user = useSupabaseUser()
  
  await logSecurityEvent({
    eventType: 'ERROR_OCCURRED',
    userId: user.value?.id,
    userEmail: user.value?.email,
    details: {
      statusCode: props.error.statusCode,
      statusMessage: props.error.statusMessage,
      url: props.error.url,
      // Don't log full error stack for security
      errorType: props.error.statusCode >= 500 ? 'SERVER_ERROR' : 'CLIENT_ERROR'
    },
    severity: props.error.statusCode >= 500 ? 'HIGH' : 'MEDIUM'
  })
})

function getErrorTitle() {
  switch (props.error.statusCode) {
    case 400:
      return 'Bad Request'
    case 401:
      return 'Authentication Required'
    case 403:
      return 'Access Denied'
    case 404:
      return 'Page Not Found'
    case 500:
      return 'Server Error'
    case 503:
      return 'Service Unavailable'
    default:
      return 'An Error Occurred'
  }
}

function getErrorDescription() {
  switch (props.error.statusCode) {
    case 400:
      return 'The request could not be understood. Please check your input and try again.'
    case 401:
      return 'You need to be logged in to access this page.'
    case 403:
      return 'You do not have permission to access this resource.'
    case 404:
      return 'The page you are looking for could not be found.'
    case 500:
      return 'An internal server error occurred. Our team has been notified.'
    case 503:
      return 'The service is temporarily unavailable. Please try again later.'
    default:
      return 'Something went wrong. Please try again or contact support if the problem persists.'
  }
}

function goHome() {
  navigateTo('/')
}

function goToLogin() {
  navigateTo('/login')
}

function retry() {
  // Clear error and retry
  clearError({ redirect: '/' })
}
</script>

<style scoped>
.error-page {
  font-family: 'Inter', sans-serif;
}
</style>