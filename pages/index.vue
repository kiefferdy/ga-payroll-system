<template>
   <div class="card text-black flex items-center justify-center h-[30rem] w-[60rem]">
      <div class="flex flex-row self-end">
         <p class="mr-4 ">Status:</p>
         <div class="bg-clock_out_red rounded-full w-2.5 h-2.5 mx-1 mt-2"></div>
         <p>Out</p>
      </div>
      <h1 class="card-title text-2xl mt-24">Good Morning,</h1>
      <p>Reign</p>
      <p class="mt-5 mb-1.5">9:00 AM</p>
      <div class="card-actions">
         <button class="btn btn-circle btn-ghost w-36 h-36 mt-1 bg-clock_in_green text-white"> <NuxtLink to="/otp">Time In</NuxtLink></button>
      </div>
      <div class="card-actions self-end mt-24">
      <button class="font-bold btn btn-sm btn-ghost btn-circle w-32 ">Logout<img class="mx-2 w-4 h-4" src="~/assets/icons/exit.png"></button>
      </div>
   </div>
</template>

<script>
</script>