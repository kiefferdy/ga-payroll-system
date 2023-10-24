<template>
   <!-- 
      TODO:
      Implement preloader
    -->

   <div class="card card-side">
      <div class="card-body">
         <h1 class="card-title text-black">Account Login</h1>

         <label class="label-text text-black mt-4">Email</label>
         <input v-model="email" type="text" class="input-s border-2 border-primary_green bg-primary_white rounded w-72" required>
         
         <label class="label-text text-black mt-4">Password</label>
         <input v-model="password" type="password" class="input-s border-2 border-primary_green bg-primary_white rounded w-72" required>
         
         <div class="card-actions">
            <button @click="signIn" class="btn btn-xs mt-4 rounded-full text-white bg-button_green btn-ghost w-24">Login</button>
         </div>
         <div v-if="wrong" class="error">Email or Passowrd is Incorrect</div>
      </div>
      <div class="divider divider-horizontal"></div>
      <figure><img src="~assets/images/logo.png" class="w-80"></figure>
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
