<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { user, initAuthListener, verifyAdmin } from '$features/authentication/stores/user';
  import { auth } from '$lib/firebase';
  import LoadingSpinner from '$features/shared/components/LoadingSpinner.svelte';
  import type { UserAuthStatus } from '$features/authentication/types/admin';

  // State
  let authStatus: 'checking' | 'admin' | 'non-admin' | 'error' = 'checking';
  let authError: string | null = null;
  let unsubscribeAuth: () => void;
  let showLoading = true;
  let loadingStartTime = 0;
  const MIN_LOADING_TIME = 1200;

  // Stores the latest user auth state from subscription
  let currentAuthState: UserAuthStatus = {
    isAdmin: false,
    isLoading: true,
    isAuthenticated: false,
    isAuthChecked: false,
    currentUser: null
  };

  // Subscribe to Auth Store
  const userUnsubscribe = user.subscribe((state: UserAuthStatus) => {
    currentAuthState = state;
  });

  // Mock Activity Data (keeping your existing data)
  const activities = [
    {
      type: 'User',
      caption: 'Added McDonalds to Harvest event',
      date: 'Yesterday'
    },
    {
      type: 'Admin',
      caption: 'Removed user JohnDoe from system',
      date: '2 days ago'
    },
    {
      type: 'System',
      caption: 'Updated analytics for Eras Tour',
      date: 'Today'
    }
  ];

  onMount(async () => {
    loadingStartTime = Date.now();
    unsubscribeAuth = initAuthListener();

    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        throw new Error('No authenticated user found');
      }

      // Force token refresh to get fresh claims
      const token = await currentUser.getIdTokenResult(true);
      
      if (token.claims.admin) {
        authStatus = 'admin';
        return;
      }

      // Fallback to full verification
      const isAdmin = await verifyAdmin();
      if (!isAdmin) {
        authStatus = 'non-admin';
        goto('/auth/login?error=admin_required');
        return;
      }

      authStatus = 'admin';
    } catch (error) {
      authStatus = 'error';
      authError = error instanceof Error ? error.message : 'Unknown auth error';
      goto('/auth/login?error=admin_check_failed');
    } finally {
      const elapsed = Date.now() - loadingStartTime;
      if (elapsed < MIN_LOADING_TIME) {
        await new Promise(resolve => setTimeout(resolve, MIN_LOADING_TIME - elapsed));
      }
      showLoading = false;
    }
  });

  onMount(() => () => {
    userUnsubscribe();
    if (unsubscribeAuth) unsubscribeAuth();
  });
</script>

{#if (showLoading || authStatus === 'checking') && !authError}
  <!-- Loading state - keeping your original styling -->
  <div class="flex flex-col items-center justify-center h-screen gap-6 px-4">
    <LoadingSpinner size="lg" />
    <div class="text-center space-y-1">
      <p class="text-lg font-medium text-gray-800">Verifying Admin Access</p>
      <p class="text-sm text-gray-500">This will just take a moment</p>
    </div>
  </div>

{:else if authStatus === 'non-admin'}
  <!-- Redirect state - keeping your original styling -->
  <div class="flex flex-col items-center justify-center h-screen gap-6 px-4 text-center">
    <svg class="w-16 h-16 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
    </svg>
    <div class="space-y-2">
      <h2 class="text-xl font-semibold text-gray-800">Admin Access Required</h2>
      <p class="text-gray-600 max-w-md">You don't have permission to view this page. Redirecting to login...</p>
    </div>
    <LoadingSpinner size="lg" />
  </div>

{:else if authStatus === 'error'}
  <!-- Error state - keeping your original styling -->
  <div class="max-w-md mx-auto my-8 p-6 bg-white rounded-xl shadow-sm border border-red-100">
    <div class="flex items-start gap-3">
      <svg class="w-6 h-6 text-red-500 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <div>
        <h2 class="text-lg font-semibold text-gray-800">Authentication Error</h2>
        <p class="mt-1 text-gray-600">{authError}</p>
        <button 
          on:click={() => goto('/auth/login')}
          class="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors duration-150"
        >
          Return to Login
        </button>
      </div>
    </div>
  </div>

{:else if authStatus === 'admin'}
  <!-- Enhanced admin dashboard - keeping all your original UI -->
  <div class="px-4 py-8 sm:px-6 lg:px-8 max-w-7xl mx-auto">
    <header class="mb-10 sm:mb-12">
      <h1 class="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 text-center lg:text-left">Admin Dashboard</h1>
      <p class="mt-2 text-gray-500 text-center lg:text-left">Overview and quick actions</p>
    </header>

    <!-- Improved card grid layout -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
      <a 
        href="/admin-dashboard/users" 
        class="h-[120px] rounded-xl flex items-center justify-center text-lg font-bold p-6 shadow-md border-2 border-[#1e90ff] bg-[#eaf4ff] text-[#1e3a8a] transition-all duration-200 hover:scale-[1.02] hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-[#1e90ff] focus:ring-offset-2"
        aria-label="User Management"
      >
        <div class="text-center">
          <svg class="w-8 h-8 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
          User Management
        </div>
      </a>
      <a 
        href="/admin-dashboard/events" 
        class="h-[120px] rounded-xl flex items-center justify-center text-lg font-bold p-6 shadow-md border-2 border-[#ff8c00] bg-[#fff0e5] text-[#a64b00] transition-all duration-200 hover:scale-[1.02] hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-[#ff8c00] focus:ring-offset-2"
        aria-label="Event Management"
      >
        <div class="text-center">
          <svg class="w-8 h-8 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          Event Management
        </div>
      </a>
      
      <a 
        href="/admin-dashboard/analytics"
        class="h-[120px] rounded-xl flex items-center justify-center text-lg font-bold p-6 shadow-md border-2 border-[#28a745] bg-[#f0fff4] text-[#155724] transition-all duration-200 hover:scale-[1.02] hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-[#28a745] focus:ring-offset-2"
        aria-label="Analytics"
      >
        <div class="text-center">
          <svg class="w-8 h-8 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          Analytics
        </div>
      </a>
    </div>

    <!-- Recent activities section -->
    <section class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div class="px-6 py-4 border-b border-gray-200">
        <h2 class="text-xl font-semibold text-gray-900">Recent Activities</h2>
      </div>
      <div class="divide-y divide-gray-200">
        {#each activities as activity}
          <div class="p-6 hover:bg-gray-50 transition-colors">
            <div class="flex items-start gap-4">
              {#if activity.type === 'User'}
                <div class="p-2.5 rounded-lg bg-blue-50 text-blue-600">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
              {:else if activity.type === 'Admin'}
                <div class="p-2.5 rounded-lg bg-purple-50 text-purple-600">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              {:else}
                <div class="p-2.5 rounded-lg bg-gray-50 text-gray-600">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
              {/if}
              <div class="flex-1 min-w-0">
                <div class="flex items-center justify-between gap-3">
                  <h3 class="font-medium text-gray-900 truncate">{activity.type}</h3>
                  <span class="text-sm text-gray-500 whitespace-nowrap">{activity.date}</span>
                </div>
                <p class="mt-1 text-gray-600">{activity.caption}</p>
              </div>
            </div>
          </div>
        {/each}
      </div>
    </section>
  </div>
{/if}