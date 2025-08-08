import { createClient } from '@supabase/supabase-js'

export default defineEventHandler(async (event) => {
  try {
    const supabaseUrl = useRuntimeConfig().public.supabase.url
    const supabaseServiceKey = useRuntimeConfig().supabaseBypassKey
    
    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('Missing Supabase configuration')
      return { 
        success: false, 
        error: 'Server configuration error',
        user: null,
        employee: null 
      }
    }

    const adminClient = createClient(supabaseUrl, supabaseServiceKey)

    // Get the Authorization header
    const authHeader = getHeader(event, 'authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return { 
        success: false, 
        error: 'No valid authorization header',
        user: null,
        employee: null 
      }
    }

    const token = authHeader.substring(7) // Remove 'Bearer ' prefix

    // Verify the JWT token
    const { data: userData, error: userError } = await adminClient.auth.getUser(token)
    
    if (userError || !userData.user) {
      console.log('Token verification failed:', userError?.message)
      return { 
        success: false, 
        error: 'Invalid or expired session',
        user: null,
        employee: null 
      }
    }

    // Get employee information including role
    const { data: employeeData, error: employeeError } = await adminClient
      .from('Employees')
      .select(`
        id,
        rank,
        account_type,
        first_name,
        last_name,
        last_login_at,
        requires_otp,
        account_locked_until,
        failed_login_attempts
      `)
      .eq('id', userData.user.id)
      .single()

    if (employeeError) {
      console.error('Error fetching employee data:', employeeError)
      return { 
        success: false, 
        error: 'User data not found',
        user: userData.user,
        employee: null 
      }
    }

    // Check if account is currently locked
    const isAccountLocked = employeeData.account_locked_until && 
                           new Date(employeeData.account_locked_until) > new Date()

    if (isAccountLocked) {
      return { 
        success: false, 
        error: 'Account is locked',
        user: userData.user,
        employee: employeeData 
      }
    }

    // Return successful verification with user and role info
    return {
      success: true,
      user: {
        id: userData.user.id,
        email: userData.user.email,
        email_confirmed_at: userData.user.email_confirmed_at,
        last_sign_in_at: userData.user.last_sign_in_at
      },
      employee: {
        id: employeeData.id,
        rank: employeeData.rank,
        account_type: employeeData.account_type,
        first_name: employeeData.first_name,
        last_name: employeeData.last_name,
        last_login_at: employeeData.last_login_at,
        requires_otp: employeeData.requires_otp
      }
    }

  } catch (error) {
    console.error('Auth verification error:', error)
    return { 
      success: false, 
      error: 'Internal server error',
      user: null,
      employee: null 
    }
  }
})