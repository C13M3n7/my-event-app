<script lang="ts">
  import RegisterEvent from '$features/authentication/components/RegisterEvent.svelte';
  import RegisterLoyalty from '$features/authentication/components/RegisterLoyalty.svelte';
  
  let selectedType: 'event' | 'loyalty' | null = null;
</script>

<div class="min-h-screen flex items-center justify-center bg-gray-50 p-4">
  {#if !selectedType}
    <!-- Type Selection UI -->
    <div class="w-full max-w-md bg-white rounded-xl shadow-sm p-8 text-center">
      <h2 class="text-2xl font-bold text-gray-800 mb-8">Choose Registration Type</h2>
    
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <button 
          on:click={() => selectedType = 'event'}
          class="p-6 border border-gray-200 rounded-lg bg-white hover:border-indigo-500 hover:shadow-md transition-all text-left"
        >
          <h3 class="text-lg font-semibold text-gray-800 mb-2">Event Registration</h3>
          <p class="text-sm text-gray-500">Basic access with email/phone only</p>
        </button>
    
        <button 
          on:click={() => selectedType = 'loyalty'}
          class="p-6 border border-gray-200 rounded-lg bg-white hover:border-indigo-500 hover:shadow-md transition-all text-left"
        >
          <h3 class="text-lg font-semibold text-gray-800 mb-2">Loyalty Program</h3>
          <p class="text-sm text-gray-500">Full profile with rewards</p>
        </button>
      </div>
    </div>
  {:else if selectedType === 'event'}
    <svelte:component this={RegisterEvent} />
  {:else}
    <svelte:component this={RegisterLoyalty} />
  {/if}
</div>