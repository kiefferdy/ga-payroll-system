<template>
   <div class="card card-side h-[37rem] w-[65rem] bg-dark_green text-black">
      <div class="card h-[37rem] w-[55rem] bg-primary_white rounded rounded-l-[1rem] rounded-tr-[0rem] rounded-br-[1rem]">
         <div class="card card-side  mx-10 mt-5 justify-between">
            <div class="join">
               <input type="text" placeholder="Search..." class="input input-sm bg-primary_white border-search_stroke_gray rounded rounded-l-full w-60"/>
               <button class="btn btn-sm btn-ghost bg-dark_green w-10 rounded rounded-r-full btn-round"><img src="~/assets/icons/search.png"></button>
            </div>
            <div>
               <NuxtLink to="/create-account"><button class="btn btn-sm bg-dark_green btn-ghost text-white rounded-full capitalize"><img src="~/assets/icons/add.png" class="w-4">Add Account</button></NuxtLink>
            </div> 
         </div>
         <div>
            <ProfileCard/>
            <ProfileCard/>
            <ProfileCard/>
            <ProfileCard/>
         </div>
      </div>
      <ul class="menu w-[10rem] p-0 font-bold text-white justify-between">
         <div>
            <li class="active bg-primary_white rounded-r-[1rem] py-2 items-center text-black"><NuxtLink to="/employees">Employees</NuxtLink></li>
            <li class="py-2 items-center"><NuxtLink>Records</NuxtLink></li>
            <li class="py-2 items-center"><NuxtLink>Settings</NuxtLink></li>         
         </div>
         <div class="self-end mb-1">
            <button class="font-bold btn btn-sm btn-ghost btn-circle w-28">Logout<img class="mx-2 w-4 h-4" src="~/assets/icons/exit_white.png"></button>
         </div>
      </ul>
   </div>
</template>