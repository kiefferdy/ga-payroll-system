<template>
   <Title>Admin - Employees</Title>
   <div class="card card-side h-[37rem] w-[65rem] bg-dark_green text-black">
      <div class="card h-[37rem] w-[55rem] bg-primary_white rounded rounded-l-[1rem] rounded-tr-[0rem] rounded-br-[1rem]">
         <div class="card card-side  mx-10 mt-5 justify-between">
            <div class="join">
               <input type="text" v-model="searchBar" @keypress="search" placeholder="Search..." class="input input-sm bg-primary_white border-search_stroke_gray rounded rounded-l-full w-60"/>
               <button @click="search" class="btn btn-sm btn-ghost bg-dark_green w-10 rounded rounded-r-full btn-round">
                  <img src="~/assets/icons/search.png">
               </button>
            </div>
            <div>
               <NuxtLink to="/create-account"><button class="btn btn-sm bg-dark_green btn-ghost text-white rounded-full capitalize"><img src="~/assets/icons/add.png" class="w-4">Add Account</button></NuxtLink>
            </div> 
         </div>
         <div>
            <div v-if="filteredEmployees.length == 0">
               <div v-for="p in Employees" :key="p.id">
                  <ProfileCard :employee="p" />
               </div>
            </div>
            <div v-else-if="filteredEmployees.length > 0">
               <div v-for="p in filteredEmployees" :key="p.id">
                  <ProfileCard :employee="p" />
               </div>
            </div>
            <div v-else>
               <p class="flex self-center justify-center">No matching employees found.</p>
            </div>
         </div>
      </div>
      <ul class="menu w-[10rem] p-0 font-bold text-white justify-between">
         <div>
            <li class="active bg-primary_white rounded-r-[1rem] py-2 items-center text-black"><NuxtLink to="/employees">Employees</NuxtLink></li>
            <li class="py-2 items-center"><NuxtLink to="/records">Records</NuxtLink></li>
            <li class="py-2 items-center"><NuxtLink to="/settings">Settings</NuxtLink></li>
         </div>
         <div class="self-end mb-1">
            <button @click="logout" class="font-bold btn btn-sm btn-ghost btn-circle w-28">Logout<img class="mx-2 w-4 h-4" src="~/assets/icons/exit_white.png"></button>
         </div>
      </ul>
   </div>
</template>

<script setup>

   import { useRouter } from 'vue-router';

   const supabase = useSupabaseClient();
   const router = useRouter();

   // Refs for template
   const Employees = ref([]);

   // Fetch all employees
   const fetchEmployees = async () => {
      const { data, error } = await supabase
         .from('Employees')
         .select('*');

      Employees.value = data;

      if (error) {
         console.error(error);
      }
   };

   // Additional ref for storing filtered employees
   const filteredEmployees = ref([]);
   const searchBar = ref('')

   // Search function
   const search = () => {
      // Convert search input to lowercase for case-insensitive search
      const searchTerm = searchBar.value.toLowerCase();

      // Filter the employees based on the search criteria
      filteredEmployees.value = Employees.value.filter((p) => {
         const firstNameMatch = p.first_name.toLowerCase().includes(searchTerm);
         const lastNameMatch = p.last_name.toLowerCase().includes(searchTerm);

         return firstNameMatch || lastNameMatch;
      });
   };

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
   verifyUserRank();
   fetchEmployees();

</script>