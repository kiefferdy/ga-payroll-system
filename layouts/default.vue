<template>
   <!-- Check if this is an admin page that needs full-screen layout -->
   <div v-if="isAdminPage" class="min-h-screen">
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

// Determine if this is an admin page that should use full-screen layout
const isAdminPage = computed(() => {
   const adminPages = ['/employees', '/settings', '/records']
   return adminPages.includes(route.path)
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
