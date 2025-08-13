<template>
  <div
    v-if="showModal"
    class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
  >
    <div class="card w-96 bg-primary_white p-6 text-black">
      <h2 class="mb-4 text-center text-xl font-bold">Confirm Your Identity</h2>
      <p class="text-gray-600 mb-6 text-center text-sm">
        To perform this sensitive operation, please re-enter your password.
      </p>

      <div class="mb-4">
        <label class="mb-2 block text-sm font-medium">Current Password</label>
        <input
          v-model="password"
          :type="hidePassword ? 'password' : 'text'"
          class="input input-sm w-full rounded border-dark_green bg-primary_white"
          placeholder="Enter your current password"
          @keyup.enter="authenticate"
          ref="passwordInput"
        />
        <div class="mt-2 flex items-center">
          <input
            type="checkbox"
            id="show-password"
            @change="hidePassword = !hidePassword"
            class="mr-2"
          />
          <label for="show-password" class="text-sm">Show password</label>
        </div>
      </div>

      <!-- Error Messages -->
      <div v-if="errorMessage" class="text-red-500 mb-4 text-center text-sm">
        {{ errorMessage }}
      </div>

      <!-- Loading State -->
      <div v-if="isLoading" class="mb-4 text-center">
        <div class="loading loading-spinner loading-sm"></div>
        <span class="ml-2">Verifying...</span>
      </div>

      <!-- Action Buttons -->
      <div class="flex justify-end space-x-2">
        <button
          @click="cancel"
          :disabled="isLoading"
          class="btn btn-ghost btn-sm rounded-full bg-dark_gray px-4 text-white"
        >
          Cancel
        </button>
        <button
          @click="authenticate"
          :disabled="isLoading || !password.trim()"
          class="btn btn-ghost btn-sm rounded-full bg-button_green px-4 text-white"
        >
          Confirm
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, nextTick } from "vue";
import { logSecurityEvent } from "~/utils/security";

const props = defineProps({
  showModal: {
    type: Boolean,
    default: false,
  },
  operation: {
    type: String,
    default: "sensitive operation",
  },
});

const emit = defineEmits(["authenticated", "cancelled"]);

const supabase = useSupabaseClient();
const password = ref("");
const hidePassword = ref(true);
const errorMessage = ref("");
const isLoading = ref(false);
const passwordInput = ref(null);

// Auto-focus password input when modal opens
watch(
  () => props.showModal,
  async (newVal) => {
    if (newVal) {
      password.value = "";
      errorMessage.value = "";
      hidePassword.value = true;
      isLoading.value = false;

      await nextTick();
      if (passwordInput.value) {
        passwordInput.value.focus();
      }
    }
  },
);

async function authenticate() {
  if (!password.value.trim()) {
    errorMessage.value = "Please enter your password";
    return;
  }

  isLoading.value = true;
  errorMessage.value = "";

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user || !user.email) {
      errorMessage.value = "Authentication error. Please log in again.";
      isLoading.value = false;
      return;
    }

    // Attempt to sign in with current credentials to verify password
    const { error } = await supabase.auth.signInWithPassword({
      email: user.email,
      password: password.value,
    });

    if (error) {
      // Log failed re-authentication attempt
      await logSecurityEvent({
        eventType: "RE_AUTHENTICATION_FAILED",
        userId: user.id,
        userEmail: user.email,
        details: {
          operation: props.operation,
          error: error.message,
        },
        severity: "HIGH",
      });

      errorMessage.value = "Incorrect password. Please try again.";
      password.value = "";
      isLoading.value = false;
      return;
    }

    // Log successful re-authentication
    await logSecurityEvent({
      eventType: "RE_AUTHENTICATION_SUCCESS",
      userId: user.id,
      userEmail: user.email,
      details: { operation: props.operation },
      severity: "LOW",
    });

    isLoading.value = false;
    emit("authenticated", { userId: user.id, email: user.email });
  } catch (error) {
    console.error("Re-authentication error:", error);

    // Log re-authentication error
    const {
      data: { user },
    } = await supabase.auth.getUser();
    await logSecurityEvent({
      eventType: "RE_AUTHENTICATION_ERROR",
      userId: user?.id,
      userEmail: user?.email,
      details: {
        operation: props.operation,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      severity: "HIGH",
    });

    errorMessage.value = "Authentication failed. Please try again.";
    isLoading.value = false;
  }
}

async function cancel() {
  // Log re-authentication cancellation
  const {
    data: { user },
  } = await supabase.auth.getUser();
  await logSecurityEvent({
    eventType: "RE_AUTHENTICATION_CANCELLED",
    userId: user?.id,
    userEmail: user?.email,
    details: { operation: props.operation },
    severity: "LOW",
  });

  emit("cancelled");
}
</script>
