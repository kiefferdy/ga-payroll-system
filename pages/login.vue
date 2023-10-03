<template>
   <!-- 
      TODO:
      Implement preloader
    -->
   <div class="flex flex-row justify-center py-32">
      <div >
         <h1 class="text-2xl mb-6">Account Login</h1>
         <label class="font-bold">Username<br></label>
         <input type="text" class="w-full bg-off_white border-button_green border-b-2 mb-6 px-2 py-1" required> <!-- TODO: must use v-model, check nuxt docs for aid-->
         
         <label class="font-bold pt-">Password<br></label>
         <input type="password" class="w-full bg-off_white border-button_green border-b-2 mb-8 px-2 py-1" required>  <!-- TODO: must use v-model, check nuxt docs for aid-->

         <button class="bg-button_green rounded-full px-8 py-0.5 font-bold text-white">LOGIN</button> <!-- TODO: Check if user exists, if user exists it will redirect to clock in page, else must show error message-->
      </div>
      <div class="bg-search_text_gray ps-0.5 mx-10 shadow">

      </div>
      <div class="">
         <img src="~assets/images/logo.png" class="w-80">
      </div>
   </div>

</template>

<script>
// TODO:
// Async search database for existing user
</script>