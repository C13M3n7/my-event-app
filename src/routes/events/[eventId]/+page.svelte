<script lang="ts">
  import EventDetails from '$features/events/components/EventDetails.svelte';
  export let data;
</script>

<EventDetails event={data.event} />
