<script>
  import RegistrationForm from '$lib/components/RegistrationForm.svelte';
</script>

<RegistrationForm 
  title="Event Registration" 
  userType="event" 
  successRedirect="/event-dashboard"  
/>