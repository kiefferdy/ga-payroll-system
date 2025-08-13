<template>
   <Title>Account Settings - {{ firstName }}</Title>
   <div class="min-h-screen bg-primary_white">
      <!-- Top Navigation -->
      <div class="bg-dark_green text-white px-6 py-4">
         <div class="flex justify-between items-center">
            <div class="flex items-center space-x-4">
               <NuxtLink to="/" class="flex items-center space-x-2 hover:text-primary_green transition-colors">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                     <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                  <span>Back to Dashboard</span>
               </NuxtLink>
               <div class="border-l border-white/20 h-6"></div>
               <h1 class="text-lg font-semibold">Account Settings</h1>
            </div>
            <button @click="logout" class="flex items-center space-x-2 hover:bg-button_green px-3 py-2 rounded-lg transition-colors">
               <span>Logout</span>
               <img class="w-4 h-4" src="~/assets/icons/exit_white.png">
            </button>
         </div>
      </div>

      <!-- Main Content -->
      <div class="p-6 max-w-7xl mx-auto pb-12">
         <!-- Header Section -->
         <div class="mb-6">
            <p class="text-dark_gray/70">Manage your personal information and security preferences</p>
         </div>

         <!-- Settings Grid -->
         <div class="grid grid-cols-1 xl:grid-cols-2 gap-8">
            <!-- Personal Information Section -->
            <div class="bg-white rounded-xl shadow-sm border border-search_stroke_gray p-6">
               <div class="flex items-center mb-6">
                  <div class="w-10 h-10 bg-dark_green rounded-full flex items-center justify-center mr-3">
                     <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                     </svg>
                  </div>
                  <div>
                     <h2 class="text-xl font-semibold text-dark_gray">Personal Information</h2>
                     <p class="text-sm text-dark_gray/70">Update your name and contact information</p>
                  </div>
               </div>

               <div class="space-y-4">
                  <div>
                     <label for="first-name" class="block text-sm font-medium text-dark_gray mb-2">First Name</label>
                     <input 
                        v-model="firstName" 
                        id="first-name" 
                        type="text" 
                        placeholder="Enter first name" 
                        class="w-full input input-bordered bg-primary_white border-search_stroke_gray focus:border-dark_green"
                     >
                  </div>

                  <div>
                     <label for="middle-name" class="block text-sm font-medium text-dark_gray mb-2">Middle Name</label>
                     <input 
                        v-model="middleName" 
                        id="middle-name" 
                        type="text" 
                        placeholder="Enter middle name (optional)" 
                        class="w-full input input-bordered bg-primary_white border-search_stroke_gray focus:border-dark_green"
                     >
                  </div>

                  <div>
                     <label for="last-name" class="block text-sm font-medium text-dark_gray mb-2">Last Name</label>
                     <input 
                        v-model="lastName" 
                        id="last-name" 
                        type="text" 
                        placeholder="Enter last name" 
                        class="w-full input input-bordered bg-primary_white border-search_stroke_gray focus:border-dark_green"
                     >
                  </div>

                  <div>
                     <label for="email" class="block text-sm font-medium text-dark_gray mb-2">Email Address</label>
                     <input 
                        :value="userEmail" 
                        id="email" 
                        type="email" 
                        readonly
                        class="w-full input input-bordered bg-gray-100 border-search_stroke_gray text-gray-600 cursor-not-allowed"
                     >
                     <p class="text-xs text-gray-500 mt-1">Contact your administrator to change your email address</p>
                  </div>

                  <button @click="updatePersonalInfo" class="btn bg-dark_green hover:bg-button_green text-white border-none w-full">
                     <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                     </svg>
                     Update Personal Information
                  </button>

                  <!-- Success/Failure Notifications -->
                  <div v-if="updatePersonalSuccess" class="alert alert-success">
                     <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                     </svg>
                     <span>Personal information updated successfully!</span>
                  </div>
                  <div v-if="updatePersonalFailure" class="alert alert-error">
                     <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                     </svg>
                     <span>Unable to update personal information!</span>
                  </div>
               </div>
            </div>

            <!-- Security Section -->
            <div class="bg-white rounded-xl shadow-sm border border-search_stroke_gray p-6">
               <div class="flex items-center mb-6">
                  <div class="w-10 h-10 bg-dark_green rounded-full flex items-center justify-center mr-3">
                     <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                     </svg>
                  </div>
                  <div>
                     <h2 class="text-xl font-semibold text-dark_gray">Security Settings</h2>
                     <p class="text-sm text-dark_gray/70">Manage your password and authentication preferences</p>
                  </div>
               </div>

               <div class="space-y-4">
                  <div>
                     <label for="new-password" class="block text-sm font-medium text-dark_gray mb-2">New Password</label>
                     <input 
                        v-model="newPassword" 
                        @input="validatePasswordOnChange"
                        id="new-password" 
                        :type="hidePassword ? 'password' : 'text'" 
                        placeholder="Enter new password" 
                        class="w-full input input-bordered bg-primary_white border-search_stroke_gray focus:border-dark_green"
                     >
                     <div class="flex items-center mt-2">
                        <input type="checkbox" id="show-password" @click="hidePassword = !hidePassword" class="checkbox checkbox-sm mr-2" />
                        <label for="show-password" class="text-sm text-dark_gray">Show Password</label>
                     </div>
                     
                     <!-- Password strength indicator -->
                     <div v-if="newPassword" class="mt-3">
                        <div class="text-xs mb-1">Password Strength: 
                           <span :class="passwordStrengthClass">{{ passwordStrength }}</span>
                        </div>
                        <div class="w-full bg-gray-200 rounded-full h-1">
                           <div :class="passwordProgressClass" :style="{ width: passwordProgressWidth }" class="h-1 rounded-full transition-all duration-300"></div>
                        </div>
                     </div>
                     
                     <!-- Dynamic password requirements -->
                     <div v-if="newPassword && passwordErrors.length > 0" class="mt-3">
                        <p class="text-xs text-gray-600 mb-1">Password must include:</p>
                        <ul class="text-xs">
                           <li v-for="error in passwordErrors" :key="error" class="text-red-500">• {{ error }}</li>
                        </ul>
                     </div>
                     
                     <!-- Static requirements when no password entered -->
                     <div v-if="!newPassword" class="mt-3">
                        <p class="text-xs text-gray-600">Password requirements:</p>
                        <ul class="text-xs text-gray-600 list-disc list-inside mt-1">
                           <li>At least 8 characters long</li>
                           <li>Contains uppercase and lowercase letters</li>
                           <li>Contains at least one number</li>
                           <li>Contains at least one special character</li>
                        </ul>
                     </div>
                  </div>

                  <div class="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                     <div>
                        <h3 class="font-medium text-dark_gray">Two-Factor Authentication Status</h3>
                        <p class="text-sm text-dark_gray/70">{{ requiresOtp ? 'OTP verification required for clock-in' : 'OTP verification not required' }}</p>
                     </div>
                     <div class="px-3 py-1 rounded-full text-xs font-medium" :class="requiresOtp ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'">
                        {{ requiresOtp ? 'Enabled' : 'Disabled' }}
                     </div>
                  </div>
                  <p class="text-xs text-gray-600 mt-2">
                     <svg class="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                     </svg>
                     Contact your administrator to modify your two-factor authentication settings.
                  </p>

                  <button @click="initiateSecurityUpdate" class="btn bg-dark_green hover:bg-button_green text-white border-none w-full">
                     <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                     </svg>
                     Change Password
                  </button>

                  <!-- Success/Failure Notifications -->
                  <div v-if="updateSecuritySuccess" class="alert alert-success">
                     <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                     </svg>
                     <span>Password changed successfully!</span>
                  </div>
                  <div v-if="updateSecurityFailure" class="alert alert-error">
                     <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                     </svg>
                     <span>Unable to change password!</span>
                  </div>
               </div>
            </div>

            <!-- Employment Information Section (Read-only) -->
            <div class="bg-white rounded-xl shadow-sm border border-search_stroke_gray p-6 lg:col-span-2">
               <div class="flex items-center mb-6">
                  <div class="w-10 h-10 bg-dark_green rounded-full flex items-center justify-center mr-3">
                     <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6m0 0v6m0-6H8m0 0V6m0 0v6" />
                     </svg>
                  </div>
                  <div>
                     <h2 class="text-xl font-semibold text-dark_gray">Employment Information</h2>
                     <p class="text-sm text-dark_gray/70">View your employment details (read-only)</p>
                  </div>
               </div>

               <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                     <label class="block text-sm font-medium text-dark_gray mb-2">Employment Rank</label>
                     <input 
                        :value="employmentRank" 
                        readonly
                        class="w-full input input-bordered bg-gray-100 border-search_stroke_gray text-gray-600 cursor-not-allowed"
                     >
                  </div>

                  <div>
                     <label class="block text-sm font-medium text-dark_gray mb-2">Monthly Pay</label>
                     <input 
                        :value="monthlyPay ? `$${monthlyPay.toFixed(2)}` : 'Not set'" 
                        readonly
                        class="w-full input input-bordered bg-gray-100 border-search_stroke_gray text-gray-600 cursor-not-allowed"
                     >
                  </div>

                  <div>
                     <label class="block text-sm font-medium text-dark_gray mb-2">Hourly Pay</label>
                     <input 
                        :value="hourlyPay ? `$${hourlyPay.toFixed(2)}` : 'Not set'" 
                        readonly
                        class="w-full input input-bordered bg-gray-100 border-search_stroke_gray text-gray-600 cursor-not-allowed"
                     >
                  </div>
               </div>

               <div class="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p class="text-sm text-blue-800">
                     <svg class="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                     </svg>
                     To modify your employment information or pay rates, please contact your administrator.
                  </p>
               </div>
            </div>
         </div>
      </div>
   </div>

   <!-- Re-authentication Modal -->
   <ReAuthModal 
      :show-modal="showReAuthModal"
      :operation="currentOperation"
      @authenticated="handleReAuthentication"
      @cancelled="cancelReAuthentication"
   />
</template>

<script setup>
   import { ref, computed } from 'vue';
   import { useRouter } from 'vue-router';
   import { 
      logSecurityEvent, 
      validatePasswordComplexity,
      checkPasswordHistory,
      validatePasswordAge,
      sanitizeInput,
      validateStringLength
   } from '~/utils/security';

   const supabase = useSupabaseClient();
   const router = useRouter();

   // Personal information
   const firstName = ref('');
   const middleName = ref('');
   const lastName = ref('');
   const userEmail = ref('');

   // Security settings
   const newPassword = ref('');
   const hidePassword = ref(true);
   const requiresOtp = ref(false);

   // Password validation
   const passwordErrors = ref([]);
   const passwordStrength = ref('');
   const passwordPolicySettings = ref(null);

   // Employment information (read-only)
   const employmentRank = ref('');
   const monthlyPay = ref(0);
   const hourlyPay = ref(0);

   // UI state
   const updatePersonalSuccess = ref(false);
   const updatePersonalFailure = ref(false);
   const updateSecuritySuccess = ref(false);
   const updateSecurityFailure = ref(false);

   // Re-authentication modal
   const showReAuthModal = ref(false);
   const currentOperation = ref('');
   const pendingUpdates = ref({});

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

   // Validate password as user types using cached settings
   const validatePasswordOnChange = () => {
      if (newPassword.value && passwordPolicySettings.value) {
         const settings = passwordPolicySettings.value;
         const errors = [];
         let score = 0;

         // If password complexity is disabled, only check minimum length
         if (!settings.enableComplexity) {
            if (newPassword.value.length < settings.minLength) {
               errors.push(`Password must be at least ${settings.minLength} characters long`);
            } else {
               score = 3; // Consider it medium strength
            }
         } else {
            // Minimum length check
            if (newPassword.value.length < settings.minLength) {
               errors.push(`Password must be at least ${settings.minLength} characters long`);
            } else {
               score += 1;
            }

            // Complexity checks
            if (settings.requireUppercase && !/[A-Z]/.test(newPassword.value)) {
               errors.push('Password must contain at least one uppercase letter');
            } else if (settings.requireUppercase) {
               score += 1;
            }

            if (settings.requireLowercase && !/[a-z]/.test(newPassword.value)) {
               errors.push('Password must contain at least one lowercase letter');
            } else if (settings.requireLowercase) {
               score += 1;
            }

            if (settings.requireNumbers && !/\d/.test(newPassword.value)) {
               errors.push('Password must contain at least one number');
            } else if (settings.requireNumbers) {
               score += 1;
            }

            if (settings.requireSpecialChars && !/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\?]/.test(newPassword.value)) {
               errors.push('Password must contain at least one special character (!@#$%^&*)');
            } else if (settings.requireSpecialChars) {
               score += 1;
            }

            // Common passwords check
            const commonPasswords = ['password', '123456', 'qwerty', 'admin', 'welcome'];
            if (commonPasswords.some(common => newPassword.value.toLowerCase().includes(common))) {
               errors.push('Password contains common words and is not secure');
               score -= 1;
            }
         }

         passwordErrors.value = errors;
         
         const maxScore = 1 + // length
            (settings.requireUppercase ? 1 : 0) +
            (settings.requireLowercase ? 1 : 0) +
            (settings.requireNumbers ? 1 : 0) +
            (settings.requireSpecialChars ? 1 : 0);
         
         passwordStrength.value = score >= maxScore - 1 ? 'STRONG' : score >= Math.floor(maxScore / 2) ? 'MEDIUM' : 'WEAK';
      } else {
         passwordErrors.value = [];
         passwordStrength.value = '';
      }
   };

   // Fetch password policy settings
   const fetchPasswordPolicySettings = async () => {
      try {
         const response = await $fetch('/api/get-password-policy-settings');
         passwordPolicySettings.value = response;
      } catch (error) {
         console.error('Error fetching password policy settings:', error);
         // Use defaults if fetch fails
         passwordPolicySettings.value = {
            minLength: 8,
            requireUppercase: true,
            requireLowercase: true,
            requireNumbers: true,
            requireSpecialChars: true,
            enableComplexity: true
         };
      }
   };

   // Fetch user data on page load
   const fetchUserData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
         router.push('/login');
         return;
      }

      userEmail.value = user.email || '';

      // Fetch employee data
      const { data, error } = await supabase
         .from('Employees')
         .select('first_name, last_name, middle_name, requires_otp, monthly_pay, hourly_pay')
         .eq('id', user.id)
         .single();

      if (error) {
         console.error('Error fetching user data:', error);
         await logSecurityEvent({
            eventType: 'DATA_ACCESS_FAILED',
            userId: user.id,
            userEmail: user.email,
            details: { error: error.message, resource: 'user_account_data' },
            severity: 'MEDIUM'
         });
      } else if (data) {
         firstName.value = data.first_name || '';
         lastName.value = data.last_name || '';
         middleName.value = data.middle_name || '';
         requiresOtp.value = data.requires_otp || false;
         // Get user's primary role from the new role system
         try {
            const { data: rolesData } = await supabase
               .from('UserRoles')
               .select('Roles!inner(name)')
               .eq('user_id', user.id)
               .eq('is_active', true)
               .limit(1);
            
            employmentRank.value = rolesData && rolesData.length > 0 ? rolesData[0].Roles.name : 'Employee';
         } catch (error) {
            console.error('Error fetching user role:', error);
            employmentRank.value = 'Employee';
         }
         monthlyPay.value = data.monthly_pay || 0;
         hourlyPay.value = data.hourly_pay || 0;
      }
   };

   // Update personal information
   const updatePersonalInfo = async () => {
      // Validate inputs
      if (!validateStringLength(firstName.value.trim(), 1, 50)) {
         alert('First name must be between 1 and 50 characters');
         return;
      }
      if (!validateStringLength(lastName.value.trim(), 1, 50)) {
         alert('Last name must be between 1 and 50 characters');
         return;
      }
      if (middleName.value && !validateStringLength(middleName.value.trim(), 0, 50)) {
         alert('Middle name must be less than 50 characters');
         return;
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const updates = {
         first_name: sanitizeInput(firstName.value.trim(), 50),
         last_name: sanitizeInput(lastName.value.trim(), 50),
         middle_name: middleName.value ? sanitizeInput(middleName.value.trim(), 50) : null,
         last_updated: new Date()
      };

      const { error } = await supabase
         .from('Employees')
         .update(updates)
         .eq('id', user.id);

      if (error) {
         console.error('Error updating personal information:', error);
         updatePersonalSuccess.value = false;
         updatePersonalFailure.value = true;
         setTimeout(() => updatePersonalFailure.value = false, 5000);

         await logSecurityEvent({
            eventType: 'PERSONAL_INFO_UPDATE_FAILED',
            userId: user.id,
            userEmail: user.email,
            details: { error: error.message },
            severity: 'MEDIUM'
         });
      } else {
         console.log('Personal information updated successfully');
         updatePersonalSuccess.value = true;
         updatePersonalFailure.value = false;
         setTimeout(() => updatePersonalSuccess.value = false, 5000);

         await logSecurityEvent({
            eventType: 'PERSONAL_INFO_UPDATED',
            userId: user.id,
            userEmail: user.email,
            details: { 
               updatedFields: Object.keys(updates).filter(key => key !== 'last_updated')
            },
            severity: 'LOW'
         });
      }
   };

   // Initiate security update (requires re-authentication for password changes)
   const initiateSecurityUpdate = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Only allow password changes, no OTP preference updates
      if (!newPassword.value.trim()) {
         alert('Please enter a new password to update security settings.');
         return;
      }

      // Password change requires validation and re-authentication
      const passwordValidation = await validatePasswordComplexity(newPassword.value);
      if (!passwordValidation.valid) {
         alert(`Password does not meet complexity requirements:\n${passwordValidation.errors.join('\n')}`);
         return;
      }

      // Check password age restriction
      const ageValidation = await validatePasswordAge(user.id);
      if (!ageValidation.canChange) {
         alert(`Password age restriction: ${ageValidation.error}`);
         return;
      }

      // Check password history
      const historyCheck = await checkPasswordHistory(user.id, newPassword.value);
      if (historyCheck.isReused) {
         alert(historyCheck.error || 'This password has been used recently. Please choose a different password.');
         return;
      }

      // Store pending updates and show re-authentication modal
      pendingUpdates.value = {
         password: newPassword.value
      };

      currentOperation.value = 'password change';
      showReAuthModal.value = true;
   };

   // Handle successful re-authentication
   const handleReAuthentication = async (authData) => {
      showReAuthModal.value = false;
      
      try {
         const { error } = await supabase.auth.updateUser({
            password: pendingUpdates.value.password
         });

         if (error) {
            console.error('Error updating password:', error);
            updateSecurityFailure.value = true;
            setTimeout(() => updateSecurityFailure.value = false, 5000);

            await logSecurityEvent({
               eventType: 'PASSWORD_UPDATE_FAILED',
               userId: authData.userId,
               userEmail: authData.email,
               details: { error: error.message },
               severity: 'HIGH'
            });
         } else {
            // Store password in history
            try {
               await $fetch('/api/store-password-history', {
                  method: 'POST',
                  body: {
                     userId: authData.userId,
                     newPassword: pendingUpdates.value.password
                  }
               });
            } catch (historyError) {
               console.error('Failed to store password history:', historyError);
            }

            updateSecuritySuccess.value = true;
            setTimeout(() => updateSecuritySuccess.value = false, 10000);
            
            // Clear password field
            newPassword.value = '';

            await logSecurityEvent({
               eventType: 'PASSWORD_UPDATED',
               userId: authData.userId,
               userEmail: authData.email,
               details: { 
                  passwordChanged: true
               },
               severity: 'LOW'
            });
         }
      } catch (error) {
         console.error('Error during security update:', error);
         updateSecurityFailure.value = true;
         setTimeout(() => updateSecurityFailure.value = false, 5000);
      }

      pendingUpdates.value = {};
   };

   // Handle re-authentication cancellation
   const cancelReAuthentication = () => {
      showReAuthModal.value = false;
      pendingUpdates.value = {};
   };

   // Logout function
   const logout = async () => {
      const { error } = await supabase.auth.signOut();
      
      if (error) {
         console.error("Error logging out:", error);
      } else {
         router.push('/login');
      }
   };

   // Initialize page
   fetchUserData();
   fetchPasswordPolicySettings();
</script>