<template>
   <div class="card text-black flex items-center justify-center h-[30rem] w-[60rem]">
      <div class="flex flex-row self-end">
         <p class="mr-4 ">Status:</p>
         <div class="bg-clock_out_red rounded-full w-2.5 h-2.5 mx-1 mt-2"></div>
         <p>Out</p>
      </div>
      <h1 class="card-title text-2xl mt-24">{{ greeting }},</h1>
      <p>{{ username }}</p>
      <p class="mt-5 mb-1.5">{{ currentTime }}</p>
      <div class="card-actions">
         <button @click="timeIn" class="btn btn-circle btn-ghost w-36 h-36 mt-1 bg-clock_in_green text-white">Time In</button>
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

         // Redirect user to clock-out page if user is currently timed-in
         checkTimeInStatus();

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

         // Initialize and update every minute
         updateTimeAndGreeting();
         setInterval(updateTimeAndGreeting, 60000);

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

         fetchCurrentUser();

         // Logout function
         const logout = async () => {
            const { error } = await supabase.auth.signOut();
            if (error) {
               console.error("Error logging out:", error);
            } else {
               router.push('/login');
            }
         };

         // Time-in function
         const timeIn = async () => {
            const { data: { user } } = await supabase.auth.getUser();  // Get the current user

            // Check if the user exists
            if (user) {
               // Get the current timestamp
               const currentTime = new Date().toISOString();
               console.log("Current time:", currentTime);

               // Check if employee is already timed-in
               const { data, error } = await supabase
                  .from('Employees')
                  .select('time_in_status') // Checks whether the user is timed-in or not
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

         return { currentTime, greeting, username, logout, timeIn };
      }
   };

</script>