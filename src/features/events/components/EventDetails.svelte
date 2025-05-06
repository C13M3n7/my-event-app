<script lang="ts">
    import EventTabs from './EventTabs.svelte';
    import { goto } from '$app/navigation';
    import type { Event, FestivalData } from '../types';
  
    export let event: Event = {
        title: '',
        location: '',
        image: '',
        price: '0', // Default price
        // other required properties
    };

    const festivalData: FestivalData = {
        videoUrl: "https://youtu.be/festival2024",
        socialMedia: {
            instagram: "@harvestfusion",
            facebook: "HarvestFusionFest"
        },
        organizers: [
            { name: "Sarawak Cultural Board", role: "Main Organizer" },
            { name: "Kuching City Council", role: "Venue Partner" }
        ],
        vendors: ["Bakeh Cookhouse", "Tuak Collective", "Artisan Market", "Gawai Cookies Co"]
    };

    function navigateToPayment() {
        // Safely handle cases where price might be undefined
        const price = event?.price ? event.price.replace(/\D/g, '') : '50';
        goto(`/ticket-payment?event=${encodeURIComponent(event.title)}&type=festival&price=${price}`);
    }
</script>

<main class="max-w-[600px] mx-auto pb-20">
    <!-- Back button -->
    <div class="sticky top-0 z-10 px-4 py-3 bg-white/80 backdrop-blur">
        <a href="/events" class="inline-flex items-center justify-center w-10 h-10 rounded-full bg-white text-sky-800 shadow-md" aria-label="Back">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M15 18L9 12L15 6" stroke="currentColor" stroke-width="2" />
            </svg>
        </a>
    </div>

    <!-- Hero Section -->
    <section class="relative mb-4">
        <img src={event.image} alt={event.title} class="w-full h-[300px] md:h-[400px] object-cover block" />
        <div class="absolute bottom-0 left-0 right-0 px-4 py-6 bg-gradient-to-t from-black/80 to-transparent text-white">
            <h1 class="text-2xl font-bold leading-snug m-0">{event.title}</h1>
            <p class="mt-1 text-base opacity-90">{event.location}</p>
        </div>
    </section>

    <!-- Tab Navigation and Content -->
    <EventTabs {event} {festivalData} />

    <!-- Fixed CTA -->
    <div class="fixed bottom-0 left-0 right-0 px-4 py-4 bg-gradient-to-t from-white to-transparent flex justify-center">
        <button
            on:click={navigateToPayment}
            class="bg-emerald-500 text-white rounded-full px-6 py-4 text-base font-semibold flex items-center gap-2 shadow-lg w-full max-w-[300px] justify-center"
        >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v10a2 2 0 002 2h14a2 2 0 002-2V7a2 2 0 00-2-2H5z" stroke="white" stroke-width="2" />
            </svg>
            Get Tickets
        </button>
    </div>
</main>