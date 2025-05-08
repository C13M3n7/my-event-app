<script lang="ts">
    import { createEventDispatcher } from 'svelte';
    import { db } from '$lib/firebase';
    import { doc, updateDoc, deleteDoc } from 'firebase/firestore';
    import { deleteFile } from '$features/shared/services/storage';
    import { toast } from 'svelte-sonner';
    import EventForm from './EventForm.svelte';
    import VendorManager from './VendorManager.svelte';
    import type { EventData } from '../types/eventTypes';
    import { assertDefined } from '$lib/utils'; 

    export let event: EventData;
    const dispatch = createEventDispatcher();
  
    let isEditing = false;
    let isDeleting = false;
    let deleteConfirmation = '';
    let isProcessing = false;
  
    async function handleSave(updatedEvent: EventData) {
        isProcessing = true;
        try {
            assertDefined(event.id, "Event ID is required");
            
            // Update local state immediately for better UX
            event = { ...event, ...updatedEvent };
            
            // Explicitly type the document reference
            const eventRef = doc(db, 'events', event.id!);
            
            // Convert to plain object for Firestore
            const updateData = { ...updatedEvent } as Record<string, any>;
            await updateDoc(eventRef, updateData);
            
            toast.success('Event updated successfully');
            isEditing = false;
            
            // Dispatch the updated event with the new data
            dispatch('updated', { detail: { ...event, ...updatedEvent } });
        } catch (error) {
            toast.error('Failed to update event');
            console.error(error);
        } finally {
            isProcessing = false;
        }
    }

    async function handleDelete() {
        if (deleteConfirmation !== 'DELETE') return;
        
        isProcessing = true;
        try {
            assertDefined(event.id, "Event ID is required");
            
            // Delete associated files from storage
            const deletePromises = [];
            if (event.imagePreview) deletePromises.push(deleteFile(event.imagePreview));
            if (event.layoutImagePreview) deletePromises.push(deleteFile(event.layoutImagePreview));
            if (event.eventBriefUrl) deletePromises.push(deleteFile(event.eventBriefUrl));
            
            await Promise.all(deletePromises);
            
            // Explicitly type the document reference
            const eventRef = doc(db, 'events', event.id);
            await deleteDoc(eventRef);
            
            toast.success('Event deleted successfully');
            dispatch('deleted', { detail: event.id });
        } catch (error) {
            toast.error('Failed to delete event');
            console.error(error);
        } finally {
            isProcessing = false;
        }
    }
</script>
  
  <div class="bg-white rounded-lg shadow overflow-hidden">
    {#if isEditing}
      <EventForm 
        eventId={event.id}
        bind:event={event}
        on:save={(e) => handleSave(e.detail)}
        on:cancel={() => isEditing = false}
        disabled={isProcessing}
      />
    {:else}
      <!-- View Mode -->
      <div class="p-6">
        <div class="flex justify-between items-start mb-6">
          <h2 class="text-2xl font-bold text-gray-900">{event.title}</h2>
          <div class="flex space-x-2">
            <button 
              on:click={() => isEditing = true}
              class="p-2 text-blue-600 hover:bg-blue-50 rounded-full"
              title="Edit"
              aria-label="Edit Event"
            >
              <span class="sr-only">Edit Event</span>
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
              </svg>
            </button>
            <button 
              on:click={() => isDeleting = true}
              class="p-2 text-red-600 hover:bg-red-50 rounded-full"
              title="Delete"
              aria-label="Delete Event"
            >
              <span class="sr-only">Delete Event</span>
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd" />
              </svg>
            </button>
            <button 
              on:click={() => dispatch('close')}
              class="p-2 text-gray-600 hover:bg-gray-50 rounded-full"
              title="Close"
              aria-label="Close"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
              </svg>
            </button>
          </div>
        </div>
  
        <div class="space-y-6">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 class="text-lg font-medium text-gray-900 mb-3">Event Details</h3>
              <div class="space-y-3">
                <div>
                  <p class="text-sm text-gray-500">Location Name</p>
                  <p class="text-gray-900">{event.locationName}</p>
                </div>
                <div>
                  <p class="text-sm text-gray-500">Google Maps URL</p>
                  <a href={event.location} target="_blank" class="text-blue-600 hover:underline">
                    View on Map
                  </a>
                </div>
                <div>
                  <p class="text-sm text-gray-500">Date & Time</p>
                  <p class="text-gray-900">{event.startDate} {event.startTime} - {event.endDate} {event.endTime}</p>
                </div>
                <div>
                  <p class="text-sm text-gray-500">Tagline</p>
                  <p class="text-gray-900">{event.tagline}</p>
                </div>
                <div>
                  <p class="text-sm text-gray-500">Type</p>
                  <p class="text-gray-900">{event.type} ({event.eventType})</p>
                </div>
              </div>
            </div>
  
            <div>
              <h3 class="text-lg font-medium text-gray-900 mb-3">Additional Info</h3>
              <div class="space-y-3">
                <div>
                  <p class="text-sm text-gray-500">Expected Attendees</p>
                  <p class="text-gray-900">{event.expectedAttendees}</p>
                </div>
                {#if event.socialMediaUrl}
                  <div>
                    <p class="text-sm text-gray-500">Social Media</p>
                    <a href={event.socialMediaUrl} target="_blank" class="text-blue-600 hover:underline">
                      {event.socialMediaUrl}
                    </a>
                  </div>
                {/if}
                {#if event.videoUrl}
                  <div>
                    <p class="text-sm text-gray-500">Video URL</p>
                    <a href={event.videoUrl} target="_blank" class="text-blue-600 hover:underline">
                      {event.videoUrl}
                    </a>
                  </div>
                {/if}
              </div>
            </div>
          </div>
          {#if event.eventBriefUrl}
          <div>
            <a 
              href={event.eventBriefUrl} 
              target="_blank" 
              class="inline-flex items-center text-blue-600 hover:text-blue-800"
              on:click|preventDefault={() => window.open(event.eventBriefUrl, '_blank')}
            >
              <svg class="h-5 w-5 mr-1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V7.414A2 2 0 0015.414 6L12 2.586A2 2 0 0010.586 2H6zm2 10a1 1 0 10-2 0v3a1 1 0 102 0v-3zm2-3a1 1 0 011 1v5a1 1 0 11-2 0v-5a1 1 0 011-1zm4-1a1 1 0 10-2 0v7a1 1 0 102 0V8z" clip-rule="evenodd" />
              </svg>
              Download Event Brief
            </a>
            {#if isEditing}
              <p class="text-sm text-gray-500 mt-1">PDF will be updated when you save changes</p>
            {/if}
          </div>
        {/if}
  
          {#if event.imagePreview}
            <div>
              <h3 class="text-lg font-medium text-gray-900 mb-3">Event Banner</h3>
              <img src={event.imagePreview} alt="Event banner" class="max-w-full rounded-lg shadow" />
            </div>
          {/if}
  
          {#if event.layoutImagePreview}
            <div>
              <h3 class="text-lg font-medium text-gray-900 mb-3">Layout Image</h3>
              <img src={event.layoutImagePreview} alt="Event layout" class="max-w-full rounded-lg shadow" />
            </div>
          {/if}
  
          {#if event.id}
            <VendorManager eventId={event.id} />
        {/if}
        </div>
      </div>
  
      <!-- Delete Confirmation Modal -->
      {#if isDeleting}
        <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div class="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 class="text-lg font-bold mb-4">Confirm Deletion</h3>
            <p class="mb-4">This action cannot be undone. Type <strong>DELETE</strong> to confirm:</p>
            
            <input 
              type="text" 
              bind:value={deleteConfirmation}
              class="w-full p-2 border border-gray-300 rounded mb-4"
              placeholder="Type DELETE"
            />
            
            <div class="flex justify-end space-x-3">
              <button 
                on:click={() => isDeleting = false}
                class="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50"
                disabled={isProcessing}
              >
                Cancel
              </button>
              <button 
                on:click={handleDelete}
                disabled={deleteConfirmation !== 'DELETE' || isProcessing}
                class="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
              >
                {isProcessing ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      {/if}
    {/if}
  </div>