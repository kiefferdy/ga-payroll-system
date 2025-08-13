<template>
  <div class="bg-dark_green text-white px-6 py-4">
    <div class="flex justify-between items-center">
      <div class="flex items-center space-x-6">
        <NuxtLink to="/" class="flex items-center space-x-2 hover:text-primary_green transition-colors">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          <span>Back to Dashboard</span>
        </NuxtLink>
        <nav class="flex space-x-6">
          <NuxtLink 
            v-if="canAccessEmployees" 
            to="/employees" 
            :class="getNavLinkClass('employees')"
          >
            Employees
          </NuxtLink>
          <NuxtLink 
            v-if="canAccessRecords" 
            to="/records" 
            :class="getNavLinkClass('records')"
          >
            Records
          </NuxtLink>
          <NuxtLink 
            v-if="canAccessRoles" 
            to="/roles" 
            :class="getNavLinkClass('roles')"
          >
            Roles
          </NuxtLink>
          <NuxtLink 
            v-if="canAccessSettings" 
            to="/settings" 
            :class="getNavLinkClass('settings')"
          >
            Settings
          </NuxtLink>
          <NuxtLink 
            v-if="canAccessSecurityLogs" 
            to="/security-logs" 
            :class="getNavLinkClass('security-logs')"
          >
            Security Logs
          </NuxtLink>
        </nav>
      </div>
      <button @click="logout" class="flex items-center space-x-2 hover:bg-button_green px-3 py-2 rounded-lg transition-colors">
        <span>Logout</span>
        <img class="w-4 h-4" src="~/assets/icons/exit_white.png">
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  currentPage?: string
}

const props = withDefaults(defineProps<Props>(), {
  currentPage: ''
})

// Permission management
const { 
  canAccessEmployees, 
  canAccessRecords, 
  canAccessRoles, 
  canAccessSettings,
  canAccessSecurityLogs,
  loadPermissions
} = usePermissions()

// Auth composable for logout
const { logout } = useAuth()

// Load permissions on component mount
onMounted(() => {
  loadPermissions()
})

// Helper function to determine nav link classes
const getNavLinkClass = (page: string): string => {
  const baseClasses = "px-3 py-2 rounded-lg transition-colors"
  const activeClasses = "bg-primary_white text-dark_green font-semibold"
  const inactiveClasses = "hover:bg-button_green"
  
  return props.currentPage === page 
    ? `${baseClasses} ${activeClasses}`
    : `${baseClasses} ${inactiveClasses}`
}
</script>