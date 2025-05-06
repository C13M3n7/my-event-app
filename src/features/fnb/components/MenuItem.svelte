<!-- src/features/fnb/components/MenuItem.svelte -->
<script lang="ts">
  import { createEventDispatcher, onMount } from 'svelte';
  import { saveMenuItem } from '$features/fnb/services/fnbService';
  import type { MenuItem } from '$features/fnb/types/menu';

  export let item: MenuItem | null = null;
  export let vendorId: string;
  
  const dispatch = createEventDispatcher();
  
  let name = '';
  let description = '';
  let price = 0;
  let image = '';
  let category = '';
  let saving = false;

  // Pre-fill form if editing
  onMount(() => {
    if (item) {
      name = item.title;
      description = item.description || '';
      price = item.price;
      image = item.image || '';
      category = item.category || '';
    } document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  });

  async function saveItem() {
    if (!name.trim() || price <= 0) {
      alert('Please enter a valid name and price.');
      return;
    }

    saving = true;
    try {
      const newItem = {
        id: item?.id || crypto.randomUUID?.() || Math.random().toString(36).slice(2, 9),
        title: name,
        description,
        price,
        image,
        category,
        available: item?.available ?? true,
        vendorId
      };

      await saveMenuItem(newItem);
      dispatch('save', newItem);
    } catch (err) {
      console.error('Failed to save item:', err);
      alert('Failed to save. Try again.');
    } finally {
      saving = false;
    }
  }
</script>
<div class="fixed inset-0 z-[9999] overflow-y-auto">
  <!-- Backdrop -->
  <div class="fixed inset-0 bg-black/50" on:click={() => dispatch('close')} />
  
  
  <!-- Modal container -->
  <div class="flex min-h-full items-center justify-center p-4">
    <!-- Modal content with max-height and scrolling -->
    <div class="relative w-full max-w-md max-h-[90vh] overflow-y-auto transform rounded-lg bg-white text-left shadow-xl transition-all">
      <!-- Header -->
      <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4 sticky top-0 z-10 bg-white border-b">
        <h3 class="text-lg font-medium leading-6 text-gray-900">
          {item ? 'Edit Item' : 'Add Item'}
        </h3>
      </div>
      <!-- Scrollable form content -->
      <div class="px-4 py-3 space-y-4 overflow-y-auto">
        <!-- Form fields here (keep your existing fields) -->
        <div>
          <label class="block text-sm font-medium text-gray-700">Name</label>
          <input bind:value={name} class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm" />
        </div>
        
        <div>
          <label for="name" class="block text-sm font-medium text-gray-700">Item Name</label>
          <input 
            id="name"
            bind:value={name} 
            placeholder="Item Name"
            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          />
        </div>
        
        <div>
          <label for="description" class="block text-sm font-medium text-gray-700">Description</label>
          <textarea 
            id="description"
            bind:value={description} 
            placeholder="Description"
            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          ></textarea>
        </div>
        
        <div>
          <label for="price" class="block text-sm font-medium text-gray-700">Price</label>
          <input 
            id="price"
            type="number" 
            bind:value={price} 
            placeholder="Price"
            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          />
        </div>
        
        <div>
          <label for="image" class="block text-sm font-medium text-gray-700">Image URL</label>
          <input 
            id="image"
            type="text" 
            bind:value={image} 
            placeholder="Image URL"
            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          />
        </div>
        
        <div>
          <label for="category" class="block text-sm font-medium text-gray-700">Category</label>
          <input 
            id="category"
            bind:value={category} 
            placeholder="Category"
            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          />
        </div>
      </div>

      
      <!-- Modal actions -->
      <!-- Sticky footer with buttons -->
      <div class="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6 sticky bottom-0 border-t">
        <button 
          on:click={saveItem}
          class="w-full inline-flex justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 sm:ml-3 sm:w-auto sm:text-sm"
        >
          Save
        </button>
        <button 
          on:click={() => dispatch('close')}
          class="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-base font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
        >
          Cancel
        </button>
      </div>
    </div>
  </div>
</div>
