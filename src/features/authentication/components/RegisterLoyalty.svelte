<script lang="ts">
  import { onMount } from 'svelte';
  import RegistrationFlow from './shared/RegistrationFlow.svelte';
  import SocialButtons from './shared/SocialButtons.svelte';
  import LoyaltyProfileForm from './LoyaltyProfileForm.svelte';
  import { auth, googleProvider, facebookProvider } from '$lib/firebase';
  import { signInWithPopup } from 'firebase/auth';
  import { doc, getDoc } from 'firebase/firestore';
  import { db } from '$lib/firebase';
  import { 
    sendPhoneVerification, 
    verifyPhoneOTP, 
    sendEmailOTP,
    verifyEmailOTP,
    saveLoyaltyProfile
  } from '../services/authService';
  import { goto } from '$app/navigation';

  // State variables
  let activeTab: 'email' | 'phone' = 'email';
  let otpSent = false;
  let email = '';
  let phone = '';
  let countryCode = '+60';
  let displayPhone = '';
  let otp: string[] = [];
  let isOtpComplete = false;
  let isWaitingForAuth = false;
  let countdown = 60;
  let isInputValid = false;
  let isLoading = false;
  let error = "";
  let socialLoading: 'google' | 'facebook' | null = null;
  let timer: number | null = null;
  let confirmationResult: any = null;
  let verifiedEmail = '';
  let showProfileForm = false;
  let profileComplete = false;
  let registrationComplete = false;
  let showSuccessMessage = false; // New state variable

  const registrationFlowParams = {
    title: 'Loyalty Program Registration',
    redirectUrl: 'loyalty',
    programType: 'LOYALTY_PROGRAM' as const,
    showProfileForm
  };


  const verifyOTP = async () => {
    isWaitingForAuth = true;
    error = '';
    
    try {
      const fullOtp = otp.join('');
      if (fullOtp.length !== 6) {
        error = 'Please enter complete OTP';
        return;
      }

      await verifyEmailOTP(email, fullOtp, 'LOYALTY_PROGRAM');
      verifiedEmail = email;
      showProfileForm = true;
    } catch (err: unknown) {
      error = err instanceof Error ? err.message : 'Verification failed';
      otp = Array(6).fill('');
    } finally {
      isWaitingForAuth = false;
    }
  };

  const handleProfileSubmit = async (event: { detail: any }) => {
    try {
      isLoading = true;
      error = "";
      
      // Save profile
      await saveLoyaltyProfile(verifiedEmail, {
        ...event.detail,
        email: verifiedEmail // Ensure email is included
      });
      
      // Show success and redirect
      showSuccessMessage = true;
      setTimeout(() => goto('/loyalty'), 2000);
      
    } catch (err: unknown) {
      error = err instanceof Error ? err.message : 'Failed to save profile';
      console.error('Profile submission error:', error);
    } finally {
      isLoading = false;
    }
  };


  // Modified handleSocialLogin function
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
      
      const userRef = doc(db, 'users', userEmail);
      const userDoc = await getDoc(userRef);
      
      // Always show profile form if userDoc doesn't exist or profileComplete is not true
      if (userDoc.exists() && userDoc.data()?.profileComplete === true) {
        showSuccessMessage = true;
        setTimeout(() => goto('/loyalty'), 2000);
      } else {
        // Show profile form for all other cases
        verifiedEmail = userEmail;
        showProfileForm = true;
        
        // Create/update user document if needed
        if (!userDoc.exists() || !userDoc.data()?.profileComplete) {
          // You might want to initialize the user document here
          // await setDoc(userRef, { profileComplete: false }, { merge: true });
        }
      }
    } catch (err: unknown) {
      const e = err instanceof Error ? err : new Error(String(err));
      error = e.message;
      console.error(`${provider} login error`, e);
    } finally {
      socialLoading = null;
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
        await sendEmailOTP(email, 'LOYALTY_PROGRAM');
      }
      otpSent = true;
      startCountdown();
    } catch (err: unknown) {
      error = err instanceof Error ? err.message : 'Failed to send verification';
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
  bind:showProfileForm
>
  <div slot="social-login">
    <SocialButtons 
      on:login={({ detail: { provider } }) => handleSocialLogin(provider)}
    />
  </div>
  
  <div slot="profile-form">
    <LoyaltyProfileForm
      email={verifiedEmail}
      on:submit={handleProfileSubmit}
      on:error={(e: {detail: string}) => error = e.detail}
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
      <p class="text-gray-600 mb-4">Thank you for joining our loyalty program</p>
      <div class="w-full bg-gray-200 rounded-full h-2.5">
        <div class="bg-green-500 h-2.5 rounded-full animate-pulse" style="width: 100%"></div>
      </div>
      <p class="text-sm text-gray-500 mt-2">Redirecting to loyalty page...</p>
    </div>
  </div>
{/if}