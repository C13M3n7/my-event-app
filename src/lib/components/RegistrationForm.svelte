<script lang="ts">
  import { formatPhoneNumber, isValidEmail, isValidPhone, startCountdown } from '$lib/auth/helpers';
  import { initializeRecaptcha, sendPhoneVerification, verifyPhoneOTP, socialRegister, createUserRecord } from '$lib/auth/authentication.service';
  import { sendEmailOTP, verifyEmailOTP } from '$lib/auth/email-otp.service';
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';

  export let title = "Registration";
  export let userType: 'event' | 'loyalty' = 'event';
  export let successRedirect = '/dashboard';

  // State management
  let email = '';
  let phone = '';
  let otp = Array(6).fill('');
  let activeTab: 'email' | 'phone' = 'email';
  let otpSent = false;
  let confirmationResult: any;
  let error = '';
  let countdown = 0;
  let isLoading = false;
  let countryCode = '+60';
  let displayPhone = '';

  // Format phone number display
  $: {
    if (activeTab === 'phone') {
      displayPhone = formatPhoneNumber(phone, countryCode);
    }
  }

  // Validation
  $: isInputValid = activeTab === 'email' ? isValidEmail(email) : isValidPhone(displayPhone);

  onMount(() => {
    initializeRecaptcha();
  });

  const sendVerification = async () => {
    error = '';
    isLoading = true;
    try {
      if (activeTab === 'phone') {
        confirmationResult = await sendPhoneVerification(displayPhone);
      } else {
        await sendEmailOTP(email);
      }
      otpSent = true;
      startCountdown(30, (count) => countdown = count);
    } catch (err) {
      error = err.message || 'Failed to send verification';
    } finally {
      isLoading = false;
    }
  };

  const verifyOTP = async () => {
      error = '';
      isLoading = true;
      try {
          console.log('Starting verification for:', activeTab === 'email' ? email : displayPhone);
          
          if (activeTab === 'phone') {
              console.log('Verifying phone OTP...');
              await verifyPhoneOTP(confirmationResult, otp.join(''));
          } else {
              console.log('Verifying email OTP...');
              await verifyEmailOTP(email, otp.join(''));
          }
          
          console.log('Creating user record...');
          await createUserRecord(
              activeTab === 'email' ? email : displayPhone,
              activeTab === 'email' ? { email } : { phone: displayPhone },
              userType
          );

          console.log('Verification successful!');
          goto(successRedirect);
      } catch (err) {
          console.error('Verification error:', err);
          error = err.message || "Verification failed. Please try again.";
      } finally {
          isLoading = false;
      }
  };

  const handleSocialRegister = async (provider: 'google' | 'facebook') => {
    isLoading = true;
    try {
      const result = await socialRegister(provider);
      const user = result.user;
      
      await createUserRecord(
        user.uid,
        {
          email: user.email,
          name: user.displayName
        },
        userType
      );

      goto(successRedirect);
    } catch (err) {
      error = err.message || "Registration failed. Please try again.";
    } finally {
      isLoading = false;
    }
  };

  const resendCode = () => {
    sendVerification();
  };

  const clearOTP = () => {
    otp = Array(6).fill('');
  };
</script>

<div class="min-h-screen flex items-center justify-center bg-gray-50 p-4">
  <div class="bg-white rounded-xl shadow-sm w-full max-w-md overflow-hidden relative">
    {#if !otpSent}
      <!-- Registration Form -->
      <div class="p-8">
        <h1 class="text-2xl font-bold text-center mb-6">{title}</h1>
        
        <!-- Email/Phone Tabs -->
        <div class="flex border-b mb-6">
          <button
            class={`flex-1 py-3 font-medium ${activeTab === 'email' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}
            on:click={() => activeTab = 'email'}
          >
            Email
          </button>
          <button
            class={`flex-1 py-3 font-medium ${activeTab === 'phone' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}
            on:click={() => activeTab = 'phone'}
          >
            Phone
          </button>
        </div>

        <!-- Input Field -->
        {#if activeTab === 'phone'}
        <div class="mb-4">
          <label class="block mb-2" for="phone">Phone Number</label>
          <input
            id="phone"
            type="tel"
            bind:value={phone}
            placeholder="+60123456789"
            class="w-full px-4 py-3 border rounded-lg mb-2"
          />
          <p class="text-gray-500 text-sm">Full number: {displayPhone}</p>
        </div>
        
        {:else}
        <div class="mb-4">
          <label class="block mb-2" for="email">Email</label>
          <input
            id="email"
            type="email"
            bind:value={email}
            placeholder="your@email.com"
            class="w-full px-4 py-3 border rounded-lg mb-4"
          />
        </div>
        
        {/if}

        <!-- Error Message -->
        {#if error}
          <div class="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
            <div class="flex">
              <div class="flex-shrink-0">
                <svg class="h-5 w-5 text-red-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
                </svg>
              </div>
              <div class="ml-3">
                <p class="text-sm text-red-700">
                  {error}
                  {#if activeTab === 'phone' && error.includes('invalid')}
                    <br>Please check the SMS and enter the exact 6-digit code.
                  {:else if activeTab === 'email' && error.includes('invalid')}
                    <br>Make sure you entered the correct code from your email.
                  {/if}
                </p>
              </div>
            </div>
          </div>
        {/if}

        <!-- Continue Button -->
        <button
          on:click={sendVerification}
          disabled={!isInputValid || isLoading}
          class="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed mb-6"
        >
          {isLoading ? 'Sending...' : 'Send Verification'}
        </button>

        <!-- Social Login Divider -->
        <div class="flex items-center my-6">
          <div class="flex-1 border-t border-gray-200"></div>
          <span class="px-4 text-gray-500 text-sm">or</span>
          <div class="flex-1 border-t border-gray-200"></div>
        </div>

        <!-- Social Buttons -->
        <div class="flex justify-center gap-4">
          <button 
            on:click={() => handleSocialRegister('google')}
            disabled={isLoading}
            class="p-3 rounded-full border hover:bg-gray-50 disabled:opacity-50"
            aria-label="Register with Google"
          >
            <svg class="w-6 h-6" viewBox="0 0 24 24">
              <path d="M12.545 10.239v3.821h5.445c-0.712 2.315-2.647 3.972-5.445 3.972-3.332 0-6.033-2.701-6.033-6.032s2.701-6.032 6.033-6.032c1.498 0 2.866 0.549 3.921 1.453l2.814-2.814c-1.784-1.664-4.153-2.675-6.735-2.675-5.522 0-10 4.479-10 10s4.478 10 10 10c8.396 0 10-7.524 10-10 0-0.668-0.069-1.325-0.189-1.961h-9.811z" fill="currentColor"/>
            </svg>
          </button>
          <button 
            on:click={() => handleSocialRegister('facebook')}
            disabled={isLoading}
            class="p-3 rounded-full border hover:bg-gray-50 disabled:opacity-50"
            aria-label="Register with Facebook"
          >
            <svg class="w-6 h-6" viewBox="0 0 24 24">
              <path d="M22.675 0h-21.35c-.732 0-1.325.593-1.325 1.325v21.351c0 .731.593 1.324 1.325 1.324h11.495v-9.294h-3.128v-3.622h3.128v-2.671c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.795.143v3.24l-1.918.001c-1.504 0-1.795.715-1.795 1.763v2.313h3.587l-.467 3.622h-3.12v9.293h6.116c.73 0 1.323-.593 1.323-1.325v-21.35c0-.732-.593-1.325-1.325-1.325z" fill="currentColor"/>
            </svg>
          </button>
        </div>
      </div>
    {:else}
      <!-- OTP Verification Screen -->
      <div class="p-8">
        <h1 class="text-2xl font-bold text-center mb-6">
          {activeTab === 'phone' 
            ? 'Enter the code sent to ' + displayPhone
            : 'We sent a 6-digit code to ' + email}
        </h1>

        {#if activeTab === 'phone'}
          <!-- Phone OTP Input -->
          <div class="mb-4">
            <div class="flex gap-2 justify-center mb-2">
              {#each otp as digit, i}
                <input
                  type="text"
                  maxlength="1"
                  bind:value={otp[i]}
                  class="w-12 h-12 text-center text-lg border rounded-lg focus:ring-2 focus:ring-blue-500"
                  on:input={(e) => {
                    const target = e.target as HTMLInputElement;
                    const value = target.value.replace(/\D/g, '');
                    if (value && i < 5) {
                      (document.querySelector(`input:nth-child(${i + 2})`) as HTMLInputElement)?.focus();
                    }
                  }}
                />
              {/each}
            </div>
            <button 
              on:click={clearOTP}
              class="text-sm text-blue-600 hover:underline"
            >
              Clear code
            </button>
          </div>
          
          <!-- Error Message -->
          {#if error}
            <div class="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
              <div class="flex">
                <div class="flex-shrink-0">
                  <svg class="h-5 w-5 text-red-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
                  </svg>
                </div>
                <div class="ml-3">
                  <p class="text-sm text-red-700">
                    {error}
                    {#if error.includes('invalid')}
                      <br>The code doesn't match. Please check your SMS.
                    {:else if error.includes('expired')}
                      <br>This code has expired. Please request a new one.
                    {/if}
                  </p>
                </div>
              </div>
            </div>
          {/if}
          
          <button
            on:click={verifyOTP}
            disabled={otp.some(digit => !digit) || isLoading}
            class="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed mb-4"
          >
            {isLoading ? 'Verifying...' : 'Complete Registration'}
          </button>
        {:else}
          <!-- Email OTP Section -->
          <div class="bg-blue-50 p-4 rounded-lg mb-6">
            <p class="text-blue-800 text-center">
              Please check your inbox and enter the 6-digit code below.
            </p>
            {#if countdown > 0}
              <p class="text-center text-blue-800 mt-2">
                You can request a new code in {countdown} seconds
              </p>
            {/if}
          </div>

          <!-- OTP Input -->
          <div class="mb-4">
            <div class="flex gap-2 justify-center mb-2">
              {#each otp as digit, i}
                <input
                  type="text"
                  maxlength="1"
                  bind:value={otp[i]}
                  class="w-12 h-12 text-center text-lg border rounded-lg focus:ring-2 focus:ring-blue-500"
                  on:input={(e) => {
                    const target = e.target as HTMLInputElement;
                    const value = target.value.replace(/\D/g, '');
                    if (value && i < 5) {
                      (document.querySelector(`input:nth-child(${i + 2})`) as HTMLInputElement)?.focus();
                    }
                  }}
                />
              {/each}
            </div>
            <button 
              on:click={clearOTP}
              class="text-sm text-blue-600 hover:underline"
            >
              Clear code
            </button>
          </div>
          
          <!-- Error Message -->
          {#if error}
            <div class="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
              <div class="flex">
                <div class="flex-shrink-0">
                  <svg class="h-5 w-5 text-red-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
                  </svg>
                </div>
                <div class="ml-3">
                  <p class="text-sm text-red-700">
                    {error}
                    {#if error.includes('invalid')}
                      <br>The code doesn't match. Please check your email.
                    {:else if error.includes('expired')}
                      <br>This code has expired. Please request a new one.
                    {:else if error.includes('not found')}
                      <br>No code found. Please request a new verification code.
                    {/if}
                  </p>
                </div>
              </div>
            </div>
          {/if}
          
          <button
            on:click={verifyOTP}
            disabled={otp.some(digit => !digit) || isLoading}
            class="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed mb-4"
          >
            {isLoading ? 'Verifying...' : 'Complete Registration'}
          </button>
        {/if}
      </div>
    {/if}
  </div>
</div>

<!-- Hidden recaptcha container -->
<div id="recaptcha-container"></div>