<template>
   <div class="card card-side bg-off_white justify-between items-center h-12 p-5 m-5 mx-10">
      <div class="card card-side items-center">
         <img src="~/assets/icons/user.png" class="w-8 rounded-full me-2"/>
         <p>{{ firstname }} {{ lastname }}</p>
      </div>
      <div class="card card-side">
         <div class="me-10">
            <div class="flex flex-row self-end">
               <p class="mr-4 ">Status:</p>
               <div v-if="timeIn">
                  <div class="bg-clock_out_red rounded-full w-2.5 h-2.5 mx-1 mt-2"></div>
                  <p>In</p>     
               </div>
               <div v-else>
                  <div class="bg-clock_out_red rounded-full w-2.5 h-2.5 mx-1 mt-2"></div>
                  <p>Out</p>     
               </div>
            </div>
            <p class="text-xs">Last updated: {{ lastUpdated }}</p>
         </div>
         <div class="card card-side items-center">
            <NuxtLink to="/edit-account">
               <button class="btn btn-info btn-sm me-2"><img src="~/assets/icons/edit.png" class="w-4"></button>
            </NuxtLink>
               <button class="btn btn-error btn-sm"><img src="~/assets/icons/delete.png" class="w-4"></button>
         </div>         
      </div>

   </div>
</template>