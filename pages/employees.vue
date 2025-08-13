<template>
   <Title>Admin - Employees</Title>
   <div class="min-h-screen bg-primary_white">
      <!-- Top Navigation -->
      <AdminNavbar currentPage="employees" />

      <!-- Main Content -->
      <div class="p-6 max-w-7xl mx-auto">
         <!-- Header Section -->
         <div class="mb-8">
            <h1 class="text-3xl font-bold text-dark_gray mb-2">Employee Management</h1>
            <p class="text-dark_gray/70">Manage and monitor your team members</p>
         </div>

         <!-- Stats Overview -->
         <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div class="bg-white rounded-xl shadow-sm border border-search_stroke_gray p-6">
               <div class="flex items-center justify-between">
                  <div>
                     <p class="text-sm text-dark_gray/70 mb-1">Total Employees</p>
                     <p class="text-2xl font-bold text-dark_gray">{{ Employees.length }}</p>
                  </div>
                  <div class="w-12 h-12 bg-primary_green rounded-full flex items-center justify-center">
                     <svg class="w-6 h-6 text-dark_green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                     </svg>
                  </div>
               </div>
            </div>
            <div class="bg-white rounded-xl shadow-sm border border-search_stroke_gray p-6">
               <div class="flex items-center justify-between">
                  <div>
                     <p class="text-sm text-dark_gray/70 mb-1">Clocked In</p>
                     <p class="text-2xl font-bold text-clock_in_green">{{ clockedInCount }}</p>
                  </div>
                  <div class="w-12 h-12 bg-clock_in_green/10 rounded-full flex items-center justify-center">
                     <div class="w-3 h-3 bg-clock_in_green rounded-full"></div>
                  </div>
               </div>
            </div>
            <div class="bg-white rounded-xl shadow-sm border border-search_stroke_gray p-6">
               <div class="flex items-center justify-between">
                  <div>
                     <p class="text-sm text-dark_gray/70 mb-1">Clocked Out</p>
                     <p class="text-2xl font-bold text-clock_out_red">{{ clockedOutCount }}</p>
                  </div>
                  <div class="w-12 h-12 bg-clock_out_red/10 rounded-full flex items-center justify-center">
                     <div class="w-3 h-3 bg-clock_out_red rounded-full"></div>
                  </div>
               </div>
            </div>
            <div class="bg-white rounded-xl shadow-sm border border-search_stroke_gray p-6">
               <div class="flex items-center justify-between">
                  <div>
                     <p class="text-sm text-dark_gray/70 mb-1">Locked Accounts</p>
                     <p class="text-2xl font-bold text-clock_out_red">{{ lockedAccountsCount }}</p>
                  </div>
                  <div class="w-12 h-12 bg-clock_out_red/10 rounded-full flex items-center justify-center">
                     <svg class="w-6 h-6 text-clock_out_red" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                     </svg>
                  </div>
               </div>
            </div>
         </div>

         <!-- Search and Filter Section -->
         <div class="bg-white rounded-xl shadow-sm border border-search_stroke_gray p-6 mb-8">
            <div class="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
               <div class="flex-1 flex gap-4">
                  <div class="flex-1 max-w-md">
                     <div class="relative">
                        <input 
                           type="text" 
                           v-model="searchBar" 
                           @input="search" 
                           placeholder="Search employees..."
                           class="input input-bordered w-full pl-10 bg-primary_white border-search_stroke_gray focus:border-dark_green"
                        />
                        <svg class="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-dark_gray/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                           <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                     </div>
                  </div>
                  <select v-model="statusFilter" @change="applyFilters" class="select select-bordered bg-primary_white border-search_stroke_gray focus:border-dark_green">
                     <option value="all">All Status</option>
                     <option value="in">Clocked In</option>
                     <option value="out">Clocked Out</option>
                     <option value="locked">Locked</option>
                  </select>
               </div>
               <NuxtLink v-if="canCreateUsers" to="/create-account">
                  <button class="btn bg-dark_green hover:bg-button_green text-white border-none">
                     <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                     </svg>
                     Add Employee
                  </button>
               </NuxtLink>
            </div>
         </div>

         <!-- Employee Grid -->
         <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div v-if="displayedEmployees.length === 0" class="col-span-full">
               <div class="text-center py-12 bg-white rounded-xl border border-search_stroke_gray">
                  <svg class="w-16 h-16 text-dark_gray/30 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                     <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  <p class="text-lg text-dark_gray/70">{{ searchBar || statusFilter !== 'all' ? 'No employees match your filters' : 'No employees found' }}</p>
               </div>
            </div>
            <div v-else v-for="employee in displayedEmployees" :key="employee.id">
               <EmployeeCard :employee="employee" @employee-unlocked="handleEmployeeUnlocked" @employee-deleted="handleEmployeeDeleted" />
            </div>
         </div>
      </div>
   </div>
</template>

<script setup>

   import { useRouter } from 'vue-router';

   const supabase = useSupabaseClient();
   const router = useRouter();
   
   // Permission management
   const { hasPermission } = usePermissions();
   
   // Additional permission checks
   const canCreateUsers = ref(false);
   
   const checkCreatePermission = async () => {
      canCreateUsers.value = await hasPermission('users.create');
   };

   // Refs for template
   const Employees = ref([]);
   
   // Fetch all employees with their roles
   const fetchEmployees = async () => {
      try {
         const data = await $fetch('/api/employees-with-roles')
         Employees.value = data || []
      } catch (error) {
         console.error('Error loading employees:', error)
         
         // Handle authentication errors - use logout for all cleanup
         if (error?.status === 401 || error?.statusMessage?.includes('Authentication')) {
            console.log('Authentication error detected, logging out');
            logout();
            return;
         }
         
         Employees.value = []
      }
   };

   // Handle employee unlock event
   const handleEmployeeUnlocked = () => {
      fetchEmployees(); // Refresh the employee list
   };

   // Handle employee deletion event
   const handleEmployeeDeleted = () => {
      console.log('Employee deleted, refreshing list');
      fetchEmployees(); // Refresh the employee list
   };

   // Additional refs for filtering and search
   const filteredEmployees = ref([]);
   const searchBar = ref('');
   const statusFilter = ref('all');

   // Computed properties for stats
   const clockedInCount = computed(() => {
      return Employees.value.filter(emp => emp.time_in_status === true).length;
   });

   const clockedOutCount = computed(() => {
      return Employees.value.filter(emp => emp.time_in_status === false).length;
   });

   const lockedAccountsCount = computed(() => {
      return Employees.value.filter(emp => {
         if (!emp.locked_until) return false;
         const lockExpiry = new Date(emp.locked_until);
         const now = new Date();
         return lockExpiry > now;
      }).length;
   });

   // Computed property for displayed employees
   const displayedEmployees = computed(() => {
      let employees = filteredEmployees.value.length > 0 || searchBar.value ? filteredEmployees.value : Employees.value;
      
      // Apply status filter
      if (statusFilter.value !== 'all') {
         employees = employees.filter(emp => {
            switch (statusFilter.value) {
               case 'in':
                  return emp.time_in_status === true;
               case 'out':
                  return emp.time_in_status === false;
               case 'locked':
                  if (!emp.locked_until) return false;
                  const lockExpiry = new Date(emp.locked_until);
                  const now = new Date();
                  return lockExpiry > now;
               default:
                  return true;
            }
         });
      }
      
      return employees;
   });

   // Search function
   const search = () => {
      const searchTerm = searchBar.value.toLowerCase();
      
      if (!searchTerm) {
         filteredEmployees.value = [];
         return;
      }

      filteredEmployees.value = Employees.value.filter((emp) => {
         const firstNameMatch = emp.first_name.toLowerCase().includes(searchTerm);
         const lastNameMatch = emp.last_name.toLowerCase().includes(searchTerm);
         const roleMatch = emp.primary_role && emp.primary_role.toLowerCase().includes(searchTerm);

         return firstNameMatch || lastNameMatch || roleMatch;
      });
   };

   // Apply filters function
   const applyFilters = () => {
      // This will trigger the computed property to recalculate
   };

   // Basic user verification - page access is controlled by middleware with users.read permission
   const verifyUserAccess = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
         console.log("No user found, redirecting to login");
         router.push('/login');
      }
   }


   // Watch for route changes to handle soft refresh
   const route = useRoute();
   watch(() => route.query.refresh, (newRefresh) => {
      if (newRefresh) {
         console.log('Soft refresh triggered, reloading employee data');
         fetchEmployees();
      }
   });

   // Functions to be run once page loads
   onMounted(async () => {
      try {
         await verifyUserAccess();
         await fetchEmployees();
         await checkCreatePermission();
      } catch (error) {
         console.error('Error initializing employees page:', error);
         // If there's an authentication error during initialization, redirect to login
         if (error?.status === 401) {
            await router.push('/login');
         }
      }
   });

</script>