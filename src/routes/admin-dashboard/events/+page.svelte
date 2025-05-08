<script>
  import EventManager from '$features/adminDashboard/components/EventManager.svelte';

  let events = [];

  function addEvent(newEvent) {
    if (!newEvent || typeof newEvent !== 'object') return;
    try {
      if (!newEvent.id) newEvent.id = Date.now();
      events = [...events, newEvent];
    } catch (err) {
      console.error('Add Event Error:', err);
    }
  }

  function updateEvent(updated) {
    events = events.map(event => event.id === updated.id ? updated : event);
  }

  function deleteEvent(id) {
    events = events.filter(event => event.id !== id);
  }
</script>

<section class="p-4 sm:p-8">
  <EventManager
    {events}
    on:saveEvent={(e) => addEvent(e.detail)}
    on:updateEvent={(e) => updateEvent(e.detail)}
    on:deleteEvent={(e) => deleteEvent(e.detail)}
  />
</section>