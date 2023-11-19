<template>
   <div class="card text-black flex justify-center h-[30rem] w-[35rem]">
      <h1 class="card-title mb-5">Create Account</h1>
      <div class="card card-side justify-between">
         <div>
            <label class="label-text text-black mt-4 font-bold">First Name<br></label>
            <input type="text" class="input input-sm border-dark_green bg-primary_white rounded w-64" required>
         </div>
         <div>
            <label class="label-text text-black mt-4 font-bold">Last Name<br></label>
            <input type="text" class="input input-sm border-dark_green bg-primary_white rounded w-64" required>
         </div>
      </div>
      <div class="mt-5">
         <label class="label-text text-black mt-4 font-bold">Email<br></label>
         <input type="email" class="input input-sm border-dark_green bg-primary_white rounded w-full" required>
      </div>
      <div class="mt-5">
         <label class="label-text text-black mt-4 font-bold">Password<br></label>
         <input type="text" class="input input-sm border-dark_green bg-primary_white rounded w-full" required>
      </div>
      <div class="mt-5">
         <label class="label-text text-black mt-4 font-bold">Confirm Password<br></label>
         <input type="password" class="input input-sm border-dark_green bg-primary_white rounded w-full" required>
      </div>
      <div class="mt-5">
         <input type="checkbox" class="text-black"> Needs OTP to Login?
      </div>
      <div class="self-end">
         <NuxtLink to="/employees"><button class="btn btn-ghost rounded-full btn-sm bg-dark_gray text-white ml-10 mr-1 px-5">Cancel</button></NuxtLink>
         <button class="btn btn-ghost rounded-full btn-sm bg-button_green text-white m-1">Conitnue</button>
      </div>
      <div v-if="wrong" class="mt-2 self-center error">Email is Invalid</div>
      <div v-if="wrong" class="mt-2 self-center error">Passwords do not match</div>
      <div v-if="wrong" class="mt-2 self-center error">Please fill all fields before proceeding</div>
      <div v-if="wrong" class="mt-2 self-center error">Email is already taken</div>
   </div>
</template>

<style scoped>
.error {
  color: red;
}
</style>

<script>


</script>