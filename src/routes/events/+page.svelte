<script lang="ts">
    import { onMount } from 'svelte';
    import { getUpcomingEvents, type Event } from '$features/events/services/eventService';
    import EventCard from '$features/events/components/EventCard.svelte';
    import { Timestamp } from 'firebase/firestore';

    let events: { id: string; title: string; date: string; location: string; image: string }[] = [];
  
    onMount(async () => {
  console.log("Fetching events...");
  const fetchedEvents = await getUpcomingEvents();
  console.log("Fetched events:", fetchedEvents);

  if (!fetchedEvents || fetchedEvents.length === 0) {
    console.log("No events found.");
    return;
  }

  // Map the fetched events to match EventCard props
  events = fetchedEvents.map((event) => {
    console.log(`Processing event: ${event.title}`);

    // Initialize eventDate as "Date not available"
    let eventDate = "Date not available";

    // Log the festival_dates field to inspect its content
    console.log("Festival dates:", event.festival_dates);

    // Check if start_date exists and is a Firestore Timestamp
    if (event.start_date && event.start_date instanceof Timestamp) {
      const date = event.start_date.toDate();
      eventDate = date.toLocaleDateString();
    } else if (event.festival_dates?.start && event.festival_dates.start instanceof Timestamp) {
      const date = event.festival_dates.start.toDate();
      console.log(`Festival start date found: ${date}`);
      eventDate = date.toLocaleDateString();
    } else if (event.retail_dates?.start && event.retail_dates.start instanceof Timestamp) {
      const date = event.retail_dates.start.toDate();
      eventDate = date.toLocaleDateString();
    } else {
      console.log("No valid date fields found.");
    }

    // Handle location
    const eventLocation = event.location?.address || event.location?.name || "Location not available";
    console.log(`Event location: ${eventLocation}`);

    // Return the transformed event object
    return {
      id: event.id,
      title: event.title,
      date: eventDate,
      location: eventLocation,
      image: event.image_url,
    };
  });

  console.log('Transformed events:', events);
});

  </script>
  
  <div class="p-8">
    <div class="container mx-auto">
      {#if events.length > 0}
        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {#each events as event (event.id)}
          <a href={`/events/${event.id}`} class="block hover:opacity-90 transition-opacity">
            <EventCard {event} />
          </a>
        {/each}        
        </div>
      {:else}
        <p class="text-center text-xl text-gray-600">No upcoming events available.</p>
      {/if}
    </div>
  </div>