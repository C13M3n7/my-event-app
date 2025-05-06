<!-- src/features/adminDashboard/components/EventManager.svelte -->
<script>
  import EventForm from './EventForm.svelte';
  import EditEventForm from './EditEventForm.svelte';
  import { createEventDispatcher } from 'svelte';

  export let events = [];
  const dispatch = createEventDispatcher();

  let filter = 'ongoing';
  let showCreateModal = false;
  let showEditModal = false;
  let editingEvent = null;
  let isProcessing = false;
  let error = null;

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

  async function handleSave(e) {
    isProcessing = true;
    error = null;
    try {
      await dispatch('saveEvent', e.detail);
      showCreateModal = false;
    } catch (e) {
      error = e.message;
    } finally {
      isProcessing = false;
    }
  }

  async function handleUpdate(e) {
    isProcessing = true;
    error = null;
    try {
      await dispatch('updateEvent', e.detail);
      showEditModal = false;
    } catch (e) {
      error = e.message;
    } finally {
      isProcessing = false;
    }
  }

  async function handleDelete(e) {
    isProcessing = true;
    error = null;
    try {
      await dispatch('deleteEvent', e.detail);
      showEditModal = false;
    } catch (e) {
      error = e.message;
    } finally {
      isProcessing = false;
    }
  }

  function openEditModal(event) {
    editingEvent = { ...event };
    showEditModal = true;
  }
</script>

<!-- Error Message -->
{#if error}
  <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
    {error}
  </div>
{/if}

<!-- Modals -->
{#if showCreateModal}
  <div class="fixed inset-0 bg-black bg-opacity-40 z-50 flex justify-center items-start pt-20 overflow-y-auto">
    <div class="bg-white p-4 rounded-2xl w-full max-w-md m-4">
      <EventForm 
        on:save={handleSave} 
        on:cancel={() => showCreateModal = false}
        disabled={isProcessing}
      />
    </div>
  </div>
{/if}

{#if showEditModal}
  <div class="fixed inset-0 bg-black bg-opacity-40 z-50 flex justify-center items-start pt-20 overflow-y-auto">
    <div class="bg-white p-4 rounded-2xl w-full max-w-md m-4">
      <EditEventForm
        bind:event={editingEvent}
        on:save={handleUpdate}
        on:delete={handleDelete}
        on:close={() => showEditModal = false}
        disabled={isProcessing}
      />
    </div>
  </div>
{/if}

<!-- Header and Filter -->
<div class="flex items-center justify-between mb-4 flex-wrap gap-2">
  <h1 class="text-xl font-semibold">Events</h1>
  <button
    class="bg-green-600 text-white text-sm px-3 py-1.5 rounded hover:bg-green-700"
    on:click={() => showCreateModal = true}>
    Create
  </button>
</div>

<!-- Filter Tabs -->
<div class="flex gap-2 mb-4">
  <button class:active={filter === 'ongoing'} class="tab-button" on:click={() => filter = 'ongoing'}>Ongoing</button>
  <button class:active={filter === 'upcoming'} class="tab-button" on:click={() => filter = 'upcoming'}>Upcoming</button>
</div>

<!-- Events List -->
{#if filteredEvents().length === 0}
  <p>No {filter} events.</p>
{:else}
  <ul>
    {#each filteredEvents() as event (event.id)}
      <li class="mb-4 p-4 border rounded-lg shadow">
        <h2 class="text-lg font-bold">{event.title}</h2>
        <p>{event.type} | {event.startDate} → {event.endDate}</p>
        <p>Expected attendees: {event.expectedAttendees}</p>
        {#if event.eventBriefUrl}
          <a href={event.eventBriefUrl} target="_blank" class="text-blue-600 underline mt-2 block">
            Download Event Brief PDF
          </a>
        {/if}
        {#if event.imagePreview}
          <img src={event.imagePreview} alt="Event Image" class="mt-2 w-full h-40 object-cover rounded-md" />
        {/if}
        <button class="mt-2 text-blue-600" on:click={() => openEditModal(event)}>Edit</button>
      </li>
    {/each}
  </ul>
{/if}

<style>
  .tab-button {
    padding: 6px 12px;
    border-radius: 8px;
    border: 1px solid #ccc;
    background: #f3f4f6;
    cursor: pointer;
  }

  .tab-button.active {
    background-color: #2563eb;
    color: white;
    border-color: #2563eb;
  }
</style>
