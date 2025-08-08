<template>
  <Title>Security Dashboard - Admin</Title>
  <div class="min-h-screen bg-gray-50 py-8">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <!-- Header -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900">Security Dashboard</h1>
        <p class="mt-2 text-gray-600">Monitor system security, login activity, and potential threats</p>
      </div>

      <!-- Quick Stats -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div class="bg-white overflow-hidden shadow rounded-lg">
          <div class="p-5">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <div class="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                  <svg class="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                </div>
              </div>
              <div class="ml-5 w-0 flex-1">
                <dl>
                  <dt class="text-sm font-medium text-gray-500 truncate">Successful Logins (24h)</dt>
                  <dd class="text-lg font-medium text-gray-900">{{ stats.successfulLogins }}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div class="bg-white overflow-hidden shadow rounded-lg">
          <div class="p-5">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <div class="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
                  <svg class="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"/>
                  </svg>
                </div>
              </div>
              <div class="ml-5 w-0 flex-1">
                <dl>
                  <dt class="text-sm font-medium text-gray-500 truncate">Failed Attempts (24h)</dt>
                  <dd class="text-lg font-medium text-gray-900">{{ stats.failedLogins }}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div class="bg-white overflow-hidden shadow rounded-lg">
          <div class="p-5">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <div class="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center">
                  <svg class="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM14 11a1 1 0 011 1v1h1a1 1 0 110 2h-1v1a1 1 0 11-2 0v-1h-1a1 1 0 110-2h1v-1a1 1 0 011-1z"/>
                  </svg>
                </div>
              </div>
              <div class="ml-5 w-0 flex-1">
                <dl>
                  <dt class="text-sm font-medium text-gray-500 truncate">Locked Accounts</dt>
                  <dd class="text-lg font-medium text-gray-900">{{ stats.lockedAccounts }}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div class="bg-white overflow-hidden shadow rounded-lg">
          <div class="p-5">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <div class="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                  <svg class="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z"/>
                  </svg>
                </div>
              </div>
              <div class="ml-5 w-0 flex-1">
                <dl>
                  <dt class="text-sm font-medium text-gray-500 truncate">Active Users</dt>
                  <dd class="text-lg font-medium text-gray-900">{{ stats.activeUsers }}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <!-- Recent Login Activity -->
        <div class="bg-white shadow rounded-lg">
          <div class="px-6 py-4 border-b border-gray-200">
            <h2 class="text-lg font-medium text-gray-900">Recent Login Activity</h2>
            <p class="text-sm text-gray-500">Latest authentication attempts</p>
          </div>
          <div class="p-6">
            <div v-if="loadingActivity" class="flex justify-center py-8">
              <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
            <div v-else class="space-y-4">
              <div v-for="activity in recentActivity" :key="activity.id" class="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
                <div class="flex items-center space-x-3">
                  <div class="flex-shrink-0">
                    <div class="w-8 h-8 rounded-full flex items-center justify-center" :class="activity.success ? 'bg-green-100' : 'bg-red-100'">
                      <svg v-if="activity.success" class="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"/>
                      </svg>
                      <svg v-else class="w-4 h-4 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"/>
                      </svg>
                    </div>
                  </div>
                  <div>
                    <p class="text-sm font-medium text-gray-900">{{ activity.email || 'Unknown User' }}</p>
                    <p class="text-xs text-gray-500">{{ formatDateTime(activity.attempted_at) }}</p>
                  </div>
                </div>
                <div class="text-right">
                  <p class="text-sm" :class="activity.success ? 'text-green-600' : 'text-red-600'">
                    {{ activity.success ? 'Success' : 'Failed' }}
                  </p>
                  <p v-if="activity.ip_address" class="text-xs text-gray-500">{{ activity.ip_address }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Security Events -->
        <div class="bg-white shadow rounded-lg">
          <div class="px-6 py-4 border-b border-gray-200">
            <h2 class="text-lg font-medium text-gray-900">Security Events</h2>
            <p class="text-sm text-gray-500">Critical security incidents and alerts</p>
          </div>
          <div class="p-6">
            <div v-if="loadingEvents" class="flex justify-center py-8">
              <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
            <div v-else class="space-y-4">
              <div v-for="event in securityEvents" :key="event.id" class="flex items-start space-x-3 py-3 border-b border-gray-100 last:border-b-0">
                <div class="flex-shrink-0">
                  <div class="w-8 h-8 rounded-full flex items-center justify-center" :class="getSeverityColor(event.severity)">
                    <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"/>
                    </svg>
                  </div>
                </div>
                <div class="flex-1">
                  <p class="text-sm font-medium text-gray-900">{{ event.event_type.replace(/_/g, ' ').toUpperCase() }}</p>
                  <p class="text-xs text-gray-600 mt-1">{{ event.description }}</p>
                  <p class="text-xs text-gray-500 mt-1">{{ formatDateTime(event.created_at) }}</p>
                </div>
                <div class="flex-shrink-0">
                  <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium" :class="getSeverityBadgeColor(event.severity)">
                    {{ event.severity }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Account Status Table -->
      <div class="mt-8 bg-white shadow rounded-lg">
        <div class="px-6 py-4 border-b border-gray-200">
          <h2 class="text-lg font-medium text-gray-900">Account Status Overview</h2>
          <p class="text-sm text-gray-500">Current security status of all employee accounts</p>
        </div>
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Employee</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Login</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Failed Attempts</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="account in accountStatuses" :key="account.id">
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="flex items-center">
                    <div>
                      <div class="text-sm font-medium text-gray-900">{{ account.first_name }} {{ account.last_name }}</div>
                      <div class="text-sm text-gray-500">{{ account.rank }}</div>
                    </div>
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {{ account.last_login_at ? formatDateTime(account.last_login_at) : 'Never' }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span class="text-sm" :class="account.failed_login_attempts > 3 ? 'text-red-600 font-medium' : 'text-gray-900'">
                    {{ account.failed_login_attempts || 0 }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium" :class="getAccountStatusColor(account)">
                    {{ getAccountStatusText(account) }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <button 
                    v-if="isAccountLocked(account)" 
                    @click="unlockAccount(account.id)"
                    class="text-blue-600 hover:text-blue-900 mr-3"
                  >
                    Unlock
                  </button>
                  <button 
                    @click="resetFailedAttempts(account.id)"
                    class="text-green-600 hover:text-green-900"
                  >
                    Reset
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
// Apply admin middleware to this page - security dashboard should be admin-only
definePageMeta({
  middleware: 'admin'
});

import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const supabase = useSupabaseClient();

// Reactive data
const loadingActivity = ref(true);
const loadingEvents = ref(true);
const stats = ref({
  successfulLogins: 0,
  failedLogins: 0,
  lockedAccounts: 0,
  activeUsers: 0
});
const recentActivity = ref([]);
const securityEvents = ref([]);
const accountStatuses = ref([]);

// Methods
function formatDateTime(dateString) {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

function getSeverityColor(severity) {
  switch (severity?.toLowerCase()) {
    case 'critical': return 'bg-red-100 text-red-600';
    case 'high': return 'bg-orange-100 text-orange-600';
    case 'medium': return 'bg-yellow-100 text-yellow-600';
    case 'low': return 'bg-green-100 text-green-600';
    default: return 'bg-gray-100 text-gray-600';
  }
}

function getSeverityBadgeColor(severity) {
  switch (severity?.toLowerCase()) {
    case 'critical': return 'bg-red-100 text-red-800';
    case 'high': return 'bg-orange-100 text-orange-800';
    case 'medium': return 'bg-yellow-100 text-yellow-800';
    case 'low': return 'bg-green-100 text-green-800';
    default: return 'bg-gray-100 text-gray-800';
  }
}

function getAccountStatusColor(account) {
  if (isAccountLocked(account)) return 'bg-red-100 text-red-800';
  if (account.failed_login_attempts > 3) return 'bg-yellow-100 text-yellow-800';
  return 'bg-green-100 text-green-800';
}

function getAccountStatusText(account) {
  if (isAccountLocked(account)) return 'Locked';
  if (account.failed_login_attempts > 3) return 'Warning';
  return 'Active';
}

function isAccountLocked(account) {
  return account.account_locked_until && new Date(account.account_locked_until) > new Date();
}

async function fetchStats() {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Get successful logins in last 24h
    const { data: successData } = await supabase
      .from('auth_attempts')
      .select('*')
      .eq('success', true)
      .gte('attempted_at', today.toISOString());
    
    // Get failed logins in last 24h  
    const { data: failedData } = await supabase
      .from('auth_attempts')
      .select('*')
      .eq('success', false)
      .gte('attempted_at', today.toISOString());
    
    // Get locked accounts
    const { data: lockedData } = await supabase
      .from('Employees')
      .select('*')
      .not('account_locked_until', 'is', null)
      .gt('account_locked_until', new Date().toISOString());
    
    // Get active users (logged in within 7 days)
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const { data: activeData } = await supabase
      .from('Employees')
      .select('*')
      .not('last_login_at', 'is', null)
      .gte('last_login_at', weekAgo.toISOString());
    
    stats.value = {
      successfulLogins: successData?.length || 0,
      failedLogins: failedData?.length || 0,
      lockedAccounts: lockedData?.length || 0,
      activeUsers: activeData?.length || 0
    };
  } catch (error) {
    console.error('Error fetching stats:', error);
  }
}

async function fetchRecentActivity() {
  try {
    loadingActivity.value = true;
    
    const { data, error } = await supabase
      .from('auth_attempts')
      .select('*')
      .order('attempted_at', { ascending: false })
      .limit(10);
    
    if (error) throw error;
    
    recentActivity.value = data || [];
  } catch (error) {
    console.error('Error fetching recent activity:', error);
  } finally {
    loadingActivity.value = false;
  }
}

async function fetchSecurityEvents() {
  try {
    loadingEvents.value = true;
    
    const { data, error } = await supabase
      .from('security_events')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10);
    
    if (error) throw error;
    
    securityEvents.value = data || [];
  } catch (error) {
    console.error('Error fetching security events:', error);
  } finally {
    loadingEvents.value = false;
  }
}

async function fetchAccountStatuses() {
  try {
    const { data, error } = await supabase
      .from('Employees')
      .select(`
        id,
        first_name,
        last_name,
        rank,
        last_login_at,
        failed_login_attempts,
        account_locked_until
      `)
      .order('last_name', { ascending: true });
    
    if (error) throw error;
    
    accountStatuses.value = data || [];
  } catch (error) {
    console.error('Error fetching account statuses:', error);
  }
}

async function unlockAccount(userId) {
  try {
    const { error } = await supabase
      .from('Employees')
      .update({
        account_locked_until: null,
        failed_login_attempts: 0
      })
      .eq('id', userId);
    
    if (error) throw error;
    
    // Refresh data
    await fetchAccountStatuses();
    await fetchStats();
    
    // Log the action
    await supabase
      .from('security_events')
      .insert({
        user_id: userId,
        event_type: 'account_unlocked',
        description: 'Account manually unlocked by administrator',
        severity: 'low'
      });
      
  } catch (error) {
    console.error('Error unlocking account:', error);
    alert('Failed to unlock account');
  }
}

async function resetFailedAttempts(userId) {
  try {
    const { error } = await supabase
      .from('Employees')
      .update({ failed_login_attempts: 0 })
      .eq('id', userId);
    
    if (error) throw error;
    
    // Refresh data
    await fetchAccountStatuses();
    await fetchStats();
    
    // Log the action
    await supabase
      .from('security_events')
      .insert({
        user_id: userId,
        event_type: 'failed_attempts_reset',
        description: 'Failed login attempts reset by administrator',
        severity: 'low'
      });
      
  } catch (error) {
    console.error('Error resetting failed attempts:', error);
    alert('Failed to reset attempts');
  }
}

// Lifecycle
onMounted(async () => {
  await Promise.all([
    fetchStats(),
    fetchRecentActivity(),
    fetchSecurityEvents(),
    fetchAccountStatuses()
  ]);
});
</script>

<style scoped>
.animate-spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
</style>