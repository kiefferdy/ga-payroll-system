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
   <div class="card card-side h-[37rem] w-[65rem] bg-dark_green text-black">
      <div class="card h-[37rem] w-[55rem] bg-primary_white rounded-[1rem] rounded-br-[1rem]">
         <div class="card card-side justify-between mx-10 mt-5">
            <div class="card card-side">
               <p class="pe-2 mt-1">Employee:</p>
               <div class="dropdown dropdown-hover w-56 border-button_green border-2 rounded-md">
                  <label tabindex="0" class="ps-3">{{ currentEmployeeName || 'Name' }}</label>
                  <ul tabindex="0" class="dropdown-content z-[1] menu rounded-md shadow bg-primary_white w-56   py-2 px-3">
                     <li v-for="p in Employees" class="py-1" @click="setCurrentEmployee(p)">{{ p.first_name }} {{
                        p.last_name
                     }}</li>
                  </ul>
               </div>
            </div>
            <div class="card card-side">
               <p class="pe-2 mt-1">Week:</p>
               <div class="dropdown dropdown-hover w-64 border-button_green border-2 rounded-md">
                  <label tabindex="0" class="ps-3">{{ selectedWeek }}</label>
                  <ul tabindex="0" class="dropdown-content z-[1] menu rounded-md shadow bg-primary_white w-64 py-2 px-3">
                     <li v-for="w in weeks" class="py-1" @click="handleWeekClick(w)">
                        {{ w }}
                     </li>
                  </ul>
               </div>
            </div>
            <div :class="{ 'text-transparent': isLoading }">
               <p>Loading...</p>
            </div>
            <div> <button @click="Rerender()">Enter</button> </div>
         </div>
         <div class="card mx-5 my-5 bg-off_white p-2 px-5">
            <table class="table table-sm">
               <thead class="text-black">
                  <tr>
                     <th class="me-5"></th>
                     <th>in</th>
                     <th>out</th>
                     <th>Total</th>
                     <th>Hrs</th>
                     <th>Mins</th>
                     <th>H-Pay</th>
                     <th>M-Pay</th>
                     <th>Total</th>
                  </tr>
               </thead>
               <tbody>
                  <tr>
                     <th class="pe-10">Mon</th>
                     <td v-if="monday.length !== 0">{{ monday_timein }}</td>
                     <td v-else></td>
                     <td v-if="monday.length !== 0">{{ monday_timeout }}</td>
                     <td v-else></td>
                     <td v-if="monday.length !== 0">{{ monday[0].duration_json }}</td>
                     <td v-else></td>
                     <td><input class="w-20 bg-transparent" v-model="monday_hrs"></td>
                     <td><input class="w-20 bg-transparent" v-model="monday_mins"></td>
                     <td><input class="w-20 bg-transparent" v-model="monday_h_pay"></td>
                     <td><input class="w-20 bg-transparent" v-model="monday_m_pay"></td>
                     <td>{{ monday_total }}</td>
                  </tr>
                  <tr>
                     <th>Tue</th>
                     <td v-if="tuesday.length !== 0">{{ tuesday_timein }}</td>
                     <td v-else></td>
                     <td v-if="tuesday.length !== 0">{{ tuesday_timeout }}</td>
                     <td v-else></td>
                     <td v-if="tuesday.length !== 0">{{ tuesday[0].duration_json }}</td>
                     <td v-else></td>
                     <td><input class="w-20 bg-transparent" v-model="tuesday_hrs"></td>
                     <td><input class="w-20 bg-transparent" v-model="tuesday_mins"></td>
                     <td><input class="w-20 bg-transparent" v-model="tuesday_h_pay"></td>
                     <td><input class="w-20 bg-transparent" v-model="tuesday_m_pay"></td>
                     <td>{{ tuesday_total }}</td>
                  </tr>

                  <tr>
                     <th>Wed</th>
                     <td v-if="wednesday.length !== 0">{{ wednesday_timein }}</td>
                     <td v-else></td>
                     <td v-if="wednesday.length !== 0">{{ wednesday_timeout }}</td>
                     <td v-else></td>
                     <td v-if="wednesday.length !== 0">{{ wednesday[0].duration_json }}</td>
                     <td v-else></td>
                     <td><input class="w-20 bg-transparent" v-model="wednesday_hrs"></td>
                     <td><input class="w-20 bg-transparent" v-model="wednesday_mins"></td>
                     <td><input class="w-20 bg-transparent" v-model="wednesday_h_pay"></td>
                     <td><input class="w-20 bg-transparent" v-model="wednesday_m_pay"></td>
                     <td>{{ wednesday_total }}</td>
                  </tr>

                  <tr>
                     <th>Thu</th>
                     <td v-if="thursday.length !== 0">{{ thursday_timein }}</td>
                     <td v-else></td>
                     <td v-if="thursday.length !== 0">{{ thursday_timeout }}</td>
                     <td v-else></td>
                     <td v-if="thursday.length !== 0">{{ thursday[0].duration_json }}</td>
                     <td v-else></td>
                     <td><input class="w-20 bg-transparent" v-model="thursday_hrs"></td>
                     <td><input class="w-20 bg-transparent" v-model="thursday_mins"></td>
                     <td><input class="w-20 bg-transparent" v-model="thursday_h_pay"></td>
                     <td><input class="w-20 bg-transparent" v-model="thursday_m_pay"></td>
                     <td>{{ thursday_total }}</td>
                  </tr>

                  <tr>
                     <th>Fri</th>
                     <td v-if="friday.length !== 0">{{ friday_timein }}</td>
                     <td v-else></td>
                     <td v-if="friday.length !== 0">{{ friday_timeout }}</td>
                     <td v-else></td>
                     <td v-if="friday.length !== 0">{{ friday[0].duration_json }}</td>
                     <td v-else></td>
                     <td><input class="w-20 bg-transparent" v-model="friday_hrs"></td>
                     <td><input class="w-20 bg-transparent" v-model="friday_mins"></td>
                     <td><input class="w-20 bg-transparent" v-model="friday_h_pay"></td>
                     <td><input class="w-20 bg-transparent" v-model="friday_m_pay"></td>
                     <td>{{ friday_total }}</td>
                  </tr>

                  <tr>
                     <th>Sat</th>
                     <td v-if="saturday.length !== 0">{{ saturday_timein }}</td>
                     <td v-else></td>
                     <td v-if="saturday.length !== 0">{{ saturday_timeout }}</td>
                     <td v-else></td>
                     <td v-if="saturday.length !== 0">{{ saturday[0].duration_json }}</td>
                     <td v-else></td>
                     <td><input class="w-20 bg-transparent" v-model="saturday_hrs"></td>
                     <td><input class="w-20 bg-transparent" v-model="saturday_mins"></td>
                     <td><input class="w-20 bg-transparent" v-model="saturday_h_pay"></td>
                     <td><input class="w-20 bg-transparent" v-model="saturday_m_pay"></td>
                     <td>{{ saturday_total }}</td>
                  </tr>

                  <tr>
                     <th>Adj Fri</th>
                     <td></td>
                     <td></td>
                     <td></td>
                     <td><input class="w-20 bg-transparent" v-model="adjfriday_hrs"></td>
                     <td><input class="w-20 bg-transparent" v-model="adjfriday_mins"></td>
                     <td><input class="w-20 bg-transparent" v-model="adjfriday_h_pay"></td>
                     <td><input class="w-20 bg-transparent" v-model="adjfriday_m_pay"></td>
                     <td>{{ adjfriday_total }}</td>
                  </tr>
                  <tr>
                     <th>Adj Sat</th>
                     <td></td>
                     <td></td>
                     <td></td>
                     <td><input class="w-20 bg-transparent" v-model="adjsaturday_hrs"></td>
                     <td><input class="w-20 bg-transparent" v-model="adjsaturday_mins"></td>
                     <td><input class="w-20 bg-transparent" v-model="adjsaturday_h_pay"></td>
                     <td><input class="w-20 bg-transparent" v-model="adjsaturday_m_pay"></td>
                     <td>{{ adjsaturday_total }}</td>
                  </tr>
               </tbody>
            </table>
         </div>
         <div class="card card-side justify-between mx-5 text-sm">
            <div class="card bg-off_white px-5 py-2">
               <div class="card card-side justify-between pb-4 pt-1">
                  <div class="pe-36 card card-side">
                     <p class="pe-2 font-bold">Pay per Hr:</p>
                     <input v-model="phr" class="w-20 bg-transparent">
                  </div>
                  <div class="pe-36 card card-side">
                     <p class="pe-2 font-bold">Pay per Min:</p>
                     <input v-model="pmn" class="w-20 bg-transparent">
                  </div>
               </div>
               <p class="font-bold text-black">Additional Notes:</p>
               <input v-model="notes" type="text" class="w-full h-14 rounded-md bg-off_white border-2 border-dark_green" />
            </div>
            <div class="card px-5 py-2 bg-off_white">
               <table class="text-xs">
                  <tbody>
                     <tr>
                        <th class="font-normal text-left">Weekly Total</th>
                        <td class="w-16 text-right">{{ weekTotal }}</td>
                     </tr>
                     <tr>
                        <th class="font-normal text-left">Bale</th>
                        <td class="w-16 text-right"><input class="w-10 bg-transparent" v-model="bale"></td>
                     </tr>
                     <tr>
                        <th class="font-normal text-left">Bonus</th>
                        <td class="w-16 text-right"><input class="w-10 bg-transparent" v-model="advance"></td>
                     </tr>
                     <tr class="border-b-2 border-dark_green">
                        <th class="font-normal text-left">Deduction</th>
                        <td class="w-16 text-right"><input class="w-10 bg-transparent" v-model="deduction"></td>
                     </tr>
                     <tr class="text-base">
                        <th class="pe-10 pt-2 text-left">Total Balance</th>
                        <td class="w-16 pt-2 text-right">{{ total_bal }}</td>
                     </tr>
                  </tbody>
               </table>
            </div>
         </div>
      </div>
      <ul class="menu w-[10rem] p-0 font-bold text-white justify-between">
         <div>
            <li class="py-2 items-center">
               <NuxtLink to="/employees">Employees</NuxtLink>
            </li>
            <li class="active bg-primary_white rounded-r-[1rem] py-2 items-center text-black">
               <NuxtLink to="/records">Records</NuxtLink>
            </li>
            <li class="py-2 items-center">
               <NuxtLink to="/settings">Settings</NuxtLink>
            </li>
         </div>
         <div class="self-end mb-1">
            <button @click="logout" class="font-bold btn btn-sm btn-ghost btn-circle w-28">Logout<img class="mx-2 w-4 h-4"
                  src="~/assets/icons/exit_white.png"></button>
         </div>
      </ul>
   </div>
   <p class="text-transparent">{{ componentKey }} {{ isLoading }}</p>
</template>

