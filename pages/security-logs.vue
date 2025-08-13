<template>
  <Title>Security Audit Logs</Title>
  <div class="min-h-screen bg-primary_white p-4">
    <div class="container mx-auto">
      <h1 class="text-3xl font-bold text-black mb-6">Security Audit Logs</h1>
      
      <!-- Filters -->
      <div class="card bg-white shadow-lg mb-6 p-4">
        <h2 class="text-xl font-semibold mb-4">Filters</h2>
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
          <!-- Event Type Filter -->
          <div>
            <label class="block text-sm font-medium mb-1">Event Type</label>
            <select v-model="filters.eventType" @change="fetchLogs" class="select select-sm border-dark_green bg-white w-full">
              <option value="">All Events</option>
              <option value="LOGIN_SUCCESS">Login Success</option>
              <option value="LOGIN_FAILED">Login Failed</option>
              <option value="FAILED_LOGIN_ATTEMPT">Failed Login Attempt</option>
              <option value="ACCOUNT_LOCKED">Account Locked</option>
              <option value="ACCOUNT_UNLOCKED">Account Unlocked</option>
              <option value="ACCESS_DENIED">Access Denied</option>
              <option value="CREDENTIALS_UPDATED">Credentials Updated</option>
              <option value="PASSWORD_RESET_REQUESTED">Password Reset</option>
              <option value="ACCOUNT_CREATED">Account Created</option>
            </select>
          </div>
          
          <!-- Severity Filter -->
          <div>
            <label class="block text-sm font-medium mb-1">Severity</label>
            <select v-model="filters.severity" @change="fetchLogs" class="select select-sm border-dark_green bg-white w-full">
              <option value="">All Severities</option>
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
              <option value="CRITICAL">Critical</option>
            </select>
          </div>
          
          <!-- Date Range -->
          <div>
            <label class="block text-sm font-medium mb-1">From Date</label>
            <input v-model="filters.fromDate" @change="fetchLogs" type="date" class="input input-sm border-dark_green bg-white w-full">
          </div>
          
          <div>
            <label class="block text-sm font-medium mb-1">To Date</label>
            <input v-model="filters.toDate" @change="fetchLogs" type="date" class="input input-sm border-dark_green bg-white w-full">
          </div>
        </div>
        
        <!-- Additional Actions -->
        <div class="flex justify-between items-center mt-4">
          <button @click="clearFilters" class="btn btn-sm btn-ghost">Clear Filters</button>
          <div class="flex gap-2">
            <button @click="fetchLogs" :disabled="isLoading" class="btn btn-sm bg-primary_green text-white">
              <span v-if="isLoading" class="loading loading-spinner loading-xs"></span>
              Refresh
            </button>
            <button @click="exportLogs" class="btn btn-sm bg-dark_green text-white">Export CSV</button>
          </div>
        </div>
      </div>

      <!-- Summary Cards -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div class="card bg-white shadow p-4">
          <h3 class="text-sm font-medium text-gray-600">Total Events</h3>
          <p class="text-2xl font-bold text-black">{{ summary.total }}</p>
        </div>
        <div class="card bg-white shadow p-4">
          <h3 class="text-sm font-medium text-gray-600">Critical Events</h3>
          <p class="text-2xl font-bold text-red-600">{{ summary.critical }}</p>
        </div>
        <div class="card bg-white shadow p-4">
          <h3 class="text-sm font-medium text-gray-600">Failed Logins (24h)</h3>
          <p class="text-2xl font-bold text-orange-600">{{ summary.failedLogins }}</p>
        </div>
        <div class="card bg-white shadow p-4">
          <h3 class="text-sm font-medium text-gray-600">Access Denials (24h)</h3>
          <p class="text-2xl font-bold text-yellow-600">{{ summary.accessDenied }}</p>
        </div>
      </div>

      <!-- Security Logs Table -->
      <div class="card bg-white shadow-lg">
        <div class="overflow-x-auto">
          <table class="table table-zebra w-full">
            <thead>
              <tr class="bg-gray-100">
                <th>Timestamp</th>
                <th>Event Type</th>
                <th>Severity</th>
                <th>User</th>
                <th>IP Address</th>
                <th>Details</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="isLoading">
                <td colspan="7" class="text-center py-8">
                  <span class="loading loading-spinner loading-lg"></span>
                  <p class="mt-2">Loading security logs...</p>
                </td>
              </tr>
              <tr v-else-if="logs.length === 0">
                <td colspan="7" class="text-center py-8 text-gray-500">
                  No security events found for the selected filters.
                </td>
              </tr>
              <tr v-else v-for="log in logs" :key="log.id" :class="getSeverityClass(log.severity)">
                <td>{{ formatDate(log.created_at) }}</td>
                <td>
                  <span class="badge badge-outline">{{ log.event_type }}</span>
                </td>
                <td>
                  <span :class="getSeverityBadgeClass(log.severity)" class="badge">
                    {{ log.severity }}
                  </span>
                </td>
                <td>
                  <div v-if="log.user_email">
                    <div class="font-medium">{{ log.user_email }}</div>
                    <div class="text-xs text-gray-500">{{ log.user_id?.substring(0, 8) }}...</div>
                  </div>
                  <span v-else class="text-gray-400">System</span>
                </td>
                <td>{{ log.ip_address || 'N/A' }}</td>
                <td>
                  <div class="max-w-xs">
                    <div v-if="log.resource_accessed" class="text-sm">{{ log.resource_accessed }}</div>
                    <div v-if="log.details" class="text-xs text-gray-600 truncate">
                      {{ formatDetails(log.details) }}
                    </div>
                  </div>
                </td>
                <td>
                  <button @click="viewDetails(log)" class="btn btn-xs btn-ghost">View</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Pagination -->
      <div class="flex justify-center mt-6" v-if="totalPages > 1">
        <div class="join">
          <button 
            v-for="page in visiblePages" 
            :key="page"
            @click="changePage(page)"
            :class="page === currentPage ? 'btn-active' : ''"
            class="join-item btn btn-sm"
          >
            {{ page }}
          </button>
        </div>
      </div>
    </div>

    <!-- Detail Modal -->
    <div v-if="selectedLog" class="modal modal-open">
      <div class="modal-box max-w-2xl">
        <h3 class="font-bold text-lg mb-4">Security Event Details</h3>
        
        <div class="space-y-3">
          <div><strong>Event Type:</strong> {{ selectedLog.event_type }}</div>
          <div><strong>Timestamp:</strong> {{ formatDate(selectedLog.created_at) }}</div>
          <div><strong>Severity:</strong> 
            <span :class="getSeverityBadgeClass(selectedLog.severity)" class="badge ml-2">
              {{ selectedLog.severity }}
            </span>
          </div>
          <div v-if="selectedLog.user_email"><strong>User:</strong> {{ selectedLog.user_email }}</div>
          <div v-if="selectedLog.user_id"><strong>User ID:</strong> {{ selectedLog.user_id }}</div>
          <div v-if="selectedLog.ip_address"><strong>IP Address:</strong> {{ selectedLog.ip_address }}</div>
          <div v-if="selectedLog.user_agent"><strong>User Agent:</strong> {{ selectedLog.user_agent }}</div>
          <div v-if="selectedLog.resource_accessed"><strong>Resource:</strong> {{ selectedLog.resource_accessed }}</div>
          
          <div v-if="selectedLog.details">
            <strong>Additional Details:</strong>
            <pre class="bg-gray-100 p-3 rounded mt-2 text-sm overflow-x-auto">{{ JSON.stringify(selectedLog.details, null, 2) }}</pre>
          </div>
        </div>
        
        <div class="modal-action">
          <button @click="selectedLog = null" class="btn">Close</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { checkUserAuthorization, logSecurityEvent } from '~/utils/security'

definePageMeta({
  layout: false
})

const supabase = useSupabaseClient()

// Data
const logs = ref([])
const selectedLog = ref(null)
const isLoading = ref(false)
const currentPage = ref(1)
const totalPages = ref(1)
const itemsPerPage = 25

// Summary data
const summary = ref({
  total: 0,
  critical: 0,
  failedLogins: 0,
  accessDenied: 0
})

// Filters
const filters = ref({
  eventType: '',
  severity: '',
  fromDate: '',
  toDate: '',
  userEmail: ''
})

// Computed
const visiblePages = computed(() => {
  const pages = []
  const start = Math.max(1, currentPage.value - 2)
  const end = Math.min(totalPages.value, currentPage.value + 2)
  
  for (let i = start; i <= end; i++) {
    pages.push(i)
  }
  return pages
})

// Methods
async function fetchLogs(page = 1) {
  isLoading.value = true
  
  try {
    let query = supabase
      .from('SecurityLogs')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range((page - 1) * itemsPerPage, page * itemsPerPage - 1)

    // Apply filters
    if (filters.value.eventType) {
      query = query.eq('event_type', filters.value.eventType)
    }
    if (filters.value.severity) {
      query = query.eq('severity', filters.value.severity)
    }
    if (filters.value.fromDate) {
      query = query.gte('created_at', filters.value.fromDate + 'T00:00:00.000Z')
    }
    if (filters.value.toDate) {
      query = query.lte('created_at', filters.value.toDate + 'T23:59:59.999Z')
    }

    const { data, error, count } = await query

    if (error) throw error

    logs.value = data || []
    totalPages.value = Math.ceil((count || 0) / itemsPerPage)
    currentPage.value = page
    
    await fetchSummary()
    
  } catch (error) {
    console.error('Error fetching security logs:', error)
  } finally {
    isLoading.value = false
  }
}

async function fetchSummary() {
  try {
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    
    // Get total count
    const { count: totalCount } = await supabase
      .from('SecurityLogs')
      .select('*', { count: 'exact', head: true })
    
    // Get critical events
    const { count: criticalCount } = await supabase
      .from('SecurityLogs')
      .select('*', { count: 'exact', head: true })
      .eq('severity', 'CRITICAL')
    
    // Get failed logins in last 24h
    const { count: failedLoginCount } = await supabase
      .from('SecurityLogs')
      .select('*', { count: 'exact', head: true })
      .eq('event_type', 'LOGIN_FAILED')
      .gte('created_at', yesterday.toISOString())
    
    // Get access denied in last 24h
    const { count: accessDeniedCount } = await supabase
      .from('SecurityLogs')
      .select('*', { count: 'exact', head: true })
      .eq('event_type', 'ACCESS_DENIED')
      .gte('created_at', yesterday.toISOString())
    
    summary.value = {
      total: totalCount || 0,
      critical: criticalCount || 0,
      failedLogins: failedLoginCount || 0,
      accessDenied: accessDeniedCount || 0
    }
  } catch (error) {
    console.error('Error fetching summary:', error)
  }
}

function clearFilters() {
  filters.value = {
    eventType: '',
    severity: '',
    fromDate: '',
    toDate: '',
    userEmail: ''
  }
  fetchLogs(1)
}

function changePage(page) {
  fetchLogs(page)
}

function viewDetails(log) {
  selectedLog.value = log
}

function formatDate(dateString) {
  return new Date(dateString).toLocaleString()
}

function formatDetails(details) {
  if (typeof details === 'object') {
    return Object.entries(details)
      .map(([key, value]) => `${key}: ${value}`)
      .join(', ')
  }
  return String(details)
}

function getSeverityClass(severity) {
  switch (severity) {
    case 'CRITICAL': return 'bg-red-50'
    case 'HIGH': return 'bg-orange-50'
    case 'MEDIUM': return 'bg-yellow-50'
    default: return ''
  }
}

function getSeverityBadgeClass(severity) {
  switch (severity) {
    case 'CRITICAL': return 'badge-error text-white'
    case 'HIGH': return 'badge-warning text-white'
    case 'MEDIUM': return 'badge-info text-white'
    default: return 'badge-success text-white'
  }
}

async function exportLogs() {
  try {
    let query = supabase
      .from('SecurityLogs')
      .select('*')
      .order('created_at', { ascending: false })

    // Apply current filters
    if (filters.value.eventType) {
      query = query.eq('event_type', filters.value.eventType)
    }
    if (filters.value.severity) {
      query = query.eq('severity', filters.value.severity)
    }
    if (filters.value.fromDate) {
      query = query.gte('created_at', filters.value.fromDate + 'T00:00:00.000Z')
    }
    if (filters.value.toDate) {
      query = query.lte('created_at', filters.value.toDate + 'T23:59:59.999Z')
    }

    const { data, error } = await query

    if (error) throw error

    // Convert to CSV
    const csv = convertToCSV(data)
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `security-logs-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  } catch (error) {
    console.error('Error exporting logs:', error)
  }
}

function convertToCSV(data) {
  const headers = ['Timestamp', 'Event Type', 'Severity', 'User Email', 'User ID', 'IP Address', 'Resource', 'Details']
  const rows = data.map(log => [
    log.created_at,
    log.event_type,
    log.severity,
    log.user_email || '',
    log.user_id || '',
    log.ip_address || '',
    log.resource_accessed || '',
    JSON.stringify(log.details || {})
  ])
  
  return [headers, ...rows].map(row => 
    row.map(field => `"${String(field).replace(/"/g, '""')}"`).join(',')
  ).join('\n')
}

// Authorization check
async function checkAccess() {
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    navigateTo('/login')
    return
  }

  const authCheck = await checkUserAuthorization(user.id, ['Admin', 'Developer'])
  if (!authCheck.authorized) {
    throw createError({ 
      statusCode: 403, 
      statusMessage: 'Access denied. Admin privileges required.' 
    })
  }

  // Log security log access
  await logSecurityEvent({
    eventType: 'SECURITY_LOGS_ACCESSED',
    userId: user.id,
    userEmail: user.email,
    resourceAccessed: '/security-logs',
    severity: 'LOW'
  })
}

// Lifecycle
onMounted(async () => {
  await checkAccess()
  await fetchLogs()
})
</script>