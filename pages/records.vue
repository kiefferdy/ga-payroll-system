<script setup lang="ts">
import { computed } from "vue";
import type { Employee, WeekOption } from "~/types/payroll";

// Initialize payroll composable
const {
  state,
  weekTotal,
  finalBalance,
  generateWeeks,
  fetchEmployees,
  loadWeekData,
  updateDayData,
  updatePayrollData,
  savePayrollData,
  applyDefaultRates,
  setSelectedEmployee,
  setSelectedWeek,
} = usePayroll();

// Local reactive state
const employees = ref<Employee[]>([]);
const weekOptions = ref<WeekOption[]>([]);
const hasUnsavedChanges = ref(false);

// Computed properties
const currentWeekLabel = computed(() => {
  return state.selectedWeek?.label || "No week selected";
});

const isDataSaved = computed(() => {
  return !hasUnsavedChanges.value;
});

// Event handlers
const handleEmployeeSelected = async (employee: Employee) => {
  console.log("Employee selected:", employee.first_name, employee.last_name);
  
  // Always update the selected employee using setter function
  setSelectedEmployee(employee);
  
  // If a week is already selected, load the data
  if (state.selectedWeek) {
    console.log("Loading data for employee and week");
    await loadWeekData(employee, state.selectedWeek);
  } else {
    console.log("No week selected yet");
  }
  hasUnsavedChanges.value = false;
};

const handleWeekSelected = async (week: WeekOption) => {
  console.log("Week selected:", week.label);
  
  // Always update the selected week using setter function
  setSelectedWeek(week);
  
  // If an employee is already selected, load the data
  if (state.selectedEmployee) {
    console.log("Loading data for employee and week");
    await loadWeekData(state.selectedEmployee, week);
  } else {
    console.log("No employee selected yet");
  }
  hasUnsavedChanges.value = false;
};

const handleUpdateDay = (dayKey: any, field: any, value: any) => {
  updateDayData(dayKey, { [field]: value });
  hasUnsavedChanges.value = true;
};

const handleUpdatePayroll = (field: any, value: any) => {
  updatePayrollData({ [field]: value });
  hasUnsavedChanges.value = true;
};

const handleApplyRates = (
  hourlyRate: number,
  minuteRate: number,
  _options: any,
) => {
  applyDefaultRates(hourlyRate, minuteRate);
  hasUnsavedChanges.value = true;
};

const handleSaveRequested = async () => {
  const success = await savePayrollData();
  if (success) {
    hasUnsavedChanges.value = false;
  }
};

const handleClearAdjustments = () => {
  if (state.payrollData) {
    updatePayrollData({
      bale: 0,
      advance: 0,
      deduction: 0,
    });
    hasUnsavedChanges.value = true;
  }
};

const handleCarryForwardBalance = () => {
  // TODO: Implement carry forward logic
  console.log("Carry forward balance requested");
};

const handleExportSummary = () => {
  // TODO: Implement export logic
  console.log("Export summary requested");
};

// Initialize data
onMounted(async () => {
  try {
    employees.value = await fetchEmployees();
    weekOptions.value = generateWeeks();
    console.log("Loaded employees:", employees.value.length);
    console.log("Generated weeks:", weekOptions.value.length);
  } catch (error) {
    console.error("Error initializing records page:", error);
  }
});
</script>

<template>
  <Title>Admin - Records</Title>

  <!-- Header Component -->
  <RecordsHeader
    :show-stats="true"
    :current-week-label="currentWeekLabel"
    :week-total="weekTotal"
    :final-balance="finalBalance"
    :is-data-saved="isDataSaved"
  />

  <!-- Main Content Container -->
  <div class="mx-auto max-w-7xl p-6">
    <!-- Employee and Week Selection -->
    <EmployeeWeekSelector
      :employees="employees"
      :week-options="weekOptions"
      :selected-employee="state.selectedEmployee"
      :selected-week="state.selectedWeek"
      :is-loading="state.isLoading"
      :has-unsaved-changes="hasUnsavedChanges"
      :error="state.error"
      @employee-selected="handleEmployeeSelected"
      @week-selected="handleWeekSelected"
      @save-requested="handleSaveRequested"
    />

    <!-- Timesheet Table -->
    <TimesheetTable :week-data="state.weekData" @update-day="handleUpdateDay" />

    <!-- Payroll Configuration and Summary -->
    <div class="grid grid-cols-1 gap-8 xl:grid-cols-2">
      <!-- Pay Configuration -->
      <PayrollCalculator
        :payroll-data="state.payrollData"
        @update-payroll="handleUpdatePayroll"
        @apply-rates="handleApplyRates"
      />

      <!-- Payroll Summary -->
      <PayrollSummary
        :payroll-data="state.payrollData"
        :week-total="weekTotal"
        :selected-week="currentWeekLabel"
        @update-payroll="handleUpdatePayroll"
        @clear-adjustments="handleClearAdjustments"
        @carry-forward-balance="handleCarryForwardBalance"
        @export-summary="handleExportSummary"
      />
    </div>
  </div>
</template>
