<template>
  <div
    class="mb-8 overflow-hidden rounded-xl border border-search_stroke_gray bg-white shadow-sm"
  >
    <div class="border-b border-search_stroke_gray bg-off_white px-6 py-4">
      <div class="flex items-center justify-between">
        <div>
          <h2 class="text-lg font-semibold text-dark_gray">Weekly Timesheet</h2>
          <p class="text-sm text-dark_gray/70">
            Track daily hours and calculate payments
          </p>
        </div>
        <div v-if="weekData" class="text-sm text-dark_gray/70">
          {{ weekData.startDate }} to {{ weekData.endDate }}
        </div>
      </div>
    </div>

    <div v-if="!weekData" class="p-12 text-center">
      <svg
        class="mx-auto mb-4 h-16 w-16 text-dark_gray/30"
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
      <p class="mb-2 text-lg text-dark_gray/70">Select an employee and week</p>
      <p class="text-sm text-dark_gray/50">
        Choose an employee and date range to view their timesheet
      </p>
    </div>

    <div v-else>
      <!-- Desktop Table View -->
      <div class="hidden overflow-x-auto lg:block">
        <table class="table table-sm w-full">
          <thead class="bg-off_white">
            <tr>
              <th class="w-24 font-semibold text-dark_gray">Day</th>
              <th class="w-28 font-semibold text-dark_gray">Clock In</th>
              <th class="w-28 font-semibold text-dark_gray">Clock Out</th>
              <th class="w-40 font-semibold text-dark_gray">Duration</th>
              <th class="w-20 font-semibold text-dark_gray">Hours</th>
              <th class="w-20 font-semibold text-dark_gray">Minutes</th>
              <th class="w-24 font-semibold text-dark_gray">Hourly Rate</th>
              <th class="w-24 font-semibold text-dark_gray">Minute Rate</th>
              <th class="w-28 font-semibold text-dark_gray">Daily Total</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="(dayKey, index) in dayKeys"
              :key="dayKey"
              class="hover:bg-off_white/50"
              :class="{
                'bg-yellow-50 hover:bg-yellow-100': dayKey.startsWith('adj'),
              }"
            >
              <th class="font-medium text-dark_gray">{{ dayNames[index] }}</th>
              <td class="text-sm">
                <div class="flex items-center space-x-1">
                  <span>{{ weekData.days[dayKey].timeIn || "-" }}</span>
                  <span v-if="weekData.days[dayKey].hasMultipleClockPeriods" class="text-xs text-blue-600" title="First clock in time">
                    (first)
                  </span>
                </div>
              </td>
              <td class="text-sm">
                <div class="flex items-center space-x-1">
                  <span>{{ weekData.days[dayKey].timeOut || "-" }}</span>
                  <span v-if="weekData.days[dayKey].hasMultipleClockPeriods" class="text-xs text-blue-600" title="Last clock out time">
                    (last)
                  </span>
                </div>
              </td>
              <td class="text-sm">
                <div class="flex items-center space-x-2">
                  <span>{{ formatDuration(weekData.days[dayKey]) }}</span>
                  <div
                    v-if="weekData.days[dayKey].hasMultipleClockPeriods"
                    class="tooltip"
                    :data-tip="getMultiplePeriodsTooltip(weekData.days[dayKey])"
                  >
                    <div class="flex h-5 w-5 items-center justify-center rounded-full bg-blue-100 text-xs font-semibold text-blue-600">
                      {{ weekData.days[dayKey].timesheetEntries?.length || 0 }}
                    </div>
                  </div>
                </div>
              </td>
              <td>
                <input
                  :value="weekData.days[dayKey].hours"
                  @input="updateField(dayKey, 'hours', $event)"
                  type="number"
                  min="0"
                  max="24"
                  step="1"
                  class="input input-xs w-16"
                  :class="
                    dayKey.startsWith('adj')
                      ? 'bg-yellow-100 border-yellow-300'
                      : 'border-search_stroke_gray bg-off_white'
                  "
                />
              </td>
              <td>
                <input
                  :value="weekData.days[dayKey].minutes"
                  @input="updateField(dayKey, 'minutes', $event)"
                  type="number"
                  min="0"
                  max="59"
                  step="1"
                  class="input input-xs w-16"
                  :class="
                    dayKey.startsWith('adj')
                      ? 'bg-yellow-100 border-yellow-300'
                      : 'border-search_stroke_gray bg-off_white'
                  "
                />
              </td>
              <td>
                <input
                  :value="weekData.days[dayKey].hourlyRate"
                  @input="updateField(dayKey, 'hourlyRate', $event)"
                  type="number"
                  min="0"
                  step="0.01"
                  class="input input-xs w-20"
                  :class="
                    dayKey.startsWith('adj')
                      ? 'bg-yellow-100 border-yellow-300'
                      : 'border-search_stroke_gray bg-off_white'
                  "
                />
              </td>
              <td>
                <input
                  :value="weekData.days[dayKey].minuteRate"
                  @input="updateField(dayKey, 'minuteRate', $event)"
                  type="number"
                  min="0"
                  step="0.01"
                  class="input input-xs w-20"
                  :class="
                    dayKey.startsWith('adj')
                      ? 'bg-yellow-100 border-yellow-300'
                      : 'border-search_stroke_gray bg-off_white'
                  "
                />
              </td>
              <td
                class="font-semibold"
                :class="
                  dayKey.startsWith('adj')
                    ? 'text-yellow-600'
                    : 'text-dark_green'
                "
              >
                ₱{{ formatCurrency(weekData.days[dayKey].dailyTotal) }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Mobile Card View -->
      <div class="space-y-4 p-4 lg:hidden">
        <div
          v-for="(dayKey, index) in dayKeys"
          :key="dayKey"
          class="rounded-lg border border-search_stroke_gray bg-white p-4"
          :class="{
            'bg-yellow-50 border-yellow-300': dayKey.startsWith('adj'),
          }"
        >
          <div class="mb-4 flex items-center justify-between">
            <h3 class="font-semibold text-dark_gray">{{ dayNames[index] }}</h3>
            <div class="text-right">
              <div
                class="text-lg font-bold"
                :class="
                  dayKey.startsWith('adj')
                    ? 'text-yellow-600'
                    : 'text-dark_green'
                "
              >
                ₱{{ formatCurrency(weekData.days[dayKey].dailyTotal) }}
              </div>
            </div>
          </div>

          <!-- Time Information -->
          <div
            v-if="!dayKey.startsWith('adj')"
            class="mb-4 grid grid-cols-3 gap-4 text-sm"
          >
            <div>
              <span class="text-dark_gray/70">Clock In:</span>
              <div class="flex items-center space-x-1 font-medium">
                <span>{{ weekData.days[dayKey].timeIn || "-" }}</span>
                <span v-if="weekData.days[dayKey].hasMultipleClockPeriods" class="text-xs text-blue-600" title="First clock in time">
                  (first)
                </span>
              </div>
            </div>
            <div>
              <span class="text-dark_gray/70">Clock Out:</span>
              <div class="flex items-center space-x-1 font-medium">
                <span>{{ weekData.days[dayKey].timeOut || "-" }}</span>
                <span v-if="weekData.days[dayKey].hasMultipleClockPeriods" class="text-xs text-blue-600" title="Last clock out time">
                  (last)
                </span>
              </div>
            </div>
            <div>
              <span class="text-dark_gray/70">Duration:</span>
              <div class="flex items-center space-x-2 font-medium">
                <span>{{ formatDuration(weekData.days[dayKey]) }}</span>
                <div
                  v-if="weekData.days[dayKey].hasMultipleClockPeriods"
                  class="tooltip"
                  :data-tip="getMultiplePeriodsTooltip(weekData.days[dayKey])"
                >
                  <div class="flex h-5 w-5 items-center justify-center rounded-full bg-blue-100 text-xs font-semibold text-blue-600">
                    {{ weekData.days[dayKey].timesheetEntries?.length || 0 }}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Input Fields -->
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="mb-1 block text-xs text-dark_gray/70">Hours</label>
              <input
                :value="weekData.days[dayKey].hours"
                @input="updateField(dayKey, 'hours', $event)"
                type="number"
                min="0"
                max="24"
                step="1"
                class="input input-sm w-full"
                :class="
                  dayKey.startsWith('adj')
                    ? 'bg-yellow-100 border-yellow-300'
                    : 'border-search_stroke_gray bg-off_white'
                "
              />
            </div>
            <div>
              <label class="mb-1 block text-xs text-dark_gray/70"
                >Minutes</label
              >
              <input
                :value="weekData.days[dayKey].minutes"
                @input="updateField(dayKey, 'minutes', $event)"
                type="number"
                min="0"
                max="59"
                step="1"
                class="input input-sm w-full"
                :class="
                  dayKey.startsWith('adj')
                    ? 'bg-yellow-100 border-yellow-300'
                    : 'border-search_stroke_gray bg-off_white'
                "
              />
            </div>
            <div>
              <label class="mb-1 block text-xs text-dark_gray/70"
                >Hourly Rate</label
              >
              <input
                :value="weekData.days[dayKey].hourlyRate"
                @input="updateField(dayKey, 'hourlyRate', $event)"
                type="number"
                min="0"
                step="0.01"
                class="input input-sm w-full"
                :class="
                  dayKey.startsWith('adj')
                    ? 'bg-yellow-100 border-yellow-300'
                    : 'border-search_stroke_gray bg-off_white'
                "
              />
            </div>
            <div>
              <label class="mb-1 block text-xs text-dark_gray/70"
                >Minute Rate</label
              >
              <input
                :value="weekData.days[dayKey].minuteRate"
                @input="updateField(dayKey, 'minuteRate', $event)"
                type="number"
                min="0"
                step="0.01"
                class="input input-sm w-full"
                :class="
                  dayKey.startsWith('adj')
                    ? 'bg-yellow-100 border-yellow-300'
                    : 'border-search_stroke_gray bg-off_white'
                "
              />
            </div>
          </div>
        </div>
      </div>

      <!-- Week Summary -->
      <div class="border-t border-search_stroke_gray bg-off_white px-6 py-4">
        <div class="flex items-center justify-between">
          <div>
            <span class="text-sm text-dark_gray/70">Total Work Days:</span>
            <span class="ml-2 font-semibold text-dark_gray">{{
              workDaysCount
            }}</span>
          </div>
          <div>
            <span class="text-sm text-dark_gray/70">Total Hours:</span>
            <span class="ml-2 font-semibold text-dark_gray">{{
              totalHours
            }}</span>
          </div>
          <div>
            <span class="text-sm text-dark_gray/70">Week Total:</span>
            <span class="ml-2 text-lg font-bold text-dark_green"
              >₱{{ formatCurrency(weekTotal) }}</span
            >
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import type { WeekData, DayData } from "~/types/payroll";

const props = defineProps<{
  weekData: WeekData | null;
}>();

const emit = defineEmits<{
  "update-day": [
    dayKey: keyof WeekData["days"],
    field: keyof DayData,
    value: any,
  ];
}>();

// Day configuration
const dayKeys = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "adjFriday",
  "adjSaturday",
] as const;
const dayNames = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Adj Friday",
  "Adj Saturday",
];

// Computed properties
const weekTotal = computed(() => {
  if (!props.weekData) return 0;
  return Object.values(props.weekData.days).reduce(
    (total, day) => total + day.dailyTotal,
    0,
  );
});

const workDaysCount = computed(() => {
  if (!props.weekData) return 0;
  return Object.values(props.weekData.days).filter(
    (day) => day.timesheet || day.hours > 0 || day.minutes > 0,
  ).length;
});

const totalHours = computed(() => {
  if (!props.weekData) return "0h 0m";
  const totalHours = Object.values(props.weekData.days).reduce(
    (total, day) => total + day.hours,
    0,
  );
  const totalMinutes = Object.values(props.weekData.days).reduce(
    (total, day) => total + day.minutes,
    0,
  );
  return `${totalHours}h ${totalMinutes}m`;
});

// Utility functions
const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat("en-PH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

const formatDuration = (day: DayData): string => {
  if (!day.timesheetEntries || day.timesheetEntries.length === 0) {
    return day.duration || "-";
  }
  
  if (day.hasMultipleClockPeriods) {
    return `${day.hours}h ${day.minutes}m (combined)`;
  }
  
  return day.duration || `${day.hours}h ${day.minutes}m`;
};

const getMultiplePeriodsTooltip = (day: DayData): string => {
  if (!day.timesheetEntries || day.timesheetEntries.length <= 1) {
    return "";
  }

  const periods = day.timesheetEntries.map((entry, index) => {
    const timeIn = new Date(entry.time_in).toLocaleTimeString("en-US", {
      timeZone: "Asia/Manila",
      hour12: true,
      hour: "numeric",
      minute: "numeric",
    });
    const timeOut = new Date(entry.time_out).toLocaleTimeString("en-US", {
      timeZone: "Asia/Manila", 
      hour12: true,
      hour: "numeric",
      minute: "numeric",
    });
    return `Period ${index + 1}: ${timeIn} - ${timeOut}`;
  }).join('\n');

  return `Multiple clock periods:\n${periods}`;
};

const updateField = (
  dayKey: keyof WeekData["days"],
  field: keyof DayData,
  event: Event,
) => {
  const target = event.target as HTMLInputElement;
  let value: any = target.value;

  // Convert numeric fields to numbers
  if (["hours", "minutes", "hourlyRate", "minuteRate"].includes(field)) {
    value = parseFloat(value) || 0;
  }

  emit("update-day", dayKey, field, value);
};
</script>
