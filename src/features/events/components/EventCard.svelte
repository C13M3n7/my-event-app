<script lang="ts">
    export let event: {
      id: string;
      title: string;
      date: string;
      location: string | { name: string }; // Handle both cases
      image: string;
    };
  
    // Check if location is a string or an object and extract the correct value
    const locationName = typeof event.location === 'string'
      ? event.location
      : event.location?.name || "Location not available";
  </script>
  
  <a
    href={`/events/${event.id}`}
    class="block bg-white rounded-lg shadow-lg overflow-hidden hover:scale-105 transition-transform duration-300 ease-in-out"
  >
    <img
      src={event.image}
      alt={event.title}
      class="w-full h-48 object-cover"
    />
    <div class="p-4">
      <h2 class="text-xl font-semibold text-emerald-700 mb-2">{event.title}</h2>
      <p class="text-gray-600 text-base">{event.date} · {locationName}</p>
    </div>
  </a>
  