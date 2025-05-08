<script lang="ts">
  import { onMount } from 'svelte';
  import RegistrationFlow from './shared/RegistrationFlow.svelte';
  import SocialButtons from './shared/SocialButtons.svelte';
  import { auth, googleProvider, facebookProvider } from '$lib/firebase';
  import { signInWithPopup } from 'firebase/auth';
  import { doc, setDoc } from 'firebase/firestore';
  import { db } from '$lib/firebase';
  import { goto } from '$app/navigation';
  import { 
    sendPhoneVerification, 
    verifyPhoneOTP, 
    sendEmailOTP,
    verifyEmailOTP 
  } from '../services/authService';

  // State variables
  let activeTab: 'email' | 'phone' = 'email';
  let otpSent = false;
  let email = '';
  let phone = '';
  let countryCode = '+60';
  let displayPhone = '';
  let otp: string[] = Array(6).fill('');
  let isOtpComplete = false;
  let isWaitingForAuth = false;
  let countdown = 60;
  let isInputValid = false;
  let isLoading = false;
  let error = "";
  let socialLoading: 'google' | 'facebook' | null = null;
  let timer: number | null = null;
  let confirmationResult: any = null;
  let registrationComplete = false;
  let showSuccessMessage = false;

  const registrationFlowParams = {
    title: 'Event Registration',
    redirectUrl: 'events',
    programType: 'EVENT_REGISTRATION' as const, // Add 'as const' to ensure type inference
    showProfileForm: false
  };

const verifyOTP = async () => {
  try {
    const fullOtp = otp.join('');
    const normalizedEmail = email.trim().toLowerCase();

    const result = await verifyEmailOTP(normalizedEmail, fullOtp, 'REGISTRATION');
    const { token, uid } = result;

    const userRef = doc(db, 'users', uid);
    await setDoc(userRef, {
      email: normalizedEmail,
      type: 'EVENT_REGISTRATION',
      authMethod: 'EMAIL',
      createdAt: new Date().toISOString(),
      verified: true,
      admin: false
    }, { merge: true });

    const indexRef = doc(db, 'emailToUid', normalizedEmail);
    await setDoc(indexRef, {
      uid,
      updatedAt: new Date().toISOString()
    });

    showSuccessMessage = true;
    setTimeout(() => goto('/events'), 2000);

  } catch (err: any) {
    if (err?.code === 'permission-denied') {
      error = 'This email belongs to an admin. Please use the admin portal to log in.';
    } else {
      error = err instanceof Error ? err.message : 'Verification failed';
    }
    otp = Array(6).fill('');
  } finally {
    isWaitingForAuth = false;
  }
};

  const sendVerification = async () => {
    error = "";
    isLoading = true;

    try {
      if (activeTab === 'phone') {
        displayPhone = `${countryCode}${phone}`;
        confirmationResult = await sendPhoneVerification(displayPhone);
      } else if (activeTab === 'email') {
        await sendEmailOTP(email, 'REGISTRATION');
      }

      otpSent = true;
      startCountdown();
    } catch (err: unknown) {
      error = err instanceof Error ? err.message : 'Failed to send verification';
      console.error('Send verification error:', err);
    } finally {
      isLoading = false;
    }
  };

  function resetOTP() {
    otp = Array(6).fill('');
  }

  // Update startCountdown to:
  function startCountdown() {
    countdown = 60;
    if (timer) window.clearInterval(timer);
    timer = window.setInterval(() => countdown -= 1, 1000);
  }

  async function resendCode() {
    await sendVerification();
    resetOTP();
  }

  function clearOTP() {
    resetOTP();
    error = '';
  }

  // Update onMount cleanup to:
  onMount(() => {
    resetOTP();
    return () => {
      if (timer) window.clearInterval(timer);
    };
  });
  
  const handleSocialLogin = async (provider: 'google' | 'facebook') => {
  try {
    socialLoading = provider;
    error = "";
    const result = await signInWithPopup(
      auth, 
      provider === 'google' ? googleProvider : facebookProvider
    );
    
    const userEmail = result.user?.email;
    if (!userEmail) throw new Error('No email found from social login');
    
    // Create user record for event registration
    const userRef = doc(db, 'users', result.user.uid); // Use uid from result.user

    await setDoc(userRef, {
      email: userEmail,
      type: 'EVENT_REGISTRATION',
      authMethod: provider.toUpperCase(),
      createdAt: new Date().toISOString(),
      verified: true
    }, { merge: true });
    
    console.log(`${provider} login success`, result.user);
    showSuccessMessage = true;
    setTimeout(() => goto('/events'), 2000);
  } catch (err: unknown) {
    error = err instanceof Error ? err.message : 'Login failed';
    console.error(`${provider} login error`, err);
  } finally {
    socialLoading = null;
  }
};
</script>

<RegistrationFlow 
  {...registrationFlowParams}
  on:send={sendVerification}
  on:verify={verifyOTP}  
  on:resend={resendCode}
  on:clear={clearOTP}
  bind:activeTab
  bind:otp
  bind:email
  bind:phone
  bind:countryCode
  bind:displayPhone
  bind:otpSent
  bind:error
  bind:isLoading
  bind:isInputValid
  bind:countdown
  bind:isWaitingForAuth
>
  <div slot="social-login">
    <SocialButtons 
      on:login={({ detail: { provider } }) => handleSocialLogin(provider)}
    />
  </div>
</RegistrationFlow>

{#if showSuccessMessage}
  <div class="fixed inset-0 bg-white bg-opacity-30 flex items-center justify-center z-50 p-4">
    <div class="bg-white rounded-lg shadow-xl p-6 text-center max-w-md w-full mx-4">
      <svg class="w-16 h-16 text-green-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
      </svg>
      <h2 class="text-2xl font-bold text-gray-800 mb-3">Registration Complete!</h2>
      <p class="text-gray-600 mb-4">Thank you for registering for our event</p>
      <div class="w-full bg-gray-200 rounded-full h-2.5">
        <div class="bg-green-500 h-2.5 rounded-full animate-pulse" style="width: 100%"></div>
      </div>
      <p class="text-sm text-gray-500 mt-2">Redirecting to events page...</p>
    </div>
  </div>
{/if}