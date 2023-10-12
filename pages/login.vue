<template>
   <!-- 
      TODO:
      Implement preloader
    -->
   <div class="flex flex-row justify-center py-32">
      <div >
         <h1 class="text-2xl mb-6">Account Login</h1>
         <label class="font-bold">Username<br></label>
         <input v-model="email" type="text" class="w-full bg-off_white border-button_green border-b-2 mb-6 px-2 py-1" required> <!-- TODO: must use v-model, check nuxt docs for aid-->
         
         <label class="font-bold pt-">Password<br></label>
         <input v-model="password" type="password" class="w-full bg-off_white border-button_green border-b-2 mb-8 px-2 py-1" required>  <!-- TODO: must use v-model, check nuxt docs for aid-->

         <button @click="signIn" class="bg-button_green rounded-full px-8 py-0.5 font-bold text-white">LOGIN</button> <!-- TODO: Check if user exists, if user exists it will redirect to clock in page, else must show error message-->
         <div v-if="wrong" class="error">Email or Passowrd is Incorrect</div>
      </div>
      <div class="bg-search_text_gray ps-0.5 mx-10 shadow">
      </div>
      <div class="">
         <img src="~assets/images/logo.png" class="w-80">
      </div>
   </div>

</template>

<style scoped>
.error {
  color: red;
}
</style>

<script setup lang="ts">

const supabase = useSupabaseClient();

const email = ref("");
const password = ref("");
const wrong = ref(false);
async function signIn() {
try {
const { data, error } = await supabase.auth.signInWithPassword({
email: email.value,
password: password.value,
}
);

if (error) {
console.error("Sign in error:", error);
wrong.value = true
} else {
wrong.value = false
console.log("Sign in successful:", data);
navigateTo('/Profile')
// Do something with the authenticated user data if needed.
}

} catch (error) {
wrong.value = true
console.error("Error signing in:", error);
}
}
// TODO:
// Async search database for existing user
</script>
