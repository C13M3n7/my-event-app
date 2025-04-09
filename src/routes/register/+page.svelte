<script>
  import { goto } from '$app/navigation';
  import RegistrationForm from '$lib/components/RegistrationForm.svelte';
  
  let selectedType = null;
</script>

{#if !selectedType}
  <!-- Selection Interface -->
  <div class="register-options">
    <h2>Choose Registration Type</h2>
  
    <div class="cards">
      <button
        class="card"
        on:click={() => selectedType = 'event'}
        type="button"
      >
        <h3>Event Registration</h3>
        <p>Basic details for event access</p>
      </button>
  
      <button
        class="card"
        on:click={() => selectedType = 'loyalty'}
        type="button"
      >
        <h3>Loyalty Program</h3>
        <p>Get perks and auto-filled details</p>
      </button>
    </div>
  </div>
  
{:else}
  <!-- Show the appropriate registration form -->
  <RegistrationForm 
    title={selectedType === 'event' ? 'Event Registration' : 'Join Loyalty Program'}
    userType={selectedType}
    successRedirect={selectedType === 'event' ? '/event-dashboard' : '/userdashboard'}
  />
{/if}

<style>
  .register-options {
    max-width: 800px;
    margin: 0 auto;
    padding: 2rem;
    text-align: center;
  }
  
  h2 {
    margin-bottom: 2rem;
    font-size: 1.8rem;
  }
  
  .cards {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 2rem;
  }
  
  .card {
    padding: 2rem;
    border-radius: 8px;
    background: #f5f5f5;
    cursor: pointer;
    transition: transform 0.2s, box-shadow 0.2s;
  }
  
  .card:hover {
    transform: translateY(-5px);
    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  }
  
  .card h3 {
    margin-bottom: 1rem;
    color: #333;
  }
  
  .card p {
    color: #666;
  }
</style>