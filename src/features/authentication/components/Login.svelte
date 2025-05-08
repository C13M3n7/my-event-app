<script lang="ts">
  import { onMount } from 'svelte';
  import { auth, googleProvider, facebookProvider } from '$lib/firebase';
  import { signInWithPopup, signInWithCustomToken } from 'firebase/auth';
  import { doc, setDoc, getDoc } from 'firebase/firestore';
  import { db } from '$lib/firebase';
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
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
  let showAdminAccessError = false;

  onMount(() => {
    // Check for admin access error
    if ($page.url.searchParams.get('error') === 'admin_required') {
      showAdminAccessError = true;
      setTimeout(() => showAdminAccessError = false, 5000);
    }

    // Existing code...
    if ($page.url.searchParams.get('error') === 'admin_check_failed') {
      showAdminAccessError = true;
      setTimeout(() => showAdminAccessError = false, 5000);
    }

    return () => {
      if (timer) window.clearInterval(timer);
    };
  });

  $: {
    if (activeTab === 'email') {
      isInputValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    } else {
      isInputValid = phone.length > 7 && /^\d+$/.test(phone);
    }
  }

  const startCountdown = () => {
    countdown = 60;
    if (timer) window.clearInterval(timer);
    timer = window.setInterval(() => countdown -= 1, 1000);
    const now = new Date();
    now.setMinutes(now.getMinutes() + 10);
    expirationTime = now.toISOString();
  };

  const sendOTP = async () => {
  formError = '';
  isLoading = true;

  try {
    if (!email || typeof email !== 'string') {
      throw new Error('Please enter a valid email');
    }
    
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
    isLoading = true;
    formError = '';
    
    try {
      const fullOtp = otp.join('');
      if (fullOtp.length !== 6) throw new Error('Please enter a valid OTP');

      if (!email || typeof email !== 'string') {
        throw new Error('Please enter a valid email');
      }

      const normalizedEmail = email.trim().toLowerCase();
      
      // Verify OTP and get response (which now includes customToken)
      console.log('Starting OTP verification for:', normalizedEmail);
      const result = await verifyEmailOTP(normalizedEmail, fullOtp, 'LOGIN');
      
      // Check for customToken in response
      if (!result.customToken) {
        throw new Error('Authentication token is missing');
      }

      // Sign in with the custom token
      console.log('Signing in with custom token...');
      const userCredential = await signInWithCustomToken(auth, result.customToken);
      const user = userCredential.user;
      
      // Rest of your existing flow...
      console.log('Refreshing token...');
      const tokenResult = await user.getIdTokenResult(true);
      console.log('Token claims:', tokenResult.claims);

      // Use result.uid instead of getting it from userCredential
      const userRef = doc(db, 'users', result.uid);
      const userDoc = await getDoc(userRef);

      if (!userDoc.exists()) {
        throw new Error('No account found. Please register first.');
      }

      const isAdmin = userDoc.data()?.admin === true;
      
      if (isAdmin && !tokenResult.claims.admin) {
        throw new Error('Admin privileges not found in token');
      }

      await setDoc(userRef, {
        lastLogin: new Date().toISOString(),
        authMethod: 'EMAIL',
        verified: true
      }, { merge: true });

      if (user.email) {
        const indexRef = doc(db, 'emailToUid', user.email.toLowerCase());
        await setDoc(indexRef, {
          uid: result.uid,
          updatedAt: new Date().toISOString()
        }, { merge: true });
      }

      const redirectPath = tokenResult.claims.admin ? '/admin-dashboard' : '/events';
      console.log('Redirecting to:', redirectPath);
      goto(redirectPath);

    } catch (error) {
    console.error('Login error:', error);
    formError = error instanceof Error ? error.message : 'Authentication failed';
    
    // Special handling for registration flow
    if (formError.includes('No account found')) {
      goto('/auth/register?email=' + encodeURIComponent(email));
      return;
    }
    
    if (formError.includes('Admin')) {
      showAdminAccessError = true;
      setTimeout(() => showAdminAccessError = false, 5000);
    }
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
      
      // Get existing user data to preserve their type
      const userRef = doc(db, 'users', userEmail);
      const userDoc = await getDoc(userRef);
      
      const userData = {
        email: userEmail,
        authMethod: provider.toUpperCase(),
        lastLogin: new Date().toISOString(),
        verified: true
      };
      
      // If user exists, preserve their type, otherwise create new with default type
      if (userDoc.exists()) {
        const existingData = userDoc.data();
        await setDoc(userRef, {
          ...existingData,
          ...userData
        }, { merge: true });
      } else {
        await setDoc(userRef, {
          ...userData,
          type: 'EVENT_REGISTRATION', // Default type for new social logins
          createdAt: new Date().toISOString()
        });
      }
      
      const token = await auth.currentUser?.getIdTokenResult(true);
      const redirectPath = token?.claims.admin ? '/admin-dashboard' : '/events';
      goto(redirectPath);
      
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

<!-- Rest of your template remains the same -->
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
    <p class="text-gray-600 mb-4">You will be redirected shortly...</p>
    <div class="w-full bg-gray-200 rounded-full h-2.5">
      <div class="bg-green-500 h-2.5 rounded-full animate-pulse" style="width: 100%"></div>
    </div>
  </div>
</div>
{/if}

<!-- Add this toast notification at the bottom of your template -->
{#if showAdminAccessError}
  <div class="fixed top-4 right-4 bg-red-500 text-white px-4 py-3 rounded-md shadow-lg z-50 flex items-start animate-fade-in-out max-w-sm">
    <svg class="w-5 h-5 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
    <div>
      <p class="font-medium">Admin Access Required</p>
      <p class="text-sm opacity-90">Please login with an admin account to access the dashboard.</p>
    </div>
  </div>
{/if}

<style>
  @keyframes fade-in-out {
    0% { opacity: 0; transform: translateY(-10px); }
    10% { opacity: 1; transform: translateY(0); }
    90% { opacity: 1; transform: translateY(0); }
    100% { opacity: 0; transform: translateY(-10px); }
  }
  .animate-fade-in-out {
    animation: fade-in-out 5s ease-in-out forwards;
  }
</style>