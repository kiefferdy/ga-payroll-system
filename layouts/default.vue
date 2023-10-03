<template>
   <div class="default-bg min-w-screen min-h-screen">
      <div class="bg-primary_white h-14 py-2 px-10">
         <img src="~/assets/images/logo.png" class=" h-10">
      </div>
      <div class="flex flex-col items-center py-28">
         <div class="bg-primary_white py-2 px-10 container h-3/4 max-w-4xl rounded-lg">
            <NuxtPage/>
         </div>         
      </div>


   </div>
</template>

<style scoped>
.default-bg {
   background-image: url("~/assets/images/background.jpg");
   background-size: cover;
   position:relative;
   background-position: center;
}
</style>
