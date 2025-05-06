<!-- CRUD interface for menu items -->
<!-- src/features/vendorDashboard/components/MenuEditor.svelte -->
<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { v4 as uuidv4 } from 'uuid';
  import type { MenuItem } from '$features/fnb/types/menu';

  export let item: MenuItem | null = null;
  export let menuItems: MenuItem[] = [];
  const dispatch = createEventDispatcher();

  // Form data
  interface FormData {
    name: string;
    description: string;
    price: number;
    category: string[];
    preparationTime?: number;
    dietary_information: string[];
    image: File | null;
    imagePreview: string;
    availability: boolean;
  }


  // Track if form has been submitted (for validation)
  let formSubmitted = false;
  
  // Available categories
  const categories = [
    'Main Course',
    'Snacks and Sides',
    'Beverages',
    'Desserts',
    'Specials'
  ];

  // Dietary options
  const dietaryOptions = [
    { value: 'Halal', label: 'Halal' },
    { value: 'Vegetarian', label: 'Vegetarian' },
    { value: 'Vegan', label: 'Vegan' },
    { value: 'Gluten-Free', label: 'Gluten-Free' }
  ];

  // Initialize form
  let formData: FormData = {
    name: '',
    description: '',
    price: 0,
    category: [],
    preparationTime: 15,
    dietary_information: [],
    image: null,
    imagePreview: '',
    availability: true
  };

  // Initialize form when item prop changes
  // Reset form when item changes
  $: {
    if (item) {
      // Editing existing item
      formData = {
        name: item.name || '',
        description: item.description || '',
        price: item.price || 0,
        category: item.category || [],
        preparationTime: item.preparationTime || 15,
        dietary_information: item.dietary_information || [],
        image: null,
        imagePreview: item.image_url || '',
        availability: item.availability ?? true
      };
    } else {
      // Creating new item - reset to defaults
      formData = {
        name: '',
        description: '',
        price: 0,
        category: [],
        preparationTime: 15,
        dietary_information: [],
        image: null,
        imagePreview: '',
        availability: true
      };
    }
  }

  // Toggle category selection
  function toggleCategory(category: string) {
    formData.category = formData.category.includes(category)
      ? formData.category.filter(c => c !== category)
      : [...formData.category, category];
  }

  // Toggle dietary information
  function toggleDietaryInfo(info: string) {
    formData.dietary_information = formData.dietary_information.includes(info)
      ? formData.dietary_information.filter(d => d !== info)
      : [...formData.dietary_information, info];
  }

  // Handle image upload
  function handleImageUpload(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert('Image size should be less than 2MB');
        return;
      }
      formData.image = file;
      const reader = new FileReader();
      reader.onload = (e) => {
        formData.imagePreview = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  // Check for duplicate menu item names
  function isDuplicate(name: string, currentId?: string): boolean {
    return menuItems.some(
      menuItem => menuItem.name.toLowerCase() === name.toLowerCase() && 
                 menuItem.id !== currentId
    );
  }

  // Validate form fields
  function validateField(field: string, value: any): string | null {
    switch (field) {
      case 'name':
        return !value ? 'Item name is required' : null;
      case 'price':
        return value <= 0 ? 'Price must be greater than 0' : null;
      case 'category':
        return value.length === 0 ? 'At least one category is required' : null;
      case 'preparationTime':
        return value <= 0 ? 'Preparation time must be greater than 0' : null;
      default:
        return null;
    }
  }

  // Handle form submission
  function handleSubmit() {
    formSubmitted = true;
    
    // Validate all fields
    const errors = {
      name: validateField('name', formData.name),
      price: validateField('price', formData.price),
      category: validateField('category', formData.category),
      preparationTime: validateField('preparationTime', formData.preparationTime)
    };

    // Check if any errors exist
    if (Object.values(errors).some(error => error !== null)) {
      return;
    }

    if (isDuplicate(formData.name, item?.id)) {
      alert('A menu item with this name already exists. Please use a different name.');
      return;
    }

    const menuItem: Omit<MenuItem, 'id' | 'vendorId'> = {
      name: formData.name.trim(),
      description: formData.description.trim(),
      price: parseFloat(formData.price.toString()),
      category: formData.category,
      preparationTime: formData.preparationTime,
      dietary_information: formData.dietary_information,
      image_url: formData.imagePreview,
      availability: formData.availability
    };

    if (item) {
      dispatch('update', { id: item.id, ...menuItem });
    } else {
      dispatch('create', menuItem);
    }
    
    dispatch('close');
  }

  // Handle delete
  function handleDelete() {
    if (item && confirm('Are you sure you want to delete this menu item?')) {
      dispatch('delete', item.id);
      dispatch('close');
    }
  }
</script>

 <!-- Main Modal -->
<div class="fixed inset-0 z-100 overflow-y-auto">
  <div class="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
    <!-- Modal overlay -->
    <div class="menu-editor__modal fixed inset-0 transition-opacity" aria-hidden="true">
      <button 
        type="button" 
        class="menu-editor__backdrop absolute inset-0 bg-gray-500 opacity-75" 
        on:click={() => dispatch('close')} 
        aria-label="Close menu editor"
      ></button>
    </div>
    
    <!-- Modal container -->
    <div class="menu-editor__modal relative inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full z-[1002]">
      <!-- Modal content -->
      <div class="menu-editor__content inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
        <h2 class="menu-editor__title text-xl font-semibold mb-4">
          {item ? 'Edit Menu Item' : 'Add New Menu Item'}
        </h2>

        <form on:submit|preventDefault={handleSubmit}>
          <!-- Name -->
          <div class="mb-4">
            <label for="title" class="block text-sm font-medium text-gray-700 mb-1">
              Item Name *
            </label>
            <input
              id="title"
              type="text"
              bind:value={formData.name}
              class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              class:border-red-300={formSubmitted && validateField('title', formData.name)}
            />
            {#if formSubmitted && validateField('title', formData.name)}
              <p class="mt-1 text-sm text-red-600">{validateField('title', formData.name)}</p>
            {/if}
          </div>

          <!-- Description -->
          <div class="mb-4">
            <label for="description" class="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              id="description"
              bind:value={formData.description}
              rows={3}
              class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            ></textarea>
          </div>

          <!-- Price -->
          <div class="mb-4">
            <label for="price" class="block text-sm font-medium text-gray-700 mb-1">
              Price *
            </label>
            <div class="relative rounded-md shadow-sm">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span class="text-gray-500 sm:text-sm">$</span>
              </div>
              <input
                id="price"
                type="number"
                min="0.01"
                step="0.01"
                bind:value={formData.price}
                class="pl-7 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                class:border-red-300={formSubmitted && validateField('price', formData.price)}
              />
            </div>
            {#if formSubmitted && validateField('price', formData.price)}
              <p class="mt-1 text-sm text-red-600">{validateField('price', formData.price)}</p>
            {/if}
          </div>

          <!-- Categories -->
          <div class="mb-4">
            <label for="categories" class="block text-sm font-medium text-gray-700 mb-2">
              Categories *
            </label>
            <div id="categories" class="flex flex-wrap gap-2">
              {#each categories as category}
                <button
                  type="button"
                  on:click={() => toggleCategory(category)}
                  class={`px-3 py-1 rounded-full text-sm ${formData.category.includes(category) 
                    ? 'bg-blue-100 text-blue-800 border border-blue-200' 
                    : 'bg-gray-100 text-gray-800 border border-gray-200'}`}
                >
                  {category}
                </button>
              {/each}
            </div>
            {#if formSubmitted && validateField('category', formData.category)}
              <p class="mt-1 text-sm text-red-600">{validateField('category', formData.category)}</p>
            {/if}
          </div>

          <!-- Preparation Time -->
          <div class="mb-4">
            <label for="preparationTime" class="block text-sm font-medium text-gray-700 mb-1">
              Preparation Time (minutes) *
            </label>
            <input
              id="preparationTime"
              type="number"
              min="1"
              bind:value={formData.preparationTime}
              class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              class:border-red-300={formSubmitted && validateField('preparationTime', formData.preparationTime)}
            />
            {#if formSubmitted && validateField('preparationTime', formData.preparationTime)}
              <p class="mt-1 text-sm text-red-600">{validateField('preparationTime', formData.preparationTime)}</p>
            {/if}
          </div>

          <!-- Availability -->
          <div class="mb-4">
            <label for="available" class="block text-sm font-medium text-gray-700 mb-1">
              Availability
            </label>
            <div class="flex items-center">
              <input
                id="available"
                type="checkbox"
                bind:checked={formData.availability}
                class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label for="available" class="ml-2 block text-sm text-gray-700">
                Available for order
              </label>
            </div>
          </div>

          <!-- Dietary Information -->
          <div class="mb-4">
            <label for="dietary-info" class="block text-sm font-medium text-gray-700 mb-2">
              Dietary Information
            </label>
            <div id="dietary-info" class="flex flex-wrap gap-2">
              {#each dietaryOptions as option}
                <button
                  type="button"
                  on:click={() => toggleDietaryInfo(option.value)}
                  class={`px-3 py-1 rounded-full text-sm ${formData.dietary_information.includes(option.value) 
                    ? 'bg-green-100 text-green-800 border border-green-200' 
                    : 'bg-gray-100 text-gray-800 border border-gray-200'}`}
                >
                  {option.label}
                </button>
              {/each}
            </div>
          </div>

          <!-- Image Upload -->
          <div class="mb-6">
            <label for="image-upload" class="block text-sm font-medium text-gray-700 mb-2">
              Item Image
            </label>
            <div class="flex items-center">
              {#if formData.imagePreview}
                <img
                  src={formData.imagePreview}
                  alt="Preview"
                  class="h-20 w-20 object-cover rounded-md mr-4"
                />
              {:else}
                <div class="h-20 w-20 bg-gray-200 rounded-md flex items-center justify-center text-gray-400 mr-4">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="h-8 w-8"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                </div>
              {/if}
              <div>
                <input
                  id="image-upload"
                  type="file"
                  accept="image/*"
                  on:change={handleImageUpload}
                  class="hidden"
                />
                <label
                  for="image-upload"
                  class="cursor-pointer bg-white py-2 px-3 border border-gray-300 rounded-md shadow-sm text-sm leading-4 font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  {formData.imagePreview ? 'Change Image' : 'Upload Image'}
                </label>
                <p class="mt-1 text-xs text-gray-500">
                  JPG, PNG up to 2MB
                </p>
              </div>
            </div>
          </div>


          <!-- Form Actions -->
          <div class="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3 sm:grid-flow-row-dense">
            <button
              type="submit"
              class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:col-start-2 sm:text-sm"
            >
              {item ? 'Update Item' : 'Add Item'}
            </button>
            
            {#if item}
              <button
                type="button"
                on:click={handleDelete}
                class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:col-start-1 sm:text-sm"
              >
                Delete Item
              </button>
            {:else}
              <button
                type="button"
                on:click={() => dispatch('close')}
                class="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:col-start-1 sm:text-sm"
              >
                Cancel
              </button>
            {/if}
          </div>
        </form>
      </div>
    </div>
  </div>
</div>