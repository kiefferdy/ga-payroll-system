<template>
   <!-- Check if this page needs full-screen layout -->
   <div v-if="isFullScreenPage" class="min-h-screen">
      <NuxtPage/>
   </div>
   
   <!-- For other pages, use the centered card layout with background -->
   <div v-else class="default-bg min-w-screen min-h-screen flex flex-col justify-center">
      <div class="card self-center items-center justify-center h-[37rem] w-[65rem] bg-primary_white">
         <div class="card-content">
            <NuxtPage/>
         </div>
      </div>   
   </div>
</template>

<script setup>
const route = useRoute()

// Determine if this page should use full-screen layout (admin pages + account settings)
const isFullScreenPage = computed(() => {
   const fullScreenPages = ['/employees', '/settings', '/records', '/roles', '/account']
   return fullScreenPages.includes(route.path)
})
</script>

<style scoped>
.default-bg {
   background-image: url("~/assets/images/background.jpg");
   background-size: cover;
   position: relative;
   background-position: center;
}
</style>
