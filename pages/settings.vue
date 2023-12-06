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
         <button @click="updateCredentials" class="btn bg-dark_green text-white rounded-full capitalize w-full mt-5">Update Credentials</button>

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

   // Function to update user account credentials in Supabase Auth
   const updateCredentials = async () => {
      if (!isValidEmail(accountEmail.value)) {
         alert("Please enter a valid email address.");
         return;
      }

      const { data, error } = await supabase.auth.updateUser({
         email: accountEmail.value,
         password: password.value
      });

      if (error) {
         console.error('Error updating account credentials:', error);
         updateAccountSuccess.value = false;
         updateAccountFailure.value = true; // Display fail notif
         setTimeout(() => updateAccountFailure.value = false, 5000); // Hides notif after 5 seconds
      } else {
         console.log('Account credentials successfully updated for current user:', data);
         updateAccountSuccess.value = true; // Display success notif
         updateAccountFailure.value = false;
         setTimeout(() => updateAccountSuccess.value = false, 10000); // Hides notif after 10 seconds
      }
   };

   function isValidEmail(email) {
      const regex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
      return regex.test(email);
   }

   function isValidPhoneNumber(phoneNumber) {
      const regex = /^\+[1-9]\d{1,14}$/;
      return regex.test(phoneNumber);
   }

   // Verification check to see if user is an admin or developer before showing settings icon
   const verifyUserRank = async () => {
      const { data: { user } } = await supabase.auth.getUser();  // Get the current user

      if (user) {
         // Check if employee is an admin or developer
         const { data, error } = await supabase
            .from('Employees')
            .select('rank')
            .eq('id', user.id);

         if (error) {
            console.log("Error fetching data from Supabase:", error);
            return;
         } else if (data && data.length > 0) {
            const userRole = data[0].rank;
            if (!(userRole.toLowerCase() == 'admin' || userRole.toLowerCase() == 'developer')) {
               alert('You do not have permission to view this page!');
               router.push('/');
            }
         } else {
            console.log("No data returned from Supabase.");
         }
      } else {
         console.log("User is not logged in.");
      }
   }

   // Logout function
   const logout = async () => {
      const { error } = await supabase.auth.signOut();
      if (error) {
         console.error("Error logging out:", error);
      } else {
         router.push('/login');
      }
   };

   // Functions to be run once page loads
   fetchSettings();
   verifyUserRank();

</script>