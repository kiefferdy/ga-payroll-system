<template>
   <Title>Admin - Create Account</Title>
   <div class="card text-black flex justify-center h-[30rem] w-[35rem]">
      <h1 class="card-title mb-5">Create Account</h1>
      <div class="card card-side justify-between">
         <div>
            <label class="label-text text-black mt-4 font-bold">First Name*<br></label>
            <input v-model="firstName" type="text" class="input input-sm border-dark_green bg-primary_white rounded w-64" required>
         </div>
         <div>
            <label class="label-text text-black mt-4 font-bold">Last Name*<br></label>
            <input v-model="lastName" type="text" class="input input-sm border-dark_green bg-primary_white rounded w-64" required>
         </div>
      </div>
      <div class="mt-5">
         <label class="label-text text-black mt-4 font-bold">Email*<br></label>
         <input v-model="email" type="email" class="input input-sm border-dark_green bg-primary_white rounded w-full" required>
      </div>
      <div class="mt-5">
         <label class="label-text text-black mt-4 font-bold">Password*<br></label>
         <input v-model="password" @input="validatePasswordOnChange" type="password" class="input input-sm border-dark_green bg-primary_white rounded w-full" required>
         <!-- Password strength indicator -->
         <div v-if="password" class="mt-2">
            <div class="text-xs mb-1">Password Strength: 
               <span :class="passwordStrengthClass">{{ passwordStrength }}</span>
            </div>
            <div class="w-full bg-gray-200 rounded-full h-1">
               <div :class="passwordProgressClass" :style="{ width: passwordProgressWidth }" class="h-1 rounded-full transition-all duration-300"></div>
            </div>
         </div>
         <!-- Password requirements -->
         <div v-if="password && passwordErrors.length > 0" class="mt-2">
            <p class="text-xs text-gray-600 mb-1">Password must include:</p>
            <ul class="text-xs">
               <li v-for="error in passwordErrors" :key="error" class="text-red-500">• {{ error }}</li>
            </ul>
         </div>
      </div>
      <div class="mt-5">
         <label class="label-text text-black mt-4 font-bold">Confirm Password*<br></label>
         <input v-model="verifyPassword" type="password" class="input input-sm border-dark_green bg-primary_white rounded w-full" required>
      </div>
      <div class="mt-5">
         <input v-model="needsOTP" type="checkbox" class="text-black"> Needs OTP to Login?
      </div>
      <div class="self-end">
         <NuxtLink to="/employees">
            <button class="btn btn-ghost rounded-full btn-sm bg-dark_gray text-white ml-10 mr-1 px-5">Cancel</button>
         </NuxtLink>
         <button @click="handleSignUp" class="btn btn-ghost rounded-full btn-sm bg-button_green text-white m-1">Continue</button>
      </div>
      <div v-if="loadingNotif" class="mt-2 self-center success">Creating the new user...</div>
      <div v-if="registerSuccess" class="mt-2 self-center success">Success!</div>
      <div v-if="invalidEmail" class="mt-2 self-center error">Please enter a valid email address.</div>
      <div v-if="passwordsNotMatch" class="mt-2 self-center error">The passwords do not match.</div>
      <div v-if="passwordComplexityError" class="mt-2 self-center error">Password does not meet complexity requirements.</div>
      <div v-if="incompleteFields" class="mt-2 self-center error">Please fill all fields before proceeding.</div>
      <div v-if="emailTaken" class="mt-2 self-center error">The entered email address is already taken.</div>
      <div v-if="insertionError" class="mt-2 self-center error">A database error occurred! Please try again.</div>
      <div v-if="genericError" class="mt-2 self-center error">An error occurred!</div>
   </div>
</template>

<style scoped>
   .error {
      color: red;
   }

   .success {
      color: green;
   }
</style>

<script setup>

   import { ref, computed } from 'vue';
   import { useRouter } from 'vue-router';
   import { 
      validatePasswordComplexity, 
      validateEmail, 
      sanitizeInput,
      logSecurityEvent
   } from '~/utils/security';

   const supabase = useSupabaseClient();
   const router = useRouter();

   // Form fields
   const firstName = ref('');
   const lastName = ref('');
   const email = ref('');
   const password = ref('');
   const verifyPassword = ref('');
   const needsOTP = ref(false);

   // Password validation
   const passwordErrors = ref([]);
   const passwordStrength = ref('');

   // Notifs
   const loadingNotif = ref(false);
   const registerSuccess = ref(false);
   const invalidEmail = ref(false);
   const passwordsNotMatch = ref(false);
   const passwordComplexityError = ref(false);
   const incompleteFields = ref(false);
   const emailTaken = ref(false);
   const insertionError = ref(false);
   const genericError = ref(false);

   // Password strength styling
   const passwordStrengthClass = computed(() => {
      switch (passwordStrength.value) {
         case 'WEAK': return 'text-red-500';
         case 'MEDIUM': return 'text-yellow-500';
         case 'STRONG': return 'text-green-500';
         default: return 'text-gray-500';
      }
   });

   const passwordProgressClass = computed(() => {
      switch (passwordStrength.value) {
         case 'WEAK': return 'bg-red-500';
         case 'MEDIUM': return 'bg-yellow-500';
         case 'STRONG': return 'bg-green-500';
         default: return 'bg-gray-300';
      }
   });

   const passwordProgressWidth = computed(() => {
      switch (passwordStrength.value) {
         case 'WEAK': return '33%';
         case 'MEDIUM': return '66%';
         case 'STRONG': return '100%';
         default: return '0%';
      }
   });

   // Validate password as user types
   async function validatePasswordOnChange() {
      if (password.value) {
         const validation = await validatePasswordComplexity(password.value);
         passwordErrors.value = validation.errors;
         passwordStrength.value = validation.strength;
      } else {
         passwordErrors.value = [];
         passwordStrength.value = '';
      }
   }

   const handleSignUp = async () => {
      // Verification of user input
      clearNotifs();
      await validateInputs();
      
      if (invalidEmail.value || passwordsNotMatch.value || passwordComplexityError.value || incompleteFields.value) {
         return;
      }

      try {
         const { data: { user } } = await supabase.auth.getUser();
         
         if (!user) {
            genericError.value = true;
            return;
         }

         // Page already protected by auth middleware with USERS_CREATE permission

         loadingNotif.value = true;

         // Sanitize inputs
         const cleanEmail = sanitizeInput(email.value.toLowerCase(), 255);
         const cleanFirstName = sanitizeInput(firstName.value, 100);
         const cleanLastName = sanitizeInput(lastName.value, 100);

         // Sending create user request to server
         const response = await fetch('/api/create-user', {
            method: 'POST',
            headers: {
               'Content-Type': 'application/json'
            },
            body: JSON.stringify({ 
               email: cleanEmail,
               password: password.value,
               userId: user.id
            })
         });

         const result = await response.json();
         if (!(result.status >= 200 && result.status <= 299)) {
            if (result.body.error?.message.includes('A user with this email')) {
               emailTaken.value = true;
               
               // Log account creation attempt with duplicate email
               await logSecurityEvent({
                  eventType: 'ACCOUNT_CREATION_FAILED',
                  userId: user.id,
                  userEmail: user.email,
                  details: { 
                     reason: 'Duplicate email',
                     attemptedEmail: cleanEmail,
                     performedBy: user.email
                  },
                  severity: 'MEDIUM'
               });
               
               return;
            } else {
               genericError.value = true;
               console.error(result);
               return;
            }
         }

         const newUserId = result.body.data.user.id;
         clearNotifs();

         // Update the Employee record created by the trigger with user details
         const { error: updateError } = await supabase
            .from('Employees')
            .update({ 
               first_name: cleanFirstName,
               last_name: cleanLastName,
               requires_otp: needsOTP.value,
               last_updated: new Date()
            })
            .eq('id', newUserId);

         if (updateError) {
            loadingNotif.value = false;
            insertionError.value = true;
            console.error('Error updating Employee record:', updateError);
            
            // Log database update error
            await logSecurityEvent({
               eventType: 'DATABASE_ERROR',
               userId: user.id,
               userEmail: user.email,
               details: { 
                  operation: 'Employee record update',
                  error: updateError.message,
                  newUserId
               },
               severity: 'HIGH'
            });
            
            return;
         }

         // Log successful account creation
         await logSecurityEvent({
            eventType: 'ACCOUNT_CREATED',
            userId: user.id,
            userEmail: user.email,
            details: { 
               newUserId,
               newUserEmail: cleanEmail,
               newUserName: `${cleanFirstName} ${cleanLastName}`,
               requiresOTP: needsOTP.value,
               createdBy: user.email
            },
            severity: 'LOW'
         });

         loadingNotif.value = false;
         registerSuccess.value = true;
         alert('Account created successfully!');
         router.push('/employees');
         
      } catch (err) {
         console.error(err);
         loadingNotif.value = false;
         genericError.value = true;
         
         // Log unexpected error
         const { data: { user } } = await supabase.auth.getUser();
         await logSecurityEvent({
            eventType: 'ACCOUNT_CREATION_ERROR',
            userId: user?.id,
            userEmail: user?.email,
            details: { 
               error: err instanceof Error ? err.message : 'Unknown error'
            },
            severity: 'HIGH'
         });
      }
   };

   async function validateInputs() {
      // Validate email
      invalidEmail.value = !validateEmail(email.value);
      
      // Validate password match
      passwordsNotMatch.value = password.value !== verifyPassword.value;
      
      // Validate password complexity
      const passwordValidation = await validatePasswordComplexity(password.value);
      passwordComplexityError.value = !passwordValidation.valid;
      
      // Check for incomplete fields
      incompleteFields.value = !firstName.value.trim() || !lastName.value.trim() || 
                               !email.value.trim() || !password.value || !verifyPassword.value;

      // Log validation failures for security monitoring
      const { data: { user } } = await supabase.auth.getUser();
      
      if (invalidEmail.value) {
         await logSecurityEvent({
            eventType: 'INPUT_VALIDATION_FAILED',
            userId: user?.id,
            userEmail: user?.email,
            details: { field: 'email', validationType: 'format', value: email.value.substring(0, 30) },
            severity: 'LOW'
         });
      }
      
      if (passwordComplexityError.value) {
         await logSecurityEvent({
            eventType: 'INPUT_VALIDATION_FAILED',
            userId: user?.id,
            userEmail: user?.email,
            details: { field: 'password', validationType: 'complexity', errors: passwordValidation.errors },
            severity: 'MEDIUM'
         });
      }
   }

   // Clears all error notifications
   function clearNotifs() {
      invalidEmail.value = false;
      passwordsNotMatch.value = false;
      passwordComplexityError.value = false;
      incompleteFields.value = false;
      emailTaken.value = false;
      insertionError.value = false;
      genericError.value = false;
      registerSuccess.value = false;
      loadingNotif.value = false;
   }

   // Page is already protected by auth middleware with USERS_CREATE permission
   // No additional client-side verification needed

</script>