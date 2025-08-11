<template>
   <Title>Admin - Settings</Title>
   <div class="card card-side h-[37rem] w-[65rem] bg-dark_green text-black">
      <!-- Account Credentials Column -->
      <div class="flex-1 bg-primary_white rounded-l-[1rem] p-10">
         <label for="company-email" class="block mb-2">Account Email:</label>
         <input v-model="accountEmail" id="company-email" type="email" placeholder="New Email" class="w-full input bg-primary_white border-2 border-search_stroke_gray text-black rounded mb-4">

         <label for="company-password" class="block mb-2">Account Password:</label>
         <input v-model="password" id="company-password" :type="passwordFieldType" placeholder="New Password" class="w-full input bg-primary_white border-2 border-search_stroke_gray text-black rounded mb-2">
         <div class="flex items-center mb-4">
            <input type="checkbox" id="show-password" @click="hidePassword = !hidePassword" class="mr-2" />
            <label for="show-password">Show Password</label>
         </div>
         <button @click="initiatePasswordUpdate" class="btn bg-dark_green text-white rounded-full capitalize w-full mt-5">Update Credentials</button>

         <!-- Success Notification -->
         <div v-if="updateAccountSuccess" class="success-message mt-5" role="alert">
            Credentials updated successfully! If you've changed your email, please check your new email for a confirmation link.
         </div>
         <!-- Failure Notification -->
         <div v-if="updateAccountFailure" class="failure-message mt-5" role="alert">
            Unable to update credentials!
         </div>
      </div>

      <!-- Settings Column -->
      <div class="flex-1 bg-primary_white rounded-r-[1rem] p-10">
         <label for="otp-email" class="block mb-2">OTP Email:</label>
         <input v-model="otpEmail" id="otp-email" type="email" placeholder="OTP Email" class="w-full input bg-primary_white border-2 border-search_stroke_gray text-black rounded mb-4">
         
         <label for="otp-phone" class="block mb-2">OTP Phone Number:</label>
         <input v-model="otpPhone" id="otp-phone" type="tel" placeholder="OTP Phone Number" class="w-full input bg-primary_white border-2 border-search_stroke_gray text-black rounded mb-4">
         
         <!-- OTP Channel Selector -->
         <label for="otp-channel" class="block mb-2">OTP Channel:</label>
         <select v-model="otpChannel" id="otp-channel" class="w-full input bg-primary_white border-2 border-search_stroke_gray text-black rounded mb-4">
            <option value="Email">Email</option>
            <option value="SMS">SMS</option>
            <option value="WhatsApp">WhatsApp</option>
         </select>

         <div class="flex items-center mb-4">
            <label for="otp-toggle" class="mr-2">Enable OTP:</label>
            <input v-model="otpEnable" id="otp-toggle" type="checkbox" class="toggle toggle-primary">
         </div>
         <button @click="updateSettings" class="btn bg-dark_green text-white rounded-full capitalize w-full mt-5">Update Settings</button>

         <!-- Success Notification -->
         <div v-if="updateSuccess" class="success-message mt-5" role="alert">
            Settings updated successfully!
         </div>
         <!-- Failure Notification -->
         <div v-if="updateFailure" class="failure-message mt-5" role="alert">
            Unable to update settings!
         </div>
      </div>

      <!-- Sidebar Menu -->
      <ul class="menu w-[10rem] p-0 font-bold text-white justify-between">
         <div>
            <li class="py-2 items-center"><NuxtLink to="/employees">Employees</NuxtLink></li>
            <li class="py-2 items-center"><NuxtLink to="/records">Records</NuxtLink></li>
            <li class="active bg-primary_white rounded-r-[1rem] py-2 items-center text-black"><NuxtLink to="/settings">Settings</NuxtLink></li>         
         </div>
         <div class="self-end mb-1">
            <button @click="logout" class="font-bold btn btn-sm btn-ghost btn-circle w-28">Logout<img class="mx-2 w-4 h-4" src="~/assets/icons/exit_white.png"></button>
         </div>
      </ul>
   </div>

   <!-- Re-authentication Modal -->
   <ReAuthModal 
      :show-modal="showReAuthModal"
      :operation="currentOperation"
      @authenticated="handleReAuthentication"
      @cancelled="cancelReAuthentication"
   />
</template>

<style scoped>
   .success-message {
      background-color: #689E6E;
      color: white;
      padding: 0.5rem;
      margin-bottom: 1rem;
      border-radius: 0.5rem;
      text-align: center;
   }

   .failure-message {
      background-color: #FF5733; /* Red background */
      color: white; /* White text */
      padding: 0.5rem; /* Padding around the text */
      margin-bottom: 1rem; /* Margin at the bottom */
      border-radius: 0.5rem; /* Rounded corners */
      text-align: center; /* Center the text */
   }
</style>

<script setup>
   import { ref } from 'vue';
   import { useRouter } from 'vue-router';
   import { 
      checkUserAuthorization, 
      logSecurityEvent, 
      validatePasswordComplexity,
      validateEmail as validateEmailUtil,
      logAuthenticationAttempt
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