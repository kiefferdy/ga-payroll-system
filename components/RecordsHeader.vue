<template>
  <div class="bg-primary_white">
    <!-- Top Navigation -->
    <AdminNavbar currentPage="records" />

    <!-- Header Section -->
    <div class="mx-auto max-w-7xl p-6">
      <div class="mb-8">
        <h1 class="mb-2 text-3xl font-bold text-dark_gray">Payroll Records</h1>
        <p class="text-dark_gray/70">
          Manage employee timesheets and payroll calculations
        </p>
      </div>

      <!-- Stats Overview -->
      <div v-if="showStats" class="mb-8 grid grid-cols-1 gap-6 md:grid-cols-4">
        <div
          class="rounded-xl border border-search_stroke_gray bg-white p-6 shadow-sm"
        >
          <div class="flex items-center justify-between">
            <div>
              <p class="mb-1 text-sm text-dark_gray/70">Current Week</p>
              <p class="text-2xl font-bold text-dark_gray">
                {{ currentWeekLabel }}
              </p>
            </div>
            <div
              class="flex h-12 w-12 items-center justify-center rounded-full bg-primary_green"
            >
              <svg
                class="h-6 w-6 text-dark_green"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v14a2 2 0 002 2z"
                />
              </svg>
            </div>
          </div>
        </div>

        <div
          class="rounded-xl border border-search_stroke_gray bg-white p-6 shadow-sm"
        >
          <div class="flex items-center justify-between">
            <div>
              <p class="mb-1 text-sm text-dark_gray/70">Week Total</p>
              <p class="text-2xl font-bold text-dark_green">
                ₱{{ formatCurrency(weekTotal) }}
              </p>
            </div>
            <div
              class="flex h-12 w-12 items-center justify-center rounded-full bg-dark_green/10"
            >
              <svg
                class="h-6 w-6 text-dark_green"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                />
              </svg>
            </div>
          </div>
        </div>

        <div
          class="rounded-xl border border-search_stroke_gray bg-white p-6 shadow-sm"
        >
          <div class="flex items-center justify-between">
            <div>
              <p class="mb-1 text-sm text-dark_gray/70">Final Balance</p>
              <p
                class="text-2xl font-bold"
                :class="
                  finalBalance >= 0 ? 'text-dark_green' : 'text-clock_out_red'
                "
              >
                ₱{{ formatCurrency(finalBalance) }}
              </p>
            </div>
            <div
              class="flex h-12 w-12 items-center justify-center rounded-full"
              :class="
                finalBalance >= 0 ? 'bg-dark_green/10' : 'bg-clock_out_red/10'
              "
            >
              <svg
                class="h-6 w-6"
                :class="
                  finalBalance >= 0 ? 'text-dark_green' : 'text-clock_out_red'
                "
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                />
              </svg>
            </div>
          </div>
        </div>

        <div
          class="rounded-xl border border-search_stroke_gray bg-white p-6 shadow-sm"
        >
          <div class="flex items-center justify-between">
            <div>
              <p class="mb-1 text-sm text-dark_gray/70">Status</p>
              <p
                class="text-sm font-medium"
                :class="isDataSaved ? 'text-dark_green' : 'text-orange-600'"
              >
                {{ isDataSaved ? "Saved" : "Unsaved Changes" }}
              </p>
            </div>
            <div
              class="flex h-12 w-12 items-center justify-center rounded-full"
              :class="isDataSaved ? 'bg-dark_green/10' : 'bg-orange-100'"
            >
              <svg
                class="h-6 w-6"
                :class="isDataSaved ? 'text-dark_green' : 'text-orange-600'"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  v-if="isDataSaved"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M5 13l4 4L19 7"
                />
                <path
                  v-else
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">

withDefaults(
  defineProps<{
    showStats?: boolean;
    currentWeekLabel?: string;
    weekTotal?: number;
    finalBalance?: number;
    isDataSaved?: boolean;
  }>(),
  {
    showStats: true,
    currentWeekLabel: "No week selected",
    weekTotal: 0,
    finalBalance: 0,
    isDataSaved: true,
  },
);

// No need for permission checks or logout - handled by AdminNavbar

// Utility function to format currency
const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat("en-PH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Math.abs(amount));
};

// Page is already protected by auth.global.ts middleware with proper permissions

// Component is used on auth-protected pages
</script>
