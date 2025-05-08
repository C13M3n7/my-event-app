<script lang="ts">
  import { createEventDispatcher, onDestroy } from 'svelte';
  export let otp: string[];
  export let isOtpComplete = false;
  export let isLoading = false;
  export let countdown = 0;
  export let error: string = "";
  export let activeTab: 'email' | 'phone';
  export let email = '';
  export let displayPhone = '';
  export let isWaitingForAuth = false;
  export let expirationTime: string = "";
  
  const dispatch = createEventDispatcher();
  $: isOtpComplete = otp.every(digit => digit !== '') && otp.length === 6;

  // Countdown timer
  let countdownInterval: NodeJS.Timeout;
  $: {
    if (expirationTime) {
      clearInterval(countdownInterval);
      const expirationDate = new Date(expirationTime);
      countdownInterval = setInterval(() => {
        const now = new Date();
        countdown = Math.max(Math.floor((expirationDate.getTime() - now.getTime()) / 1000), 0);
      }, 1000);
    }
  }
  onDestroy(() => clearInterval(countdownInterval));
  
  // Enhanced input handling
  const handleInput = (e: Event, i: number) => {
    const val = (e.target as HTMLInputElement).value.replace(/\D/g, '');
    otp[i] = val ? val[0] : ''; // Take only first digit
    
    // Auto-focus next input if digit entered
    if (val && i < 5) {
      const nextInput = document.querySelector(`input:nth-child(${i + 2})`) as HTMLInputElement;
      nextInput?.focus();
      nextInput?.select();
    }
    
    // Auto-submit if pasted complete code
    if (isOtpComplete) {
      (e.target as HTMLInputElement).blur();
      dispatch('verify');
    }
  };

  // Enhanced backspace handling
  const handleKeyDown = (e: KeyboardEvent, i: number) => {
    if (e.key === 'Backspace' && !otp[i] && i > 0) {
      const prevInput = document.querySelector(`input:nth-child(${i})`) as HTMLInputElement;
      prevInput?.focus();
      prevInput?.select();
    }
  };

  // Enhanced paste handling (works from any input)
  const handlePaste = (e: ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData?.getData('text') || '';
    const digits = pasted.replace(/\D/g, '').slice(0, 6).split('');
    
    digits.forEach((digit, idx) => {
      if (idx < 6) otp[idx] = digit;
    });
    
    // Focus the last filled input
    const lastFilledIndex = Math.min(digits.length - 1, 5);
    const lastInput = document.querySelector(`input:nth-child(${lastFilledIndex + 1})`) as HTMLInputElement;
    lastInput?.focus();
    
    // Auto-submit if complete code pasted
    if (digits.length === 6) {
      lastInput?.blur();
      dispatch('verify');
    }
  };

  let isShaking = false;
  const triggerShake = () => {
    isShaking = true;
    setTimeout(() => isShaking = false, 400);
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
      inputmode="numeric"      
      pattern="\d*"           
      maxlength="1"
      value={otp[i]}
      on:input={(e) => handleInput(e, i)}
      on:keydown={(e) => handleKeyDown(e, i)}
      on:paste={handlePaste}    
      class="w-12 h-12 text-center border rounded-lg text-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      autocomplete="one-time-code"
    />
  {/each}
</div>  

<button on:click={() => dispatch('clear')} class="text-sm text-blue-600 mb-4">
  Clear code
</button>

{#if error}
  <div class="text-red-500 text-sm my-2 text-center">{error}</div>
{/if}

<button
  on:click={() => dispatch('verify')}
  disabled={!isOtpComplete || isLoading}
  class="w-full bg-blue-600 text-white py-3 rounded-lg mb-4 disabled:opacity-50"
>
  {isLoading ? 'Verifying...' : 'Complete Registration'}
</button>

{#if countdown > 0}
  <p class="text-center text-gray-600 mb-2">
    Resend code in {Math.floor(countdown / 60)}m {countdown % 60}s
  </p>
{:else}
  <button 
    on:click={() => dispatch('resend')} 
    class="text-blue-600 w-full py-2"
  >
    Resend code
  </button>
{/if}

<style>
  .shake {
    animation: shake 0.4s ease-in-out;
  }
  @keyframes shake {
    0%, 100% { transform: translateX(0); }
    20%, 60% { transform: translateX(-4px); }
    40%, 80% { transform: translateX(4px); }
  }
</style>