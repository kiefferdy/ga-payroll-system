<template>
  <Title>Roles Management</Title>
  <div class="min-h-screen bg-primary_white">
    <!-- Top Navigation -->
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
            <NuxtLink v-if="canAccessEmployees" to="/employees" class="px-3 py-2 hover:bg-button_green transition-colors rounded-lg">Employees</NuxtLink>
            <NuxtLink v-if="canAccessRecords" to="/records" class="px-3 py-2 hover:bg-button_green transition-colors rounded-lg">Records</NuxtLink>
            <NuxtLink v-if="canAccessRoles" to="/roles" class="px-3 py-2 bg-primary_white text-dark_green rounded-lg font-semibold">Roles</NuxtLink>
            <NuxtLink v-if="canAccessSettings" to="/settings" class="px-3 py-2 hover:bg-button_green transition-colors rounded-lg">Settings</NuxtLink>
          </nav>
        </div>
        <button @click="logout" class="flex items-center space-x-2 hover:bg-button_green px-3 py-2 rounded-lg transition-colors">
          <span>Logout</span>
          <img class="w-4 h-4" src="~/assets/icons/exit_white.png">
        </button>
      </div>
    </div>

    <div class="max-w-7xl mx-auto p-6">
      <!-- Header -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-dark_gray mb-2">Roles & Permissions Management</h1>
        <p class="text-dark_gray/70">Manage user roles and their associated permissions</p>
      </div>

      <!-- Action Bar -->
      <div class="mb-6 flex justify-between items-center">
        <div class="flex space-x-4">
          <button 
            @click="showCreateRoleModal = true"
            class="bg-dark_green text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            <span>Create Role</span>
          </button>
          <button 
            @click="refreshData"
            class="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors flex items-center space-x-2"
            :disabled="loading"
          >
            <svg v-if="!loading" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <svg v-else class="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span>{{ loading ? 'Loading...' : 'Refresh' }}</span>
          </button>
        </div>
        
        <!-- View Toggle -->
        <div class="flex bg-gray-200 rounded-lg">
          <button 
            @click="currentView = 'roles'"
            :class="[
              'px-4 py-2 rounded-l-lg transition-colors flex items-center space-x-2',
              currentView === 'roles' ? 'bg-dark_green text-white' : 'text-gray-700 hover:bg-gray-300'
            ]"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            <span>Roles</span>
          </button>
          <button 
            @click="currentView = 'users'"
            :class="[
              'px-4 py-2 transition-colors flex items-center space-x-2',
              currentView === 'users' ? 'bg-dark_green text-white' : 'text-gray-700 hover:bg-gray-300'
            ]"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
            </svg>
            <span>User Assignments</span>
          </button>
          <button 
            @click="currentView = 'permissions'"
            :class="[
              'px-4 py-2 rounded-r-lg transition-colors flex items-center space-x-2',
              currentView === 'permissions' ? 'bg-dark_green text-white' : 'text-gray-700 hover:bg-gray-300'
            ]"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            <span>Permissions</span>
          </button>
        </div>
      </div>

      <!-- Roles View -->
      <div v-if="currentView === 'roles'" class="space-y-6">
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div 
            v-for="role in roles" 
            :key="role.id"
            class="bg-white rounded-lg shadow-md p-6 border-2 hover:shadow-lg transition-shadow"
            :class="role.is_system_role ? 'border-blue-200' : 'border-gray-200'"
          >
            <!-- Role Header -->
            <div class="flex justify-between items-start mb-4">
              <div>
                <h3 class="text-lg font-semibold text-gray-900">{{ role.name }}</h3>
                <p class="text-sm text-gray-600 mt-1">{{ role.description }}</p>
                <div class="flex items-center mt-2">
                  <span 
                    v-if="role.is_system_role"
                    class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                  >
                    System Role
                  </span>
                  <span class="text-sm text-gray-500 ml-2">
                    {{ getUserCountForRole(role.id) }} users
                  </span>
                </div>
              </div>
              <div class="flex space-x-2">
                <button 
                  @click="editRole(role)"
                  class="text-gray-400 hover:text-gray-600 p-1"
                  title="Edit Role"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
                <button 
                  v-if="!role.is_system_role"
                  @click="deleteRole(role)"
                  class="text-red-400 hover:text-red-600 p-1"
                  title="Delete Role"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>

            <!-- Permissions Count -->
            <div class="mb-4">
              <div class="flex justify-between text-sm text-gray-600">
                <span>Permissions</span>
                <span>{{ getRolePermissionCount(role.id) }} assigned</span>
              </div>
              <div class="w-full bg-gray-200 rounded-full h-2 mt-1">
                <div 
                  class="bg-dark_green h-2 rounded-full"
                  :style="{ width: `${(getRolePermissionCount(role.id) / permissions.length) * 100}%` }"
                ></div>
              </div>
            </div>

            <!-- Quick Actions -->
            <div class="flex space-x-2">
              <button 
                @click="manageRolePermissions(role)"
                class="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm py-2 px-3 rounded transition-colors"
              >
                Manage Permissions
              </button>
              <button 
                @click="viewRoleUsers(role)"
                class="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm py-2 px-3 rounded transition-colors"
              >
                View Users
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- User Assignments View -->
      <div v-if="currentView === 'users'" class="bg-white rounded-lg shadow">
        <div class="p-6">
          <div class="flex justify-between items-center mb-4">
            <h3 class="text-lg font-semibold">User Role Assignments</h3>
            <div class="flex items-center space-x-3">
              <div v-if="selectedRoleFilter" class="flex items-center space-x-2 bg-green-100 text-green-800 px-3 py-1 rounded-full">
                <span class="text-sm">Filtered by: {{ selectedRoleFilter.name }}</span>
                <button @click="clearRoleFilter" class="text-green-600 hover:text-green-800">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div class="text-sm text-gray-600">
                Showing {{ filteredUsersWithRoles.length }} of {{ usersWithRoles.length }} users
              </div>
            </div>
          </div>
          <div class="overflow-x-auto">
            <table class="min-w-full table-auto">
              <thead>
                <tr class="border-b">
                  <th class="text-left py-3 px-4 font-medium text-gray-700">User</th>
                  <th class="text-left py-3 px-4 font-medium text-gray-700">Email</th>
                  <th class="text-left py-3 px-4 font-medium text-gray-700">Roles</th>
                  <th class="text-left py-3 px-4 font-medium text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="user in filteredUsersWithRoles" :key="user.id" class="border-b hover:bg-gray-50">
                  <td class="py-3 px-4">
                    <div class="font-medium text-gray-900">{{ user.first_name }} {{ user.last_name }}</div>
                  </td>
                  <td class="py-3 px-4 text-gray-600">{{ user.email }}</td>
                  <td class="py-3 px-4">
                    <div class="flex flex-wrap gap-1">
                      <span 
                        v-for="role in user.roles" 
                        :key="role.id"
                        class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800"
                      >
                        {{ role.name }}
                      </span>
                    </div>
                  </td>
                  <td class="py-3 px-4">
                    <button 
                      @click="manageUserRoles(user)"
                      class="text-dark_green hover:text-green-700 text-sm font-medium"
                    >
                      Manage Roles
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- Permissions View -->
      <div v-if="currentView === 'permissions'" class="bg-white rounded-lg shadow">
        <div class="p-6">
          <h3 class="text-lg font-semibold mb-4">System Permissions</h3>
          <div class="space-y-4">
            <div 
              v-for="(perms, resource) in permissionsByResource" 
              :key="resource"
              class="border rounded-lg p-4"
            >
              <h4 class="font-semibold text-gray-900 capitalize mb-3">{{ resource }}</h4>
              <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                <div 
                  v-for="permission in perms" 
                  :key="permission.id"
                  class="bg-gray-50 rounded p-3"
                >
                  <div class="font-medium text-sm text-gray-900">{{ permission.action }}</div>
                  <div class="text-xs text-gray-600 mt-1">{{ permission.description }}</div>
                  <div class="text-xs text-gray-500 mt-1">
                    Used by {{ getRolesWithPermission(permission.id).length }} role(s)
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Create/Edit Role Modal -->
      <div v-if="showCreateRoleModal || editingRole" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div class="bg-white rounded-lg p-6 w-full max-w-md mx-4">
          <h3 class="text-lg font-semibold mb-4">
            {{ editingRole ? 'Edit Role' : 'Create New Role' }}
          </h3>
          
          <form @submit.prevent="saveRole">
            <div class="mb-4">
              <label class="block text-sm font-medium text-gray-700 mb-2">Role Name</label>
              <input 
                v-model="roleForm.name"
                type="text"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-dark_green"
                required
              >
            </div>
            
            <div class="mb-6">
              <label class="block text-sm font-medium text-gray-700 mb-2">Description</label>
              <textarea 
                v-model="roleForm.description"
                rows="3"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-dark_green"
              ></textarea>
            </div>
            
            <div class="flex justify-end space-x-3">
              <button 
                type="button"
                @click="cancelEditRole"
                class="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button 
                type="submit"
                class="px-4 py-2 bg-dark_green text-white rounded-md hover:bg-green-700"
                :disabled="saving"
              >
                {{ saving ? 'Saving...' : (editingRole ? 'Update' : 'Create') }}
              </button>
            </div>
          </form>
        </div>
      </div>

      <!-- Permission Management Modal -->
      <div v-if="managingPermissionsFor" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div class="bg-white rounded-lg p-6 w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
          <h3 class="text-lg font-semibold mb-4">
            Manage Permissions for "{{ managingPermissionsFor.name }}"
          </h3>
          
          <div class="space-y-4">
            <div 
              v-for="(perms, resource) in permissionsByResource" 
              :key="resource"
              class="border rounded-lg p-4"
            >
              <h4 class="font-semibold text-gray-900 capitalize mb-3">{{ resource }}</h4>
              <div class="space-y-2">
                <label 
                  v-for="permission in perms" 
                  :key="permission.id"
                  class="flex items-center space-x-3 p-2 rounded hover:bg-gray-50"
                >
                  <input 
                    type="checkbox"
                    :checked="rolePermissions.includes(permission.id)"
                    @change="toggleRolePermission(permission.id)"
                    class="h-4 w-4 text-dark_green focus:ring-dark_green border-gray-300 rounded"
                  >
                  <div class="flex-1">
                    <div class="font-medium text-sm text-gray-900">{{ permission.action }}</div>
                    <div class="text-xs text-gray-600">{{ permission.description }}</div>
                  </div>
                </label>
              </div>
            </div>
          </div>
          
          <div class="flex justify-end space-x-3 mt-6 pt-4 border-t">
            <button 
              @click="cancelPermissionManagement"
              class="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            <button 
              @click="saveRolePermissions"
              class="px-4 py-2 bg-dark_green text-white rounded-md hover:bg-green-700"
              :disabled="savingPermissions"
            >
              {{ savingPermissions ? 'Saving...' : 'Save Permissions' }}
            </button>
          </div>
        </div>
      </div>

      <!-- User Role Assignment Modal -->
      <div v-if="managingUserRoles" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div class="bg-white rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
          <h3 class="text-lg font-semibold mb-4">
            Manage Roles for {{ managingUserRoles.first_name }} {{ managingUserRoles.last_name }}
          </h3>
          <p class="text-sm text-gray-600 mb-6">{{ managingUserRoles.email }}</p>
          
          <div class="space-y-4">
            <h4 class="font-medium text-gray-900">Available Roles</h4>
            <div class="space-y-2 max-h-60 overflow-y-auto">
              <label 
                v-for="role in roles" 
                :key="role.id"
                class="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 border"
                :class="userRoleAssignments_temp.includes(role.id) ? 'border-green-200 bg-green-50' : 'border-gray-200'"
              >
                <input 
                  type="checkbox"
                  :checked="userRoleAssignments_temp.includes(role.id)"
                  @change="toggleUserRole(role.id)"
                  class="h-4 w-4 text-dark_green focus:ring-dark_green border-gray-300 rounded"
                >
                <div class="flex-1">
                  <div class="font-medium text-sm text-gray-900">{{ role.name }}</div>
                  <div class="text-xs text-gray-600">{{ role.description }}</div>
                  <div class="text-xs text-gray-500 mt-1" v-if="role.is_system_role">
                    <span class="inline-flex items-center px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
                      System Role
                    </span>
                  </div>
                </div>
              </label>
            </div>
          </div>
          
          <div class="flex justify-end space-x-3 mt-6 pt-4 border-t">
            <button 
              @click="cancelUserRoleManagement"
              class="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            <button 
              @click="saveUserRoles"
              class="px-4 py-2 bg-dark_green text-white rounded-md hover:bg-green-700"
              :disabled="saving"
            >
              {{ saving ? 'Saving...' : 'Save Changes' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Role {
  id: number
  name: string
  description: string
  is_system_role: boolean
  created_at: string
}

interface Permission {
  id: number
  name: string
  resource: string
  action: string
  description: string
}

interface UserWithRoles {
  id: string
  first_name: string
  last_name: string
  email: string
  roles: Role[]
}

// Reactive data  
const supabase = useSupabaseClient<any>()

// Permission management
const { canAccessEmployees, canAccessSettings, canAccessRoles, canAccessRecords, loadPermissions: loadUserPermissions } = usePermissions()

const loading = ref(false)
const saving = ref(false)
const savingPermissions = ref(false)
const currentView = ref('roles')

// Modal states
const showCreateRoleModal = ref(false)
const editingRole = ref<Role | null>(null)
const managingPermissionsFor = ref<Role | null>(null)
const managingUserRoles = ref<UserWithRoles | null>(null)

// Filter states
const selectedRoleFilter = ref<Role | null>(null)

// Data arrays
const roles = ref<Role[]>([])
const permissions = ref<Permission[]>([])
const usersWithRoles = ref<UserWithRoles[]>([])
const userRoleAssignments = ref<Array<{ user_id: string, role_id: number }>>([])
const rolePermissionAssignments = ref<Array<{ role_id: number, permission_id: number }>>([])

// Form data
const roleForm = ref({
  name: '',
  description: ''
})

const rolePermissions = ref<number[]>([])
const userRoleAssignments_temp = ref<number[]>([])

// Computed properties
const permissionsByResource = computed(() => {
  return permissions.value.reduce((groups, permission) => {
    const resource = permission.resource
    if (!groups[resource]) {
      groups[resource] = []
    }
    groups[resource].push(permission)
    return groups
  }, {} as Record<string, Permission[]>)
})

const filteredUsersWithRoles = computed(() => {
  if (!selectedRoleFilter.value) {
    return usersWithRoles.value
  }
  return usersWithRoles.value.filter(user => 
    user.roles.some(role => role.id === selectedRoleFilter.value?.id)
  )
})

// Helper functions
function getUserCountForRole(roleId: number): number {
  return userRoleAssignments.value.filter(assignment => assignment.role_id === roleId).length
}

function getRolePermissionCount(roleId: number): number {
  return rolePermissionAssignments.value.filter(assignment => assignment.role_id === roleId).length
}

function getRolesWithPermission(permissionId: number): Role[] {
  const roleIds = rolePermissionAssignments.value
    .filter(assignment => assignment.permission_id === permissionId)
    .map(assignment => assignment.role_id)
  
  return roles.value.filter(role => roleIds.includes(role.id))
}

// Data loading functions
async function loadRoles() {
  const { data, error } = await (supabase as any)
    .from('Roles')
    .select('*')
    .order('name')

  if (error) {
    console.error('Error loading roles:', error)
    return
  }

  roles.value = data || []
}

async function loadPermissions() {
  const { data, error } = await (supabase as any)
    .from('Permissions')
    .select('*')
    .order('resource, action')

  if (error) {
    console.error('Error loading permissions:', error)
    return
  }

  permissions.value = data || []
}

async function loadUserRoleAssignments() {
  const { data, error } = await (supabase as any)
    .from('UserRoles')
    .select('user_id, role_id')
    .eq('is_active', true)

  if (error) {
    console.error('Error loading user role assignments:', error)
    return
  }

  userRoleAssignments.value = data || []
}

async function loadRolePermissionAssignments() {
  const { data, error } = await (supabase as any)
    .from('RolePermissions')
    .select('role_id, permission_id')

  if (error) {
    console.error('Error loading role permission assignments:', error)
    return
  }

  rolePermissionAssignments.value = data || []
}

async function loadUsersWithRoles() {
  try {
    const data = await $fetch('/api/users-with-roles') as UserWithRoles[]
    usersWithRoles.value = data || []
  } catch (error) {
    console.error('Error loading users with roles:', error)
  }
}

async function refreshData() {
  loading.value = true
  try {
    await Promise.all([
      loadRoles(),
      loadPermissions(),
      loadUserRoleAssignments(),
      loadRolePermissionAssignments()
    ])
    await loadUsersWithRoles()
  } finally {
    loading.value = false
  }
}

// Role management functions
function editRole(role: Role) {
  editingRole.value = role
  roleForm.value = {
    name: role.name,
    description: role.description || ''
  }
}

function cancelEditRole() {
  editingRole.value = null
  showCreateRoleModal.value = false
  roleForm.value = { name: '', description: '' }
}

async function saveRole() {
  saving.value = true
  try {
    if (editingRole.value) {
      // Update existing role
      const { error } = await (supabase as any)
        .from('Roles')
        .update({
          name: roleForm.value.name,
          description: roleForm.value.description
        })
        .eq('id', editingRole.value.id)

      if (error) throw error
    } else {
      // Create new role
      const { error } = await (supabase as any)
        .from('Roles')
        .insert({
          name: roleForm.value.name,
          description: roleForm.value.description,
          is_system_role: false
        })

      if (error) throw error
    }

    cancelEditRole()
    await refreshData()
  } catch (error: any) {
    console.error('Error saving role:', error)
    const errorMessage = error?.data?.statusMessage || error?.statusMessage || error?.message || 'Failed to save role'
    alert('Error saving role: ' + errorMessage)
  } finally {
    saving.value = false
  }
}

async function deleteRole(role: Role) {
  if (!confirm(`Are you sure you want to delete the role "${role.name}"? This action cannot be undone.`)) {
    return
  }

  try {
    const { error } = await (supabase as any)
      .from('Roles')
      .delete()
      .eq('id', role.id)

    if (error) throw error

    await refreshData()
  } catch (error) {
    console.error('Error deleting role:', error)
    alert('Error deleting role. Please try again.')
  }
}

// Permission management functions
async function manageRolePermissions(role: Role) {
  managingPermissionsFor.value = role
  
  // Load current permissions for this role
  const currentPermissions = rolePermissionAssignments.value
    .filter(assignment => assignment.role_id === role.id)
    .map(assignment => assignment.permission_id)
  
  rolePermissions.value = [...currentPermissions]
}

function cancelPermissionManagement() {
  managingPermissionsFor.value = null
  rolePermissions.value = []
}

function toggleRolePermission(permissionId: number) {
  const index = rolePermissions.value.indexOf(permissionId)
  if (index > -1) {
    rolePermissions.value.splice(index, 1)
  } else {
    rolePermissions.value.push(permissionId)
  }
}

async function saveRolePermissions() {
  if (!managingPermissionsFor.value) return

  savingPermissions.value = true
  try {
    const roleId = managingPermissionsFor.value.id

    // Delete existing permissions for this role
    const { error: deleteError } = await (supabase as any)
      .from('RolePermissions')
      .delete()
      .eq('role_id', roleId)

    if (deleteError) throw deleteError

    // Insert new permissions
    if (rolePermissions.value.length > 0) {
      const { error: insertError } = await (supabase as any)
        .from('RolePermissions')
        .insert(
          rolePermissions.value.map(permissionId => ({
            role_id: roleId,
            permission_id: permissionId
          }))
        )

      if (insertError) throw insertError
    }

    cancelPermissionManagement()
    await refreshData()
  } catch (error: any) {
    console.error('Error saving permissions:', error)
    const errorMessage = error?.data?.statusMessage || error?.statusMessage || error?.message || 'Failed to save permissions'
    alert('Error saving permissions: ' + errorMessage)
  } finally {
    savingPermissions.value = false
  }
}

// Role filtering functions
function viewRoleUsers(role: Role) {
  selectedRoleFilter.value = role
  currentView.value = 'users'
}

function clearRoleFilter() {
  selectedRoleFilter.value = null
}

// User role assignment functions
async function manageUserRoles(user: UserWithRoles) {
  managingUserRoles.value = user
  
  // Load current roles for this user
  const currentRoleIds = user.roles.map(role => role.id)
  userRoleAssignments_temp.value = [...currentRoleIds]
}

function cancelUserRoleManagement() {
  managingUserRoles.value = null
  userRoleAssignments_temp.value = []
}

function toggleUserRole(roleId: number) {
  const index = userRoleAssignments_temp.value.indexOf(roleId)
  if (index > -1) {
    userRoleAssignments_temp.value.splice(index, 1)
  } else {
    userRoleAssignments_temp.value.push(roleId)
  }
}

async function saveUserRoles() {
  if (!managingUserRoles.value) return

  saving.value = true
  try {
    const response = await $fetch('/api/user-roles', {
      method: 'POST',
      body: {
        userId: managingUserRoles.value.id,
        roleIds: userRoleAssignments_temp.value
      }
    }) as { success: boolean }

    if (response.success) {
      cancelUserRoleManagement()
      await refreshData()
    } else {
      console.error('Role assignment failed - API returned success: false')
      alert('Failed to assign roles. Please try again.')
    }
  } catch (error: any) {
    console.error('Error saving user roles:', error)
    const errorMessage = error?.data?.statusMessage || error?.statusMessage || error?.message || 'Unknown error occurred'
    alert('Error saving user roles: ' + errorMessage)
  } finally {
    saving.value = false
  }
}

// Enhanced logout function
const router = useRouter()
const { enhancedLogout } = useAuthCleanup()

const logout = async () => {
  await enhancedLogout()
}

// Initialize data when component mounts
onMounted(async () => {
  await refreshData()
  await loadUserPermissions()
})
</script>