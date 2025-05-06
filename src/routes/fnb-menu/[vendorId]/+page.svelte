<script lang="ts">
  import { cart, updateItem, getItemQuantity } from '$features/fnb/stores/cartStore';
  import { onMount } from 'svelte';
  import CartSummaryModal from '$features/fnb/components/CartSummaryModal.svelte';
  import { goto } from '$app/navigation';
  import { error } from '@sveltejs/kit';

  export let data;

  // Define or import the MenuItem type
  type MenuItem = {
    id: string;
    name: string;
    price: number;
    availability: boolean;
    category?: string | string[];
    dietary_information?: string[];
    image_url?: string;
    description?: string;
  };

  // Validate data
  if (!data?.vendorInfo) {
    throw error(404, 'Vendor not found');
  }

  // State
  let searchQuery = '';
  let selectedCategory = 'All';
  let showShareOptions = false;
  let showCartModal = false;
  let showFilterOptions = false;
  let showFullDescription = false;
  let dietaryFilters = {
    halal: false,
    vegetarian: false,
    vegan: false,
  };
  let isExpanded = false;

  // Dynamic price range
  $: minPrice = data.menuItems.length > 0 ? Math.min(...data.menuItems.map(item => item.price)) : 0;
  $: maxPrice = data.menuItems.length > 0 ? Math.max(...data.menuItems.map(item => item.price)) : 100;
  let priceRange = [minPrice, maxPrice];
  $: if (data.menuItems) {
    priceRange = [minPrice, maxPrice];
  }

  // Safe data access
  $: vendorInfo = data?.vendorInfo || {};
  $: menuItems = data?.menuItems || [];

  // Group items by category, excluding unavailable items
  $: categorizedItems = menuItems.reduce((acc: Record<string, MenuItem[]>, item) => {
    if (item.availability === true && item.price >= priceRange[0] && item.price <= priceRange[1]) {
      const itemCategories = Array.isArray(item.category) 
        ? item.category.map(c => c.trim()) 
        : [String(item.category || 'Other').trim()];
      
      itemCategories.forEach(category => {
        const normalizedCategory = category.trim();
        if (!acc[normalizedCategory]) {
          acc[normalizedCategory] = [];
        }
        if (
          (!dietaryFilters.halal || item.dietary_information?.some?.(d => d.toLowerCase().includes('halal'))) &&
          (!dietaryFilters.vegetarian || item.dietary_information?.some?.(d => d.toLowerCase().includes('vegetarian'))) &&
          (!dietaryFilters.vegan || item.dietary_information?.some?.(d => d.toLowerCase().includes('vegan')))
        ) {
          acc[normalizedCategory].push(item);
        }
      });
    }
    return acc;
  }, {});

  // Derive categories from categorizedItems
  $: categories = ['All', ...Object.keys(categorizedItems).sort()];

  // Filter items based on search, category, and availability
  $: filteredItems = menuItems.filter(item => {
    const matchesSearch = searchQuery === '' || 
      item.name?.toLowerCase()?.includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || 
      (Array.isArray(item.category) ? 
        item.category.includes(selectedCategory) : 
        item.category === selectedCategory);
    const matchesPrice = item.price >= priceRange[0] && item.price <= priceRange[1];
    const matchesDietary = (
      (!dietaryFilters.halal || item.dietary_information?.includes?.('Halal')) &&
      (!dietaryFilters.vegetarian || item.dietary_information?.includes?.('Vegetarian')) &&
      (!dietaryFilters.vegan || item.dietary_information?.includes?.('Vegan')) 
    );
    return (
      item.availability === true &&
      matchesSearch &&
      matchesCategory &&
      matchesPrice &&
      matchesDietary
    );
  });

  /**
   * Updates the quantity of an item in the cart
   * @param item - The menu item to update
   * @param change - The quantity change (+1 or -1)
   */
  function handleQuantityChange(item: MenuItem, change: number) {
    updateItem(
      vendorInfo.id,
      {
        id: vendorInfo.id,
        name: vendorInfo.name,
        image: vendorInfo.image || '/images/default-vendor.jpg'
      },
      {
        id: item.id,
        name: item.name,
        price: item.price,
        image: item.image_url,
        dietaryInfo: {
          halal: item.dietary_information?.includes('Halal'),
          vegetarian: item.dietary_information?.includes('Vegetarian'),
          vegan: item.dietary_information?.includes('Vegan')
        }
      },
      change
    );
  }

  /**
   * Gets the current quantity of an item in cart
   */
  function CaptureItemQuantity(itemId: string): number {
    return getItemQuantity($cart, vendorInfo.id, itemId);
  }

  /**
   * Handles adding/removing items with animation feedback
   */
  function handleItemUpdate(item: MenuItem, change: number) {
    // Add animation class to the button
    const buttonId = `item-${item.id}-btn`;
    const button = document.getElementById(buttonId);
    if (button) {
      button.classList.add('animate-ping-once');
      setTimeout(() => button.classList.remove('animate-ping-once'), 300);
    }
    
    handleQuantityChange(item, change);
  }

  /**
   * Shares vendor information using Web Share API or falls back to copy link
   */
  function shareVendor() {
    if (navigator.share) {
      navigator.share({
        title: `Check out ${vendorInfo.name}`,
        text: `I found this great vendor at the event! ${vendorInfo.description}`,
        url: window.location.href
      }).catch(console.error);
    } else {
      showShareOptions = true;
    }
  }

  /**
   * Copies the current page URL to clipboard
   */
  function copyLink() {
    navigator.clipboard.writeText(window.location.href);
    alert('Link copied to clipboard!');
    showShareOptions = false;
  }

  /**
   * Scrolls to a specific category section
   * @param category - The category ID to scroll to
   */
  function scrollToCategory(category: string) {
    if (category !== 'All') {
      const element = document.getElementById(`category-${category}`);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  /**
   * Toggles the filter options modal
   */
  function toggleFilter() {
    showFilterOptions = !showFilterOptions;
  }

  /**
   * Selects a category and scrolls to it
   * @param category - The category to select
   */
  function selectCategory(category: string) {
    selectedCategory = category;
    scrollToCategory(category);
  }

  /**
   * Toggles the dietary filter
   * @param type - The dietary type to toggle
   */
  function toggleDietaryFilter(type: keyof typeof dietaryFilters) {
    dietaryFilters[type] = !dietaryFilters[type];
  }

  /**
   * Updates the price range filter
   * @param min - The minimum price
   * @param max - The maximum price
   */
  function updatePriceRange(min: number, max: number) {
    priceRange = [min, max];
  }

  // Calculate total items in current vendor's cart
  $: currentVendorCartCount = $cart[vendorInfo.id]?.items?.reduce((total, item) => total + item.quantity, 0) || 0;
  $: currentVendorCartTotal = $cart[vendorInfo.id]?.items?.reduce((total, item) => total + (item.price * item.quantity), 0) || 0;
</script>

<div class="min-h-screen bg-gray-50 font-sans">
  <!-- Hero Section with Parallax Effect -->
  <div class="relative h-80 overflow-hidden">
    {#if vendorInfo.image}
      <img 
        src={vendorInfo.image} 
        alt={vendorInfo.name} 
        class="w-full h-full object-cover object-center transform transition-transform duration-300 hover:scale-105"
      />
      <div class="absolute inset-0 bg-gradient-to-b from-black/20 to-black/60"></div>
    {:else}
      <div class="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-20 w-20 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
      </div>
    {/if}

    <!-- Navigation -->
    <div class="absolute top-0 left-0 right-0 p-4 flex justify-between items-center">
      <button 
        on:click={() => goto('/fnb-menu')} 
        class="w-10 h-10 flex items-center justify-center bg-white/90 backdrop-blur-md rounded-full shadow-sm hover:bg-white transition-all"
        aria-label="Go back to menu"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-800" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
        </svg>
      </button>
      
      <button 
        on:click={shareVendor}
        class="w-10 h-10 flex items-center justify-center bg-white/90 backdrop-blur-md rounded-full shadow-sm hover:bg-white transition-all"
        aria-label="Share vendor"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-800" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
        </svg>
      </button>
    </div>

    <!-- Vendor Info Floating Card -->
    <div class="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl">
      <div class="bg-white/90 backdrop-blur-md rounded-t-3xl p-6 shadow-lg">
        <div class="flex justify-between items-start">
          <div>
            <h1 class="text-xl font-semibold text-gray-900">{vendorInfo.name}</h1>
            <!-- Rating - Fixed star icon -->
            {#if vendorInfo.rating}
            <div class="flex items-center mt-2">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-yellow-400" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
              </svg>
              <span class="ml-1 font-medium">{vendorInfo.rating}</span>
            </div>
            {/if}
          </div>
          <!-- Social Media Links -->
          <div class="flex space-x-2">
            <a href="#" class="w-9 h-9 flex items-center justify-center bg-gray-100 rounded-full text-gray-600 hover:bg-gray-200 transition-all">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
              </svg>
            </a>
            <a href="#" class="w-9 h-9 flex items-center justify-center bg-gray-100 rounded-full text-gray-600 hover:bg-gray-200 transition-all">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
            </a>
          </div>
        </div>

        <div class="mt-2">
          <p class="text-sm text-gray-600 {showFullDescription ? '' : 'line-clamp-2'}">
            {vendorInfo.description}
          </p>
          <button 
            on:click={() => showFullDescription = !showFullDescription}
            class="mt-1 text-xs text-gray-500 font-medium hover:text-gray-700 transition-all flex items-center"
          >
            {#if showFullDescription}
              <span>Show less</span>
              <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7" />
              </svg>
            {:else}
              <span>Read more</span>
              <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
              </svg>
            {/if}
          </button>
        </div>
      </div>
    </div>
  </div>

  <!-- Search and Filter -->
  <div class="sticky top-0 z-10 bg-white px-5 pt-3 pb-2 border-b border-gray-100">
    <div class="relative">
      <input
        type="text"
        bind:value={searchQuery}
        placeholder="Search menu..."
        class="w-full pl-10 pr-4 py-3 bg-gray-100 rounded-lg border-none focus:ring-2 focus:ring-gray-300 focus:bg-white text-sm"
      />
      <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
      <button 
        on:click={toggleFilter}
        class="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
        aria-label="toggle filter"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
        </svg>
      </button>
    </div>
  </div>

  <!-- Categories -->
  <div class="sticky top-16 z-10 bg-white px-5 pt-2 pb-1 border-b border-gray-100">
    <div class="flex overflow-x-auto gap-4 pb-2 scrollbar-hide">
      {#each categories as category (category)}
        <button
          on:click={() => selectCategory(category as string)}
          class={`whitespace-nowrap px-1 pb-2 text-sm font-medium transition-all relative ${
            selectedCategory === category 
              ? 'text-gray-900' 
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          {category}
          {#if selectedCategory === category}
            <div class="absolute bottom-0 left-0 right-0 h-0.5 bg-gray-900 rounded-full"></div>
          {/if}
        </button>
      {/each}
    </div>
  </div>

  <!-- Menu Items Section -->
  <div class="px-5 pb-24">
    {#each Object.entries(categorizedItems) as [category, items]}
      {#if items.length > 0} <!-- Only show categories with available items -->
        <div id={`category-${category}`} class="pt-6">
          <h2 class="text-lg font-semibold text-gray-900 mb-3">{category}</h2>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            {#each items as item (item.id)}
              {#if searchQuery === '' || item.name?.toLowerCase()?.includes(searchQuery.toLowerCase())}
                <div class="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100 transition-all hover:shadow-md hover:border-gray-200">
                  <!-- Image with overlay -->
                  <div class="relative aspect-square w-full">
                    {#if item.image_url}
                      <img 
                        src={item.image_url} 
                        alt={item.name} 
                        class="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                      />
                    {:else}
                      <div class="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                      </div>
                    {/if}
                    
                    <!-- Item info overlay -->
                    <div class="absolute inset-0 bg-gradient-to-t from-black/40 via-black/10 to-transparent p-4 flex flex-col justify-end">
                      <h3 class="text-lg font-semibold text-white">{item.name}</h3>
                      <p class="text-sm text-white/90">RM{item.price.toFixed(2)}</p>
                    </div>
                    
                    <!-- Cart controls -->
                    <div class="absolute top-3 right-3">
                      {#if CaptureItemQuantity(item.id) > 0}
                        <div class="flex items-center bg-white/90 backdrop-blur rounded-full shadow-sm overflow-hidden transition-all">
                          <button
                            id={`item-${item.id}-btn`}
                            on:click|stopPropagation={() => handleItemUpdate(item, -1)}
                            class="w-8 h-8 flex items-center justify-center text-gray-700 hover:bg-gray-100 active:bg-gray-200 transition-colors"
                            aria-label="Decrease quantity"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4" />
                            </svg>
                          </button>
                          <span class="px-2 text-sm font-medium min-w-[1.5rem] text-center">
                            {CaptureItemQuantity(item.id)}
                          </span>
                          <button
                            on:click|stopPropagation={() => handleItemUpdate(item, 1)}
                            class="w-8 h-8 flex items-center justify-center text-gray-700 hover:bg-gray-100 active:bg-gray-200 transition-colors"
                            aria-label="Increase quantity"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                            </svg>
                          </button>
                        </div>
                      {:else}
                        <button
                          id={`item-${item.id}-btn`}
                          on:click|stopPropagation={() => handleItemUpdate(item, 1)}
                          class="w-8 h-8 flex items-center justify-center bg-white/90 backdrop-blur rounded-full shadow-sm text-gray-700 hover:bg-white hover:shadow-md active:scale-95 transition-all"
                          aria-label="Add to cart"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                          </svg>
                        </button>
                      {/if}
                    </div>
                  </div>
                  
                  <!-- Item details -->
                  <div class="p-4">
                    <p class="text-sm text-gray-600 line-clamp-2">{item.description}</p>
                    
                    {#if (item.dietary_information ?? []).length > 0}
                      <div class="mt-2 flex flex-wrap gap-1">
                        {#if (item.dietary_information ?? []).includes('Halal')}
                          <span class="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">Halal</span>
                        {/if}
                        {#if item.dietary_information?.includes('Vegetarian')}
                          <span class="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">Vegetarian</span>
                        {/if}
                        {#if item.dietary_information?.includes('Vegan')}
                          <span class="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full">Vegan</span>
                        {/if}
                      </div>
                    {/if}
                  </div>
                </div>
              {/if}
            {/each}
          </div>
        </div>
      {/if}
    {/each}
    {#if Object.keys(categorizedItems).length === 0}
      <div class="text-center py-16">
        <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <h3 class="mt-4 text-lg font-medium text-gray-900">No items available</h3>
        <p class="mt-1 text-sm text-gray-500">Try adjusting your filters or search.</p>
      </div>
    {/if}
  </div>

  <!-- Floating Cart Button -->
  {#if currentVendorCartCount > 0}
    <div class="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-20 w-full max-w-md px-5">
      <button 
        on:click={() => showCartModal = true}
        class="w-full py-4 bg-gray-900 text-white rounded-full px-2 font-medium shadow-lg transition-all flex items-center justify-center gap-2 hover:bg-gray-800 active:scale-95"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
        View Cart ({currentVendorCartCount} items) • RM{currentVendorCartTotal.toFixed(2)}
      </button>
    </div>
  {/if}

  <!-- Cart Summary Modal -->
  {#if showCartModal}
    <CartSummaryModal 
      isOpen={showCartModal}
      onClose={() => showCartModal = false}
      vendorId={vendorInfo.id}
    />
  {/if}

  <!-- Filter Modal -->
  {#if showFilterOptions}
    <div class="fixed inset-0 bg-black/50 z-30 flex items-end" role="dialog" tabindex="0" aria-label="Filter options" on:click|self={() => showFilterOptions = false} on:keydown={(e) => { if (e.key === 'Escape') showFilterOptions = false; }} aria-hidden="true">
      <div class="bg-white rounded-t-2xl w-full p-5 animate-slide-up">
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-lg font-semibold text-gray-900">Filters</h3>
          <button on:click={() => showFilterOptions = false} class="text-gray-500 hover:text-gray-700" aria-label="show filter options">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div class="space-y-6">
          <!-- Price Range -->
          <div>
            <h4 class="text-sm font-medium text-gray-700 mb-3">Price Range</h4>
            <div class="px-2">
              <input 
                type="range" 
                min={minPrice} 
                max={maxPrice} 
                bind:value={priceRange[1]}
                on:input={(e) => updatePriceRange(priceRange[0], Number((e.target as HTMLInputElement).value))}
                class="w-full h-1 bg-gray-200 rounded-full appearance-none cursor-pointer"
              />
              <div class="flex justify-between text-xs text-gray-500 mt-2">
                <span>{priceRange[0]}</span>
                <span>{priceRange[1]}</span>
              </div>
            </div>
          </div>
          
          <!-- Dietary Preferences -->
          <div>
            <h4 class="text-sm font-medium text-gray-700 mb-3">Dietary</h4>
            <div class="grid grid-cols-2 gap-2">
              <button 
                on:click={() => toggleDietaryFilter('halal')}
                class={`px-3 py-2 rounded-lg border text-sm transition-all ${dietaryFilters.halal ? 'bg-gray-900 text-white border-gray-900' : 'bg-white text-gray-700 border-gray-200 hover:border-gray-300'}`}
              >
                Halal
              </button>
              <button 
                on:click={() => toggleDietaryFilter('vegetarian')}
                class={`px-3 py-2 rounded-lg border text-sm transition-all ${dietaryFilters.vegetarian ? 'bg-gray-900 text-white border-gray-900' : 'bg-white text-gray-700 border-gray-200 hover:border-gray-300'}`}
              >
                Vegetarian
              </button>
              <button 
                on:click={() => toggleDietaryFilter('vegan')}
                class={`px-3 py-2 rounded-lg border text-sm transition-all ${dietaryFilters.vegan ? 'bg-gray-900 text-white border-gray-900' : 'bg-white text-gray-700 border-gray-200 hover:border-gray-300'}`}
              >
                Vegan
              </button>
            </div>
          </div>
          
          <button 
            on:click={toggleFilter}
            class="w-full py-4 bg-gray-900 text-white rounded-lg font-medium mt-4 hover:bg-gray-800 transition-all"
          >
            Apply Filters
          </button>
        </div>
      </div>
    </div>
  {/if}

  <!-- Share Modal -->
  {#if showShareOptions}
    <div class="fixed inset-0 bg-black/50 z-40 flex items-center justify-center p-6" role="dialog" tabindex="0" aria-label="Share options" on:click|self={() => showShareOptions = false} on:keydown={(e) => { if (e.key === 'Escape') showShareOptions = false; }} aria-hidden="true">
      <div class="bg-white rounded-xl p-6 w-full max-w-sm">
        <h3 class="text-lg font-semibold text-gray-900">Share this vendor</h3>
        <div class="mt-4 space-y-3">
          <button 
            on:click={copyLink}
            class="w-full flex items-center justify-between p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-all"
            aria-label="Copy link to clipboard"
          >
            <span class="text-gray-700">Copy link</span>
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  {/if}
</div>

<style>
  .animate-slide-up {
    animation: slideUp 0.3s ease-out forwards;
  }
  
  @keyframes slideUp {
    from {
      transform: translateY(100%);
    }
    to {
      transform: translateY(0);
    }
  }
  .animate-ping-once {
    animation: ping 0.3s ease-out;
  }
  
  @keyframes ping {
    0% {
      transform: scale(1);
      opacity: 1;
    }
    50% {
      transform: scale(1.2);
      opacity: 0.7;
    }
    100% {
      transform: scale(1);
      opacity: 1;
    }
  }
  
  /* Smooth transitions for all interactive elements */
  button, a, input, [tabindex] {
    transition: all 0.2s ease;
  }
  
  /* Active state for buttons */
  button:active {
    transform: scale(0.95);
  }
</style>