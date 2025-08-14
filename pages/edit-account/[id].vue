<template>
   <Title>Admin - Edit Account</Title>
   <div v-if="accessDenied" class="min-h-screen bg-primary_white flex items-center justify-center">
      <div class="max-w-md mx-auto p-6 bg-red-50 border border-red-200 rounded-xl">
         <div class="flex items-center mb-4">
            <svg class="w-6 h-6 text-red-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
               <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <h3 class="text-lg font-semibold text-red-800">Access Denied</h3>
         </div>
         <p class="text-red-700 mb-4">You don't have permission to edit employee information. Contact an administrator for access.</p>
         <NuxtLink to="/employees">
            <button class="btn bg-dark_green hover:bg-button_green text-white border-none">
               Back to Employees
            </button>
         </NuxtLink>
      </div>
   </div>
   <div v-else class="card text-black flex justify-center h-[30rem] w-[35rem]">
      <h1 class="card-title mb-5">Edit Account of {{ firstName }} {{ lastName }}</h1>
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
         <label class="label-text text-black mt-4 font-bold">Password<br></label>
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
         <label class="label-text text-black mt-4 font-bold">Confirm Password<br></label>
         <input v-model="verifyPassword" type="password" class="input input-sm border-dark_green bg-primary_white rounded w-full" required>
      </div>
      <div class="mt-5">
         <input v-model="needsOTP" type="checkbox" class="text-black"> Needs OTP to Login?
      </div>
      <div class="self-end">
         <NuxtLink to="/employees">
            <button class="btn btn-ghost rounded-full btn-sm bg-dark_gray text-white ml-10 mr-1 px-5">Cancel</button>
         </NuxtLink>
         <button @click="handleEdit" class="btn btn-ghost rounded-full btn-sm bg-button_green text-white m-1">Continue</button>
      </div>
      <div v-if="loadingNotif" class="mt-2 self-center success">Editing user details...</div>
      <div v-if="editSuccess" class="mt-2 self-center success">Success!</div>
      <div v-if="invalidEmail" class="mt-2 self-center error">Please enter a valid email address.</div>
      <div v-if="passwordsNotMatch" class="mt-2 self-center error">The passwords do not match.</div>
      <div v-if="passwordComplexityError" class="mt-2 self-center error">Password does not meet complexity requirements.</div>
      <div v-if="incompleteFields" class="mt-2 self-center error">Please fill all required fields before proceeding.</div>
      <div v-if="emailTaken" class="mt-2 self-center error">The entered email address is already taken.</div>
      <div v-if="insertionError" class="mt-2 self-center error">A database error occurred! Please try again.</div>
      <div v-if="genericError" class="mt-2 self-center error">An error occurred!</div>
      <div v-if="accessDenied" class="mt-2 self-center error">Access denied - insufficient permissions!</div>
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
   import { useRoute } from 'vue-router';
   import { 
      validatePasswordComplexity, 
      sanitizeInput,
      logSecurityEvent
   } from '~/utils/security';

   const supabase = useSupabaseClient();
   const router = useRouter();
   const route = useRoute();

   // Permission management
   const { hasPermission } = usePermissions();
   const canUpdateUsers = ref(false);

   // Notifs
   const loadingNotif = ref(false);
   const editSuccess = ref(false);
   const invalidEmail = ref(false);
   const passwordsNotMatch = ref(false);
   const passwordComplexityError = ref(false);
   const incompleteFields = ref(false);
   const emailTaken = ref(false);
   const insertionError = ref(false);
   const genericError = ref(false);
   const accessDenied = ref(false);

   // Password validation
   const passwordErrors = ref([]);
   const passwordStrength = ref('');

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

   const fetchUserEmail = async (uuid) => {
      const { data: { user } } = await supabase.auth.getUser();  // Get the user performing the action
      const response = await fetch('/api/get-user', {
         method: 'POST',
         headers: {
            'Content-Type': 'application/json'
         },
         body: JSON.stringify({ 
            targetId: uuid,
            userId: user.id
         })
      });

      const result = await response.json();
      if (!response.ok) {
         console.error('Error fetching target user:', result.body.error?.message);
         return null;
      }
      
      return result.body.data.user ? result.body.data.user.email : null;
   };

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

   const handleEdit = async () => {
      // Check permission first
      if (!canUpdateUsers.value) {
         accessDenied.value = true;
         return;
      }

      // Verification of user input
      clearNotifs();
      await validateInputs();
      if (invalidEmail.value || passwordsNotMatch.value || passwordComplexityError.value || incompleteFields.value) {
         return;
      }

      try {
         const { data: { user } } = await supabase.auth.getUser();  // Get the user performing the action
         
         if (!user) {
            genericError.value = true;
            return;
         }

         // Page already protected by auth middleware with USERS_UPDATE permission

         loadingNotif.value = true;

         // Sanitize inputs
         const cleanEmail = sanitizeInput(email.value.toLowerCase(), 255);
         const cleanFirstName = sanitizeInput(firstName.value, 100);
         const cleanLastName = sanitizeInput(lastName.value, 100);

         // Sending edit user request to server
         const response = await fetch('/api/edit-user', {
            method: 'POST',
            headers: {
               'Content-Type': 'application/json'
            },
            body: JSON.stringify({ 
               email: cleanEmail,
               password: password.value,
               targetId: employee.id,
               userId: user.id
            })
         });

         const result = await response.json();
         if (!(result.status >= 200 && result.status <= 299)) {
            if (result.body.error?.message.includes('duplicate key value')) {
               emailTaken.value = true;
               
               // Log account edit attempt with duplicate email
               await logSecurityEvent({
                  eventType: 'ACCOUNT_EDIT_FAILED',
                  userId: user.id,
                  userEmail: user.email,
                  details: { 
                     reason: 'Duplicate email',
                     attemptedEmail: cleanEmail,
                     targetUserId: targetId,
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

         const editedUserId = targetId;
         clearNotifs();

         // Update the Employee record with sanitized data
         const { error: updateError } = await supabase
            .from('Employees')
            .update({ 
               first_name: cleanFirstName,
               last_name: cleanLastName,
               requires_otp: needsOTP.value,
               last_updated: new Date()
            })
            .eq('id', editedUserId);

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
                  targetUserId: editedUserId
               },
               severity: 'HIGH'
            });
            
            return;
         }

         // Log successful account edit
         await logSecurityEvent({
            eventType: 'ACCOUNT_EDITED',
            userId: user.id,
            userEmail: user.email,
            details: { 
               targetUserId: editedUserId,
               targetUserEmail: cleanEmail,
               targetUserName: `${cleanFirstName} ${cleanLastName}`,
               requiresOTP: needsOTP.value,
               editedBy: user.email
            },
            severity: 'LOW'
         });

         loadingNotif.value = false;
         editSuccess.value = true;
         alert('User edited successfully!');
         router.push('/employees');
      } catch (err) {
         console.error(err);
         loadingNotif.value = false;
         genericError.value = true;
         
         // Log unexpected error
         const { data: { user } } = await supabase.auth.getUser();
         await logSecurityEvent({
            eventType: 'ACCOUNT_EDIT_ERROR',
            userId: user?.id,
            userEmail: user?.email,
            details: { 
               error: err instanceof Error ? err.message : 'Unknown error',
               targetUserId: targetId
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
      incompleteFields.value = !firstName.value || !lastName.value || !email.value;

      // Log validation failures for security monitoring
      const { data: { user } } = await supabase.auth.getUser();
      
      if (invalidEmail.value) {
         await logSecurityEvent({
            eventType: 'INPUT_VALIDATION_FAILED',
            userId: user?.id,
            userEmail: user?.email,
            details: { 
               field: 'email', 
               validationType: 'format', 
               value: email.value.substring(0, 30),
               targetUserId: targetId,
               operation: 'admin_edit_account'
            },
            severity: 'LOW'
         });
      }
      
      if (passwordComplexityError.value) {
         await logSecurityEvent({
            eventType: 'INPUT_VALIDATION_FAILED',
            userId: user?.id,
            userEmail: user?.email,
            details: { 
               field: 'password', 
               validationType: 'complexity', 
               errors: passwordValidation.errors,
               targetUserId: targetId,
               operation: 'admin_edit_account'
            },
            severity: 'MEDIUM'
         });
      }
   }

   function validateEmail(email) {
      const regex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      return regex.test(email);
   }

   // Clears all error notifications
   function clearNotifs() {
      invalidEmail.value = false;
      passwordsNotMatch.value = false;
      passwordComplexityError.value = false;
      incompleteFields.value = false;
      emailTaken.value = false;
      genericError.value = false;
   }

   // Check user permissions
   const checkUserPermissions = async () => {
      canUpdateUsers.value = await hasPermission('users.update');
      if (!canUpdateUsers.value) {
         accessDenied.value = true;
      }
   };

   // Check permissions first
   await checkUserPermissions();

   // Fetch employee info from database (only if user has permission)
   const targetId = route.params.id;
   let userEmail = '';
   let employee = null;

   if (canUpdateUsers.value) {
      userEmail = await fetchUserEmail(targetId);
      const { data: employeeData, error } = await supabase
         .from('Employees')
         .select('*')
         .eq('id', targetId)
         .single();

      if (error) {
         console.error('Error fetching target user from database:', error);
      } else {
         employee = employeeData;
      }
   }

   // Form fields
   const firstName = ref(employee?.first_name || '');
   const lastName = ref(employee?.last_name || '');
   const email = ref(userEmail);
   const password = ref('');
   const verifyPassword = ref('');
   const needsOTP = ref(employee?.requires_otp || false);
   // Rank removed - now managed through roles system

</script>