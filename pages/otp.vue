<template>
   <div class="flex flex-col items-center">
      <h1 class="text-xl font-bold mt-20">Enter Code</h1>
      <p>OTP</p>
      <div class="flex justify-center space-x-2 m-5">
         <div class="otp-line"></div>
         <div class="otp-line"></div>
         <div class="otp-line"></div>
         <div class="otp-line"></div>
         <div class="otp-line"></div>
         <div class="otp-line"></div>
      </div>
      
   </div>
</template>

<style>
  .otp-line {
    width: 2em; 
    height: 2px;
    background: #689E6E; 
    margin: 0 0.2em;
  }
</style>
