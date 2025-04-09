<script lang="ts">
    import { onMount } from 'svelte';
    import { auth } from '$lib/firebase';
    import { goto } from '$app/navigation';
    import { doc, getDoc } from 'firebase/firestore';
    import { db } from '$lib/firebase';
  
    let userEmail = '';
    let userName = '';
    let isLoading = true;
    let upcomingEvents = [];
    let pastEvents = [];
  
    // Sample event data structure
    const sampleEvents = [
      {
        id: 'event1',
        name: 'Tech Conference 2023',
        date: '2023-11-15',
        location: 'Virtual',
        status: 'upcoming'
      },
      {
        id: 'event2',
        name: 'Workshop: Advanced Svelte',
        date: '2023-10-20',
        location: 'Kuala Lumpur',
        status: 'past'
      }
    ];
  
    onMount(async () => {
      try {
        // Wait for Firebase auth to initialize
        await new Promise(resolve => {
          const unsubscribe = auth.onAuthStateChanged(user => {
            unsubscribe();
            resolve(user);
          });
        });
  
        const user = auth.currentUser;
        if (!user) {
          throw new Error('Not authenticated');
        }
  
        // Get user data from Firestore
        const userDoc = await getDoc(doc(db, 'users', user.email || user.phoneNumber || ''));
        if (!userDoc.exists()) {
          throw new Error('User data not found');
        }
  
        userEmail = user.email || '';
        userName = userDoc.data().name || 'User';
  
        // Filter sample events (in a real app, you'd fetch from Firestore)
        upcomingEvents = sampleEvents.filter(event => event.status === 'upcoming');
        pastEvents = sampleEvents.filter(event => event.status === 'past');
        
      } catch (error) {
        console.error('Dashboard error:', error);
        goto('/login');
      } finally {
        isLoading = false;
      }
    });
  
    const handleLogout = async () => {
      try {
        await auth.signOut();
        goto('/');
      } catch (error) {
        console.error('Logout error:', error);
      }
    };
  </script>
  
  <div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <header class="bg-white shadow-sm">
      <div class="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8 flex justify-between items-center">
        <h1 class="text-2xl font-bold text-gray-900">Event Dashboard</h1>
        <div class="flex items-center space-x-4">
          <span class="text-gray-600">Welcome, {userName}</span>
          <button
            on:click={handleLogout}
            class="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-700"
          >
            Sign Out
          </button>
        </div>
      </div>
    </header>
  
    <!-- Main Content -->
    <main class="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
      {#if isLoading}
        <div class="flex justify-center items-center h-64">
          <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      {:else}
        <!-- Upcoming Events Section -->
        <section class="mb-12">
          <h2 class="text-xl font-semibold mb-4">Your Upcoming Events</h2>
          {#if upcomingEvents.length > 0}
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {#each upcomingEvents as event}
                <div class="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200">
                  <div class="p-6">
                    <h3 class="text-lg font-medium text-gray-900 mb-2">{event.name}</h3>
                    <p class="text-gray-600 mb-1">
                      <svg class="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      {event.date}
                    </p>
                    <p class="text-gray-600 mb-4">
                      <svg class="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      {event.location}
                    </p>
                    <button
                      class="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-medium"
                      on:click={() => goto(`/events/${event.id}`)}
                    >
                      View Details
                    </button>
                  </div>
                </div>
              {/each}
            </div>
          {:else}
            <div class="bg-white rounded-lg shadow-sm p-6 text-center">
              <p class="text-gray-500">You don't have any upcoming events yet.</p>
              <button
                class="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium"
                on:click={() => goto('/events')}
              >
                Browse Events
              </button>
            </div>
          {/if}
        </section>
  
        <!-- Past Events Section -->
        <section>
          <h2 class="text-xl font-semibold mb-4">Past Events</h2>
          {#if pastEvents.length > 0}
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {#each pastEvents as event}
                <div class="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200 opacity-75">
                  <div class="p-6">
                    <h3 class="text-lg font-medium text-gray-900 mb-2">{event.name}</h3>
                    <p class="text-gray-600 mb-1">{event.date}</p>
                    <p class="text-gray-600 mb-4">{event.location}</p>
                    <button
                      class="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 rounded-lg font-medium"
                      on:click={() => goto(`/events/${event.id}`)}
                    >
                      View Details
                    </button>
                  </div>
                </div>
              {/each}
            </div>
          {:else}
            <div class="bg-white rounded-lg shadow-sm p-6 text-center">
              <p class="text-gray-500">No past events to display.</p>
            </div>
          {/if}
        </section>
      {/if}
    </main>
  </div>