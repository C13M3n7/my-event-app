<script lang="ts">
  import EventDetails from '$features/events/components/EventDetails.svelte';
  import type { Event } from '$features/events/types';
  
  export let data: { event: Event };
</script>

<EventDetails event={data.event} />