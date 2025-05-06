<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  export let email = '';
  export let error = '';
  export let isInputValid = false;
  export let isLoading = false;

  const dispatch = createEventDispatcher();
  $: isInputValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
</script>

<input
  type="email"
  bind:value={email}
  placeholder="your@email.com"
  class="w-full px-4 py-3 border rounded-lg mb-4"
/>

{#if error}
  <div class="text-red-500 mb-4 text-sm">{error}</div>
{/if}

<button
  on:click={() => dispatch('send')}
  disabled={!isInputValid || isLoading}
  class="w-full bg-blue-600 text-white py-3 rounded-lg"
>
  {isLoading ? 'Sending...' : 'Get Verification Code'}
</button>
