<template>
   <div class="card text-black flex items-center justify-center h-[30rem] w-[60rem]">
      <div class="flex flex-row self-end">
         <p class="mr-4 ">Status:</p>
         <div class="bg-clock_in_green rounded-full w-2.5 h-2.5 mx-1 mt-2"></div>
         <p>In</p>
      </div>
      <h1 class="card-title text-2xl mt-24">{{ greeting }},</h1>
      <p>{{ username }}</p>
      <p class="mt-5 mb-1.5">{{ currentTime }}</p>
      <div class="card-actions">
         <button @click="timeOut" class="btn btn-circle btn-ghost w-36 h-36 mt-1 bg-clock_out_red text-white">Time Out</button>
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
                  if(timeInStatus == 'false') {
                     router.push('/'); // Redirect to time-in page if user is not timed-in
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

         // Time-out function
         const timeOut = async () => {
            const { data: { user } } = await supabase.auth.getUser();  // Get the current user

            // Check if the user exists
            if (user) {
               // Get the current timestamp for time-out
               const currentTimeOut = new Date().toISOString();

               // Retrieve the user's current time-in status and time-in timestamp
               const { data: employeeData, error: employeeError } = await supabase
                  .from('Employees')
                  .select('time_in, time_in_status')
                  .eq('id', user.id)
                  .single();

               if (employeeError) {
                  console.error("Error fetching employee data:", employeeError);
                  return;
               }

               // Check if employee is currently timed-in
               if (employeeData && employeeData.time_in_status) {
                  const timeIn = new Date(employeeData.time_in);
                  const timeOut = new Date(currentTimeOut);

                  // Calculate the duration in minutes
                  const durationMinutes = Math.round((timeOut - timeIn) / 60000);

                  // Record the time-in and time-out in the TimeSheet table
                  const { data: timeSheetData, error: timeSheetError } = await supabase
                     .from('TimeSheet')
                     .insert({
                        user_id: user.id,
                        time_in: employeeData.time_in,
                        time_out: currentTimeOut,
                        duration: durationMinutes
                     });

                  if (timeSheetError) {
                     console.error("Error recording time-out to TimeSheet:", timeSheetError);
                     return;
                  }

                  // Update the Employees table to set time_in_status to false
                  const { error: updateTimeError } = await supabase
                     .from('Employees')
                     .update({
                        time_in_status: false,
                        time_out: currentTimeOut
                     })
                     .eq('id', user.id);

                  if (updateTimeError) {
                     console.error("Error updating employee time-in status:", updateTimeError);
                  } else {
                     console.log('Time-out successful:', currentTimeOut);
                     router.push('/');
                  }

               } else {
                  console.log("Cannot time-out because the user is not timed-in!");
               }

            } else {
               console.log('User is not logged in.');
            }
         };

         return { currentTime, greeting, username, logout, timeOut };
      }
   };

</script>