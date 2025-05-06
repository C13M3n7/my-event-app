<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  export let phone = '';
  export let countryCode = '+60';
  export let displayPhone = '';
  export let error = '';
  export let isInputValid = false;
  export let isLoading = false;

  const dispatch = createEventDispatcher();
  $: {
    isInputValid = phone.length > 7 && /^\d+$/.test(phone);
    displayPhone = `${countryCode}${phone}`; // Auto-update displayPhone
  }
</script>

<div class="flex items-center mb-4">
  <select bind:value={countryCode} class="w-1/3 p-3 border rounded-lg mr-2">
    <option value="+60">Malaysia (+60)</option>
    <option value="+65">Singapore (+65)</option>
    <option value="+1">USA (+1)</option>
  </select>
  <input
    type="tel"
    bind:value={phone}
    placeholder="123456789"
    class="w-2/3 px-4 py-3 border rounded-lg"
  />
</div>

<p class="text-gray-500 text-sm mb-4">We'll send a code to: {displayPhone}</p>

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