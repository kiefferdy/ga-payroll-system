<template>
  <div class="flex items-center justify-center min-h-screen bg-primary_white">
    <div class="card text-black flex items-center justify-center h-[30rem] w-[50rem]">
      <div class="text-center">
        <h1 class="text-6xl font-bold text-button_green mb-4">404</h1>
        <h2 class="text-2xl font-semibold mb-6">Page Not Found</h2>
        <p class="text-gray-600 mb-8">The page you are looking for could not be found.</p>
        
        <div class="space-x-4">
          <button @click="goHome" class="btn btn-ghost bg-button_green text-white rounded-full px-6">
            Go Home
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
// Handle special routes that should be ignored (like Chrome DevTools requests)
const route = useRoute()

// Silently handle well-known paths and other non-essential requests
if (route.path.startsWith('/.well-known/') || 
    route.path.startsWith('/favicon') || 
    route.path.startsWith('/robots')) {
  throw createError({
    statusCode: 404,
    statusMessage: 'Not Found',
    fatal: false
  })
}

function goHome() {
  navigateTo('/')
}

// Set page title
useHead({
  title: 'Page Not Found - Green Atwork'
})
</script>