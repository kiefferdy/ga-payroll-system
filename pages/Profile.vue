<template>
    <div class="flex flex-row justify-center py-32">
        <h1>USER INFO</h1>
        <br>
        {{ user }}
        <button @click="signOut" class="bg-button_green rounded-full px-8 py-0.5 font-bold text-white">LOGOUT</button> <!-- TODO: Check if user exists, if user exists it will redirect to clock in page, else must show error message-->
    </div>
 
 </template>
 
 <style scoped>
 .error {
   color: red;
 }
 </style>
 
 <script setup lang="ts">
 // TODO:
 // Async search database for existing user
 const user = useSupabaseUser();
 const supabase = useSupabaseClient();

 const signOut = async () => {
  const { error } = await supabase.auth.signOut()

  try {
    await $fetch("/api/_supabase/session", {
      method:"POST",
      body: { event: "SIGNED_OUT", session: null },
    });
  user.value = null;
  navigateTo('/login')
  } catch (error) {
    console.log(error) 
  }
};
 </script>
 