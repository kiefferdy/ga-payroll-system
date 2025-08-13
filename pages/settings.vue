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
                  <NuxtLink v-if="canAccessEmployees" to="/employees" class="px-3 py-2 hover:bg-button_green transition-colors rounded-lg">Employees</NuxtLink>
                  <NuxtLink v-if="canAccessRecords" to="/records" class="px-3 py-2 hover:bg-button_green transition-colors rounded-lg">Records</NuxtLink>
                  <NuxtLink v-if="canAccessRoles" to="/roles" class="px-3 py-2 hover:bg-button_green transition-colors rounded-lg">Roles</NuxtLink>
                  <NuxtLink v-if="canAccessSettings" to="/settings" class="px-3 py-2 bg-primary_white text-dark_green rounded-lg font-semibold">Settings</NuxtLink>
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
            <p class="text-dark_gray/70">Manage system configurations and security settings</p>
         </div>

         <!-- Settings Grid -->
         <div class="space-y-8">
            <!-- Password Policy Section -->
            <div class="bg-white rounded-xl shadow-sm border border-search_stroke_gray p-6">
               <div class="flex items-center mb-6">
                  <div class="w-10 h-10 bg-dark_green rounded-full flex items-center justify-center mr-3">
                     <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                     </svg>
                  </div>
                  <div>
                     <h2 class="text-xl font-semibold text-dark_gray">Password Policy</h2>
                     <p class="text-sm text-dark_gray/70">Configure password complexity and security requirements</p>
                  </div>
               </div>

               <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                     <label for="password-min-length" class="block text-sm font-medium text-dark_gray mb-2">Minimum Password Length</label>
                     <input 
                        v-model.number="passwordMinLength" 
                        id="password-min-length" 
                        type="number" 
                        min="4" 
                        max="128" 
                        class="w-full input input-bordered bg-primary_white border-search_stroke_gray focus:border-dark_green"
                     >
                  </div>

                  <div>
                     <label for="password-history" class="block text-sm font-medium text-dark_gray mb-2">Password History Count</label>
                     <input 
                        v-model.number="passwordHistoryCount" 
                        id="password-history" 
                        type="number" 
                        min="0" 
                        max="20" 
                        class="w-full input input-bordered bg-primary_white border-search_stroke_gray focus:border-dark_green"
                     >
                  </div>

                  <div>
                     <label for="password-age-hours" class="block text-sm font-medium text-dark_gray mb-2">Password Age Minimum (Hours)</label>
                     <input 
                        v-model.number="passwordAgeMinHours" 
                        id="password-age-hours" 
                        type="number" 
                        min="0" 
                        max="168" 
                        class="w-full input input-bordered bg-primary_white border-search_stroke_gray focus:border-dark_green"
                     >
                  </div>

                  <div>
                     <label for="password-expiration" class="block text-sm font-medium text-dark_gray mb-2">Password Expiration (Days, 0 = Never)</label>
                     <input 
                        v-model.number="passwordExpirationDays" 
                        id="password-expiration" 
                        type="number" 
                        min="0" 
                        max="365" 
                        class="w-full input input-bordered bg-primary_white border-search_stroke_gray focus:border-dark_green"
                     >
                  </div>
               </div>

               <div class="mt-6 space-y-4">
                  <div class="flex items-center justify-between p-4 bg-off_white rounded-lg">
                     <div>
                        <h3 class="font-medium text-dark_gray">Enable Password Complexity</h3>
                        <p class="text-sm text-dark_gray/70">Enforce password complexity requirements</p>
                     </div>
                     <input v-model="enablePasswordComplexity" type="checkbox" class="toggle toggle-primary">
                  </div>

                  <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
                     <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <span class="text-sm text-dark_gray">Require Uppercase</span>
                        <input v-model="passwordRequireUppercase" type="checkbox" class="checkbox checkbox-sm">
                     </div>
                     <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <span class="text-sm text-dark_gray">Require Lowercase</span>
                        <input v-model="passwordRequireLowercase" type="checkbox" class="checkbox checkbox-sm">
                     </div>
                     <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <span class="text-sm text-dark_gray">Require Numbers</span>
                        <input v-model="passwordRequireNumbers" type="checkbox" class="checkbox checkbox-sm">
                     </div>
                     <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <span class="text-sm text-dark_gray">Require Special Chars</span>
                        <input v-model="passwordRequireSpecialChars" type="checkbox" class="checkbox checkbox-sm">
                     </div>
                  </div>

                  <div class="flex items-center justify-between p-4 bg-off_white rounded-lg">
                     <div>
                        <h3 class="font-medium text-dark_gray">Force Password Change on First Login</h3>
                        <p class="text-sm text-dark_gray/70">Require new users to change their password when they first log in</p>
                     </div>
                     <input v-model="forcePasswordChangeFirstLogin" type="checkbox" class="toggle toggle-primary">
                  </div>
               </div>
            </div>

            <!-- Account Lockout Section -->
            <div class="bg-white rounded-xl shadow-sm border border-search_stroke_gray p-6">
               <div class="flex items-center mb-6">
                  <div class="w-10 h-10 bg-dark_green rounded-full flex items-center justify-center mr-3">
                     <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L18.364 5.636M5.636 18.364l12.728-12.728" />
                     </svg>
                  </div>
                  <div>
                     <h2 class="text-xl font-semibold text-dark_gray">Account Lockout Settings</h2>
                     <p class="text-sm text-dark_gray/70">Configure account lockout behavior for failed login attempts</p>
                  </div>
               </div>

               <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                     <label for="max-failed-attempts" class="block text-sm font-medium text-dark_gray mb-2">Maximum Failed Login Attempts</label>
                     <input 
                        v-model.number="maxFailedLoginAttempts" 
                        id="max-failed-attempts" 
                        type="number" 
                        min="3" 
                        max="20" 
                        class="w-full input input-bordered bg-primary_white border-search_stroke_gray focus:border-dark_green"
                     >
                  </div>

                  <div>
                     <label for="lockout-duration" class="block text-sm font-medium text-dark_gray mb-2">Lockout Duration (Minutes)</label>
                     <input 
                        v-model.number="lockoutDurationMinutes" 
                        id="lockout-duration" 
                        type="number" 
                        min="5" 
                        max="1440" 
                        class="w-full input input-bordered bg-primary_white border-search_stroke_gray focus:border-dark_green"
                     >
                  </div>
               </div>

               <div class="mt-6">
                  <div class="flex items-center justify-between p-4 bg-off_white rounded-lg">
                     <div>
                        <h3 class="font-medium text-dark_gray">Auto-Unlock Accounts</h3>
                        <p class="text-sm text-dark_gray/70">Automatically unlock accounts after the lockout period expires</p>
                     </div>
                     <input v-model="autoUnlockAccounts" type="checkbox" class="toggle toggle-primary">
                  </div>
               </div>
            </div>

            <!-- Two-Factor Authentication Section -->
            <div class="bg-white rounded-xl shadow-sm border border-search_stroke_gray p-6">
               <div class="flex items-center mb-6">
                  <div class="w-10 h-10 bg-dark_green rounded-full flex items-center justify-center mr-3">
                     <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                     </svg>
                  </div>
                  <div>
                     <h2 class="text-xl font-semibold text-dark_gray">Two-Factor Authentication</h2>
                     <p class="text-sm text-dark_gray/70">Configure two-factor authentication settings</p>
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
                        <p class="text-sm text-dark_gray/70">When enabled, employees that clock-in must enter an OTP sent to the configured device</p>
                     </div>
                     <input v-model="otpEnable" id="otp-toggle" type="checkbox" class="toggle toggle-primary">
                  </div>
               </div>
            </div>
         </div>

         <!-- Global Settings Action Section -->
         <div class="mt-8 bg-white rounded-xl shadow-sm border border-search_stroke_gray p-6">
            <!-- Validation Error Notification -->
            <div v-if="validationError" class="alert alert-warning mb-4">
               <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
               </svg>
               <span>{{ validationError }}</span>
            </div>

            <!-- Success/Failure Notifications -->
            <div v-if="updateSuccess" class="alert alert-success mb-4">
               <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
               </svg>
               <span>All system settings updated successfully!</span>
            </div>
            <div v-if="updateFailure" class="alert alert-error mb-4">
               <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
               </svg>
               <span>Unable to update system settings!</span>
            </div>

            <div class="text-center">
               <h3 class="text-lg font-semibold text-dark_gray mb-2">Save Configuration</h3>
               <p class="text-sm text-dark_gray/70 mb-4">Apply all changes to password policy, account lockout, and two-factor authentication settings.</p>
               
               <button @click="updateAllSettings" class="btn bg-dark_green hover:bg-button_green text-white border-none px-8 py-3 text-lg">
                  <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                     <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                  </svg>
                  Update All Settings
               </button>
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
      logSecurityEvent,
      validateEmail as validateEmailUtil,
      logAuthenticationAttempt
   } from '~/utils/security';

   const supabase = useSupabaseClient();
   const router = useRouter();
   
   // Permission management
   const { canAccessEmployees, canAccessSettings, canAccessRoles, canAccessRecords, loadPermissions } = usePermissions();

   // Re-authentication modal state
   const showReAuthModal = ref(false);
   const currentOperation = ref('');
   const pendingUpdates = ref({});



   // OTP Settings controllers
   const otpEmail = ref('');
   const otpPhone = ref('');
   const otpEnable = ref(false);
   const otpChannel = ref('Email');

   // Password Policy Settings
   const passwordMinLength = ref(8);
   const passwordRequireUppercase = ref(true);
   const passwordRequireLowercase = ref(true);
   const passwordRequireNumbers = ref(true);
   const passwordRequireSpecialChars = ref(true);
   const passwordHistoryCount = ref(5);
   const passwordAgeMinHours = ref(24);
   const forcePasswordChangeFirstLogin = ref(false);
   const passwordExpirationDays = ref(90);
   const enablePasswordComplexity = ref(true);

   // Account Lockout Settings
   const maxFailedLoginAttempts = ref(5);
   const lockoutDurationMinutes = ref(30);
   const autoUnlockAccounts = ref(true);

   // Success and failure notifs
   const updateSuccess = ref(false);
   const updateFailure = ref(false);
   const validationError = ref('');


   // Function to fetch settings from Supabase
   const fetchSettings = async () => {
      const { data, error } = await supabase
         .from('Settings')
         .select(`
            otp_email, otp_phone, otp_enable, otp_channel,
            password_min_length, password_require_uppercase, password_require_lowercase,
            password_require_numbers, password_require_special_chars, password_history_count,
            password_age_min_hours, force_password_change_first_login, password_expiration_days,
            enable_password_complexity, max_failed_login_attempts, lockout_duration_minutes,
            auto_unlock_accounts
         `)
         .single(); // There is only one row for the 'Settings' table.

      if (error) {
         console.error('Error fetching settings:', error);
      } else if (data) {
         // OTP Settings
         otpEmail.value = data.otp_email || '';
         otpPhone.value = data.otp_phone || '';
         otpEnable.value = data.otp_enable || false;
         otpChannel.value = data.otp_channel || 'Email';

         // Password Policy Settings
         passwordMinLength.value = data.password_min_length || 8;
         passwordRequireUppercase.value = data.password_require_uppercase ?? true;
         passwordRequireLowercase.value = data.password_require_lowercase ?? true;
         passwordRequireNumbers.value = data.password_require_numbers ?? true;
         passwordRequireSpecialChars.value = data.password_require_special_chars ?? true;
         passwordHistoryCount.value = data.password_history_count || 5;
         passwordAgeMinHours.value = data.password_age_min_hours || 24;
         forcePasswordChangeFirstLogin.value = data.force_password_change_first_login || false;
         passwordExpirationDays.value = data.password_expiration_days || 90;
         enablePasswordComplexity.value = data.enable_password_complexity ?? true;

         // Account Lockout Settings
         maxFailedLoginAttempts.value = data.max_failed_login_attempts || 5;
         lockoutDurationMinutes.value = data.lockout_duration_minutes || 30;
         autoUnlockAccounts.value = data.auto_unlock_accounts ?? true;
      }
   };

   // Initiate settings update (requires re-authentication for system settings changes)
   const updateAllSettings = async () => {
      // Clear previous validation errors
      validationError.value = '';
      
      // Validate OTP settings
      if (!isValidEmail(otpEmail.value)) {
         validationError.value = "Please enter a valid OTP email address.";
         return;
      }
      if (!isValidPhoneNumber(otpPhone.value)) {
         validationError.value = "Please enter a valid phone number.";
         return;
      }

      // Validate numeric settings
      if (passwordMinLength.value < 4 || passwordMinLength.value > 128) {
         validationError.value = "Password minimum length must be between 4 and 128 characters.";
         return;
      }
      if (maxFailedLoginAttempts.value < 3 || maxFailedLoginAttempts.value > 20) {
         validationError.value = "Maximum failed login attempts must be between 3 and 20.";
         return;
      }
      if (lockoutDurationMinutes.value < 5 || lockoutDurationMinutes.value > 1440) {
         validationError.value = "Lockout duration must be between 5 and 1440 minutes (24 hours).";
         return;
      }

      // Store pending updates and show re-authentication modal
      pendingUpdates.value = {
         // OTP Settings
         otp_email: otpEmail.value,
         otp_phone: otpPhone.value,
         otp_enable: otpEnable.value,
         otp_channel: otpChannel.value,

         // Password Policy Settings
         password_min_length: passwordMinLength.value,
         password_require_uppercase: passwordRequireUppercase.value,
         password_require_lowercase: passwordRequireLowercase.value,
         password_require_numbers: passwordRequireNumbers.value,
         password_require_special_chars: passwordRequireSpecialChars.value,
         password_history_count: passwordHistoryCount.value,
         password_age_min_hours: passwordAgeMinHours.value,
         force_password_change_first_login: forcePasswordChangeFirstLogin.value,
         password_expiration_days: passwordExpirationDays.value,
         enable_password_complexity: enablePasswordComplexity.value,

         // Account Lockout Settings
         max_failed_login_attempts: maxFailedLoginAttempts.value,
         lockout_duration_minutes: lockoutDurationMinutes.value,
         auto_unlock_accounts: autoUnlockAccounts.value,

         last_updated: new Date()
      };

      currentOperation.value = 'system settings update';
      showReAuthModal.value = true;
   };

   // Perform the actual settings update after re-authentication
   const performSettingsUpdate = async () => {
      try {
         const { error } = await supabase
            .from('Settings')
            .update(pendingUpdates.value)
            .match({ id: 1 });

         if (error) {
            console.error('Error updating settings:', error);
            updateSuccess.value = false;
            updateFailure.value = true; // Display fail notif
            setTimeout(() => updateFailure.value = false, 5000); // Hides notif after 5 seconds
         } else {
            console.log('System settings successfully updated!');
            updateSuccess.value = true; // Display success notif
            updateFailure.value = false;
            validationError.value = ''; // Clear any validation errors
            setTimeout(() => updateSuccess.value = false, 5000); // Hides notif after 5 seconds

            // Log the settings update
            await logSecurityEvent({
               eventType: 'SYSTEM_SETTINGS_UPDATED',
               details: {
                  updated_fields: Object.keys(pendingUpdates.value).filter(key => key !== 'last_updated')
               },
               severity: 'LOW'
            });
         }
      } catch (error) {
         console.error('Error updating settings:', error);
         updateFailure.value = true;
         setTimeout(() => updateFailure.value = false, 5000);
      }
   };

   // Handle successful re-authentication
   const handleReAuthentication = async (authData) => {
      showReAuthModal.value = false;
      
      try {
         await performSettingsUpdate();
         
         // Log successful re-authentication for settings update
         await logSecurityEvent({
            eventType: 'RE_AUTHENTICATION_SUCCESS',
            userId: authData.userId,
            userEmail: authData.email,
            details: { operation: currentOperation.value },
            severity: 'LOW'
         });
      } catch (error) {
         console.error('Error after re-authentication:', error);
         updateFailure.value = true;
         setTimeout(() => updateFailure.value = false, 5000);
      } finally {
         pendingUpdates.value = {};
      }
   };

   // Handle re-authentication cancellation
   const cancelReAuthentication = () => {
      showReAuthModal.value = false;
      pendingUpdates.value = {};
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

   // Page is already protected by auth.global.ts middleware with proper permissions

   // Simplified logout function
   const { logout } = useAuth();

   // Functions to be run once page loads
   fetchSettings();
   loadPermissions();

</script>