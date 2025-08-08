/**
 * Role-based Authentication Composable
 * Provides utilities for role-based UI rendering and access control
 */

import { ref, computed } from 'vue';

export const useRoleAuth = () => {
  const supabase = useSupabaseClient();
  const user = useSupabaseUser();
  
  // Reactive state
  const currentUserRole = ref(null);
  const currentUserData = ref(null);
  const loading = ref(true);
  const error = ref(null);

  // Role hierarchy (higher number = higher privileges)
  const roleHierarchy = {
    'Customer': 1,
    'Employee': 2,
    'Product Manager': 3,
    'Admin': 4,
    'Website Administrator': 4, // Same level as Admin
    'Developer': 5 // Highest level
  };

  // Computed properties
  const isAuthenticated = computed(() => !!user.value);
  
  const userRole = computed(() => currentUserRole.value);
  
  const isCustomer = computed(() => currentUserRole.value === 'Customer');
  const isEmployee = computed(() => hasMinimumRole('Employee'));
  const isManager = computed(() => hasMinimumRole('Product Manager'));
  const isAdmin = computed(() => 
    currentUserRole.value === 'Admin' || 
    currentUserRole.value === 'Website Administrator' ||
    currentUserRole.value === 'Developer'
  );
  const isDeveloper = computed(() => currentUserRole.value === 'Developer');

  // Methods
  /**
   * Check if current user has minimum required role
   * @param {string} requiredRole - Minimum role required
   * @returns {boolean}
   */
  function hasMinimumRole(requiredRole) {
    if (!currentUserRole.value || !requiredRole) return false;
    
    const userLevel = roleHierarchy[currentUserRole.value] || 0;
    const requiredLevel = roleHierarchy[requiredRole] || 0;
    
    return userLevel >= requiredLevel;
  }

  /**
   * Check if current user has exact role
   * @param {string} role - Exact role to check
   * @returns {boolean}
   */
  function hasExactRole(role) {
    return currentUserRole.value === role;
  }

  /**
   * Check if current user has any of the specified roles
   * @param {string[]} roles - Array of roles to check
   * @returns {boolean}
   */
  function hasAnyRole(roles) {
    if (!Array.isArray(roles) || !currentUserRole.value) return false;
    return roles.includes(currentUserRole.value);
  }

  /**
   * Check if user can access admin features
   * @returns {boolean}
   */
  function canAccessAdmin() {
    return hasAnyRole(['Admin', 'Developer', 'Website Administrator']);
  }

  /**
   * Check if user can access manager features  
   * @returns {boolean}
   */
  function canAccessManager() {
    return hasMinimumRole('Product Manager');
  }

  /**
   * Check if user can access employee features
   * @returns {boolean}
   */
  function canAccessEmployee() {
    return hasMinimumRole('Employee');
  }

  /**
   * Check if user can manage other users
   * @returns {boolean}
   */
  function canManageUsers() {
    return hasAnyRole(['Admin', 'Developer', 'Website Administrator']);
  }

  /**
   * Check if user can view security features
   * @returns {boolean}
   */
  function canViewSecurity() {
    return hasAnyRole(['Admin', 'Developer']);
  }

  /**
   * Check if user can modify system settings
   * @returns {boolean}
   */
  function canModifySettings() {
    return hasAnyRole(['Admin', 'Developer', 'Website Administrator']);
  }

  /**
   * Get role display name with proper formatting
   * @param {string} role - Role to format
   * @returns {string}
   */
  function getRoleDisplayName(role) {
    if (!role) return 'Unknown';
    
    // Handle special cases
    const roleMap = {
      'Website Administrator': 'Web Admin',
      'Product Manager': 'Manager',
    };
    
    return roleMap[role] || role;
  }

  /**
   * Get role badge color class for UI display
   * @param {string} role - Role to get color for
   * @returns {string}
   */
  function getRoleBadgeColor(role) {
    const colorMap = {
      'Developer': 'bg-purple-100 text-purple-800',
      'Admin': 'bg-red-100 text-red-800',
      'Website Administrator': 'bg-red-100 text-red-800',
      'Product Manager': 'bg-blue-100 text-blue-800',
      'Employee': 'bg-green-100 text-green-800',
      'Customer': 'bg-gray-100 text-gray-800'
    };
    
    return colorMap[role] || 'bg-gray-100 text-gray-800';
  }

  /**
   * Fetch current user role from database
   */
  async function fetchUserRole() {
    try {
      loading.value = true;
      error.value = null;
      
      if (!user.value) {
        currentUserRole.value = null;
        currentUserData.value = null;
        return;
      }

      const { data, error: fetchError } = await supabase
        .from('Employees')
        .select(`
          id,
          rank,
          account_type,
          first_name,
          last_name,
          last_login_at,
          requires_otp
        `)
        .eq('id', user.value.id)
        .single();

      if (fetchError) {
        console.error('Error fetching user role:', fetchError);
        error.value = fetchError.message;
        return;
      }

      currentUserRole.value = data.rank;
      currentUserData.value = data;
      
    } catch (err) {
      console.error('Error in fetchUserRole:', err);
      error.value = err.message;
    } finally {
      loading.value = false;
    }
  }

  /**
   * Refresh user role data
   */
  async function refreshRole() {
    await fetchUserRole();
  }

  // Auto-fetch role when user changes
  watch(user, async (newUser) => {
    if (newUser) {
      await fetchUserRole();
    } else {
      currentUserRole.value = null;
      currentUserData.value = null;
      loading.value = false;
    }
  }, { immediate: true });

  return {
    // Reactive state
    currentUserRole: readonly(currentUserRole),
    currentUserData: readonly(currentUserData),
    loading: readonly(loading),
    error: readonly(error),
    
    // Computed properties
    isAuthenticated,
    userRole,
    isCustomer,
    isEmployee,
    isManager,
    isAdmin,
    isDeveloper,
    
    // Methods
    hasMinimumRole,
    hasExactRole,
    hasAnyRole,
    canAccessAdmin,
    canAccessManager,
    canAccessEmployee,
    canManageUsers,
    canViewSecurity,
    canModifySettings,
    getRoleDisplayName,
    getRoleBadgeColor,
    fetchUserRole,
    refreshRole
  };
};