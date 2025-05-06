<script lang="ts">
    import EventAbout from './EventAbout.svelte';
    import EventProgram from './EventProgram.svelte';
    import EventVenue from './EventVenue.svelte';
    import type { Event, FestivalData, EventTab, FestivalDay } from '../types';

    export let event: Event;
    export let festivalData: FestivalData;

    let activeTab: EventTab = 'about';
    let selectedDay: FestivalDay = 'festival';
</script>

<!-- Tab Navigation -->
<nav class="flex border-b border-slate-200 px-4 mb-4">
    <button
        on:click={() => activeTab = 'about'}
        class="flex-1 flex flex-col items-center py-3 text-xs gap-1 text-slate-500 relative"
        class:text-sky-800={activeTab === 'about'}
    >
        <svg width="24" height="24" fill="none">
            <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" stroke="currentColor" stroke-width="2"/>
            <path d="M12 16v-4m0-4h.01" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
        </svg>
        <span>About</span>
        {#if activeTab === 'about'}
            <span class="absolute bottom-[-1px] left-0 right-0 h-0.5 bg-sky-800 rounded-sm"></span>
        {/if}
    </button>

    <button
        on:click={() => activeTab = 'program'}
        class="flex-1 flex flex-col items-center py-3 text-xs gap-1 text-slate-500 relative"
        class:text-sky-800={activeTab === 'program'}
    >
        <svg width="24" height="24" fill="none">
            <path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" stroke="currentColor" stroke-width="2"/>
        </svg>
        <span>Program</span>
        {#if activeTab === 'program'}
            <span class="absolute bottom-[-1px] left-0 right-0 h-0.5 bg-sky-800 rounded-sm"></span>
        {/if}
    </button>

    <button
        on:click={() => activeTab = 'map'}
        class="flex-1 flex flex-col items-center py-3 text-xs gap-1 text-slate-500 relative"
        class:text-sky-800={activeTab === 'map'}
    >
        <svg width="24" height="24" fill="none">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" stroke="currentColor" stroke-width="2"/>
            <path d="M12 13a3 3 0 100-6 3 3 0 000 6z" stroke="currentColor" stroke-width="2"/>
        </svg>
        <span>Venue</span>
        {#if activeTab === 'map'}
            <span class="absolute bottom-[-1px] left-0 right-0 h-0.5 bg-sky-800 rounded-sm"></span>
        {/if}
    </button>
</nav>

<!-- Content Sections -->
<div class="px-4 mb-6">
    {#if activeTab === 'about'}
        <EventAbout {event} {festivalData} {selectedDay} />
    {:else if activeTab === 'program'}
        <EventProgram {festivalData} {selectedDay} />
    {:else if activeTab === 'map'}
        <EventVenue {event} {festivalData} />
    {/if}
</div>