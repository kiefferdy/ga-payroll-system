<template>
   <Title>Admin - Edit Account</Title>
   <div class="card text-black flex justify-center h-[30rem] w-[35rem]">
      <h1 class="card-title mb-5">Edit Account of {{ employee.first_name }} {{ employee.last_name }}</h1>
      <div class="card card-side justify-between">
         <div>
            <label class="label-text text-black mt-4 font-bold">First Name*<br></label>
            <input v-model="firstName" type="text" class="input input-sm border-dark_green bg-primary_white rounded w-64" required>
         </div>
         <div>
            <label class="label-text text-black mt-4 font-bold">Last Name*<br></label>
            <input v-model="lastName" type="text" class="input input-sm border-dark_green bg-primary_white rounded w-64" required>
         </div>
      </div>
      <div class="card card-side justify-between mt-4">
         <div>
            <label class="label-text text-black mt-4 font-bold">Email*<br></label>
            <input v-model="email" type="email" class="input input-sm border-dark_green bg-primary_white rounded w-64" required>
         </div>
         <div>
            <!-- Rank Selector -->
            <label class="label-text text-black mt-4 font-bold">Rank*<br></label>
            <select v-model="rank" class="input input-sm border-dark_green bg-primary_white rounded w-64">
               <option value="Employee">Employee</option>
               <option value="Admin">Admin</option>
               <option value="Developer">Developer</option>
            </select>
         </div>
      </div>
      <div class="mt-5">
         <label class="label-text text-black mt-4 font-bold">Password<br></label>
         <input v-model="password" type="password" class="input input-sm border-dark_green bg-primary_white rounded w-full" required>
      </div>
      <div class="mt-5">
         <label class="label-text text-black mt-4 font-bold">Confirm Password<br></label>
         <input v-model="verifyPassword" type="password" class="input input-sm border-dark_green bg-primary_white rounded w-full" required>
      </div>
      <div class="mt-5">
         <input v-model="needsOTP" type="checkbox" class="text-black"> Needs OTP to Login?
      </div>
      <div class="self-end">
         <NuxtLink to="/employees">
            <button class="btn btn-ghost rounded-full btn-sm bg-dark_gray text-white ml-10 mr-1 px-5">Cancel</button>
         </NuxtLink>
         <button @click="handleEdit" class="btn btn-ghost rounded-full btn-sm bg-button_green text-white m-1">Continue</button>
      </div>
      <div v-if="loadingNotif" class="mt-2 self-center success">Editing user details...</div>
      <div v-if="editSuccess" class="mt-2 self-center success">Success!</div>
      <div v-if="invalidEmail" class="mt-2 self-center error">Please enter a valid email address.</div>
      <div v-if="passwordsNotMatch" class="mt-2 self-center error">The passwords do not match.</div>
      <div v-if="passwordTooShort" class="mt-2 self-center error">The password should be at least 6 characters long.</div>
      <div v-if="incompleteFields" class="mt-2 self-center error">Please fill all required fields before proceeding.</div>
      <div v-if="emailTaken" class="mt-2 self-center error">The entered email address is already taken.</div>
      <div v-if="insertionError" class="mt-2 self-center error">A database error occurred! Please try again.</div>
      <div v-if="genericError" class="mt-2 self-center error">An error occurred!</div>
   </div>
</template>
 
 <style scoped>
   .error {
      color: red;
   }

   .success {
      color: green;
   }
 </style>
 
<script setup>

   import { ref } from 'vue';
   import { useRouter } from 'vue-router';
   import { useRoute } from 'vue-router';

   const supabase = useSupabaseClient();
   const router = useRouter();
   const route = useRoute();

   // Notifs
   const loadingNotif = ref(false);
   const editSuccess = ref(false);
   const invalidEmail = ref(false);
   const passwordsNotMatch = ref(false);
   const passwordTooShort = ref(false);
   const incompleteFields = ref(false);
   const emailTaken = ref(false);
   const insertionError = ref(false);
   const genericError = ref(false);

   const fetchUserEmail = async (uuid) => {
      const { data: { user } } = await supabase.auth.getUser();  // Get the user performing the action
      const response = await fetch('/api/get-user', {
         method: 'POST',
         headers: {
            'Content-Type': 'application/json'
         },
         body: JSON.stringify({ 
            targetId: uuid,
            userId: user.id
         })
      });

      const result = await response.json();
      if (!response.ok) {
         console.error('Error fetching target user:', result.body.error?.message);
         return null;
      }
      
      return result.body.data.user ? result.body.data.user.email : null;
   };

   const handleEdit = async () => {
      // Verification of user input
      clearNotifs();
      validateInputs();
      if (invalidEmail.value || passwordsNotMatch.value || incompleteFields.value) {
         return;
      }

      try {
         const { data: { user } } = await supabase.auth.getUser();  // Get the user performing the action
         console.log("Retrieved user:", user);

         // Sending create user request to server
         const response = await fetch('/api/edit-user', {
            method: 'POST',
            headers: {
               'Content-Type': 'application/json'
            },
            body: JSON.stringify({ 
               email: email.value,
               password: password.value,
               targetId: employee.id,
               userId: user.id
            })
         });

         const result = await response.json();
         if (!(result.status >= 200 && result.status <= 299)) {
            if (result.body.error?.message.includes('duplicate key value')) {
               emailTaken.value = true;
               console.error(result.body.error.message);
               return;
            } else if (result.body.error?.message.includes('at least 6 characters')) {
               passwordTooShort.value = true;
               console.error(result.body.error.message);
               return;
            } else {
               genericError.value = true;
               console.error(result);
               return;
            }
         }

         // Assuming the target user's account has been edited
         console.log(result);
         loadingNotif.value = true;
         const userId = targetId;
         console.log('User edited:', userId);
         clearNotifs();

         // Insert a new row in the Employees table for the new user
         const { data: insertData, insertError } = await supabase
            .from('Employees')
            .update([
               {
                  rank: rank.value,
                  first_name: firstName.value,
                  last_name: lastName.value,
                  requires_otp: needsOTP.value,
                  last_updated: new Date()
               }
            ])
            .eq('id', userId);

            if (insertError) {
               // If inserting user to "Employees" table fails
               loadingNotif.value = false;
               insertionError.value = true;
               console.error('Error inserting into Employees table:', insertError);
               return;
            }

         loadingNotif.value = false;
         editSuccess.value = true;
         alert('User edited successfully!');
         router.push('/employees');
      } catch (err) {
         console.error(err);
         loadingNotif.value = false;
         genericError.value = true;
      }
   };

   function validateInputs() {
      invalidEmail.value = !validateEmail(email.value);
      passwordsNotMatch.value = password.value !== verifyPassword.value;
      incompleteFields.value = !firstName.value || !lastName.value || !email.value;
   }

   function validateEmail(email) {
      const regex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      return regex.test(email);
   }

   // Clears all error notifications
   function clearNotifs() {
      invalidEmail.value = false;
      passwordsNotMatch.value = false;
      passwordTooShort.value = false;
      incompleteFields.value = false;
      emailTaken.value = false;
      genericError.value = false;
   }

   // Verification check to see if user is an admin or developer
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

   // Functions to be run once page loads
   verifyUserRank();

   // Fetch employee info from database
   const targetId = route.params.id;
   const userEmail = await fetchUserEmail(targetId);
   const { data: employee, error } = await supabase
      .from('Employees')
      .select('*')
      .eq('id', targetId)
      .single();

   if (error) {
      console.error('Error fetching target user from database:', error);
   }

   // Form fields
   const firstName = ref(employee.first_name);
   const lastName = ref(employee.last_name);
   const email = ref(userEmail);
   const password = ref('');
   const verifyPassword = ref('');
   const needsOTP = ref(employee.requires_otp);
   const rank = ref(employee.rank);

</script>