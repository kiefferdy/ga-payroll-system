<template>
      <div class="card card-side h-[37rem] w-[65rem] bg-dark_green text-black">
      <div class="card h-[37rem] w-[55rem] bg-primary_white rounded rounded-[1rem] rounded-br-[1rem]">
         <div class="card card-side justify-between mx-10 mt-5">
            <div class="card card-side">
               <p class="pe-2 mt-1">Employee:</p>
               <div class="dropdown dropdown-hover w-56 border-button_green border-2 rounded-md">
                  <label tabindex="0" class="ps-3">Name</label>
                  <ul tabindex="0" class="dropdown-content z-[1] menu rounded-md shadow bg-primary_white w-56   py-2 px-3">
                     <li class="py-1">Reign Larraquel</li>
                     <li class="py-1">Rafael Austria</li>
                     <li class="py-1">Jose Rizal</li>
                  </ul>
               </div>
            </div>
            <div class="card card-side">
               <p class="pe-2 mt-1">Week:</p>
               <div class="dropdown dropdown-hover w-64 border-button_green border-2 rounded-md">
                  <label tabindex="0" class="ps-3">00/00/0000 - 00/00/0000</label>
                  <ul tabindex="0" class="dropdown-content z-[1] menu rounded-md shadow bg-primary_white w-64 py-2 px-3">
                     <li class="py-1">10/15/2023 - 10/21/2023</li>
                     <li class="py-1">10/22/2023 - 10/28/2023</li>
                     <li class="py-1">10/29/2023 - 11/04/2023</li>
                  </ul>
               </div>
            </div>
         </div>
         <div class=" mx-10 my-2">
            <table class="table text-xs">
               <thead class="">
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
                     <td>8:00</td>
                     <td>22:00</td>
                     <td>14:00</td>
                     <td>13</td>
                     <td></td>
                     <td>942.50</td>
                     <td></td>
                     <td>942.50</td>
                  </tr>
                  <tr>
                     <th>Wed</th>
                     <td>8:00</td>
                     <td>17:00</td>
                     <td>9:00</td>
                     <td>8</td>
                     <td></td>
                     <td>580.00</td>
                     <td></td>
                     <td>580.00</td>
                  </tr>
                  <tr>
                     <th>Thurs</th>
                     <td>8:00</td>
                     <td>20:30</td>
                     <td>12:30</td>
                     <td>11</td>
                     <td>30</td>
                     <td>797.50</td>
                     <td>36.30</td>
                     <td>833.80</td>
                  </tr>
                  <tr>
                     <th>Fri</th>
                     <td>8:00</td>
                     <td>17:00</td>
                     <td>9:00</td>
                     <td>8</td>
                     <td>30</td>
                     <td>580.00</td>
                     <td>36.30</td>
                     <td>616.30</td>
                  </tr>
                  <tr>
                     <th>Sat</th>
                     <td>8:00</td>
                     <td>16:00</td>
                     <td>8:00</td>
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
         <div class="card card-side justify-between mx-10">
            <div>
               <div class="text-sm card card-side justify-between bg-off_white">
                  <p class="pe-36">Pay per Hr</p>
                  <p class="pe-36">Pay per Min</p>               
               </div>
               
            </div>
            <div class="card px-5 py-2 bg-off_white">
               <table class="text-left text-xs">
                  <tbody>
                     <tr>
                        <th class="font-normal">Weekly Total</th>
                        <td class="w-16 border-b-2 border-dark_green"></td>
                     </tr>
                     <tr>
                        <th class="font-normal">Friday</th>
                        <td class="w-16 border-b-2 border-dark_green"></td>
                     </tr>
                     <tr>
                        <th class="font-normal">Bale</th>
                        <td class="w-16 border-b-2 border-dark_green"></td>
                     </tr>
                     <tr>
                        <th class="font-normal">Sat Advance</th>
                        <td class="w-16 border-b-2 border-dark_green"></td>
                     </tr>
                     <tr>
                        <th class="font-normal">Deduction</th>
                        <td class="w-16 border-b-2 border-dark_green"></td>
                     </tr>
                     <tr class="text-base">
                        <th class="pe-10 pt-2">Total Balance</th>
                        <td class="w-16 border-b-2 border-dark_green ms-20"></td>
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
            <button class="font-bold btn btn-sm btn-ghost btn-circle w-28">Logout<img class="mx-2 w-4 h-4" src="~/assets/icons/exit_white.png"></button>
         </div>
      </ul>
   </div>
</template>