<template>
  <div
    class="rounded-xl border border-search_stroke_gray bg-white p-6 shadow-sm"
  >
    <div class="mb-6 flex items-center">
      <div
        class="mr-3 flex h-10 w-10 items-center justify-center rounded-full bg-dark_green"
      >
        <svg
          class="h-5 w-5 text-white"
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
      <div>
        <h2 class="text-xl font-semibold text-dark_gray">Pay Configuration</h2>
        <p class="text-sm text-dark_gray/70">
          Set default rates and apply to timesheet
        </p>
      </div>
    </div>

    <div v-if="!payrollData" class="py-8 text-center">
      <svg
        class="mx-auto mb-3 h-12 w-12 text-dark_gray/30"
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
      <p class="text-dark_gray/70">
        Select an employee and week to configure pay rates
      </p>
    </div>

    <div v-else class="space-y-6">
      <!-- Pay Rate Settings -->
      <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <label
            for="hourly-rate"
            class="mb-2 block text-sm font-medium text-dark_gray"
          >
            Pay per Hour
            <span class="ml-1 text-xs text-dark_gray/60">(₱)</span>
          </label>
          <div class="relative">
            <span
              class="absolute left-3 top-1/2 -translate-y-1/2 transform text-dark_gray/70"
              >₱</span
            >
            <input
              id="hourly-rate"
              :value="localPayrollData?.payPerHour || 0"
              @input="updatePayrollField('payPerHour', $event)"
              type="number"
              min="0"
              step="0.01"
              class="input input-bordered w-full border-search_stroke_gray bg-off_white pl-8 focus:border-dark_green"
              placeholder="0.00"
            />
          </div>
        </div>

        <div>
          <label
            for="minute-rate"
            class="mb-2 block text-sm font-medium text-dark_gray"
          >
            Pay per Minute
            <span class="ml-1 text-xs text-dark_gray/60">(₱)</span>
          </label>
          <div class="relative">
            <span
              class="absolute left-3 top-1/2 -translate-y-1/2 transform text-dark_gray/70"
              >₱</span
            >
            <input
              id="minute-rate"
              :value="localPayrollData?.payPerMinute || 0"
              @input="updatePayrollField('payPerMinute', $event)"
              type="number"
              min="0"
              step="0.01"
              class="input input-bordered w-full border-search_stroke_gray bg-off_white pl-8 focus:border-dark_green"
              placeholder="0.00"
            />
          </div>
        </div>
      </div>

      <!-- Quick Rate Presets -->
      <div class="space-y-3">
        <h3 class="text-sm font-medium text-dark_gray">Quick Rate Presets</h3>
        <div class="grid grid-cols-2 gap-2 md:grid-cols-4">
          <button
            v-for="preset in ratePresets"
            :key="preset.label"
            @click="applyPreset(preset)"
            class="btn btn-outline btn-sm transition-colors hover:border-primary_green hover:bg-primary_green hover:text-dark_green"
          >
            <div class="text-center">
              <div class="font-medium">{{ preset.label }}</div>
              <div class="text-xs opacity-70">₱{{ preset.hourly }}/hr</div>
            </div>
          </button>
        </div>
      </div>

      <!-- Apply to Timesheet Section -->
      <div class="border-t border-search_stroke_gray pt-6">
        <div class="mb-4 flex items-center justify-between">
          <div>
            <h3 class="text-sm font-medium text-dark_gray">
              Apply Rates to Timesheet
            </h3>
            <p class="text-xs text-dark_gray/60">
              Update all empty rate fields with the values above
            </p>
          </div>
          <button
            @click="applyRatesToTimesheet"
            :disabled="!canApplyRates"
            class="btn btn-sm border-none bg-dark_green text-white hover:bg-button_green"
            :class="{ 'btn-disabled': !canApplyRates }"
          >
            <svg
              class="mr-1 h-4 w-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            Apply Rates
          </button>
        </div>

        <!-- Rate Application Options -->
        <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div
            class="flex items-center justify-between rounded-lg bg-off_white p-3"
          >
            <div>
              <div class="text-sm font-medium text-dark_gray">
                Override Existing Rates
              </div>
              <div class="text-xs text-dark_gray/60">
                Replace all rates, even if already set
              </div>
            </div>
            <input
              v-model="overrideExistingRates"
              type="checkbox"
              class="checkbox checkbox-sm border-search_stroke_gray"
            />
          </div>

          <div
            class="flex items-center justify-between rounded-lg bg-off_white p-3"
          >
            <div>
              <div class="text-sm font-medium text-dark_gray">
                Include Adjustments
              </div>
              <div class="text-xs text-dark_gray/60">
                Apply rates to adjustment days too
              </div>
            </div>
            <input
              v-model="includeAdjustments"
              type="checkbox"
              class="checkbox checkbox-sm border-search_stroke_gray"
            />
          </div>
        </div>
      </div>

      <!-- Rate Calculation Preview -->
      <div
        v-if="showPreview"
        class="rounded-lg border border-primary_green bg-primary_green/5 p-4"
      >
        <h3 class="mb-3 flex items-center text-sm font-medium text-dark_gray">
          <svg
            class="mr-2 h-4 w-4 text-primary_green"
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
          Rate Calculation Preview
        </h3>
        <div class="grid grid-cols-2 gap-3 text-sm md:grid-cols-4">
          <div>
            <span class="text-dark_gray/70">Hourly Equivalent:</span>
            <div class="font-medium">₱{{ hourlyEquivalent }}/hr</div>
          </div>
          <div>
            <span class="text-dark_gray/70">Daily (8hr):</span>
            <div class="font-medium">₱{{ dailyRate }}</div>
          </div>
          <div>
            <span class="text-dark_gray/70">Weekly (40hr):</span>
            <div class="font-medium">₱{{ weeklyRate }}</div>
          </div>
          <div>
            <span class="text-dark_gray/70">Monthly (160hr):</span>
            <div class="font-medium">₱{{ monthlyRate }}</div>
          </div>
        </div>
      </div>

      <!-- Notes Section -->
      <div>
        <label
          for="payroll-notes"
          class="mb-2 block text-sm font-medium text-dark_gray"
        >
          Additional Notes
        </label>
        <textarea
          id="payroll-notes"
          :value="localPayrollData?.notes || ''"
          @input="updatePayrollField('notes', $event)"
          class="textarea textarea-bordered w-full border-search_stroke_gray bg-off_white focus:border-dark_green"
          rows="3"
          placeholder="Add any additional notes or comments about this payroll period..."
        ></textarea>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from "vue";
import type { PayrollData } from "~/types/payroll";

const props = defineProps<{
  payrollData: PayrollData | null;
}>();

const emit = defineEmits<{
  "update-payroll": [field: keyof PayrollData, value: any];
  "apply-rates": [
    hourlyRate: number,
    minuteRate: number,
    options: { override: boolean; includeAdjustments: boolean },
  ];
}>();

// Local reactive state
const localPayrollData = ref<PayrollData | null>(null);
const overrideExistingRates = ref(false);
const includeAdjustments = ref(true);
const showPreview = ref(true);

// Rate presets for common hourly rates
const ratePresets = [
  { label: "Minimum", hourly: 537, minute: 8.95 }, // Current Philippine minimum wage (example)
  { label: "Entry Level", hourly: 600, minute: 10 },
  { label: "Experienced", hourly: 800, minute: 13.33 },
  { label: "Senior", hourly: 1000, minute: 16.67 },
];

// Computed properties
const canApplyRates = computed(() => {
  return (
    localPayrollData.value &&
    (localPayrollData.value.payPerHour > 0 ||
      localPayrollData.value.payPerMinute > 0)
  );
});

const hourlyEquivalent = computed(() => {
  if (!localPayrollData.value) return "0.00";
  const hourly =
    localPayrollData.value.payPerHour +
    localPayrollData.value.payPerMinute * 60;
  return hourly.toFixed(2);
});

const dailyRate = computed(() => {
  const hourly = parseFloat(hourlyEquivalent.value);
  return (hourly * 8).toFixed(2);
});

const weeklyRate = computed(() => {
  const hourly = parseFloat(hourlyEquivalent.value);
  return (hourly * 40).toFixed(2);
});

const monthlyRate = computed(() => {
  const hourly = parseFloat(hourlyEquivalent.value);
  return (hourly * 160).toFixed(2);
});

// Event handlers
const updatePayrollField = (field: keyof PayrollData, event: Event) => {
  if (!localPayrollData.value) return;

  const target = event.target as HTMLInputElement | HTMLTextAreaElement;
  let value: string | number = target.value;

  // Convert numeric fields to numbers
  if (["payPerHour", "payPerMinute"].includes(field)) {
    value = parseFloat(value) || 0;
  }

  // Type-safe assignment
  (localPayrollData.value as any)[field] = value;
  emit("update-payroll", field, value);
};

const applyPreset = (preset: (typeof ratePresets)[0]) => {
  if (!localPayrollData.value) return;

  localPayrollData.value.payPerHour = preset.hourly;
  localPayrollData.value.payPerMinute = preset.minute;

  emit("update-payroll", "payPerHour", preset.hourly);
  emit("update-payroll", "payPerMinute", preset.minute);
};

const applyRatesToTimesheet = () => {
  if (!localPayrollData.value) return;

  emit(
    "apply-rates",
    localPayrollData.value.payPerHour,
    localPayrollData.value.payPerMinute,
    {
      override: overrideExistingRates.value,
      includeAdjustments: includeAdjustments.value,
    },
  );
};

// Watch for props changes and sync with local state
watch(
  () => props.payrollData,
  (newData) => {
    if (newData) {
      localPayrollData.value = { ...newData };
    } else {
      localPayrollData.value = null;
    }
  },
  { immediate: true, deep: true },
);
</script>
