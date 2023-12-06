<template>
   <Title>Verify Time-In</Title>
   <div class="relative-container">
      <div class="card text-black items-center text-center justify-center">
         <div class="card-actions">
            <!-- OTP Invalid Notification -->
            <div v-show="invalidOtp" class="failure-message" role="alert">
               The OTP you have entered is invalid. Please try again.
            </div>
            <!-- OTP Generic Error Notification -->
            <div v-show="errorOtp" class="failure-message" role="alert">
               Unable to verify the entered OTP. Please try again.
            </div>
            <!-- OTP Resend Error Notification -->
            <div v-show="resendError" class="failure-message" role="alert">
               Unable to send a new OTP. Please try again.
            </div>
         </div>
      </div>
   </div>
   <div class="card text-black items-center text-center justify-center h-[25rem] w-[60rem]">
      <h1 class="card-title justify-center text-2xl">ENTER CODE</h1>
      <p>OTP</p>
      <div class="join self-center mt-10">
         <!-- Pass event to watchOtpInput function -->
         <input type="text" placeholder="0" maxlength="1"
               :class="inputClasses"
               v-model="otp1" @input="event => watchOtpInput(event, 'otp2')" ref="otp1Element"/>
         <input type="text" placeholder="0" maxlength="1"
               :class="inputClasses"
               v-model="otp2" @input="event => watchOtpInput(event, 'otp3')" ref="otp2Element"/>
         <input type="text" placeholder="0" maxlength="1"
               :class="inputClasses"
               v-model="otp3" @input="event => watchOtpInput(event, 'otp4')" ref="otp3Element"/>
         <input type="text" placeholder="0" maxlength="1"
               :class="inputClasses"
               v-model="otp4" @input="event => watchOtpInput(event)" ref="otp4Element"/>
      </div>
      <div class="card-actions">
         <button class="btn btn-sm btn-circle w-24 mt-6 bg-button_green btn-ghost text-white" @click="submitOTP">
            Submit
         </button>
      </div>
      <div class="card-actions">
         <!-- Resend OTP button with cooldown counter -->
         <button class="btn btn-sm btn-circle w-24 mt-6 bg-dark_gray btn-ghost text-white" :disabled="cooldown > 0" @click="resendOtp">
            <span v-if="cooldown" class="text-dark_gray">{{ cooldown }}</span>
            <span v-else>Resend</span>
         </button>
      </div>
   </div>
</template>

<style scoped>
   .relative-container {
      position: relative;
   }

   .failure-message {
      position: absolute; /* Make the notification absolute */
      top: 0; /* Position it at the top of the container */
      left: 50%; /* Center horizontally */
      transform: translateX(-50%); /* Adjust horizontal centering */
      background-color: #FF5733; /* Red background */
      color: white; /* White text */
      padding: 0.5rem; /* Padding around the text */
      border-radius: 0.5rem; /* Rounded corners */
      text-align: center; /* Center the text */
      width: 43%; /* Full width of the container */
      box-sizing: border-box; /* Include padding and border in the element's total width and height */
      margin-top: -55px; /* Bypass padding */
   }
</style>

<script setup>

   import { ref } from 'vue';
   import { useRouter } from 'vue-router';

   const inputClasses = "input input-sm join-item mx-2 w-10 text-2xl bg-primary_white text-center border-0 border-b-4 rounded-none border-primary_green";

   // Reactive properties for v-model
   const otp1 = ref('');
   const otp2 = ref('');
   const otp3 = ref('');
   const otp4 = ref('');

   // Define refs for input elements
   const otp1Element = ref(null);
   const otp2Element = ref(null);
   const otp3Element = ref(null);
   const otp4Element = ref(null);

   // Ref for OTP notifs
   const invalidOtp = ref(false);
   const errorOtp = ref(false);
   const resendError = ref(false);

   // Cooldown for resend OTP
   const cooldown = ref(0);
   let intervalId = null;

   const router = useRouter();
   const supabase = useSupabaseClient();

   // Function to submit the OTP
   const submitOTP = async () => {
      const { data: { user } } = await supabase.auth.getUser();  // Get the current user

      // Combine the individual digits into one code
      const otpCode = otp1.value + otp2.value + otp3.value + otp4.value;

      // Send the OTP code to server for verification
      try {
         const response = await fetch('/api/verify-otp', {
            method: 'POST',
            headers: {
               'Content-Type': 'application/json',
            },
            body: JSON.stringify({ otpCode }),
         });

         if (!response.ok) {
            throw new Error('Network response was not ok');
         }

         const data = await response.json();
         if (data.success) {
            // Remove error notifs
            invalidOtp.value = false;
            errorOtp.value = false;
            resendError.value = false;

            // Get the current timestamp
            const currentTime = new Date().toISOString();
            console.log("Time-in time:", currentTime);

            // Time the user in
            try {
               const { data, error } = await supabase
                  .from('Employees')
                  .update({
                     time_in: currentTime,
                     time_in_status: true
                  })
                  .eq('id', user.id)
                  .select();

               // Check if the database update was successful
               if (data) {
                  console.log('Time-in successful:', data);
                  router.push('/clock-out'); // Navigate to clock-out page
               } else if (error) {
                  throw error;
               }
            } catch(supabaseError) {
               console.error('Error during time-in:', supabaseError);
            }
         } else {
            console.error('Failed to verify OTP:', data.message);
            invalidOtp.value = true;
         }
      } catch (err) {
         console.error('Error submitting OTP:', err.message);
         errorOtp.value = true;
      }
   };

   // Function to watch OTP input changes and move focus to the next input
   const watchOtpInput = (event, nextInputRef) => {
      const input = event.target;
      if (input.value.length >= input.maxLength) {
         if (nextInputRef) {
            switch (nextInputRef) {
               case 'otp2':
                  otp2Element.value.focus();
                  break;
               case 'otp3':
                  otp3Element.value.focus();
                  break;
               case 'otp4':
                  otp4Element.value.focus();
                  break;
               // No default needed since otp4 is the last input
            }
         }
      }
   };

   // Time-in function with OTP sending
   const resendOtp = async () => {

      if (cooldown.value > 0) {
         console.log('Please wait before resending OTP.');
         return;
      }
      const { data: { user } } = await supabase.auth.getUser();  // Get the current user

      // Check if the user exists
      if (user) {
         // Get the current timestamp
         const currentTime = new Date().toISOString();
         console.log("Attempting to send OTP at time:", currentTime);

         // Remove OTP error notifs
         invalidOtp.value = false;
         errorOtp.value = false;
         resendError.value = false;

         // Check if employee is already timed-in
         const { data, error } = await supabase
            .from('Employees')
            .select('time_in_status') // Checks whether the user is timed-in or not
            .eq('id', user.id);

         if (error) {
            console.log("Error fetching data from Supabase:", error);
            return;
         } else if (data && data.length > 0) {
            const timeInStatus = data[0].time_in_status;
            if (!timeInStatus) {
               // If the user is not timed-in, send an OTP before proceeding
               try {
                  const otpResponse = await fetch('/api/send-otp', {
                     method: 'POST',
                     headers: {
                     'Content-Type': 'application/json'
                     },
                  });
                  const otpResult = await otpResponse.json();
                  
                  if (otpResult.success) {
                     console.log('OTP sent successfully:', otpResult.verificationSid);
                     // Redirect the user to the OTP verification page
                     router.push('/verify-otp');
                  } else {
                     console.error('Error sending OTP:', otpResult.error);
                     resendError.value = true;
                  }
               } catch (otpError) {
                  console.error('Failed to send OTP:', otpError);
                  resendError.value = true;
               }
            } else {
               console.log("Cannot time-in because the user is already timed-in!");
            }
         } else {
            console.log("No data returned from Supabase.");
         }
      } else {
         console.log('User is not logged in.');
      }

      // Start cooldown after sending OTP
      startCooldown();
   };

   // Function to initiate cooldown
   const startCooldown = () => {
      cooldown.value = 20;
      intervalId = setInterval(() => {
         if (cooldown.value > 0) {
            cooldown.value--;
         } else {
            clearInterval(intervalId);
         }
      }, 1000);
   };

   // Watch for cooldown to be 0 to enable the button
   watch(cooldown, (newValue) => {
      if (newValue === 0) {
         clearInterval(intervalId);
      }
   });

   const checkTimeInStatus = async () => {
      const { data: { user } } = await supabase.auth.getUser();  // Get the current user

      if(user) {

         const { data, error } = await supabase
            .from('Employees')
            .select('time_in_status') // Checks whether the user is timed-in or not
            .eq('id', user.id);

         if(error) {
            console.log("Error fetching data from Supabase:", error);
         } else if(data && data.length > 0) {
            const timeInStatus = `${data[0].time_in_status}`;
            console.log("User time-in status:", timeInStatus);
            if(timeInStatus == 'true') {
               router.push('/clock-out'); // Redirect to clock-out page if user is timed-in
            }
         } else {
            console.log("No data returned from Supabase.");
         }

      } else {
         console.log("Error fetching current user data.");
      }
   }

   // Redirect user to clock-out page if user is currently timed-in
   checkTimeInStatus();

</script>