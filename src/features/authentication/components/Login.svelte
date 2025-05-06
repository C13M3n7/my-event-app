<script lang="ts">
  import { onMount } from 'svelte';
  import { auth, googleProvider, facebookProvider } from '$lib/firebase';
  import { signInWithPopup } from 'firebase/auth';
  import { doc, getDoc, setDoc } from 'firebase/firestore';
  import { db } from '$lib/firebase';
  import { goto } from '$app/navigation';
  import { sendEmailOTP, verifyEmailOTP } from '../services/authService';
  import SocialButtons from './shared/SocialButtons.svelte';
  import TabSelector from './shared/TabSelector.svelte';
  import EmailInputForm from './shared/EmailInputForm.svelte';
  import PhoneInputForm from './shared/PhoneInputForm.svelte';
  import OTPVerification from './shared/OTPVerification.svelte';

  // State variables
  let activeTab: 'email' | 'phone' = 'email';
  let email = '';
  let phone = '';
  let countryCode = '+60';
  let displayPhone = '';
  let otp: string[] = Array(6).fill('');
  let otpSent = false;
  let isLoading = false;
  let socialLoading: 'google' | 'facebook' | null = null;
  let showSuccessMessage = false;
  let isInputValid = false;
  let formError = "";
  let socialError = "";
  let countdown = 60;
  let timer: number | null = null;
  let expirationTime = "";

  $: {
    if (activeTab === 'email') {
      isInputValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    } else {
      isInputValid = phone.length > 7 && /^\d+$/.test(phone);
    }
  }

  const determineRedirectPath = (email: string) => {
    const normalizedEmail = email.toLowerCase();
    if (normalizedEmail === 'jaynewhs224@gmail.com') return '/vendor-dashboard';
    if (normalizedEmail === 'liuyuexin2004@gmail.com') return '/admin-dashboard';
    return '/events';
  };

  const startCountdown = () => {
    countdown = 60;
    if (timer) window.clearInterval(timer);
    timer = window.setInterval(() => countdown -= 1, 1000);
    
    // Set expiration time (10 minutes from now)
    const now = new Date();
    now.setMinutes(now.getMinutes() + 10);
    expirationTime = now.toISOString();
  };

  const sendOTP = async () => {
    formError = '';
    isLoading = true;

    try {
      if (activeTab === 'email') {
        await sendEmailOTP(email, 'LOGIN');
        otpSent = true;
        startCountdown();
      } else {
        throw new Error('Phone login not implemented');
      }
    } catch (err) {
      formError = err instanceof Error ? err.message : 'Failed to send OTP';
    } finally {
      isLoading = false;
    }
  };

  const verifyOTP = async () => {
    formError = '';
    isLoading = true;

    try {
      const fullOtp = otp.join('');
      if (fullOtp.length !== 6) {
        throw new Error('Please enter complete OTP');
      }

      await verifyEmailOTP(email, fullOtp, 'LOGIN');
      const redirectPath = determineRedirectPath(email);
      showSuccessMessage = true;
      setTimeout(() => goto(redirectPath), 2000);
    } catch (err) {
      formError = err instanceof Error ? err.message : 'OTP verification failed';
    } finally {
      isLoading = false;
    }
  };

  const handleSocialLogin = async (provider: 'google' | 'facebook') => {
    try {
      socialLoading = provider;
      socialError = "";
      const result = await signInWithPopup(
        auth, 
        provider === 'google' ? googleProvider : facebookProvider
      );
      
      const userEmail = result.user?.email?.toLowerCase();
      if (!userEmail) throw new Error('No email found from social login');
      
      // Create user record
      const userRef = doc(db, 'users', userEmail);
      await setDoc(userRef, {
        email: userEmail,
        type: 'EVENT_REGISTRATION',
        authMethod: provider.toUpperCase(),
        createdAt: new Date().toISOString(),
        verified: true
      }, { merge: true });
      
      const redirectPath = determineRedirectPath(userEmail);
      showSuccessMessage = true;
      setTimeout(() => goto(redirectPath), 2000);

    } catch (err) {
      socialError = err instanceof Error ? err.message : 'Social login failed';
      console.error(`${provider} login error`, err);
    } finally {
      socialLoading = null;
    }
  };

  const resendOTP = async () => {
    await sendOTP();
    otp = Array(6).fill('');
  };

  const clearOTP = () => {
    otp = Array(6).fill('');
    formError = '';
    otpSent = false;
  };

  onMount(() => {
    return () => {
      if (timer) window.clearInterval(timer);
    };
  });
</script>

<div class="p-6 bg-white rounded-lg shadow-sm max-w-md mx-auto">
  <h2 class="text-xl font-bold mb-6 text-center">Login</h2>
  
  {#if !otpSent}
    <TabSelector bind:activeTab />
  {/if}
  
  {#if activeTab === 'email'}
    {#if !otpSent}
      <EmailInputForm 
        bind:email
        error={formError}
        isInputValid={isInputValid}
        isLoading={isLoading}
        on:send={sendOTP}
      />
    {:else}
      <OTPVerification
        bind:otp
        activeTab={activeTab}
        email={email}
        displayPhone={displayPhone}
        countdown={countdown}
        expirationTime={expirationTime}
        error={formError}
        isLoading={isLoading}
        on:verify={verifyOTP}
        on:resend={resendOTP}
        on:clear={clearOTP}
      />
    {/if}
  {:else}
    <PhoneInputForm 
      bind:phone
      bind:countryCode
      error={formError}
      bind:displayPhone
      isInputValid={isInputValid}
      isLoading={isLoading}
      on:send={sendOTP}
    />
  {/if}

  {#if !otpSent}
    <div class="text-center mt-4 text-sm">
      <span class="text-gray-600">Not registered yet?</span>
      <a href="/auth/register" class="text-blue-600 hover:text-blue-800 ml-1 font-medium">Sign up here</a>
    </div>

    <div class="mt-6">
      <SocialButtons 
        {socialLoading}
        error={socialError}
        on:login={({ detail: { provider } }) => handleSocialLogin(provider)}
      />
    </div>
  {/if}
</div>

{#if showSuccessMessage}
<div class="fixed inset-0 bg-white bg-opacity-30 flex items-center justify-center z-50 p-4">
  <div class="bg-white rounded-lg shadow-xl p-6 text-center max-w-md w-full mx-4">
    <svg class="w-16 h-16 text-green-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
    </svg>
    <h2 class="text-2xl font-bold text-gray-800 mb-3">Login Successful!</h2>
    <p class="text-gray-600 mb-4">Redirecting you to your dashboard...</p>
    <div class="w-full bg-gray-200 rounded-full h-2.5">
      <div class="bg-green-500 h-2.5 rounded-full animate-pulse" style="width: 100%"></div>
    </div>
  </div>
</div>
{/if}