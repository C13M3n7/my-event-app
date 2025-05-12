<script lang="ts">
  import { onMount } from 'svelte';
  import { collection, getDocs } from 'firebase/firestore';
  import { db } from '$lib/firebase';
  import EventCard from '$features/events/components/EventCard.svelte';

  let events: {
    id: string;
    title: string;
    date: string;
    locationName: string;
    image: string;
  }[] = [];

  onMount(async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'events'));
      events = querySnapshot.docs.map(doc => {
        const eventData = doc.data();
        
        // Format date
        let eventDate = "Date not available";
        if (eventData.startDate) {
          const date = new Date(eventData.startDate);
          eventDate = date.toLocaleDateString();
        }

        // Get location name - with fallback
        const locationName = eventData.locationName || 
                           (typeof eventData.location === 'string' ? eventData.location : "Location not available");

        return {
          id: doc.id,
          title: eventData.title || "Untitled Event",
          date: eventDate,
          locationName: locationName,
          image: eventData.imagePreview || "/placeholder-event.jpg"
        };
      });
    } catch (error) {
      console.error("Error fetching events:", error);
    }
  });
</script>

<div class="p-8">
  <div class="container mx-auto">
    {#if events.length > 0}
      <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
        {#each events as event (event.id)}
          <EventCard 
            event={{
              id: event.id,
              title: event.title,
              date: event.date,
              location: event.locationName, // Passing locationName as location
              image: event.image
            }} 
          />
        {/each}
      </div>
    {:else}
      <p class="text-center text-xl text-gray-600">No upcoming events available.</p>
    {/if}
  </div>
</div>