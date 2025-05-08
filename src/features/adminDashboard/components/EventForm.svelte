<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { uploadFile, deleteFile } from '$features/shared/services/storage';
  import { toast } from 'svelte-sonner';
  import type { EventData } from '../types/eventTypes';
  import { v4 as uuidv4 } from 'uuid';

  const dispatch = createEventDispatcher();

  export let eventId: string | null = null;
  export let event: Partial<EventData> = {};
  export let disabled = false;

  // Form state
  let title = event.title || '';
  let locationName = event.locationName || '';
  let location = event.location || ''; // This is now the Google Maps URL
  let startDate = event.startDate || '';
  let endDate = event.endDate || '';
  let startTime = event.startTime || '';
  let endTime = event.endTime || '';
  let tagline = event.tagline || '';
  let eventType: 'free' | 'paid' = event.eventType || 'free';
  let pricingTiers = event.pricingTiers || [];
  let currentPricingTier = { name: '', price: '' };
  let expectedAttendees = event.expectedAttendees || '';
  let socialMediaUrl = event.socialMediaUrl || '';
  let videoUrl = event.videoUrl || '';
  let eventBriefFile: File | null = null;
  let eventBriefUrl = event.eventBriefUrl || '';
  let imagePreview = event.imagePreview || '';
  let layoutImagePreview = event.layoutImagePreview || '';
  let imageFile: File | null = null;
  let layoutImageFile: File | null = null;
  let termsAgreed = event.termsAgreed || false;
  let isProcessing = false;
  // Tab management
  let activeMainTab: 'festive' | 'concert' | 'conference' = event.type || 'festive';
  let activeFestiveTab: 'details' | 'info' | 'vendors' | string = 'details';

  async function handleImageUpload(event: Event, type: 'banner' | 'layout') {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;

    const file = input.files[0];
    try {
      isProcessing = true;
      const url = await uploadFile(file, `events/${eventId || 'temp'}/images`);
      
      if (type === 'banner') {
        imageFile = file;
        imagePreview = url;
      } else {
        layoutImageFile = file;
        layoutImagePreview = url;
      }
    } catch (error) {
      toast.error('Failed to upload image');
      console.error('Upload error:', error);
    } finally {
      isProcessing = false;
    }
  }

  async function deleteOldPdf(url: string) {
    try {
        if (url && !url.includes('localhost')) {
            await deleteFile(url);
        }
    } catch (error) {
        if (error instanceof Error && error.message.includes('unauthorized')) {
            console.warn('No permission to delete old file, continuing with upload');
            // Continue with upload even if deletion fails
            return;
        }
        console.error('Error deleting old PDF:', error);
        throw error; // Re-throw other errors
    }
}

async function handleEventBriefUpload(e: Event) {
  const input = e.target as HTMLInputElement;
  const file = input.files?.[0];

  if (!file) return;

  try {
    isProcessing = true;

    if (file.type !== 'application/pdf') {
      toast.error('Please upload a PDF file');
      return;
    }

    if (eventBriefUrl) {
      await deleteOldPdf(eventBriefUrl); // Use the helper function instead of deleteFile directly
    }

    const newUrl = await uploadFile(file, `events/${eventId || 'temp'}/pdf`);

    eventBriefUrl = newUrl;
    eventBriefFile = file;
    event = { ...event, eventBriefUrl: newUrl };

    toast.success('PDF uploaded successfully');
  } catch (error) {
    toast.error(`Failed to upload PDF: ${error instanceof Error ? error.message : 'Unknown error'}`);
    console.error('Upload error:', error);
  } finally {
    isProcessing = false;
    input.value = '';
  }
}
  function addPricingTier() {
    if (currentPricingTier.name && currentPricingTier.price) {
      pricingTiers = [...pricingTiers, currentPricingTier];
      currentPricingTier = { name: "", price: "" };
    }
  }

  function removePricingTier(index: number) {
    pricingTiers = pricingTiers.filter((_, i) => i !== index);
  }

  async function saveEvent() {
    if (!title || !location || !locationName || !startDate || !endDate || !startTime || !endTime || !tagline) {
        toast.error('Please fill in all required fields');
        return;
    }

    if (!termsAgreed) {
        toast.error('Please agree to the terms and conditions');
        activeFestiveTab = 'vendors';
        return;
    }

    isProcessing = true;
    
    try {
        const eventData: EventData = {
            id: eventId || undefined,
            title,
            location,
            locationName,
            startDate,
            endDate,
            startTime,
            endTime,
            tagline,
            eventType,
            pricingTiers: eventType === 'paid' ? pricingTiers : [],
            expectedAttendees,
            socialMediaUrl,
            videoUrl,
            eventBriefUrl: eventBriefUrl || undefined, // Handle the optional property
            imagePreview: imagePreview || null,
            layoutImagePreview: layoutImagePreview || null,
            type: activeMainTab,
            termsAgreed,
            createdAt: event.createdAt || new Date().toISOString()
        };

        dispatch('save', eventData);
    } catch (error) {
        toast.error('Failed to prepare event data');
        console.error(error);
    } finally {
        isProcessing = false;
    }
}

  function nextTab() {
    if (activeFestiveTab === 'details') activeFestiveTab = 'info';
    else if (activeFestiveTab === 'info') activeFestiveTab = 'vendors';
  }

  function previousTab() {
    if (activeFestiveTab === 'info') activeFestiveTab = 'details';
    else if (activeFestiveTab === 'vendors') activeFestiveTab = 'info';
  }

  const isFirstTab = activeFestiveTab === 'details';
  const isLastTab = activeFestiveTab === 'vendors';
</script>

<div class="max-w-3xl mx-auto p-6">
  <!-- Main Tab Navigation -->
  <div class="flex justify-around bg-[rgb(2,74,174)] mb-6 rounded-t-lg shadow-md">
    {#each ['festive', 'concert', 'conference'] as tab}
      <button 
        class="flex-1 py-4 text-center text-white font-semibold transition-all relative"
        class:bg-[rgba(255,255,255,0.25)]={activeMainTab === tab}
        on:click={() => activeMainTab = tab as "festive" | "concert" | "conference"}
      >
        {tab.charAt(0).toUpperCase() + tab.slice(1)}
        {#if activeMainTab === tab}
          <div class="absolute bottom-0 left-0 right-0 h-1 bg-white"></div>
        {/if}
      </button>
    {/each}
  </div>

  {#if activeMainTab === 'festive'}
    <div class="festive-tab-content">
      <!-- Sub-tab Navigation -->
      <div class="flex justify-start border-b border-gray-200 mb-6 overflow-x-auto">
        {#each ['details', 'info', 'vendors'] as subTab}
          <button 
            class="px-4 py-3 text-sm font-medium whitespace-nowrap relative"
            class:text-blue-600={activeFestiveTab === subTab}
            class:border-b-2={activeFestiveTab === subTab}
            class:border-blue-600={activeFestiveTab === subTab}
            on:click={() => activeFestiveTab = subTab as "details" | "info" | "vendors"}
          >
            {subTab === 'details' ? 'Event Details' : 
             subTab === 'info' ? 'Event Info' : 'Vendors'}
          </button>
        {/each}
      </div>

      <!-- Sub-tab Content -->
      <div class="min-h-[400px]">
        {#if activeFestiveTab === 'details'}
          <!-- Event Details Tab -->
          <div class="flex flex-col gap-4">
            <label for="eventTitle" class="font-bold text-gray-700">Title *</label>
            <input id="eventTitle" type="text" bind:value={title} placeholder="Enter event title" 
                   class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />

            <label for="fileInput" class="text-gray-700">Event Banner</label>
            <button class="w-full h-[150px] bg-gray-100 border-2 border-dashed border-gray-300 rounded-xl mb-4 flex justify-center items-center cursor-pointer overflow-hidden hover:bg-gray-50 transition-colors"  
                    type="button" aria-label="Upload image" 
                    on:click={() => document.getElementById('fileInput')?.click()}>
              {#if imagePreview}
                <img src={imagePreview} alt="Preview" class="max-w-full max-h-full object-cover" />
              {:else}
                <span class="text-4xl text-gray-400">+</span>
              {/if}
              <input id="fileInput" type="file" accept="image/*" class="hidden" 
                on:change={(e) => handleImageUpload(e, 'banner')} 
              />
            </button>

            <!-- Replace the existing location input with these two fields -->
            <label for="locationName" class="text-gray-700">Location Name *</label>
            <input id="locationName" type="text" bind:value={locationName} placeholder="Enter venue name" 
                  class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />

            <label for="eventLocation" class="text-gray-700">Google Maps URL *</label>
            <input id="eventLocation" type="url" bind:value={location} placeholder="Enter Google Maps link" 
                  class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />

            <label for="eventTagline" class="text-gray-700">Event Tagline *</label>
            <textarea id="eventTagline" rows="2" bind:value={tagline} placeholder="A short, catchy phrase that captures the spirit of the event"
                      class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"></textarea>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div class="flex flex-col">
                <label for="startDate" class="text-gray-700 mb-1">Start Date *</label>
                <input id="startDate" type="date" bind:value={startDate} 
                       class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
              </div>
              <div class="flex flex-col">
                <label for="startTime" class="text-gray-700 mb-1">Start Time *</label>
                <input id="startTime" type="time" bind:value={startTime} 
                       class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
              </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div class="flex flex-col">
                <label for="endDate" class="text-gray-700 mb-1">End Date *</label>
                <input id="endDate" type="date" bind:value={endDate} 
                       class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
              </div>
              <div class="flex flex-col">
                <label for="endTime" class="text-gray-700 mb-1">End Time *</label>
                <input id="endTime" type="time" bind:value={endTime} 
                       class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
              </div>
            </div>
          </div>

        {:else if activeFestiveTab === 'info'}
          <!-- Event Info Tab -->
          <div class="flex flex-col gap-4">
            <fieldset>
              <legend class="text-gray-700 mb-2">Event Type</legend>
              <div class="flex gap-4 mb-4">
                <label class="flex items-center">
                  <input type="radio" name="eventType" value="free" bind:group={eventType} 
                         class="h-4 w-4 text-blue-600 focus:ring-blue-500" />
                  <span class="ml-2">Free Event</span>
                </label>
                <label class="flex items-center">
                  <input type="radio" name="eventType" value="paid" bind:group={eventType} 
                         class="h-4 w-4 text-blue-600 focus:ring-blue-500" />
                  <span class="ml-2">Paid Event</span>
                </label>
              </div>
            </fieldset>

            {#if eventType === 'paid'}
              <div class="mb-4">
                <label for="pricingTiers" class="block text-gray-700 mb-2">Pricing Tiers</label>
                {#each pricingTiers as tier, i}
                  <div class="flex items-center gap-2 mb-2">
                    <span>{tier.name}: RM{tier.price}</span>
                    <button type="button" on:click={() => removePricingTier(i)} class="text-red-500">
                      Remove
                    </button>
                  </div>
                {/each}
                <div id="pricingTiers" class="flex gap-2">
                  <input type="text" bind:value={currentPricingTier.name} placeholder="Tier name" 
                         class="flex-1 p-2 border border-gray-300 rounded" />
                  <input type="text" bind:value={currentPricingTier.price} placeholder="Price" 
                         class="flex-1 p-2 border border-gray-300 rounded" />
                  <button type="button" on:click={addPricingTier} 
                          class="bg-blue-500 text-white px-3 py-2 rounded hover:bg-blue-600">
                    Add
                  </button>
                </div>
              </div>
            {/if}

            <label for="layoutFileInput" class="text-gray-700">Event Layout Image</label>
            <button class="w-full h-[150px] bg-gray-100 border-2 border-dashed border-gray-300 rounded-xl mb-4 flex justify-center items-center cursor-pointer overflow-hidden hover:bg-gray-50 transition-colors"  
                    type="button" aria-label="Upload layout image" 
                    on:click={() => document.getElementById('layoutFileInput')?.click()}>
              {#if layoutImagePreview}
                <img src={layoutImagePreview} alt="Layout Preview" class="max-w-full max-h-full object-cover" />
              {:else}
                <span class="text-4xl text-gray-400">+</span>
              {/if}
              <input 
                id="layoutFileInput" 
                type="file" 
                accept="image/*" 
                class="hidden" 
                on:change={(e) => handleImageUpload(e, 'layout')} 
              />
            </button>

            <label for="expectedAttendees" class="text-gray-700">Expected Attendees</label>
            <input id="expectedAttendees" type="number" bind:value={expectedAttendees} placeholder="Enter number" 
                   class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />

            <label for="socialMediaUrl" class="text-gray-700">Social Media URL</label>
            <input id="socialMediaUrl" type="url" bind:value={socialMediaUrl} placeholder="Enter social media link" 
                   class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />

            <label for="videoUrl" class="text-gray-700">Video URL</label>
            <input id="videoUrl" type="url" bind:value={videoUrl} placeholder="Enter video link" 
                   class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />

                   <div class="mb-4">
                    <label for="briefFileInput" class="text-gray-700">Event Brief PDF</label>
                    <div class="flex items-center justify-between mt-2 border border-gray-300 p-3 rounded-lg bg-gray-50 text-sm hover:bg-gray-100 transition-colors">
                      <span class="text-gray-600 overflow-hidden text-ellipsis whitespace-nowrap max-w-[70%]">
                        {eventBriefFile?.name || (eventBriefUrl ? 'PDF uploaded' : "No file selected")}
                      </span>
                      <button 
                        type="button" 
                        on:click={() => document.getElementById('briefFileInput')?.click()}
                        class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                        disabled={isProcessing}
                      >
                        {eventBriefUrl ? 'Replace' : 'Upload'}
                      </button>
                      <input 
                        id="briefFileInput" 
                        type="file" 
                        accept=".pdf,application/pdf" 
                        on:change={handleEventBriefUpload} 
                        class="hidden"
                      />
                    </div>
                    {#if eventBriefUrl}
                      <a href={eventBriefUrl} target="_blank" class="mt-2 text-blue-600 hover:underline text-sm flex items-center">
                        <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        View uploaded PDF
                      </a>
                    {/if}
                  </div>
          </div>

        {:else if activeFestiveTab === 'vendors'}
          <!-- Vendors Tab -->
          <div class="flex flex-col gap-4">
            {#if !eventId}
              <p class="text-gray-500">Please save the event first before managing vendors</p>
            {/if}

            <!-- Terms Agreement -->
            <div class="my-4 p-4 bg-gray-50 rounded-lg text-sm border border-gray-200">
              <div class="flex items-start">
                <input type="checkbox" id="termsAgreement" bind:checked={termsAgreed} 
                       class="mt-1 mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500" />
                <label for="termsAgreement" class="cursor-pointer text-gray-700">
                  I agree that:
                  <ul class="mt-2 pl-6 list-disc space-y-1">
                    <li>City Services may display event details publicly for promotion</li>
                    <li>I have obtained all necessary permissions for included content</li>
                    <li>The information complies with privacy laws</li>
                    <li>I retain copyright but grant display rights</li>
                    <li>Event details may appear in city calendars and apps</li>
                  </ul>
                </label>
              </div>
            </div>
          </div>
        {/if}
      </div>

      <!-- Mobile Navigation Buttons -->
      <div class="md:hidden flex justify-between mt-6">
        <button 
          on:click={previousTab}
          class="px-4 py-2 bg-gray-100 rounded-lg text-gray-700"
          disabled={isFirstTab}
        >
          Back
        </button>
        <button 
          on:click={nextTab}
          class="px-4 py-2 bg-blue-100 text-blue-600 rounded-lg"
          disabled={isLastTab}
        >
          Next
        </button>
      </div>
    </div>
  {:else}
    <!-- Other tabs content -->
    <div class="bg-white p-8 text-center text-gray-600 rounded-b-lg shadow-md">
      <p>{activeMainTab} event form will be implemented here</p>
    </div>
  {/if}

  <!-- Action Buttons -->
  <div class="mt-6 flex justify-between">
    <button 
      on:click={() => dispatch('cancel')}
      class="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
      disabled={disabled}
    >
      Cancel
    </button>
    <button 
      on:click={saveEvent}
      class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
      disabled={disabled}
    >
      {#if disabled}
        <svg class="animate-spin h-5 w-5 mr-2 text-white inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        Saving...
      {:else}
        Save Event
      {/if}
    </button>
  </div>
</div>

<style>
  button, [type="button"] {
    -webkit-tap-highlight-color: transparent;
    transition: transform 0.1s, background-color 0.2s;
  }
  button:active {
    transform: scale(0.98);
  }
</style>