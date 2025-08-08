<template>
  <div class="p-8">
    <h1 class="text-3xl font-bold mb-8">Role Testing Page</h1>
    
    <!-- Current User Info -->
    <div class="mb-8 p-4 bg-gray-100 rounded">
      <h2 class="text-xl font-bold mb-4">Current User Info</h2>
      <div v-if="loading">Loading user data...</div>
      <div v-else>
        <p><strong>Role:</strong> {{ userRole || 'Not set' }}</p>
        <p><strong>Can Access Admin:</strong> {{ canAccessAdmin ? 'Yes' : 'No' }}</p>
        <p><strong>Can Access Manager:</strong> {{ canAccessManager ? 'Yes' : 'No' }}</p>
        <p><strong>Can View Security:</strong> {{ canViewSecurity ? 'Yes' : 'No' }}</p>
      </div>
    </div>

    <!-- Role Directive Tests -->
    <div class="space-y-4">
      <h2 class="text-xl font-bold">Role Directive Tests</h2>
      
      <div v-employee class="p-4 bg-green-100 border border-green-400 rounded">
        ✅ This shows for Employee+ (v-employee)
      </div>
      
      <div v-manager class="p-4 bg-blue-100 border border-blue-400 rounded">
        ✅ This shows for Manager+ (v-manager) 
      </div>
      
      <div v-admin class="p-4 bg-red-100 border border-red-400 rounded">
        ✅ This shows for Admin only (v-admin)
      </div>
      
      <div v-security class="p-4 bg-purple-100 border border-purple-400 rounded">
        ✅ This shows for Security access (v-security)
      </div>
      
      <div v-role="'Developer'" class="p-4 bg-yellow-100 border border-yellow-400 rounded">
        ✅ This shows for Developer only (v-role="'Developer'")
      </div>
    </div>

    <!-- Navigation Test -->
    <div class="mt-8">
      <h2 class="text-xl font-bold mb-4">Navigation Component Test</h2>
      <RoleBasedNavigation :compact="false" :show-role-badge="true" />
    </div>

    <!-- Last Login Display -->
    <div class="mt-8">
      <h2 class="text-xl font-bold mb-4">Last Login Component</h2>
      <LastLoginDisplay :show-security-info="true" />
    </div>
  </div>
</template>

<script setup>
// Apply employee middleware - anyone can test roles
definePageMeta({
  middleware: 'employee'
});

import { useRoleAuth } from '~/composables/useRoleAuth';
import RoleBasedNavigation from '~/components/RoleBasedNavigation.vue';
import LastLoginDisplay from '~/components/LastLoginDisplay.vue';

const {
  loading,
  userRole,
  canAccessAdmin,
  canAccessManager,
  canViewSecurity
} = useRoleAuth();
</script>