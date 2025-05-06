<script lang="ts">    
    export let event: {
        title: string;
        // Add other event properties if needed
    };
    
    export let festivalData: {
        videoUrl: string;
        socialMedia: {
            instagram: string;
        };
    };

    // Explicitly type selectedDay as either 'retail' or 'festival'
    export let selectedDay: 'retail' | 'festival' = 'retail';
</script>

<!-- Festival Dates -->
<div class="bg-white rounded-2xl p-5 mb-4 shadow-md">
    <h2 class="text-xl text-sky-900 mb-4">Festival Dates</h2>
    <div class="flex gap-2 mb-3">
        <button
            class={`flex-1 px-2 py-2 text-sm rounded-lg ${selectedDay === 'retail' ? 'bg-sky-900 text-white' : 'bg-slate-100'}`}
            on:click={() => selectedDay = 'retail'}>
            Retail & Bazaar
        </button>
        <button
            class={`flex-1 px-2 py-2 text-sm rounded-lg ${selectedDay === 'festival' ? 'bg-sky-900 text-white' : 'bg-slate-100'}`}
            on:click={() => selectedDay = 'festival'}>
            Main Festival
        </button>
    </div>
    {#if selectedDay === 'retail'}
        <p class="text-lg font-semibold my-2">23 May 2025 (Fri) - 27 May 2025 (Tue)</p>
    {:else}
        <p class="text-lg font-semibold my-2">28 May 2025 (Wed) - 31 May 2025 (Sat)</p>
    {/if}
    <p class="text-sm text-slate-500">1000-1500 visitors daily</p>
</div>

<!-- Rest of your component remains the same -->

<!-- Festival Highlights -->
<div class="bg-white rounded-2xl p-5 mb-4 shadow-md">
    <h2 class="text-xl text-sky-900 mb-4">Why Attend {event.title}?</h2>
    <ul class="pl-5 list-disc text-[15px] leading-snug">
        <li class="mb-2">The only urban Gawai festival with premium experience</li>
        <li class="mb-2">Exclusive fusion food by reputable vendors</li>
        <li class="mb-2">Immersive cultural experience for families</li>
        <li class="mb-2">"Udah Makai Buai" environmental initiative</li>
    </ul>
</div>

<!-- Video Preview -->
<div class="mt-6">
    <h2 class="text-xl text-sky-900">{event.title} Highlights</h2>
    <div class="relative rounded-xl overflow-hidden mt-3">
        <img src="/images/events/vid_preview.png" alt="{event.title} Highlights" class="w-full h-[180px] object-cover" />
        <a href={festivalData.videoUrl} class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-black/60 w-[60px] h-[60px] rounded-full flex items-center justify-center" aria-label="Play highlights video">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="#ffffff">
                <path d="M8 5v14l11-7z"/>
            </svg>
        </a>
    </div>

    <!-- Social Link -->
    <div class="mt-3">
        <a href={`https://instagram.com/${festivalData.socialMedia.instagram}`} target="_blank" class="inline-flex items-center gap-2 text-sky-900 font-medium no-underline">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="#E1306C">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
            </svg>
            @harvestfusion
        </a>
    </div>
</div>