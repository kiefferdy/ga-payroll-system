<template>
   <Title>Home - {{ username }}</Title>
   <div class="card text-black flex items-center justify-center h-[30rem] w-[60rem]">
      <!-- Settings Icon as a Button -->
      <div v-if="userIsAdmin" class="absolute top-0 left-0">
         <button @click="goToSettings" class="flex items-center justify-center">
            <img src="~/assets/icons/settings.png" alt="Settings" class="w-6 h-6"> <!-- Adjust the path and size as needed -->
         </button>
      </div>
      <div class="flex flex-row self-end">
         <p class="mr-4 ">Status:</p>
         <div class="bg-clock_out_red rounded-full w-2.5 h-2.5 mx-1 mt-2"></div>
         <p>Out</p>
      </div>
      <h1 class="card-title text-2xl mt-24">{{ greeting }},</h1>
      <p>{{ username }}</p>
      <p class="mt-5 mb-1.5">{{ currentTime }}</p>
      <div class="card-actions">
         <button @click="initializeTimeIn" class="btn btn-circle btn-ghost w-36 h-36 mt-1 bg-clock_in_green text-white">Time In</button>
      </div>
      <div class="card-actions self-end mt-24">
         <button @click="logout" class="font-bold btn btn-sm btn-ghost btn-circle w-32 ">Logout<img class="mx-2 w-4 h-4" src="~/assets/icons/exit.png"></button>
      </div>
   </div>
</template>
 
<script>

   import { ref } from 'vue';
   import { useRouter } from 'vue-router';

   export default {
      setup() {
         const router = useRouter();
         const supabase = useSupabaseClient();

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
                     router.push('/clock-out'); // Redirect to time-out page if user is timed-in
                  }
               } else {
                  console.log("No data returned from Supabase.");
               }

            } else {
               console.log("Error fetching current user data.");
            }
         }

         const currentTime = ref("");
         const greeting = ref("");
         const username = ref("");

         const updateTimeAndGreeting = () => {
            const date = new Date();
            let hours = date.getHours();
            const minutes = date.getMinutes();
            const ampm = hours >= 12 ? 'PM' : 'AM';
            hours = hours % 12;
            hours = hours ? hours : 12; // the hour '0' should be '12'
            const strTime = hours.toString().padStart(2, '0') + ':' + minutes.toString().padStart(2, '0') + ' ' + ampm;

            // Update current time
            currentTime.value = strTime;

            // Update greeting based on time
            if (hours < 12 && ampm === 'AM') {
               greeting.value = "Good Morning";
            } else if (hours < 6 && ampm === 'PM') {
               greeting.value = "Good Afternoon";
            } else {
               greeting.value = "Good Evening";
            }
         };

         // Fetch current user info
         const fetchCurrentUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();  // Get the current user
            if (user) {
               const { data, error } = await supabase
                  .from('Employees')
                  .select('first_name')
                  .eq('id', user.id);  // Use the UUID of the current user

               console.log("Fetched current user data:", data);

               if (data && data.length > 0) {
                  username.value = `${data[0].first_name}`;
               } else if (error) {
                  console.error('Error fetching user info:', error);
               }
            } else {
               console.log("Error fetching current user data.");
            }
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

         // Get server time function
         const getServerTime = async () => {
            try {
               const response = await fetch('/api/clock');
               if (!response.ok) {
                  throw new Error("Error fetching server time");
               }
               const data = await response.json();
               return data.time;
            } catch (error) {
               console.error(error);
               return null;
            }
         }

         // Initialize time-in function (runs when user clicks time-in button)
         const initializeTimeIn = async () => {
            const { data: { user } } = await supabase.auth.getUser();  // Get the current user

            if (user) {
               // Check the global OTP enable setting first
               const { data: globalSettings, error: settingsError } = await supabase
                  .from('Settings')
                  .select('otp_enable')
                  .single();

               if (settingsError) {
                  console.error("Error fetching global settings:", settingsError);
                  return;
               }

               if (globalSettings.otp_enable) {
                  // If OTP feature is globally enabled
                  const { data, error } = await supabase
                     .from('Employees')
                     .select('requires_otp')
                     .eq('id', user.id);

                  if (error) {
                     console.log("Error fetching data from Supabase:", error);
                  } else if (data && data.length > 0) {
                     const requiresOtp = `${data[0].requires_otp}`;
                     if (requiresOtp == 'true') {
                        timeInWithOTP(); // Call OTP version if user requires OTP
                     } else {
                        timeIn(); // Call regular version otherwise
                     }
                  } else {
                     console.log("No data returned from Supabase.");
                  }
               } else {
                  console.log(globalSettings.otp_enable);
                  timeIn(); // Call regular version if OTP is globally disabled
               }
            } else {
               console.log("User is not logged in.");
            }
         }

         // Time-in function without OTP sending
         const timeIn = async () => {
            const { data: { user } } = await supabase.auth.getUser();  // Get the current user

            // Check if the user exists
            if (user) {
               // Get the current timestamp from the server
               const currentTime = await getServerTime();

               if (!currentTime) {
                  console.error("Failed to fetch server time");
                  return;
               }
               console.log("Time-in time:", currentTime);

               // Check if employee is already timed-in
               const { data, error } = await supabase
                  .from('Employees')
                  .select('time_in_status') // Whether the user is timed-in or not
                  .eq('id', user.id);

               if (error) {
                  console.log("Error fetching data from Supabase:", error);

               } else if (data && data.length > 0) {
                  const timeInStatus = `${data[0].time_in_status}`;
                  if (timeInStatus == 'false') {
                     // Update the Employees table with the current time-in timestamp and set time_in_status to true
                     const { data, error } = await supabase
                        .from('Employees')
                        .update({
                           time_in: currentTime,
                           time_in_status: true
                        })
                        .eq('id', user.id)
                        .select();

                     // Check if the update was successful
                     if (data) {
                        console.log('Time-in successful:', data);
                        router.push('/clock-out');
                     } else if (error) {
                        console.error('Error during time-in:', error);
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
         }

         // Time-in function with OTP sending
         const timeInWithOTP = async () => {
            const { data: { user } } = await supabase.auth.getUser();  // Get the current user

            // Check if the user exists
            if (user) {
               // Get the current timestamp
               const currentTime = await getServerTime();

               if (!currentTime) {
                  console.error("Failed to fetch server time");
                  return;
               }
               console.log("Attempting to send OTP at time:", currentTime);

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
                        }
                     } catch (otpError) {
                        console.error('Failed to send OTP:', otpError);
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
         };

         // True if user is an admin or developer
         const userIsAdmin = ref(false);

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
                  if (userRole.toLowerCase() == 'admin' || userRole.toLowerCase() == 'developer') {
                     userIsAdmin.value = true;
                  }
               } else {
                  console.log("No data returned from Supabase.");
               }
            } else {
               console.log("User is not logged in.");
            }
         }

         // Settings link
         const goToSettings = async () => {
            if (userIsAdmin.value) {
               router.push('/settings');
            } else {
               console.log("Access denied. User is not an admin or developer.");
            }
         };

         // Functions to be run once page loads
         fetchCurrentUser(); // Fetches the currently signed-in user
         verifyUserRank(); // Only shows the settings icon if user is an admin or dev
         checkTimeInStatus(); // Redirect user to clock-out page if user is currently timed-in
         updateTimeAndGreeting(); // Get current time and appropriate greeting
         setInterval(updateTimeAndGreeting, 60000); // Update time and greeting every minute

         return { currentTime, greeting, username, userIsAdmin, initializeTimeIn, logout, goToSettings };
      }
   };

</script>