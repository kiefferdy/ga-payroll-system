<template>
   <div class="card card-side bg-off_white justify-between items-center h-12 p-5 m-5 mx-10">
      <div class="card card-side items-center">
         <img src="~/assets/icons/user.png" class="w-8 rounded-full me-2" />
         <p>{{ employee.first_name }} {{ employee.last_name }}</p>
      </div>
      <div class="card card-side">
         <div class="me-10">
            <div class="flex flex-row self-end">
               <p class="mr-4">Status:</p>
               <div :class="[employee.time_in_status ? 'bg-clock_in_green' : 'bg-clock_out_red']" class="rounded-full w-2.5 h-2.5 mx-1 mt-2"></div>
               <p>{{ employee.time_in_status ? 'In' : 'Out' }}</p>         
            </div>
            <p class="text-xs">Last updated: {{ formatTime(employee.last_updated) }}</p>
         </div>
         <div class="card card-side items-center">
            <NuxtLink :to="`/edit-account/${employee.id}`">
               <button class="btn btn-info btn-sm me-2"><img src="~/assets/icons/edit.png" class="w-4"></button>
            </NuxtLink>
            <button @click="handleDelete" class="btn btn-error btn-sm"><img src="~/assets/icons/delete.png" class="w-4"></button>
         </div>         
      </div>
   </div>
</template>

<script setup>

   import { useRouter } from 'vue-router';

   const supabase = useSupabaseClient();
   const router = useRouter();

   const props = defineProps({
      employee: Object
   });

   const formatTime = (time) => {
      const formattedTime = new Date(time);
      return formattedTime.toLocaleString();
   };

   // Handles employee deletion
   const handleDelete = async () => {
      const confirmDelete = window.confirm('Are you sure you want to proceed? Deleting this user will erase all of their data. This action cannot be undone.');
      
      if (confirmDelete) {
         try {
            const { data: { user } } = await supabase.auth.getUser();  // Get the user performing the action
            
            if (!user) {
               alert('Authentication required. Please log in again.');
               return;
            }

            // Call the delete user API endpoint
            const response = await $fetch('/api/delete-user', {
               method: 'POST',
               headers: {
                  'Content-Type': 'application/json'
               },
               body: JSON.stringify({ 
                  targetId: props.employee.id,
                  userId: user.id
               })
            });

            if (response.success) {
               alert(response.message || "The user has been successfully deleted!");
               router.go(); // Refresh the page to show updated employee list
            } else {
               alert(response.message || "Unable to delete user.");
            }
            
         } catch (error) {
            console.error("Error deleting user:", error);
            
            // Handle different error types
            if (error.statusCode === 403) {
               alert('You do not have permission to delete users.');
            } else if (error.statusCode === 409) {
               alert(error.statusMessage || 'Cannot delete user due to a conflict.');
            } else if (error.statusCode === 404) {
               alert('User not found.');
            } else {
               alert('An error occurred during the deletion process. Please try again.');
            }
         }
      }
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

   // Functions to be run once page loads
   verifyUserRank();

</script>