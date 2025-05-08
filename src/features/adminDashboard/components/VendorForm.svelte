<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { addVendor, updateVendor } from '../services/crudVendor';
  import { uploadFile, deleteFile } from '$features/shared/services/storage'; // Add deleteFile import
  import { toast } from 'svelte-sonner';
  import type { Vendor, VendorFormData } from '../types/vendorTypes';
  import { v4 as uuidv4 } from 'uuid';

  const dispatch = createEventDispatcher();
  export let eventId: string;
  export let vendor: Vendor | null = null;

  // Initialize form data
  let formData: VendorFormData = vendor ? { 
    ...vendor,
    social_media: vendor.social_media || { facebook: '', instagram: '', website: '' }
  } : {
    business_name: '',
    description: '',
    email: '',
    phone_number: '',
    social_media: {
      facebook: '',
      instagram: '',
      website: ''
    },
    rating: 4.0,
    categories: [],
    features: [],
    image_url: ''
  };

  let imageFile: File | null = null;
  let isSubmitting = false;
  let availableCategories = ['Food', 'Beverage', 'Dessert', 'Art', 'Craft', 'Clothing', 'Jewelry', 'Other'];
  let availableFeatures = ['Halal', 'Organic', 'Gluten-Free', 'Vegan', 'Vegetarian', 'Other'];

  let customCategory = '';
  let customFeature = '';
  let showCustomCategoryInput = false;
  let showCustomFeatureInput = false;
  let isProcessingImage = false;

  async function handleImageUpload(event: Event) {
  const input = event.target as HTMLInputElement;
  if (!input.files?.length) return;

  const file = input.files[0];
  
  // Validate file
  if (file.size > 5 * 1024 * 1024) { // 5MB
    toast.error('Image size must be less than 5MB');
    return;
  }

  try {
    isProcessingImage = true;
    
    // Delete old image if exists
    if (formData.image_url && !formData.image_url.startsWith('data:')) {
      try {
        await deleteFile(formData.image_url);
      } catch (error) {
        console.warn('Failed to delete old image, continuing with upload', error);
      }
    }

    // Upload new image to Firebase Storage
    const url = await uploadFile(file, `events/${eventId}/vendors/images`);
    
    // Update form data with the new URL
    formData.image_url = url;
    imageFile = file;
    
  } catch (error) {
    toast.error('Failed to upload image');
    console.error('Upload error:', error);
  } finally {
    isProcessingImage = false;
  }
}

async function handleSubmit() {
  // Process custom categories
  if (showCustomCategoryInput && customCategory) {
    formData.categories = [
      ...formData.categories.filter(c => c !== 'Other'),
      customCategory
    ];
  }

  // Process custom features
  if (showCustomFeatureInput && customFeature) {
    formData.features = [
      ...formData.features.filter(f => f !== 'Other'),
      customFeature
    ];
  }

  if (!formData.business_name) {
    toast.error('Business name is required');
    return;
  }

  // Don't submit while image is still uploading
  if (isProcessingImage) {
    toast.error('Please wait for image upload to complete');
    return;
  }

  isSubmitting = true;
    
  try {
    if (vendor && vendor.id) {
      await updateVendor(eventId, vendor.id, formData);
      toast.success('Vendor updated successfully!');
    } else {
      await addVendor(eventId, formData);
      toast.success('Vendor added successfully!');
    }
      
    dispatch('close');
  } catch (error) {
    toast.error(`Failed to ${vendor ? 'update' : 'add'} vendor: ${(error as Error).message}`);
    console.error(error);
  } finally {
    isSubmitting = false;
  }
}

  const handleClose = () => {
    dispatch('close');
  };

  // Initialize form with vendor data (if editing)
  if (vendor) {
    // Check for custom categories
    const customCat = vendor.categories.find(c => !availableCategories.includes(c));
    if (customCat) {
      customCategory = customCat;
      showCustomCategoryInput = true;
      formData.categories = [...vendor.categories.filter(c => c !== customCat), 'Other'];
    }

    // Check for custom features
    const customFeat = vendor.features.find(f => !availableFeatures.includes(f));
    if (customFeat) {
      customFeature = customFeat;
      showCustomFeatureInput = true;
      formData.features = [...vendor.features.filter(f => f !== customFeat), 'Other'];
    }
  }
</script>

<div class="bg-white rounded-lg p-6 relative">
  <button 
    on:click={handleClose}
    class="absolute top-4 right-4 text-gray-500 hover:text-gray-700 active:scale-95 transition-all"
    aria-label="Close vendor form"
  >
    <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
    </svg>
  </button>

  <h2 class="text-2xl font-bold mb-6 text-gray-800">
    {vendor ? 'Edit Vendor' : 'Add New Vendor'}
  </h2>
  
  <form on:submit|preventDefault={handleSubmit} class="space-y-6">
    <!-- Business Info Section -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <!-- Business Name -->
      <div>
        <label for="business_name" class="block text-sm font-medium text-gray-700 mb-1">
          Business Name <span class="text-red-500">*</span>
        </label>
        <input
          id="business_name"
          bind:value={formData.business_name}
          type="text"
          required
          class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
        />
      </div>
  
      <!-- Rating -->
      <div>
        <label for="rating" class="block text-sm font-medium text-gray-700 mb-1">Rating</label>
        <select
          id="rating"
          bind:value={formData.rating}
          class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="5">★★★★★ (5)</option>
          <option value="4">★★★★☆ (4)</option>
          <option value="3">★★★☆☆ (3)</option>
          <option value="2">★★☆☆☆ (2)</option>
          <option value="1">★☆☆☆☆ (1)</option>
        </select>
      </div>
    </div>
  
    <!-- Description -->
    <div>
      <label for="description" class="block text-sm font-medium text-gray-700 mb-1">Description</label>
      <textarea
        id="description"
        bind:value={formData.description}
        rows={4}
        class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
      ></textarea>
    </div>
  
<!-- Image Upload -->
<div>
  <label for="vendor_image" class="block text-sm font-medium text-gray-700 mb-1">Vendor Image</label>
  <div class="flex items-center space-x-4">
    {#if formData.image_url}
      <img 
        src={formData.image_url} 
        alt="Vendor preview" 
        class="w-16 h-16 object-cover rounded-md"
      >
    {:else}
      <div class="w-16 h-16 bg-gray-200 rounded-md flex items-center justify-center">
        <svg class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      </div>
    {/if}
    <div class="flex-1">
      <input
        id="vendor_image"
        type="file"
        accept="image/*"
        on:change={handleImageUpload}
        class="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
        disabled={isProcessingImage}
      />
      <p class="mt-1 text-xs text-gray-500">
        {#if isProcessingImage}
          Uploading image...
        {:else}
          PNG, JPG up to 5MB
        {/if}
      </p>
    </div>
  </div>
</div>
  
    <!-- Categories & Features -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div>
        <label for="categories" class="block text-sm font-medium text-gray-700 mb-2">Categories</label>
        <div id="categories" class="space-y-2">
          {#each availableCategories as category}
            <label class="flex items-center">
              <input
                type="checkbox"
                class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                bind:group={formData.categories}
                value={category}
                on:change={(e) => {
                  if (category === 'Other') {
                    const target = e.target as HTMLInputElement | null;
                    showCustomCategoryInput = target?.checked || false;
                    if (!target?.checked) {
                      // Remove any existing custom category
                      formData.categories = formData.categories.filter(c => c !== customCategory);
                      customCategory = '';
                    }
                  }
                }}
              />
              <span class="ml-2 text-sm text-gray-700">{category}</span>
            </label>
          {/each}
      
          {#if showCustomCategoryInput}
            <div class="ml-6 mt-2">
              <input
                type="text"
                bind:value={customCategory}
                placeholder="Specify category"
                class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
                on:blur={() => {
                  if (customCategory) {
                    // Remove "Other" and add the custom category
                    formData.categories = [
                      ...formData.categories.filter(c => c !== 'Other'),
                      customCategory
                    ];
                  }
                }}
              />
            </div>
          {/if}
        </div>
      </div>
  
      <div>
        <label for="features" class="block text-sm font-medium text-gray-700 mb-2">Features</label>
        <div id="features" class="space-y-2">
          {#each availableFeatures as feature}
            <label class="flex items-center">
              <input
                type="checkbox"
                class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                bind:group={formData.features}
                value={feature}
                on:change={(e) => {
                  if (feature === 'Other') {
                    const target = e.target as HTMLInputElement | null;
                    showCustomFeatureInput = target?.checked || false;
                    if (!target?.checked) {
                      // Remove any existing custom feature
                      formData.features = formData.features.filter(f => f !== customFeature);
                      customFeature = '';
                    }
                  }
                }}
              />
              <span class="ml-2 text-sm text-gray-700">{feature}</span>
            </label>
          {/each}
      
          {#if showCustomFeatureInput}
            <div class="ml-6 mt-2">
              <input
                type="text"
                bind:value={customFeature}
                placeholder="Specify feature"
                class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
                on:blur={() => {
                  if (customFeature) {
                    // Remove "Other" and add the custom feature
                    formData.features = [
                      ...formData.features.filter(f => f !== 'Other'),
                      customFeature
                    ];
                  }
                }}
              />
            </div>
          {/if}
        </div>
      </div>
  
    <!-- Contact Info -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div>
        <label for="email" class="block text-sm font-medium text-gray-700 mb-1">Email</label>
        <input
          id="email"
          bind:value={formData.email}
          type="email"
          class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
        />
      </div>
  
      <div>
        <label for="phone_number" class="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
        <input
          id="phone_number"
          bind:value={formData.phone_number}
          type="tel"
          class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
        />
      </div>
    </div>
  
    <!-- Social Media -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div>
        <label for="facebook" class="block text-sm font-medium text-gray-700 mb-1">Facebook</label>
        <div class="mt-1 flex rounded-md shadow-sm">

          <input
            id="facebook"
            bind:value={formData.social_media.facebook}
            type="text"
            class="flex-1 min-w-0 block w-full px-3 py-2 rounded-none rounded-r-md border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>
  
      <div>
        <label for="instagram" class="block text-sm font-medium text-gray-700 mb-1">Instagram</label>
        <div class="mt-1 flex rounded-md shadow-sm">
          <input
            id="instagram"
            bind:value={formData.social_media.instagram}
            type="text"
            class="flex-1 min-w-0 block w-full px-3 py-2 rounded-none rounded-r-md border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>
  
      <div>
        <label for="website" class="block text-sm font-medium text-gray-700 mb-1">Website</label>
        <div class="mt-1 flex rounded-md shadow-sm">
          <input
            id="website"
            bind:value={formData.social_media.website}
            type="url"
            class="flex-1 min-w-0 block w-full px-3 py-2 rounded-none rounded-r-md border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>
    </div>
  
    <!-- Submit Button -->
    <div class="pt-4 flex gap-2">
      <button
        type="button"
        on:click={handleSubmit}
        disabled={isSubmitting}
        class="flex-1 justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed active:scale-98 transition-all"
      >
      {#if isSubmitting}
        <span class="flex items-center">
          <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          {vendor ? 'Updating...' : 'Saving...'}
        </span>
      {:else}
        {vendor ? 'Update Vendor' : 'Save Vendor'}
      {/if}
    </button>
      
      <button
      type="button"
      on:click={handleClose}
      class="flex-1 justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 active:scale-98 transition-all"
    >
      Close
      </button>
    </div>
  </form>
</div>

<style>
  button, [type="button"] {
    -webkit-tap-highlight-color: transparent;
    transition: transform 0.1s, background-color 0.2s;
  }
  button:active {
    transform: scale(0.98);
  }
</style>