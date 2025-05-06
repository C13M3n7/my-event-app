<script lang="ts">
  export let searchQuery: string;
  export let selectedCategory: string;
  export let showFilterDropdown: boolean;
  export let availableCategories: string[];
</script>

<div class="sticky top-0 z-10 flex items-center justify-between p-3 bg-white shadow-sm">
  <div class="flex-1 mr-2">
    <input 
      type="text" 
      bind:value={searchQuery} 
      placeholder="Search menu..." 
      class="w-full px-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
    />
  </div>
  <div class="relative">
    <button 
      on:click={() => showFilterDropdown = !showFilterDropdown}
      class="p-2 text-gray-700 rounded-full hover:bg-gray-100" 
    >
      <div class="flex items-center justify-center w-6 h-6">
        <div class="relative">
          <div class="w-6 h-1 bg-gray-600 rounded-full mb-1"></div>
          <div class="w-6 h-1 bg-gray-600 rounded-full mb-1"></div>
          <div class="absolute top-0 left-0 w-2 h-2 bg-amber-500 rounded-full"></div>
        </div>
      </div>
    </button>
    {#if showFilterDropdown}
      <div class="absolute right-0 mt-2 w-40 bg-white rounded-md shadow-lg z-20">
        <select 
          bind:value={selectedCategory}
          class="w-full px-3 py-2 text-sm border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {#each availableCategories as category}
            <option value={category}>{category}</option>
          {/each}
        </select>
      </div>
    {/if}
  </div>
</div>