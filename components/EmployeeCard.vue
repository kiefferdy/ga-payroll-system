<template>
   <div class="bg-white rounded-xl shadow-sm border border-search_stroke_gray hover:shadow-md transition-all duration-200 overflow-hidden">
      <!-- Card Header with Avatar and Status -->
      <div class="p-6">
         <div class="flex items-start justify-between mb-4">
            <div class="flex items-center space-x-3">
               <div class="relative">
                  <div class="w-12 h-12 bg-gradient-to-br from-primary_green to-dark_green rounded-full flex items-center justify-center">
                     <img src="~/assets/icons/user.png" class="w-6 h-6" />
                  </div>
                  <!-- Status indicator -->
                  <div 
                     :class="[employee.time_in_status ? 'bg-clock_in_green' : 'bg-clock_out_red']" 
                     class="absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white"
                  ></div>
               </div>
               <div>
                  <h3 class="font-semibold text-dark_gray text-lg">{{ employee.first_name }} {{ employee.last_name }}</h3>
                  <p class="text-sm text-dark_gray/60 capitalize">{{ employee.rank || 'Employee' }}</p>
               </div>
            </div>
            
            <!-- Lock status badge -->
            <div v-if="isAccountLocked" class="flex items-center space-x-1 bg-clock_out_red/10 text-clock_out_red px-2 py-1 rounded-full text-xs font-medium">
               <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
               </svg>
               <span>Locked</span>
            </div>
         </div>

         <!-- Employee Details -->
         <div class="space-y-3 mb-6">
            <div class="flex items-center justify-between py-2 border-b border-search_stroke_gray/50">
               <span class="text-sm text-dark_gray/70">Status:</span>
               <div class="flex items-center space-x-2">
                  <div :class="[employee.time_in_status ? 'bg-clock_in_green' : 'bg-clock_out_red']" class="w-2 h-2 rounded-full"></div>
                  <span class="text-sm font-medium" :class="[employee.time_in_status ? 'text-clock_in_green' : 'text-clock_out_red']">
                     {{ employee.time_in_status ? 'Clocked In' : 'Clocked Out' }}
                  </span>
               </div>
            </div>
            
            <div class="flex items-center justify-between py-2 border-b border-search_stroke_gray/50">
               <span class="text-sm text-dark_gray/70">Employee ID:</span>
               <span class="text-sm font-mono text-dark_gray">{{ employee.id.slice(0, 8) }}...</span>
            </div>
            
            <div class="flex items-center justify-between py-2">
               <span class="text-sm text-dark_gray/70">Last Activity:</span>
               <span class="text-sm text-dark_gray">{{ formatTime(employee.last_updated) }}</span>
            </div>
         </div>

         <!-- Action Buttons -->
         <div class="flex items-center justify-end space-x-2">
            <button 
               v-if="isAccountLocked" 
               @click="handleUnlock" 
               :disabled="isUnlocking"
               class="btn btn-sm bg-orange-500 hover:bg-orange-600 text-white border-none" 
               title="Unlock Account"
            >
               <span v-if="isUnlocking" class="loading loading-spinner loading-xs"></span>
               <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" />
               </svg>
            </button>
            
            <NuxtLink :to="`/edit-account/${employee.id}`">
               <button class="btn btn-sm bg-blue-500 hover:bg-blue-600 text-white border-none" title="Edit Employee">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                     <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
               </button>
            </NuxtLink>
            
            <button @click="handleDelete" class="btn btn-sm bg-clock_out_red hover:bg-red-700 text-white border-none" title="Delete Employee">
               <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
               </svg>
            </button>
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

   const emit = defineEmits(['employee-unlocked']);

   // Reactive state for unlock operation
   const isUnlocking = ref(false);

   // Computed property to check if account is locked
   const isAccountLocked = computed(() => {
      if (!props.employee.locked_until) return false;
      const lockExpiry = new Date(props.employee.locked_until);
      const now = new Date();
      return lockExpiry > now;
   });

   const formatTime = (time) => {
      const formattedTime = new Date(time);
      return formattedTime.toLocaleDateString() + ' ' + formattedTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
   };

   // Handles account unlock
   const handleUnlock = async () => {
      const targetEmail = await getEmployeeEmail();
      if (!targetEmail) {
         alert('Unable to retrieve employee email');
         return;
      }

      if (!confirm(`Are you sure you want to unlock the account for ${props.employee.first_name} ${props.employee.last_name} (${targetEmail})?`)) {
         return;
      }

      isUnlocking.value = true;

      try {
         const response = await $fetch('/api/unlock-account', {
            method: 'POST',
            body: { targetEmail }
         });

         if (response.success) {
            alert(`Account for ${targetEmail} has been unlocked successfully`);
            emit('employee-unlocked');
         } else {
            alert(`Failed to unlock account: ${response.error}`);
         }
      } catch (error) {
         console.error('Error unlocking account:', error);
         alert('Failed to unlock account. Please try again.');
      } finally {
         isUnlocking.value = false;
      }
   };

   // Get employee email from auth.users table via API
   const getEmployeeEmail = async () => {
      try {
         const response = await $fetch('/api/get-user-email', {
            method: 'POST',
            body: { userId: props.employee.id }
         });

         if (response.success) {
            return response.email;
         } else {
            console.error('Error getting email:', response.error);
            return null;
         }
      } catch (error) {
         console.error('Error getting employee email:', error);
         return null;
      }
   };

   // Handles employee deletion
   const handleDelete = async () => {
      const confirmDelete = window.confirm('Are you sure you want to proceed? Deleting this user will erase all of their data. This action cannot be undone.');
      
      if (confirmDelete) {
         const { data, error } = await supabase
            .from('Employees')
            .delete()
            .eq('id', props.employee.id);
            
         if (error) {
            console.log("Error deleting user: ", error);
            alert('An error occurred with the deletion process. The user was not deleted.');
         } else {
            console.log('Successfully deleted user:', data);
            const { data: { user } } = await supabase.auth.getUser();  // Get the user performing the action
            console.log("Retrieved user:", user);

            // Sending delete user request to server
            const response = await fetch('/api/delete-user', {
                  method: 'POST',
                  headers: {
                     'Content-Type': 'application/json'
                  },
                  body: JSON.stringify({ 
                     targetId: props.employee.id,
                     userId: user.id
                  })
            });

            const result = await response.json();
            if (!response.ok) {
               alert("Unable to delete the user's credentials.");
            } else {
               console.log("Successfully deleted user from Supabase Auth:", result.data);
               alert("The user has been successfully deleted!");
               router.go();
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