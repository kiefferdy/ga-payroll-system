<template>
   <div class="card text-black flex justify-center h-[30rem] w-[35rem]">
      <h1 class="card-title mb-5">Create Account</h1>
      <div class="card card-side justify-between">
         <div>
            <label class="label-text text-black mt-4 font-bold">First Name<br></label>
            <input v-model="firstName" type="text" class="input input-sm border-dark_green bg-primary_white rounded w-64" required>
         </div>
         <div>
            <label class="label-text text-black mt-4 font-bold">Last Name<br></label>
            <input v-model="lastName" type="text" class="input input-sm border-dark_green bg-primary_white rounded w-64" required>
         </div>
      </div>
      <div class="mt-5">
         <label class="label-text text-black mt-4 font-bold">Email<br></label>
         <input v-model="email" type="email" class="input input-sm border-dark_green bg-primary_white rounded w-full" required>
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
         <button @click="handleSignUp" class="btn btn-ghost rounded-full btn-sm bg-button_green text-white m-1">Conitnue</button>
      </div>
      <div v-if="invalidEmail" class="mt-2 self-center error">Email is Invalid</div>
      <div v-if="passwordsNotMatch" class="mt-2 self-center error">Passwords do not match</div>
      <div v-if="incompleteFields" class="mt-2 self-center error">Please fill all fields before proceeding</div>
      <div v-if="emailTaken" class="mt-2 self-center error">Email is already taken</div>
   </div>
</template>

<style scoped>
.error {
  color: red;
}
</style>

<script setup>

 const user = useSupabaseUser();
 const supabase = useSupabaseClient();

const firstName = ref('');
const lastName = ref('');
const email = ref('');
const password = ref('');
const verifyPassword = ref('');
const needsOTP = ref(false);

const invalidEmail = ref(false);
const passwordsNotMatch = ref(false);
const incompleteFields = ref(false);
const emailTaken = ref(false);

async function handleSignUp(){
  invalidEmail.value = !validateEmail(email.value);
  passwordsNotMatch.value = password.value !== verifyPassword.value;
  incompleteFields.value = !firstName.value || !lastName.value || !email.value || !password.value || !verifyPassword.value;

  if (invalidEmail.value || passwordsNotMatch.value || incompleteFields.value) {
    return;
  }

  try {
    const { error } = await supabase.auth.signUp({
      email: email.value,
      password: password.value,

    });

    if (error) {
      if (error.message.includes('unique')) {
        emailTaken.value = true;
      }
      // Handle other signup errors if needed
      console.error(error);
      return;
    }

    // Handle successful sign-up
    console.log('Signed up successfully!');
    // Redirect or perform other actions upon successful sign-up
  } catch (err) {
    // Handle exceptions
    console.error(err);
  }
};

// Function to validate email format
function validateEmail(email) {
  // You can use a regex pattern or any email validation method you prefer
  return /\S+@\S+\.\S+/.test(email);
}
</script>