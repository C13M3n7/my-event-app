<script lang="ts">
  import { onMount } from 'svelte';
  import { createEventDispatcher } from 'svelte';
  import { db } from '$lib/firebase';
  import { collection, onSnapshot } from 'firebase/firestore';
  import { toast } from 'svelte-sonner';
  import EventForm from './EventForm.svelte';
  import EventDetailView from './EventDetailView.svelte';
  import type { EventData } from '../types/eventTypes';

  export let events: EventData[] = [];
  const dispatch = createEventDispatcher();

  let filter: 'ongoing' | 'upcoming' = 'ongoing';
  let showCreateModal = false;
  let selectedEvent: EventData | null = null;
  let isProcessing = false;

  onMount(() => {
    const unsubscribe = onSnapshot(collection(db, 'events'), (snapshot) => {
      events = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }) as EventData);
    }, (error) => {
      toast.error("Error loading events");
      console.error(error);
    });

    return () => unsubscribe();
  });

  function filteredEvents() {
    const now = new Date();
    return events.filter(event => {
      const start = new Date(event.startDate);
      const end = new Date(event.endDate);
      return filter === 'ongoing'
        ? start <= now && end >= now
        : start > now;
    });
  }

  function handleEventCreated(e: CustomEvent<EventData>) {
    events = [...events, e.detail];
    showCreateModal = false;
  }
  function handleEventUpdated(e: CustomEvent<EventData>) {
  events = events.map(event => 
    event.id === e.detail.id ? { ...event, ...e.detail } : event
  );
  selectedEvent = null;
  toast.success('Event updated successfully');
}
  function handleEventDeleted(e: CustomEvent<string>) {
    events = events.filter(event => event.id !== e.detail);
    selectedEvent = null;
  }
</script>

<div class="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
  <div class="mb-8">
    <h1 class="text-3xl font-light text-gray-900 mb-5">Event Management</h1>
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div class="flex gap-2">
        <button
          class={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${filter === 'ongoing' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'}`}
          on:click={() => filter = 'ongoing'}>
          Ongoing Events
        </button>
        <button
          class={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${filter === 'upcoming' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'}`}
          on:click={() => filter = 'upcoming'}>
          Upcoming Events
        </button>
      </div>
      <button
        class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
        on:click={() => showCreateModal = true}>
        <svg class="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clip-rule="evenodd" />
        </svg>
        Create Event
      </button>
    </div>
  </div>

  {#if filteredEvents().length === 0}
    <div class="bg-white rounded-lg shadow p-8 text-center">
      <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
      <h3 class="mt-2 text-lg font-medium text-gray-900">No {filter} events</h3>
      <p class="mt-1 text-sm text-gray-500">Get started by creating a new event.</p>
    </div>
  {:else}
    <div class="grid gap-6 sm:grid-cols-1 lg:grid-cols-2">
      {#each filteredEvents() as event (event.id)}
        <div class="bg-white overflow-hidden shadow rounded-lg divide-y divide-gray-200 hover:shadow-md transition-shadow">
          {#if event.imagePreview}
            <div class="h-48 bg-gray-200 overflow-hidden">
              <img src={event.imagePreview} alt={event.title} class="w-full h-full object-cover" />
            </div>
          {/if}
          <div class="px-4 py-5 sm:p-6">
            <div class="flex items-center justify-between">
              <h3 class="text-lg leading-6 font-medium text-gray-900">{event.title}</h3>
              <span class="inline-flex items-center px-3 py-0.5 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                {event.type}
              </span>
            </div>
            <div class="mt-4">
              <div class="flex items-center text-sm text-gray-500 mb-2">
                <svg class="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clip-rule="evenodd" />
                </svg>
                {event.startDate} → {event.endDate}
              </div>
              <div class="flex items-center text-sm text-gray-500">
                <svg class="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v1h8v-1zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-1a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v1h-3zM4.75 12.094A5.973 5.973 0 004 15v1H1v-1a3 3 0 013.75-2.906z" />
                </svg>
                Expected attendees: {event.expectedAttendees}
              </div>
            </div>
            {#if event.eventBriefUrl}
              <div class="mt-4">
                <a href={event.eventBriefUrl} target="_blank" class="inline-flex items-center text-blue-600 hover:text-blue-800">
                  <svg class="h-5 w-5 mr-1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V7.414A2 2 0 0015.414 6L12 2.586A2 2 0 0010.586 2H6zm2 10a1 1 0 10-2 0v3a1 1 0 102 0v-3zm2-3a1 1 0 011 1v5a1 1 0 11-2 0v-5a1 1 0 011-1zm4-1a1 1 0 10-2 0v7a1 1 0 102 0V8z" clip-rule="evenodd" />
                  </svg>
                  Download Event Brief
                </a>
              </div>
            {/if}
          </div>
          <div class="px-4 py-4 sm:px-6">
            <div class="flex justify-end">
              <button
                type="button"
                class="ml-3 inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                on:click={() => selectedEvent = event}>
                View Details
              </button>
            </div>
          </div>
        </div>
      {/each}
    </div>
  {/if}

  {#if showCreateModal}
    <div class="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-start pt-10 sm:pt-20 overflow-y-auto">
      <div class="bg-white rounded-lg shadow-xl transform transition-all sm:max-w-lg sm:w-full m-4">
        <div class="p-6">
          <h2 class="text-lg font-medium text-gray-900 mb-4">Create New Event</h2>
          <EventForm 
            on:save={handleEventCreated} 
            on:cancel={() => showCreateModal = false}
            disabled={isProcessing}
          />
        </div>
      </div>
    </div>
  {/if}

  {#if selectedEvent}
    <div class="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-start pt-10 sm:pt-20 overflow-y-auto">
      <div class="bg-white rounded-lg shadow-xl transform transition-all sm:max-w-2xl sm:w-full m-4">
        <EventDetailView 
          event={selectedEvent} 
          on:updated={handleEventUpdated}
          on:deleted={handleEventDeleted}
          on:close={() => selectedEvent = null}
        />
      </div>
    </div>
  {/if}
</div>