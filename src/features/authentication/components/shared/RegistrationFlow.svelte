<script lang="ts">
  import TabSelector from './TabSelector.svelte';
  import EmailInputForm from './EmailInputForm.svelte';
  import PhoneInputForm from './PhoneInputForm.svelte';
  import OTPVerification from './OTPVerification.svelte';
  import { createEventDispatcher, onMount } from 'svelte';
  
  export let title: string;
  export let redirectUrl: string;
  export const programType: 'LOYALTY_PROGRAM' | 'EVENT_REGISTRATION' = 'EVENT_REGISTRATION';
  export let showProfileForm = false;
  
  // Common state
  export let activeTab: 'email' | 'phone' = 'email';
  export let otpSent = false;
  export let email = '';
  export let phone = '';
  export let countryCode = '+60';
  export let displayPhone = '';
  export let otp: string[] = [];
  export let isOtpComplete = false;
  export let isWaitingForAuth = false;
  export let countdown = 60;
  export let isInputValid = false;
  export let isLoading = false;
  export let error = "";
  export const socialLoading: 'google' | 'facebook' | null = null;
  export let timer: number | null = null;
  export const confirmationResult: any = null;
  export let verifiedEmail = '';
  export let registrationComplete = false;
  
  // Common functions
  export function resetOTP() {
    otp = Array(6).fill('');
  }
  
  export function startCountdown() {
    countdown = 60;
    if (timer) window.clearInterval(timer);
    timer = window.setInterval(() => countdown -= 1, 1000);
  }
  
  onMount(() => {
    resetOTP();
    return () => {
      if (timer) window.clearInterval(timer);
    };
  });

  const dispatch = createEventDispatcher();

  $: if (activeTab === 'phone') {
    displayPhone = `${countryCode}${phone}`;
  }

  function handleSend() {
    dispatch('send');
  }

  function handleVerify() {
    dispatch('verify');
  }

  function handleResend() {
    dispatch('resend');
  }

  function handleClear() {
    dispatch('clear');
  }
</script>

<div class="w-full max-w-md">
  {#if !registrationComplete}
    {#if !otpSent && !showProfileForm}
      <div class="bg-white rounded-xl shadow-sm p-6">
        <h1 class="text-2xl font-bold text-center mb-6">{title}</h1>
        <slot name="pre-form" />
        
        <TabSelector bind:activeTab />
        
        {#if activeTab === 'email'}
          <EmailInputForm
            bind:email
            bind:error
            bind:isInputValid
            bind:isLoading
            on:send={handleSend}
          />
        {:else}
          <PhoneInputForm
            bind:phone
            bind:countryCode
            bind:displayPhone
            bind:error
            bind:isInputValid
            bind:isLoading
            on:send={handleSend}
          />
        {/if}
        
        <slot name="social-login" />
      </div>
    {:else if otpSent && !showProfileForm}
      <OTPVerification
      {otp}
      {isOtpComplete}
      {isLoading}
      {countdown}
      {error}
      {activeTab}
      {email}
      {displayPhone}
      {isWaitingForAuth}
      on:verify={handleVerify}
      on:clear={handleClear}
      on:resend={handleResend}
    />
    {:else}
      <slot name="profile-form" />
    {/if}
  {:else}
    <div class="bg-white rounded-xl shadow-sm p-6 text-center">
      <h2 class="text-2xl font-bold text-green-500 mb-4">Registration Complete!</h2>
      <p>Thank you for your registration</p>
      <p class="mt-4">Redirecting to {redirectUrl} page...</p>
    </div>
  {/if}
</div>