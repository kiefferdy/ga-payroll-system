<template>
   <Title>Green Atwork - Login</Title>
   <div class="min-h-screen flex items-center justify-center px-4 py-8">
      <div class="card card-side min-h-[30rem] w-full max-w-5xl relative">
         <div class="card-body relative p-8">
            <div class="login-form space-y-4">
               <h1 class="card-title text-black text-2xl mb-6">Account Login</h1>

               <div class="form-control">
                  <label class="label-text text-black mb-2 block">Email</label>
                  <input v-model="email" type="text" class="input-s border-2 border-primary_green bg-primary_white rounded w-full max-w-sm p-3 text-black" required>
               </div>
               
               <div class="form-control">
                  <label class="label-text text-black mb-2 block">Password</label>
                  <input :type="passwordFieldType" v-model="password" class="input-s border-2 border-primary_green bg-primary_white rounded w-full max-w-sm p-3 text-black" required>
               </div>
               
               <div class="form-control">
                  <label class="text-black flex items-center cursor-pointer">
                     <input @click="hidePassword = !hidePassword" type="checkbox" class="mr-2"> 
                     <span>Show Password</span>
                  </label>
               </div>
               
               <div class="card-actions mt-6">
                  <button @click="signIn" :disabled="isLoading" class="btn btn-sm rounded-full text-white bg-button_green hover:bg-green-700 px-8 py-2">
                     <span v-if="isLoading">Logging in...</span>
                     <span v-else>Login</span>
                  </button>
               </div>
               
               <div class="mt-4">
                  <NuxtLink to="/password-reset" class="text-sm text-blue-600 hover:text-blue-800 underline">
                     Forgot your password?
                  </NuxtLink>
               </div>
            </div>
            
            <div v-if="wrong" class="error-container">
               <div class="error-message">{{ errorMessage || 'Invalid username and/or password' }}</div>
            </div>
         </div>
         <div class="divider divider-horizontal"></div>
         <figure class="flex-shrink-0 p-8">
            <img src="~assets/images/logo.png" class="w-80 max-w-full h-auto">
         </figure>
      </div>
   </div>
</template>

<style scoped>
   .error-container {
      position: absolute;
      bottom: 1rem;
      left: 1rem;
      right: 1rem;
      max-width: 18rem;
   }
   
   .error-message {
      color: #dc2626;
      background-color: #fef2f2;
      border: 1px solid #fecaca;
      padding: 0.75rem;
      border-radius: 0.375rem;
      font-size: 0.875rem;
      line-height: 1.4;
      word-wrap: break-word;
      hyphens: auto;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
   }
</style>

<script setup>

   import { useRouter } from 'vue-router';
   import { getGenericAuthError, validateEmail } from '~/utils/passwordSecurity.js';

   const router = useRouter();
   const supabase = useSupabaseClient();

   const email = ref("");
   const hidePassword = ref(true);
   const password = ref("");
   const wrong = ref(false);
   const errorMessage = ref("");
   const isLoading = ref(false);

   const passwordFieldType = computed(() => hidePassword.value ? "password" : "text");

   async function signIn() {
      if (isLoading.value) return; // Prevent double submission

      // Clear previous errors
      wrong.value = false;
      errorMessage.value = "";
      isLoading.value = true;

      try {
         // Basic client-side validation
         const emailValidation = validateEmail(email.value);
         if (!emailValidation.isValid) {
            errorMessage.value = getGenericAuthError(); // Don't reveal specific validation issues
            wrong.value = true;
            isLoading.value = false;
            return;
         }

         if (!password.value) {
            errorMessage.value = getGenericAuthError();
            wrong.value = true;
            isLoading.value = false;
            return;
         }

         // Call authentication API endpoint instead of direct Supabase auth
         const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: {
               'Content-Type': 'application/json',
            },
            body: JSON.stringify({
               email: email.value,
               password: password.value,
               userAgent: navigator.userAgent,
               // IP address will be captured server-side
            })
         });

         const result = await response.json();

         if (!response.ok) {
            wrong.value = true;
            
            // Check for specific error cases
            if (response.status === 423) {
               // Account locked - show specific message
               errorMessage.value = "Account temporarily locked due to multiple failed login attempts. Please try again later.";
            } else {
               // All other errors - show generic message
               errorMessage.value = getGenericAuthError();
            }
            
            isLoading.value = false;
            return;
         }

         // Login successful - now set the client-side session
         wrong.value = false;

         // Set the Supabase session on the client side
         const { error: sessionError } = await supabase.auth.signInWithPassword({
            email: email.value,
            password: password.value
         });

         if (sessionError) {
            console.error('Error setting client session:', sessionError);
            errorMessage.value = "Login successful but session setup failed. Please try again.";
            wrong.value = true;
            isLoading.value = false;
            return;
         }

         // Update last login information
         await updateLastLogin();

         // Redirect based on user status
         await redirectUserBasedOnStatus();

      } catch (error) {
         console.error("Login error:", error);
         errorMessage.value = "An error occurred during login. Please try again.";
         wrong.value = true;
      } finally {
         isLoading.value = false;
      }
   }

   async function updateLastLogin() {
      try {
         const { data: { user } } = await supabase.auth.getUser();
         if (user) {
            await supabase
               .from('Employees')
               .update({ 
                  last_login_at: new Date().toISOString(),
                  failed_login_attempts: 0 // Reset failed attempts on successful login
               })
               .eq('id', user.id);
         }
      } catch (error) {
         console.error("Error updating last login:", error);
      }
   }

   async function redirectUserBasedOnStatus() {
      try {
         const { data: { user } } = await supabase.auth.getUser();
         
         if (user) {
            const { data, error } = await supabase
               .from('Employees')
               .select('time_in_status, last_login_at')
               .eq('id', user.id);

            if (error) {
               console.error("Error fetching user data:", error);
               router.push('/');
               return;
            }

            if (data && data.length > 0) {
               const timeInStatus = data[0].time_in_status;
               
               if (timeInStatus) {
                  router.push('/clock-out');
               } else {
                  router.push('/');
               }
            } else {
               router.push('/');
            }
         }
      } catch (error) {
         console.error("Error during redirect:", error);
         router.push('/');
      }
   }

</script>