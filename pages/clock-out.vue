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

   import { ref } from "vue";

   export default {
      setup() {
         const supabase = useSupabaseClient();
         const currentTime = ref("");
         const greeting = ref("");
         const username = ref("");

         const updateTimeAndGreeting = () => {
            const date = new Date();
            const hours = date.getHours();
            const minutes = date.getMinutes();

            // Update current time
            currentTime.value = `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")} ${hours >= 12 ? 'PM' : 'AM'}`;

            // Update greeting based on time
            if (hours < 12) {
               greeting.value = "Good Morning";
            } else if (hours < 18) {
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
               navigateTo('/login');
            }
         };

         // Time-out function
         const timeOut = async () => {
            const { data: { user } } = await supabase.auth.getUser();  // Get the current user
            // Check if the user exists
            if (user) {
               // Get the current timestamp
               const currTime = new Date().toISOString();
               console.log("Current time:", currentTime);

               // Update the Employees table with the current time-out timestamp and set time_in_status to false
               const { data, error } = await supabase
                  .from('Employees')
                  .update({
                     time_out: currTime,
                     time_in_status: false
                  })
                  .eq('id', user.id)
                  .select();

               // Check if the update was successful
               if (data) {
                  console.log('Time-out successful:', data);
                  navigateTo('/');
               } else if (error) {
                  console.error('Error during time-out:', error);
               }
            } else {
               console.log('User is not logged in.');
            }
         }

         return { currentTime, greeting, username, logout, timeOut };
      }
   };

</script>