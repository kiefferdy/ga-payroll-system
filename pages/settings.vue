<template>
   <Title>Admin</Title>
    <div class="card card-side h-[37rem] w-[65rem] bg-dark_green text-black">
       <div class="card h-[37rem] w-[55rem] bg-primary_white rounded rounded-l-[1rem] rounded-tr-[0rem] rounded-br-[1rem]">
          <div class="card card-side  mx-10 mt-5 justify-between">
          </div>
          <div class="mt-10 ml-20">
             <label for="company-email" class="mt-4 ml-4">Company Email: </label>
             <br>
             <input id="company-email" type="text" placeholder="Email" class="input input-sm bg-primary_white border-2 border-search_stroke_gray text-black rounded w-60 ml-4 mb-4">
             <br>
             <label class="mt-4 ml-4">Company Password: </label>
             <br>
             <input :type="passwordFieldType" type="text" placeholder="Password" class="input input-sm bg-primary_white border-2 border-search_stroke_gray text-black rounded w-60 ml-4" v-model="password" />
             <br>
             <input type="checkbox" @click="hidePassword = !hidePassword" class="ml-4 mt-3" />Show Password
             <br>
             <button class="btn btn-sm bg-dark_green btn-ghost text-white rounded-full capitalize w-60 mt-4 ml-4">Save Changes</button>
          </div>
       </div>
       <ul class="menu w-[10rem] p-0 font-bold text-white justify-between">
          <div>
             <li class="py-2 items-center"><NuxtLink to="/employees">Employees</NuxtLink></li>
             <li class="py-2 items-center"><NuxtLink to="/records">Records</NuxtLink></li>
             <li class="active bg-primary_white rounded-r-[1rem] py-2 items-center text-black"><NuxtLink to="/settings">Settings</NuxtLink></li>         
          </div>
          <div class="self-end mb-1">
             <button class="font-bold btn btn-sm btn-ghost btn-circle w-28">Logout<img class="mx-2 w-4 h-4" src="~/assets/icons/exit_white.png"></button>
          </div>
       </ul>
    </div>
</template>

<script setup>
  const hidePassword = ref(true);
  const password = ref("");

  const passwordFieldType = computed(() => hidePassword.value ? "password" : "text");
</script>