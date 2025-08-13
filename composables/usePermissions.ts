/**
 * Composable for checking user permissions in Vue components
 */

export const usePermissions = () => {
  const hasUserPermission = ref<Record<string, boolean>>({})
  const permissionsLoaded = ref(false)

  /**
   * Check if current user has a specific permission
   */
  const hasPermission = async (permission: string): Promise<boolean> => {
    try {
      // Check cache first
      if (hasUserPermission.value[permission] !== undefined) {
        return hasUserPermission.value[permission]
      }

      // Fetch from API
      const result = await $fetch('/api/check-user-permission', {
        method: 'POST',
        body: { permission }
      })

      // Cache the result
      hasUserPermission.value[permission] = result
      return result
    } catch (error) {
      console.error('Error checking permission:', permission, error)
      hasUserPermission.value[permission] = false
      return false
    }
  }

  /**
   * Load all commonly used permissions at once
   */
  const loadPermissions = async () => {
    const commonPermissions = [
      'users.read',
      'users.create', 
      'users.update',
      'users.delete',
      'settings.read',
      'settings.update',
      'roles.read',
      'roles.create',
      'payroll.read',
      'security.audit'
    ]

    try {
      const results = await Promise.all(
        commonPermissions.map(async (permission) => ({
          permission,
          hasAccess: await hasPermission(permission)
        }))
      )

      // Update cache
      results.forEach(({ permission, hasAccess }) => {
        hasUserPermission.value[permission] = hasAccess
      })

      permissionsLoaded.value = true
    } catch (error) {
      console.error('Error loading permissions:', error)
    }
  }

  /**
   * Reactive computed for common page permissions
   */
  const canAccessEmployees = computed(() => hasUserPermission.value['users.read'] === true)
  const canAccessSettings = computed(() => hasUserPermission.value['settings.read'] === true)
  const canAccessRoles = computed(() => hasUserPermission.value['roles.read'] === true)
  const canAccessRecords = computed(() => hasUserPermission.value['payroll.read'] === true)
  const canAccessSecurityLogs = computed(() => hasUserPermission.value['security.audit'] === true)

  return {
    hasPermission,
    loadPermissions,
    permissionsLoaded,
    canAccessEmployees,
    canAccessSettings,
    canAccessRoles,
    canAccessRecords,
    canAccessSecurityLogs
  }
}