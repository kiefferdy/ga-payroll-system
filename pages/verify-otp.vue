<template>
   <div class="card text-black items-center text-center justify-center h-[30rem] w-[60rem]">
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
         <button class="btn btn-sm btn-circle w-24 mt-6 bg-button_green btn-ghost text-white" @click="submitOTP">Submit</button>
      </div>
   </div>
</template>

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
         }
      } catch (err) {
         console.error('Error submitting OTP:', err.message);
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

</script>