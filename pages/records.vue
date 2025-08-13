<script setup>
const user = useSupabaseUser();
const supabase = useSupabaseClient();
import { ref } from 'vue';
import { useRouter } from 'vue-router';
const router = useRouter();
let monday = [];
let tuesday = [];
let wednesday = [];
let thursday = [];
let friday = [];
let saturday = [];

let dates = null;

//fetch employees

let { data: Employees, error } = await supabase
   .from('Employees')
   .select('*')


const currentEmployeeName = ref(null);
const currentEmployeeId = ref(null);

const setCurrentEmployee = (employee) => {
   currentEmployeeName.value = `${employee.first_name} ${employee.last_name}`;
   currentEmployeeId.value = employee.id;
};
const selectedWeek = ref('Select Week');
const weeks = generateWeeks(); // Generate your list of weeks

function generateWeeks() {
   const generatedWeeks = [];
   const today = new Date();
   const currentDay = today.getDay(); // Get the current day of the week (0 - Sunday, 1 - Monday, ...)

   // Calculate the start date (Sunday) of the current week
   const daysToSubtractStart = currentDay !== 0 ? currentDay : 7;
   const startDate = new Date(today.getTime() - (daysToSubtractStart * 24 * 60 * 60 * 1000));

   for (let i = 0; i < 13; i++) {
      // Calculate the end date (Saturday) of each week
      const endDate = new Date(startDate.getTime() + (6 * 24 * 60 * 60 * 1000));

      const formattedStartDate = formatDate(startDate);
      const formattedEndDate = formatDate(endDate);

      generatedWeeks.push(`${formattedStartDate} - ${formattedEndDate}`);

      // Move to the previous week
      startDate.setDate(startDate.getDate() - 7);
   }

   return generatedWeeks; // Reverse the order to have the weeks in chronological order
}

function formatDate(date) {
   const year = date.getFullYear();
   const month = String(date.getMonth() + 1).padStart(2, '0');
   const day = String(date.getDate()).padStart(2, '0');
   return `${year}-${month}-${day}`;
}

function createDateArray(startDate, endDate) {
   const start = new Date(startDate);
   const end = new Date(endDate);
   const oneDay = 24 * 60 * 60 * 1000; // One day in milliseconds

   const dateArray = [start.toISOString().slice(0, 10)]; // Store start date as a string

   // Calculate days between start and end dates
   while (start <= end) {
      start.setTime(start.getTime() + oneDay);
      dateArray.push(start.toISOString().slice(0, 10));
   }

   dateArray.push(end.toISOString().slice(0, 10)); // Store end date as a string

   // Ensure the array has exactly 8 elements (0-6 for days)
   //sunday is 1
   while (dateArray.length < 9) {
      dateArray.unshift(""); // Add empty strings at the beginning if necessary
   }

   return dateArray.slice(0, 9); // Return an array of 7 elements
}

const handleWeekClick = (week) => {
   selectedWeek.value = week;
   const { startDate, endDate } = getStartAndEndDate(week);
   dates = createDateArray(startDate, endDate);
   fetchTimeSheet(startDate, endDate);
};

const getStartAndEndDate = (week) => {
   const [startDateStr, endDateStr] = week.split(' - ');
   const [startYear, startMonth, startDay] = startDateStr.split('-').map(Number);
   const [endYear, endMonth, endDay] = endDateStr.split('-').map(Number);

   const startDate = new Date(startYear, startMonth - 1, startDay);
   const endDate = new Date(endYear, endMonth - 1, endDay);

   return { startDate, endDate };
};

function convertToPhilippinesTime(utcString) {
   const date = new Date(utcString);
   const options = { timeZone: 'Asia/Manila', hour12: true, hour: 'numeric', minute: 'numeric', second: 'numeric' };

   return date.toLocaleTimeString('en-US', options);
}
let monday_timein = "";
let monday_timeout = "";
let tuesday_timein = "";
let tuesday_timeout = "";
let wednesday_timein = "";
let wednesday_timeout = "";
let thursday_timein = "";
let thursday_timeout = "";
let friday_timein = "";
let friday_timeout = "";
let saturday_timein = "";
let saturday_timeout = "";

// Monday
let monday_hrs = 0;
let monday_mins = 0;
let monday_h_pay = 0;
let monday_m_pay = 0;
let monday_total = 0;

// Tuesday
let tuesday_hrs = 0;
let tuesday_mins = 0;
let tuesday_h_pay = 0;
let tuesday_m_pay = 0;
let tuesday_total = 0;

// Wednesday
let wednesday_hrs = 0;
let wednesday_mins = 0;
let wednesday_h_pay = 0;
let wednesday_m_pay = 0;
let wednesday_total = 0;

// Thursday
let thursday_hrs = 0;
let thursday_mins = 0;
let thursday_h_pay = 0;
let thursday_m_pay = 0;
let thursday_total = 0;
// Friday
let friday_hrs = 0;
let friday_mins = 0;
let friday_h_pay = 0;
let friday_m_pay = 0;
let friday_total = 0;

// Saturday
let saturday_hrs = 0;
let saturday_mins = 0;
let saturday_h_pay = 0;
let saturday_m_pay = 0;
let saturday_total = 0;

// ajdFriday
let adjfriday_hrs = 0;
let adjfriday_mins = 0;
let adjfriday_h_pay = 0;
let adjfriday_m_pay = 0;
let adjfriday_total = 0;

// adjSaturday
let adjsaturday_hrs = 0;
let adjsaturday_mins = 0;
let adjsaturday_h_pay = 0;
let adjsaturday_m_pay = 0;
let adjsaturday_total = 0;

let weekTotal = 0;
let bale = 0;
let advance = 0;
let deduction = 0;
let total_bal = 0;

let phr = 0;
let pmn = 0;
let notes = "";
let weekPay = "";

let end_date = "";
let start_date = "";

let isLoading = true;
let hasPay = false;
async function fetchPay(starDate, endDate) {
   
   weekPay = (starDate+"-"+endDate);

   let { data: Pay, error } = await supabase
   .from('Pay')
   .select('*')
   .eq('id', currentEmployeeId.value)
   .eq('week', weekPay)

   if(Pay.length !== 0){
      hasPay = true;
      weekTotal = Pay[0].weekTotal;
      bale = Pay[0].bale;
      advance = Pay[0].advance;
      deduction = Pay[0].deduction;
      total_bal = Pay[0].total_bal;

      phr = Pay[0].pay_hour;
      pmn = Pay[0].pay_minute;
      notes = Pay[0].notes;

   } else {
      hasPay = false;
      weekTotal = 0;
      bale = 0;
      advance = 0;
      deduction = 0;
      total_bal = 0;
      phr = 0;
      pmn = 0;
      notes = "";
      
   }
}

async function fetchTimeSheet(startDate, endDate) {
   isLoading = !isLoading;
   
   start_date = formatDate(startDate);
   end_date = formatDate(endDate);

   fetchPay();

   for (let i = 2; i <= 8; i++) {

      let { data: TimeSheet, error } = await supabase
         .from('TimeSheet')
         .select('*')
         .eq('date', dates[i])
         .eq('user_id', currentEmployeeId.value);

      switch (i) {
         case 2: // Monday
            monday = TimeSheet;
            console.log(monday);
            monday_timein = "";
            monday_timeout = "";
            if (monday.length !== 0) {
               monday_timein = convertToPhilippinesTime(monday[0].time_in);
               monday_timeout = convertToPhilippinesTime(monday[0].time_out);
            }
            break;
         case 3: // Tuesday
            tuesday = TimeSheet;
            console.log(tuesday);
            tuesday_timein = "";
            tuesday_timeout = "";
            if (tuesday.length !== 0) {
               tuesday_timein = convertToPhilippinesTime(tuesday[0].time_in);
               tuesday_timeout = convertToPhilippinesTime(tuesday[0].time_out);
            }
            break;
         case 4: // Wednesday
            wednesday = TimeSheet;
            console.log(wednesday);
            wednesday_timein = "";
            wednesday_timeout = "";
            if (wednesday.length !== 0) {
               wednesday_timein = convertToPhilippinesTime(wednesday[0].time_in);
               wednesday_timeout = convertToPhilippinesTime(wednesday[0].time_out);
            }
            break;
         case 5: // Thursday
            thursday = TimeSheet;
            console.log(thursday);
            thursday_timein = "";
            thursday_timeout = "";
            if (thursday.length !== 0) {
               thursday_timein = convertToPhilippinesTime(thursday[0].time_in);
               thursday_timeout = convertToPhilippinesTime(thursday[0].time_out);
            }
            break;
         case 6: // Friday
            friday = TimeSheet;
            console.log(friday);
            friday_timein = "";
            friday_timeout = "";
            if (friday.length !== 0) {
               friday_timein = convertToPhilippinesTime(friday[0].time_in);
               friday_timeout = convertToPhilippinesTime(friday[0].time_out);
            }
            break;
         case 7: // Saturday
            saturday = TimeSheet;
            console.log(saturday);
            saturday_timein = "";
            saturday_timeout = "";
            if (saturday.length !== 0) {
               saturday_timein = convertToPhilippinesTime(saturday[0].time_in);
               saturday_timeout = convertToPhilippinesTime(saturday[0].time_out);
            }
            isLoading = !isLoading;
            console.log(isLoading);
            componentKey.value += 1;
            break;
         default:
            break;
      }

   }
};



const componentKey = ref(0);

async function Rerender () {
isLoading = true;
componentKey.value += 1;

if (monday_h_pay === 0) {
    monday_h_pay = phr;
}

if (monday_m_pay === 0) {
    monday_m_pay = pmn;
}

if (tuesday_h_pay === 0) {
    tuesday_h_pay = phr;
}

if (tuesday_m_pay === 0) {
    tuesday_m_pay = pmn;
}

if (wednesday_h_pay === 0) {
    wednesday_h_pay = phr;
}

if (wednesday_m_pay === 0) {
    wednesday_m_pay = pmn;
}

if (thursday_h_pay === 0) {
    thursday_h_pay = phr;
}

if (thursday_m_pay === 0) {
    thursday_m_pay = pmn;
}

if (friday_h_pay === 0) {
    friday_h_pay = phr;
}

if (friday_m_pay === 0) {
    friday_m_pay = pmn;
}

if (saturday_h_pay === 0) {
    saturday_h_pay = phr;
}

if (saturday_m_pay === 0) {
    saturday_m_pay = pmn;
}

// Monday
monday_total = (monday_hrs * monday_h_pay) + (monday_mins * monday_m_pay);

// Tuesday
tuesday_total = (tuesday_hrs * tuesday_h_pay) + (tuesday_mins * tuesday_m_pay);

// Wednesday
wednesday_total = (wednesday_hrs * wednesday_h_pay) + (wednesday_mins * wednesday_m_pay);

// Thursday
thursday_total = (thursday_hrs * thursday_h_pay) + (thursday_mins * thursday_m_pay);

// Friday
friday_total = (friday_hrs * friday_h_pay) + (friday_mins * friday_m_pay);

// Saturday
saturday_total = (saturday_hrs * saturday_h_pay) + (saturday_mins * saturday_m_pay);

// adjFriday
friday_total = (friday_hrs * friday_h_pay) + (friday_mins * friday_m_pay);

// adjSaturday
saturday_total = (saturday_hrs * saturday_h_pay) + (saturday_mins * saturday_m_pay);

weekTotal = monday_total + tuesday_total + wednesday_total + thursday_total + friday_total + saturday_total + adjfriday_total + adjsaturday_total;

total_bal = weekTotal - parseFloat(bale) + parseFloat(advance) - parseFloat(deduction);

if(hasPay){
   
const { data, error } = await supabase
  .from('Pay')
  .update({ weekTotal: weekTotal,
            bale: bale,
            advance: advance,
            deduction: deduction,
            total_bal: total_bal,
            pay_hour: phr,
            pay_minute: pmn,
            notes: notes
            })
  .eq('id', currentEmployeeId.value)
  .eq('week', weekPay)
  .select()
          
} else {

   
const { data, error } = await supabase
  .from('Pay')
  .insert([{   id: currentEmployeeId.value,
               week: weekPay,
               weekTotal: weekTotal,
               bale: bale,
               advance: advance,
               deduction: deduction,
               total_bal: total_bal,
               pay_hour: phr,
               pay_minute: pmn,
               notes: notes
            }])
  .select()
          
   
  hasPay = true;
}
   isLoading = false;
   componentKey.value += 1;
   console.log("rerendered");

};

// Logout function
const logout = async () => {
   const { error } = await supabase.auth.signOut();
   if (error) {
      console.error("Error logging out:", error);
   } else {
      router.push('/login');
   }
};

   // Verification check to see if user is an admin or developer before showing settings icon
   const verifyUserRank = async () => {
      const { data: { user } } = await supabase.auth.getUser();  // Get the current user

      if (user) {
         // Check if employee is an admin or developer
         const { data, error } = await supabase
            .from('Employees')
            .select('rank')
            .eq('id', user.id);

         if (error) {
            console.log("Error fetching data from Supabase:", error);
            return;
         } else if (data && data.length > 0) {
            const userRole = data[0].rank;
            if (!(userRole.toLowerCase() == 'admin' || userRole.toLowerCase() == 'developer')) {
               alert('You do not have permission to view this page!');
               router.push('/');
            }
         } else {
            console.log("No data returned from Supabase.");
         }
      } else {
         console.log("User is not logged in.");
      }
   }

   verifyUserRank();

</script>

<template>
   <Title>Admin - Records</Title>
   <div class="min-h-screen bg-primary_white">
      <!-- Top Navigation -->
      <div class="bg-dark_green text-white px-6 py-4">
         <div class="flex justify-between items-center">
            <div class="flex items-center space-x-6">
               <NuxtLink to="/" class="flex items-center space-x-2 hover:text-primary_green transition-colors">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                     <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                  <span>Back to Dashboard</span>
               </NuxtLink>
               <nav class="flex space-x-6">
                  <NuxtLink to="/employees" class="px-3 py-2 hover:bg-button_green transition-colors rounded-lg">Employees</NuxtLink>
                  <NuxtLink to="/records" class="px-3 py-2 bg-primary_white text-dark_green rounded-lg font-semibold">Records</NuxtLink>
                  <NuxtLink to="/settings" class="px-3 py-2 hover:bg-button_green transition-colors rounded-lg">Settings</NuxtLink>
               </nav>
            </div>
            <button @click="logout" class="flex items-center space-x-2 hover:bg-button_green px-3 py-2 rounded-lg transition-colors">
               <span>Logout</span>
               <img class="w-4 h-4" src="~/assets/icons/exit_white.png">
            </button>
         </div>
      </div>

      <!-- Main Content -->
      <div class="p-6 max-w-7xl mx-auto">
         <!-- Header Section -->
         <div class="mb-8">
            <h1 class="text-3xl font-bold text-dark_gray mb-2">Payroll Records</h1>
            <p class="text-dark_gray/70">Manage employee timesheets and payroll calculations</p>
         </div>

         <!-- Selection Controls -->
         <div class="bg-white rounded-xl shadow-sm border border-search_stroke_gray p-6 mb-8">
            <div class="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
               <div class="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                  <div class="flex items-center space-x-3">
                     <label class="text-sm font-medium text-dark_gray">Employee:</label>
                     <div class="dropdown dropdown-hover">
                        <label tabindex="0" class="btn btn-outline btn-sm w-64 justify-start">
                           {{ currentEmployeeName || 'Select Employee' }}
                           <svg class="w-4 h-4 ml-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                           </svg>
                        </label>
                        <ul tabindex="0" class="dropdown-content z-[1] menu p-2 shadow bg-white rounded-box w-64 max-h-60 overflow-auto">
                           <li v-for="p in Employees" :key="p.id" @click="setCurrentEmployee(p)">
                              <a>{{ p.first_name }} {{ p.last_name }}</a>
                           </li>
                        </ul>
                     </div>
                  </div>
                  <div class="flex items-center space-x-3">
                     <label class="text-sm font-medium text-dark_gray">Week:</label>
                     <div class="dropdown dropdown-hover">
                        <label tabindex="0" class="btn btn-outline btn-sm w-80 justify-start">
                           {{ selectedWeek }}
                           <svg class="w-4 h-4 ml-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                           </svg>
                        </label>
                        <ul tabindex="0" class="dropdown-content z-[1] menu p-2 shadow bg-white rounded-box w-80 max-h-60 overflow-auto">
                           <li v-for="w in weeks" :key="w" @click="handleWeekClick(w)">
                              <a>{{ w }}</a>
                           </li>
                        </ul>
                     </div>
                  </div>
               </div>
               <div class="flex items-center space-x-4">
                  <div v-if="isLoading" class="flex items-center space-x-2 text-dark_gray/70">
                     <div class="loading loading-spinner loading-sm"></div>
                     <span class="text-sm">Loading...</span>
                  </div>
                  <button @click="Rerender()" class="btn bg-dark_green hover:bg-button_green text-white border-none">
                     <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                     </svg>
                     Calculate
                  </button>
               </div>
            </div>
         </div>
         <!-- Timesheet Section -->
         <div class="bg-white rounded-xl shadow-sm border border-search_stroke_gray mb-8 overflow-hidden">
            <div class="px-6 py-4 bg-off_white border-b border-search_stroke_gray">
               <h2 class="text-lg font-semibold text-dark_gray">Weekly Timesheet</h2>
               <p class="text-sm text-dark_gray/70">Track daily hours and calculate payments</p>
            </div>
            <div class="overflow-x-auto">
               <table class="table table-sm w-full">
                  <thead class="bg-off_white">
                     <tr>
                        <th class="text-dark_gray font-semibold">Day</th>
                        <th class="text-dark_gray font-semibold">Clock In</th>
                        <th class="text-dark_gray font-semibold">Clock Out</th>
                        <th class="text-dark_gray font-semibold">Duration</th>
                        <th class="text-dark_gray font-semibold">Hours</th>
                        <th class="text-dark_gray font-semibold">Minutes</th>
                        <th class="text-dark_gray font-semibold">Hourly Rate</th>
                        <th class="text-dark_gray font-semibold">Minute Rate</th>
                        <th class="text-dark_gray font-semibold">Daily Total</th>
                     </tr>
                  </thead>
                  <tbody>
                     <tr class="hover:bg-off_white/50">
                        <th class="text-dark_gray font-medium">Monday</th>
                        <td class="text-sm">{{ monday.length !== 0 ? monday_timein : '-' }}</td>
                        <td class="text-sm">{{ monday.length !== 0 ? monday_timeout : '-' }}</td>
                        <td class="text-sm">{{ monday.length !== 0 ? monday[0].duration_json : '-' }}</td>
                        <td><input class="input input-xs w-16 bg-off_white border-search_stroke_gray" v-model="monday_hrs"></td>
                        <td><input class="input input-xs w-16 bg-off_white border-search_stroke_gray" v-model="monday_mins"></td>
                        <td><input class="input input-xs w-20 bg-off_white border-search_stroke_gray" v-model="monday_h_pay"></td>
                        <td><input class="input input-xs w-20 bg-off_white border-search_stroke_gray" v-model="monday_m_pay"></td>
                        <td class="font-semibold text-dark_green">₱{{ monday_total }}</td>
                     </tr>
                     <tr class="hover:bg-off_white/50">
                        <th class="text-dark_gray font-medium">Tuesday</th>
                        <td class="text-sm">{{ tuesday.length !== 0 ? tuesday_timein : '-' }}</td>
                        <td class="text-sm">{{ tuesday.length !== 0 ? tuesday_timeout : '-' }}</td>
                        <td class="text-sm">{{ tuesday.length !== 0 ? tuesday[0].duration_json : '-' }}</td>
                        <td><input class="input input-xs w-16 bg-off_white border-search_stroke_gray" v-model="tuesday_hrs"></td>
                        <td><input class="input input-xs w-16 bg-off_white border-search_stroke_gray" v-model="tuesday_mins"></td>
                        <td><input class="input input-xs w-20 bg-off_white border-search_stroke_gray" v-model="tuesday_h_pay"></td>
                        <td><input class="input input-xs w-20 bg-off_white border-search_stroke_gray" v-model="tuesday_m_pay"></td>
                        <td class="font-semibold text-dark_green">₱{{ tuesday_total }}</td>
                     </tr>
                     <tr class="hover:bg-off_white/50">
                        <th class="text-dark_gray font-medium">Wednesday</th>
                        <td class="text-sm">{{ wednesday.length !== 0 ? wednesday_timein : '-' }}</td>
                        <td class="text-sm">{{ wednesday.length !== 0 ? wednesday_timeout : '-' }}</td>
                        <td class="text-sm">{{ wednesday.length !== 0 ? wednesday[0].duration_json : '-' }}</td>
                        <td><input class="input input-xs w-16 bg-off_white border-search_stroke_gray" v-model="wednesday_hrs"></td>
                        <td><input class="input input-xs w-16 bg-off_white border-search_stroke_gray" v-model="wednesday_mins"></td>
                        <td><input class="input input-xs w-20 bg-off_white border-search_stroke_gray" v-model="wednesday_h_pay"></td>
                        <td><input class="input input-xs w-20 bg-off_white border-search_stroke_gray" v-model="wednesday_m_pay"></td>
                        <td class="font-semibold text-dark_green">₱{{ wednesday_total }}</td>
                     </tr>
                     <tr class="hover:bg-off_white/50">
                        <th class="text-dark_gray font-medium">Thursday</th>
                        <td class="text-sm">{{ thursday.length !== 0 ? thursday_timein : '-' }}</td>
                        <td class="text-sm">{{ thursday.length !== 0 ? thursday_timeout : '-' }}</td>
                        <td class="text-sm">{{ thursday.length !== 0 ? thursday[0].duration_json : '-' }}</td>
                        <td><input class="input input-xs w-16 bg-off_white border-search_stroke_gray" v-model="thursday_hrs"></td>
                        <td><input class="input input-xs w-16 bg-off_white border-search_stroke_gray" v-model="thursday_mins"></td>
                        <td><input class="input input-xs w-20 bg-off_white border-search_stroke_gray" v-model="thursday_h_pay"></td>
                        <td><input class="input input-xs w-20 bg-off_white border-search_stroke_gray" v-model="thursday_m_pay"></td>
                        <td class="font-semibold text-dark_green">₱{{ thursday_total }}</td>
                     </tr>
                     <tr class="hover:bg-off_white/50">
                        <th class="text-dark_gray font-medium">Friday</th>
                        <td class="text-sm">{{ friday.length !== 0 ? friday_timein : '-' }}</td>
                        <td class="text-sm">{{ friday.length !== 0 ? friday_timeout : '-' }}</td>
                        <td class="text-sm">{{ friday.length !== 0 ? friday[0].duration_json : '-' }}</td>
                        <td><input class="input input-xs w-16 bg-off_white border-search_stroke_gray" v-model="friday_hrs"></td>
                        <td><input class="input input-xs w-16 bg-off_white border-search_stroke_gray" v-model="friday_mins"></td>
                        <td><input class="input input-xs w-20 bg-off_white border-search_stroke_gray" v-model="friday_h_pay"></td>
                        <td><input class="input input-xs w-20 bg-off_white border-search_stroke_gray" v-model="friday_m_pay"></td>
                        <td class="font-semibold text-dark_green">₱{{ friday_total }}</td>
                     </tr>
                     <tr class="hover:bg-off_white/50">
                        <th class="text-dark_gray font-medium">Saturday</th>
                        <td class="text-sm">{{ saturday.length !== 0 ? saturday_timein : '-' }}</td>
                        <td class="text-sm">{{ saturday.length !== 0 ? saturday_timeout : '-' }}</td>
                        <td class="text-sm">{{ saturday.length !== 0 ? saturday[0].duration_json : '-' }}</td>
                        <td><input class="input input-xs w-16 bg-off_white border-search_stroke_gray" v-model="saturday_hrs"></td>
                        <td><input class="input input-xs w-16 bg-off_white border-search_stroke_gray" v-model="saturday_mins"></td>
                        <td><input class="input input-xs w-20 bg-off_white border-search_stroke_gray" v-model="saturday_h_pay"></td>
                        <td><input class="input input-xs w-20 bg-off_white border-search_stroke_gray" v-model="saturday_m_pay"></td>
                        <td class="font-semibold text-dark_green">₱{{ saturday_total }}</td>
                     </tr>
                     <tr class="bg-yellow-50 hover:bg-yellow-100">
                        <th class="text-dark_gray font-medium">Adj Friday</th>
                        <td class="text-gray-400">-</td>
                        <td class="text-gray-400">-</td>
                        <td class="text-gray-400">-</td>
                        <td><input class="input input-xs w-16 bg-yellow-100 border-yellow-300" v-model="adjfriday_hrs"></td>
                        <td><input class="input input-xs w-16 bg-yellow-100 border-yellow-300" v-model="adjfriday_mins"></td>
                        <td><input class="input input-xs w-20 bg-yellow-100 border-yellow-300" v-model="adjfriday_h_pay"></td>
                        <td><input class="input input-xs w-20 bg-yellow-100 border-yellow-300" v-model="adjfriday_m_pay"></td>
                        <td class="font-semibold text-yellow-600">₱{{ adjfriday_total }}</td>
                     </tr>
                     <tr class="bg-yellow-50 hover:bg-yellow-100">
                        <th class="text-dark_gray font-medium">Adj Saturday</th>
                        <td class="text-gray-400">-</td>
                        <td class="text-gray-400">-</td>
                        <td class="text-gray-400">-</td>
                        <td><input class="input input-xs w-16 bg-yellow-100 border-yellow-300" v-model="adjsaturday_hrs"></td>
                        <td><input class="input input-xs w-16 bg-yellow-100 border-yellow-300" v-model="adjsaturday_mins"></td>
                        <td><input class="input input-xs w-20 bg-yellow-100 border-yellow-300" v-model="adjsaturday_h_pay"></td>
                        <td><input class="input input-xs w-20 bg-yellow-100 border-yellow-300" v-model="adjsaturday_m_pay"></td>
                        <td class="font-semibold text-yellow-600">₱{{ adjsaturday_total }}</td>
                     </tr>
                  </tbody>
               </table>
            </div>
         </div>

         <!-- Payroll Calculation Section -->
         <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <!-- Pay Settings and Notes -->
            <div class="bg-white rounded-xl shadow-sm border border-search_stroke_gray p-6">
               <div class="flex items-center mb-6">
                  <div class="w-10 h-10 bg-dark_green rounded-full flex items-center justify-center mr-3">
                     <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                     </svg>
                  </div>
                  <div>
                     <h2 class="text-xl font-semibold text-dark_gray">Pay Configuration</h2>
                     <p class="text-sm text-dark_gray/70">Set hourly and minute rates</p>
                  </div>
               </div>

               <div class="grid grid-cols-2 gap-4 mb-6">
                  <div>
                     <label class="block text-sm font-medium text-dark_gray mb-2">Pay per Hour</label>
                     <div class="relative">
                        <span class="absolute left-3 top-1/2 transform -translate-y-1/2 text-dark_gray/70">₱</span>
                        <input v-model="phr" class="input input-bordered w-full pl-8 bg-off_white border-search_stroke_gray focus:border-dark_green">
                     </div>
                  </div>
                  <div>
                     <label class="block text-sm font-medium text-dark_gray mb-2">Pay per Minute</label>
                     <div class="relative">
                        <span class="absolute left-3 top-1/2 transform -translate-y-1/2 text-dark_gray/70">₱</span>
                        <input v-model="pmn" class="input input-bordered w-full pl-8 bg-off_white border-search_stroke_gray focus:border-dark_green">
                     </div>
                  </div>
               </div>

               <div>
                  <label class="block text-sm font-medium text-dark_gray mb-2">Additional Notes</label>
                  <textarea 
                     v-model="notes" 
                     class="textarea textarea-bordered w-full bg-off_white border-search_stroke_gray focus:border-dark_green"
                     rows="4"
                     placeholder="Add any additional notes or comments about this payroll period..."
                  ></textarea>
               </div>
            </div>

            <!-- Payroll Summary -->
            <div class="bg-white rounded-xl shadow-sm border border-search_stroke_gray p-6">
               <div class="flex items-center mb-6">
                  <div class="w-10 h-10 bg-dark_green rounded-full flex items-center justify-center mr-3">
                     <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                     </svg>
                  </div>
                  <div>
                     <h2 class="text-xl font-semibold text-dark_gray">Payroll Summary</h2>
                     <p class="text-sm text-dark_gray/70">Weekly totals and adjustments</p>
                  </div>
               </div>

               <div class="space-y-4">
                  <div class="flex justify-between items-center p-3 bg-off_white rounded-lg">
                     <span class="font-medium text-dark_gray">Weekly Total</span>
                     <span class="text-lg font-bold text-dark_green">₱{{ weekTotal }}</span>
                  </div>

                  <div class="space-y-3">
                     <div class="flex justify-between items-center">
                        <label class="text-sm font-medium text-dark_gray">Bale (Previous Balance)</label>
                        <div class="relative">
                           <span class="absolute left-3 top-1/2 transform -translate-y-1/2 text-dark_gray/70">₱</span>
                           <input class="input input-sm input-bordered w-24 pl-8 bg-off_white border-search_stroke_gray" v-model="bale">
                        </div>
                     </div>
                     <div class="flex justify-between items-center">
                        <label class="text-sm font-medium text-dark_gray">Bonus/Advance</label>
                        <div class="relative">
                           <span class="absolute left-3 top-1/2 transform -translate-y-1/2 text-dark_gray/70">₱</span>
                           <input class="input input-sm input-bordered w-24 pl-8 bg-off_white border-search_stroke_gray" v-model="advance">
                        </div>
                     </div>
                     <div class="flex justify-between items-center">
                        <label class="text-sm font-medium text-dark_gray">Deductions</label>
                        <div class="relative">
                           <span class="absolute left-3 top-1/2 transform -translate-y-1/2 text-dark_gray/70">₱</span>
                           <input class="input input-sm input-bordered w-24 pl-8 bg-off_white border-search_stroke_gray" v-model="deduction">
                        </div>
                     </div>
                  </div>

                  <div class="border-t-2 border-dark_green pt-4">
                     <div class="flex justify-between items-center p-4 bg-dark_green/10 rounded-lg">
                        <span class="text-lg font-bold text-dark_gray">Final Total Balance</span>
                        <span class="text-2xl font-bold text-dark_green">₱{{ total_bal }}</span>
                     </div>
                  </div>
               </div>
            </div>
         </div>
      </div>
   </div>
   <p class="text-transparent">{{ componentKey }} {{ isLoading }}</p>
</template>

