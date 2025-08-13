import { getUserFromRequest, getAuthenticatedClient } from '~/server/utils/supabase-clients'
import { hasPermission } from '~/utils/permissions'

export default defineEventHandler(async (event) => {
  try {
    if (event.node.req.method !== 'POST') {
      throw createError({
        statusCode: 405,
        statusMessage: 'Method not allowed'
      })
    }

    const { permission } = await readBody(event)

    if (!permission) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Permission parameter is required'
      })
    }

    // Get authenticated user
    const { user, error: userError } = await getUserFromRequest(event)
    
    if (userError || !user) {
      return false
    }

    // Get authenticated client
    const supabase = await getAuthenticatedClient(event)

    // Check if user has the specified permission
    const userHasPermission = await hasPermission(supabase, user.id, permission)

    return userHasPermission

  } catch (error) {
    console.error('Error checking user permission:', error)
    
    if (error && typeof error === 'object' && 'statusCode' in error) {
      throw error
    }
    
    return false
  }
})