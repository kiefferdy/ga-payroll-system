import { supabase, email, password } from './login.vue';

export async function signIn() {
try {
const { data, error } = await supabase.auth.signInWithPassword({
email: email.value,
password: password.value,
}
);

if (error) {
console.error("Sign in error:", error);
error.value = true;
} else {
error = false;
console.log("Sign in successful:", data);
// Do something with the authenticated user data if needed.
}
} catch (error) {
console.error("Error signing in:", error);
}
}
