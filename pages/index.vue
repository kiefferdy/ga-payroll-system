<template>
   <div class="flex flex-row place-content-end text-xs mt-2">
      <p class="mr-4">Status: </p>
      <div class="bg-clock_out_red rounded-full w-2.5 h-2.5 mx-1 mt-0.5"></div>
      <p> Out</p>
   </div>
   <div class="flex flex-col items-center">
      <h1 class="text-xl font-bold mt-20">Good Evening,</h1>
      <p>Reign</p>
      <p class="mt-5 mb-1.5">9:00 AM</p>
      <button class="w-24 h-24 bg-clock_in_green text-white rounded-full flex items-center justify-center"> Time In</button>
   </div>
   <div class="flex place-content-end text-xs mt-20 mb-2">
      <button class="font-bold flex flex-row"> Logout <img class="mx-2 mt-0.5 w-3 h-3" src="~/assets/icons/exit.png"></button>
   </div>
</template>