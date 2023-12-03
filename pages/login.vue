<template>
   <Title>Green Atwork - Login</Title>
   <div class="card card-side h-[30rem] w-[60rem]">
      <div class="card-body">
         <h1 class="card-title text-black">Account Login</h1>

         <label class="label-text text-black mt-4">Email</label>
         <input v-model="email" type="text" class="input-s border-2 border-primary_green bg-primary_white rounded w-72 text-black" required>
         
         <label class="label-text text-black mt-4">Password</label>
         <input :type="passwordFieldType" v-model="password" class="input-s border-2 border-primary_green bg-primary_white rounded w-72 text-black" required>
         
         <div class="text-black"><input @click="hidePassword = !hidePassword" type="checkbox"> Show Password</div>
         <div class="card-actions">
            <button @click="signIn" class="btn btn-xs mt-3 rounded-full text-white bg-button_green btn-ghost w-24">Login</button>
         </div>
         <div v-if="wrong" class="error">Incorrect email or password</div>
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

<script setup>

   import { useRouter } from 'vue-router';

   const router = useRouter();
   const supabase = useSupabaseClient();

   const email = ref("");
   const hidePassword = ref(true);
   const password = ref("");
   const wrong = ref(false);

   const passwordFieldType = computed(() => hidePassword.value ? "password" : "text");

   async function signIn() {

      try {
         const { error } = await supabase.auth.signInWithPassword({
            email: email.value,
            password: password.value,
         });

         if (error) {
            console.error("Sign in error:", error);
            wrong.value = true;

         } else {
            wrong.value = false;

            const { data: { user } } = await supabase.auth.getUser();  // Get the current user
            console.log("Retrieved user:", user);

            if(user) {

               const { data, error } = await supabase
                  .from('Employees')
                  .select('time_in_status') // Checks whether the user is timed-in or not
                  .eq('id', user.id);

               if(error) {
                  console.log("Error fetching data from Supabase:", error);
                  router.push('/');
               } else if(data && data.length > 0) {
                  const timeInStatus = `${data[0].time_in_status}`;
                  if(timeInStatus == 'true') {
                     router.push('/clock-out'); // Redirect to time-out page if user is timed-in
                  } else {
                     router.push('/'); // Redirect to time-in page if user is timed-out
                  }
               } else {
                  console.log("No data returned from Supabase.");
                  router.push('/');
               }
               
            } else {
               console.log("Error fetching current user data.")
            }
         }

      } catch (error) {
         wrong.value = true
         console.error("Error signing in:", error);
      }
   }

</script>