<template>
  <nav class="role-based-n      <!-- Employee Management - Admin only (NOT developers) -->
      <li v-if="canAccessAdminOnly" class="nav-item" :class="getNavItemClass('/employees')">
        <NuxtLink to="/employees" class="nav-link">
          <svg class="nav-icon" fill="currentColor" viewBox="0 0 20 20">
            <path d="M13 6a3 3 0 11-6 0 3 3 0 616 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z"/>
          </svg>
          <span v-if="!compact">Employees</span>
        </NuxtLink>
      </li> <!-- Main Navigation Items -->
    <ul class="nav-list" :class="navListClass">
      <!-- Dashboard - Available to all employees -->
      <li v-if="canAccessEmployee" class="nav-item" :class="getNavItemClass('/')">
        <NuxtLink to="/" class="nav-link">
          <svg class="nav-icon" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-3a1 1 0 011-1h2a1 1 0 011 1v3a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z"/>
          </svg>
          <span v-if="!compact">Dashboard</span>
        </NuxtLink>
      </li>

      <!-- Profile - Available to all employees -->
      <li v-if="canAccessEmployee" class="nav-item" :class="getNavItemClass('/Profile')">
        <NuxtLink to="/Profile" class="nav-link">
          <svg class="nav-icon" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"/>
          </svg>
          <span v-if="!compact">Profile</span>
        </NuxtLink>
      </li>

      <!-- Divider -->
      <li v-if="canAccessManager || canAccessAdmin" class="nav-divider"></li>

      <!-- Records - Admin and Developer only -->
      <li v-if="canAccessAdmin" class="nav-item" :class="getNavItemClass('/records')">
        <NuxtLink to="/records" class="nav-link">
          <svg class="nav-icon" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z"/>
            <path fill-rule="evenodd" d="M4 5a2 2 0 012-2v1a2 2 0 00-2 2v6a2 2 0 002 2h8a2 2 0 002-2V6a2 2 0 00-2-2v-1a2 2 0 012 2v6a2 2 0 01-2 2H6a2 2 0 01-2-2V5z" clip-rule="evenodd"/>
          </svg>
          <span v-if="!compact">Records</span>
        </NuxtLink>
      </li>

      <!-- Employee Management - Admin only (NOT developers) -->
      <li v-if="canAccessAdmin && !isDeveloper" class="nav-item" :class="getNavItemClass('/employees')">
        <NuxtLink to="/employees" class="nav-link">
          <svg class="nav-icon" fill="currentColor" viewBox="0 0 20 20">
            <path d="M13 6a3 3 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z"/>
          </svg>
          <span v-if="!compact">Employees</span>
        </NuxtLink>
      </li>

      <!-- Security Dashboard - Admin/Developer only -->
      <li v-if="canViewSecurity" class="nav-item" :class="getNavItemClass('/security-dashboard')">
        <NuxtLink to="/security-dashboard" class="nav-link">
          <svg class="nav-icon" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
          </svg>
          <span v-if="!compact">Security</span>
        </NuxtLink>
      </li>

      <!-- Settings - Admin only -->
      <li v-if="canModifySettings" class="nav-item" :class="getNavItemClass('/settings')">
        <NuxtLink to="/settings" class="nav-link">
          <svg class="nav-icon" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clip-rule="evenodd"/>
          </svg>
          <span v-if="!compact">Settings</span>
        </NuxtLink>
      </li>
    </ul>

    <!-- User Role Badge -->
    <div v-if="showRoleBadge && userRole" class="role-badge-container">
      <div class="role-badge" :class="getRoleBadgeColor(userRole)">
        <svg class="role-badge-icon" fill="currentColor" viewBox="0 0 20 20">
          <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
        </svg>
        <span v-if="!compact">{{ getRoleDisplayName(userRole) }}</span>
      </div>
    </div>

    <!-- Logout Button -->
    <div v-if="showLogout" class="logout-container">
      <button @click="handleLogout" class="logout-btn">
        <svg class="nav-icon" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clip-rule="evenodd"/>
        </svg>
        <span v-if="!compact">Logout</span>
      </button>
    </div>
  </nav>
</template>

<script setup>
import { useRoleAuth } from '~/composables/useRoleAuth';
import { useRouter, useRoute } from 'vue-router';

// Props
const props = defineProps({
  compact: {
    type: Boolean,
    default: false
  },
  orientation: {
    type: String,
    default: 'vertical', // 'vertical' or 'horizontal'
    validator: (value) => ['vertical', 'horizontal'].includes(value)
  },
  showRoleBadge: {
    type: Boolean,
    default: true
  },
  showLogout: {
    type: Boolean,
    default: true
  },
  theme: {
    type: String,
    default: 'light', // 'light' or 'dark'
    validator: (value) => ['light', 'dark'].includes(value)
  }
});

// Composables
const router = useRouter();
const route = useRoute();
const supabase = useSupabaseClient();

// Use role authentication
const {
  userRole,
  canAccessEmployee,
  canAccessManager,
  canAccessAdmin,
  canAccessAdminOnly,
  canViewSecurity,
  canModifySettings,
  isDeveloper,
  getRoleDisplayName,
  getRoleBadgeColor
} = useRoleAuth();

// Computed classes
const navListClass = computed(() => ({
  'nav-list-vertical': props.orientation === 'vertical',
  'nav-list-horizontal': props.orientation === 'horizontal',
  'nav-list-compact': props.compact,
  'nav-list-dark': props.theme === 'dark'
}));

// Methods
function getNavItemClass(path) {
  const isActive = route.path === path || 
                   (path !== '/' && route.path.startsWith(path));
  return {
    'nav-item-active': isActive,
    'nav-item-dark': props.theme === 'dark'
  };
}

async function handleLogout() {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Logout error:', error);
    } else {
      router.push('/login');
    }
  } catch (err) {
    console.error('Logout error:', err);
  }
}
</script>

<style scoped>
.role-based-nav {
  @apply flex flex-col h-full;
}

/* Navigation List */
.nav-list {
  @apply flex flex-1;
}

.nav-list-vertical {
  @apply flex-col space-y-2;
}

.nav-list-horizontal {
  @apply flex-row space-x-4;
}

.nav-list-compact .nav-link {
  @apply justify-center;
}

.nav-list-dark {
  @apply text-white;
}

/* Navigation Items */
.nav-item {
  @apply relative;
}

.nav-item-active .nav-link {
  @apply bg-primary_white text-black rounded-r-lg;
}

.nav-item-dark.nav-item-active .nav-link {
  @apply bg-gray-700 text-white;
}

/* Navigation Links */
.nav-link {
  @apply flex items-center px-4 py-3 text-white hover:bg-opacity-75 transition-colors duration-200 rounded-lg;
}

.nav-list-horizontal .nav-link {
  @apply px-3 py-2;
}

.nav-list-compact .nav-link {
  @apply px-2;
}

/* Navigation Icons */
.nav-icon {
  @apply w-5 h-5 mr-3 flex-shrink-0;
}

.nav-list-horizontal .nav-icon {
  @apply mr-2;
}

.nav-list-compact .nav-icon {
  @apply mr-0;
}

/* Divider */
.nav-divider {
  @apply border-t border-white border-opacity-20 my-2;
}

.nav-list-horizontal .nav-divider {
  @apply border-t-0 border-l border-white border-opacity-20 mx-2 my-0 h-6;
}

/* Role Badge */
.role-badge-container {
  @apply mt-auto mb-4;
}

.nav-list-horizontal .role-badge-container {
  @apply mt-0 mb-0 ml-auto mr-4;
}

.role-badge {
  @apply inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium;
}

.role-badge-icon {
  @apply w-4 h-4 mr-1 flex-shrink-0;
}

.nav-list-compact .role-badge-icon {
  @apply mr-0;
}

/* Logout Button */
.logout-container {
  @apply mt-2;
}

.nav-list-horizontal .logout-container {
  @apply mt-0 ml-2;
}

.logout-btn {
  @apply flex items-center px-4 py-3 text-white hover:bg-red-600 hover:bg-opacity-75 transition-colors duration-200 rounded-lg w-full text-left;
}

.nav-list-horizontal .logout-btn {
  @apply px-3 py-2 w-auto;
}

.nav-list-compact .logout-btn {
  @apply px-2 justify-center;
}

/* Dark theme adjustments */
.nav-list-dark .nav-link {
  @apply text-gray-300 hover:text-white hover:bg-gray-700;
}

.nav-list-dark .nav-item-active .nav-link {
  @apply bg-gray-700 text-white;
}

.nav-list-dark .nav-divider {
  @apply border-gray-600;
}

.nav-list-dark .logout-btn {
  @apply text-gray-300 hover:text-white hover:bg-red-700;
}
</style>