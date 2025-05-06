<!-- src/routes/fnb-menu/+page.svelte -->
<script lang="ts">
  export let data;
  import VendorCard from '$features/fnb/components/VendorCard.svelte';
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  
  let searchQuery = '';
  let selectedCategory = '';
  let showCategoryDropdown = false;

  $: filteredVendors = data?.vendors?.filter(vendor => {
    const query = searchQuery.toLowerCase();
    const matchesCategory = selectedCategory ? 
      vendor.categories?.toLowerCase()?.includes(selectedCategory.toLowerCase()) : true;
    
    return (
      (vendor.name?.toLowerCase()?.includes(query) || 
       vendor.description?.toLowerCase()?.includes(query)) &&
      matchesCategory
    );
  }) || [];
</script>

<div class="min-h-screen bg-gray-50">
  <!-- iOS-style Header with Back Button -->
  <header class="sticky top-0 z-20 bg-white border-b border-gray-200 px-4 py-3">
    <div class="flex items-center">
      <button 
        on:click={() => goto('/')}
        class="p-2 -ml-2 rounded-full active:bg-gray-100"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
        </svg>
      </button>
      <h1 class="text-xl font-semibold ml-2">Food & Beverage</h1>
    </div>
  </header>

  <!-- Event Title on Plain Background -->
  <div class="bg-white px-6 py-4 border-b border-gray-200">
    <h2 class="text-2xl font-bold text-gray-900 text-center">Harvest Fusion Festival 2025</h2>
  </div>

  <!-- Hero Image without Text -->
  <div class="relative h-48 bg-gray-900 overflow-hidden">
    <img 
      src="/images/events/event1_bg.png" 
      alt="Festival Background"
      class="w-full h-full object-cover"
    />
  </div>

  <!-- Search and Filter -->
  <div class="px-4 mt-4 space-y-4">
    <!-- Search Bar -->
    <div class="relative">
      <input
        type="text"
        bind:value={searchQuery}
        placeholder="Search vendors..."
        class="w-full px-4 py-3 pl-10 rounded-lg bg-white border border-gray-200 text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
      />
      <svg class="absolute left-3 top-3.5 h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
    </div>

    <!-- Category Filter -->
    <div class="relative">
      <button 
        on:click={() => showCategoryDropdown = !showCategoryDropdown}
        class="w-full flex items-center justify-between px-4 py-3 bg-white rounded-lg border border-gray-200"
      >
        <span class="text-gray-800">{selectedCategory || 'All Categories'}</span>
        <svg 
          class={`h-5 w-5 text-gray-500 transition-transform ${showCategoryDropdown ? 'rotate-180' : ''}`}
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
        >
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      
      {#if showCategoryDropdown}
        <div class="absolute z-20 mt-1 w-full bg-white rounded-lg shadow-lg border border-gray-200">
          <div class="py-1 max-h-60 overflow-auto">
            <button 
              on:click={() => { selectedCategory = ''; showCategoryDropdown = false; }}
              class={`w-full text-left px-4 py-2 ${!selectedCategory ? 'bg-gray-100 text-gray-900' : 'text-gray-700 hover:bg-gray-50'}`}
            >
              All Categories
            </button>
            <button 
              on:click={() => { selectedCategory = 'Asian'; showCategoryDropdown = false; }}
              class={`w-full text-left px-4 py-2 ${selectedCategory === 'Asian' ? 'bg-gray-100 text-gray-900' : 'text-gray-700 hover:bg-gray-50'}`}
            >
              Asian
            </button>
            <button 
              on:click={() => { selectedCategory = 'Western'; showCategoryDropdown = false; }}
              class={`w-full text-left px-4 py-2 ${selectedCategory === 'Western' ? 'bg-gray-100 text-gray-900' : 'text-gray-700 hover:bg-gray-50'}`}
            >
              Western
            </button>
            <!-- Add more categories as needed -->
          </div>
        </div>
      {/if}
    </div>
  </div>

  <!-- Vendor Grid -->
  <main class="p-4">
    {#if filteredVendors.length === 0}
      <div class="text-center py-16">
        <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <h3 class="mt-4 text-lg font-medium text-gray-900">No vendors found</h3>
        <p class="mt-1 text-sm text-gray-500">
          {searchQuery ? 'Try adjusting your search' : 'No vendors match your filters'}
        </p>
      </div>
    {:else}
      <div class="grid grid-cols-1 gap-4">
        {#each filteredVendors as vendor (vendor.id)}
          <a 
            href={`/fnb-menu/${vendor.id}`} 
            class="block active:scale-[0.98] transition-transform"
          >
            <VendorCard 
              {...vendor} 
              features={vendor.features || ''} 
              categories={vendor.categories || ''} 
            />
          </a>
        {/each}
      </div>
    {/if}
  </main>

  
</div>