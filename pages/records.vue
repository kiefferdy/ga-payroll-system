<script setup lang="ts">
import { computed } from "vue";
import type { Employee, WeekOption } from "~/types/payroll";
import { exportPayrollSummary } from "~/utils/payrollExport";

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

// Permission management
const { hasPermission } = usePermissions();
const canUpdateTimesheet = ref(false);

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
  if (!canUpdateTimesheet.value) {
    console.warn('User does not have permission to update timesheet');
    return;
  }
  updateDayData(dayKey, { [field]: value });
  hasUnsavedChanges.value = true;
};

const handleUpdatePayroll = (field: any, value: any) => {
  if (!canUpdateTimesheet.value) {
    console.warn('User does not have permission to update payroll');
    return;
  }
  updatePayrollData({ [field]: value });
  hasUnsavedChanges.value = true;
};

const handleApplyRates = (
  hourlyRate: number,
  minuteRate: number,
  _options: any,
) => {
  if (!canUpdateTimesheet.value) {
    console.warn('User does not have permission to apply rates');
    return;
  }
  applyDefaultRates(hourlyRate, minuteRate);
  hasUnsavedChanges.value = true;
};

const handleSaveRequested = async () => {
  if (!canUpdateTimesheet.value) {
    console.warn('User does not have permission to save payroll data');
    return;
  }
  const success = await savePayrollData();
  if (success) {
    hasUnsavedChanges.value = false;
  }
};

const handleClearAdjustments = () => {
  if (!canUpdateTimesheet.value) {
    console.warn('User does not have permission to clear adjustments');
    return;
  }
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
  // Validate that we have all required data
  if (!state.selectedEmployee || !state.selectedWeek || !state.weekData || !state.payrollData) {
    console.error("Missing required data for export");
    return;
  }

  const exportData = {
    employee: state.selectedEmployee,
    weekData: state.weekData,
    payrollData: state.payrollData,
    weekTotal: weekTotal.value,
    finalBalance: finalBalance.value,
    selectedWeek: currentWeekLabel.value,
  };

  // Export as PDF by default (user can be given format options in the future)
  exportPayrollSummary(exportData, 'pdf');
};

// Check timesheet permissions
const checkTimesheetPermissions = async () => {
  canUpdateTimesheet.value = await hasPermission('timesheet.update');
};

// Initialize data
onMounted(async () => {
  try {
    await checkTimesheetPermissions();
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
      :can-update-timesheet="canUpdateTimesheet"
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
        :can-update-timesheet="canUpdateTimesheet"
        @update-payroll="handleUpdatePayroll"
        @apply-rates="handleApplyRates"
      />

      <!-- Payroll Summary -->
      <PayrollSummary
        :payroll-data="state.payrollData"
        :week-total="weekTotal"
        :selected-week="currentWeekLabel"
        :can-update-timesheet="canUpdateTimesheet"
        @update-payroll="handleUpdatePayroll"
        @clear-adjustments="handleClearAdjustments"
        @carry-forward-balance="handleCarryForwardBalance"
        @export-summary="handleExportSummary"
      />
    </div>
  </div>
</template>
