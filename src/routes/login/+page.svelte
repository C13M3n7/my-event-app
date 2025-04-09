<script lang="ts">
  import { 
    signInWithPhoneNumber,
    signInWithPopup,  // Add this import
    RecaptchaVerifier,
    GoogleAuthProvider,
    FacebookAuthProvider
  } from 'firebase/auth';
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { doc, getDoc } from 'firebase/firestore';
  import { auth, db } from '$lib/firebase';
  import { sendEmailOTP, verifyEmailOTP } from '$lib/auth/email-otp.service';

  // State management
  let emailOrPhone = '';
  let otp = Array(6).fill('');
  let activeTab: 'email' | 'phone' = 'email';
  let otpSent = false;
  let confirmationResult: any;
  let error = '';
  let countdown = 0;
  let isLoading = false;
  let countryCode = '+60';
  let displayPhone = '';

  // Country codes
  const countryCodes = [
    { value: '+60', label: 'Malaysia (+60)' },
    // ... other country codes
  ];

  // Providers
  const googleProvider = new GoogleAuthProvider();
  const facebookProvider = new FacebookAuthProvider();

  // Format phone number display
  $: {
    if (activeTab === 'phone') {
      const digits = emailOrPhone.replace(/\D/g, '');
      const withCountryCode = digits.startsWith(countryCode.replace(/\D/g, '')) 
        ? digits 
        : countryCode.replace(/\D/g, '') + digits;
      displayPhone = `+${withCountryCode}`;
    }
  }

  // Validation
  const isValidEmail = (email: string): boolean => /^\S+@\S+\.\S+$/.test(email);
  const isValidPhone = (phone: string): boolean => /^\+\d{10,15}$/.test(phone);
  
  $: isInputValid = activeTab === 'email' ? isValidEmail(emailOrPhone) : isValidPhone(displayPhone);

  onMount(() => {
    if (typeof window !== 'undefined') {
      window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
        size: 'invisible',
      });
    }
  });

  const goBack = () => {
    if (otpSent) {
      otpSent = false;
      otp = Array(6).fill('');
    } else {
      goto('/');
    }
  };

  const sendVerification = async () => {
    error = '';
    isLoading = true;
    
    try {
      const identifier = activeTab === 'email' ? emailOrPhone : displayPhone;
      
      // Check if user exists in users collection
      const userDoc = await getDoc(doc(db, 'users', identifier));
      if (!userDoc.exists()) {
        throw new Error('User not registered. Please sign up first.');
      }

      if (activeTab === 'phone') {
        confirmationResult = await signInWithPhoneNumber(
          auth,
          displayPhone,
          window.recaptchaVerifier
        );
      } else {
        await sendEmailOTP(emailOrPhone);
      }
      
      otpSent = true;
      startCountdown();
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
      const verificationCode = otp.join('');
      
      if (activeTab === 'phone') {
        await confirmationResult.confirm(verificationCode);
      } else {
        await verifyEmailOTP(emailOrPhone, verificationCode);
      }

      // Verify user exists again before proceeding
      const identifier = activeTab === 'email' ? emailOrPhone : displayPhone;
      const userDoc = await getDoc(doc(db, 'users', identifier));
      if (!userDoc.exists()) {
        await auth.signOut();
        throw new Error('User not registered');
      }

      // Redirect to homepage instead of userdashboard
      goto('/');
    } catch (err) {
      error = err.message || "Invalid code. Please try again.";
    } finally {
      isLoading = false;
    }
  };

  const clearOTP = () => {
    otp = Array(6).fill('');
  };

  const socialLogin = async (provider: GoogleAuthProvider | FacebookAuthProvider) => {
    isLoading = true;
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      
      // Verify user exists
      const userDoc = await getDoc(doc(db, 'users', user.email || user.phoneNumber || ''));
      if (!userDoc.exists()) {
        await auth.signOut();
        throw new Error('User not registered');
      }

      // Redirect to homepage instead of userdashboard
      goto('/');
    } catch (err) {
      error = err.message || "Login failed. Please try again.";
    } finally {
      isLoading = false;
    }
  };
  
  const startCountdown = () => {
    countdown = 30;
    const timer = setInterval(() => {
      countdown--;
      if (countdown <= 0) clearInterval(timer);
    }, 1000);
  };

  const resendCode = () => {
    sendVerification();
  };
</script>

<div class="min-h-screen flex items-center justify-center bg-gray-50 p-4">
  <div class="bg-white rounded-xl shadow-sm w-full max-w-md overflow-hidden relative">
    <!-- Back Button -->
    <button 
      on:click={goBack}
      class="absolute top-4 left-4 p-2 rounded-full hover:bg-gray-100"
      aria-label="Go back"
    >
      <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
      </svg>
    </button>

    {#if !otpSent}
      <!-- Initial Screen -->
      <div class="p-8">
        <h1 class="text-2xl font-bold text-center mb-6">Sign in to your account</h1>
        
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
          <div class="flex items-center mb-4">
            <select 
              bind:value={countryCode}
              class="w-1/3 p-3 border rounded-lg mr-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {#each countryCodes as code}
                <option value={code.value}>{code.label}</option>
              {/each}
            </select>
            <input
              type="tel"
              bind:value={emailOrPhone}
              on:input={(e) => {
                emailOrPhone = (e.target as HTMLInputElement).value.replace(/\D/g, '');
              }}
              placeholder="123456789"
              class="w-2/3 px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          {#if emailOrPhone && !isValidPhone(displayPhone)}
            <p class="text-red-500 text-sm mt-1">Please enter a valid phone number (10-15 digits after country code)</p>
          {/if}
          <p class="text-gray-500 text-sm mb-4">Full number: {displayPhone}</p>
        {:else}
          <input
            type="email"
            bind:value={emailOrPhone}
            placeholder="your@email.com"
            class="w-full px-4 py-3 border rounded-lg mb-4 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        {/if}

        <!-- Error Message -->
        {#if error}
          <div class="text-red-500 mb-4 text-sm">{error}</div>
        {/if}

        <!-- Continue Button -->
        <button
          on:click={sendVerification}
          disabled={!isInputValid || isLoading}
          class="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Sending...' : 'Continue'}
        </button>

        <!-- New User Link -->
        <p class="text-center mt-4 text-gray-600">
          New user? <a href="/register" class="text-blue-600 hover:underline">Sign up here</a>
        </p>

        <!-- Social Login Divider -->
        <div class="flex items-center my-6">
          <div class="flex-1 border-t border-gray-200"></div>
          <span class="px-4 text-gray-500 text-sm">or</span>
          <div class="flex-1 border-t border-gray-200"></div>
        </div>

        <!-- Social Buttons -->
        <div class="flex justify-center gap-4 mb-6">
          <button 
            on:click={() => socialLogin(googleProvider)}
            disabled={isLoading}
            class="p-3 rounded-full border hover:bg-gray-50 disabled:opacity-50"
            aria-label="Sign in with Google"
          >
            <svg class="w-6 h-6" viewBox="0 0 24 24">
              <path d="M12.545 10.239v3.821h5.445c-0.712 2.315-2.647 3.972-5.445 3.972-3.332 0-6.033-2.701-6.033-6.032s2.701-6.032 6.033-6.032c1.498 0 2.866 0.549 3.921 1.453l2.814-2.814c-1.784-1.664-4.153-2.675-6.735-2.675-5.522 0-10 4.479-10 10s4.478 10 10 10c8.396 0 10-7.524 10-10 0-0.668-0.069-1.325-0.189-1.961h-9.811z" fill="currentColor"/>
            </svg>
          </button>
          <button 
            on:click={() => socialLogin(facebookProvider)}
            disabled={isLoading}
            class="p-3 rounded-full border hover:bg-gray-50 disabled:opacity-50"
            aria-label="Sign in with Facebook"
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
            : 'Enter the code sent to ' + emailOrPhone}
        </h1>

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
                    <br>The code doesn't match. Please try again.
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
          {isLoading ? 'Verifying...' : 'Sign In'}
        </button>

        <!-- Resend Button -->
        {#if countdown > 0}
          <p class="text-center text-gray-600">Resend code in {countdown} seconds</p>
        {:else}
          <button 
            on:click={resendCode} 
            disabled={isLoading}
            class="text-center text-blue-600 w-full hover:underline disabled:opacity-50"
          >
            Resend code
          </button>
        {/if}
      </div>
    {/if}
  </div>
</div>

<!-- Hidden recaptcha container -->
<div id="recaptcha-container"></div>