<!-- 'Venue' tab content -->
<script lang="ts">
    import type { Event, FestivalData } from '../types';

    export let event: Event;
    export let festivalData: FestivalData;
</script>


<!-- Venue Map -->
<div class="bg-white rounded-2xl p-5 mb-4 shadow-md">
    <h2 class="text-[20px] text-[#075985] mb-4">Venue: {event.location}</h2>
    <div class="mt-4">
        <img src="/images/events/venue.png" alt="{event.location} Map" class="w-full h-[200px] object-cover rounded-xl mb-3" />
        <div class="grid grid-cols-3 gap-2">
            <a href="https://maps.apple.com/?q=Tropics+City+Kuching" class="flex items-center justify-center gap-1 p-2 bg-white border border-gray-200 rounded-md text-xs text-[#075985]">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="#075985"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 010-5 2.5 2.5 0 010 5z"/></svg>
                Apple Maps
            </a>
            <a href="https://www.google.com/maps?q=Tropics+City+Kuching" class="flex items-center justify-center gap-1 p-2 bg-white border border-gray-200 rounded-md text-xs text-[#075985]">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="#075985"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 010-5 2.5 2.5 0 010 5z"/></svg>
                Google Maps
            </a>
            <a href="https://www.waze.com/ul?q=Tropics+City+Kuching" class="flex items-center justify-center gap-1 p-2 bg-white border border-gray-200 rounded-md text-xs text-[#075985]">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="#075985"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 010-5 2.5 2.5 0 010 5z"/></svg>
                Waze
            </a>
        </div>
    </div>
</div>

<!-- Festival Layout -->
<div class="bg-white rounded-2xl p-5 mb-4 shadow-md">
    <h2 class="text-[20px] text-[#075985] mb-4">Festival Ground Layout</h2>
    <img src="/images/events/festive_ground_layout.png" alt="Festival Layout" class="w-full rounded-xl mt-3" />
</div>

<!-- Partners -->
<div class="bg-white rounded-2xl p-5 mb-4 shadow-md">
    <h2 class="text-[20px] text-[#075985] mb-4">Vendors & Organizers</h2>
    <div class="grid grid-cols-2 gap-4 my-4">
        {#each festivalData.vendors as vendor}
            <div class="text-center">
                <div class="w-full h-[60px] bg-gray-100 rounded-md mb-2"></div>
                <p>{vendor}</p>
            </div>
        {/each}
    </div>
    <div class="border-t border-gray-200 pt-4 mt-6">
        <h3 class="text-[#075985] text-[16px] mb-3">Organizing Committee</h3>
        {#each festivalData.organizers as org}
            <p class="text-[14px] mb-2"><strong>{org.name}</strong> - {org.role}</p>
        {/each}
    </div>
</div>