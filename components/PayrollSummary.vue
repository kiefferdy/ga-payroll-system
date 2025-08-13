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
            d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"
          />
        </svg>
      </div>
      <div>
        <h2 class="text-xl font-semibold text-dark_gray">Payroll Summary</h2>
        <p class="text-sm text-dark_gray/70">Weekly totals and adjustments</p>
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
          d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"
        />
      </svg>
      <p class="text-dark_gray/70">
        Select an employee and week to view payroll summary
      </p>
    </div>

    <div v-else class="space-y-6">
      <!-- Week Total Display -->
      <div
        class="flex items-center justify-between rounded-lg border border-primary_green/20 bg-primary_green/10 p-4"
      >
        <div>
          <span class="text-lg font-semibold text-dark_gray"
            >Weekly Gross Total</span
          >
          <div class="text-sm text-dark_gray/70">
            Base earnings from timesheet
          </div>
        </div>
        <span class="text-2xl font-bold text-dark_green"
          >₱{{ formatCurrency(weekTotal) }}</span
        >
      </div>

      <!-- Adjustments Section -->
      <div class="space-y-4">
        <h3
          class="border-b border-search_stroke_gray pb-2 text-lg font-medium text-dark_gray"
        >
          Adjustments
        </h3>

        <div class="grid grid-cols-1 gap-4 md:grid-cols-3">
          <!-- Bale (Previous Balance) -->
          <div class="space-y-2">
            <label for="bale" class="block text-sm font-medium text-dark_gray">
              Bale
              <span class="ml-1 text-xs text-dark_gray/60">- Subtract</span>
            </label>
            <div class="relative">
              <span
                class="absolute left-3 top-1/2 -translate-y-1/2 transform text-dark_gray/70"
                >₱</span
              >
              <input
                id="bale"
                :value="localPayrollData?.bale || 0"
                @input="updatePayrollField('bale', $event)"
                type="number"
                min="0"
                step="0.01"
                class="input input-bordered w-full border-search_stroke_gray bg-off_white pl-8 focus:border-dark_green"
                placeholder="0.00"
              />
            </div>
            <div class="text-xs text-dark_gray/60">
              Previous unpaid balance to deduct
            </div>
          </div>

          <!-- Advance/Bonus -->
          <div class="space-y-2">
            <label
              for="advance"
              class="block text-sm font-medium text-dark_gray"
            >
              Bonus/Advance
              <span class="ml-1 text-xs text-primary_green/80">+ Add</span>
            </label>
            <div class="relative">
              <span
                class="absolute left-3 top-1/2 -translate-y-1/2 transform text-dark_gray/70"
                >₱</span
              >
              <input
                id="advance"
                :value="localPayrollData?.advance || 0"
                @input="updatePayrollField('advance', $event)"
                type="number"
                min="0"
                step="0.01"
                class="input input-bordered w-full border-search_stroke_gray bg-off_white pl-8 focus:border-dark_green"
                placeholder="0.00"
              />
            </div>
            <div class="text-xs text-dark_gray/60">
              Additional pay, bonuses, or advances
            </div>
          </div>

          <!-- Deductions -->
          <div class="space-y-2">
            <label
              for="deduction"
              class="block text-sm font-medium text-dark_gray"
            >
              Deductions
              <span class="ml-1 text-xs text-clock_out_red/80">- Subtract</span>
            </label>
            <div class="relative">
              <span
                class="absolute left-3 top-1/2 -translate-y-1/2 transform text-dark_gray/70"
                >₱</span
              >
              <input
                id="deduction"
                :value="localPayrollData?.deduction || 0"
                @input="updatePayrollField('deduction', $event)"
                type="number"
                min="0"
                step="0.01"
                class="input input-bordered w-full border-search_stroke_gray bg-off_white pl-8 focus:border-dark_green"
                placeholder="0.00"
              />
            </div>
            <div class="text-xs text-dark_gray/60">
              Taxes, insurance, or other deductions
            </div>
          </div>
        </div>
      </div>

      <!-- Calculation Breakdown -->
      <div class="space-y-3 rounded-lg bg-off_white p-4">
        <h4 class="mb-3 font-medium text-dark_gray">Calculation Breakdown</h4>

        <div class="space-y-2 text-sm">
          <div class="flex items-center justify-between">
            <span class="text-dark_gray">Weekly Gross Total:</span>
            <span class="font-medium">₱{{ formatCurrency(weekTotal) }}</span>
          </div>

          <div
            v-if="(localPayrollData?.bale || 0) > 0"
            class="flex items-center justify-between text-clock_out_red"
          >
            <span>Less: Previous Balance:</span>
            <span class="font-medium"
              >-₱{{ formatCurrency(localPayrollData?.bale || 0) }}</span
            >
          </div>

          <div
            v-if="(localPayrollData?.advance || 0) > 0"
            class="flex items-center justify-between text-primary_green"
          >
            <span>Add: Bonus/Advance:</span>
            <span class="font-medium"
              >+₱{{ formatCurrency(localPayrollData?.advance || 0) }}</span
            >
          </div>

          <div
            v-if="(localPayrollData?.deduction || 0) > 0"
            class="flex items-center justify-between text-clock_out_red"
          >
            <span>Less: Deductions:</span>
            <span class="font-medium"
              >-₱{{ formatCurrency(localPayrollData?.deduction || 0) }}</span
            >
          </div>

          <div class="mt-3 border-t border-search_stroke_gray pt-2">
            <div
              class="flex items-center justify-between text-lg font-semibold"
            >
              <span class="text-dark_gray">Net Pay:</span>
              <span
                :class="[
                  finalBalance >= 0 ? 'text-dark_green' : 'text-clock_out_red',
                ]"
              >
                {{ finalBalance >= 0 ? "+" : "" }}₱{{
                  formatCurrency(Math.abs(finalBalance))
                }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Final Total Display -->
      <div
        class="rounded-lg border-2 p-6"
        :class="[
          finalBalance >= 0
            ? 'border-dark_green bg-dark_green/5'
            : 'border-clock_out_red bg-clock_out_red/5',
        ]"
      >
        <div class="flex items-center justify-between">
          <div>
            <h3 class="text-2xl font-bold text-dark_gray">Final Balance</h3>
            <p
              class="text-sm"
              :class="[
                finalBalance >= 0 ? 'text-dark_green' : 'text-clock_out_red',
              ]"
            >
              {{
                finalBalance >= 0 ? "Amount to Pay" : "Amount Owed by Employee"
              }}
            </p>
          </div>
          <div class="text-right">
            <div
              class="text-4xl font-bold"
              :class="[
                finalBalance >= 0 ? 'text-dark_green' : 'text-clock_out_red',
              ]"
            >
              {{ finalBalance >= 0 ? "+" : "" }}₱{{
                formatCurrency(Math.abs(finalBalance))
              }}
            </div>
            <div class="mt-1 text-sm text-dark_gray/70">
              {{ selectedWeek || "Current Period" }}
            </div>
          </div>
        </div>
      </div>

      <!-- Quick Action Buttons -->
      <div class="flex flex-wrap gap-3 border-t border-search_stroke_gray pt-4">
        <button
          @click="clearAdjustments"
          class="hover:bg-gray-50 btn btn-outline btn-sm border-search_stroke_gray"
        >
          <svg
            class="mr-2 h-4 w-4"
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
          Clear Adjustments
        </button>

        <button
          v-if="finalBalance < 0"
          @click="carryForwardBalance"
          class="border-orange-300 text-orange-600 hover:bg-orange-50 btn btn-outline btn-sm"
        >
          <svg
            class="mr-2 h-4 w-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
            />
          </svg>
          Carry Forward Balance
        </button>

        <button
          @click="exportSummary"
          class="btn btn-outline btn-sm border-primary_green text-primary_green hover:bg-primary_green/10"
        >
          <svg
            class="mr-2 h-4 w-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          Export Summary
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from "vue";
import type { PayrollData } from "~/types/payroll";

const props = defineProps<{
  payrollData: PayrollData | null;
  weekTotal: number;
  selectedWeek?: string;
}>();

const emit = defineEmits<{
  "update-payroll": [field: keyof PayrollData, value: any];
  "clear-adjustments": [];
  "carry-forward-balance": [];
  "export-summary": [];
}>();

// Local reactive state
const localPayrollData = ref<PayrollData | null>(null);

// Computed properties
const finalBalance = computed(() => {
  if (!localPayrollData.value) return 0;
  return (
    props.weekTotal -
    localPayrollData.value.bale +
    localPayrollData.value.advance -
    localPayrollData.value.deduction
  );
});

// Utility functions
const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat("en-PH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

// Event handlers
const updatePayrollField = (field: keyof PayrollData, event: Event) => {
  if (!localPayrollData.value) return;

  const target = event.target as HTMLInputElement;
  let value: string | number = target.value;

  // Convert numeric fields to numbers
  if (["bale", "advance", "deduction"].includes(field)) {
    value = parseFloat(value) || 0;
  }

  // Type-safe assignment
  (localPayrollData.value as any)[field] = value;
  emit("update-payroll", field, value);
};

const clearAdjustments = () => {
  if (!localPayrollData.value) return;

  localPayrollData.value.bale = 0;
  localPayrollData.value.advance = 0;
  localPayrollData.value.deduction = 0;

  emit("clear-adjustments");
};

const carryForwardBalance = () => {
  emit("carry-forward-balance");
};

const exportSummary = () => {
  emit("export-summary");
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

// Update local state when finalBalance changes
watch(
  finalBalance,
  (newBalance) => {
    if (localPayrollData.value) {
      localPayrollData.value.totalBalance = newBalance;
      emit("update-payroll", "totalBalance", newBalance);
    }
  },
  { immediate: true },
);
</script>
