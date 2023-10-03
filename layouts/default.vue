<template>
   <div class="default-bg flex flex-col min-w-screen min-h-screen">
      <div class="bg-primary_white h-14 py-2 px-10">
         <img src="~/assets/images/logo.png" class=" h-10">
      </div>
      <div class="bg-primary_white flex self-center w-3/6 py-5 px-10 my-10 rounded-lg drop-shadow-md">
         <NuxtPage/>
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
