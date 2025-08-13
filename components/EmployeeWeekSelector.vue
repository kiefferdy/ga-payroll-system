<template>
  <div
    class="mb-8 rounded-xl border border-search_stroke_gray bg-white p-6 shadow-sm"
  >
    <div
      class="flex flex-col items-start justify-between gap-6 lg:flex-row lg:items-center"
    >
      <!-- Employee Selection Section -->
      <div class="flex-1 space-y-4">
        <div
          class="flex flex-col items-start gap-4 sm:flex-row sm:items-center"
        >
          <!-- Employee Dropdown -->
          <div class="flex min-w-0 flex-1 items-center space-x-3">
            <label class="whitespace-nowrap text-sm font-medium text-dark_gray"
              >Employee:</label
            >
            <div class="relative flex-1">
              <button
                @click="toggleEmployeeDropdown"
                class="btn btn-outline btn-sm w-full justify-start text-left"
                :class="{ 'btn-active': isEmployeeDropdownOpen }"
              >
                <div class="flex min-w-0 flex-1 items-center space-x-2">
                  <div
                    v-if="selectedEmployee"
                    class="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary_green to-dark_green"
                  >
                    <img src="~/assets/icons/user.png" class="h-3 w-3" />
                  </div>
                  <span class="truncate">
                    {{
                      selectedEmployee
                        ? `${selectedEmployee.first_name} ${selectedEmployee.last_name}`
                        : "Select Employee"
                    }}
                  </span>
                </div>
                <svg
                  class="ml-2 h-4 w-4 flex-shrink-0 transition-transform"
                  :class="{ 'rotate-180': isEmployeeDropdownOpen }"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>

              <!-- Employee Dropdown Menu -->
              <div
                v-if="isEmployeeDropdownOpen"
                class="absolute left-0 right-0 top-full z-50 mt-1 max-h-60 overflow-auto rounded-lg border border-search_stroke_gray bg-white shadow-lg"
              >
                <!-- Search Input -->
                <div class="border-b border-search_stroke_gray p-3">
                  <input
                    v-model="employeeSearchQuery"
                    type="text"
                    placeholder="Search employees..."
                    class="input input-bordered input-sm w-full border-search_stroke_gray bg-primary_white focus:border-dark_green"
                    @click.stop
                  />
                </div>

                <!-- Employee List -->
                <div class="max-h-48 overflow-y-auto">
                  <div
                    v-if="filteredEmployees.length === 0"
                    class="p-3 text-center text-sm text-dark_gray/70"
                  >
                    No employees found
                  </div>
                  <button
                    v-for="employee in filteredEmployees"
                    :key="employee.id"
                    @click="selectEmployee(employee)"
                    class="flex w-full items-center space-x-3 p-3 text-left transition-colors hover:bg-off_white"
                  >
                    <div
                      class="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary_green to-dark_green"
                    >
                      <img src="~/assets/icons/user.png" class="h-4 w-4" />
                    </div>
                    <div class="min-w-0 flex-1">
                      <div class="truncate font-medium text-dark_gray">
                        {{ employee.first_name }} {{ employee.last_name }}
                      </div>
                      <div
                        class="truncate text-sm capitalize text-dark_gray/60"
                      >
                        {{ employee.primary_role || "Employee" }}
                      </div>
                    </div>
                    <div
                      :class="[
                        employee.time_in_status
                          ? 'bg-clock_in_green'
                          : 'bg-clock_out_red',
                      ]"
                      class="h-2 w-2 flex-shrink-0 rounded-full"
                    ></div>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Week Dropdown -->
          <div class="flex min-w-0 flex-1 items-center space-x-3">
            <label class="whitespace-nowrap text-sm font-medium text-dark_gray"
              >Week:</label
            >
            <div class="relative flex-1">
              <button
                @click="toggleWeekDropdown"
                class="btn btn-outline btn-sm w-full justify-start text-left"
                :class="{ 
                  'btn-active': isWeekDropdownOpen,
                  'opacity-50 cursor-not-allowed': !selectedEmployee
                }"
                :disabled="!selectedEmployee"
                :title="!selectedEmployee ? 'Please select an employee first' : ''"
              >
                <span class="flex-1 truncate">
                  {{ selectedWeek?.label || "Select Week" }}
                </span>
                <svg
                  class="ml-2 h-4 w-4 flex-shrink-0 transition-transform"
                  :class="{ 'rotate-180': isWeekDropdownOpen }"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>

              <!-- Week Dropdown Menu -->
              <div
                v-if="isWeekDropdownOpen"
                class="absolute left-0 right-0 top-full z-40 mt-1 max-h-60 overflow-auto rounded-lg border border-search_stroke_gray bg-white shadow-lg"
              >
                <button
                  v-for="week in weekOptions"
                  :key="week.label"
                  @click="selectWeek(week)"
                  class="w-full p-3 text-left text-sm transition-colors hover:bg-off_white"
                  :class="{
                    'bg-primary_green/10 font-medium text-dark_green':
                      selectedWeek?.label === week.label,
                  }"
                >
                  {{ week.label }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="flex items-center space-x-4">
        <div
          v-if="isLoading"
          class="flex items-center space-x-2 text-dark_gray/70"
        >
          <div class="loading loading-spinner loading-sm"></div>
          <span class="text-sm">Loading...</span>
        </div>

        <button
          v-if="selectedEmployee && selectedWeek && !isLoading"
          @click="handleSave"
          :disabled="!hasUnsavedChanges"
          class="btn border-none bg-dark_green text-white hover:bg-button_green"
          :class="{ 'btn-disabled': !hasUnsavedChanges }"
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
              d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"
            />
          </svg>
          Save Changes
        </button>
      </div>
    </div>

    <!-- Error Message -->
    <div v-if="error" class="alert alert-error mt-4">
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
          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.732 16.5c-.77.833.192 2.5 1.732 2.5z"
        />
      </svg>
      <span>{{ error }}</span>
    </div>

    <!-- Success Message -->
    <div v-if="successMessage" class="alert alert-success mt-4">
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
          d="M5 13l4 4L19 7"
        />
      </svg>
      <span>{{ successMessage }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from "vue";
import type { Employee, WeekOption } from "~/types/payroll";

const props = defineProps<{
  employees: Employee[];
  weekOptions: WeekOption[];
  selectedEmployee: Employee | null;
  selectedWeek: WeekOption | null;
  isLoading: boolean;
  hasUnsavedChanges: boolean;
  error: string | null;
}>();

const emit = defineEmits<{
  "employee-selected": [employee: Employee];
  "week-selected": [week: WeekOption];
  "save-requested": [];
}>();

// Reactive state
const isEmployeeDropdownOpen = ref(false);
const isWeekDropdownOpen = ref(false);
const employeeSearchQuery = ref("");
const successMessage = ref("");

// Computed properties
const filteredEmployees = computed(() => {
  if (!employeeSearchQuery.value) return props.employees;

  const query = employeeSearchQuery.value.toLowerCase();
  return props.employees.filter((employee) => {
    const fullName =
      `${employee.first_name} ${employee.last_name}`.toLowerCase();
    const role = (employee.primary_role || "").toLowerCase();
    return fullName.includes(query) || role.includes(query);
  });
});

// Event handlers
const toggleEmployeeDropdown = () => {
  isEmployeeDropdownOpen.value = !isEmployeeDropdownOpen.value;
  isWeekDropdownOpen.value = false;
  employeeSearchQuery.value = "";
};

const toggleWeekDropdown = () => {
  if (!props.selectedEmployee) return;
  isWeekDropdownOpen.value = !isWeekDropdownOpen.value;
  isEmployeeDropdownOpen.value = false;
};

const selectEmployee = (employee: Employee) => {
  emit("employee-selected", employee);
  isEmployeeDropdownOpen.value = false;
  employeeSearchQuery.value = "";
};

const selectWeek = (week: WeekOption) => {
  emit("week-selected", week);
  isWeekDropdownOpen.value = false;
};

const handleSave = async () => {
  emit("save-requested");

  // Show success message temporarily
  successMessage.value = "Payroll data saved successfully!";
  setTimeout(() => {
    successMessage.value = "";
  }, 3000);
};

// Close dropdowns when clicking outside
const handleClickOutside = (event: MouseEvent) => {
  const target = event.target as HTMLElement;
  const dropdownContainer = target.closest(".relative");

  if (!dropdownContainer) {
    isEmployeeDropdownOpen.value = false;
    isWeekDropdownOpen.value = false;
  }
};

// Watch for employee changes to reset week selection
watch(
  () => props.selectedEmployee,
  () => {
    // Week selection is preserved when changing employees
    // This allows comparing different employees for the same week
  },
  { immediate: true },
);

// Clear search when dropdown closes
watch(isEmployeeDropdownOpen, (isOpen) => {
  if (!isOpen) {
    employeeSearchQuery.value = "";
  }
});

// Lifecycle hooks
onMounted(() => {
  document.addEventListener("click", handleClickOutside);
});

onUnmounted(() => {
  document.removeEventListener("click", handleClickOutside);
});
</script>
