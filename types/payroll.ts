// TypeScript types for payroll system

export interface Employee {
  id: string;
  first_name: string;
  last_name: string;
  primary_role?: string;
  time_in_status: boolean;
  last_updated: string;
  failed_login_attempts?: number;
  locked_until?: string;
}

export interface TimesheetEntry {
  id?: string;
  user_id: string;
  date: string;
  time_in: string;
  time_out: string;
  duration_json: string;
  hourly_rate?: number; // Daily hourly rate
  minute_rate?: number; // Daily minute rate
  created_at?: string;
}

export interface DayData {
  date: string;
  timesheet?: TimesheetEntry;
  timesheetEntries?: TimesheetEntry[]; // All timesheet entries for the day
  timeIn: string;
  timeOut: string;
  duration: string;
  hours: number;
  minutes: number;
  hourlyRate: number;
  minuteRate: number;
  dailyTotal: number;
  hasMultipleClockPeriods?: boolean; // Indicator for UI
}

export interface WeekData {
  startDate: string;
  endDate: string;
  days: {
    monday: DayData;
    tuesday: DayData;
    wednesday: DayData;
    thursday: DayData;
    friday: DayData;
    saturday: DayData;
    adjFriday: DayData;
    adjSaturday: DayData;
  };
}

export interface PayrollData {
  id?: string;
  employeeId: string;
  week: string;
  weekTotal: number;
  bale: number;
  advance: number;
  deduction: number;
  totalBalance: number;
  payPerHour: number;
  payPerMinute: number;
  notes: string;
  created_at?: string;
  updated_at?: string;
}

export interface WeekOption {
  label: string;
  startDate: string;
  endDate: string;
}

export interface PayrollState {
  selectedEmployee: Employee | null;
  selectedWeek: WeekOption | null;
  weekData: WeekData | null;
  payrollData: PayrollData | null;
  isLoading: boolean;
  error: string | null;
}

export interface PayrollCalculation {
  dailyTotals: Record<string, number>;
  weekTotal: number;
  adjustedTotal: number;
  finalBalance: number;
}
