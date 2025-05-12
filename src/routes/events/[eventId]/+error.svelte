<script lang="ts">
    import { page } from '$app/stores';
    import { enhance } from '$app/forms';
    
    export let data;
  </script>
  
  <div class="max-w-4xl mx-auto p-6">
    <h1 class="text-2xl font-bold mb-4">Event Not Found</h1>
    <p class="text-red-500 mb-4">{data?.message || 'The event could not be found'}</p>
    
    {#if data?.eventId}
      <p class="mb-2">Event ID: <code class="bg-gray-100 p-1 rounded">{data.eventId}</code></p>
    {/if}
    
    {#if data?.suggestion}
      <p class="mb-6 text-gray-600">{data.suggestion}</p>
    {/if}
    
    <div class="flex gap-4">
      <a 
        href="/events" 
        class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
      >
        Browse Events
      </a>
      <button 
        on:click={() => window.location.reload()} 
        class="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 transition-colors"
      >
        Try Again
      </button>
    </div>
  </div>