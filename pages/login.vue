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
            <button @click="signIn" :disabled="isLoading" class="btn btn-xs mt-3 rounded-full text-white bg-button_green btn-ghost w-24">
               <span v-if="isLoading" class="loading loading-spinner loading-xs"></span>
               <span v-else>Login</span>
            </button>
         </div>
         
         <!-- Forgot Password Link -->
         <div class="mt-2">
            <NuxtLink to="/reset-password" class="text-sm text-primary_green hover:underline">
               Forgot your password?
            </NuxtLink>
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
   import { logAuthenticationAttempt, validateEmail, sanitizeInput } from '~/utils/security';

   const router = useRouter();
   const supabase = useSupabaseClient();

   const email = ref("");
   const hidePassword = ref(true);
   const password = ref("");
   const wrong = ref(false);
   const isLoading = ref(false);

   const passwordFieldType = computed(() => hidePassword.value ? "password" : "text");

   async function signIn() {
      if (isLoading.value) return;

      // Input validation
      if (!email.value.trim() || !password.value) {
         wrong.value = true;
         return;
      }

      // Validate email format
      if (!validateEmail(email.value)) {
         wrong.value = true;
         return;
      }

      // Sanitize inputs
      const cleanEmail = sanitizeInput(email.value.toLowerCase(), 255);
      const cleanPassword = password.value;

      isLoading.value = true;

      try {
         const { error } = await supabase.auth.signInWithPassword({
            email: cleanEmail,
            password: cleanPassword,
         });

         if (error) {
            // Log failed authentication attempt
            await logAuthenticationAttempt(
               'LOGIN_FAILED',
               cleanEmail,
               undefined,
               undefined,
               navigator.userAgent,
               { errorMessage: error.message }
            );

            wrong.value = true;
            
         } else {
            const { data: { user } } = await supabase.auth.getUser();

            if(user) {
               // Log successful authentication
               await logAuthenticationAttempt(
                  'LOGIN_SUCCESS',
                  user.email || cleanEmail,
                  user.id,
                  undefined,
                  navigator.userAgent
               );

               wrong.value = false;

               const { data, error } = await supabase
                  .from('Employees')
                  .select('time_in_status, first_name, last_name')
                  .eq('id', user.id);

               if(error) {
                  console.error("Error fetching employee data:", error);
                  router.push('/');
               } else if(data && data.length > 0) {
                  const timeInStatus = `${data[0].time_in_status}`;
                  if(timeInStatus == 'true') {
                     router.push('/clock-out');
                  } else {
                     router.push('/');
                  }
               } else {
                  console.error("Employee record not found for user");
                  router.push('/');
               }
            } else {
               console.error("Failed to retrieve user data after login");
               wrong.value = true;
            }
         }

      } catch (error) {
         // Log authentication error
         await logAuthenticationAttempt(
            'LOGIN_FAILED',
            cleanEmail,
            undefined,
            undefined,
            navigator.userAgent,
            { error: error instanceof Error ? error.message : 'Unknown error' }
         );

         wrong.value = true;
         console.error("Error signing in:", error);
      } finally {
         isLoading.value = false;
      }
   }

</script>