<template>
   <div class="card card-side h-[37rem] w-[65rem] bg-dark_green text-black">
      <!-- Account Credentials Column -->
      <div class="flex-1 bg-primary_white rounded-l-[1rem] p-10">
         <label for="company-email" class="block mb-2">Account Email:</label>
         <input id="company-email" type="email" placeholder="Email" class="w-full input bg-primary_white border-2 border-search_stroke_gray text-black rounded mb-4">

         <label for="company-password" class="block mb-2">Account Password:</label>
         <input id="company-password" :type="passwordFieldType" placeholder="Password" class="w-full input bg-primary_white border-2 border-search_stroke_gray text-black rounded mb-2" v-model="password">
         <div class="flex items-center mb-4">
            <input type="checkbox" id="show-password" @click="hidePassword = !hidePassword" class="mr-2" />
            <label for="show-password">Show Password</label>
         </div>
         <button class="btn bg-dark_green text-white rounded-full capitalize w-full mt-7">Update Credentials</button>
      </div>

      <!-- Settings Column -->
      <div class="flex-1 bg-primary_white rounded-r-[1rem] p-10">
         <label for="otp-email" class="block mb-2">OTP Email:</label>
         <input v-model="otpEmail" id="otp-email" type="email" placeholder="OTP Email" class="w-full input bg-primary_white border-2 border-search_stroke_gray text-black rounded mb-4">
         
         <label for="otp-phone" class="block mb-2">OTP Phone Number:</label>
         <input v-model="otpPhone" id="otp-phone" type="tel" placeholder="OTP Phone Number" class="w-full input bg-primary_white border-2 border-search_stroke_gray text-black rounded mb-4">
         
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
            <button class="font-bold btn btn-sm btn-ghost btn-circle w-28">Logout<img class="mx-2 w-4 h-4" src="~/assets/icons/exit_white.png"></button>
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

   // Hide password functionality
   const hidePassword = ref(true);
   const password = ref("");
   const passwordFieldType = computed(() => hidePassword.value ? "password" : "text");

   const supabase = useSupabaseClient();

   const otpEmail = ref('');
   const otpPhone = ref('');
   const otpEnable = ref(false);
   const updateSuccess = ref(false);
   const updateFailure = ref(false);

   // Function to fetch settings from Supabase
   const fetchSettings = async () => {
      const { data, error } = await supabase
         .from('Settings')
         .select('otp_email, otp_phone, otp_enable')
         .single(); // Assumes there's only one settings row.

      if (error) {
         console.error('Error fetching settings:', error);
      } else if (data) {
         otpEmail.value = data.otp_email || '';
         otpPhone.value = data.otp_phone || '';
         otpEnable.value = data.otp_enable || false;
      }
   };

   fetchSettings();

   // Function to update settings in Supabase
   const updateSettings = async () => {
      const updates = {
         otp_email: otpEmail.value,
         otp_phone: otpPhone.value,
         otp_enable: otpEnable.value,
         last_updated: new Date()
      };

      const { error } = await supabase
         .from('Settings')
         .update(updates)
         .match({ id: 1 }); // Replace with the correct identifier for your settings row.

      if (error) {
         console.error('Error updating settings:', error);
         updateSuccess.value = false;
         updateFailure.value = true; // Display fail notif
         setTimeout(() => updateFailure.value = false, 5000); // Hides notif after 5 seconds
      } else {
         updateSuccess.value = true; // Display success notif
         updateFailure.value = false;
         setTimeout(() => updateSuccess.value = false, 5000); // Hides notif after 5 seconds
      }
   };
</script>