<!-- src/features/events/components/EventVenue.svelte -->
<script lang="ts">
    import type { Event } from '../types';
    export let event: Event;
    
    // Simplified helper function since location is now just a string
    function getLocationString(location: string) {
        return location || 'Unknown Location';
    }
</script>

<!-- Venue Map -->
<div class="bg-white rounded-2xl p-5 mb-4 shadow-md">
    <h2 class="text-[20px] text-[#075985] mb-4">Venue: {getLocationString(event.location)}</h2>
    <div class="mt-4">
        {#if event.venueMapUrl}
            <img src={event.venueMapUrl} alt="{getLocationString(event.location)} Map" class="w-full h-[200px] object-cover rounded-xl mb-3" />
        {:else}
            <div class="w-full h-[200px] bg-gray-100 rounded-xl mb-3 flex items-center justify-center">
                <p class="text-gray-500">No venue map available</p>
            </div>
        {/if}
        <div class="grid grid-cols-3 gap-2">
            <a href={`https://maps.apple.com/?q=${encodeURIComponent(getLocationString(event.location))}`} class="flex items-center justify-center gap-1 p-2 bg-white border border-gray-200 rounded-md text-xs text-[#075985]">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="#075985"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 010-5 2.5 2.5 0 010 5z"/></svg>
                Apple Maps
            </a>
            <a href={`https://www.google.com/maps?q=${encodeURIComponent(getLocationString(event.location))}`} class="flex items-center justify-center gap-1 p-2 bg-white border border-gray-200 rounded-md text-xs text-[#075985]">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="#075985"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 010-5 2.5 2.5 0 010 5z"/></svg>
                Google Maps
            </a>
            <a href={`https://www.waze.com/ul?q=${encodeURIComponent(getLocationString(event.location))}`} class="flex items-center justify-center gap-1 p-2 bg-white border border-gray-200 rounded-md text-xs text-[#075985]">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="#075985"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 010-5 2.5 2.5 0 010 5z"/></svg>
                Waze
            </a>
        </div>
    </div>
</div>

<!-- Layout -->
{#if event.layoutUrl}
<div class="bg-white rounded-2xl p-5 mb-4 shadow-md">
    <h2 class="text-[20px] text-[#075985] mb-4">Event Layout</h2>
    <img src={event.layoutUrl} alt="Event Layout" class="w-full rounded-xl mt-3" />
</div>
{/if}

<!-- Organizers -->
{#if event.organizers.length > 0}
<div class="bg-white rounded-2xl p-5 mb-4 shadow-md">
    <h2 class="text-[20px] text-[#075985] mb-4">Organizers</h2>
    <div class="space-y-3">
        {#each event.organizers as organizer}
            <div>
                <p class="text-[14px] mb-1"><strong>{organizer.name}</strong></p>
                <p class="text-sm text-slate-500">{organizer.role}</p>
            </div>
        {/each}
    </div>
</div>
{/if}