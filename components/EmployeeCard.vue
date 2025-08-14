<template>
  <div
    class="overflow-hidden rounded-xl border border-search_stroke_gray bg-white shadow-sm transition-all duration-200 hover:shadow-md"
  >
    <!-- Card Header with Avatar and Status -->
    <div class="p-6">
      <div class="mb-4 flex items-start justify-between">
        <div class="flex items-center space-x-3">
          <div class="relative">
            <div
              class="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-primary_green to-dark_green"
            >
              <img src="~/assets/icons/user.png" class="h-6 w-6" />
            </div>
            <!-- Status indicator -->
            <div
              :class="[
                employee.time_in_status
                  ? 'bg-clock_in_green'
                  : 'bg-clock_out_red',
              ]"
              class="absolute -bottom-1 -right-1 h-4 w-4 rounded-full border-2 border-white"
            ></div>
          </div>
          <div>
            <h3 class="text-lg font-semibold text-dark_gray">
              {{ employee.first_name }} {{ employee.last_name }}
            </h3>
            <p class="text-sm capitalize text-dark_gray/60">
              {{ employee.primary_role || "Employee" }}
            </p>
          </div>
        </div>

        <!-- Status badges -->
        <div class="flex items-center space-x-2">
          <!-- Lock status badge -->
          <div
            v-if="isAccountLocked"
            class="flex items-center space-x-1 rounded-full bg-clock_out_red/10 px-2 py-1 text-xs font-medium text-clock_out_red"
          >
            <svg
              class="h-3 w-3"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
            <span>Locked</span>
          </div>
          
          <!-- OTP status badge -->
          <div
            v-if="employee.requires_otp"
            class="flex items-center space-x-1 rounded-full bg-blue-50 px-2 py-1 text-xs font-medium text-blue-600"
            title="Two-factor authentication enabled"
          >
            <svg
              class="h-3 w-3"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
              />
            </svg>
            <span>2FA</span>
          </div>
        </div>
      </div>

      <!-- Employee Details -->
      <div class="mb-6 space-y-3">
        <div
          class="flex items-center justify-between border-b border-search_stroke_gray/50 py-2"
        >
          <span class="text-sm text-dark_gray/70">Status:</span>
          <div class="flex items-center space-x-2">
            <div
              :class="[
                employee.time_in_status
                  ? 'bg-clock_in_green'
                  : 'bg-clock_out_red',
              ]"
              class="h-2 w-2 rounded-full"
            ></div>
            <span
              class="text-sm font-medium"
              :class="[
                employee.time_in_status
                  ? 'text-clock_in_green'
                  : 'text-clock_out_red',
              ]"
            >
              {{ employee.time_in_status ? "Clocked In" : "Clocked Out" }}
            </span>
          </div>
        </div>

        <div
          class="flex items-center justify-between border-b border-search_stroke_gray/50 py-2"
        >
          <span class="text-sm text-dark_gray/70">Employee ID:</span>
          <span class="font-mono text-sm text-dark_gray"
            >{{ employee.id.slice(0, 8) }}...</span
          >
        </div>

        <div class="flex items-center justify-between py-2">
          <span class="text-sm text-dark_gray/70">Last Activity:</span>
          <span class="text-sm text-dark_gray">{{
            formatTime(employee.last_updated)
          }}</span>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="flex items-center justify-end space-x-2">
        <button
          v-if="isAccountLocked && canUnlockUsers"
          @click="handleUnlock"
          :disabled="isUnlocking"
          class="bg-orange-500 hover:bg-orange-600 btn btn-sm border-none text-white"
          title="Unlock Account"
        >
          <span
            v-if="isUnlocking"
            class="loading loading-spinner loading-xs"
          ></span>
          <svg
            v-else
            class="h-4 w-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z"
            />
          </svg>
        </button>

        <NuxtLink v-if="canUpdateUsers" :to="`/edit-account/${employee.id}`">
          <button
            class="bg-blue-500 hover:bg-blue-600 btn btn-sm border-none text-white"
            title="Edit Employee"
          >
            <svg
              class="h-4 w-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
              />
            </svg>
          </button>
        </NuxtLink>

        <button
          v-if="canDeleteUsers"
          @click="handleDelete"
          class="hover:bg-red-700 btn btn-sm border-none bg-clock_out_red text-white"
          title="Delete Employee"
        >
          <svg
            class="h-4 w-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
            />
          </svg>
        </button>
        
        <!-- Read-only notice for users without permissions -->
        <div v-if="!canUnlockUsers && !canUpdateUsers && !canDeleteUsers" class="text-xs text-gray-500 italic">
          Read-only access
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from "vue-router";

const supabase = useSupabaseClient();
const router = useRouter();

const props = defineProps({
  employee: Object,
});

const emit = defineEmits(["employee-unlocked", "employee-deleted"]);

// Permission management
const { hasPermission } = usePermissions();
const canUnlockUsers = ref(false);
const canUpdateUsers = ref(false);
const canDeleteUsers = ref(false);

// Reactive state for unlock operation
const isUnlocking = ref(false);

// Computed property to check if account is locked
const isAccountLocked = computed(() => {
  if (!props.employee.locked_until) return false;
  const lockExpiry = new Date(props.employee.locked_until);
  const now = new Date();
  return lockExpiry > now;
});

const formatTime = (time) => {
  if (!time) {
    return 'No activity recorded';
  }
  
  try {
    const formattedTime = new Date(time);
    
    // Check if the date is valid
    if (isNaN(formattedTime.getTime())) {
      return 'Invalid date';
    }
    
    return (
      formattedTime.toLocaleDateString() +
      " " +
      formattedTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    );
  } catch (error) {
    console.error('Error formatting time:', error);
    return 'Invalid date';
  }
};

// Handles account unlock
const handleUnlock = async () => {
  const targetEmail = await getEmployeeEmail();
  if (!targetEmail) {
    alert("Unable to retrieve employee email");
    return;
  }

  if (
    !confirm(
      `Are you sure you want to unlock the account for ${props.employee.first_name} ${props.employee.last_name} (${targetEmail})?`,
    )
  ) {
    return;
  }

  isUnlocking.value = true;

  try {
    const response = await $fetch("/api/unlock-account", {
      method: "POST",
      body: { targetEmail },
    });

    if (response.success) {
      alert(`Account for ${targetEmail} has been unlocked successfully`);
      emit("employee-unlocked");
    } else {
      alert(`Failed to unlock account: ${response.error}`);
    }
  } catch (error) {
    console.error("Error unlocking account:", error);
    alert("Failed to unlock account. Please try again.");
  } finally {
    isUnlocking.value = false;
  }
};

// Get employee email from auth.users table via API
const getEmployeeEmail = async () => {
  try {
    const response = await $fetch("/api/get-user-email", {
      method: "POST",
      body: { userId: props.employee.id },
    });

    if (response.success) {
      return response.email;
    } else {
      console.error("Error getting email:", response.error);
      return null;
    }
  } catch (error) {
    console.error("Error getting employee email:", error);
    return null;
  }
};

// Handles employee deletion
const handleDelete = async () => {
  const confirmDelete = window.confirm(
    "Are you sure you want to proceed? Deleting this user will erase all of their data. This action cannot be undone.",
  );

  if (!confirmDelete) {
    return;
  }

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser(); // Get the user performing the action
    
    if (!user) {
      alert("Authentication required. Please log in again.");
      return;
    }

    console.log("Retrieved user:", user);

    // Send delete user request to server - this will handle both auth and employee deletion
    const response = await fetch("/api/delete-user", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        targetId: props.employee.id,
      }),
    });

    const result = await response.json();
    
    if (response.ok && result.status === 200) {
      console.log("Successfully deleted user:", result);
      alert("The user has been successfully deleted!");
      
      // Emit event to parent component for immediate refresh
      emit("employee-deleted");
      
      // Also use soft refresh as backup to avoid token corruption
      try {
        // Small delay to allow event to process first
        await new Promise(resolve => setTimeout(resolve, 100));
        // Navigate to the same route to trigger a soft refresh
        await router.push({ path: '/employees', query: { refresh: Date.now() } });
      } catch (navError) {
        console.warn('Soft refresh failed, will rely on event emission:', navError);
        // Don't use hard refresh as it causes token corruption
      }
    } else {
      console.error("Delete user error:", result);
      alert(`Failed to delete user: ${result.body?.error?.message || 'Unknown error'}`);
    }
    
  } catch (error) {
    console.error("Error during deletion process:", error);
    alert("An error occurred during the deletion process. Please try again.");
  }
};

// Check specific action permissions
const checkActionPermissions = async () => {
  canUnlockUsers.value = await hasPermission('users.unlock');
  canUpdateUsers.value = await hasPermission('users.update');
  canDeleteUsers.value = await hasPermission('users.delete');
};

// Verification check to see if user has required permissions
const verifyUserPermissions = async () => {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    try {
      // Check if user has users.read permission using the new permission system
      const hasReadPermission = await $fetch('/api/check-user-permission', {
        method: 'POST',
        body: { permission: 'users.read' }
      })
      
      if (!hasReadPermission) {
        alert("You do not have permission to view this page!");
        router.push("/");
      }
    } catch (error) {
      console.log("Error checking permissions:", error);
      router.push("/login");
    }
  } else {
    console.log("User is not logged in.");
    router.push("/login");
  }
};

// Functions to be run once page loads
verifyUserPermissions();
checkActionPermissions();
</script>
