<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  export let otp: string[];
  export let isOtpComplete = false;
  export let isLoading = false;
  export let countdown = 0;
  export let error: string = "";
  export let activeTab: 'email' | 'phone';
  export let email = '';
  export let displayPhone = '';
  export let isWaitingForAuth = false;
  export let expirationTime: string = ""; // New property for expiration time (in UTC)
  
  const dispatch = createEventDispatcher();
  $: isOtpComplete = otp.every(digit => digit !== '') && otp.length === 6;

  // Calculate the countdown from the expiration time
  let countdownInterval: NodeJS.Timeout;

  $: {
    if (expirationTime) {
      const expirationDate = new Date(expirationTime); // Convert UTC to local time
      countdownInterval = setInterval(() => {
        const now = new Date();
        countdown = Math.max(Math.floor((expirationDate.getTime() - now.getTime()) / 1000), 0);
      }, 1000);
    }
  }

  // Cleanup interval when the component is destroyed
  import { onDestroy } from 'svelte';
  onDestroy(() => {
    if (countdownInterval) {
      clearInterval(countdownInterval);
    }
  });
  
  // Update handleInput to handle backspace
  const handleInput = (e: Event, i: number) => {
    const val = (e.target as HTMLInputElement).value.replace(/\D/g, '');
    otp[i] = val;
    
    if (val && i < 5) {
      (document.querySelector(`input:nth-child(${i + 2})`) as HTMLInputElement)?.focus();
    } else if (!val && i > 0) {
      (document.querySelector(`input:nth-child(${i})`) as HTMLInputElement)?.focus();
    }
  };

  let isShaking = false;

  const handlePaste = (e: ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData?.getData('text') || '';
    const digits = pasted.replace(/\D/g, '').slice(0, 6).split('');

    digits.forEach((digit, idx) => {
      otp[idx] = digit;
    });

    const nextIndex = digits.length < 6 ? digits.length : 5;
    (document.querySelector(`input:nth-child(${nextIndex + 1})`) as HTMLInputElement)?.focus();

    // Trigger shake animation
    isShaking = true;
    setTimeout(() => {
      isShaking = false;
    }, 400); // match animation duration
  };

  </script>
  
  <h1 class="text-2xl font-bold text-center mb-6">
    {activeTab === 'phone' ? `Enter code sent to ${displayPhone}` : `We sent a code to ${email}`}
  </h1>
  
  {#if isWaitingForAuth && activeTab === 'email'}
    <div class="mb-4 text-center text-blue-600">Checking verification status...</div>
  {/if}
  
  <div class="flex gap-2 justify-center mb-4 {isShaking ? 'shake' : ''}">
    {#each otp as _, i}
      <input
        type="text"
        maxlength="1"
        value={otp[i]}
        on:input={(e) => handleInput(e, i)}
        on:keydown={(e) => e.key === 'Backspace' && !otp[i] && i > 0 && (document.querySelector(`input:nth-child(${i})`) as HTMLInputElement)?.focus()}
        class="w-12 h-12 text-center border rounded-lg"
        on:paste={i === 0 ? handlePaste : null}
      />
    {/each}
  </div>  
  
  <button on:click={() => dispatch('clear')} class="text-sm text-blue-600">Clear code</button>
  
  {#if error}
    <div class="text-red-500 text-sm my-4">{error}</div>
  {/if}
  
  <button
    on:click={() => dispatch('verify')}
    disabled={!isOtpComplete || isLoading}
    class="w-full bg-blue-600 text-white py-3 rounded-lg mb-4"
  >
    {isLoading ? 'Verifying...' : 'Complete Registration'}
  </button>
  
  {#if countdown > 0}
    <p class="text-center text-gray-600">Resend code in {Math.floor(countdown / 60)}m {countdown % 60}s</p>
  {:else}
    <button on:click={() => dispatch('resend')} class="text-blue-600 w-full">Resend code</button>
  {/if}  

  <style>
    .shake {
      animation: shake 0.4s ease-in-out;
    }
  
    @keyframes shake {
      0% { transform: translateX(0); }
      20% { transform: translateX(-4px); }
      40% { transform: translateX(4px); }
      60% { transform: translateX(-3px); }
      80% { transform: translateX(3px); }
      100% { transform: translateX(0); }
    }
  </style>