/**
 * Vue Directives for Role-Based UI Rendering
 * Provides v-role, v-min-role, and v-any-role directives for conditional rendering
 */

import { useRoleAuth } from '~/composables/useRoleAuth';

export default defineNuxtPlugin((nuxtApp) => {
  // Get role auth functions
  const { 
    hasExactRole, 
    hasMinimumRole, 
    hasAnyRole,
    canAccessAdmin,
    canAccessManager,
    canAccessEmployee,
    canManageUsers,
    canViewSecurity,
    canModifySettings
  } = useRoleAuth();

  /**
   * v-role directive - Show element only if user has exact role
   * Usage: v-role="'Admin'" or v-role="['Admin', 'Developer']"
   */
  nuxtApp.vueApp.directive('role', {
    mounted(el, binding) {
      updateVisibility(el, binding, (value) => {
        if (Array.isArray(value)) {
          return hasAnyRole(value);
        }
        return hasExactRole(value);
      });
    },
    updated(el, binding) {
      updateVisibility(el, binding, (value) => {
        if (Array.isArray(value)) {
          return hasAnyRole(value);
        }
        return hasExactRole(value);
      });
    }
  });

  /**
   * v-min-role directive - Show element if user has minimum role level
   * Usage: v-min-role="'Employee'" (shows for Employee, Manager, Admin, Developer)
   */
  nuxtApp.vueApp.directive('min-role', {
    mounted(el, binding) {
      updateVisibility(el, binding, hasMinimumRole);
    },
    updated(el, binding) {
      updateVisibility(el, binding, hasMinimumRole);
    }
  });

  /**
   * v-any-role directive - Show element if user has any of the specified roles
   * Usage: v-any-role="['Admin', 'Developer']"
   */
  nuxtApp.vueApp.directive('any-role', {
    mounted(el, binding) {
      updateVisibility(el, binding, hasAnyRole);
    },
    updated(el, binding) {
      updateVisibility(el, binding, hasAnyRole);
    }
  });

  /**
   * v-admin directive - Show element only for admin users
   * Usage: v-admin
   */
  nuxtApp.vueApp.directive('admin', {
    mounted(el, binding) {
      updateVisibility(el, binding, () => canAccessAdmin.value);
    },
    updated(el, binding) {
      updateVisibility(el, binding, () => canAccessAdmin.value);
    }
  });

  /**
   * v-manager directive - Show element for manager level and above
   * Usage: v-manager
   */
  nuxtApp.vueApp.directive('manager', {
    mounted(el, binding) {
      updateVisibility(el, binding, () => canAccessManager.value);
    },
    updated(el, binding) {
      updateVisibility(el, binding, () => canAccessManager.value);
    }
  });

  /**
   * v-employee directive - Show element for employee level and above
   * Usage: v-employee
   */
  nuxtApp.vueApp.directive('employee', {
    mounted(el, binding) {
      updateVisibility(el, binding, () => canAccessEmployee.value);
    },
    updated(el, binding) {
      updateVisibility(el, binding, () => canAccessEmployee.value);
    }
  });

  /**
   * v-can-manage directive - Show element if user can manage other users
   * Usage: v-can-manage
   */
  nuxtApp.vueApp.directive('can-manage', {
    mounted(el, binding) {
      updateVisibility(el, binding, () => canManageUsers.value);
    },
    updated(el, binding) {
      updateVisibility(el, binding, () => canManageUsers.value);
    }
  });

  /**
   * v-security directive - Show element if user can view security features
   * Usage: v-security
   */
  nuxtApp.vueApp.directive('security', {
    mounted(el, binding) {
      updateVisibility(el, binding, () => canViewSecurity.value);
    },
    updated(el, binding) {
      updateVisibility(el, binding, () => canViewSecurity.value);
    }
  });

  /**
   * Helper function to update element visibility
   * @param {HTMLElement} el - Element to show/hide
   * @param {Object} binding - Directive binding
   * @param {Function} checkFunction - Function to check permission
   */
  function updateVisibility(el, binding, checkFunction) {
    try {
      const hasPermission = checkFunction(binding.value);
      
      if (hasPermission) {
        // Show element
        el.style.display = '';
        el.removeAttribute('aria-hidden');
      } else {
        // Hide element
        el.style.display = 'none';
        el.setAttribute('aria-hidden', 'true');
      }
    } catch (error) {
      console.warn('Role directive error:', error);
      // Default to hiding on error for security
      el.style.display = 'none';
      el.setAttribute('aria-hidden', 'true');
    }
  }
});