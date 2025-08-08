export default defineNuxtConfig({
  devtools: { enabled: true },
  modules: [
    '@nuxtjs/tailwindcss',
    '@nuxtjs/supabase'
  ],
  runtimeConfig: {
    // Private keys (only available on server-side)
    supabaseBypassKey: process.env.SUPABASE_BYPASS_KEY,
    twilioAccountSid: process.env.NUXT_TWILIO_ACCOUNT_SID,
    twilioAuthToken: process.env.NUXT_TWILIO_AUTH_TOKEN,
    twilioVerifyServiceSid: process.env.NUXT_TWILIO_VERIFY_SERVICE_SID,
    // Public keys (exposed to client-side)
    public: {
      supabase: {
        url: process.env.SUPABASE_URL,
        key: process.env.SUPABASE_KEY
      }
    }
  },
  supabase: {
    redirectOptions: {
      login: '/login',
      callback: '/login',
      exclude: ['/password-reset'],
    }
  },
});