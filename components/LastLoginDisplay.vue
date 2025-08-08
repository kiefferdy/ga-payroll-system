<template>
  <div class="last-login-display bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
    <div class="flex items-center justify-between mb-3">
      <h3 class="text-sm font-semibold text-gray-700">Last Login Information</h3>
      <div class="flex items-center">
        <div class="w-2 h-2 rounded-full mr-2" :class="statusIndicatorClass"></div>
        <span class="text-xs text-gray-500">{{ statusText }}</span>
      </div>
    </div>
    
    <div v-if="loading" class="flex items-center text-gray-500">
      <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-500 mr-2"></div>
      <span class="text-sm">Loading login information...</span>
    </div>
    
    <div v-else-if="error" class="text-red-600 text-sm">
      <span>Unable to load login information</span>
    </div>
    
    <div v-else class="space-y-2">
      <div class="flex justify-between items-center">
        <span class="text-sm text-gray-600">Last Login:</span>
        <span class="text-sm font-medium text-gray-900">{{ formattedLastLogin }}</span>
      </div>
      
      <div v-if="loginData?.previous_login_at" class="flex justify-between items-center">
        <span class="text-sm text-gray-600">Previous Login:</span>
        <span class="text-sm text-gray-700">{{ formatDate(loginData.previous_login_at) }}</span>
      </div>
      
      <div class="flex justify-between items-center">
        <span class="text-sm text-gray-600">Total Logins:</span>
        <span class="text-sm text-gray-700">{{ loginData?.login_count || 'N/A' }}</span>
      </div>
      
      <div v-if="showSecurityInfo" class="mt-3 pt-2 border-t border-gray-100">
        <div class="flex justify-between items-center">
          <span class="text-sm text-gray-600">Failed Attempts:</span>
          <span class="text-sm" :class="failedAttemptsClass">{{ loginData?.failed_attempts || 0 }}</span>
        </div>
        
        <div v-if="loginData?.account_locked_until" class="flex justify-between items-center mt-1">
          <span class="text-sm text-gray-600">Account Status:</span>
          <span class="text-sm text-red-600">{{ lockoutStatus }}</span>
        </div>
      </div>
      
      <div v-if="showViewHistory" class="mt-3">
        <button 
          @click="$emit('view-history')" 
          class="text-xs text-blue-600 hover:text-blue-800 underline"
        >
          View Login History
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';

// Props
const props = defineProps({
  userId: {
    type: String,
    default: null
  },
  showSecurityInfo: {
    type: Boolean,
    default: false
  },
  showViewHistory: {
    type: Boolean,
    default: false
  },
  compact: {
    type: Boolean,
    default: false
  }
});

// Emits
const emit = defineEmits(['view-history']);

// Reactive data
const loading = ref(true);
const error = ref(false);
const loginData = ref(null);
const supabase = useSupabaseClient();

// Computed properties
const formattedLastLogin = computed(() => {
  if (!loginData.value?.last_login_at) return 'Never';
  return formatDate(loginData.value.last_login_at);
});

const statusIndicatorClass = computed(() => {
  if (error.value) return 'bg-red-500';
  if (loginData.value?.account_locked_until && new Date(loginData.value.account_locked_until) > new Date()) {
    return 'bg-red-500';
  }
  if (loginData.value?.failed_attempts > 3) return 'bg-yellow-500';
  return 'bg-green-500';
});

const statusText = computed(() => {
  if (error.value) return 'Error';
  if (loginData.value?.account_locked_until && new Date(loginData.value.account_locked_until) > new Date()) {
    return 'Locked';
  }
  if (loginData.value?.failed_attempts > 3) return 'Warning';
  return 'Secure';
});

const failedAttemptsClass = computed(() => {
  const attempts = loginData.value?.failed_attempts || 0;
  if (attempts > 3) return 'text-red-600 font-medium';
  if (attempts > 1) return 'text-yellow-600';
  return 'text-gray-700';
});

const lockoutStatus = computed(() => {
  if (!loginData.value?.account_locked_until) return 'Active';
  const lockoutTime = new Date(loginData.value.account_locked_until);
  const now = new Date();
  
  if (lockoutTime > now) {
    const minutes = Math.ceil((lockoutTime - now) / (1000 * 60));
    return `Locked (${minutes}m remaining)`;
  }
  return 'Active';
});

// Methods
function formatDate(dateString) {
  if (!dateString) return 'Unknown';
  
  const date = new Date(dateString);
  const now = new Date();
  const diffInHours = (now - date) / (1000 * 60 * 60);
  
  if (diffInHours < 1) {
    const minutes = Math.floor(diffInHours * 60);
    return `${minutes}m ago`;
  } else if (diffInHours < 24) {
    const hours = Math.floor(diffInHours);
    return `${hours}h ago`;
  } else if (diffInHours < 24 * 7) {
    const days = Math.floor(diffInHours / 24);
    return `${days}d ago`;
  } else {
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    });
  }
}

async function fetchLoginData() {
  try {
    loading.value = true;
    error.value = false;
    
    // Get current user if no userId provided
    let targetUserId = props.userId;
    if (!targetUserId) {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('No user authenticated');
      }
      targetUserId = user.id;
    }
    
    // Fetch employee data including login information
    const { data: employeeData, error: employeeError } = await supabase
      .from('Employees')
      .select(`
        last_login_at,
        failed_login_attempts,
        account_locked_until
      `)
      .eq('id', targetUserId)
      .single();
    
    if (employeeError) {
      console.error('Error fetching employee login data:', employeeError);
      throw employeeError;
    }
    
    // Get additional login statistics from auth_attempts table if available
    const { data: statsData } = await supabase
      .from('auth_attempts')
      .select('*')
      .eq('user_id', targetUserId)
      .eq('success', true)
      .order('attempted_at', { ascending: false })
      .limit(2);
    
    // Combine the data
    loginData.value = {
      last_login_at: employeeData.last_login_at,
      failed_attempts: employeeData.failed_login_attempts || 0,
      account_locked_until: employeeData.account_locked_until,
      previous_login_at: statsData && statsData.length > 1 ? statsData[1].attempted_at : null,
      login_count: statsData ? statsData.length : null
    };
    
  } catch (err) {
    console.error('Error fetching login data:', err);
    error.value = true;
  } finally {
    loading.value = false;
  }
}

// Lifecycle
onMounted(() => {
  fetchLoginData();
});

// Expose refresh method
defineExpose({
  refresh: fetchLoginData
});
</script>

<style scoped>
.last-login-display {
  min-height: 120px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif;
}

.animate-spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
</style>