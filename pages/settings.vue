<template>
   <Title>Admin - Settings</Title>
   <div class="min-h-screen bg-primary_white">
      <!-- Top Navigation -->
      <div class="bg-dark_green text-white px-6 py-4">
         <div class="flex justify-between items-center">
            <div class="flex items-center space-x-6">
               <NuxtLink to="/" class="flex items-center space-x-2 hover:text-primary_green transition-colors">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                     <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                  <span>Back to Dashboard</span>
               </NuxtLink>
               <nav class="flex space-x-6">
                  <NuxtLink to="/employees" class="px-3 py-2 hover:bg-button_green transition-colors rounded-lg">Employees</NuxtLink>
                  <NuxtLink to="/records" class="px-3 py-2 hover:bg-button_green transition-colors rounded-lg">Records</NuxtLink>
                  <NuxtLink to="/settings" class="px-3 py-2 bg-primary_white text-dark_green rounded-lg font-semibold">Settings</NuxtLink>
               </nav>
            </div>
            <button @click="logout" class="flex items-center space-x-2 hover:bg-button_green px-3 py-2 rounded-lg transition-colors">
               <span>Logout</span>
               <img class="w-4 h-4" src="~/assets/icons/exit_white.png">
            </button>
         </div>
      </div>

      <!-- Main Content -->
      <div class="p-6 max-w-7xl mx-auto">
         <!-- Header Section -->
         <div class="mb-8">
            <h1 class="text-3xl font-bold text-dark_gray mb-2">System Settings</h1>
            <p class="text-dark_gray/70">Manage account credentials and system configurations</p>
         </div>

         <!-- Settings Grid -->
         <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <!-- Account Credentials Section -->
            <div class="bg-white rounded-xl shadow-sm border border-search_stroke_gray p-6">
               <div class="flex items-center mb-6">
                  <div class="w-10 h-10 bg-dark_green rounded-full flex items-center justify-center mr-3">
                     <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                     </svg>
                  </div>
                  <div>
                     <h2 class="text-xl font-semibold text-dark_gray">Account Credentials</h2>
                     <p class="text-sm text-dark_gray/70">Update your account email and password</p>
                  </div>
               </div>

               <div class="space-y-4">
                  <div>
                     <label for="company-email" class="block text-sm font-medium text-dark_gray mb-2">Account Email</label>
                     <input 
                        v-model="accountEmail" 
                        id="company-email" 
                        type="email" 
                        placeholder="Enter new email" 
                        class="w-full input input-bordered bg-primary_white border-search_stroke_gray focus:border-dark_green"
                     >
                  </div>

                  <div>
                     <label for="company-password" class="block text-sm font-medium text-dark_gray mb-2">New Password</label>
                     <input 
                        v-model="password" 
                        id="company-password" 
                        :type="passwordFieldType" 
                        placeholder="Enter new password" 
                        class="w-full input input-bordered bg-primary_white border-search_stroke_gray focus:border-dark_green"
                     >
                     <div class="flex items-center mt-2">
                        <input type="checkbox" id="show-password" @click="hidePassword = !hidePassword" class="checkbox checkbox-sm mr-2" />
                        <label for="show-password" class="text-sm text-dark_gray">Show Password</label>
                     </div>
                  </div>

                  <button @click="initiatePasswordUpdate" class="btn bg-dark_green hover:bg-button_green text-white border-none w-full">
                     <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                     </svg>
                     Update Credentials
                  </button>

                  <!-- Success/Failure Notifications -->
                  <div v-if="updateAccountSuccess" class="alert alert-success">
                     <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                     </svg>
                     <span>Credentials updated successfully! If you've changed your email, please check your new email for a confirmation link.</span>
                  </div>
                  <div v-if="updateAccountFailure" class="alert alert-error">
                     <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                     </svg>
                     <span>Unable to update credentials!</span>
                  </div>
               </div>
            </div>

            <!-- OTP Settings Section -->
            <div class="bg-white rounded-xl shadow-sm border border-search_stroke_gray p-6">
               <div class="flex items-center mb-6">
                  <div class="w-10 h-10 bg-dark_green rounded-full flex items-center justify-center mr-3">
                     <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                     </svg>
                  </div>
                  <div>
                     <h2 class="text-xl font-semibold text-dark_gray">Security Settings</h2>
                     <p class="text-sm text-dark_gray/70">Configure two-factor authentication</p>
                  </div>
               </div>

               <div class="space-y-4">
                  <div>
                     <label for="otp-email" class="block text-sm font-medium text-dark_gray mb-2">OTP Email</label>
                     <input 
                        v-model="otpEmail" 
                        id="otp-email" 
                        type="email" 
                        placeholder="Enter OTP email" 
                        class="w-full input input-bordered bg-primary_white border-search_stroke_gray focus:border-dark_green"
                     >
                  </div>

                  <div>
                     <label for="otp-phone" class="block text-sm font-medium text-dark_gray mb-2">OTP Phone Number</label>
                     <input 
                        v-model="otpPhone" 
                        id="otp-phone" 
                        type="tel" 
                        placeholder="+1234567890" 
                        class="w-full input input-bordered bg-primary_white border-search_stroke_gray focus:border-dark_green"
                     >
                  </div>

                  <div>
                     <label for="otp-channel" class="block text-sm font-medium text-dark_gray mb-2">OTP Channel</label>
                     <select 
                        v-model="otpChannel" 
                        id="otp-channel" 
                        class="w-full select select-bordered bg-primary_white border-search_stroke_gray focus:border-dark_green"
                     >
                        <option value="Email">Email</option>
                        <option value="SMS">SMS</option>
                        <option value="WhatsApp">WhatsApp</option>
                     </select>
                  </div>

                  <div class="flex items-center justify-between p-4 bg-off_white rounded-lg">
                     <div>
                        <h3 class="font-medium text-dark_gray">Enable Two-Factor Authentication</h3>
                        <p class="text-sm text-dark_gray/70">Add an extra layer of security to your account</p>
                     </div>
                     <input v-model="otpEnable" id="otp-toggle" type="checkbox" class="toggle toggle-primary">
                  </div>

                  <button @click="updateSettings" class="btn bg-dark_green hover:bg-button_green text-white border-none w-full">
                     <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                     </svg>
                     Update Security Settings
                  </button>

                  <!-- Success/Failure Notifications -->
                  <div v-if="updateSuccess" class="alert alert-success">
                     <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                     </svg>
                     <span>Settings updated successfully!</span>
                  </div>
                  <div v-if="updateFailure" class="alert alert-error">
                     <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                     </svg>
                     <span>Unable to update settings!</span>
                  </div>
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
   import { ref } from 'vue';
   import { useRouter } from 'vue-router';
   import { 
      checkUserAuthorization, 
      logSecurityEvent, 
      validatePasswordComplexity,
      validateEmail as validateEmailUtil,
      logAuthenticationAttempt,
      checkPasswordHistory,
      validatePasswordAge
   } from '~/utils/security';

   const supabase = useSupabaseClient();
   const router = useRouter();

   // Hide password functionality
   const hidePassword = ref(true);
   const password = ref("");
   const passwordFieldType = computed(() => hidePassword.value ? "password" : "text");

   // Account credentials input box controllers
   const { data: { user } } = await supabase.auth.getUser(); // Gets the current user
   const accountEmail = ref('');
   if (user) {
      accountEmail.value = user.email;
   }

   // Settings input box controllers
   const otpEmail = ref('');
   const otpPhone = ref('');
   const otpEnable = ref(false);
   const otpChannel = ref('Email');

   // Success and failure notifs
   const updateSuccess = ref(false);
   const updateFailure = ref(false);
   const updateAccountSuccess = ref(false);
   const updateAccountFailure = ref(false);

   // Re-authentication modal
   const showReAuthModal = ref(false);
   const currentOperation = ref('');
   const pendingCredentials = ref({});

   // Function to fetch settings from Supabase
   const fetchSettings = async () => {
      const { data, error } = await supabase
         .from('Settings')
         .select('otp_email, otp_phone, otp_enable, otp_channel')
         .single(); // There is only one row for the 'Settings' table.

      if (error) {
         console.error('Error fetching settings:', error);
      } else if (data) {
         otpEmail.value = data.otp_email || '';
         otpPhone.value = data.otp_phone || '';
         otpEnable.value = data.otp_enable || false;
         otpChannel.value = data.otp_channel || '';
      }
   };

   // Function to update settings in Supabase
   const updateSettings = async () => {
      if (!isValidEmail(otpEmail.value)) {
         alert("Please enter a valid OTP email address.");
         return;
      }
      if (!isValidPhoneNumber(otpPhone.value)) {
         alert("Please enter a valid phone number.");
         return;
      }

      const updates = {
         otp_email: otpEmail.value,
         otp_phone: otpPhone.value,
         otp_enable: otpEnable.value,
         otp_channel: otpChannel.value,
         last_updated: new Date()
      };

      const { error } = await supabase
         .from('Settings')
         .update(updates)
         .match({ id: 1 });

      if (error) {
         console.error('Error updating settings:', error);
         updateSuccess.value = false;
         updateFailure.value = true; // Display fail notif
         setTimeout(() => updateFailure.value = false, 5000); // Hides notif after 5 seconds
      } else {
         console.log('Project settings successfully updated!');
         updateSuccess.value = true; // Display success notif
         updateFailure.value = false;
         setTimeout(() => updateSuccess.value = false, 5000); // Hides notif after 5 seconds
      }
   };

   // Function to initiate password update with re-authentication
   const initiatePasswordUpdate = async () => {
      // Validate inputs first
      if (!isValidEmail(accountEmail.value)) {
         alert("Please enter a valid email address.");
         return;
      }

      // If password is being changed, validate complexity
      if (password.value) {
         const passwordValidation = validatePasswordComplexity(password.value);
         if (!passwordValidation.valid) {
            alert(`Password does not meet complexity requirements:\n${passwordValidation.errors.join('\n')}`);
            return;
         }

         // Check password age restriction (24 hour minimum)
         const { data: { user } } = await supabase.auth.getUser();
         if (user) {
            const ageValidation = await validatePasswordAge(user.id);
            if (!ageValidation.canChange) {
               alert(`Password age restriction: ${ageValidation.error}`);
               return;
            }

            // Check password history to prevent reuse
            const historyCheck = await checkPasswordHistory(user.id, password.value);
            if (historyCheck.isReused) {
               alert(historyCheck.error || 'This password has been used recently. Please choose a different password.');
               return;
            }
         }
      }

      // Store pending credentials
      pendingCredentials.value = {
         email: accountEmail.value,
         password: password.value
      };

      // Show re-authentication modal
      currentOperation.value = 'password/email change';
      showReAuthModal.value = true;
   };

   // Handle successful re-authentication
   const handleReAuthentication = async (authData) => {
      showReAuthModal.value = false;
      
      try {
         const updates = {
            email: pendingCredentials.value.email
         };

         // Only include password if it's being changed
         if (pendingCredentials.value.password) {
            updates.password = pendingCredentials.value.password;
         }

         const { error } = await supabase.auth.updateUser(updates);

         if (error) {
            // Log credential update failure
            await logSecurityEvent({
               eventType: 'CREDENTIAL_UPDATE_FAILED',
               userId: authData.userId,
               userEmail: authData.email,
               details: { 
                  operation: 'credential update',
                  error: error.message,
                  newEmail: pendingCredentials.value.email
               },
               severity: 'HIGH'
            });

            console.error('Error updating account credentials:', error);
            updateAccountSuccess.value = false;
            updateAccountFailure.value = true;
            setTimeout(() => updateAccountFailure.value = false, 5000);
         } else {
            // If password was changed, store it in history and update timestamp
            if (pendingCredentials.value.password) {
               try {
                  await $fetch('/api/store-password-history', {
                     method: 'POST',
                     body: {
                        userId: authData.userId,
                        newPassword: pendingCredentials.value.password
                     }
                  });
               } catch (historyError) {
                  console.error('Failed to store password history:', historyError);
                  // Don't fail the entire operation, just log it
               }
            }

            // Log successful credential update
            await logSecurityEvent({
               eventType: 'CREDENTIALS_UPDATED',
               userId: authData.userId,
               userEmail: authData.email,
               details: { 
                  operation: 'credential update',
                  newEmail: pendingCredentials.value.email,
                  passwordChanged: !!pendingCredentials.value.password
               },
               severity: 'LOW'
            });

            console.log('Account credentials successfully updated');
            updateAccountSuccess.value = true;
            updateAccountFailure.value = false;
            
            // Clear password field for security
            password.value = '';
            
            setTimeout(() => updateAccountSuccess.value = false, 10000);
         }
      } catch (error) {
         console.error('Error during credential update:', error);
         updateAccountFailure.value = true;
         setTimeout(() => updateAccountFailure.value = false, 5000);
      }

      // Clear pending credentials
      pendingCredentials.value = {};
   };

   // Handle re-authentication cancellation
   const cancelReAuthentication = () => {
      showReAuthModal.value = false;
      pendingCredentials.value = {};
   };

   // Enhanced validation functions using centralized utilities
   function isValidEmail(email) {
      return validateEmailUtil(email);
   }

   function isValidPhoneNumber(phoneNumber) {
      // Enhanced phone number validation - E.164 format
      const regex = /^\+[1-9]\d{1,14}$/;
      return regex.test(phoneNumber) && phoneNumber.length >= 8 && phoneNumber.length <= 16;
   }

   // Enhanced user authorization check
   const verifyUserRank = async () => {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
         await logSecurityEvent({
            eventType: 'UNAUTHORIZED_PAGE_ACCESS',
            resourceAccessed: '/settings',
            details: { reason: 'No authenticated user' },
            severity: 'HIGH'
         });
         router.push('/login');
         return;
      }

      const authCheck = await checkUserAuthorization(user.id, ['Admin', 'Developer']);
      if (!authCheck.authorized) {
         alert('You do not have permission to view this page!');
         router.push('/');
      }
   }

   // Enhanced logout function with security logging
   const logout = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { error } = await supabase.auth.signOut();
      if (error) {
         console.error("Error logging out:", error);
         
         // Log logout failure
         await logSecurityEvent({
            eventType: 'LOGOUT_FAILED',
            userId: user?.id,
            userEmail: user?.email,
            details: { error: error.message },
            severity: 'MEDIUM'
         });
      } else {
         // Log successful logout
         await logAuthenticationAttempt(
            'LOGOUT',
            user?.email || 'unknown',
            user?.id,
            undefined,
            navigator.userAgent
         );
         
         router.push('/login');
      }
   };

   // Functions to be run once page loads
   fetchSettings();
   verifyUserRank();

</script>