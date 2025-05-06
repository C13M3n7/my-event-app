<script lang="ts">
    export let onClick: () => void = () => {};
  </script>
  
  <button
    class="flex items-center gap-2 px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-md shadow-sm hover:bg-gray-100 transition"
    on:click={onClick}
  >
    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
        d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-.293.707l-6.414 6.414A1 1 0 0014 13v5l-4 2v-7a1 1 0 00-.293-.707L3.293 6.707A1 1 0 013 6V4z" />
    </svg>
    <span class="text-sm font-medium">Filter</span>
  </button>
  