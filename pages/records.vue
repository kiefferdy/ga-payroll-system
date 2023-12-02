<template>
   <Title>Admin</Title>
      <div class="card card-side h-[37rem] w-[65rem] bg-dark_green text-black">
      <div class="card h-[37rem] w-[55rem] bg-primary_white rounded-[1rem] rounded-br-[1rem]">
         <div class="card card-side justify-between mx-10 mt-5">
            <div class="card card-side">
               <p class="pe-2 mt-1">Employee:</p>
               <div class="dropdown dropdown-hover w-56 border-button_green border-2 rounded-md">
                  <label tabindex="0" class="ps-3">{{ currentEmployeeName || 'Name' }}</label>
                  <ul tabindex="0" class="dropdown-content z-[1] menu rounded-md shadow bg-primary_white w-56   py-2 px-3">
                     <li v-for="p in Employees" class="py-1" @click="setCurrentEmployee(p)">{{p.first_name}} {{ p.last_name }}</li>
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
                     <td>Hday</td>
                     <td></td>
                     <td></td>
                     <td>8</td>
                     <td></td>
                     <td>580.00</td>
                     <td></td>
                     <td>580.00</td>
                  </tr>
                  <tr>
                     <th>Tues</th>
                     <td v-if="time_sheet && time_sheet[0] !== null">{{ time_sheet[0].time_in }}</td>
                     <td v-else></td>
                     <td v-if="time_sheet && time_sheet[0] !== null">{{ time_sheet[0].time_out }}</td>
                     <td v-else></td>
                     <td v-if="time_sheet && time_sheet[0] !== null">{{time_sheet[0].time_in }}</td>
                     <td v-else></td>
                     <td>13</td>
                     <td></td>
                     <td>942.50</td>
                     <td></td>
                     <td>942.50</td>
                  </tr>
                  <tr>
                     <th>Wed</th>
                     <td v-if="time_sheet && time_sheet[0] !== null">{{ time_sheet[1].time_in }}</td>
                     <td v-else></td>
                     <td v-if="time_sheet && time_sheet[0] !== null">{{ time_sheet[1].time_out }}</td>
                     <td v-else></td>
                     <td v-if="time_sheet && time_sheet[0] !== null">{{time_sheet[1].time_in }}</td>
                     <td v-else></td>
                     <td>8</td>
                     <td></td>
                     <td>580.00</td>
                     <td></td>
                     <td>580.00</td>
                  </tr>
                  <tr>
                     <th>Thurs</th>
                     <td v-if="time_sheet && time_sheet[2] !== null">{{ time_sheet[2].time_in }}</td>
                     <td v-else></td>
                     <td v-if="time_sheet && time_sheet[2] !== null">{{ time_sheet[2].time_out }}</td>
                     <td v-else></td>
                     <td v-if="time_sheet && time_sheet[2] !== null">{{time_sheet[2].time_in }}</td>
                     <td v-else></td>
                     <td>11</td>
                     <td>30</td>
                     <td>797.50</td>
                     <td>36.30</td>
                     <td>833.80</td>
                  </tr>
                  <tr>
                     <th>Fri</th>
                     <td v-if="time_sheet && time_sheet[0] !== null">{{ time_sheet[0].time_in }}</td>
                     <td v-else></td>
                     <td v-if="time_sheet && time_sheet[0] !== null">{{ time_sheet[0].time_out }}</td>
                     <td v-else></td>
                     <td v-if="time_sheet && time_sheet[0] !== null">{{time_sheet[0].time_in }}</td>
                     <td v-else></td>
                     <td>8</td>
                     <td>30</td>
                     <td>580.00</td>
                     <td>36.30</td>
                     <td>616.30</td>
                  </tr>
                  <tr>
                     <th>Sat</th>
                     <td v-if="time_sheet && time_sheet[2] !== null">{{ time_sheet[2].time_in }}</td>
                     <td v-else></td>
                     <td v-if="time_sheet && time_sheet[2] !== null">{{ time_sheet[2].time_out }}</td>
                     <td v-else></td>
                     <td v-if="time_sheet && time_sheet[2] !== null">{{time_sheet[2].time_in }}</td>
                     <td v-else></td>
                     <td>7</td>
                     <td></td>
                     <td>507.50</td>
                     <td></td>
                     <td>507.50</td>
                  </tr>
                  <tr>
                     <th>Adj Fri</th>
                     <td></td>
                     <td></td>
                     <td></td>
                     <td></td>
                     <td></td>
                     <td></td>
                     <td></td>
                     <td></td>
                  </tr>
                  <tr>
                     <th>Adj Sat</th>
                     <td>9:00</td>
                     <td>17:00</td>
                     <td>8:00</td>
                     <td>1</td>
                     <td></td>
                     <td>72.50</td>
                     <td></td>
                     <td>72.50</td>
                  </tr>
               </tbody>
            </table>
         </div>
         <div class="card card-side justify-between mx-5 text-sm">
            <div class="card bg-off_white px-5 py-2">
               <div class="card card-side justify-between pb-4 pt-1">
                  <div class="pe-36 card card-side">
                     <p class="pe-2 font-bold">Pay per Hr:</p>
                     <p>36.50</p> 
                  </div>
                  <div class="pe-36 card card-side">
                     <p class="pe-2 font-bold">Pay per Min:</p>
                     <p>43.50</p>
                  </div>        
               </div>
               <p class="font-bold text-black">Additional Notes:</p>
               <input type="text" class="w-full h-14 rounded-md bg-off_white border-2 border-dark_green"/>   
            </div>
            <div class="card px-5 py-2 bg-off_white">
               <table class="text-xs">
                  <tbody>
                     <tr>
                        <th class="font-normal text-left">Weekly Total</th>
                        <td class="w-16 text-right">4432.60</td>
                     </tr>
                     <tr>
                        <th class="font-normal text-left">Friday</th>
                        <td class="w-16 text-right">1000</td>
                     </tr>
                     <tr>
                        <th class="font-normal text-left">Bale</th>
                        <td class="w-16 text-right">200</td>
                     </tr>
                     <tr>
                        <th class="font-normal text-left">Sat Advance</th>
                        <td class="w-16 text-right"></td>
                     </tr>
                     <tr class="border-b-2 border-dark_green">
                        <th class="font-normal text-left">Deduction</th>
                        <td class="w-16 text-right">300</td>
                     </tr>
                     <tr class="text-base">
                        <th class="pe-10 pt-2 text-left">Total Balance</th>
                        <td class="w-16 pt-2 text-right">2932.60</td>
                     </tr>
                  </tbody>
               </table>
            </div>
         </div>
      </div>
      <ul class="menu w-[10rem] p-0 font-bold text-white justify-between">
         <div>
            <li class="py-2 items-center"><NuxtLink to="/employees">Employees</NuxtLink></li>
            <li class="active bg-primary_white rounded-r-[1rem] py-2 items-center text-black"><NuxtLink to="/records">Records</NuxtLink></li>
            <li class="py-2 items-center"><NuxtLink to="/settings">Settings</NuxtLink></li>         
         </div>
         <div class="self-end mb-1">
            <button @click="logout" class="font-bold btn btn-sm btn-ghost btn-circle w-28">Logout<img class="mx-2 w-4 h-4" src="~/assets/icons/exit_white.png"></button>
         </div>
      </ul>
   </div>
</template>

<script setup>
 const user = useSupabaseUser();
 const supabase = useSupabaseClient();

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
  const oneDay = 24 * 60 * 60 * 1000; // One day in milliseconds

  for (let i = 0; i < 13; i++) {
    const endDate = new Date(today.getTime() - i * 7 * oneDay); // Calculate the end date
    const startDate = new Date(endDate.getTime() - 6 * oneDay); // Calculate the start date

    const formattedStartDate = formatDate(startDate);
    const formattedEndDate = formatDate(endDate);

    generatedWeeks.push(`${formattedStartDate} - ${formattedEndDate}`);
  }

  return generatedWeeks;
}

function formatDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

const handleWeekClick = (week) => {
  selectedWeek.value = week;
  const { startDate, endDate } = getStartAndEndDate(week);
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

const end_date = ref(null);
const start_date = ref(null);
const time_sheet = ref(null);
const time_sheet_array = ref(null);
async function fetchTimeSheet(startDate, endDate) {
   console.log(currentEmployeeId.value);
   console.log("went here");
   start_date.value = formatDate(startDate);
   end_date.value = formatDate(endDate);

let { data: TimeSheet, error } = await supabase
  .from('TimeSheet')
  .select('*')
  .gte('date', formatDate(startDate))// Set the 'Greater than or equal to' filter
  .lte('date', formatDate(endDate)) // Set the 'Less than or equal to' filter
  .eq('user_id', currentEmployeeId.value);
   time_sheet.value = null;
  time_sheet.value = TimeSheet;

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

</script>