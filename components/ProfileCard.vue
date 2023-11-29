<template>
   <div class="card card-side bg-off_white justify-between items-center h-12 p-5 m-5 mx-10">
      <div class="card card-side items-center">
         <img  src="~/assets/icons/user.png" class="w-8 rounded-full me-2"/>
         <p>{{Employees.first_name }} {{Employees.last_name }}</p>
      </div>
      <div class="card card-side">
         <div class="me-10">
            <div class="flex flex-row self-end">
               <p class="mr-4 ">Status:</p>
               <div class="bg-clock_out_red rounded-full w-2.5 h-2.5 mx-1 mt-2"></div>
               <p>{{ Employees.status }}</p>         
            </div>
            <p class="text-xs">Last updated: {{ getMostRecentTime(Employees) }}</p>
         </div>
         <div class="card card-side items-center">
            <NuxtLink to="/edit-account">
               <button class="btn btn-info btn-sm me-2"><img src="~/assets/icons/edit.png" class="w-4"></button>
            </NuxtLink>
               <button class="btn btn-error btn-sm"><img src="~/assets/icons/delete.png" class="w-4"></button>
         </div>         
      </div>

   </div>
</template>

<script setup>
   const { Employees } = defineProps(['Employees'])

   const getMostRecentTime = (person) => {
  let mostRecentTime = null;

  if (!mostRecentTime || new Date(person.time_in) > new Date(mostRecentTime)) {
    mostRecentTime = person.time_in;
  }
  if (!mostRecentTime || new Date(person.time_out) > new Date(mostRecentTime)) {
    mostRecentTime = person.time_out;
  }

  return formatTime(mostRecentTime);
};

const formatTime = (time) => {
  const formattedTime = new Date(time);
  return formattedTime.toLocaleString(); // Adjust this according to the desired format
};
</script>