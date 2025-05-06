<script lang="ts">
  import { onMount, beforeUpdate } from 'svelte';
  import { fade } from 'svelte/transition';
  import MenuEditor from '$features/vendorDashboard/components/MenuEditor.svelte';
  import { getVendorMenu, addMenuItem, updateMenuItem, deleteMenuItem } from '$features/vendorDashboard/services/vendorService';
  import type { MenuItem } from '$features/fnb/types/menu';
  
  let vendorId = 'zjAW8bPotqKEoURJgBtq'; // Replace with dynamic vendor ID from auth
  let menuItems: MenuItem[] = [];
  let showEditor = false;
  let currentItem: MenuItem | null = null;
  let editorMode: 'create' | 'edit' = 'create';
  let loading = true;
  let error = '';
  let searchQuery = '';
  let deletingItemId: string | null = null;
  let activeCategory = 'All';
  let isScrolled = false;
  let isProgrammaticScroll = false;
  let observer: IntersectionObserver;
  let categoryFilterRef: HTMLDivElement;
  let activeCategoryElement: HTMLButtonElement;

  // Extract unique categories from menu items
  $: categories = ['All', ...new Set(menuItems.flatMap(item => 
        item.category || ['Uncategorized']
    ))].filter(Boolean);

    // Group items by category
    $: categorizedItems = menuItems.reduce((acc, item) => {
        const categories = item.category || ['Uncategorized'];
        categories.forEach(category => {
            if (!acc[category]) acc[category] = [];
            acc[category].push(item);
        });
        return acc;
    }, {} as Record<string, MenuItem[]>);

    // Filter menu items based on search query
    $: filteredItems = Object.entries(categorizedItems)
        .map(([category, items]) => ({
            category,
            items: items.filter(item => {
                const searchTerm = searchQuery.toLowerCase();
                const title = item.name?.toLowerCase() || '';
                const description = item.description?.toLowerCase() || '';
                return title.includes(searchTerm) || description.includes(searchTerm);
            })
        }))
        .filter(({ items }) => items.length > 0);

  // Check if we have any items to show
  $: hasItemsToShow = filteredItems.length > 0;

  // Fetch menu items from Firestore
  const fetchMenu = async () => {
    try {
      loading = true;
      error = '';
      menuItems = await getVendorMenu(vendorId);
    } catch (err) {
      console.error('Error fetching menu:', err);
      error = 'Failed to load menu. Please try again.';
    } finally {
      loading = false;
    }
  };

  // Handle menu editor events
  async function handleMenuEvent(event: CustomEvent) {
    try {
      switch (event.type) {
        case 'create':
          const newItemId = await addMenuItem(vendorId, event.detail);
          menuItems = [...menuItems, { 
            ...event.detail, 
            id: newItemId,
            dietary_information: event.detail.dietary_information || []
          }];
          break;
        case 'update':
          await updateMenuItem(vendorId, event.detail.id, {
            ...event.detail,
            dietary_information: event.detail.dietary_information || []
          });
          menuItems = menuItems.map(item => 
            item.id === event.detail.id ? { 
              ...event.detail,
              dietary_information: event.detail.dietary_information || []
            } : item
          );
          break;
        case 'delete':
          await deleteMenuItem(vendorId, event.detail);
          menuItems = menuItems.filter(item => item.id !== event.detail);
          break;
      }
      showEditor = false;
    } catch (err) {
      console.error('Error handling menu event:', err);
      error = 'Failed to save changes. Please try again.';
    }
  }

  // Open editor in create mode
  function openCreateEditor() {
    currentItem = null; // This is crucial
    editorMode = 'create';
    showEditor = true;
  }

  // Open editor in edit mode
  function openEditEditor(item: MenuItem) {
    currentItem = {
      ...item,
      dietary_information: item.dietary_information || []
    };
    editorMode = 'edit';
    showEditor = true;
  }

  // Delete menu item
  const deleteItem = async (id: string) => {
    if (confirm('Are you sure you want to delete this item?')) {
      try {
        deletingItemId = id;
        await deleteMenuItem(vendorId, id);
        menuItems = menuItems.filter(item => item.id !== id);
      } catch (err) {
        console.error('Error deleting item:', err);
        alert('Failed to delete item. Please try again.');
      } finally {
        deletingItemId = null;
      }
    }
  };

  // Scroll to category
  const scrollToCategory = (category: string) => {
    isProgrammaticScroll = true;
    activeCategory = category;
    
    if (category === 'All') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      // Create a normalized ID that matches how we create the element IDs
      const normalizedCategory = category.toLowerCase().replace(/\s+/g, '-');
      const element = document.getElementById(`category-${normalizedCategory}`);
      
      if (element) {
        const headerOffset = 180;
        const elementPosition = element.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
        
        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        });
      }
    }
    
    setTimeout(() => {
      isProgrammaticScroll = false;
    }, 1000);
  };

  // Setup Intersection Observer - updated version
  const setupObserver = () => {
    if (observer) observer.disconnect();
    
    observer = new IntersectionObserver(
      (entries) => {
        if (isProgrammaticScroll) return;
        
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            // Get the normalized category from the ID
            const categoryFromId = entry.target.id.replace('category-', '')
              .replace(/-/g, ' ')
              .replace(/\b\w/g, l => l.toUpperCase());
            
            const newActiveCategory = categoryFromId === 'all' ? 'All' : categoryFromId;
            
            if (newActiveCategory !== activeCategory) {
              activeCategory = newActiveCategory;
              
              if (categoryFilterRef && activeCategoryElement) {
                // Find the button for this category
                const buttons = categoryFilterRef.querySelectorAll('button');
                const activeButton = Array.from(buttons).find(btn => 
                  btn.textContent?.trim() === newActiveCategory
                ) as HTMLButtonElement;
                
                if (activeButton) {
                  const filterRect = categoryFilterRef.getBoundingClientRect();
                  const elementRect = activeButton.getBoundingClientRect();
                  
                  const scrollTo = activeButton.offsetLeft - (filterRect.width / 2) + (elementRect.width / 2);
                  
                  categoryFilterRef.scrollTo({
                    left: scrollTo,
                    behavior: 'smooth'
                  });
                }
              }
            }
          }
        });
      },
      {
        rootMargin: '-100px 0px -50% 0px',
        threshold: 0.5
      }
    );
    
    // Observe all category sections
    document.querySelectorAll('.category-section').forEach(section => {
      observer.observe(section);
    });
  };

  beforeUpdate(() => {
    if (!loading && menuItems.length > 0) {
      setTimeout(setupObserver, 100);
    }
  });

  onMount(() => {
    fetchMenu();
    return () => {
      if (observer) observer.disconnect();
    };
  });
</script>

<!-- The rest of your template remains exactly the same -->
<section class="container mx-auto px-4 pb-6">
  <!-- Sticky Header -->
  <div class="sticky top-0 z-20 bg-white pt-4 pb-2 {isScrolled ? 'shadow-sm' : ''} transition-shadow">
      <!-- Search and Add Button -->
      <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
          <div>
              <h1 class="text-2xl font-semibold">Menu Management</h1>
              <p class="text-gray-500">
                  {loading ? 'Loading...' : `${menuItems.length} item${menuItems.length !== 1 ? 's' : ''} in your menu`}
              </p>
          </div>
          
          <div class="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              <!-- Search Input -->
              <div class="relative flex-1 sm:w-64">
                  <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                  </div>
                  <input
                      type="text"
                      bind:value={searchQuery}
                      placeholder="Search menu items..."
                      class="w-full pl-10 pr-4 py-2.5 bg-white rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      disabled={loading}
                  />
              </div>
              
              <!-- Add Item Button -->
              <button
                  on:click={openCreateEditor}
                  class="bg-blue-500 text-white px-4 py-2.5 rounded-lg flex items-center justify-center space-x-2 hover:bg-blue-600 transition-colors disabled:opacity-50"
                  disabled={loading}
              >
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  <span>Add Item</span>
              </button>
          </div>
      </div>

      <!-- Horizontal Category Filter -->
      <div class="relative border-b border-gray-200" bind:this={categoryFilterRef}>
          <div class="flex space-x-6 pb-2 overflow-x-auto scrollbar-hide px-1">
              {#each categories as category}
                  <button
                      data-category={category}
                      on:click|preventDefault={() => scrollToCategory(category)}
                      bind:this={activeCategoryElement}
                      class="flex-shrink-0 pb-2 text-sm font-medium whitespace-nowrap transition-colors relative"
                      class:text-blue-500={activeCategory === category}
                      class:text-gray-500={activeCategory !== category}
                      class:hover:text-gray-700={activeCategory !== category}
                  >
                      {category}
                      {#if activeCategory === category}
                          <div class="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500"></div>
                      {/if}
                  </button>
              {/each}
          </div>
          <div class="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-white to-transparent pointer-events-none"></div>
      </div>
  </div>

  <!-- Error Message -->
  {#if error}
      <div class="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded">
          <div class="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <p class="ml-3 text-sm text-red-700">{error}</p>
          </div>
      </div>
  {/if}

  <!-- Loading State -->
  {#if loading && menuItems.length === 0}
      <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {#each { length: 6 } as _}
              <div class="bg-white rounded-xl shadow-sm p-4 h-48 animate-pulse">
                  <div class="bg-gray-200 h-32 rounded-lg mb-3"></div>
                  <div class="bg-gray-200 h-4 rounded w-3/4 mb-2"></div>
                  <div class="bg-gray-200 h-3 rounded w-1/2"></div>
              </div>
          {/each}
      </div>
  {:else if filteredItems.length === 0 && !loading}
      <!-- Empty State -->
      <div class="bg-white rounded-xl shadow-sm p-8 text-center">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h3 class="mt-2 text-lg font-medium text-gray-900">
              {searchQuery ? 'No matching items found' : 'Your menu is empty'}
          </h3>
          <p class="mt-1 text-sm text-gray-500">
              {searchQuery ? 'Try adjusting your search' : 'Get started by adding your first item'}
          </p>
          <div class="mt-6">
              <button
                  on:click={() => {
                      searchQuery = '';
                      openCreateEditor();
                  }}
                  class="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-500 hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                  <svg xmlns="http://www.w3.org/2000/svg" class="-ml-1 mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Add Menu Item
              </button>
          </div>
      </div>
  {:else}
      <!-- Categorized Menu Items -->
      <div class="space-y-8">
          {#each filteredItems as { category, items }}
              <div class="category-section" id={`category-${category.toLowerCase().replace(/\s+/g, '-')}`}>
                  <h2 class="text-xl font-semibold mb-4 sticky top-32 bg-white py-2 z-10">
                      {category}
                      <span class="text-sm font-normal text-gray-500 ml-2">
                          ({items.length} {items.length === 1 ? 'item' : 'items'})
                      </span>
                  </h2>
                  
                  <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {#each items as item (item.id)}
                          <div 
                              transition:fade
                              class="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow"
                          >
                              <!-- Item Image -->
                              <div class="relative h-40 bg-gray-100">
                                  {#if item.image_url}
                                      <img 
                                          src={item.image_url} 
                                          alt={item.name} 
                                          class="w-full h-full object-cover"
                                      />
                                  {:else}
                                      <div class="w-full h-full flex items-center justify-center text-gray-400">
                                          <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                          </svg>
                                      </div>
                                  {/if}
                                  
                                  <!-- Price Badge -->
                                  <div class="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2.5 py-1 rounded-full text-sm font-semibold shadow-xs">
                                      ${item.price.toFixed(2)}
                                  </div>
                                  
                                  <div class="absolute bottom-3 left-3 flex space-x-2">
                                    {#if item.dietary_information?.includes('Halal')}
                                        <span class="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">Halal</span>
                                    {/if}
                                    {#if item.dietary_information?.includes('Vegetarian')}
                                        <span class="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded-full">Vegetarian</span>
                                    {/if}
                                    {#if item.dietary_information?.includes('Vegan')}
                                        <span class="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">Vegan</span>
                                    {/if}
                                </div>
                              </div>
                              
                              <!-- Item Details -->
                              <div class="p-4">
                                  <h3 class="font-semibold text-gray-900">{item.name}</h3>
                                  
                                  {#if item.description}
                                      <p class="text-gray-500 text-sm mt-1 line-clamp-2">{item.description}</p>
                                  {/if}
                              </div>
                              
                              <!-- Action Buttons -->
                              <div class="border-t border-gray-100 flex divide-x divide-gray-100">
                                  <button 
                                      on:click={() => openEditEditor(item)}
                                      class="flex-1 py-3 text-center text-blue-500 font-medium flex items-center justify-center space-x-2 hover:bg-gray-50 transition-colors"
                                  >
                                      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                      </svg>
                                      <span>Edit</span>
                                  </button>
                                  <button 
                                      on:click={() => deleteItem(item.id)}
                                      class="flex-1 py-3 text-center text-red-500 font-medium flex items-center justify-center space-x-2 hover:bg-gray-50 transition-colors"
                                      disabled={deletingItemId === item.id}
                                  >
                                      {#if deletingItemId === item.id}
                                          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                          </svg>
                                          <span>Deleting...</span>
                                      {:else}
                                          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                          </svg>
                                          <span>Delete</span>
                                      {/if}
                                  </button>
                              </div>
                          </div>
                      {/each}
                  </div>
              </div>
          {/each}
      </div>
  {/if}
  
  {#if showEditor}
      <MenuEditor 
          item={currentItem} 
          menuItems={menuItems}
          on:create={handleMenuEvent}
          on:update={handleMenuEvent}
          on:delete={handleMenuEvent}
          on:close={() => showEditor = false}
      />
  {/if}
</section>

<style>
  .line-clamp-2 {
      display: -webkit-box;
      -webkit-line-clamp: 2;
      line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
  }
  
  .scrollbar-hide::-webkit-scrollbar {
      display: none;
  }
  
  .scrollbar-hide {
      -ms-overflow-style: none;
      scrollbar-width: none;
  }
</style>