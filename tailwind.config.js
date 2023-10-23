/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./components/**/*.{js,vue,ts}",
    "./layouts/**/*.vue",
    "./pages/**/*.vue",
    "./plugins/**/*.{js,ts}",
    "./nuxt.config.{js,ts}",
    "./app.vue",
  ],
  theme: {
    extend: {
    },
    colors: {
      primary_green : '#C4ECC8',
      dark_green : '#689E6E',
      button_green : '#75AF59',
      clock_in_green : '#26B82B',
      clock_out_red : '#B82626',
      primary_white : '#F8F8F8',
      off_white : '#ECECEC',
      dark_gray : '#585858',
      search_text_gray : '#CFCFCF',
      search_stroke_gray: '#E9E9E9',
      black : '#000000',
      white : '#FFFFFF',
    },
    fontFamily: {
      'sans': ['Wix Madefor Text', 'sans-serif'],
    },
  },
  plugins: [require("daisyui")],
}

