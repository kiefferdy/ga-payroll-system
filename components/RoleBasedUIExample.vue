<template>
  <div class="role-based-example p-6 bg-white rounded-lg shadow-md">
    <h2 class="text-2xl font-bold mb-6 text-gray-800">Role-Based UI Example</h2>
    
    <!-- User Info Section -->
    <div class="mb-8 p-4 bg-gray-50 rounded-lg">
      <h3 class="text-lg font-semibold mb-3 text-gray-700">Current User Info</h3>
      <div v-if="loading" class="text-gray-500">Loading user information...</div>
      <div v-else-if="error" class="text-red-600">Error: {{ error }}</div>
      <div v-else class="space-y-2">
        <p><strong>Role:</strong> 
          <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium" :class="getRoleBadgeColor(userRole)">
            {{ getRoleDisplayName(userRole) || 'Not Set' }}
          </span>
        </p>
        <p><strong>Authenticated:</strong> {{ isAuthenticated ? 'Yes' : 'No' }}</p>
        <p v-if="currentUserData"><strong>Name:</strong> {{ currentUserData.first_name }} {{ currentUserData.last_name }}</p>
      </div>
    </div>

    <!-- Role Check Examples -->
    <div class="mb-8">
      <h3 class="text-lg font-semibold mb-4 text-gray-700">Role Permission Examples</h3>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        <!-- Basic Role Checks -->
        <div class="p-4 border border-gray-200 rounded-lg">
          <h4 class="font-medium mb-3 text-gray-600">Basic Role Checks</h4>
          <div class="space-y-2 text-sm">
            <div class="flex items-center justify-between">
              <span>Is Customer:</span>
              <span class="font-medium" :class="isCustomer ? 'text-green-600' : 'text-red-600'">{{ isCustomer ? 'Yes' : 'No' }}</span>
            </div>
            <div class="flex items-center justify-between">
              <span>Is Employee:</span>
              <span class="font-medium" :class="isEmployee ? 'text-green-600' : 'text-red-600'">{{ isEmployee ? 'Yes' : 'No' }}</span>
            </div>
            <div class="flex items-center justify-between">
              <span>Is Manager:</span>
              <span class="font-medium" :class="isManager ? 'text-green-600' : 'text-red-600'">{{ isManager ? 'Yes' : 'No' }}</span>
            </div>
            <div class="flex items-center justify-between">
              <span>Is Admin:</span>
              <span class="font-medium" :class="isAdmin ? 'text-green-600' : 'text-red-600'">{{ isAdmin ? 'Yes' : 'No' }}</span>
            </div>
            <div class="flex items-center justify-between">
              <span>Is Developer:</span>
              <span class="font-medium" :class="isDeveloper ? 'text-green-600' : 'text-red-600'">{{ isDeveloper ? 'Yes' : 'No' }}</span>
            </div>
          </div>
        </div>

        <!-- Permission Checks -->
        <div class="p-4 border border-gray-200 rounded-lg">
          <h4 class="font-medium mb-3 text-gray-600">Permission Checks</h4>
          <div class="space-y-2 text-sm">
            <div class="flex items-center justify-between">
              <span>Can Manage Users:</span>
              <span class="font-medium" :class="canManageUsers ? 'text-green-600' : 'text-red-600'">{{ canManageUsers ? 'Yes' : 'No' }}</span>
            </div>
            <div class="flex items-center justify-between">
              <span>Can View Security:</span>
              <span class="font-medium" :class="canViewSecurity ? 'text-green-600' : 'text-red-600'">{{ canViewSecurity ? 'Yes' : 'No' }}</span>
            </div>
            <div class="flex items-center justify-between">
              <span>Can Modify Settings:</span>
              <span class="font-medium" :class="canModifySettings ? 'text-green-600' : 'text-red-600'">{{ canModifySettings ? 'Yes' : 'No' }}</span>
            </div>
            <div class="flex items-center justify-between">
              <span>Can Access Admin:</span>
              <span class="font-medium" :class="canAccessAdmin ? 'text-green-600' : 'text-red-600'">{{ canAccessAdmin ? 'Yes' : 'No' }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Directive Examples -->
    <div class="mb-8">
      <h3 class="text-lg font-semibold mb-4 text-gray-700">Vue Directive Examples</h3>
      <div class="space-y-4">
        
        <!-- v-employee directive -->
        <div v-employee class="p-3 bg-green-50 border border-green-200 rounded-lg">
          <div class="flex items-center">
            <svg class="w-5 h-5 text-green-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
            <span class="text-green-800">This content is visible to Employee level and above (using v-employee directive)</span>
          </div>
        </div>

        <!-- v-manager directive -->
        <div v-manager class="p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div class="flex items-center">
            <svg class="w-5 h-5 text-blue-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
            <span class="text-blue-800">This content is visible to Manager level and above (using v-manager directive)</span>
          </div>
        </div>

        <!-- v-admin directive -->
        <div v-admin class="p-3 bg-red-50 border border-red-200 rounded-lg">
          <div class="flex items-center">
            <svg class="w-5 h-5 text-red-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
            <span class="text-red-800">This content is visible to Admin users only (using v-admin directive)</span>
          </div>
        </div>

        <!-- v-security directive -->
        <div v-security class="p-3 bg-purple-50 border border-purple-200 rounded-lg">
          <div class="flex items-center">
            <svg class="w-5 h-5 text-purple-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
            </svg>
            <span class="text-purple-800">This security content is visible to users with security access (using v-security directive)</span>
          </div>
        </div>

        <!-- v-role directive with specific roles -->
        <div v-role="['Developer', 'Admin']" class="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div class="flex items-center">
            <svg class="w-5 h-5 text-yellow-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/>
            </svg>
            <span class="text-yellow-800">This content is visible to Developer or Admin roles only (using v-role="['Developer', 'Admin']")</span>
          </div>
        </div>

        <!-- v-min-role directive -->
        <div v-min-role="'Product Manager'" class="p-3 bg-indigo-50 border border-indigo-200 rounded-lg">
          <div class="flex items-center">
            <svg class="w-5 h-5 text-indigo-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z"/>
            </svg>
            <span class="text-indigo-800">This content is visible to Product Manager level and above (using v-min-role="'Product Manager'")</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Action Buttons -->
    <div class="mb-8">
      <h3 class="text-lg font-semibold mb-4 text-gray-700">Role-Based Action Buttons</h3>
      <div class="flex flex-wrap gap-3">
        
        <!-- Employee level button -->
        <button v-employee class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
          View Profile (Employee+)
        </button>

        <!-- Manager level button -->
        <button v-manager class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
          View Reports (Manager+)
        </button>

        <!-- Admin level button -->
        <button v-admin class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
          Manage Users (Admin)
        </button>

        <!-- Security access button -->
        <button v-security class="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
          Security Dashboard
        </button>

        <!-- Developer only button -->
        <button v-role="'Developer'" class="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors">
          Developer Tools
        </button>
      </div>
    </div>

    <!-- Method Examples -->
    <div class="mb-8">
      <h3 class="text-lg font-semibold mb-4 text-gray-700">Programmatic Role Checks</h3>
      <div class="space-y-3">
        <button 
          @click="testRoleChecks" 
          class="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
        >
          Test Role Check Methods
        </button>
        
        <div v-if="testResults" class="mt-4 p-4 bg-gray-50 rounded-lg">
          <h4 class="font-medium mb-2">Test Results:</h4>
          <pre class="text-sm text-gray-700 whitespace-pre-wrap">{{ testResults }}</pre>
        </div>
      </div>
    </div>

    <!-- Last Login Display Integration -->
    <div>
      <h3 class="text-lg font-semibold mb-4 text-gray-700">Security Information</h3>
      <LastLoginDisplay 
        :show-security-info="canViewSecurity"
        :show-view-history="canViewSecurity"
        @view-history="handleViewHistory"
      />
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRoleAuth } from '~/composables/useRoleAuth';
import LastLoginDisplay from './LastLoginDisplay.vue';

// Use role authentication
const {
  loading,
  error,
  userRole,
  currentUserData,
  isAuthenticated,
  isCustomer,
  isEmployee,
  isManager,
  isAdmin,
  isDeveloper,
  canManageUsers,
  canViewSecurity,
  canModifySettings,
  canAccessAdmin,
  hasMinimumRole,
  hasExactRole,
  hasAnyRole,
  getRoleDisplayName,
  getRoleBadgeColor
} = useRoleAuth();

// Test results
const testResults = ref('');

// Methods
function testRoleChecks() {
  const results = [];
  
  results.push('=== Role Check Method Tests ===');
  results.push(`hasExactRole('Admin'): ${hasExactRole('Admin')}`);
  results.push(`hasExactRole('Employee'): ${hasExactRole('Employee')}`);
  results.push(`hasMinimumRole('Employee'): ${hasMinimumRole('Employee')}`);
  results.push(`hasMinimumRole('Admin'): ${hasMinimumRole('Admin')}`);
  results.push(`hasAnyRole(['Admin', 'Developer']): ${hasAnyRole(['Admin', 'Developer'])}`);
  results.push(`hasAnyRole(['Customer', 'Guest']): ${hasAnyRole(['Customer', 'Guest'])}`);
  
  results.push('\n=== Permission Method Tests ===');
  results.push(`canManageUsers: ${canManageUsers.value}`);
  results.push(`canViewSecurity: ${canViewSecurity.value}`);
  results.push(`canModifySettings: ${canModifySettings.value}`);
  results.push(`canAccessAdmin: ${canAccessAdmin.value}`);
  
  results.push('\n=== Current User Info ===');
  results.push(`Current Role: ${userRole.value || 'None'}`);
  results.push(`Role Display Name: ${getRoleDisplayName(userRole.value)}`);
  results.push(`Is Authenticated: ${isAuthenticated.value}`);
  
  testResults.value = results.join('\n');
}

function handleViewHistory() {
  alert('View login history functionality would be implemented here');
}
</script>

<style scoped>
.role-based-example {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif;
}
</style>