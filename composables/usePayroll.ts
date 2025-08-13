// Payroll management composable with optimized Supabase queries

import type {
  Employee,
  TimesheetEntry,
  DayData,
  WeekData,
  PayrollData,
  WeekOption,
  PayrollState,
} from "~/types/payroll";

export const usePayroll = () => {
  const supabase = useSupabaseClient();

  // Reactive state
  const state = reactive<PayrollState>({
    selectedEmployee: null,
    selectedWeek: null,
    weekData: null,
    payrollData: null,
    isLoading: false,
    error: null,
  });

  // Computed properties
  const weekTotal = computed(() => {
    if (!state.weekData) return 0;
    const days = state.weekData.days;
    return Object.values(days).reduce(
      (total, day) => total + day.dailyTotal,
      0,
    );
  });

  const finalBalance = computed(() => {
    if (!state.payrollData) return 0;
    return (
      state.payrollData.weekTotal -
      state.payrollData.bale +
      state.payrollData.advance -
      state.payrollData.deduction
    );
  });

  // Utility functions
  const generateWeeks = (): WeekOption[] => {
    const weeks: WeekOption[] = [];
    const today = new Date();
    const currentDay = today.getDay();

    // Calculate the start date (Sunday) of the current week
    const daysToSubtract = currentDay === 0 ? 0 : currentDay;
    const startDate = new Date(
      today.getTime() - daysToSubtract * 24 * 60 * 60 * 1000,
    );

    for (let i = 0; i < 13; i++) {
      const weekStart = new Date(
        startDate.getTime() - i * 7 * 24 * 60 * 60 * 1000,
      );
      const weekEnd = new Date(weekStart.getTime() + 6 * 24 * 60 * 60 * 1000);

      weeks.push({
        label: `${formatDate(weekStart)} - ${formatDate(weekEnd)}`,
        startDate: formatDate(weekStart),
        endDate: formatDate(weekEnd),
      });
    }

    return weeks;
  };

  const formatDate = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const createDateArray = (startDate: string, endDate: string): string[] => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const dates: string[] = [];

    const current = new Date(start);
    while (current <= end) {
      dates.push(formatDate(current));
      current.setDate(current.getDate() + 1);
    }

    return dates;
  };

  const convertToPhilippinesTime = (utcString: string): string => {
    const date = new Date(utcString);
    const options: Intl.DateTimeFormatOptions = {
      timeZone: "Asia/Manila",
      hour12: true,
      hour: "numeric",
      minute: "numeric",
      second: "numeric",
    };
    return date.toLocaleTimeString("en-US", options);
  };

  // Calculate hours and minutes from time_in and time_out timestamps
  const calculateDuration = (timeIn: string, timeOut: string): { hours: number; minutes: number } => {
    if (!timeIn || !timeOut) {
      return { hours: 0, minutes: 0 };
    }

    try {
      const startTime = new Date(timeIn);
      const endTime = new Date(timeOut);
      
      // Calculate difference in milliseconds
      const diffMs = endTime.getTime() - startTime.getTime();
      
      if (diffMs <= 0) {
        return { hours: 0, minutes: 0 };
      }
      
      // Convert to total minutes
      const totalMinutes = Math.floor(diffMs / (1000 * 60));
      
      // Extract hours and remaining minutes
      const hours = Math.floor(totalMinutes / 60);
      const minutes = totalMinutes % 60;
      
      return { hours, minutes };
    } catch (error) {
      console.error("Error calculating duration:", error, timeIn, timeOut);
      return { hours: 0, minutes: 0 };
    }
  };

  // Calculate total duration from multiple timesheet entries (multiple clock ins/outs per day)
  const calculateTotalDuration = (timesheetEntries: TimesheetEntry[]): { hours: number; minutes: number } => {
    if (!timesheetEntries || timesheetEntries.length === 0) {
      return { hours: 0, minutes: 0 };
    }

    let totalHours = 0;
    let totalMinutes = 0;

    timesheetEntries.forEach((entry, index) => {
      const duration = calculateDuration(entry.time_in, entry.time_out);
      totalHours += duration.hours;
      totalMinutes += duration.minutes;
      
      console.log(`Entry ${index + 1}: ${entry.time_in} to ${entry.time_out} = ${duration.hours}h ${duration.minutes}m`);
    });

    // Handle minute overflow (convert excess minutes to hours)
    const extraHours = Math.floor(totalMinutes / 60);
    totalHours += extraHours;
    totalMinutes = totalMinutes % 60;

    console.log(`Total duration for ${timesheetEntries.length} entries: ${totalHours}h ${totalMinutes}m`);

    return { hours: totalHours, minutes: totalMinutes };
  };

  // Optimized data fetching functions
  const fetchEmployees = async (): Promise<Employee[]> => {
    try {
      const { data, error } = await supabase
        .from("Employees")
        .select("*")
        .order("first_name", { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error("Error fetching employees:", error);
      throw error;
    }
  };

  // Optimized: Fetch all timesheet data for a week in a single query
  const fetchTimesheetData = async (
    employeeId: string,
    startDate: string,
    endDate: string,
  ): Promise<TimesheetEntry[]> => {
    try {
      const { data, error } = await supabase
        .from("TimeSheet")
        .select("*")
        .eq("user_id", employeeId)
        .gte("date", startDate)
        .lte("date", endDate)
        .order("date", { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error("Error fetching timesheet data:", error);
      throw error;
    }
  };

  const fetchPayrollData = async (
    employeeId: string,
    week: string,
  ): Promise<PayrollData | null> => {
    try {
      const { data, error } = await supabase
        .from("Pay")
        .select("*")
        .eq("id", employeeId)
        .eq("week", week)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        return {
          id: (data as any).id,
          employeeId: (data as any).id,
          week: (data as any).week,
          weekTotal: (data as any).weekTotal || 0,
          bale: (data as any).bale || 0,
          advance: (data as any).advance || 0,
          deduction: (data as any).deduction || 0,
          totalBalance: (data as any).total_bal || 0,
          payPerHour: (data as any).pay_hour || 0,
          payPerMinute: (data as any).pay_minute || 0,
          notes: (data as any).notes || "",
        };
      }

      return null;
    } catch (error) {
      console.error("Error fetching payroll data:", error);
      throw error;
    }
  };

  // Main data loading function
  const loadWeekData = async (employee: Employee, weekOption: WeekOption) => {
    if (!employee || !weekOption) return;

    state.isLoading = true;
    state.error = null;

    try {
      // Create date array for the week
      const dates = createDateArray(weekOption.startDate, weekOption.endDate);

      // Fetch timesheet data for the entire week in one query
      const timesheetEntries = await fetchTimesheetData(
        employee.id,
        weekOption.startDate,
        weekOption.endDate,
      );

      // Create a map for quick lookup - support multiple entries per day
      const timesheetMap = new Map<string, TimesheetEntry[]>();
      timesheetEntries.forEach((entry) => {
        const dateEntries = timesheetMap.get(entry.date) || [];
        dateEntries.push(entry);
        timesheetMap.set(entry.date, dateEntries);
      });

      // Create day data structure
      const weekData: WeekData = {
        startDate: weekOption.startDate,
        endDate: weekOption.endDate,
        days: {
          monday: createDayData(dates[1], timesheetMap.get(dates[1])),
          tuesday: createDayData(dates[2], timesheetMap.get(dates[2])),
          wednesday: createDayData(dates[3], timesheetMap.get(dates[3])),
          thursday: createDayData(dates[4], timesheetMap.get(dates[4])),
          friday: createDayData(dates[5], timesheetMap.get(dates[5])),
          saturday: createDayData(dates[6], timesheetMap.get(dates[6])),
          adjFriday: createDayData("", undefined),
          adjSaturday: createDayData("", undefined),
        },
      };

      // Fetch payroll data
      const weekKey = `${weekOption.startDate}-${weekOption.endDate}`;
      const payrollData = await fetchPayrollData(employee.id, weekKey);

      // Update state
      state.selectedEmployee = employee;
      state.selectedWeek = weekOption;
      state.weekData = weekData;
      state.payrollData =
        payrollData || createDefaultPayrollData(employee.id, weekKey);
    } catch (error) {
      console.error("Error loading week data:", error);
      state.error = "Failed to load timesheet data";
    } finally {
      state.isLoading = false;
    }
  };

  const createDayData = (date: string, timesheetEntries?: TimesheetEntry[]): DayData => {
    // Calculate total hours and minutes from all timesheet entries for the day
    const duration = timesheetEntries && timesheetEntries.length > 0 
      ? calculateTotalDuration(timesheetEntries) 
      : { hours: 0, minutes: 0 };
    
    // For display purposes, show first entry's times (or could show summary)
    const firstEntry = timesheetEntries?.[0];
    const lastEntry = timesheetEntries?.[timesheetEntries.length - 1];
    const hasMultiple = timesheetEntries && timesheetEntries.length > 1;
    
    const dayData: DayData = {
      date,
      timesheet: firstEntry ? { ...firstEntry } : undefined, // Keep for backward compatibility
      timesheetEntries: timesheetEntries ? timesheetEntries.map(entry => ({ ...entry })) : [], // All entries for detailed view (create mutable copy)
      timeIn: firstEntry ? convertToPhilippinesTime(firstEntry.time_in) : "",
      timeOut: lastEntry ? convertToPhilippinesTime(lastEntry.time_out) : "",
      duration: firstEntry?.duration_json || "",
      hours: duration.hours,
      minutes: duration.minutes,
      hourlyRate: firstEntry?.hourly_rate || 0, // ✅ Load saved daily rate
      minuteRate: firstEntry?.minute_rate || 0, // ✅ Load saved daily rate
      dailyTotal: 0,
      hasMultipleClockPeriods: hasMultiple,
    };
    
    // Calculate daily total (will be 0 if no rates are set yet)
    dayData.dailyTotal = calculateDailyTotal(dayData);
    
    return dayData;
  };

  const createDefaultPayrollData = (
    employeeId: string,
    week: string,
  ): PayrollData => {
    return {
      employeeId,
      week,
      weekTotal: 0,
      bale: 0,
      advance: 0,
      deduction: 0,
      totalBalance: 0,
      payPerHour: 0,
      payPerMinute: 0,
      notes: "",
    };
  };

  // Calculation functions
  const calculateDailyTotal = (day: DayData): number => {
    return day.hours * day.hourlyRate + day.minutes * day.minuteRate;
  };

  const updateDayData = (
    dayKey: keyof WeekData["days"],
    updates: Partial<DayData>,
  ) => {
    if (!state.weekData) return;

    Object.assign(state.weekData.days[dayKey], updates);

    // Recalculate daily total
    const day = state.weekData.days[dayKey];
    day.dailyTotal = calculateDailyTotal(day);

    // Update week total in payroll data
    if (state.payrollData) {
      state.payrollData.weekTotal = weekTotal.value;
      state.payrollData.totalBalance = finalBalance.value;
    }
  };

  const updatePayrollData = (updates: Partial<PayrollData>) => {
    if (!state.payrollData) return;

    Object.assign(state.payrollData, updates);
    state.payrollData.totalBalance = finalBalance.value;
  };

  // Save individual daily rates to TimeSheet records
  const saveDailyRatesToTimeSheet = async () => {
    if (!state.weekData || !state.selectedEmployee) return;

    const updatePromises: Promise<any>[] = [];

    // Iterate through each day and update TimeSheet records with daily rates
    Object.values(state.weekData.days).forEach((dayData) => {
      if (dayData.timesheetEntries && dayData.timesheetEntries.length > 0) {
        // Update all timesheet entries for this day with the same daily rates
        dayData.timesheetEntries.forEach((entry) => {
          if (entry.id) {
            const updatePromise = (supabase as any)
              .from("TimeSheet")
              .update({
                hourly_rate: dayData.hourlyRate,
                minute_rate: dayData.minuteRate,
              })
              .eq("id", entry.id);
            
            updatePromises.push(updatePromise);
          }
        });
      }
    });

    // Execute all updates in parallel
    if (updatePromises.length > 0) {
      const results = await Promise.all(updatePromises);
      
      // Check for errors
      results.forEach((result, index) => {
        if (result.error) {
          console.error(`Error updating TimeSheet entry ${index}:`, result.error);
        }
      });
    }
  };

  // Save functions with optimized Supabase operations
  const savePayrollData = async (): Promise<boolean> => {
    if (!state.payrollData || !state.selectedEmployee) return false;

    state.isLoading = true;
    state.error = null;

    try {
      const payrollToSave = {
        id: state.selectedEmployee.id,
        week: state.payrollData.week,
        weekTotal: state.payrollData.weekTotal,
        bale: state.payrollData.bale,
        advance: state.payrollData.advance,
        deduction: state.payrollData.deduction,
        total_bal: state.payrollData.totalBalance,
        pay_hour: state.payrollData.payPerHour,
        pay_minute: state.payrollData.payPerMinute,
        notes: state.payrollData.notes,
      };

      if (state.payrollData.id) {
        // Update existing record
        const { error } = await (supabase as any)
          .from("Pay")
          .update(payrollToSave)
          .eq("id", state.selectedEmployee.id)
          .eq("week", state.payrollData.week);
        
        if (error) throw error;
      } else {
        // Insert new record
        const { error } = await (supabase as any).from("Pay").insert([payrollToSave]);
        
        if (error) throw error;
      }

      // Save individual daily rates to TimeSheet records
      if (state.weekData) {
        await saveDailyRatesToTimeSheet();
      }

      return true;
    } catch (error) {
      console.error("Error saving payroll data:", error);
      state.error = "Failed to save payroll data";
      return false;
    } finally {
      state.isLoading = false;
    }
  };

  // Auto-populate pay rates
  const applyDefaultRates = (hourlyRate: number, minuteRate: number) => {
    if (!state.weekData) return;

    Object.keys(state.weekData.days).forEach((dayKey) => {
      const day = state.weekData!.days[dayKey as keyof WeekData["days"]];
      if (day.hourlyRate === 0) day.hourlyRate = hourlyRate;
      if (day.minuteRate === 0) day.minuteRate = minuteRate;
      day.dailyTotal = calculateDailyTotal(day);
    });

    if (state.payrollData) {
      state.payrollData.weekTotal = weekTotal.value;
      state.payrollData.totalBalance = finalBalance.value;
    }
  };

  // Setter functions for state management
  const setSelectedEmployee = (employee: Employee | null) => {
    state.selectedEmployee = employee;
  };

  const setSelectedWeek = (week: WeekOption | null) => {
    state.selectedWeek = week;
  };

  return {
    // State
    state,

    // Computed
    weekTotal,
    finalBalance,

    // Functions
    generateWeeks,
    fetchEmployees,
    loadWeekData,
    updateDayData,
    updatePayrollData,
    savePayrollData,
    applyDefaultRates,
    setSelectedEmployee,
    setSelectedWeek,

    // Utilities
    formatDate,
    convertToPhilippinesTime,
  };
};
